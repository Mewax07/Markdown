import Html from "../libs";
import { ASTNode, TokenType } from "./token";

export class Translator {
    private ast: ASTNode[];

    constructor(ast: ASTNode[]) {
        this.ast = ast;
    }

    translate(): Html {
        const container = new Html("div").classOn("markdown-content");

        let currentList: Html | null = null;
        let currentListLevel = -1;
        let listStack: Html[] = [];

        for (const node of this.ast) {
            if (node.type === TokenType.LIST_ITEM) {
                const level = node.level || 0;

                if (
                    !currentList ||
                    node.listType !== currentList.elm.tagName.toLowerCase()
                ) {
                    while (listStack.length > level) {
                        listStack.pop();
                    }

                    const listTag = node.listType === "ol" ? "ol" : "ul";
                    const newList = new Html(listTag);

                    if (listStack.length > 0) {
                        const lastItem =
                            listStack[listStack.length - 1].lastChild();
                        if (lastItem) {
                            lastItem.append(newList);
                        }
                    } else {
                        container.append(newList);
                    }

                    currentList = newList;
                    listStack.push(newList);
                    currentListLevel = level;
                }

                if (level > currentListLevel) {
                    const listTag = node.listType === "ol" ? "ol" : "ul";
                    const subList = new Html(listTag);
                    const lastItem = currentList.lastChild();
                    if (lastItem) {
                        lastItem.append(subList);
                    }
                    currentList = subList;
                    listStack.push(subList);
                    currentListLevel = level;
                } else if (level < currentListLevel) {
                    while (listStack.length > level + 1) {
                        listStack.pop();
                    }
                    currentList = listStack[listStack.length - 1] || null;
                    currentListLevel = level;
                }

                const li = new Html("li");

                if (node.checked !== undefined) {
                    const checkbox = new Html("input")
                        .attr({ type: "checkbox" })
                        .checked(node.checked)
                        .disabled(false);
                    li.append(checkbox);
                    li.append(new Html("span").setHtml(node.value || ""));
                } else {
                    li.setHtml(node.value || "");
                }

                if (currentList) {
                    currentList.append(li);
                }
            } else {
                currentList = null;
                currentListLevel = -1;
                listStack = [];

                const element = this.translateNode(node);
                if (element) {
                    container.append(element);
                }
            }
        }

        return container;
    }

    private translateNode(node: ASTNode): Html | null {
        switch (node.type) {
            case TokenType.HEADER:
                const h = new Html(`h${node.level}`);
                h.setHtml(node.value || "");
                return h;

            case TokenType.HR:
                return new Html("hr");

            case TokenType.CODE_FENCE:
                const pre = new Html("pre");
                const code = new Html("code");
                if (node.lang) {
                    code.classOn(`language-${node.lang}`);
                }
                code.setHtml(this.highlightCode(node.value || '', node.lang || ''));
                return pre.append(code);

            case TokenType.BLOCKQUOTE:
                return this.renderBlockquote(node.value || '', node.level || 1);

            case TokenType.TABLE:
                return this.renderTable(node);

            case TokenType.PARAGRAPH:
                const p = new Html("p");
                p.setHtml(node.value || "");
                return p;

            default:
                return null;
        }
    }

    private highlightCode(code: string, lang: string): string {
        const keywords: { [key: string]: string[] } = {
            javascript: [
                "const",
                "let",
                "var",
                "function",
                "return",
                "if",
                "else",
                "for",
                "while",
                "class",
                "new",
                "import",
                "export",
                "from",
                "async",
                "await",
            ],
            python: [
                "def",
                "class",
                "import",
                "from",
                "return",
                "if",
                "else",
                "elif",
                "for",
                "while",
                "in",
                "and",
                "or",
                "not",
                "True",
                "False",
                "None",
            ],
            java: [
                "public",
                "private",
                "class",
                "void",
                "return",
                "if",
                "else",
                "for",
                "while",
                "new",
                "static",
                "final",
                "import",
            ],
            typescript: [
                "const",
                "let",
                "var",
                "function",
                "return",
                "if",
                "else",
                "for",
                "while",
                "class",
                "new",
                "import",
                "export",
                "from",
                "interface",
                "type",
                "async",
                "await",
            ],
        };

        let highlighted = this.escapeHtml(code);

        if (keywords[lang]) {
            const keywordPattern = new RegExp(
                `\\b(${keywords[lang].join("|")})\\b`,
                "g"
            );
            highlighted = highlighted.replace(
                keywordPattern,
                '<span class="keyword">$1</span>'
            );
        }

        highlighted = highlighted.replace(
            /(".*?"|'.*?'|`.*?`)/g,
            '<span class="string">$1</span>'
        );
        highlighted = highlighted.replace(
            /\/\/.*$/gm,
            '<span class="comment"></span>'
        );
        highlighted = highlighted.replace(
            /\/\*[\s\S]*?\*\//g,
            '<span class="comment"></span>'
        );
        highlighted = highlighted.replace(
            /\b(\d+)\b/g,
            '<span class="number">$1</span>'
        );

        return highlighted;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    private renderBlockquote(content: string, level: number): Html {
        const lines = content.split("\n");
        let container = new Html("blockquote");
        let currentQuote = container;

        for (const line of lines) {
            const match = line.match(/^(>*)\s?(.*)$/);
            if (match) {
                const depth = match[1].length + 1;
                const text = match[2];

                if (depth > level) {
                    const nested = new Html("blockquote");
                    currentQuote.append(nested);
                    currentQuote = nested;
                    level = depth;
                }

                const p = new Html("p");
                p.setHtml(text);
                currentQuote.append(p);
            } else {
                const p = new Html("p");
                p.setHtml(line);
                currentQuote.append(p);
            }
        }

        return container;
    }

    private renderTable(node: ASTNode): Html {
        const table = new Html("table");

        if (node.headers && node.headers.length > 0) {
            const thead = new Html("thead");
            const tr = new Html("tr");

            node.headers.forEach((header, i) => {
                const th = new Html("th");
                if (node.align && node.align[i]) {
                    th.style({ "text-align": node.align[i] });
                }
                th.setHtml(header);
                tr.append(th);
            });

            thead.append(tr);
            table.append(thead);
        }

        if (node.rows && node.rows.length > 0) {
            const tbody = new Html("tbody");

            node.rows.forEach((row) => {
                const tr = new Html("tr");

                row.forEach((cell, i) => {
                    const td = new Html("td");
                    if (node.align && node.align[i]) {
                        td.style({ "text-align": node.align[i] });
                    }
                    td.setHtml(cell);
                    tr.append(td);
                });

                tbody.append(tr);
            });

            table.append(tbody);
        }

        return table;
    }
}
