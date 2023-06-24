package main

import (
	"gorm.io/driver/sqlite"
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
	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})

	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&GameSession{})
	db.AutoMigrate(&UserSession{})

	DB = db
}
