import { compileMarkdownToHtml } from "./markdown/render";

const md = `
# Titre principal

Paragraphe avec **gras**, *italique*, un [lien](https://example.com) et \`code\`.

- Item 1
- Item 2
  - Sous-item

1. You
2. Are
3. Why

> Blockquote avec *emphase*.

\`\`\`js
console.log("code block");
\`\`\`

![alt text](https://placehold.co/600x400 =120x100)

---

1. Première
2. Deuxième
`;

const root = compileMarkdownToHtml(md);
root.appendTo(document.body);
