const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\hp\\Desktop\\masterkeylabsv2.0\\src\\lib\\translations.js', 'utf8');

let depth = 0;
let inString = false;
let stringChar = '';
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
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
            if (char === stringChar && line[j - 1] !== '\\') {
                inString = false;
            }
        }
    }
    if (i + 1 >= 1760 && i + 1 <= 1765) {
        console.log(`Line ${i + 1}: depth ${depth}`);
    }
}
