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

// Expiration values
let E_NEVER = "never";
let E_10M = "10minutes"; // setMinutes(d.getMinutes() + 10)
let E_HOUR = "hour"; // setHours(d.getHours() + 1)
let E_DAY = "day"; // setDate(d.getDate() + 1)
let E_WEEK = "week"; // setDate(d.getDate() + 7)

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
    // Expiration time calculation
    let now = new Date();
    let expirationDate = null;
    if (expires == E_10M) {
        expirationDate = new Date(now.setMinutes(now.getMinutes() + 10));
    }
    else if (expires == E_HOUR) {
        expirationDate = new Date(now.setHours(now.getHours() + 1));
    }
    else if (expires == E_DAY) { 
        expirationDate = new Date(now.setDate(now.getDate() + 1));
    }
    else if (expires == E_WEEK) {
        expirationDate = new Date(now.setDate(now.getDate() + 7));
    }
    // If expirationDate is not null, get the milliseconds from it with getTime()
    // Otherwise, just set it as null. Null expiration means it never expires.
    const p = Paste.create({ "text": text, "syntax": syntax, "expires": expirationDate ? expirationDate.getTime() : null, "url": url });
    return url;
}

export function getPaste(url) {
    // Returns an object containing the paste's information, based on the URL
    let pasteObj = Paste.findOne({
        where: {
            "url": url
        }
    });
    return pasteObj;
}

/*let p = await addPaste("test", "none", "never")
let u = await getPaste(p);
console.log(u);*/
