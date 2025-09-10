# 📸 Quick Screenshot Guide for EPG Manager

## 🚀 **Immediate Action Required**

To capture screenshots of your EPG Manager interface, follow these steps:

### **Step 1: Ensure Server is Running**
```bash
# Check if server is running
ps aux | grep "tsx server.ts"

# If not running, start it:
npm run dev
```

### **Step 2: Manual Screenshot Capture**

#### **Method 1: Browser Developer Tools (Easiest)**
1. Open your browser and go to `http://localhost:3000`
2. Open Developer Tools (F12 or Ctrl+Shift+I)
3. Go to the "Elements" tab
4. Look for the screenshot/capture tool (usually a camera icon)
5. Select "Capture full page screenshot"
6. Save the image as `01-homepage.png`

#### **Method 2: Operating System Tools**
**Windows:**
- Press `Win + Shift + S` for snipping tool
- Or search for "Snipping Tool" in Start menu

**Mac:**
- Press `Cmd + Shift + 4` to select area
- Press `Cmd + Shift + 3` for full screen

**Linux:**
- Use `gnome-screenshot` or `spectacle`
- Or press `Print Screen` key

### **Step 3: Screenshot Checklist**

Capture these pages in order:

#### **1. Homepage**
- **URL**: `http://localhost:3000`
- **Filename**: `01-homepage.png`
- **What to capture**: Full landing page with hero section

#### **2. Sign In Page**
- **URL**: `http://localhost:3000/auth/signin`
- **Filename**: `02-signin.png`
- **What to capture**: Login form with demo credentials visible

#### **3. Sign Up Page**
- **URL**: `http://localhost:3000/auth/signup`
- **Filename**: `03-signup.png`
- **What to capture**: Registration form

#### **4. Dashboard (Client)**
- **Login**: Use `demo@example.com` / `password`
- **URL**: `http://localhost:3000/dashboard`
- **Filename**: `04-dashboard.png`
- **What to capture**: Dashboard with stats and quick actions

#### **5. Channel Management**
- **URL**: `http://localhost:3000/channels`
- **Filename**: `05-channels.png`
- **What to capture**: Channels list, try to show the "Add Channel" dialog

#### **6. Program Management**
- **URL**: `http://localhost:3000/programs`
- **Filename**: `06-programs.png`
- **What to capture**: Programs list with copy buttons

#### **7. Schedule Management**
- **URL**: `http://localhost:3000/schedules`
- **Filename**: `07-schedules.png`
- **What to capture**: Schedules list

#### **8. EPG Export**
- **URL**: `http://localhost:3000/epg`
- **Filename**: `08-epg-export.png`
- **What to capture**: EPG export interface

#### **9. Admin Panel**
- **Login**: Use `admin@example.com` / `admin123`
- **URL**: `http://localhost:3000/admin`
- **Filename**: `09-admin-panel.png`
- **What to capture**: Admin dashboard with user management

### **Step 4: Create Screenshots Folder**
```bash
mkdir -p screenshots
```

### **Step 5: Move Screenshots**
Move all captured screenshots to the `screenshots/` folder with the correct filenames.

### **Step 6: Optimize Images (Optional)**
```bash
# If you have ImageMagick installed:
mogrify -resize 1200x -quality 85 screenshots/*.png
```

### **Step 7: Upload to GitHub**
```bash
git add screenshots/
git commit -m "feat: Add interface screenshots

- Add screenshots of all main pages
- Include homepage, authentication, dashboard
- Add channel, program, schedule management screenshots
- Include EPG export and admin panel screenshots

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin master
```

## 🤖 **Automated Option (Advanced)**

If you want to use the automated script:

```bash
# Install dependencies (already done)
npm install puppeteer

# Run automated screenshot capture
npm run screenshots
```

**Note**: The automated script will handle login and navigation automatically, but requires the server to be running.

## 📋 **Final Check**

After capturing screenshots, you should have:
- `screenshots/01-homepage.png` - Landing page
- `screenshots/02-signin.png` - Login form
- `screenshots/03-signup.png` - Registration form
- `screenshots/04-dashboard.png` - Client dashboard
- `screenshots/05-channels.png` - Channel management
- `screenshots/06-programs.png` - Program management
- `screenshots/07-schedules.png` - Schedule management
- `screenshots/08-epg-export.png` - EPG export
- `screenshots/09-admin-panel.png` - Admin panel

## 🎯 **Tips for Great Screenshots**

1. **Use consistent browser size**: 1920x1080 recommended
2. **Clear browser cache**: Ensure fresh content
3. **Wait for loading**: Make sure all content is loaded
4. **Include full page**: Show navigation and footer when relevant
5. **Good lighting**: Ensure the interface is clearly visible

## 📞 **Need Help?**

If you encounter any issues:
1. Check that the development server is running on port 3000
2. Verify the demo credentials are working
3. Ensure all pages load properly before capturing
4. Check browser console for any errors

---

**Your EPG Manager is ready for screenshots!** 🚀