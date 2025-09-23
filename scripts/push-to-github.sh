#!/bin/bash

# EPG Manager - GitHub Push Script
# Ultimate News Web Media Production Pvt Ltd

set -e

echo "🚀 EPG Manager - GitHub Push Script"
echo "==================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run this from the project root."
    exit 1
fi

# Check git status
echo "📊 Checking git status..."
git status

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit. Repository is up to date."
    exit 0
fi

# Add all changes
echo "📦 Adding all changes..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "feat: Update EPG Manager with latest changes

- Enhanced features and bug fixes
- Updated documentation
- Improved deployment scripts
- Company branding updates

Ultimate News Web Media Production Pvt Ltd
Website: itassist.co.in"

# Check remote configuration
echo "🔗 Checking remote configuration..."
git remote -v

# Push to GitHub
echo "🚀 Pushing to GitHub..."
echo "⚠️  If you get authentication errors, please:"
echo "1. Set up a Personal Access Token"
echo "2. Update remote URL: git remote set-url origin https://shihan84:YOUR_TOKEN@github.com/shihan84/epg-manager.git"
echo "3. Or use GitHub CLI: gh auth login"
echo ""

# Try to push
if git push origin master; then
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 Repository: https://github.com/shihan84/epg-manager"
    echo "📧 For support: info@itassist.co.in"
else
    echo "❌ Push failed. Please check authentication."
    echo "📖 See GITHUB_SETUP.md for detailed instructions"
    echo ""
    echo "Quick setup:"
    echo "1. Get Personal Access Token from GitHub"
    echo "2. Run: git remote set-url origin https://shihan84:YOUR_TOKEN@github.com/shihan84/epg-manager.git"
    echo "3. Run this script again"
fi
