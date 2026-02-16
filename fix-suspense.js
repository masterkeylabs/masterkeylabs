// This script will be used to apply Suspense fixes to all dashboard pages
// Pages to fix:
// 1. /dashboard/loss-audit/page.js
// 2. /dashboard/night-loss/page.js
// 3. /dashboard/visibility/page.js
// 4. /dashboard/visibility/live/page.js
// 5. /dashboard/page.js

const fs = require('fs');
const path = require('path');

const files = [
    'src/app/dashboard/loss-audit/page.js',
    'src/app/dashboard/night-loss/page.js',
    'src/app/dashboard/visibility/page.js',
    'src/app/dashboard/visibility/live/page.js',
    'src/app/dashboard/page.js'
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add Suspense to imports
    content = content.replace(
        /import { useState, useEffect } from 'react';/,
        "import { useState, useEffect, Suspense } from 'react';"
    );

    // Rename the main export to Content version
    const match = content.match(/export default function (\w+)\(\)/);
    if (match) {
        const functionName = match[1];
        const contentName = functionName.replace('Page', 'PageContent');

        content = content.replace(
            `export default function ${functionName}()`,
            `function ${contentName}()`
        );

        // Add wrapper at the end
        content += `\n\nexport default function ${functionName}() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-primary">Loading...</div></div>}>
            <${contentName} />
        </Suspense>
    );
}\n`;
    }

    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
});

console.log('All files fixed!');
