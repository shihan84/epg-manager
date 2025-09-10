# EPG Manager - Screenshot Guide

This guide will help you capture screenshots of the EPG Manager interface and upload them to your GitHub repository.

## 📸 **Screenshot Checklist**

### **1. Home Page**
- **URL**: `http://localhost:3000`
- **What to capture**: Landing page with hero section, features, and CTA
- **Key elements**: Logo, navigation, hero text, feature cards

### **2. Sign In Page**
- **URL**: `http://localhost:3000/auth/signin`
- **What to capture**: Login form with demo credentials
- **Key elements**: Email/password fields, demo credentials info

### **3. Sign Up Page**
- **URL**: `http://localhost:3000/auth/signup`
- **What to capture**: Registration form
- **Key elements**: Name, email, password, company fields

### **4. Dashboard (Client)**
- **URL**: `http://localhost:3000/dashboard` (after login with demo@example.com)
- **What to capture**: Main dashboard with stats and quick actions
- **Key elements**: Welcome message, stats cards, recent schedules, quick action cards

### **5. Channel Management**
- **URL**: `http://localhost:3000/channels`
- **What to capture**: Channels list and add/edit dialog
- **Key elements**: Channels table, action buttons, add channel dialog

### **6. Program Management**
- **URL**: `http://localhost:3000/programs`
- **What to capture**: Programs list with copy functionality
- **Key elements**: Programs table, copy button, add program dialog

### **7. Schedule Management**
- **URL**: `http://localhost:3000/schedules`
- **What to capture**: Schedules list and scheduling form
- **Key elements**: Schedules table, add schedule dialog with channel/program selection

### **8. EPG Export**
- **URL**: `http://localhost:3000/epg`
- **What to capture**: EPG export interface with generated XML
- **Key elements**: Stats cards, generate/download buttons, hosted URL, XML preview

### **9. Admin Panel**
- **URL**: `http://localhost:3000/admin` (after login with admin@example.com)
- **What to capture**: Admin dashboard with user management
- **Key elements**: System stats, user table, user management controls

## 🛠️ **Screenshot Tools**

### **Option 1: Browser Developer Tools (Recommended)**
1. Open Developer Tools (F12 or Ctrl+Shift+I)
2. Use the screenshot tool in the Elements panel
3. Capture full page or selected areas

### **Option 2: Operating System Tools**
- **Windows**: Snipping Tool, Snip & Sketch, or Win + Shift + S
- **Mac**: Cmd + Shift + 4 for screenshot selection
- **Linux**: Screenshot utility or gnome-screenshot

### **Option 3: Browser Extensions**
- **GoFullPage**: Full page screenshots
- **Nimbus Screenshot**: Advanced screenshot features
- **Awesome Screenshot**: Annotation and editing

## 📁 **File Organization**

Create the following folder structure in your repository:
```
epg-manager/
├── screenshots/
│   ├── 01-homepage.png
│   ├── 02-signin.png
│   ├── 03-signup.png
│   ├── 04-dashboard.png
│   ├── 05-channels.png
│   ├── 06-programs.png
│   ├── 07-schedules.png
│   ├── 08-epg-export.png
│   ├── 09-admin-panel.png
│   └── README.md
```

## 🎯 **Screenshot Tips**

### **Best Practices**
1. **Use consistent browser size**: 1920x1080 recommended
2. **Hide browser chrome**: Use full-page screenshots when possible
3. **Good lighting**: Ensure the interface is clearly visible
4. **Focus on key features**: Highlight the main functionality
5. **Include context**: Show navigation and relevant UI elements

### **What to Highlight**
- **Navigation**: Show how users move between sections
- **Forms**: Demonstrate data input and validation
- **Tables**: Show data management capabilities
- **Actions**: Highlight buttons and interactive elements
- **Statistics**: Show dashboard metrics and insights

## 📤 **Upload to GitHub**

### **Step 1: Create Screenshots Folder**
```bash
mkdir -p screenshots
```

### **Step 2: Take Screenshots**
Capture each page listed in the checklist above.

### **Step 3: Optimize Images**
```bash
# Optional: Optimize image sizes
# Install ImageMagick if needed: sudo apt-get install imagemagick
mogrify -resize 1200x -quality 85 screenshots/*.png
```

### **Step 4: Add to Git**
```bash
git add screenshots/
```

### **Step 5: Commit and Push**
```bash
git commit -m "feat: Add interface screenshots

- Add screenshots of all main pages
- Include homepage, authentication, dashboard
- Add channel, program, schedule management screenshots
- Include EPG export and admin panel screenshots
- Optimize images for web display

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin master
```

## 📝 **Create Screenshots README**

Create `screenshots/README.md`:
```markdown
# EPG Manager Interface Screenshots

This directory contains screenshots of the EPG Manager user interface.

## Screenshots Overview

| Screenshot | Description |
|------------|-------------|
| 01-homepage.png | Landing page with hero section and features |
| 02-signin.png | User sign-in form with demo credentials |
| 03-signup.png | User registration form |
| 04-dashboard.png | Main dashboard with statistics and quick actions |
| 05-channels.png | Channel management interface |
| 06-programs.png | Program management with copy functionality |
| 07-schedules.png | Schedule management with time selection |
| 08-epg-export.png | EPG export and hosted URL management |
| 09-admin-panel.png | Admin panel with user management |

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
```

## 🎨 **Alternative: Automated Screenshots**

If you want to automate the screenshot process, you can use Puppeteer:

### **Install Puppeteer**
```bash
npm install puppeteer
```

### **Create Screenshot Script**
```javascript
// screenshot-script.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set viewport size
  await page.setViewport({ width: 1920, height: 1080 });
  
  const screenshots = [
    { url: 'http://localhost:3000', name: '01-homepage.png' },
    { url: 'http://localhost:3000/auth/signin', name: '02-signin.png' },
    { url: 'http://localhost:3000/auth/signup', name: '03-signup.png' },
  ];
  
  // Create screenshots directory
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }
  
  for (const screenshot of screenshots) {
    try {
      await page.goto(screenshot.url, { waitUntil: 'networkidle2' });
      await page.screenshot({
        path: path.join('screenshots', screenshot.name),
        fullPage: true
      });
      console.log(`✅ Captured: ${screenshot.name}`);
    } catch (error) {
      console.error(`❌ Error capturing ${screenshot.name}:`, error.message);
    }
  }
  
  await browser.close();
  console.log('🎉 Screenshot capture complete!');
}

takeScreenshots().catch(console.error);
```

### **Run the Script**
```bash
node screenshot-script.js
```

## 🔗 **Update README**

Add a screenshots section to your main README.md:

```markdown
## 📸 Interface Screenshots

For a visual tour of the EPG Manager interface, check out our [screenshots directory](./screenshots/).

### Key Features Demonstrated
- **User Authentication**: Secure login and registration
- **Dashboard**: Real-time statistics and quick actions
- **Channel Management**: Complete CRUD operations for TV channels
- **Program Scheduling**: Advanced scheduling with validation
- **EPG Export**: XML generation and hosted URLs
- **Admin Panel**: Comprehensive user management
```

---

## 🎯 **Next Steps**

1. **Take screenshots** using the tools mentioned above
2. **Organize them** in the screenshots directory
3. **Optimize** for web display
4. **Upload to GitHub** using the provided commands
5. **Update documentation** with screenshot references

This will provide a complete visual documentation of your EPG Manager system! 🚀