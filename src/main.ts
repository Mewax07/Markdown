import Html from "./libs";
import { Lexer } from "./markdown/lexer";
import { Parser } from "./markdown/parser";
import { Translator } from "./markdown/translator";

const md = `# Titre principal

## Sous-titre

Paragraphe avec du **texte en gras**, de l'*italique*, <u>du souligné</u> et du ~~texte barré~~.

### Liste à puces

- Premier élément
- Deuxième élément
  - Sous-élément
  - Autre sous-élément
- Troisième élément

### Liste numérotée

1. Premier
2. Deuxième
3. Troisième

### Liste de tâches

- [ ] Tâche non faite
- [x] Tâche terminée

### Citation

> Ceci est une citation importante.
> Sur plusieurs lignes
>> Avec profondeur

### Tableau

| Colonne 1 | Colonne 2 | Colonne 3 |
|-----------|:---------:|----------:|
| Gauche    | Centre    | Droite    |
| A         | B         | C         |

### Code

Code en ligne : \`const x = 10;\`

Bloc de code :

\`\`\`javascript
function hello() {
    console.log("Hello World");
}
\`\`\`

### LaTeX Maths

Formule simple : $a + b = c$

Fraction : $\\frac{a}{b}$

Racine carrée : $\\sqrt{x}$

Opérations : $2 \\times 3 = 6$

### Séparateur

---

### HTML personnalisé

Texte <font color="red">rouge</font> et <font color="blue">bleu</font>.

Le 19<up>ème</up> siècle et H<down>2</down>O.

### Image

![Texte alternatif](https://www.placeholderimage.eu/api/800/600){400x200}
`;

const container = new Html().class("container").appendTo("body");
const panelBase = new Html().class("panel");
const editor = new Html("textarea").class("editor").setValue(md);
const preview = new Html().class("preview");

container.appendMany(
    panelBase.clone().append(editor),
    panelBase.clone().append(preview)
);

function render() {
    const input = editor.getValue();
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();
    const translator = new Translator(ast);
    const result = translator.translate();

    preview.empty();
    preview.append(result);
}

editor.on("input", render);

render();
