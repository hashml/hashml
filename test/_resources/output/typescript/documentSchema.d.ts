/* This file was generated by Hashml https://github.com/hashml/hashml */
export type Tag = BlockTag | InlineTag;
export type BlockTag = BlockRoot | BlockParagraph | BlockSection | BlockId | BlockCode;
export type InlineTag = InlineLink | InlineBold | InlineStrong | InlineCode | InlineInline;
export interface BlockRoot {
    tag: "root";
    props: {
        content: (BlockParagraph | BlockSection | BlockCode)[];
    };
}
export interface BlockParagraph {
    tag: "paragraph";
    props: {
        text: (InlineLink | InlineBold | InlineCode | InlineStrong | InlineInline | string)[];
    };
}
export interface BlockSection {
    tag: "section";
    props: {
        content: (BlockParagraph | BlockSection | BlockCode)[];
        id: BlockId | null;
        title: (InlineLink | InlineBold | InlineCode | InlineStrong | InlineInline | string)[];
    };
}
export interface BlockId {
    tag: "id";
    props: {
        content: string;
    };
}
export interface BlockCode {
    tag: "code";
    props: {
        content: string[];
        language: string;
    };
}
export interface InlineLink {
    tag: "link";
    props: {
        url: URL;
        text: (InlineBold | string)[];
    };
}
export interface InlineBold {
    tag: "bold";
    props: {
        text: (InlineLink | string)[];
    };
}
export interface InlineStrong {
    tag: "strong";
    props: {
        text: (InlineLink | string)[];
    };
}
export interface InlineCode {
    tag: "code";
    props: {
        content: string;
    };
}
export interface InlineInline {
    tag: "inline";
    props: {
        inlineContent: (InlineLink | InlineBold | InlineCode | InlineStrong | InlineInline | string)[];
    };
}