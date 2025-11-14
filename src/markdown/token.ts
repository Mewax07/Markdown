export enum TokenType {
    HEADER,
    LIST_ITEM,
    HR,
    BLOCKQUOTE,
    CODE_FENCE,
    PARAGRAPH,
    BLANK,
    IMAGE,
    STRONG,
    EM,
    CODE,
    TEXT,
    NEWLINE,
    TABLE,
    LATEX,
    UNDERLINE,
    STRIKETHROUGH,
}

export interface Token {
    type: TokenType;
    value: string;
    level?: number;
    lang?: string;
    checked?: boolean;
    listType?: "ul" | "ol";
    alt?: string;
    src?: string;
    size?: string;
    headers?: string[];
    rows?: string[][];
    align?: string[];
}

export interface ASTNode {
    type: TokenType;
    value?: string;
    children?: ASTNode[];
    level?: number;
    lang?: string;
    checked?: boolean;
    listType?: "ul" | "ol";
    alt?: string;
    src?: string;
    size?: string;
    headers?: string[];
    rows?: string[][];
    align?: string[];
}
