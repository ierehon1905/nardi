export enum CellColor {
	White = 'white',
	Black = 'black',
	Unoccupied = 'unoccupied'
}

export enum GameStyle {
	Long = 'long'
}

export enum TurnError {
	SourceCellIsOutOfBoard = 'Source cell is out of board',
	TargetCellIsOutOfBoard = 'Target cell is out of board',
	SourceCellIsOccupiedByOpponent = 'Source cell is occupied by opponent',
	SourceCellIsEmpty = 'Source cell is empty',
	TargetCellIsOccupiedByOpponent = 'Target cell is occupied by opponent',
	UnknownError = 'Unknown error',
	WrongTurn = 'Wrong turn',
	DoubleTossIsNotAllowed = 'Double toss is not allowed',
	NoCheckerAtSpecifiedIndex = 'No checker at specified index',
	InvalidPlayerMove = 'Invalid player move'
}

export enum MoveResult {
	HasNextMove,
	TurnIsOver,
	GameIsOver
}

export type GameField = {
	cells: {
		color: CellColor;
		count: number;
	}[];
	gameStyle: GameStyle;
	turn: CellColor;
	tossed?: number[];
};

export type CheckersMap = Record<number, Konva.Group[]>;

export type UiCallbacks = {
	startTurn: (color: CellColor) => void;
};
