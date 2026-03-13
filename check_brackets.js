const fs = require('fs');
const content = fs.readFileSync('c:\\Users\\hp\\Desktop\\masterkeylabsv2.0\\src\\lib\\translations.js', 'utf8');

let stack = [];
let inString = false;
let stringChar = '';

for (let i = 0; i < content.length; i++) {
    let char = content[i];

    if (!inString) {
        if (char === '"' || char === "'" || char === "`") {
            inString = true;
            stringChar = char;
        } else if (char === '{') {
            stack.push({ char: '{', index: i });
        } else if (char === '}') {
            if (stack.length === 0) {
                console.log(`Extra } at index ${i}`);
            } else {
                stack.pop();
            }
        }
    } else {
        if (char === stringChar && content[i - 1] !== '\\') {
            inString = false;
        }
    }
}

if (stack.length > 0) {
    console.log(`Missing } for { started at indexes:`);
    stack.forEach(s => {
        // Find line number
        let line = content.substring(0, s.index).split('\n').length;
        console.log(`Line ${line}`);
    });
} else {
    console.log("Brackets are balanced.");
}
