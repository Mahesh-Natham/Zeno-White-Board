import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture console messages
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  
  // Capture page errors (unhandled exceptions)
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  // Capture failed requests
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure().errorText));

  console.log('Navigating to http://localhost:5173/ ...');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 10000 });
    console.log('Page loaded successfully.');
    
    // Wait a bit to let React render and catch any async errors
    await new Promise(r => setTimeout(r, 3000));
    
  } catch (err) {
    console.error('Navigation error:', err);
  }
  
  await browser.close();
})();
