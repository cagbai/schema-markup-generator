# Schema Markup Generator

A local web application for generating structured data (schema markup) for your website pages.

## Features

- **Website Analysis**: Enter a URL to automatically extract content and generate schema
- **Multiple Schema Types**:
  - Product Snippets
  - Breadcrumbs
  - Carousels
  - FAQ
  - Review Snippets
- **Manual Data Entry**: Edit and add missing information through intuitive forms
- **Live Preview**: See your generated schema markup in real-time
- **Copy to Clipboard**: Easy one-click copy of generated schema

## Installation & Usage

1. Navigate to the project directory:
```bash
cd schema-markup-generator
```

2. Start the server:
```bash
node server.js
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

## How to Use

1. **Enter Website URL**: Input the URL of the page you want to analyze
2. **Select Schema Types**: Choose which types of schema you want to generate
3. **Click "Analyze Website"**: The app will fetch and parse the website content
4. **Edit Data**: Use the manual input forms to add or modify extracted data
5. **Generate Schema**: Click "Generate Schema" to create the structured data
6. **Copy Schema**: Use the "Copy" button to copy the generated markup to your clipboard

## Schema Types Supported

### Product Schema
- Product name, description, brand
- Pricing and availability
- Ratings and reviews
- SKU and images

### Breadcrumb Schema
- Hierarchical navigation structure
- Multiple breadcrumb items with names and URLs

### Carousel Schema
- List of items (products, articles, etc.)
- Each item can have name, URL, image, description, and price

### FAQ Schema
- Question and answer pairs
- Supports multiple FAQ items

### Review Schema
- Item being reviewed
- Rating values and review count
- Author information and review body

## Notes

- The automatic extraction works best with well-structured HTML
- You can manually input all data without website analysis
- Generated schema follows Google's structured data guidelines
- Test your schema with Google's Rich Results Test tool

## Requirements

- Node.js installed on your system
- Modern web browser (Chrome, Firefox, Safari, Edge)