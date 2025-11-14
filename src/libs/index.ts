/**
 * Html Class - Utility for creating components and manipulating DOM elements
 * Optimized for performance and enhanced with powerful query methods
 */
export default class Html {
    /**
     * The underlying DOM element
     */
    elm: HTMLElement;

    /**
     * Creates an instance of Html wrapping an existing element or a new one.
     */
    constructor(elm: HTMLElement | string | Html = "div") {
        if (elm instanceof Html) {
            this.elm = elm.elm;
        } else if (elm instanceof HTMLElement) {
            this.elm = elm;
        } else {
            this.elm = document.createElement(elm);
        }
    }

    /**
     * Set the inner/outer text content of the element.
     */
    setText(value: string, direction: "inner" | "outer" = "inner"): Html {
        if (direction === "outer") {
            this.elm.outerText = value;
        } else {
            this.elm.innerText = value;
        }
        return this;
    }

    /**
     * Get the inner/outer text of the element.
     */
    getText(direction: "inner" | "outer" = "inner"): string {
        return direction === "outer" ? this.elm.outerText : this.elm.innerText;
    }

    /**
     * Set the inner/outer HTML of the element.
     */
    setHtml(value: string, direction: "inner" | "outer" = "inner"): Html {
        if (direction === "outer") {
            this.elm.outerHTML = value;
        } else {
            this.elm.innerHTML = value;
        }
        return this;
    }

    /**
     * Get the inner/outer HTML of the element.
     */
    getHtml(direction: "inner" | "outer" = "inner"): string {
        return direction === "outer" ? this.elm.outerHTML : this.elm.innerHTML;
    }

    /**
     * Query a single descendant using a CSS selector.
     */
    query(selector: string): HTMLElement | null {
        return this.elm.querySelector(selector);
    }

    /**
     * Query a single descendant and return wrapped Html.
     */
    qs(selector: string): Html | null {
        const found = this.elm.querySelector(selector) as HTMLElement;
        return found ? new Html(found) : null;
    }

    /**
     * Query multiple descendants and return wrapped Html instances.
     */
    qsa(selector: string): Html[] {
        const list = this.elm.querySelectorAll(selector);
        return Array.from(list, (e) => new Html(e as HTMLElement));
    }

    /**
     * Find element by ID within this element's scope.
     */
    byId(id: string): Html | null {
        return this.qs(`#${CSS.escape(id)}`);
    }

    /**
     * Find elements by name attribute.
     */
    byName(name: string): Html[] {
        return this.qsa(`[name="${CSS.escape(name)}"]`);
    }

    /**
     * Find elements by class name.
     */
    byClass(className: string): Html[] {
        return this.qsa(`.${CSS.escape(className)}`);
    }

    /**
     * Find elements by tag name.
     */
    byTag(tagName: string): Html[] {
        const elements = this.elm.getElementsByTagName(tagName);
        return Array.from(elements, (e) => new Html(e as HTMLElement));
    }

    /**
     * Find elements by data attribute value.
     * @param key - The data attribute name (without 'data-' prefix)
     * @param value - Optional value to match. If omitted, finds all elements with this data attribute.
     */
    byData(key: string, value?: string): Html[] {
        const selector =
            value !== undefined
                ? `[data-${CSS.escape(key)}="${CSS.escape(value)}"]`
                : `[data-${CSS.escape(key)}]`;
        return this.qsa(selector);
    }

    /**
     * Find first element by data attribute value.
     */
    byDataFirst(key: string, value?: string): Html | null {
        const selector =
            value !== undefined
                ? `[data-${CSS.escape(key)}="${CSS.escape(value)}"]`
                : `[data-${CSS.escape(key)}]`;
        return this.qs(selector);
    }

    /**
     * Find elements by any custom attribute.
     */
    byAttr(attr: string, value?: string): Html[] {
        const selector =
            value !== undefined
                ? `[${CSS.escape(attr)}="${CSS.escape(value)}"]`
                : `[${CSS.escape(attr)}]`;
        return this.qsa(selector);
    }

    /**
     * Find first element by any custom attribute.
     */
    byAttrFirst(attr: string, value?: string): Html | null {
        const selector =
            value !== undefined
                ? `[${CSS.escape(attr)}="${CSS.escape(value)}"]`
                : `[${CSS.escape(attr)}]`;
        return this.qs(selector);
    }

    /**
     * Find parent element matching selector.
     */
    closest(selector: string): Html | null {
        const found = this.elm.closest(selector);
        return found ? new Html(found as HTMLElement) : null;
    }

    /**
     * Get parent element.
     */
    parent(): Html | null {
        return this.elm.parentElement ? new Html(this.elm.parentElement) : null;
    }

    /**
     * Get all siblings.
     */
    siblings(): Html[] {
        if (!this.elm.parentElement) return [];
        return Array.from(this.elm.parentElement.children)
            .filter((e) => e !== this.elm)
            .map((e) => new Html(e as HTMLElement));
    }

    /**
     * Get next sibling element.
     */
    next(): Html | null {
        return this.elm.nextElementSibling
            ? new Html(this.elm.nextElementSibling as HTMLElement)
            : null;
    }

    /**
     * Get previous sibling element.
     */
    prev(): Html | null {
        return this.elm.previousElementSibling
            ? new Html(this.elm.previousElementSibling as HTMLElement)
            : null;
    }

    /**
     * Set the element's id attribute.
     */
    id(val: string): Html {
        this.elm.id = val;
        return this;
    }

    /**
     * Get the element's id.
     */
    getId(): string {
        return this.elm.id;
    }

    /**
     * Set a data-* attribute on the element.
     */
    dataset(key: string, value: string): Html {
        this.elm.dataset[key] = value;
        return this;
    }

    /**
     * Get a data-* attribute value.
     */
    getDataset(key: string): string | undefined {
        return this.elm.dataset[key];
    }

    /**
     * Set or remove attributes.
     */
    attr(obj: { [key: string]: string | null | undefined }): Html;
    attr(key: string, value: string | null | undefined): Html;
    attr(
        keyOrObj: string | { [key: string]: string | null | undefined },
        value?: string | null
    ): Html {
        if (typeof keyOrObj === "string") {
            // Single attribute
            if (value != null) {
                this.elm.setAttribute(keyOrObj, value);
            } else {
                this.elm.removeAttribute(keyOrObj);
            }
        } else {
            // Multiple attributes
            Object.entries(keyOrObj).forEach(([key, val]) => {
                if (val != null) {
                    this.elm.setAttribute(key, val);
                } else {
                    this.elm.removeAttribute(key);
                }
            });
        }
        return this;
    }

    /**
     * Get an attribute value.
     */
    getAttr(key: string): string | null {
        return this.elm.getAttribute(key);
    }

    /**
     * Check if element has an attribute.
     */
    hasAttr(key: string): boolean {
        return this.elm.hasAttribute(key);
    }

    /**
     * Remove an attribute.
     */
    removeAttr(key: string): Html {
        this.elm.removeAttribute(key);
        return this;
    }

    /**
     * Toggle one or more CSS classes on the element.
     */
    class(...classes: string[]): Html {
        classes.forEach((c) => this.elm.classList.toggle(c));
        return this;
    }

    /**
     * Add one or more CSS classes to the element.
     */
    classOn(...classes: string[]): Html {
        this.elm.classList.add(...classes);
        return this;
    }

    /**
     * Remove one or more CSS classes from the element.
     */
    classOff(...classes: string[]): Html {
        this.elm.classList.remove(...classes);
        return this;
    }

    /**
     * Check if element has a class.
     */
    hasClass(className: string): boolean {
        return this.elm.classList.contains(className);
    }

    /**
     * Replace a class with another.
     */
    replaceClass(oldClass: string, newClass: string): Html {
        this.elm.classList.replace(oldClass, newClass);
        return this;
    }

    /**
     * Apply CSS properties using setProperty.
     */
    style(styles: { [key: string]: string }): Html {
        Object.entries(styles).forEach(([key, value]) =>
            this.elm.style.setProperty(key, value)
        );
        return this;
    }

    /**
     * Apply CSS properties via the style object (JS property names).
     */
    styleJs(styles: Partial<CSSStyleDeclaration>): Html {
        Object.entries(styles).forEach(([key, value]) => {
            if (value !== undefined && key in this.elm.style) {
                (this.elm.style as any)[key] = value;
            }
        });
        return this;
    }

    /**
     * Get a computed style value.
     */
    getStyle(property: string): string {
        return window.getComputedStyle(this.elm).getPropertyValue(property);
    }

    /**
     * Remove a style property.
     */
    removeStyle(property: string): Html {
        this.elm.style.removeProperty(property);
        return this;
    }

    /**
     * Add an event listener to the element.
     */
    on(
        ev: string,
        cb: EventListenerOrEventListenerObject,
        options?: AddEventListenerOptions
    ): Html {
        this.elm.addEventListener(ev, cb, options);
        return this;
    }

    /**
     * Remove an event listener from the element.
     */
    un(
        ev: string,
        cb: EventListenerOrEventListenerObject,
        options?: EventListenerOptions
    ): Html {
        this.elm.removeEventListener(ev, cb, options);
        return this;
    }

    /**
     * Add a one-time event listener.
     */
    once(ev: string, cb: EventListenerOrEventListenerObject): Html {
        return this.on(ev, cb, { once: true });
    }

    /**
     * Trigger a custom event.
     */
    trigger(eventName: string, detail?: any): Html {
        this.elm.dispatchEvent(
            new CustomEvent(eventName, { detail, bubbles: true })
        );
        return this;
    }

    /**
     * Remove the element from the DOM.
     */
    remove(): Html {
        this.elm.remove();
        return this;
    }

    /**
     * Empty the element (remove all children).
     */
    empty(): Html {
        this.elm.innerHTML = "";
        return this;
    }

    /**
     * Clone the element.
     */
    clone(deep: boolean = true): Html {
        return new Html(this.elm.cloneNode(deep) as HTMLElement);
    }

    /**
     * Replace this element with another.
     */
    replaceWith(newElement: Html | HTMLElement): Html {
        const el = newElement instanceof Html ? newElement.elm : newElement;
        this.elm.replaceWith(el);
        return this;
    }

    /**
     * Append this element to a parent.
     */
    appendTo(parent: HTMLElement | Html | string): Html {
        const p = Html.from(parent);
        if (p) p.elm.appendChild(this.elm);
        return this;
    }

    /**
     * Prepend this element to a parent.
     */
    prependTo(parent: HTMLElement | Html | string): Html {
        const p = Html.from(parent);
        if (p) p.elm.prepend(this.elm);
        return this;
    }

    /**
     * Append a child element or create one from a tag.
     */
    append(elem: HTMLElement | Html | string): Html {
        if (elem instanceof Html) {
            this.elm.appendChild(elem.elm);
            return this;
        } else if (elem instanceof HTMLElement) {
            this.elm.appendChild(elem);
            return this;
        } else {
            const newEl = new Html(elem);
            this.elm.appendChild(newEl.elm);
            return newEl;
        }
    }

    /**
     * Prepend a child element or create one from a tag.
     */
    prepend(elem: HTMLElement | Html | string): Html {
        if (elem instanceof Html) {
            this.elm.prepend(elem.elm);
            return this;
        } else if (elem instanceof HTMLElement) {
            this.elm.prepend(elem);
            return this;
        } else {
            const newEl = new Html(elem);
            this.elm.prepend(newEl.elm);
            return newEl;
        }
    }

    /**
     * Append multiple elements or tags in sequence.
     */
    appendMany(...elements: (HTMLElement | Html | string)[]): Html {
        elements.forEach((e) => this.append(e));
        return this;
    }

    /**
     * Prepend multiple elements or tags in sequence.
     */
    prependMany(...elements: (HTMLElement | Html | string)[]): Html {
        elements.forEach((e) => this.prepend(e));
        return this;
    }

    /**
     * Insert this element after a reference element.
     */
    insertAfter(reference: Html | HTMLElement): Html {
        const ref = reference instanceof Html ? reference.elm : reference;
        ref.parentNode?.insertBefore(this.elm, ref.nextSibling);
        return this;
    }

    /**
     * Insert this element before a reference element.
     */
    insertBefore(reference: Html | HTMLElement): Html {
        const ref = reference instanceof Html ? reference.elm : reference;
        ref.parentNode?.insertBefore(this.elm, ref);
        return this;
    }

    /**
     * Get array of child elements wrapped in Html.
     */
    children(): Html[] {
        return Array.from(this.elm.children, (c) => new Html(c as HTMLElement));
    }

    /**
     * Get the first child element wrapped in Html.
     */
    firstChild(): Html | null {
        return this.elm.firstElementChild
            ? new Html(this.elm.firstElementChild as HTMLElement)
            : null;
    }

    /**
     * Get the last child element wrapped in Html.
     */
    lastChild(): Html | null {
        return this.elm.lastElementChild
            ? new Html(this.elm.lastElementChild as HTMLElement)
            : null;
    }

    /**
     * Set the value property on input elements.
     */
    setValue(str: string): Html {
        if (
            this.elm instanceof HTMLInputElement ||
            this.elm instanceof HTMLTextAreaElement ||
            this.elm instanceof HTMLSelectElement
        ) {
            this.elm.value = str;
        }
        return this;
    }

    /**
     * Get the value property of input elements.
     */
    getValue(): string {
        if (
            this.elm instanceof HTMLInputElement ||
            this.elm instanceof HTMLTextAreaElement ||
            this.elm instanceof HTMLSelectElement
        ) {
            return this.elm.value;
        }
        return "";
    }

    /**
     * Set checked state for checkbox/radio inputs.
     */
    checked(state: boolean): Html {
        if (this.elm instanceof HTMLInputElement) {
            this.elm.checked = state;
        }
        return this;
    }

    /**
     * Get checked state.
     */
    isChecked(): boolean {
        return this.elm instanceof HTMLInputElement ? this.elm.checked : false;
    }

    /**
     * Set disabled state.
     */
    disabled(state: boolean): Html {
        if (
            this.elm instanceof HTMLInputElement ||
            this.elm instanceof HTMLButtonElement ||
            this.elm instanceof HTMLSelectElement ||
            this.elm instanceof HTMLTextAreaElement
        ) {
            this.elm.disabled = state;
        }
        return this;
    }

    /**
     * Set the src attribute (e.g., for images).
     */
    src(path: string): Html {
        if ("src" in this.elm) {
            (this.elm as HTMLImageElement).src = path;
        }
        return this;
    }

    /**
     * Get the src attribute.
     */
    getSrc(): string {
        return "src" in this.elm ? (this.elm as HTMLImageElement).src : "";
    }

    /**
     * Show element (remove display: none).
     */
    show(displayValue: string = "block"): Html {
        this.elm.style.display = displayValue;
        return this;
    }

    /**
     * Hide element (set display: none).
     */
    hide(): Html {
        this.elm.style.display = "none";
        return this;
    }

    /**
     * Toggle visibility.
     */
    toggle(displayValue: string = "block"): Html {
        if (this.elm.style.display === "none") {
            this.show(displayValue);
        } else {
            this.hide();
        }
        return this;
    }

    /**
     * Get element dimensions and position.
     */
    rect(): DOMRect {
        return this.elm.getBoundingClientRect();
    }

    /**
     * Get/Set scroll position.
     */
    scroll(x?: number, y?: number): Html {
        if (x !== undefined && y !== undefined) {
            this.elm.scrollTo(x, y);
        }
        return this;
    }

    /**
     * Get scroll position.
     */
    getScroll(): { x: number; y: number } {
        return { x: this.elm.scrollLeft, y: this.elm.scrollTop };
    }

    /**
     * Scroll element into view.
     */
    scrollIntoView(options?: ScrollIntoViewOptions): Html {
        this.elm.scrollIntoView(options);
        return this;
    }

    /**
     * Focus element.
     */
    focus(): Html {
        this.elm.focus();
        return this;
    }

    /**
     * Blur element.
     */
    blur(): Html {
        this.elm.blur();
        return this;
    }

    /**
     * Check if element matches a selector.
     */
    matches(selector: string): boolean {
        return this.elm.matches(selector);
    }

    /**
     * Check if element contains another element.
     */
    contains(other: Html | HTMLElement): boolean {
        const el = other instanceof Html ? other.elm : other;
        return this.elm.contains(el);
    }

    /**
     * Execute a callback with this instance (for chaining).
     */
    tap(callback: (html: Html) => void): Html {
        callback(this);
        return this;
    }

    /**
     * Swap the internal element reference.
     */
    swapRef(elm: HTMLElement): Html {
        this.elm = elm;
        return this;
    }

    /**
     * Create an Html instance from various inputs.
     */
    static from(elm: string | HTMLElement | Html | null): Html | null {
        if (!elm) return null;
        if (elm instanceof Html) return elm;
        if (typeof elm === "string") {
            const found = document.querySelector(elm) as HTMLElement;
            return found ? new Html(found) : null;
        }
        if (elm instanceof HTMLElement) return new Html(elm);
        return null;
    }

    /**
     * Query a single element in the document and wrap it.
     */
    static qs(selector: string): Html | null {
        const found = document.querySelector(selector) as HTMLElement;
        return found ? new Html(found) : null;
    }

    /**
     * Query multiple elements in the document and wrap them.
     */
    static qsa(selector: string): Html[] {
        const list = document.querySelectorAll(selector);
        return Array.from(list, (e) => new Html(e as HTMLElement));
    }

    /**
     * Find element by ID in the document.
     */
    static byId(id: string): Html | null {
        const found = document.getElementById(id);
        return found ? new Html(found) : null;
    }

    /**
     * Find elements by name in the document.
     */
    static byName(name: string): Html[] {
        const elements = document.getElementsByName(name);
        return Array.from(elements, (e) => new Html(e as HTMLElement));
    }

    /**
     * Find elements by class in the document.
     */
    static byClass(className: string): Html[] {
        const elements = document.getElementsByClassName(className);
        return Array.from(elements, (e) => new Html(e as HTMLElement));
    }

    /**
     * Find elements by tag in the document.
     */
    static byTag(tagName: string): Html[] {
        const elements = document.getElementsByTagName(tagName);
        return Array.from(elements, (e) => new Html(e as HTMLElement));
    }

    /**
     * Create element with attributes in one call.
     */
    static create(
        tag: string,
        attrs?: { [key: string]: string },
        children?: (Html | HTMLElement | string)[]
    ): Html {
        const el = new Html(tag);
        if (attrs) el.attr(attrs);
        if (children) children.forEach((child) => el.append(child));
        return el;
    }
}
