package src

import (
	"fmt"
	"log"
	"time"

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
		websocket.OnRoomJoined: func(nsConn *websocket.NSConn, msg websocket.Message) error {
			log.Printf("[%s] joined to room [%s]", nsConn, msg.Room)

			return nil
		},
		websocket.OnRoomLeft: func(nsConn *websocket.NSConn, msg websocket.Message) error {
			log.Printf("[%s] left from room [%s]", nsConn, msg.Room)

			return nil
		},
		"active-users": func(nsConn *websocket.NSConn, msg websocket.Message) error {

			return neffos.Reply([]byte(fmt.Sprintf("%d", activeUsersCount)))
		},
		"game-move": func(nsConn *websocket.NSConn, msg websocket.Message) error {

			return nil
		},
		"poll-game": func(nsConn *websocket.NSConn, msg websocket.Message) error {

			// sleep for 5 seconds
			time.Sleep(5 * time.Second)

			// generate random RoomID
			RoomID := "RoomID" + fmt.Sprintf("%d", time.Now().UnixNano())

			type pollGameResponse struct {
				RoomID string `json:"RoomID"`
			}

			return neffos.Reply(neffos.Marshal(pollGameResponse{
				RoomID: RoomID,
			}))
		},
	},
})
