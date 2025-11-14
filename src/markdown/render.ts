import Html from "../libs";
import {
    BlockNode,
    BlockquoteNode,
    CodeBlockNode,
    CodeNode,
    EmNode,
    HeadingNode,
    ImageNode,
    InlineNode,
    LinkNode,
    OLNode,
    ParagraphNode,
    StrongNode,
    TextNode,
    ULNode,
} from "./type";
import { lexer } from "./lexer";
import { parseTokensToAST } from "./parser";

function renderInlineNodesToHtml(inlines: InlineNode[]): Html {
    const container = new Html("span");

    for (const n of inlines) {
        switch (n.type) {
            case "TEXT":
                const textEl = Html.create("span");
                textEl.setText((n as TextNode).value);
                container.append(textEl);
                break;
            case "STRONG": {
                const el = Html.create("strong") as any;
                el.append(
                    renderInlineNodesToHtml((n as StrongNode).children).elm ??
                        ""
                );
                // renderInline returns an Html with a span; we should append its children instead of the span itself
                // simplest: set innerHTML from the child's innerHTML
                const childSpan = renderInlineNodesToHtml(
                    (n as StrongNode).children
                );
                el.setHtml(childSpan.getHtml());
                container.append(el);
                break;
            }
            case "EM": {
                const childSpan = renderInlineNodesToHtml(
                    (n as EmNode).children
                );
                const el = Html.create("em");
                el.setHtml(childSpan.getHtml());
                container.append(el);
                break;
            }
            case "CODE": {
                const el = Html.create("code");
                el.setText((n as CodeNode).value);
                container.append(el);
                break;
            }
            case "LINK": {
                const l = n as LinkNode;
                const el = Html.create("a", { href: l.href });
                const childSpan = renderInlineNodesToHtml(l.children);
                el.setHtml(childSpan.getHtml());
                container.append(el);
                break;
            }
            case "IMAGE": {
                const img = n as ImageNode;
                const el = Html.create("img", { src: img.src, alt: img.alt });

                if (img.width !== undefined) {
                    el.style({ width: img.width + "px" });
                }
                if (img.height !== undefined) {
                    el.style({ height: img.height + "px" });
                }

                container.append(el);
                break;
            }
        }
    }
    return container;
}

function compileAstToHtml(ast: BlockNode[]): Html {
    const root = new Html("div");
    for (const node of ast) {
        switch (node.type) {
            case "HEADING": {
                const h = node as HeadingNode;
                const tag = `h${Math.min(6, Math.max(1, h.level))}`;
                const el = Html.create(tag);
                const children = renderInlineNodesToHtml(h.children);
                el.setHtml(children.getHtml());
                root.append(el);
                break;
            }
            case "PARAGRAPH": {
                const p = Html.create("p");
                const children = renderInlineNodesToHtml(
                    (node as ParagraphNode).children
                );
                p.setHtml(children.getHtml());
                root.append(p);
                break;
            }
            case "HR": {
                root.append(Html.create("hr"));
                break;
            }
            case "CODE": {
                const cb = node as CodeBlockNode;
                const pre = Html.create("pre");
                const code = Html.create("code");
                if (cb.lang) code.attr("data-lang", cb.lang);
                code.setText(cb.code, "inner");
                pre.append(code);
                root.append(pre);
                break;
            }
            case "UL": {
                const ul = Html.create("ul");
                for (const it of (node as ULNode).items) {
                    const li = Html.create("li");
                    // if item is a paragraph, render its inline children; if nested list, handle recursively
                    if (it.type === "PARAGRAPH") {
                        const html = renderInlineNodesToHtml(
                            (it as ParagraphNode).children
                        );
                        li.setHtml(html.getHtml());
                    } else {
                        // fallback: serialize nested block into innerHTML recursively
                        const nested = compileAstToHtml([it]);
                        li.setHtml(nested.getHtml());
                    }
                    ul.append(li);
                }
                root.append(ul);
                break;
            }
            case "OL": {
                const ol = Html.create("ol");
                for (const it of (node as OLNode).items) {
                    const li = Html.create("li");
                    if (it.type === "PARAGRAPH") {
                        const html = renderInlineNodesToHtml(
                            (it as ParagraphNode).children
                        );
                        li.setHtml(html.getHtml());
                    } else {
                        const nested = compileAstToHtml([it]);
                        li.setHtml(nested.getHtml());
                    }
                    ol.append(li);
                }
                root.append(ol);
                break;
            }
            case "BLOCKQUOTE": {
                const bq = Html.create("blockquote");
                const childrenHtml = compileAstToHtml(
                    (node as BlockquoteNode).children
                );
                bq.setHtml(childrenHtml.getHtml());
                root.append(bq);
                break;
            }
            default:
                // ignore unknown
                break;
        }
    }
    return root;
}

export function compileMarkdownToHtml(markdown: string): Html {
    const tokens = lexer(markdown);
    const ast = parseTokensToAST(tokens);
    const html = compileAstToHtml(ast);
    return html;
}

export function compileMarkdownToHtmlString(markdown: string): string {
    return compileMarkdownToHtml(markdown).getHtml("outer");
}
