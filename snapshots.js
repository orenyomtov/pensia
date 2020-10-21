const PercyScript = require('@percy/script');
const path = require('path');
const httpServer = require('http-server');

const PORT = process.env.PORT_NUMBER || 8000;
const TEST_URL = `http://localhost:${PORT}`;

PercyScript.run(async (page, percySnapshot) => {
    let server = httpServer.createServer();
    server.listen(PORT);

    console.log(`Server started at ${TEST_URL}`);
    await page.goto(TEST_URL);
    await page.waitForTimeout(500);
    await percySnapshot('Home Page');
    
    await page.type("[name='current_age']", '35');
    await page.type("[name='start_of_work_age']", '27');
    await page.type("[name='salary']", '15');
    await page.click("#submit");
    await page.waitForTimeout(500);
    await percySnapshot('Home Page - Input Validation');

    await page.type("[name='salary']", '15000');
    await page.click("#submit");
    await page.waitForTimeout(3000); // Wait for the rough notation animation to finish
    await percySnapshot('Home Page - Form Submitted');

    await page.click(".btn-outline-primary");
    await page.waitForTimeout(1000); // Wait for the modal to open
    await percySnapshot('Home Page - Assumptions Modal Open');

    server.close();
});
