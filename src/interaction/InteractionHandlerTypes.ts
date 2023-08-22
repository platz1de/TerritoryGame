export interface ClickInteractionHandler {
	testClick(x: number, y: number): boolean;
	onClick(): void;
}

export interface DragInteractionHandler {
	testDrag(x: number, y: number): boolean;
	onDragStart(x: number, y: number): void;
	onDragMove(x: number, y: number): void;
	onDragEnd(x: number, y: number): void;
	onDragCancel(x: number, y: number): void;
}

export interface ScrollInteractionHandler {
	testScroll(x: number, y: number): boolean;
	onScroll(x: number, y: number, delta: number): void;
}

export interface HoverInteractionHandler {
	testHover(x: number, y: number): boolean;
	onHover(x: number, y: number): void;
}