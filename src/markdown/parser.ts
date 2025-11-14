import {
    BlockNode,
    BlockquoteNode,
    CodeBlockNode,
    HeadingNode,
    HRNode,
    OLNode,
    ParagraphNode,
    Token,
    ULNode,
} from "./type";
import { lexer, parseInline } from "./lexer";

export function parseTokensToAST(tokens: Token[]): BlockNode[] {
    const out: BlockNode[] = [];
    let i = 0;

    function parseList(
        startIndex: number,
        listType: "UL" | "OL"
    ): { node: ULNode | OLNode; next: number } {
        const items: BlockNode[] = [];
        let idx = startIndex;

        while (idx < tokens.length) {
            const t = tokens[idx];
            if (
                (listType === "UL" && t.type !== "UL_ITEM") ||
                (listType === "OL" && t.type !== "OL_ITEM")
            )
                break;

            // each list item may be simple inline (raw) or multiple lines - we'll treat each item raw as paragraph for now
            const childParagraph: ParagraphNode = {
                type: "PARAGRAPH",
                children: parseInline(t.raw),
            };
            items.push(childParagraph);
            idx++;
            // detect nested items by depth (simple heuristic) and group - naive: consecutive items with greater depth -> nested list
            // For brevity, we do not implement deep nesting merging; each item is a paragraph. Could be extended.
        }

        const node =
            listType === "UL"
                ? ({ type: "UL", items } as ULNode)
                : ({ type: "OL", items } as OLNode);
        return { node, next: idx };
    }

    while (i < tokens.length) {
        const t = tokens[i];

        switch (t.type) {
            case "BLANK":
                i++;
                continue;
            case "HEADING":
                out.push({
                    type: "HEADING",
                    level: t.depth || 1,
                    children: parseInline(t.raw),
                } as HeadingNode);
                i++;
                break;
            case "HR":
                out.push({ type: "HR" } as HRNode);
                i++;
                break;
            case "CODE_FENCE":
                out.push({
                    type: "CODE",
                    lang: t.lang,
                    code: t.raw,
                } as CodeBlockNode);
                i++;
                break;
            case "BLOCKQUOTE": {
                // group consecutive blockquote tokens into one blockquote node, parse their inner as markdown recursively
                const lines: string[] = [];
                let j = i;
                while (j < tokens.length && tokens[j].type === "BLOCKQUOTE") {
                    lines.push(tokens[j].raw);
                    j++;
                }
                const inner = lines.join("\n");
                const innerTokens = lexer(inner);
                const innerNodes = parseTokensToAST(innerTokens);
                out.push({
                    type: "BLOCKQUOTE",
                    children: innerNodes,
                } as BlockquoteNode);
                i = j;
                break;
            }
            case "UL_ITEM": {
                const { node, next } = parseList(i, "UL");
                out.push(node);
                i = next;
                break;
            }
            case "OL_ITEM": {
                const { node, next } = parseList(i, "OL");
                out.push(node);
                i = next;
                break;
            }
            case "PARAGRAPH": {
                out.push({
                    type: "PARAGRAPH",
                    children: parseInline(t.raw),
                } as ParagraphNode);
                i++;
                break;
            }
            default:
                i++;
                break;
        }
    }

    return out;
}

