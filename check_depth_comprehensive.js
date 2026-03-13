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
    // Log depth for interesting lines
    if (line.includes('nav: {')) console.log(`Line ${i + 1} (nav): depth ${depth}`);
    if (line.includes('header: {')) console.log(`Line ${i + 1} (header): depth ${depth}`);
    if (line.includes('sidebar: {')) console.log(`Line ${i + 1} (sidebar): depth ${depth}`);
    if (line.includes('lossAudit: {')) console.log(`Line ${i + 1} (lossAudit): depth ${depth}`);
}
console.log(`Final depth: ${depth}`);
