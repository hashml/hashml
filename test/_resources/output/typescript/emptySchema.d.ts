/* This file was generated by Hashml https://github.com/hashml/hashml */
export type Tag = BlockTag | InlineTag;
export type BlockTag = BlockRoot;
export type InlineTag = never;
export interface BlockRoot {
    tag: "root";
    props: {};
}
