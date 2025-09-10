const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class EPGManagerScreenshot {
  constructor() {
    this.screenshots = [
      {
        url: 'http://localhost:3000',
        name: '01-homepage.png',
        description: 'Landing page with hero section and features',
        auth: false
      },
      {
        url: 'http://localhost:3000/auth/signin',
        name: '02-signin.png',
        description: 'User sign-in form with demo credentials',
        auth: false
      },
      {
        url: 'http://localhost:3000/auth/signup',
        name: '03-signup.png',
        description: 'User registration form',
        auth: false
      }
    ];

    this.authenticatedScreenshots = [
      {
        url: 'http://localhost:3000/dashboard',
        name: '04-dashboard.png',
        description: 'Main dashboard with statistics and quick actions'
      },
      {
        url: 'http://localhost:3000/channels',
        name: '05-channels.png',
        description: 'Channel management interface'
      },
      {
        url: 'http://localhost:3000/programs',
        name: '06-programs.png',
        description: 'Program management with copy functionality'
      },
      {
        url: 'http://localhost:3000/schedules',
        name: '07-schedules.png',
        description: 'Schedule management with time selection'
      },
      {
        url: 'http://localhost:3000/epg',
        name: '08-epg-export.png',
        description: 'EPG export and hosted URL management'
      }
    ];

    this.adminScreenshots = [
      {
        url: 'http://localhost:3000/admin',
        name: '09-admin-panel.png',
        description: 'Admin panel with user management'
      }
    ];
  }

  async init() {
    console.log('🚀 Starting EPG Manager screenshot capture...\n');
    
    // Create screenshots directory
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
      console.log('📁 Created screenshots directory');
    }

    const browser = await puppeteer.launch({
      headless: false, // Set to true for headless mode
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      // Capture unauthenticated screenshots
      await this.captureUnauthenticated(page);

      // Capture authenticated screenshots (client)
      await this.captureAuthenticated(page, 'demo@example.com', 'password');

      // Capture admin screenshots
      await this.captureAuthenticated(page, 'admin@example.com', 'admin123', true);

      console.log('\n🎉 All screenshots captured successfully!');
      console.log('📁 Screenshots saved in: ./screenshots/');
      console.log('🔗 Ready to upload to GitHub!');

    } catch (error) {
      console.error('❌ Error during screenshot capture:', error);
    } finally {
      await browser.close();
    }
  }

  async captureUnauthenticated(page) {
    console.log('📸 Capturing unauthenticated pages...');
    
    for (const screenshot of this.screenshots) {
      try {
        console.log(`  📍 Capturing: ${screenshot.description}`);
        
        await page.goto(screenshot.url, { 
          waitUntil: 'networkidle2',
          timeout: 10000 
        });

        // Wait for content to load
        await page.waitForTimeout(2000);

        await page.screenshot({
          path: path.join('screenshots', screenshot.name),
          fullPage: true
        });

        console.log(`    ✅ Saved: ${screenshot.name}`);
      } catch (error) {
        console.error(`    ❌ Error capturing ${screenshot.name}:`, error.message);
      }
    }
  }

  async captureAuthenticated(page, email, password, isAdmin = false) {
    const userType = isAdmin ? 'admin' : 'client';
    const screenshots = isAdmin ? this.adminScreenshots : this.authenticatedScreenshots;
    
    console.log(`\n🔐 Capturing ${userType} authenticated pages...`);
    console.log(`  👤 Logging in as: ${email}`);

    try {
      // Login
      await page.goto('http://localhost:3000/auth/signin', { 
        waitUntil: 'networkidle2' 
      });

      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.type('input[type="email"]', email);
      await page.type('input[type="password"]', password);
      
      await page.click('button[type="submit"]');
      
      // Wait for navigation to complete
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      
      console.log(`    ✅ Successfully logged in as ${userType}`);

      // Capture authenticated screenshots
      for (const screenshot of screenshots) {
        try {
          console.log(`  📍 Capturing: ${screenshot.description}`);
          
          await page.goto(screenshot.url, { 
            waitUntil: 'networkidle2',
            timeout: 10000 
          });

          // Wait for content to load
          await page.waitForTimeout(2000);

          // Special handling for pages with dynamic content
          if (screenshot.url.includes('channels') || screenshot.url.includes('programs')) {
            await page.waitForSelector('table', { timeout: 5000 });
          }

          await page.screenshot({
            path: path.join('screenshots', screenshot.name),
            fullPage: true
          });

          console.log(`    ✅ Saved: ${screenshot.name}`);
        } catch (error) {
          console.error(`    ❌ Error capturing ${screenshot.name}:`, error.message);
        }
      }

      // Logout
      await page.click('button:has-text("Sign Out")');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log(`    ✅ Logged out ${userType}`);

    } catch (error) {
      console.error(`    ❌ Error during ${userType} authentication:`, error.message);
    }
  }

  async createScreenshotsReadme() {
    const readmeContent = `# EPG Manager Interface Screenshots

This directory contains screenshots of the EPG Manager user interface.

## Screenshots Overview

| Screenshot | Description |
|------------|-------------|
${[...this.screenshots, ...this.authenticatedScreenshots, ...this.adminScreenshots].map(s => 
  `| ${s.name} | ${s.description} |`
).join('\n')}

## Features Demonstrated

### User Experience
- Clean, modern interface design
- Responsive layout for all devices
- Intuitive navigation and user flow
- Comprehensive form validation

### Core Functionality
- Channel management with full CRUD operations
- Program scheduling with time validation
- EPG export in XMLTV format
- Hosted EPG URLs for distributors

### Administrative Features
- User management and statistics
- Role-based access control
- System-wide metrics and monitoring

## Technical Implementation

- **Framework**: Next.js 15 with TypeScript
- **UI**: shadcn/ui components with Tailwind CSS
- **Authentication**: NextAuth.js with JWT sessions
- **Database**: Prisma ORM with SQLite
- **API**: RESTful endpoints with proper validation

## Usage

These screenshots demonstrate the complete EPG Manager system and can be used for:
- Documentation and presentations
- User onboarding and training
- Marketing and promotional materials
- Development reference and testing

---

*Generated automatically by screenshot capture script*
`;

    fs.writeFileSync(path.join('screenshots', 'README.md'), readmeContent);
    console.log('📝 Created screenshots/README.md');
  }
}

// Run the screenshot capture
const screenshotApp = new EPGManagerScreenshot();
screenshotApp.init().then(() => {
  console.log('\n🎯 Screenshot capture process completed!');
}).catch(error => {
  console.error('💥 Fatal error:', error);
});