package src

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type GameSession struct {
	gorm.Model
	Field         GameField `gorm:"serializer:json"`
	BlackPlayerId uint
	WhitePlayerId uint
}

type UserSession struct {
	gorm.Model
	UserName string
	Cookie   string `json:"-"`
}

var DB *gorm.DB

func RunDb() {
	dsn := os.Getenv("DATABASE_URL")

	if dsn == "" {
		dsn = "host=localhost user=postgres password=postgres dbname=nardy port=5432 sslmode=disable TimeZone=Europe/Moscow"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		os.Stderr.WriteString(fmt.Sprintf("failed to connect database: %s\n", err.Error()))
		panic("failed to connect database")
	}

	db.AutoMigrate(&GameSession{})
	db.AutoMigrate(&UserSession{})

	DB = db

	fmt.Println("DB connected")
}
