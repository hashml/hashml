import { IRNode, isValidPropName, Prop } from "../ir/IRNode";

/**
 * Convert an IR tree to an XML string.
 * Child nodes are indented with a tab `\t` character.
 *
 * @param root Root of the IR tree
 * @param indentation Indentation level
 *
 * @returns Tab-indented XML representation of the IR tree.
 */
export function toXML(root: IRNode, indentation: number = 0): string {
	const children = Object.entries(root)
		.filter(([key]) => isValidPropName(key))
		.map(
			([propName, propContent]) => propToXML(propName, propContent, indentation + 1) // TODO remove cast
		);
	return xmlTag(root.$tag, indentation, ...children);
}

function propToXML(tag: string, content: Prop, indentation: number): string {
	if (!content) {
		return xmlTag(tag, indentation);
	} else if (typeof content === "string") {
		return xmlTag(tag, indentation, indent(escapeXML(content), indentation + 1));
	} else if (content instanceof Date || content instanceof URL) {
		return xmlTag(tag, indentation, content.toString());
	} else if (content instanceof Array) {
		const children = (content as Array<IRNode | string>).map((node) =>
			typeof node === "string"
				? indent(escapeXML(node), indentation + 1)
				: toXML(node, indentation + 1)
		);
		return xmlTag(tag, indentation, ...children);
	} else {
		return xmlTag(tag, indentation, toXML(content, indentation + 1));
	}
}

function xmlTag(name: string, indentation: number, ...children: string[]): string {
	if (children.length === 0) {
		return indent(`<${name}/>`, indentation);
	} else {
		const openTag = indent(`<${name}>`, indentation);
		const content = children.join("\n");
		const closeTag = indent(`</${name}>`, indentation);
		return `${openTag}\n${content}\n${closeTag}`;
	}
}

function escapeXML(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
		.replace(/\t/g, "&#09;");
}

function indent(line: string, indentation: number): string {
	return "\t".repeat(indentation) + line;
}
