/* Pastebin code syntax parser */
import { readFileSync } from "fs"; // For local testing

const S_TEXT = "text";
const S_PYTHON = "python";
const S_HTML = "html";
const S_CSS = "css";

const identifiers = {
    [S_PYTHON]: { 
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
                              'sorted', 'sum', 'vars', 'open'])
    }
}

function readPythonFile(filename) {
    try {
        let data = readFileSync(filename, "utf8");
        return data;
    }
    catch(err) {
        console.log(err);
    }
}

const pythonCode = readPythonFile("../gcd.py");
parsePython(pythonCode);

/* Use regex match.index and match.lastIndex to find the substring location for replacement */

export function parse(syntax, text) {
    if (syntax == S_TEXT) {
        // Do nothing.
        return text;
    }
    else if (syntax == S_PYTHON) {
        // Python syntax highlighting.
        return parsePython(text);
    }
    else if (syntax == S_HTML) {
        return;
    }
    else if (syntax == S_CSS) {
        return;
    }
    else {
        // Unknown
        return text;
    }
}

function parsePython(text) {
    /* Character by character analysis of each line.
     * Non-alphanumeric characters are considered our delimiters. */
    let m_string = false; // Are we in a string?
    let m_escaped = false; // If we encounter backslash
    let delimiters = new Set(["(", ")", '"', "'", " ", ":", "="]);
    for(let line of text.split("\n")) {
        let accumulation = ""; // Everything else
        let comment = ""; // If we are in a comment, accumulate the rest of the string into this one.
        let m_comment = false; // Are we in a comment?
        let m_def = false; // Did we encounter "def"? If yes, the next characters are a function name
        let processedLine = "";
        let fname = ""; // Function name
        let accumulatedString = ""; // If we're in a string, accumulate the characters here.
        for(let c of line) {
            if (c == '"' || c == "'") {
                m_string = !m_string;
                if (!m_string) {
                    processedLine += "<data>" + accumulatedString + c + "<end>";
                    accumulatedString = "";
                }
            }
            if (m_string) {
                accumulatedString += c;
            }
            else if (c == "#" && !m_string) {
                // Treat everything after this as a comment.
                m_comment = true;
            }
            if (m_comment) {
                comment += c;
            }
            else if (!delimiters.has(c) && !m_string && !m_comment) {
                if (m_def) {
                    // Function name.
                    fname += c;
                }
                else {
                    // Normal character, not in a string or comment
                    accumulation += c;
                }
            }
            else {
                // Delimiter
                if (identifiers[S_PYTHON]["keywords"].has(accumulation)) {
                    processedLine += "<keyword>" + accumulation + "<end>" + c;
                }
                else if (identifiers[S_PYTHON]["functions"].has(accumulation)) {
                    // Built in function
                    processedLine += "<function>" + accumulation + "<end>" + c;
                }
                else {
                    if (m_def) {
                        m_def = false;
                        processedLine += "<function>" + fname + "<end>" + c;
                    }
                    else if (!m_string && accumulatedString == "" && c != '"' && c != "'") {
                        // Just some identifier name.
                        processedLine += accumulation + c;
                    }
                }
                if (accumulation == "def") {
                    m_def = true;
                }
                // Now check built-in functions
                accumulation = "";
            }
        }
        if (m_comment) {
            processedLine += "<comment>" + comment + "</comment>";
        }
        console.log(processedLine);
    }
}
