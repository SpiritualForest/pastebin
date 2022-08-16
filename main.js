import express from "express"
import path from "path"
import { parse } from "./parser.js";

const app = express();
const __dirname = path.resolve(path.dirname('')); // Resolves to the current working directory


// CSS file
app.use("/static", express.static("static"));

// Parses request bodies
app.use(express.urlencoded({extended: false}));

app.post("/paste", (req, res) => {
    parse(req.body.syntax, req.body.text);
    res.send("Done");
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => console.log("Server running: http://localhost:3000/"));
