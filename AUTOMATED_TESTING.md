# Automated Testing Setup (Puppeteer)

## Overview
Create a SEPARATE testing project that doesn't affect the production app's zero-dependency nature.

## Project Structure
```
schema-markup-generator/          # Main app (no changes)
├── app.js
├── index.html
├── server.js
└── ...

schema-markup-generator-tests/    # Separate test project
├── package.json
├── tests/
│   ├── visual-regression.test.js
│   ├── functionality.test.js
│   └── json-ld-validation.test.js
├── screenshots/
│   └── baseline/
└── test-server.js
```

## Quick Setup

### 1. Create Test Project
```bash
# In parent directory
mkdir schema-markup-generator-tests
cd schema-markup-generator-tests
npm init -y
npm install --save-dev puppeteer jest jest-puppeteer
```

### 2. Basic Test Configuration
**package.json**:
```json
{
  "scripts": {
    "test": "jest",
    "test:visual": "jest visual-regression",
    "test:functional": "jest functionality"
  },
  "jest": {
    "preset": "jest-puppeteer",
    "testTimeout": 30000
  }
}
```

### 3. Core Test Suite

**tests/functionality.test.js**:
```javascript
const LOCAL_URL = 'http://localhost:3000';
const PROD_URL = 'https://ai-schema.azumo.com';

describe('Schema Generator Functionality', () => {
  let page;
  
  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto(LOCAL_URL);
  });

  afterAll(async () => {
    await page.close();
  });

  describe('Schema Type Selection', () => {
    test('should toggle schema type buttons', async () => {
      // Click product button
      await page.click('[data-type="product"]');
      
      // Check if button has active class
      const hasActiveClass = await page.$eval(
        '[data-type="product"]',
        el => el.classList.contains('bg-blue-600')
      );
      
      expect(hasActiveClass).toBe(true);
    });

    test('should allow multiple selections', async () => {
      await page.click('[data-type="product"]');
      await page.click('[data-type="faq"]');
      
      const activeButtons = await page.$$eval(
        '.bg-blue-600',
        buttons => buttons.length
      );
      
      expect(activeButtons).toBeGreaterThanOrEqual(2);
    });
  });

  describe('URL Analysis', () => {
    test('should analyze valid URL', async () => {
      await page.type('#urlInput', 'https://example.com');
      await page.click('#analyzeBtn');
      
      // Wait for loader to appear and disappear
      await page.waitForSelector('#loader:not(.hidden)', { timeout: 5000 });
      await page.waitForSelector('#loader.hidden', { timeout: 10000 });
      
      // Check for success or error message
      const statusVisible = await page.$eval(
        '#statusMessage',
        el => !el.classList.contains('hidden')
      );
      
      expect(statusVisible).toBe(true);
    });

    test('should auto-add https to URLs', async () => {
      await page.evaluate(() => {
        document.getElementById('urlInput').value = '';
      });
      
      await page.type('#urlInput', 'example.com');
      await page.click('#analyzeBtn');
      
      const urlValue = await page.$eval('#urlInput', el => el.value);
      expect(urlValue).toBe('https://example.com');
    });
  });

  describe('Schema Generation', () => {
    test('should generate product schema', async () => {
      // Select product type
      await page.click('[data-type="product"]');
      
      // Fill in form
      await page.select('#schemaTypeSelect', 'product');
      await page.waitForSelector('#productName');
      
      await page.type('#productName', 'Test Product');
      await page.type('#productPrice', '99.99');
      
      // Generate schema
      await page.click('button:has-text("Generate Schema")');
      
      // Check output
      const schemaText = await page.$eval('#schemaCode', el => el.textContent);
      expect(schemaText).toContain('"@type": "Product"');
      expect(schemaText).toContain('"name": "Test Product"');
    });
  });

  describe('JSON-LD Validation Fix', () => {
    test('should correctly validate valid JSON-LD', async () => {
      // This tests the specific bug you mentioned
      const validJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Valid Product"
      };
      
      // Inject test function if your fix is implemented
      const result = await page.evaluate((json) => {
        if (window.validateJsonLd) {
          return window.validateJsonLd(JSON.stringify(json));
        }
        return { valid: false, error: 'Function not found' };
      }, validJsonLd);
      
      expect(result.valid).toBe(true);
    });
  });
});
```

**tests/visual-regression.test.js**:
```javascript
describe('Visual Regression Tests', () => {
  let page;
  
  beforeAll(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
  });

  test('homepage layout', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('#analyzeBtn');
    
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: 'homepage-desktop'
    });
  });

  test('mobile layout', async () => {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    
    const screenshot = await page.screenshot({ fullPage: true });
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: 'homepage-mobile'
    });
  });

  test('schema generation output', async () => {
    await page.goto('http://localhost:3000');
    await page.click('[data-type="product"]');
    await page.click('button:has-text("Generate Schema")');
    
    await page.waitForTimeout(500); // Wait for render
    
    const outputArea = await page.$('#schemaCode');
    const screenshot = await outputArea.screenshot();
    expect(screenshot).toMatchImageSnapshot({
      customSnapshotIdentifier: 'schema-output'
    });
  });
});
```

### 4. Critical Path Test
**tests/critical-paths.test.js**:
```javascript
describe('Critical User Paths', () => {
  test('Complete E2E: Analyze and Generate', async () => {
    const page = await browser.newPage();
    
    // 1. Go to site
    await page.goto('http://localhost:3000');
    
    // 2. Select schema types
    await page.click('[data-type="product"]');
    await page.click('[data-type="breadcrumb"]');
    
    // 3. Analyze a website
    await page.type('#urlInput', 'https://example.com');
    await page.click('#analyzeBtn');
    
    // 4. Wait for analysis
    await page.waitForSelector('#loader.hidden', { timeout: 10000 });
    
    // 5. Generate schema
    await page.click('button:has-text("Generate Schema")');
    
    // 6. Copy schema
    await page.click('button:has-text("Copy")');
    
    // 7. Verify clipboard (if possible in test environment)
    const schemaText = await page.$eval('#schemaCode', el => el.textContent);
    expect(schemaText).toContain('@context');
    expect(schemaText).toContain('@type');
    
    await page.close();
  });
});
```

### 5. Run Tests Before Deployment

**Pre-deployment script**:
```bash
#!/bin/bash
# run-tests.sh

echo "Starting local server..."
cd ../schema-markup-generator
node server.js &
SERVER_PID=$!

echo "Waiting for server..."
sleep 3

echo "Running tests..."
cd ../schema-markup-generator-tests
npm test

TEST_RESULT=$?

echo "Stopping server..."
kill $SERVER_PID

if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ All tests passed! Safe to deploy."
else
  echo "❌ Tests failed! Do not deploy."
  exit 1
fi
```

## GitHub Actions Integration

**.github/workflows/test.yml**:
```yaml
name: Test Schema Generator

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install test dependencies
      run: |
        mkdir tests
        cd tests
        npm init -y
        npm install puppeteer jest jest-puppeteer
    
    - name: Start server
      run: |
        node server.js &
        sleep 5
    
    - name: Run tests
      run: |
        cd tests
        npm test
    
    - name: Upload screenshots on failure
      if: failure()
      uses: actions/upload-artifact@v2
      with:
        name: test-screenshots
        path: tests/screenshots/
```

## Benefits of This Approach

1. **Zero impact on production code** - Tests are completely separate
2. **Automated regression detection** - Catch breaks before deploy
3. **Visual testing** - See layout changes
4. **CI/CD ready** - Integrate with GitHub Actions
5. **No dependencies in main app** - Keep it simple

## When to Run Tests

- Before every deployment
- After any code changes
- Nightly automated runs
- On pull requests

## What This Catches

- Layout breaks
- JavaScript errors
- Form submission issues
- Schema generation bugs
- Cross-browser issues
- Mobile responsiveness
- The JSON-LD validation bug you mentioned

---

**Note**: This testing setup is OPTIONAL. Your app works fine without it. But if you plan to make regular updates, automated testing will save time and prevent production breaks.