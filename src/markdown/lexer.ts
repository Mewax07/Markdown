import { Token, TokenType } from "./token";

export class Lexer {
    private lines: string[];
    private currentIndex: number = 0;

    constructor(input: string) {
        this.lines = input.split("\n");
    }

    tokenize(): Token[] {
        const tokens: Token[] = [];

        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex];
            const token = this.tokenizeLine(line);

            if (token) {
                tokens.push(token);
            }

            this.currentIndex++;
        }

        return this.mergeBlockquotes(tokens);
    }

    private mergeBlockquotes(tokens: Token[]): Token[] {
        const result: Token[] = [];
        let i = 0;

        while (i < tokens.length) {
            if (tokens[i].type === TokenType.BLOCKQUOTE) {
                const blockquoteLines: string[] = [tokens[i].value];
                let j = i + 1;

                while (
                    j < tokens.length &&
                    tokens[j].type === TokenType.BLOCKQUOTE
                ) {
                    blockquoteLines.push(tokens[j].value);
                    j++;
                }

                result.push({
                    type: TokenType.BLOCKQUOTE,
                    value: blockquoteLines.join("\n"),
                });

                i = j;
            } else {
                result.push(tokens[i]);
                i++;
            }
        }

        return result;
    }

    tokenizeLine(line: string): Token | null {
        if (line.trim() === "") {
            return { type: TokenType.BLANK, value: "" };
        }

        if (this.isHeader(line)) {
            return this.parseHeader(line);
        }

        if (this.isHR(line)) {
            return { type: TokenType.HR, value: line };
        }

        if (this.isTable(line)) {
            return this.parseTable();
        }

        if (this.isCodeFence(line)) {
            return this.parseCodeFence();
        }

        if (this.isBlockquote(line)) {
            return this.parseBlockquote(line);
        }

        if (this.isList(line)) {
            return this.parseList(line);
        }

        return this.parseParagraph(line);
    }

    private isHeader(line: string): boolean {
        return /^#{1,6}\s/.test(line);
    }

    private parseHeader(line: string): Token {
        const match = line.match(/^(#{1,6})\s+(.+)$/);

        if (match) {
            return {
                type: TokenType.HEADER,
                value: match[2],
                level: match[1].length,
            };
        }

        return { type: TokenType.TEXT, value: line };
    }

    private isHR(line: string): boolean {
        return /^([-_*])\1{2,}$/.test(line.trim());
    }

    private isCodeFence(line: string): boolean {
        return /^```/.test(line);
    }

    private parseCodeFence(): Token {
        const startLine = this.lines[this.currentIndex];
        const langMatch = startLine.match(/^```(\w+)?/);
        const lang = langMatch ? langMatch[1] || "" : "";

        let code = "";
        this.currentIndex++;

        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex];

            if (line.trim() === "```") {
                break;
            }

            code += line + "\n";
            this.currentIndex++;
        }

        return {
            type: TokenType.CODE_FENCE,
            value: code.trimEnd(),
            lang,
        };
    }

    private isBlockquote(line: string): boolean {
        return /^>\s/.test(line);
    }

    private parseBlockquote(line: string): Token {
        const match = line.match(/^(>+)\s?(.*)$/);

        if (match) {
            const level = match[1].length;
            const content = match[2];

            return {
                type: TokenType.BLOCKQUOTE,
                value: content,
                level,
            };
        }

        let content = line.replace(/^>\s?/, "");

        return {
            type: TokenType.BLOCKQUOTE,
            value: content,
            level: 1,
        };
    }

    private isList(line: string): boolean {
        return (
            /^(\s*)[-*+]\s/.test(line) ||
            /^(\s*)\d+\.\s/.test(line) ||
            /^(\s*)[-*+]\s\[[ x]\]\s/.test(line)
        );
    }

    private parseList(line: string): Token {
        const checkboxMatch = line.match(/^(\s*)[-*+]\s\[([ x])\]\s(.+)$/);

        if (checkboxMatch) {
            const indent = checkboxMatch[1].length;

            return {
                type: TokenType.LIST_ITEM,
                value: checkboxMatch[3],
                level: Math.floor(indent / 2),
                checked: checkboxMatch[2] === "x",
                listType: "ul",
            };
        }

        const ulMatch = line.match(/^(\s*)[-*+]\s(.+)$/);

        if (ulMatch) {
            const indent = ulMatch[1].length;

            return {
                type: TokenType.LIST_ITEM,
                value: ulMatch[2],
                level: Math.floor(indent / 2),
                listType: "ul",
            };
        }

        const olMatch = line.match(/^(\s*)\d+\.\s(.+)$/);

        if (olMatch) {
            const indent = olMatch[1].length;

            return {
                type: TokenType.LIST_ITEM,
                value: olMatch[2],
                level: Math.floor(indent / 2),
                listType: "ol",
            };
        }

        return {
            type: TokenType.TEXT,
            value: line,
        };
    }

    private parseParagraph(line: string): Token {
        return {
            type: TokenType.PARAGRAPH,
            value: line,
        };
    }

    private isTable(line: string): boolean {
        return /^\|/.test(line.trim());
    }

    private parseTable(): Token {
        const rows: string[][] = [];
        const headers: string[] = [];
        const align: string[] = [];

        const headerLine = this.lines[this.currentIndex].trim();

        if (headerLine.startsWith("|")) {
            const cols = headerLine.split("|").filter((c) => c.trim());
            headers.push(...cols.map((c) => c.trim()));
        }

        this.currentIndex++;

        if (this.currentIndex < this.lines.length) {
            const alignLine = this.lines[this.currentIndex].trim();

            if (alignLine.startsWith("|") && /[-:]/.test(alignLine)) {
                const alignCols = alignLine.split("|").filter((c) => c.trim());

                for (const col of alignCols) {
                    const trimmed = col.trim();

                    if (trimmed.startsWith(":") && trimmed.endsWith(":")) {
                        align.push("center");
                    } else if (trimmed.endsWith(":")) {
                        align.push("right");
                    } else {
                        align.push("left");
                    }
                }

                this.currentIndex++;
            }
        }

        while (this.currentIndex < this.lines.length) {
            const line = this.lines[this.currentIndex].trim();

            if (!line.startsWith("|")) {
                break;
            }

            const cols = line.split("|").filter((c) => c.trim());
            rows.push(cols.map((c) => c.trim()));
            this.currentIndex++;
        }

        this.currentIndex--;

        return {
            type: TokenType.TABLE,
            value: "",
            headers,
            rows,
            align: align.length > 0 ? align : headers.map(() => "left"),
        };
    }
}
