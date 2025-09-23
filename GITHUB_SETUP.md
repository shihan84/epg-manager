# GitHub Setup Guide

**EPG Manager - GitHub Repository Setup**  
_Ultimate News Web Media Production Pvt Ltd_

## 🔐 Authentication Setup

Your repository is configured for: `https://github.com/shihan84/epg-manager.git`

### Option 1: Personal Access Token (Recommended)

1. **Create Personal Access Token**
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`, `write:packages`
   - Copy the token (save it securely!)

2. **Configure Git with Token**

   ```bash
   # Set your GitHub username
   git config --global user.name "shihan84"
   git config --global user.email "your-email@example.com"

   # Use token for authentication
   git remote set-url origin https://shihan84:YOUR_TOKEN@github.com/shihan84/epg-manager.git
   ```

3. **Push to GitHub**
   ```bash
   git push origin master
   ```

### Option 2: SSH Key (Alternative)

1. **Generate SSH Key**

   ```bash
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```

2. **Add to GitHub**
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to GitHub → Settings → SSH and GPG keys → New SSH key
   - Paste the key

3. **Update Remote URL**

   ```bash
   git remote set-url origin git@github.com:shihan84/epg-manager.git
   ```

4. **Push to GitHub**
   ```bash
   git push origin master
   ```

### Option 3: GitHub CLI (Easiest)

1. **Install GitHub CLI**

   ```bash
   # macOS
   brew install gh

   # Or download from: https://cli.github.com/
   ```

2. **Authenticate**

   ```bash
   gh auth login
   ```

3. **Push to GitHub**
   ```bash
   git push origin master
   ```

## 🚀 Quick Push Commands

After setting up authentication, run:

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub
git push origin master
```

## 📋 Current Repository Status

- **Repository**: `shihan84/epg-manager`
- **Branch**: `master`
- **Status**: Ready to push (136 files changed)
- **Last Commit**: Complete EPG Manager v1.0.0

## 🔧 Troubleshooting

### Authentication Error

```bash
# Check current remote
git remote -v

# Update with token
git remote set-url origin https://shihan84:YOUR_TOKEN@github.com/shihan84/epg-manager.git
```

### Permission Denied

- Make sure you have write access to the repository
- Check if the token has correct permissions
- Verify your GitHub username is correct

### Large Files

```bash
# If you have large files, use Git LFS
git lfs track "*.db"
git add .gitattributes
git commit -m "Add LFS tracking"
```

## 📞 Support

- **Email**: info@itassist.co.in
- **Website**: https://itassist.co.in
- **GitHub**: https://github.com/shihan84/epg-manager

---

**Ultimate News Web Media Production Pvt Ltd**  
© 2024 All Rights Reserved
