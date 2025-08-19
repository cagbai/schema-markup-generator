# Azumo - Schema Markup Generator

A comprehensive web application for analyzing existing schema markup and generating new structured data for websites. This tool helps SEO professionals and developers manage schema.org markup efficiently.

## 🌐 Live Demo
**Production URL**: https://ai-schema.azumo.com  
**Alternative URL**: https://schema-markup-generator-three.vercel.app

## 📋 Features

### 1. Schema Analysis
**Detect and review existing schema on any website:**
- Automatically finds all JSON-LD, Microdata, and RDFa schemas
- Displays top-level `@type` for easy human review
- Shows total count of schema blocks found
- Expandable full JSON view for detailed inspection
- One-click copy for existing schemas
- Color-coded badges for schema types

### 2. Schema Generation
**Create new structured data markup:**
- **5 Schema Types Supported:**
  - **Product** - For products, services, or offerings
  - **Breadcrumb** - For navigation hierarchy
  - **Carousel (ItemList)** - For lists, galleries, or collections
  - **FAQ** - For frequently asked questions
  - **Review** - For ratings and reviews

### 3. Intelligent Content Extraction
**Automatic website analysis extracts:**
- Page titles and meta descriptions
- Product information and pricing patterns
- FAQ questions and answers
- Breadcrumb navigation (from HTML or URL structure)
- Service/product lists for carousels
- HTML entity decoding for clean output

### 4. Manual Data Entry
**Complete control over schema data:**
- Edit extracted data before generation
- Add missing information
- Create schema from scratch without website analysis
- Dynamic forms for each schema type
- Real-time preview of generated markup

## 🆕 Recent Updates

### December 2024 Release
- **Improved UI Layout**: Main working areas (Generated Schema & Data Editor) now appear prominently at the top
- **Enhanced Analysis**: Fixed production analysis for all websites including JavaScript-heavy sites
- **Custom Domain**: Now available at ai-schema.azumo.com
- **Brand Identity**: Added Azumo logo to the header
- **Better Error Handling**: Clearer messages when websites block automated requests
- **Performance**: Optimized API endpoint routing for faster analysis

## 🚀 How to Use

### Basic Workflow

1. **Enter Website URL** (Optional)
   - Input the URL you want to analyze
   - Or skip this to manually enter all data

2. **Select Schema Types**
   - Click schema type buttons to turn them blue (selected)
   - You can select multiple types to generate at once

3. **Analyze Website** (If URL provided)
   - Click "Analyze" to fetch and extract content
   - Review existing schemas found on the page
   - See extracted data populate in forms

4. **Edit Data**
   - Use the Data Editor on the right
   - Select a schema type from dropdown
   - Fill in or modify extracted information
   - Add multiple items for lists (FAQ, Breadcrumb, Carousel)

5. **Generate Schema**
   - Click "Generate Schema" button
   - Review the generated JSON-LD markup
   - Copy to clipboard with one click

6. **Implement**
   - Paste the generated schema into your website's HTML
   - Place it in the `<head>` or `<body>` section
   - Test with Google's Rich Results Test

## 🎯 Use Cases

### For Existing Pages
1. Analyze what schemas are already implemented
2. Identify missing schema opportunities
3. Generate additional schemas to complement existing ones

### For New Pages
1. Generate complete schema markup from scratch
2. Use URL analysis to extract basic content
3. Manually add specific details

### For SEO Audits
1. Quickly check schema implementation across pages
2. Identify schema errors or invalid JSON
3. Generate corrected schemas

## 🛠 Technical Details

### Architecture
- **Frontend:** HTML, Tailwind CSS, Vanilla JavaScript
- **Backend:** Node.js server for local development
- **Serverless:** Vercel Functions for production
- **Custom Domain:** Hosted at ai-schema.azumo.com via Vercel
- **DNS:** Managed through Cloudflare
- **No database required** - Stateless operation

### Deployment Options

#### Local Development
```bash
# Clone the repository
git clone https://github.com/cagbai/schema-markup-generator.git

# Navigate to directory
cd schema-markup-generator

# Start local server
node server.js

# Open browser to http://localhost:3000
```

#### Production (Vercel)
- Automatically deploys from GitHub repository
- Serverless functions handle website analysis
- Global CDN for fast access
- Custom domain: ai-schema.azumo.com
- SSL certificate automatically provisioned

### API Endpoints

- **`/analyze`** (Local) or **`/api/analyze`** (Production)
  - POST request with `{ url: string, types: string[] }`
  - Returns extracted data and existing schemas

## 📊 Schema Types Explained

### Product Schema
- Name, description, brand
- Price and currency
- Availability status
- Images and SKU
- Ratings and review count

### Breadcrumb Schema
- Hierarchical navigation path
- Multiple levels supported
- Auto-generated from URL structure

### Carousel/ItemList Schema
- For any collection of items
- Supports products, articles, services
- Position tracking for each item

### FAQ Schema
- Question and answer pairs
- Unlimited FAQ items
- Helps with FAQ rich snippets

### Review Schema
- Item being reviewed
- Rating values (1-5 scale)
- Review author and body
- Aggregate ratings support

## 🔍 Existing Schema Detection

The app detects three types of structured data:

1. **JSON-LD** (Recommended by Google)
   - Full parsing and display
   - Shows all `@type` values
   - Validates JSON structure

2. **Microdata** (HTML attributes)
   - Basic detection
   - Shows element count

3. **RDFa** (Resource Description Framework)
   - Basic detection
   - Shows element count

## ⚠️ Limitations

- **Website Analysis:**
  - Some websites block automated requests
  - JavaScript-rendered content may not be captured
  - Complex SPAs might need manual data entry

- **Schema Generation:**
  - Creates new schemas only (doesn't modify existing)
  - Limited to 5 main schema types
  - Manual verification recommended

## 🤝 Contributing

This is an open-source project. Contributions are welcome!

### To Contribute:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

### Ideas for Improvement:
- Add more schema types (Event, LocalBusiness, etc.)
- Enhance extraction patterns
- Add schema validation
- Create browser extension
- Add bulk URL processing

## 📝 License

MIT License - Free to use and modify

## 🏢 About

Created by [Azumo](https://azumo.com) - A top-rated nearshore software development company specializing in AI, data engineering, and custom software solutions.

## 🆘 Support

For issues or questions:
- Create an issue on [GitHub](https://github.com/cagbai/schema-markup-generator/issues)
- Visit [Azumo.com](https://azumo.com) for professional SEO and development services
- Email: hello@azumo.co

---

**Note:** Always test generated schema with [Google's Rich Results Test](https://search.google.com/test/rich-results) before deploying to production.