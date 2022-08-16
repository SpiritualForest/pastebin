import { Sequelize, Model, DataTypes } from "sequelize";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "pastes.db"
});

class Paste extends Model {}

Paste.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expires: {
        type: DataTypes.INTEGER,
        allowNull: true, // If null, never expires
    },
    syntax: {
        type: DataTypes.STRING,
        allowNull: true, // If null, no syntax highlighting - treated as plain text.
    },
    url: {
        // A randomly generated string that corresponds to a URL endpoint.
        type: DataTypes.STRING,
        allowNull: false
    }, 
}, { sequelize });

await Paste.sync();

export function addPaste(text, syntax, expires) {
    // Returns the randomly generated URL
    let lowercase = "abcdefghijklmnopqrstuvwxyz";
    let uppercase = lowercase.toUpperCase();
    let digits = "0123456789";
    let everything = lowercase + uppercase + digits;
    // Now generate 10 characters
    let urlCharacters = [];
    for(let i = 0; i < 10; i++) {
        // Get a random character
        urlCharacters.push(everything[Math.floor(Math.random()*everything.length)]);
    }
    let url = urlCharacters.join("");
    const p = Paste.create({ "text": text, "syntax": syntax, "expires": expires, "url": url });
    return url;
}

export function getPaste(url) {
    // Returns an object containing the paste's information, based on the URL
    let pasteObj = Paste.findAll({
        where: {
            "url": url
        }
    });
    return pasteObj;
}

let u = addPaste("test", undefined, undefined);
console.log(u);
let p = await getPaste(u);
console.log(p);
let t = await getPaste("testinglol");
console.log(t);
