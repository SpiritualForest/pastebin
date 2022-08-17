import express from "express";
import path from "path";
import csrf from "csurf";
import cookieParser from "cookie-parser";
import { parse } from "./parser.js";
import { addPaste, getPaste } from "./database.js";

const app = express();
const __dirname = path.resolve(path.dirname('')); // Resolves to the current working directory

// CSS file
app.use("/static", express.static("static"));

// Parses request bodies
app.use(express.urlencoded({extended: false}));

// Set EJS as our template engine
app.set("view engine", "ejs");

// CSRF and cookie stuff
app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.post("/paste", (req, res) => {
    let text = req.body.text;
    if (text === "" || text === null) {
        console.log("Empty text");
        return;
    }
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt");
    let expires = req.body.expires;
    let syntax = req.body.syntax;
    if (syntax !== "none") {
        // Not plain-text. We need to parse it for syntax highlighting.
        text = parse(syntax, text);
    }
    // Create a new item in the database
    let url = addPaste(text, syntax, expires);
    // Redirect to /<generated url>
    res.redirect(301, `/${url}`);
});

app.get("/:url", async (req, res) => {
    // This is where we fetch the paste details from the database
    // and actually render the ejs template file to the user.
    let pasteObj = await getPaste(req.params.url);
    if (pasteObj === null) {
        res.status(404).send("<h1>404: No such paste</h1>");
        return;
    }
    let text = pasteObj.dataValues["text"];
    let syntax = pasteObj.dataValues["syntax"];
    let expires = pasteObj.dataValues["expires"];
    res.render("paste", { "text": text, "syntax": syntax, "expires": expires });
});

app.get("/", (req, res) => {
    res.render("index", { csrfToken: req.csrfToken() });
});

app.listen(3000, () => console.log("Server running: http://localhost:3000/"));
