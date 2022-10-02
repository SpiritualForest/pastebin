// Helps with testing

import { readFileSync } from "fs"; // For local testing

export function readFile(filename) {
    try {
        let data = readFileSync(filename, "utf8");
        return data;
    }
    catch(err) {
        console.log(err);
    }
}

