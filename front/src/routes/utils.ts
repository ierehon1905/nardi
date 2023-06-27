export const uniq = <T>(array: T[]) => {
	return Array.from(new Set(array));
};

declare global {
	interface Array<T> {
		uniq(): T[];
	}
}

Array.prototype.uniq = function () {
	return uniq(this);
};
