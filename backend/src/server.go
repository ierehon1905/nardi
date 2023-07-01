package main

import (
	"errors"
	"fmt"
	"log"

	"github.com/iris-contrib/middleware/cors"
	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/sessions"
	"github.com/kataras/iris/v12/websocket"
	"github.com/kataras/neffos"
	"gorm.io/gorm"
)

var (
	cookieNameForSessionID = "mycookiesessionnameid"
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

	ws := neffos.New(websocket.DefaultGobwasUpgrader, neffos.Namespaces{
		"": neffos.Events{
			websocket.OnAnyEvent: func(nsConn *websocket.NSConn, msg neffos.Message) error {
				log.Printf("[%s] sent a message: %s", nsConn, string(msg.Body))
				return nil
			},
		},
		"default": neffos.Events{
			websocket.OnNamespaceConnected: func(nsConn *websocket.NSConn, msg websocket.Message) error {
				// with `websocket.GetContext` you can retrieve the Iris' `Context`.
				ctx := websocket.GetContext(nsConn.Conn)

				log.Printf("[%s] connected to namespace [%s] with IP [%s]",
					nsConn, msg.Namespace,
					ctx.RemoteAddr())
				return nil
			},
			websocket.OnNamespaceDisconnect: func(nsConn *websocket.NSConn, msg websocket.Message) error {
				log.Printf("[%s] disconnected from namespace [%s]", nsConn, msg.Namespace)
				return nil
			},
			// "poll-game": pollGamesWsHandler,
		},
	})

	app.Get("/api/ws", websocket.Handler(ws))

	api := app.Party("/api")
	{
		// api.Use(iris.Compression)
		api.Get("/ping", pingHandler)
		api.Post("/user-session", createUserSessionHandler)
		api.Get("/game/:id", getGameHandler)
		// app.Get("/login", loginHandler)
		app.Get("/logout", logoutHandler)
	}

	app.Listen(":8080")
}

func pollGamesWsHandler(ns *neffos.NSConn, msg neffos.Message) error {
	// ctx := websocket.GetContext(ns.Conn)

	fmt.Println("pollGamesWsHandler")

	// send the message to the client

	// ns.Conn.Server().Broadcast(ns, msg)

	// send ack to the client

	ns.Emit("ack", neffos.Marshal(neffos.Message{
		Body: []byte("message received"),
	}))

	// [...]
	return nil
}

// func loginHandler(ctx iris.Context) {
// 	session := sess.Start(ctx)

// 	// Authentication goes here
// 	// ...

// 	// Set user as authenticated
// 	session.Set("authenticated", true)

// }

func logoutHandler(ctx iris.Context) {
	session := sess.Start(ctx)

	// Revoke users authentication
	session.Set("authenticated", false)
	// Or to remove the variable:
	session.Delete("authenticated")
	// Or destroy the whole session:
	session.Destroy()
}

func secretHandler(ctx iris.Context) {
	// Check if user is authenticated
	if auth, _ := sess.Start(ctx).GetBoolean("authenticated"); !auth {
		ctx.StatusCode(iris.StatusForbidden)
		return
	}

	// Print secret message
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
