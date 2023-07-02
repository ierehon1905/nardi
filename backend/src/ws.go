package main

import (
	"fmt"
	"log"

	"github.com/kataras/iris/v12/websocket"
	"github.com/kataras/neffos"
)

var activeUsersCount = 0

type greetMessage struct {
	success          bool `json:"success"`
	activeUsersCount int  `json:"activeUsersCount"`
}

var WebsocketServer = neffos.New(websocket.DefaultGobwasUpgrader, neffos.Namespaces{
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

			log.Printf(
				"[%s] connected to namespace [%s] with IP [%s]",
				nsConn,
				msg.Namespace,
				ctx.RemoteAddr(),
			)

			activeUsersCount++

			nsConn.Conn.Server().Broadcast(nsConn, websocket.Message{
				Namespace: msg.Namespace,
				Event:     "active-users",
				Body:      []byte(fmt.Sprintf("%d", activeUsersCount)),
			})

			return nil
		},
		websocket.OnNamespaceDisconnect: func(nsConn *websocket.NSConn, msg websocket.Message) error {
			log.Printf("[%s] disconnected from namespace [%s]", nsConn, msg.Namespace)

			activeUsersCount--

			nsConn.Conn.Server().Broadcast(nsConn, websocket.Message{
				Namespace: msg.Namespace,
				Event:     "active-users",
				Body:      []byte(fmt.Sprintf("%d", activeUsersCount)),
			})

			return nil
		},
		"active-users": func(nsConn *websocket.NSConn, msg websocket.Message) error {

			return neffos.Reply([]byte(fmt.Sprintf("%d", activeUsersCount)))
		},
		"game-move": func(nsConn *websocket.NSConn, msg websocket.Message) error {

			return nil
		},
	},
})
