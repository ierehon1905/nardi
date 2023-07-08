package src

import (
	"fmt"
	"math/rand"
)

type GameField struct {
	// array of 24 cells
	cells   [24]Cell
	variant GameVariant
}

type Color int

const (
	None Color = iota
	Black
	White
)

type GameVariant string

const (
	Long GameVariant = "long"
)

type Cell struct {
	color    Color
	checkers int
}

func initField() GameField {
	cells := [24]Cell{}

	cells[11].checkers = 15
	// cells[10].checkers = 1
	cells[11].color = White
	// cells[10].color = White

	cells[23].checkers = 15
	cells[23].color = Black

	return GameField{cells, Long}
}

func (field *GameField) printField() {
	fmt.Println("Field:")
	for i := 0; i < 15; i++ {
		for j := 0; j < 12; j++ {
			topRow := field.cells[j]
			bottomRow := field.cells[23-j]
			if i < topRow.checkers {
				if topRow.color == White {
					fmt.Printf("⬜️")
				} else if topRow.color == Black {
					fmt.Printf("⬛️")
				} else {
					fmt.Printf("🟥")
				}
			} else if 14-i < bottomRow.checkers {
				if bottomRow.color == White {
					fmt.Printf("⬜️")
				} else if bottomRow.color == Black {
					fmt.Printf("⬛️")
				} else {
					fmt.Printf("🟥")
				}
			} else {
				fmt.Printf("🟫")
			}
		}
		fmt.Println()
	}
}

func tossDice() int {
	return rand.Intn(6) + 1
}

func tossTwoDice() (int, int) {
	return tossDice(), tossDice()
}

// move checher

func (field *GameField) moveChecker(from int, to int) {
	if from < 0 || from > 23 || to < 0 || to > 23 {
		fmt.Println("invalid move")
		return
	}

	fromCell := field.cells[from]
	toCell := field.cells[to]

	if fromCell.checkers == 0 {
		fmt.Println("invalid move. no checkers on source cell")
		return
	}

	if toCell.checkers > 0 && toCell.color != fromCell.color {
		fmt.Println("invalid move. destination cell is occupied by opponent")
		return
	}

	fmt.Println("Decrementing source cell from ", fromCell.checkers, " to ", fromCell.checkers-1)
	field.cells[from].checkers--
	fmt.Println("Incrementing destination cell from ", toCell.checkers, " to ", toCell.checkers+1)
	field.cells[to].checkers++

	if field.cells[to].color != fromCell.color {
		field.cells[to].color = fromCell.color
	}
}

func (field *GameField) moveCheckerByDice(from int, dice int) {
	if from < 0 || from > 23 {
		fmt.Println("invalid move")
		return
	}

	fromCell := field.cells[from]

	to := 0
	if fromCell.color == White {
		to = from - dice

		if to < 0 {
			to = 24 + to
		}
	} else {
		to = from - dice
	}

	fmt.Println("from:", from, "to:", to)

	field.moveChecker(from, to)
}
