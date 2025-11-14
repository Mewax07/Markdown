import { Token, TokenType, ASTNode } from "./token";

export class Parser {
    private tokens: Token[];
    private currentIndex: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): ASTNode[] {
        const ast: ASTNode[] = [];

        while (this.currentIndex < this.tokens.length) {
            const node = this.parseToken();
            if (node) {
                ast.push(node);
            }
            this.currentIndex++;
        }

        return ast;
    }

    private parseToken(): ASTNode | null {
        const token = this.tokens[this.currentIndex];

        switch (token.type) {
            case TokenType.HEADER:
                return {
                    type: TokenType.HEADER,
                    value: this.parseInline(token.value),
                    level: token.level,
                };

            case TokenType.HR:
                return { type: TokenType.HR };

            case TokenType.CODE_FENCE:
                return {
                    type: TokenType.CODE_FENCE,
                    value: token.value,
                    lang: token.lang,
                };

            case TokenType.BLOCKQUOTE:
                return {
                    type: TokenType.BLOCKQUOTE,
                    value: token.value,
                    level: token.level,
                };

            case TokenType.LIST_ITEM:
                return {
                    type: TokenType.LIST_ITEM,
                    value: this.parseInline(token.value),
                    level: token.level,
                    checked: token.checked,
                    listType: token.listType,
                };

            case TokenType.TABLE:
                return {
                    type: TokenType.TABLE,
                    headers: token.headers?.map((h) => this.parseInline(h)),
                    rows: token.rows?.map((row) =>
                        row.map((cell) => this.parseInline(cell))
                    ),
                    align: token.align,
                };

            case TokenType.PARAGRAPH:
                return {
                    type: TokenType.PARAGRAPH,
                    value: this.parseInline(token.value),
                };

            case TokenType.BLANK:
                return null;

            default:
                return { type: TokenType.TEXT, value: token.value };
        }
    }

    private parseInline(text: string): string {
        let result = text;

        result = this.parseImages(result);
        result = this.parseLatex(result);
        result = this.parseCustomHTML(result);
        result = this.parseStrong(result);
        result = this.parseEm(result);
        result = this.parseUnderline(result);
        result = this.parseStrikethrough(result);
        result = this.parseCode(result);

        return result;
    }

    private parseImages(text: string): string {
        return text.replace(
            /!\[([^\]]*)\]\(([^)]+)\)(?:\{([^}]+)\})?/g,
            (_, alt, src, size) => {
                const sizeAttr = size ? ` data-size="${size}"` : "";
                return `<img src="${src}" alt="${alt}"${sizeAttr}>`;
            }
        );
    }

    private parseStrong(text: string): string {
        text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/__([^_]+)__/g, "<strong>$1</strong>");
        return text;
    }

    private parseEm(text: string): string {
        text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");
        text = text.replace(/_([^_]+)_/g, "<em>$1</em>");
        return text;
    }

    private parseCode(text: string): string {
        return text.replace(/`([^`]+)`/g, "<code>$1</code>");
    }

    private parseLatex(text: string): string {
        return text.replace(/\$([^$]+)\$/g, (_match, latex) => {
            return `<span class="latex">${this.renderLatex(latex)}</span>`;
        });
    }

    private renderLatex(latex: string): string {
        let html = latex;

        html = html.replace(
            /\\frac\{([^}]+)\}\{([^}]+)\}/g,
            '<span class="frac"><span class="frac-num">$1</span><span class="frac-line"></span><span class="frac-den">$2</span></span>'
        );
        html = html.replace(
            /\\sqrt\{([^}]+)\}/g,
            '<span class="sqrt"><span class="sqrt-symbol">√</span><span class="sqrt-content">$1</span></span>'
        );
        html = html.replace(/\\times/g, "×");
        html = html.replace(/\\div/g, "÷");
        html = html.replace(/\\pm/g, "±");
        html = html.replace(/\\leq/g, "≤");
        html = html.replace(/\\geq/g, "≥");
        html = html.replace(/\\neq/g, "≠");
        html = html.replace(/\\approx/g, "≈");
        html = html.replace(/\\infty/g, "∞");

        return html;
    }

    private parseCustomHTML(text: string): string {
        text = text.replace(
            /<font\s+color="([^"]+)">([^<]+)<\/font>/g,
            '<span style="color: $1">$2</span>'
        );
        text = text.replace(/<up>([^<]+)<\/up>/g, "<sup>$1</sup>");
        text = text.replace(/<down>([^<]+)<\/down>/g, "<sub>$1</sub>");
        return text;
    }

    private parseUnderline(text: string): string {
        return text.replace(/<u>([^<]+)<\/u>/g, "<u>$1</u>");
    }

    private parseStrikethrough(text: string): string {
        return text.replace(/~~([^~]+)~~/g, "<s>$1</s>");
    }
}
