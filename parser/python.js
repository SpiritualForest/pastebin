/* Python syntax parsing */
import { _function, _data, _keyword, _operator, _comment } from "./highlight.js";
import { readFile } from "./readfile.js";

const identifiers = {
    "keywords": new Set(["and", "as", "assert", "async", "await",
            "break", "class", "continue", "def", "del",
            "elif", "else", "except", "finally", "for",
            "from", "global", "if", "import", "in",
            "is", "lambda", "nonlocal", "not", "or",
            "pass", "raise", "return", "try", "while",
            "with", "yield"]),
    "functions": new Set(['__build_class__', '__import__', 'abs', 'all', 'any',
                            'ascii', 'bin', 'breakpoint', 'callable', 'chr', 'compile',
                            'delattr', 'dir', 'divmod', 'eval', 'exec', 'format', 'getattr',
                            'globals', 'hasattr', 'hash', 'hex', 'id', 'input', 'isinstance',
                            'issubclass', 'iter', 'aiter', 'len', 'locals', 'max', 'min', 'next',
                            'anext', 'oct', 'ord', 'pow', 'print', 'repr', 'round', 'setattr',
                            'sorted', 'sum', 'vars', 'open']),
    "operators": new Set(["=", "==", ">=", "<=", "+", "-", "*", "/", "//", "%", "**",
                          "+=", "-=", "*=", "/=", "//=", "%=", "**=", "!=",
                          "&", "|", "~", "<<", ">>", "^"])
}

const isalnum = new RegExp(/^([A-Z]|[a-z]|[0-9])$/); // Is the character either a letter or a digit?

export function parsePython(text) {
    let parsed = []; // Parsed lines go here
    let inString = false; // Are we in a string?
    let inDocString = false; // Docstring?
    let quoteType; // ' or "
    let quoteCount = 0;
    for(let line of text.split("\n")) {
        let parsedLine = ""; // The parsed line
        let accumulation = ""; // Accumulated string, since we check char by char
        let inComment = false; // Comments only last until the end of a line. New line started, so can't be in comment
        for(let character of line) {
            switch(character) {
                case "'":
                case '"':
                    // Handle strings and docstrings
                    if (quoteType === character) {
                        // Quote type matches
                        quoteCount++;
                        if (quoteCount == 3) {
                            inDocString = !inDocString;
                            quoteCount = 0;
                        }
                        else if (!inDocString) {
                            inString = !inString;
                        }
                        if (inString || inDocString) {
                            // Quotes can also serve as delimiters for keywords
                            // For example: if "hey"and"hey": print("hey")
                            // is syntactically valid and executes correctly.
                            if (identifiers.keywords.has(accumulation)) {
                                parsedLine += _keyword(accumulation);
                                accumulation = "";
                            }
                        }
                        else {
                            parsedLine += _data(accumulation);
                            // Also clear the accumulation string
                            accumulation = "";
                        }
                    }
                    break;

                case "#":
                    // Comments
                    if (!inString && !inDocString) {
                        // Comment starts.
                        // We continue to read until the end of line.
                        // We add the comment after reading the rest of the line
                        inComment = true;
                        accumulation = "";
                    }
                    break;
            }
            if (!inString && !inDocString && !inComment) {
                switch(character) {
                    case " ":
                        // Spaces act as delimiters for keywords
                        if (identifiers.keywords.has(accumulation)) {
                            parsedLine += _keyword(accumulation);
                            accumulation = "";
                        }
                        else if (identifiers.operators.has(accumulation)) {
                            parsedLine += _operator(accumulation);
                            accumulation = "";
                        }
                        break;

                    case "(":
                        // Function name
                        parsedLine += _function(accumulation);
                        parsedLine += character;
                        accumulation = "";
                        continue;

                    case "[":
                        // List opening. Can delimit operators
                        if (identifiers.operators.has(accumulation)) {
                            parsedLine += _operator(accumulation);
                            accumulation = "";
                        }
                        break;

                    case ")":
                    case "]":
                        parsedLine += accumulation;
                        accumulation = "";
                        break;
                    
                    default:
                        // Other delimeters for operators
                        if (isalnum.test(character)) {
                            if (identifiers.operators.has(accumulation)) {
                                parsedLine += _operator(accumulation);
                                accumulation = "";
                            }
                        }
                        break;
                }
            }
            // Read into our accumulation buffer
            accumulation += character;
        }
        // Line processed. Check for comments
        if (inComment) {
            parsedLine += _comment(accumulation);
            accumulation = "";
        }
        if (accumulation.length > 0) {
            parsedLine += accumulation;
        }
        parsed.push(parsedLine);
    }
    return parsed.join("\n");
}

/* Testing area */
let data = readFile("./gcd.py");
console.log(parsePython(data));
