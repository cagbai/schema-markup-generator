# Schema Markup Generator - Testing Documentation

## Manual Testing Protocol

Since there's no automated test suite, follow this manual testing checklist for any changes.

## Pre-Deployment Testing Checklist

### 1. Basic Functionality Tests

#### Schema Type Selection
- [ ] Click each schema type button - should toggle blue/white
- [ ] Verify multiple types can be selected simultaneously
- [ ] Deselecting all types shows error message when generating

#### URL Analysis
- [ ] Test with valid HTTPS URL (e.g., https://example.com)
- [ ] Test with HTTP URL - should auto-upgrade to HTTPS
- [ ] Test with URL without protocol - should add https://
- [ ] Test with invalid URL - should show error
- [ ] Test with blocking website - should show graceful error

### 2. Schema Generation Tests

#### Product Schema
```
Test Data:
- Name: "Test Product"
- Description: "This is a test product"
- Price: 99.99
- Currency: USD
- Brand: "Test Brand"
- SKU: "TEST123"
- Availability: In Stock
- Rating: 4.5
- Review Count: 10
```
- [ ] Generate with all fields
- [ ] Generate with only required fields
- [ ] Verify JSON-LD is valid

#### Breadcrumb Schema
```
Test Data:
- Item 1: Home | /
- Item 2: Products | /products
- Item 3: Electronics | /products/electronics
```
- [ ] Add multiple breadcrumb items
- [ ] Remove breadcrumb items
- [ ] Generate with 1 item
- [ ] Generate with 5+ items

#### FAQ Schema
```
Test Data:
- Q1: "What is this?" | A1: "This is a test"
- Q2: "How does it work?" | A2: "It works well"
```
- [ ] Add multiple FAQ items
- [ ] Remove FAQ items
- [ ] Test with special characters in questions/answers

#### Carousel Schema
```
Test Data:
- Item 1: Product A | https://example.com/a | $10
- Item 2: Product B | https://example.com/b | $20
```
- [ ] Add multiple carousel items
- [ ] Test with/without prices
- [ ] Test with/without images

#### Review Schema
```
Test Data:
- Item Name: "Test Product"
- Rating: 4.5
- Review Count: 100
- Author: "John Doe"
- Review Body: "Great product!"
```
- [ ] Generate with all fields
- [ ] Generate with minimal fields

### 3. Data Flow Tests

#### Extraction to Manual Edit Flow
1. [ ] Analyze a website
2. [ ] Verify data populates in forms
3. [ ] Edit the extracted data
4. [ ] Generate schema with edited data
5. [ ] Verify changes are reflected

#### Manual Entry Flow
1. [ ] Don't analyze any website
2. [ ] Select schema type from dropdown
3. [ ] Fill in form manually
4. [ ] Generate schema
5. [ ] Verify output matches input

### 4. Existing Schema Detection Tests

Test with these URLs known to have schema:
- [ ] https://www.amazon.com (Product schemas)
- [ ] https://www.wikipedia.org (Multiple schemas)
- [ ] https://schema.org (Meta!)

Verify:
- [ ] JSON-LD blocks are detected
- [ ] Count is accurate
- [ ] "View Full Schema" toggle works
- [ ] Copy button works for existing schemas

### 5. Edge Cases

#### Empty/Null Data
- [ ] Generate schema with no data entered
- [ ] Generate with partial data
- [ ] Clear all fields and regenerate

#### Special Characters
- [ ] Test with quotes in text: "Test's "Quote""
- [ ] Test with HTML entities: &amp; &lt; &gt;
- [ ] Test with Unicode: émojis 😀, accents é

#### Large Data
- [ ] Add 20+ FAQ items
- [ ] Add 20+ breadcrumb items
- [ ] Very long descriptions (500+ chars)

### 6. UI/UX Tests

#### Responsive Design
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)

#### User Feedback
- [ ] Success messages appear and auto-hide
- [ ] Error messages are clear and actionable
- [ ] Loading spinner shows during analysis
- [ ] Buttons disable during operations

#### Copy Functionality
- [ ] Copy generated schema
- [ ] Copy existing schema
- [ ] Verify clipboard contains correct data

### 7. Browser Compatibility

Test in each browser:
- [ ] Chrome (Latest)
- [ ] Firefox (Latest)
- [ ] Safari (Latest)
- [ ] Edge (Latest)

For each browser verify:
- [ ] All features work
- [ ] No console errors
- [ ] Styling is correct

### 8. Performance Tests

#### Load Times
- [ ] Page loads in < 2 seconds
- [ ] Analysis completes in < 5 seconds
- [ ] Schema generates instantly (< 100ms)

#### Memory Usage
- [ ] No memory leaks after multiple operations
- [ ] Can handle 50+ operations without refresh

### 9. Network Tests

#### Offline Behavior
- [ ] Load page while online
- [ ] Go offline
- [ ] Try to analyze URL - should show error
- [ ] Manual entry should still work

#### Slow Network
- [ ] Throttle to 3G speed
- [ ] Analysis should timeout gracefully
- [ ] UI remains responsive

## Regression Test Scenarios

After any code change, test these critical paths:

### Scenario 1: E-commerce Site
1. Enter URL: https://www.example-shop.com
2. Select: Product, Breadcrumb, FAQ
3. Analyze
4. Edit product price
5. Generate schema
6. Copy and validate at https://validator.schema.org

### Scenario 2: Blog/Content Site
1. Enter URL: https://www.example-blog.com
2. Select: Breadcrumb, FAQ
3. Analyze
4. Add 2 more FAQ items manually
5. Generate schema
6. Verify all FAQs included

### Scenario 3: Service Website
1. No URL analysis
2. Select: Review, FAQ
3. Manually enter all data
4. Generate schema
5. Clear all, regenerate (should be empty)

## Known Issues to Verify

### JSON-LD Validation Issue
Test with sites that have valid JSON-LD:
1. [ ] Should show as valid in existing schema
2. [ ] Should parse without errors
3. [ ] Should display schema types correctly

### Common Failure Points
- [ ] Sites with gzip compression
- [ ] Sites with redirects
- [ ] Sites with CSP headers
- [ ] Single-page applications

## Test Data URLs

### Good Test Sites
- https://jsonld.com/example/ (Has examples)
- https://developers.google.com (Complex schemas)
- https://www.apple.com (Product schemas)

### Problematic Sites (Should handle gracefully)
- Sites behind auth
- Sites with rate limiting
- Sites blocking bots

## Validation Tools

After generating schema, validate at:
1. https://validator.schema.org/
2. https://search.google.com/test/rich-results
3. https://jsonlint.com/ (for JSON syntax)

## Bug Report Template

When finding issues, document:
```
**Issue**: [Brief description]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
**Expected**: [What should happen]
**Actual**: [What actually happens]
**Browser**: [Chrome/Firefox/etc]
**URL Tested**: [If applicable]
**Console Errors**: [Any errors]
```

## Performance Benchmarks

Current benchmarks to maintain:
- First Paint: < 1s
- Time to Interactive: < 2s
- Analysis Time: < 5s (depends on target site)
- Schema Generation: < 100ms
- Memory Usage: < 50MB

---

**Note**: Run through this entire checklist before deploying any changes to production. The app is live and used by real users - breaking changes impact SEO professionals' work.