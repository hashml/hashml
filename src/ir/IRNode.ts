export interface IRNode {
	tag: string;
	props: {
		[name: string]: IRNodeList;
	};
}

export type IRNodeList = Array<string | IRNode>;

export function emptyBlockProps(propNames: ReadonlyArray<string>): { [key: string]: [] } {
	return Object.fromEntries(propNames.map(x => [x, []]));
}
