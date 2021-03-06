import { BlockHandler } from "../parser/BlockHandler";
import { InlineParser } from "../parser/InlineParser";
import { InputPosition } from "../parser/InputPosition";
import {
	CardinalityError,
	DisallowedDefaultTagError,
	DisallowedHeadError,
	DisallowedInBlockError,
	ErrorLogger,
	HMError,
	UnknownBlockTagError,
} from "../schema/errors";
import { BlockSchema, Schema } from "../schema/Schema";
import { ROOT } from "../schema/SchemaDefinition";
import { last } from "../utils";
import { IRInlineHandler } from "./IRInlineHandler";
import { IRNode, IRNodeList } from "./IRNode";

export class IRBlockHandler implements BlockHandler {
	private readonly inlineHandler: IRInlineHandler;
	private readonly inlineParser: InlineParser;
	private root!: IRNode;
	private readonly stack: Array<{
		node: IRNode;
		schema: BlockSchema;
		childCount: Map<string, number>;
	}> = [];
	private ignoreFlag: boolean = false;

	constructor(private readonly schema: Schema, private readonly log: ErrorLogger) {
		this.inlineHandler = new IRInlineHandler(schema, log);
		this.inlineParser = new InlineParser(this.inlineHandler, schema.sugars);
		this.reset();
	}

	reset(): void {
		this.stack.length = 0;
		this.root = this.pushBlock(ROOT, this.schema.rootSchema);
		this.ignoreFlag = false;
	}

	getResult(): IRNode {
		return this.root;
	}

	private pushBlock(tag: string, schema: BlockSchema): IRNode {
		const headProp = schema.head ? { [schema.head.name]: schema.head.raw ? null : [] } : {};
		const bodyProps = Object.fromEntries(
			schema.bodyProps.map((prop) => [prop.name, prop.isArrayType ? [] : null])
		);
		const node = { $tag: tag, ...headProp, ...bodyProps };
		const childCount = new Map<string, number>();
		this.stack.push({ node, schema, childCount });
		return node;
	}

	openBlock(tagString: string | undefined, pos: InputPosition): boolean {
		const parent = last(this.stack);

		const tag = tagString || parent.schema.defaultTag;
		if (!tag) return this.blockError(new DisallowedDefaultTagError(parent.node.$tag, pos));

		const schema = this.schema.getBlockSchema(tag);
		if (!schema) return this.blockError(new UnknownBlockTagError(tag, pos));

		const prop = parent.schema.getPropByChild(tag);
		if (!prop) {
			return this.blockError(new DisallowedInBlockError(parent.node.$tag, tag, pos));
		}

		const count = (parent.childCount.get(tag) || 0) + 1;
		const cardinality = prop.childCardinality(tag)!;
		parent.childCount.set(tag, count);
		if (count > cardinality.max) {
			this.log(new CardinalityError(parent.node, [pos], tag, count, cardinality));
		}

		const node = this.pushBlock(tag, schema);

		if (prop.isArrayType) {
			(parent.node[prop.name] as IRNodeList).push(node); // TODO remove cast
		} else {
			parent.node[prop.name] = node;
		}

		return !Boolean(schema.rawProp);
	}

	closeBlock(): void {
		if (this.ignoreFlag) {
			this.ignoreFlag = false;
			return;
		}
		const top = this.stack.pop();
		if (top) {
			for (const [child, cardinality] of top.schema.childCardinalities) {
				const count = top.childCount.get(child) || 0;
				if (count < cardinality.min) {
					this.log(new CardinalityError(top.node, [], child, count, cardinality));
				}
			}
		}
	}

	private blockError(error: HMError): false {
		this.log(error);
		this.ignoreFlag = true;
		return false;
	}

	head(content: string, pos: InputPosition) {
		const parent = last(this.stack);
		const headSchema = parent.schema.head;

		if (!headSchema) {
			this.log(new DisallowedHeadError(parent.node.$tag, pos));
			return;
		}

		if (headSchema.raw) {
			parent.node[headSchema.name] = content;
			return;
		}

		this.inlineHandler.reset(headSchema);
		this.inlineParser.parse(content, pos);
		parent.node[headSchema.name] = this.inlineHandler.getResult();
	}

	rawLine(content: string, pos: InputPosition) {
		if (this.ignoreFlag) return;
		const parent = last(this.stack);
		(parent.node[parent.schema.rawProp!.name] as IRNodeList).push(content); // TODO remove cast
	}
}
