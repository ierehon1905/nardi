import type { Layer } from 'konva/lib/Layer';
import type { Stage } from 'konva/lib/Stage';
import {
	//
	CellColor,
	TurnError,
	type CheckersMap,
	type GameField
} from './types';
import type { RenderCallbacks } from './game';

const colors = {
	brown: '#8B4513',
	bone: '#E3DCC9',
	darkBone: '#D3C6B6',
	coal: '#2B2B2B',
	darkCoal: '#1B1B1B'
};

const DEBUG = true;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function checkColor(e: Konva.KonvaEventObject<DragEvent>) {
	if (!e.target || !e.target.hasName('checker')) {
		console.warn('invalid target', e.target);
		return;
	}

	let color: CellColor;

	if (e.target.hasName('white')) {
		color = CellColor.White;
	} else if (e.target.hasName('black')) {
		color = CellColor.Black;
	} else {
		console.warn('dragend: invalid target: unknown color', e.target);
		return;
	}

	return color;
}

export const runKonva = (
	boardContainer: HTMLDivElement,
	gameField: GameField,
	renderCallbacks: RenderCallbacks
) => {
	const { stage, layer, dynamicLayer } = initKonva(boardContainer);

	let fromCellIndex: number | null;
	let movingChecker: Konva.Group | null;
	let highlightedCells: Konva.Rect[] = [];

	stage.on('dragstart', (e) => {
		const color = checkColor(e);

		if (!color) {
			return;
		}

		// const closestCellIndex = getCheckerCellIndex(e, stage);

		// console.log('closestCellIndex', closestCellIndex);

		fromCellIndex = e.target?.attrs?.cellIndex;
		if (fromCellIndex === undefined || fromCellIndex === null) {
			console.warn('dragstart: fromCellIndex is undefined');
			return;
		}

		movingChecker = e.target as unknown as Konva.Group;

		// highlight cells that are available for movement
		const availableCellIndexes = gameField.tossed?.map((step) => {
			let toCellIndex = fromCellIndex! - step;
			if (toCellIndex < 0) {
				toCellIndex = 24 + toCellIndex;
			}
			return toCellIndex;
		});

		if (!availableCellIndexes) {
			return;
		}

		const rects = availableCellIndexes.uniq().map((cellIndex) => {
			// const rect = new Konva.Rect({});
			const bbWidth = stage.width() / 12;
			const bbHeight = stage.height() / 2;

			const x = cellIndex < 12 ? cellIndex * bbWidth : (23 - cellIndex) * bbWidth;
			const y = cellIndex < 12 ? 0 : bbHeight;

			const topRect = new Konva.Rect({
				x,
				y,
				width: bbWidth,
				height: bbHeight,
				fill: 'rgba(255, 255, 255, 0.5)'
			});

			dynamicLayer.add(topRect);

			return topRect;
		});

		highlightedCells = rects;
	});

	stage.on('dragend', async (e) => {
		const color = checkColor(e);

		highlightedCells?.forEach((rect) => rect.destroy());
		highlightedCells = [];

		if (!color) {
			return;
		}

		if (fromCellIndex === null) {
			console.warn('dragend: fromCellIndex is null');
			return;
		}

		const toCellIndex = getCheckerCellIndex(e, stage);

		const checkerIndex = e.target?.attrs?.checkerIndex as number | undefined;

		const error = await renderCallbacks.finishMove(color, fromCellIndex, toCellIndex, checkerIndex);
		if (error) {
			console.log('revert', {
				fromCellIndex,
				checkerIndex
			});
			await move(fromCellIndex, fromCellIndex, checkerIndex, checkerIndex);
		} else {
			fromCellIndex = null;
		}
	});

	drawBoard({ stage, layer });

	const checkers = initCheckers({ stage, gameField, layer });

	const { moveBy, move } = buildHandles({ stage, dynamicLayer, layer, gameField, checkers });

	const startTurn = async (color: CellColor) => {
		const otherColor = color === CellColor.White ? CellColor.Black : CellColor.White;
		disallowColorMovement(gameField, otherColor, checkers);
		return allowColorMovement(gameField, color, checkers);
	};

	return {
		move,
		moveBy,
		startTurn
	};
};

function getCheckerCellIndex(e: Konva.KonvaEventObject<DragEvent>, stage: Stage) {
	const x = e.target.x();
	const y = e.target.y();

	const bbWidth = stage.width() / 12;
	const bbHeight = stage.height() / 2;

	let closestCellIndex = Math.floor(x / bbWidth);

	if (y > bbHeight) {
		closestCellIndex = 23 - closestCellIndex;
	}

	return closestCellIndex;
}

function allowColorMovement(gameField: GameField, color: CellColor, checkers: CheckersMap) {
	const op = (checker: Konva.Group) => {
		checker.draggable(true);
	};

	return mapCheckers(gameField, color, checkers, op);
}

function disallowColorMovement(gameField: GameField, color: CellColor, checkers: CheckersMap) {
	const op = (checker: Konva.Group) => {
		checker.draggable(false);
	};

	return mapCheckers(gameField, color, checkers, op);
}

function mapCheckers(
	gameField: GameField,
	color: CellColor,
	checkers: CheckersMap,
	op: (checker: Konva.Group) => void
) {
	for (let cellIndex = 0; cellIndex < gameField.cells.length; cellIndex++) {
		const cell = gameField.cells[cellIndex];

		if (cell.color === color) {
			const colorCheckers = checkers[cellIndex];

			if (!colorCheckers) {
				console.warn(`mapCheckers: no checkers for cell ${cellIndex}. But cell color is ${color}`);
				continue;
			}

			for (const checker of colorCheckers) {
				op(checker);
			}
		}
	}
}

function buildHandles({
	stage,
	dynamicLayer,
	layer,
	gameField,
	checkers
}: {
	stage: Stage;
	dynamicLayer: Layer;
	layer: Layer;
	gameField: GameField;
	checkers: CheckersMap;
}) {
	const autoMoveCheckerBinded = (
		fromCellIndex: number,
		toCellIndex: number,
		fromCheckerIndex?: number,
		toCheckerIndex?: number
	) =>
		autoMoveChecker({
			stage,
			dynamicLayer,
			layer,
			checkers,
			fromCellIndex,
			toCellIndex,
			fromCheckerIndex,
			toCheckerIndex
		});
	const move = autoMoveCheckerBinded;

	const moveBy = (
		fromCellIndex: number,
		by: number,
		fromCheckerIndex?: number,
		toCheckerIndex?: number
	) => {
		let toCellIndex;

		toCellIndex = fromCellIndex - by;

		if (toCellIndex < 0) {
			toCellIndex = 24 + toCellIndex;
		}

		return move(fromCellIndex, toCellIndex, fromCheckerIndex, toCheckerIndex);
	};

	// const redrawChecker = () => {
	// 	// drawBoard({ stage, layer });
	// 	// drawCheckers({ stage, layer, gameField, checkers });
	// };

	return { moveBy, move };
}

function autoMoveChecker({
	stage,
	dynamicLayer,
	layer,
	checkers,
	fromCellIndex,
	toCellIndex,
	fromCheckerIndex,
	toCheckerIndex
}: {
	stage: Stage;
	dynamicLayer: Layer;
	layer: Layer;
	checkers: CheckersMap;
	fromCellIndex: number;
	toCellIndex: number;
	fromCheckerIndex?: number;
	toCheckerIndex?: number;
}) {
	let checker: Konva.Group | undefined;
	if (fromCheckerIndex !== undefined) {
		checker = checkers[fromCellIndex]?.splice(fromCheckerIndex, 1)[0];

		if (!checker) {
			console.error('No checkers to move');
			return Promise.reject(TurnError.NoCheckerAtSpecifiedIndex);
		}
	} else {
		checker = checkers[fromCellIndex]?.pop();
	}

	if (!checker) {
		console.error('No checkers to move');
		return Promise.reject(TurnError.UnknownError);
	}

	if (!checkers[toCellIndex]) {
		checkers[toCellIndex] = [];
	}

	// checkers[toCellIndex].push(checker);

	if (toCheckerIndex) {
		checkers[toCellIndex].splice(toCheckerIndex, 0, checker);
	} else {
		checkers[toCellIndex].push(checker);
	}

	const toCellCount = checkers[toCellIndex].length;

	const checkerSize = stage.width() / 20;
	const cellSize = stage.width() / 12;

	const newPos = getCheckerAbsolutePos(toCellIndex, cellSize, checkerSize, toCellCount - 1, stage);

	const distance = Math.sqrt(
		Math.pow(newPos.x - checker.x(), 2) + Math.pow(newPos.y - checker.y(), 2)
	);
	const duration = Math.max(distance / 1000, 0.2);

	if (fromCheckerIndex !== undefined) {
		const checkersToMove = checkers[fromCellIndex];

		for (let i = 0; i < checkersToMove.length; i++) {
			const checkerToMove = checkersToMove[i];

			const newPos = getCheckerAbsolutePos(fromCellIndex, cellSize, checkerSize, i, stage);

			checkerToMove.moveTo(dynamicLayer);

			const index = i;

			checkerToMove.to({
				x: newPos.x,
				y: newPos.y,
				duration: 0.2,
				onFinish: () => {
					checkerToMove.attrs.checkerIndex = index;

					checkerToMove.attrs.text.text(`${fromCellIndex} ${index}`);
					checkerToMove.moveTo(layer);
				}
			});
		}
	}

	// Already on the same cell and handled by checkersToMove
	if (fromCheckerIndex !== undefined && fromCheckerIndex === toCheckerIndex) {
		return Promise.resolve();
	}

	const checkerRef = checker;

	const finishPromise = new Promise<void>((resolve) => {
		checkerRef.moveTo(dynamicLayer);
		checkerRef.to({
			x: newPos.x,
			y: newPos.y,
			duration: duration,
			onFinish: () => {
				checkerRef.attrs.cellIndex = toCellIndex;

				checkerRef.attrs.checkerIndex = toCheckerIndex ?? toCellCount - 1;
				checkerRef.attrs.text.text(`${toCellIndex} ${checkerRef.attrs.checkerIndex}`);
				checkerRef.moveTo(layer);
				resolve();
			}
		});
	});

	return finishPromise;
}

function initCheckers({
	stage,
	gameField,
	layer
}: {
	stage: Stage;
	gameField: GameField;
	layer: Layer;
}) {
	const checkerSize = stage.width() / 20;
	const cellSize = stage.width() / 12;

	const checkers: CheckersMap = {};

	for (let cellIndex = 0; cellIndex < gameField.cells.length; cellIndex++) {
		const cell = gameField.cells[cellIndex];

		if (cell.count === 0) {
			continue;
		}

		for (let checkerIndex = 0; checkerIndex < cell.count; checkerIndex++) {
			const { x, y } = getCheckerAbsolutePos(cellIndex, cellSize, checkerSize, checkerIndex, stage);

			const checker = new Konva.Group({
				x,
				y,
				name: `checker ${cell.color}`
			});

			const checkerCircle = new Konva.Circle({
				// x,
				// y,
				radius: checkerSize / 2,
				fill: cell.color === CellColor.White ? colors.bone : colors.coal
				// name: `checker ${cell.color}`
			});

			const text = new Konva.Text({
				text: `${cellIndex} ${checkerIndex}`,
				fontSize: 10,
				offsetX: cellSize / 2,
				align: 'center',
				width: cellSize
			});

			checker.add(checkerCircle);
			checker.add(text);

			if (DEBUG) {
				const bbox = new Konva.Rect({
					width: cellSize,
					height: checkerSize,
					stroke: 'red',
					strokeWidth: 1,
					offsetX: cellSize / 2,
					offsetY: checkerSize / 2
				});

				checker.add(bbox);
			}

			checker.attrs.cellIndex = cellIndex;
			checker.attrs.checkerIndex = checkerIndex;
			checker.attrs.text = text;

			layer.add(checker);

			if (!checkers[cellIndex]) {
				checkers[cellIndex] = [];
			}
			checkers[cellIndex].push(checker);
		}
	}

	return checkers;
}

function getCheckerAbsolutePos(
	cellIndex: number,
	cellSize: number,
	checkerSize: number,
	checkerIndex: number,
	stage: Stage
) {
	let x;
	if (cellIndex < 12) {
		x = cellSize * cellIndex + cellSize / 2;
	} else {
		x = cellSize * (23 - cellIndex) + cellSize / 2;
	}

	let y;
	if (cellIndex < 12) {
		y = checkerSize * checkerIndex * 1.02 + checkerSize / 2;
	} else {
		y = stage.height() - checkerSize * checkerIndex * 1.02 - checkerSize / 2;
	}
	return { x, y };
}

function initKonva(boardContainer: HTMLDivElement) {
	const stage = new Konva.Stage({
		container: boardContainer,
		width: 500,
		height: 500
	});

	const layer = new Konva.Layer();
	const dynamicLayer = new Konva.Layer();

	stage.add(layer);
	stage.add(dynamicLayer);

	return { stage, layer, dynamicLayer };
}

function drawBoard({ stage, layer }: { stage: Konva.Stage; layer: Konva.Layer }) {
	const triangleWidth = stage.width() / 12;
	const halfTriangleWidth = triangleWidth / 2;

	const triangleHeight = stage.height() / 3;

	const background = new Konva.Rect({
		x: 0,
		y: 0,
		width: stage.width(),
		height: stage.height(),
		fill: colors.brown
	});

	layer.add(background);

	for (let i = 0; i < 12; i++) {
		const x = i * triangleWidth + halfTriangleWidth;

		const topTriangle = new Konva.Line({
			points: [-halfTriangleWidth + x, 0, halfTriangleWidth + x, 0, 0 + x, triangleHeight],
			fill: i % 2 === 0 ? colors.darkBone : colors.darkCoal,
			closed: true
		});

		layer.add(topTriangle);

		const bottomTriangle = new Konva.Line({
			points: [
				-halfTriangleWidth + x,
				stage.height(),
				halfTriangleWidth + x,
				stage.height(),
				0 + x,
				stage.height() - triangleHeight
			],
			fill: i % 2 === 0 ? colors.darkCoal : colors.darkBone,
			closed: true
		});

		layer.add(bottomTriangle);
	}

	if (DEBUG) {
		// draw bounding boxes for each cell
		const bbWidth = stage.width() / 12;
		const bbHeight = stage.height() / 2;
		for (let i = 0; i < 12; i++) {
			const topRect = new Konva.Rect({
				x: i * bbWidth,
				y: 0,
				width: bbWidth,
				height: bbHeight,
				stroke: 'red',
				strokeWidth: 1
			});

			layer.add(topRect);

			const bottomRect = new Konva.Rect({
				x: i * bbWidth,
				y: stage.height() - bbHeight,
				width: bbWidth,
				height: bbHeight,
				stroke: 'red',
				strokeWidth: 1
			});

			layer.add(bottomRect);
		}
	}
}
