import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allowed tags and attributes are restrictive by default.
 * @param {string} content - Raw HTML content
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "b",
      "i",
      "em",
      "strong",
      "a",
      "p",
      "div",
      "span",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "br",
      "hr",
      "img",
      "blockquote",
      "pre",
      "code",
    ],
    ALLOWED_ATTR: ["href", "target", "src", "alt", "title", "class", "style"],
  });
};
