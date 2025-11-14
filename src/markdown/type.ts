export type TokenType =
    | "HEADING"
    | "HR"
    | "UL_ITEM"
    | "OL_ITEM"
    | "BLOCKQUOTE"
    | "CODE_FENCE"
    | "PARAGRAPH"
    | "BLANK";

export interface Token {
    type: TokenType;
    raw: string;
    line: number;
    depth?: number;
    lang?: string;
    bullet?: string;
}

export type InlineNodeType =
    | "TEXT"
    | "STRONG"
    | "EM"
    | "CODE"
    | "LINK"
    | "IMAGE";

export interface InlineNodeBase {
    type: InlineNodeType;
}

export interface TextNode extends InlineNodeBase {
    type: "TEXT";
    value: string;
}

export interface StrongNode extends InlineNodeBase {
    type: "STRONG";
    children: InlineNode[];
}

export interface EmNode extends InlineNodeBase {
    type: "EM";
    children: InlineNode[];
}

export interface CodeNode extends InlineNodeBase {
    type: "CODE";
    value: string;
}

export interface LinkNode extends InlineNodeBase {
    type: "LINK";
    href: string;
    title?: string;
    children: InlineNode[];
}

export interface ImageNode extends InlineNodeBase {
    type: "IMAGE";
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
}

export type InlineNode =
    | TextNode
    | StrongNode
    | EmNode
    | CodeNode
    | LinkNode
    | ImageNode;

export type BlockNodeType =
    | "HEADING"
    | "PARAGRAPH"
    | "UL"
    | "OL"
    | "BLOCKQUOTE"
    | "CODE"
    | "HR";

export interface BlockNodeBase {
    type: BlockNodeType;
}

export interface HeadingNode extends BlockNodeBase {
    type: "HEADING";
    level: number;
    children: InlineNode[];
}

export interface ParagraphNode extends BlockNodeBase {
    type: "PARAGRAPH";
    children: InlineNode[];
}

export interface ULNode extends BlockNodeBase {
    type: "UL";
    items: BlockNode[];
}

export interface OLNode extends BlockNodeBase {
    type: "OL";
    items: BlockNode[];
}

export interface BlockquoteNode extends BlockNodeBase {
    type: "BLOCKQUOTE";
    children: BlockNode[];
}

export interface CodeBlockNode extends BlockNodeBase {
    type: "CODE";
    lang?: string;
    code: string;
}

export interface HRNode extends BlockNodeBase {
    type: "HR";
}

export type BlockNode =
    | HeadingNode
    | ParagraphNode
    | ULNode
    | OLNode
    | BlockquoteNode
    | CodeBlockNode
    | HRNode;
