import {
	initGameField,
	moveCheckerBy,
	playerMoveChecker,
	playerMoveCheckerBy,
	tossDiceInTurn
} from './engine';
import { runKonva } from './konva';
import {
	MoveResult,
	type CellColor,
	type GameField,
	type TurnError,
	type UiCallbacks
} from './types';
import {} from '../../routes/+page.svelte';

export type Game = {
	moveBy: (sourceCellIndex: number, step: number, colorToMove: CellColor) => Promise<void>;
	playerMoveBy: (sourceCellIndex: number, step: number, colorToMove: CellColor) => Promise<void>;
	playerMove: (
		sourceCellIndex: number,
		targetCellIndex: number,
		colorToMove: CellColor
	) => Promise<TurnError | void>;
	toss: () => [TurnError, null] | [null, [number, number]];
	_gameField: GameField;
};

export type RenderCallbacks = {
	finishMove: (
		color: CellColor,
		fromCellIndex: number,
		toCellIndex: number,
		checkerIndex?: number
	) => Promise<TurnError | void>;
};

export function runGame(container: HTMLDivElement, uiCallbacks: UiCallbacks): Game {
	const gameField = initGameField();

	const finishMove: RenderCallbacks['finishMove'] = (
		color: CellColor,
		fromCellIndex: number,
		toCellIndex: number,
		checkerIndex?: number
	) => {
		return playerMove(fromCellIndex, toCellIndex, color, checkerIndex);
	};

	const renderCallbacks: RenderCallbacks = {
		finishMove
	};

	const renderHandles = runKonva(container, gameField, renderCallbacks);

	const moveBy: Game['moveBy'] = async (
		sourceCellIndex: number,
		step: number,
		colorToMove: CellColor
	) => {
		const error = moveCheckerBy(gameField, sourceCellIndex, step, colorToMove);

		if (error) {
			console.error(error);

			Promise.reject(error);
			return;
		}

		return renderHandles.moveBy(sourceCellIndex, step);
	};

	const playerMoveBy: Game['playerMoveBy'] = async (
		sourceCellIndex: number,
		step: number,
		colorToMove: CellColor
	) => {
		const error = playerMoveCheckerBy(gameField, sourceCellIndex, step, colorToMove);

		if (error) {
			console.error(error);

			Promise.reject(error);
			return;
		}

		return renderHandles.moveBy(sourceCellIndex, step);
	};

	const playerMove = async (
		sourceCellIndex: number,
		targetCellIndex: number,
		colorToMove: CellColor,
		checkerIndex?: number
	) => {
		const [error, data] = playerMoveChecker(
			gameField,
			sourceCellIndex,
			targetCellIndex,
			colorToMove
		);

		if (error) {
			console.error(error);

			return error;
		}

		if (data === MoveResult.TurnIsOver) {
			uiCallbacks.startTurn(gameField.turn);
			renderHandles.startTurn(gameField.turn);
		}

		return renderHandles.move(sourceCellIndex, targetCellIndex, checkerIndex);
	};

	const toss: Game['toss'] = () => {
		const [error, data] = tossDiceInTurn(gameField);

		if (error) {
			return [error, data];
		}

		renderHandles.startTurn(gameField.turn);

		return [error, data];
	};

	return {
		moveBy,
		playerMoveBy,
		playerMove,
		toss,
		_gameField: gameField
	};
}
