import { CellColor, GameStyle, type GameField, MoveResult } from './types';
import { TurnError } from './types';

function tossTwoDice() {
	const dice1 = Math.floor(Math.random() * 6) + 1;
	const dice2 = Math.floor(Math.random() * 6) + 1;

	return [dice1, dice2] as [number, number];
}

export function tossDiceInTurn(gameField: GameField): [TurnError, null] | [null, [number, number]] {
	if (gameField.tossed && gameField.tossed.length !== 0) {
		return [TurnError.DoubleTossIsNotAllowed, null];
	}
	const [dice1, dice2] = tossTwoDice();

	if (dice1 === dice2) {
		gameField.tossed = [dice1, dice1, dice1, dice1];
	} else {
		gameField.tossed = [dice1, dice2];
	}

	return [null, [dice1, dice2]];
}

export function initGameField() {
	const gameField: GameField = {
		cells: Array(24)
			.fill(0)
			.map(() => ({
				color: CellColor.Unoccupied,
				count: 0
			})),
		gameStyle: GameStyle.Long,
		turn: CellColor.White
	};

	gameField.cells[11].color = CellColor.White;
	gameField.cells[11].count = 15;

	gameField.cells[23].color = CellColor.Black;
	gameField.cells[23].count = 15;
	return gameField;
}

export function moveChecker(
	gameField: GameField,
	fromCellIndex: number,
	toCellIndex: number,
	colorToMove: CellColor
) {
	if (fromCellIndex > 23 || fromCellIndex < 0) {
		console.warn('Source cell index is out of bounds');
		return TurnError.SourceCellIsOutOfBoard;
	}

	if (toCellIndex > 23 || toCellIndex < 0) {
		console.warn('Target cell index is out of bounds');
		return TurnError.TargetCellIsOutOfBoard;
	}

	const fromCell = gameField.cells[fromCellIndex];

	if (fromCell.color !== colorToMove) {
		console.warn('Source cell is occupied by opponent or empty');
		console.log('colorToMove', colorToMove);
		console.log('fromCellIndex', fromCellIndex);
		console.log('fromCell', fromCell);

		if (fromCell.color === CellColor.Unoccupied) {
			return TurnError.SourceCellIsEmpty;
		} else {
			return TurnError.SourceCellIsOccupiedByOpponent;
		}
	}

	if (fromCell.count === 0) {
		console.warn('No checkers to move');
		return TurnError.SourceCellIsEmpty;
	}

	const toCell = gameField.cells[toCellIndex];

	if (toCell.color !== CellColor.Unoccupied && toCell.color !== colorToMove) {
		console.warn('Target cell is occupied by opponent');
		return TurnError.TargetCellIsOccupiedByOpponent;
	}

	fromCell.count--;
	toCell.count++;

	toCell.color = fromCell.color;

	if (fromCell.count === 0) {
		fromCell.color = CellColor.Unoccupied;
	}

	return;
}

export function moveCheckerBy(
	gameField: GameField,
	fromCellIndex: number,
	step: number,
	colorToMove: CellColor
) {
	let toCellIndex;

	toCellIndex = fromCellIndex - step;

	if (toCellIndex < 0) {
		toCellIndex = 24 + toCellIndex;
	}

	return moveChecker(gameField, fromCellIndex, toCellIndex, colorToMove);
}

export function playerMoveCheckerBy(
	gameField: GameField,
	fromCellIndex: number,
	step: number,
	colorToMove: CellColor
) {
	let toCellIndex = fromCellIndex - step;
	if (toCellIndex < 0) {
		toCellIndex = 24 + toCellIndex;
	}

	return playerMoveChecker(gameField, fromCellIndex, toCellIndex, colorToMove);
}

export function playerMoveChecker(
	gameField: GameField,
	fromCellIndex: number,
	toCellIndex: number,
	colorToMove: CellColor
): [TurnError, null] | [null, MoveResult] {
	const turn = gameField.turn;

	if (colorToMove !== turn) {
		console.warn('Wrong turn');
		return [TurnError.WrongTurn, null];
	}

	let step = fromCellIndex - toCellIndex;
	if (step < 0) {
		step = 24 + step;
	}

	if (!gameField.tossed?.includes(step)) {
		console.warn(`Step is not in tossed. Step: ${step}, tossed: ${gameField.tossed?.join(', ')}`);
		return [TurnError.InvalidPlayerMove, null];
	}

	const error = moveChecker(gameField, fromCellIndex, toCellIndex, colorToMove);

	if (error) {
		return [error, null];
	}

	const index = gameField.tossed.indexOf(step);
	gameField.tossed.splice(index, 1);

	if (gameField.tossed.length === 0) {
		gameField.turn = gameField.turn === CellColor.White ? CellColor.Black : CellColor.White;
		return [null, MoveResult.TurnIsOver];
	}

	return [null, MoveResult.HasNextMove];
}
