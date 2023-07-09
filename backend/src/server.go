package src

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/iris-contrib/middleware/cors"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
	"github.com/kataras/iris/v12/websocket"
	"github.com/kataras/neffos"
	"gorm.io/gorm"
)

var (
	cookieNameForSessionID = "npid"
	sess                   = sessions.New(sessions.Config{Cookie: cookieNameForSessionID})
)

func RunServer() {
	RunDb()

	app := iris.New()
	crs := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:5173",
			"https://nardy.am",
			"https://www.nardy.am",
			"https://nardy.am:5173",
			"http://nardy-web.local:5173",
			"http://nardy.local:5173",
			"http://api.nardy.local:5173",
			"https://api.nardy.am",
		},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
		AllowedHeaders:   []string{"Content-Type", "*"},
	})
	app.UseRouter(crs)

	app.Use(sess.Handler(
		iris.CookieSecure,
		iris.CookieHTTPOnly(false),
		iris.CookieSameSite(http.SameSiteLaxMode),
	))

	app.Get("/api/ws", websocket.Handler(WebsocketServer))

	api := app.Party("/api")
	{
		api.Get("/ping", pingHandler)
		api.Post("/user-session", createUserSessionHandler)
		api.Get("/logout", logoutHandler)
	}

	game := api.Party("/game")
	{
		game.Get("/", getGamesHandler)
		game.Get("/:id", getGameHandler)
	}

	app.Listen(":8080")
}

func pollGamesWsHandler(ns *neffos.NSConn, msg neffos.Message) error {

	fmt.Println("pollGamesWsHandler")

	ns.Emit("ack", neffos.Marshal(neffos.Message{
		Body: []byte("message received"),
	}))

	// [...]
	return nil
}

func logoutHandler(ctx iris.Context) {
	session := sess.Start(ctx)

	session.Destroy()
}

func secretHandler(ctx iris.Context) {

	if auth, _ := sess.Start(ctx).GetBoolean("authenticated"); !auth {
		ctx.StatusCode(iris.StatusForbidden)
		return
	}

	ctx.WriteString("The cake is a lie!")
}

func pingHandler(ctx iris.Context) {
	ctx.JSON(iris.Map{"message": "pong"})
}

func getGameHandler(ctx iris.Context) {
	id := ctx.Params().Get("id")

	var game GameSession
	result := DB.First(&game, id)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		ctx.StatusCode(404)
		ctx.JSON(iris.Map{"message": "game not found"})
		return
	}

	if result.Error != nil {
		ctx.StatusCode(500)
		ctx.JSON(iris.Map{"message": "internal server error"})
		return
	}

	ctx.JSON(game)
}

func getGamesHandler(ctx iris.Context) {
	page, pageSize, err := getPaginationParams(ctx)

	if err != nil {
		return
	}

	var games []GameSession
	var totalOfAllGames int64
	// limit 100
	result := DB.Model(&GameSession{}).Count(
		&totalOfAllGames,
	).Offset(
		(page - 1) * pageSize,
	).Limit(pageSize).Find(&games)

	if result.Error != nil {
		ctx.StatusCode(500)
		ctx.JSON(iris.Map{"message": "internal server error"})
		return
	}

	ctx.JSON(iris.Map{
		"items":    games,
		"total":    totalOfAllGames,
		"page":     page,
		"pages":    totalOfAllGames/int64(pageSize) + 1,
		"pageSize": pageSize,
	})
}

func getPaginationParams(ctx iris.Context) (int, int, error) {
	page := ctx.URLParamIntDefault("page", 1)
	pageSize := ctx.URLParamIntDefault("pageSize", 100)
	var err error = nil

	if page < 1 {
		ctx.StatusCode(400)
		ctx.JSON(iris.Map{"message": "page must be greater than 0"})
		err = errors.New("page must be greater than 0")
	}

	if pageSize < 1 {
		ctx.StatusCode(400)
		ctx.JSON(iris.Map{"message": "pageSize must be greater than 0"})
		err = errors.New("pageSize must be greater than 0")
	}

	if pageSize > 1000 {
		ctx.StatusCode(400)
		ctx.JSON(iris.Map{"message": "pageSize must be less than 1000"})
		err = errors.New("pageSize must be less than 1000")
	}

	return page, pageSize, err
}

type CreateUserSessionRequest struct {
	Name string `json:"name"`
}

func createUserSessionHandler(ctx iris.Context) {

	var name string

	if ctx.GetContentLength() == 0 {
		name = "anonymous"
	} else {

		var createUserSessionRequest CreateUserSessionRequest

		if err := ctx.ReadJSON(&createUserSessionRequest); err != nil {
			ctx.StopWithError(iris.StatusBadRequest, err)
			return
		}

		name = createUserSessionRequest.Name
	}

	session := sessions.Get(ctx)

	if auth, _ := session.GetBoolean("authenticated"); auth {
		existingSession := UserSession{}

		result := DB.Where("cookie = ?", session.ID()).First(&existingSession)

		if result.Error == nil {
			ctx.StatusCode(200)
			ctx.JSON(existingSession)
			return
		}
	}

	session.Set("authenticated", true)

	userSession := UserSession{
		UserName: name,
		Cookie:   session.ID(),
	}

	result := DB.Create(&userSession)

	if result.Error != nil {
		ctx.StatusCode(500)
		ctx.JSON(iris.Map{"message": "internal server error"})
		session.Destroy()
		return
	}

	ctx.StatusCode(201)
	ctx.JSON(userSession)
}
