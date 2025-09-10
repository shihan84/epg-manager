const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Create screenshots directory
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

async function takeScreenshots() {
    console.log('🎬 Starting EPG Manager Screenshots...\n');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1920, height: 1080 });
    
    const screenshots = [
        {
            name: '01-homepage',
            url: 'http://localhost:3000',
            description: 'Homepage - Landing page',
            wait: 2000
        },
        {
            name: '02-signin',
            url: 'http://localhost:3000/auth/signin',
            description: 'Sign In page',
            wait: 1000
        },
        {
            name: '03-signup',
            url: 'http://localhost:3000/auth/signup',
            description: 'Sign Up page',
            wait: 1000
        },
        {
            name: '04-dashboard-loading',
            url: 'http://localhost:3000/dashboard',
            description: 'Dashboard (before login)',
            wait: 1000
        }
    ];
    
    // Take screenshots of public pages
    for (const screenshot of screenshots) {
        try {
            console.log(`📸 Capturing: ${screenshot.description}`);
            await page.goto(screenshot.url, { waitUntil: 'networkidle2' });
            await page.waitForTimeout(screenshot.wait);
            
            await page.screenshot({
                path: path.join(screenshotsDir, `${screenshot.name}.png`),
                fullPage: true
            });
            
            console.log(`✅ Saved: ${screenshot.name}.png\n`);
        } catch (error) {
            console.log(`❌ Error capturing ${screenshot.name}: ${error.message}\n`);
        }
    }
    
    // Login and capture authenticated pages
    console.log('🔐 Logging in as demo user...');
    
    try {
        await page.goto('http://localhost:3000/auth/signin');
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'demo@example.com');
        await page.type('input[type="password"]', 'password');
        await page.click('button[type="submit"]');
        
        // Wait for login to complete
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('✅ Login successful!\n');
        
        const authenticatedScreenshots = [
            {
                name: '05-dashboard',
                url: 'http://localhost:3000/dashboard',
                description: 'Dashboard (authenticated)',
                wait: 2000
            },
            {
                name: '06-channels',
                url: 'http://localhost:3000/channels',
                description: 'Channel Management',
                wait: 2000
            },
            {
                name: '07-programs',
                url: 'http://localhost:3000/programs',
                description: 'Program Management',
                wait: 2000
            },
            {
                name: '08-schedules',
                url: 'http://localhost:3000/schedules',
                description: 'Schedule Management',
                wait: 2000
            },
            {
                name: '09-epg',
                url: 'http://localhost:3000/epg',
                description: 'EPG Export',
                wait: 2000
            }
        ];
        
        // Take screenshots of authenticated pages
        for (const screenshot of authenticatedScreenshots) {
            try {
                console.log(`📸 Capturing: ${screenshot.description}`);
                await page.goto(screenshot.url, { waitUntil: 'networkidle2' });
                await page.waitForTimeout(screenshot.wait);
                
                await page.screenshot({
                    path: path.join(screenshotsDir, `${screenshot.name}.png`),
                    fullPage: true
                });
                
                console.log(`✅ Saved: ${screenshot.name}.png\n`);
            } catch (error) {
                console.log(`❌ Error capturing ${screenshot.name}: ${error.message}\n`);
            }
        }
        
        // Login as admin and capture admin panel
        console.log('🔐 Logging in as admin user...');
        
        await page.goto('http://localhost:3000/auth/signin');
        await page.waitForSelector('input[type="email"]');
        await page.type('input[type="email"]', 'admin@example.com');
        await page.type('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        
        // Wait for login to complete
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('✅ Admin login successful!\n');
        
        const adminScreenshots = [
            {
                name: '10-admin-dashboard',
                url: 'http://localhost:3000/admin',
                description: 'Admin Dashboard',
                wait: 3000
            }
        ];
        
        // Take screenshots of admin pages
        for (const screenshot of adminScreenshots) {
            try {
                console.log(`📸 Capturing: ${screenshot.description}`);
                await page.goto(screenshot.url, { waitUntil: 'networkidle2' });
                await page.waitForTimeout(screenshot.wait);
                
                await page.screenshot({
                    path: path.join(screenshotsDir, `${screenshot.name}.png`),
                    fullPage: true
                });
                
                console.log(`✅ Saved: ${screenshot.name}.png\n`);
            } catch (error) {
                console.log(`❌ Error capturing ${screenshot.name}: ${error.message}\n`);
            }
        }
        
    } catch (error) {
        console.log(`❌ Error during authentication: ${error.message}\n`);
    }
    
    await browser.close();
    
    console.log('🎉 Screenshots completed!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
    console.log('\n📋 Screenshots captured:');
    
    const files = fs.readdirSync(screenshotsDir);
    files.forEach(file => {
        console.log(`  - ${file}`);
    });
}

takeScreenshots().catch(console.error);