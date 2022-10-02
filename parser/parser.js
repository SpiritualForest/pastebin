/* Syntax highlighting */
import { parsePython } from "./python.js";

const S_TEXT = "text";
const S_PYTHON = "python";
const S_HTML = "html";
const S_CSS = "css";

export function parse(syntax, text) {
    switch(syntax) {
        case S_PYTHON:
            // Python syntax highlighting.
            return parsePython(text);
        
        case S_HTML:
            // HTML
            return; // Nothing for now
        
        case S_CSS:
            return;

        case S_TEXT:
        default:
            // No highlighting, or unknown
            return text;
    }
}
