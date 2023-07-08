package src

import (
	"errors"
	"fmt"

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
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
	})
	app.UseRouter(crs)

	app.Get("/api/ws", websocket.Handler(WebsocketServer))

	api := app.Party("/api")
	{
		api.Get("/ping", pingHandler)
		api.Post("/user-session", createUserSessionHandler)
		api.Get("/game/:id", getGameHandler)
		// app.Get("/login", loginHandler)
		app.Get("/logout", logoutHandler)
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

	session := sess.Start(ctx)

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
