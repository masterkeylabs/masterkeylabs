const fs = require('fs');
const path = require('path');

const files = [
    'src/app/dashboard/night-loss/page.js',
    'src/app/dashboard/visibility/page.js',
    'src/app/dashboard/visibility/live/page.js',
    'src/app/dashboard/page.js',
    'src/app/dashboard/export/page.js'
];

files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Add dynamic export after imports
    if (!content.includes("export const dynamic")) {
        content = content.replace(
            /from '@\/lib\/supabaseClient';/,
            "from '@/lib/supabaseClient';\n\nexport const dynamic = 'force-dynamic';"
        );
    }

    fs.writeFileSync(filePath, content);
    console.log(`Added dynamic config to: ${file}`);
});

console.log('All files updated!');
