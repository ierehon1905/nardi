import type Konva from 'konva';

declare global {
	declare const Konva: typeof import('konva').default;
}

export as namespace Konva;
export = Konva;
