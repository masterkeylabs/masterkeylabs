const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1536, height: 730 });
    
    console.log("Navigating to dashboard...");
    await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle2' });
    
    // Wait a bit for animations
    await page.waitForTimeout(2000);
    
    const result = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        let maxBottom = 0;
        let culprits = [];
        
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const bottom = rect.bottom + window.scrollY;
            
            if (bottom > document.body.scrollHeight - 500) {
            	culprits.push({
            		tag: el.tagName,
            		id: el.id,
            		className: el.className,
            		bottom: bottom,
            		height: rect.height,
            		top: rect.top,
            		position: window.getComputedStyle(el).position
            	});
            }
        });
        
        culprits.sort((a, b) => b.bottom - a.bottom);
        return {
            scrollHeight: document.body.scrollHeight,
            htmlScrollHeight: document.documentElement.scrollHeight,
            topCulprits: culprits.slice(0, 10)
        };
    });
    
    console.log(JSON.stringify(result, null, 2));
    await browser.close();
})();
