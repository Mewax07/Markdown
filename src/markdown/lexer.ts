import {
    CodeNode,
    EmNode,
    ImageNode,
    InlineNode,
    LinkNode,
    StrongNode,
    TextNode,
    Token,
} from "./type";

export function lexer(input: string): Token[] {
    const lines = input.replace(/\r\n/g, "\n").split("\n");

    const tokens: Token[] = [];

    let i = 0;

    while (i < lines.length) {
        const raw = lines[i];
        const lineNum = i;

        if (/^\s*$/.test(raw)) {
            tokens.push({ type: "BLANK", raw, line: lineNum });
            i++;
            continue;
        }

        const fenceMatch = raw.match(/^```(\S*)\s*$/);
        if (fenceMatch) {
            const lang = fenceMatch[1] || undefined;
            let j = i + 1;
            const codeLines: string[] = [];
            while (j < lines.length && !/^```/.test(lines[j])) {
                codeLines.push(lines[j]);
                j++;
            }

            if (j < lines.length && /^```/.test(lines[j])) {
                tokens.push({
                    type: "CODE_FENCE",
                    raw: codeLines.join("\n"),
                    line: lineNum,
                    lang,
                });
                i = j + 1;
                continue;
            } else {
                tokens.push({
                    type: "CODE_FENCE",
                    raw: codeLines.join("\n"),
                    line: lineNum,
                    lang,
                });
                i = j;
                continue;
            }
        }

        const h = raw.match(/^(#{1,6})\s+(.*)$/);
        if (h) {
            tokens.push({
                type: "HEADING",
                raw: h[2],
                line: lineNum,
                depth: h[1].length,
            });
            i++;
            continue;
        }

        if (/^(\*\s*\*\s*\*|-{3,}|_{3,})\s*$/.test(raw)) {
            tokens.push({ type: "HR", raw, line: lineNum });
            i++;
            continue;
        }

        const bq = raw.match(/^\s*> ?(.*)$/);
        if (bq) {
            tokens.push({ type: "BLOCKQUOTE", raw: bq[1], line: lineNum });
            i++;
            continue;
        }

        const ul = raw.match(/^(\s*)([-+*])\s+(.*)$/);
        if (ul) {
            const indent = ul[1].length;
            const customBullet = ul[2];

            tokens.push({
                type: "UL_ITEM",
                raw: ul[3],
                line: lineNum,
                depth: indent / 2,
                bullet: customBullet,
            });
            i++;
            continue;
        }

        const ol = raw.match(/^(\s*)(\d+)\.\s+(.*)$/);
        if (ol) {
            const indent = ol[1].length;
            tokens.push({
                type: "OL_ITEM",
                raw: ol[3],
                line: lineNum,
                depth: indent / 2,
            });
            i++;
            continue;
        }

        let j = i;
        const paraLines: string[] = [];
        while (
            j < lines.length &&
            !/^\s*$/.test(lines[j]) &&
            !/^(#{1,6})\s+/.test(lines[j]) &&
            !/^```/.test(lines[j]) &&
            !/^(\s*)([-+*])\s+/.test(lines[j]) &&
            !/^(\s*)(\d+)\.\s+/.test(lines[j]) &&
            !/^>\s?/.test(lines[j]) &&
            !/^(\*\s*\*\s*\*|-{3,}|_{3,})\s*$/.test(lines[j])
        ) {
            paraLines.push(lines[j]);
            j++;
        }
        tokens.push({
            type: "PARAGRAPH",
            raw: paraLines.join("\n"),
            line: lineNum,
        });
        i = j;
    }

    return tokens;
}

export function parseInline(src: string): InlineNode[] {
    const out: InlineNode[] = [];
    let i = 0;

    function peek(n = 0) {
        return src[i + n];
    }

    function eof() {
        return i >= src.length;
    }

    function consume(n = 1) {
        const s = src.slice(i, i + n);
        i += n;
        return s;
    }

    function readUntil(pattern: RegExp | string) {
        let buf = "";

        while (!eof()) {
            if (typeof pattern === "string") {
                if (src.startsWith(pattern, i)) break;
            } else {
                if (pattern.test(src.slice(i))) break;
            }

            buf += consume(1);
        }

        return buf;
    }

    while (!eof()) {
        if (src.startsWith("![", i)) {
            i += 2;
            const alt = readUntil("]");

            if (peek() === "]") consume(1);
            if (peek() === "(") {
                consume(1);
                const href = readUntil(")");
                if (peek() === ")") consume(1);
                out.push({ type: "IMAGE", src: href.trim(), alt } as ImageNode);
                continue;
            } else {
                out.push({
                    type: "TEXT",
                    value: "![" + alt + (peek() === "]" ? "]" : ""),
                });
                continue;
            }
        }

        if (peek() === "[") {
            consume(1);
            const text = readUntil("]");
            if (peek() === "]") consume(1);
            if (peek() === "(") {
                consume(1);
                const href = readUntil(")");
                if (peek() === ")") consume(1);
                const children = parseInline(text);
                out.push({
                    type: "LINK",
                    href: href.trim(),
                    children,
                } as LinkNode);
                continue;
            } else {
                out.push({
                    type: "TEXT",
                    value: "[" + text + (peek() === "]" ? "]" : ""),
                });
                continue;
            }
        }

        if (peek() === "`") {
            consume(1);
            const code = readUntil("`");
            if (peek() === "`") consume(1);
            out.push({ type: "CODE", value: code } as CodeNode);
            continue;
        }

        if (src.startsWith("**", i) || src.startsWith("__", i)) {
            const delim = consume(2);
            const inner = readUntil(delim);
            if (src.startsWith(delim, i)) consume(2);
            const children = parseInline(inner);
            out.push({ type: "STRONG", children } as StrongNode);
            continue;
        }

        if (peek() === "*" || peek() === "_") {
            const delim = consume(1);
            const inner = readUntil(delim);
            if (peek() === delim) consume(1);
            const children = parseInline(inner);
            out.push({ type: "EM", children } as EmNode);
            continue;
        }

        const txt = readUntil(/(!\[|\[|`|\*\*|__|\*|_|!|\))/);
        if (txt.length > 0) out.push({ type: "TEXT", value: txt });

        if (txt.length === 0) {
            out.push({ type: "TEXT", value: consume(1) });
        }
    }

    return mergeAdjacentTextNodes(out);
}

function mergeAdjacentTextNodes(nodes: InlineNode[]): InlineNode[] {
    const out: InlineNode[] = [];

    for (const n of nodes) {
        const last = out[out.length - 1];
        if (n.type === "TEXT" && last && last.type === "TEXT") {
            (last as TextNode).value += (n as TextNode).value;
        } else {
            out.push(n);
        }
    }

    return out;
}
