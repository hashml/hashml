import { Sugar, SugarsByStart } from "../parser/InlineHandler";
import {
	BlockSchemaDefinition,
	InlinePropDefinition,
	InlineSchemaDefinition,
	INVALID_TAG,
	SchemaDefinition,
	SugarSyntax
} from "./SchemaDefinition";
import { schemaErrors } from "./schemaErrors";

type SugarsByTag = Map<string, Sugar>;

export class Schema {
	private readonly blockSchemas: Map<string, BlockSchema> = new Map();
	private readonly inlineSchemas: Map<string, InlineSchema> = new Map();

	readonly allSugars: Sugar[];

	constructor(schema: SchemaDefinition) {
		const errors = schemaErrors(schema);
		if (errors.length > 0) {
			throw new Error("Invalid schema. " + errors.map(e => e.toString()).join("\n"));
		}

		const allSugars = Schema.getSugars(schema);
		this.allSugars = Array.from(allSugars.values());

		for (const [tag, inlineSchema] of Object.entries(schema.inline)) {
			this.inlineSchemas.set(tag, new InlineSchema(tag, inlineSchema, allSugars));
		}

		for (const [tag, blockSchema] of Object.entries(schema.blocks)) {
			this.blockSchemas.set(tag, new BlockSchema(tag, blockSchema, allSugars));
		}
	}

	// Create a map of tag => sugar
	private static getSugars(schema: SchemaDefinition): SugarsByTag {
		const sugars = new Map<string, Sugar>();
		for (const [tag, { sugar }] of Object.entries(schema.inline)) {
			if (sugar) sugars.set(tag, { tag, syntax: sugar });
		}
		return sugars;
	}

	getBlockSchema(tag: string): BlockSchema | undefined {
		return this.blockSchemas.get(tag) || this.blockSchemas.get(INVALID_TAG);
	}

	getInlineSchema(tag: string): InlineSchema | undefined {
		return this.inlineSchemas.get(tag) || this.inlineSchemas.get(INVALID_TAG);
	}
}

export class BlockSchema {
	private childTagToProp: Map<string, string> = new Map();

	readonly defaultTag?: string;
	readonly head?: InlineGroupSchema;
	readonly headSugarsByStart: SugarsByStart = new Map();

	readonly propNames: string[];
	readonly rawPropName?: string;

	constructor(readonly tag: string, schema: BlockSchemaDefinition, allSugars: SugarsByTag) {
		this.head = schema.head ? new InlineGroupSchema(tag, schema.head) : undefined;
		this.defaultTag = schema.defaultTag;

		const propsSet = new Set<string>(); // set of prop names

		if (schema.head) {
			propsSet.add(schema.head.name);
			this.headSugarsByStart = getSugarsByStart(schema.head, allSugars);
		}

		for (const prop of schema.props) {
			propsSet.add(prop.name);
			if (prop.raw) {
				if (this.rawPropName) throw new Error("Should have only one raw prop!");
				this.rawPropName = prop.name;
			} else {
				prop.content.forEach(rule => this.childTagToProp.set(rule.tag, prop.name));
			}
		}

		this.propNames = Array.from(propsSet);
	}

	getPropName(child: string): string | undefined {
		return this.childTagToProp.get(child) || this.childTagToProp.get(INVALID_TAG);
	}
}

export class InlineSchema {
	readonly numberArgs: number;
	readonly sugar?: SugarSyntax;
	readonly propNames: string[];

	private readonly argsSugarsByStarts: SugarsByStart[];
	readonly argsSchemas: ReadonlyArray<InlineGroupSchema>;

	constructor(readonly tag: string, schema: InlineSchemaDefinition, allSugars: SugarsByTag) {
		this.numberArgs = schema.props.length;
		this.sugar = schema.sugar;
		this.argsSchemas = schema.props.map(_ => new InlineGroupSchema(tag, _));
		this.propNames = schema.props.map(_ => _.name);
		this.argsSugarsByStarts = schema.props.map(_ => getSugarsByStart(_, allSugars));
	}

	getAllowedSugars(index: number): SugarsByStart {
		return this.argsSugarsByStarts[index];
	}
}

export class InlineGroupSchema {
	readonly name: string;
	readonly raw: boolean;
	private readonly validChildren: Set<string>;

	constructor(readonly parentTag: string, schema: InlinePropDefinition) {
		this.name = schema.name;
		this.raw = Boolean(schema.raw);
		this.validChildren = new Set(schema.raw ? [] : schema.content);
	}

	isValidChild(tag: string) {
		return this.validChildren.has(tag);
	}
}

function getSugarsByStart(prop: InlinePropDefinition, allSugars: SugarsByTag): SugarsByStart {
	if (prop.raw) return new Map();
	const result = new Map();
	for (const tag of prop.content) {
		const sugar = allSugars.get(tag);
		if (sugar) result.set(sugar.syntax.start, sugar);
	}
	return result;
}
