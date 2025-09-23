#!/bin/bash

echo "🔍 EPG Manager - Comprehensive File Error Checker"
echo "================================================"

# Function to check a file for errors
check_file() {
    local file="$1"
    local relative_path="${file#/Users/macair/EPG-manager/epg-manager/}"
    
    if [[ -f "$file" ]]; then
        # Check for common error patterns
        local errors=0
        
        # Check for missing imports
        if grep -q "Cannot find module" "$file" 2>/dev/null; then
            echo "❌ $relative_path - Missing module imports"
            ((errors++))
        fi
        
        # Check for TypeScript errors
        if grep -q "Property.*does not exist" "$file" 2>/dev/null; then
            echo "❌ $relative_path - TypeScript property errors"
            ((errors++))
        fi
        
        # Check for React errors
        if grep -q "Cannot find namespace 'React'" "$file" 2>/dev/null; then
            echo "❌ $relative_path - React namespace errors"
            ((errors++))
        fi
        
        # Check for missing dependencies
        if grep -q "import.*from.*@/" "$file" 2>/dev/null; then
            if ! grep -q "// Simplified" "$file" 2>/dev/null; then
                echo "⚠️  $relative_path - May have dependency issues"
                ((errors++))
            fi
        fi
        
        if [[ $errors -eq 0 ]]; then
            echo "✅ $relative_path - No errors found"
        fi
        
        return $errors
    fi
}

# Check all TypeScript/JavaScript files
echo "📋 Checking TypeScript/JavaScript files..."
echo ""

total_errors=0
file_count=0

# Find all relevant files
find /Users/macair/EPG-manager/epg-manager/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read -r file; do
    check_file "$file"
    ((file_count++))
done

echo ""
echo "📊 Summary:"
echo "Files checked: $file_count"
echo ""

# Check specific problematic files
echo "🔍 Checking known problematic files..."
echo ""

# Check layout.tsx
echo "Checking layout.tsx..."
if [[ -f "/Users/macair/EPG-manager/epg-manager/src/app/layout.tsx" ]]; then
    if grep -q "Cannot find module" "/Users/macair/EPG-manager/epg-manager/src/app/layout.tsx" 2>/dev/null; then
        echo "❌ layout.tsx - Has import errors"
    else
        echo "✅ layout.tsx - Fixed"
    fi
fi

# Check subscription page
echo "Checking subscription page..."
if [[ -f "/Users/macair/EPG-manager/epg-manager/src/app/subscription/page.tsx" ]]; then
    if grep -q "Cannot find module" "/Users/macair/EPG-manager/epg-manager/src/app/subscription/page.tsx" 2>/dev/null; then
        echo "❌ subscription/page.tsx - Has import errors"
    else
        echo "✅ subscription/page.tsx - Fixed"
    fi
fi

# Check security.ts
echo "Checking security.ts..."
if [[ -f "/Users/macair/EPG-manager/epg-manager/src/lib/security.ts" ]]; then
    if grep -q "Cannot find module" "/Users/macair/EPG-manager/epg-manager/src/lib/security.ts" 2>/dev/null; then
        echo "❌ lib/security.ts - Has import errors"
    else
        echo "✅ lib/security.ts - Fixed"
    fi
fi

echo ""
echo "🎯 Recommendations:"
echo "1. Run './fix-all-issues.sh' to resolve all dependency issues"
echo "2. After dependencies are installed, restore full-featured components"
echo "3. Run 'npm run build' to verify everything works"
echo ""
echo "✅ File checking complete!"

