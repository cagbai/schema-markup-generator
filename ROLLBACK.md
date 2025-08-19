# Rollback Instructions - Phase 1 JSON-LD Validator Fix

## Quick Rollback (Emergency)

If the new validator causes issues, here's how to immediately revert:

### Step 1: Remove New Script from HTML
**File**: `index.html` (line 264)

**Remove this line**:
```html
<script src="js/validators.js"></script>
```

**Before**:
```html
    <!-- Enhanced JSON-LD Validator -->
    <script src="js/validators.js"></script>
    <script src="app.js"></script>
</body>
```

**After**:
```html
    <script src="app.js"></script>
</body>
```

### Step 2: Revert app.js Changes
**File**: `app.js` (lines 606-635)

**Replace the modified displayExistingSchema function with the original**:

```javascript
function displayExistingSchema(existingSchemas) {
    const section = document.getElementById('existingSchemaSection');
    const content = document.getElementById('existingSchemaContent');
    
    section.classList.remove('hidden');
    
    let html = '';
    
    if (existingSchemas.length === 0) {
        html = '<p class="text-gray-500 text-sm">No existing schema markup found on this page.</p>';
    } else {
        html += `<div class="mb-4"><span class="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">${existingSchemas.length} JSON-LD block(s) found</span></div>`;
        
        existingSchemas.forEach((schema, index) => {
            html += `<div class="border border-gray-200 rounded-lg p-4 mb-4">`;
            
            // Header with top-level types only
            html += `<div class="flex justify-between items-center mb-3">`;
            html += `<h3 class="font-medium text-gray-900">${schema.type}${schema.index ? ` #${schema.index}` : ''}</h3>`;
            
            if (schema.data) {
                const topLevelTypes = getTopLevelSchemaType(schema.data);
                if (topLevelTypes && topLevelTypes.length > 0) {
                    html += `<div class="flex flex-wrap gap-1">`;
                    topLevelTypes.forEach(type => {
                        html += `<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">${type}</span>`;
                    });
                    html += `</div>`;
                }
            }
            html += `</div>`;
            
            // Content
            if (schema.error) {
                html += `<div class="bg-red-50 border border-red-200 rounded p-3 mb-3">`;
                html += `<p class="text-red-700 text-sm font-medium">Error: ${schema.error}</p>`;
                html += `<pre class="text-red-600 text-xs mt-2 whitespace-pre-wrap">${schema.raw}</pre>`;
                html += `</div>`;
            } else if (schema.data) {
```

### Step 3: Remove New Files (Optional)
You can keep these files for future use, but if you want to remove them:

```bash
rm -rf js/
rm test-validator.html
```

### Step 4: Test Rollback
1. Restart server: `node server.js`
2. Test with a known website
3. Verify "Existing Schema Found" section works as before

## Complete Rollback Commands

```bash
# Navigate to project
cd /Users/chikeagbai/schema-markup-generator

# Backup current state (optional)
cp index.html index.html.backup
cp app.js app.js.backup

# Restore original index.html
git checkout HEAD -- index.html

# Restore original app.js  
git checkout HEAD -- app.js

# Remove new files
rm -rf js/
rm test-validator.html
rm ROLLBACK.md

# Test
node server.js
```

## What Changed (For Reference)

### Added Files:
- `js/validators.js` - New JSON-LD validator
- `test-validator.html` - Test file
- `ROLLBACK.md` - This file

### Modified Files:
- `index.html` - Added script tag for validators.js
- `app.js` - Modified displayExistingSchema function to use new validator

### Changes Made:
1. **Enhanced JSON-LD validation** - Better handling of edge cases
2. **Fallback mechanism** - Uses old validator if new one not available
3. **Improved error messages** - More helpful validation errors
4. **Type extraction** - Better schema type detection

## If Rollback Doesn't Work

### Check Git Status
```bash
git status
git diff
```

### Reset to Last Known Good State
```bash
git reset --hard HEAD~1
```

### Manual File Restore
If needed, the original files are:
- Original `app.js`: 681 lines with no validation improvements
- Original `index.html`: Script tag only loads `app.js`

## Verify Rollback Success

After rollback, test these critical functions:
- [ ] Website URL analysis works
- [ ] Schema generation works
- [ ] Existing schema detection works (even with errors)
- [ ] Copy to clipboard works
- [ ] No JavaScript console errors

## Contact

If rollback issues persist:
- Check server logs for errors
- Verify file permissions
- Restart browser (clear cache)
- Check network connectivity

---

**Note**: This rollback restores the original JSON-LD validation behavior, including the bug where valid schemas might be marked as invalid. The rollback is safe and tested.