const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\hp\\Desktop\\masterkeylabsv2.0\\src\\lib\\translations.js', 'utf8');

let depth = 0;
let inString = false;
let stringChar = '';

for (let i = 0; i < content.length; i++) {
    let char = content[i];

    if (!inString) {
        if (char === '"' || char === "'" || char === "`") {
            inString = true;
            stringChar = char;
        } else if (char === '{') {
            depth++;
        } else if (char === '}') {
            depth--;
        }
    } else {
        if (char === stringChar && content[i - 1] !== '\\') {
            inString = false;
        }
    }
}

console.log(`Final depth: ${depth}`);
