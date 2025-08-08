let activeSchemaTypes = new Set(); // Start with nothing selected
let extractedData = {};
let manualData = {
    product: {},
    breadcrumb: [],
    carousel: [],
    faq: [],
    review: {}
};

function showStatus(message, type) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-3 text-lg"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.classList.add('hidden')" class="ml-4">
            <i class="fas fa-times"></i>
        </button>
    `;
    statusEl.className = `rounded-lg p-4 flex items-center justify-between transition-all duration-300 ${type}`;
    statusEl.classList.remove('hidden');
    setTimeout(() => {
        statusEl.classList.add('hidden');
    }, 5000);
}

function toggleSchemaType(btn) {
    const type = btn.dataset.type;
    
    if (btn.classList.contains('bg-blue-600')) {
        // Deactivate
        btn.classList.remove('bg-blue-600', 'text-white');
        activeSchemaTypes.delete(type);
    } else {
        // Activate
        btn.classList.add('bg-blue-600', 'text-white');
        activeSchemaTypes.add(type);
    }
}

async function analyzeWebsite() {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        showStatus('Please enter a URL', 'error');
        return;
    }
    
    // Ensure URL has protocol
    let finalUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        finalUrl = 'https://' + url;
        document.getElementById('urlInput').value = finalUrl;
    }

    const loader = document.getElementById('loader');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    loader.classList.remove('hidden');
    analyzeBtn.disabled = true;
    
    // Check if we're in production and the API is failing
    const isProduction = window.location.hostname !== 'localhost';
    
    if (isProduction) {
        // Production: Use client-side extraction only
        showStatus('Analyzing website structure from URL...', 'info');
        
        try {
            // Generate breadcrumbs from URL
            const urlObj = new URL(finalUrl);
            const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
            
            // Extract domain name for title
            const domainName = urlObj.hostname.replace('www.', '').split('.')[0];
            const pageTitle = domainName.charAt(0).toUpperCase() + domainName.slice(1);
            
            // Create basic data from URL
            const data = {
                product: {
                    name: pageTitle + (pathParts.length > 0 ? ' - ' + pathParts[pathParts.length - 1].replace(/-/g, ' ') : ''),
                    description: ''
                },
                breadcrumb: [{
                    name: 'Home',
                    url: urlObj.origin
                }],
                faq: [],
                carousel: [],
                review: {},
                existingSchema: []
            };
            
            // Add breadcrumb items from URL path
            let currentPath = '';
            pathParts.forEach((part) => {
                currentPath += '/' + part;
                const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
                data.breadcrumb.push({
                    name: name,
                    url: urlObj.origin + currentPath
                });
            });
            
            // Populate forms
            manualData.product = { ...data.product };
            manualData.breadcrumb = [...data.breadcrumb];
            
            showStatus('URL analyzed! Please manually enter additional data in the editor.', 'info');
            
            // Show message about limitations
            const existingSection = document.getElementById('existingSchemaSection');
            const existingContent = document.getElementById('existingSchemaContent');
            existingSection.classList.remove('hidden');
            existingContent.innerHTML = `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p class="text-yellow-800 text-sm font-medium mb-2">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Limited Analysis Mode
                    </p>
                    <p class="text-yellow-700 text-sm">
                        Due to browser security restrictions, we cannot fetch website content directly in production. 
                        We've extracted basic information from the URL structure.
                    </p>
                    <p class="text-yellow-700 text-sm mt-2">
                        For full website analysis including existing schema detection, please:
                    </p>
                    <ul class="text-yellow-700 text-sm mt-1 ml-4 list-disc">
                        <li>Use the local version (download and run locally)</li>
                        <li>Or manually enter all data using the editor</li>
                    </ul>
                </div>
            `;
            
            generateSchema();
            
        } catch (error) {
            showStatus('Invalid URL. Please enter a valid website URL.', 'error');
        } finally {
            loader.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
        
    } else {
        // Local: Use full server analysis
        showStatus('Analyzing website... This may take a few seconds.', 'info');
        
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: finalUrl, types: Array.from(activeSchemaTypes) })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze website');
            }
            
            extractedData = data;
            
            // Auto-populate forms with extracted data
            if (data.product) {
                manualData.product = { ...data.product };
            }
            if (data.breadcrumb) {
                manualData.breadcrumb = [...data.breadcrumb];
            }
            if (data.faq) {
                manualData.faq = [...data.faq];
            }
            if (data.carousel) {
                manualData.carousel = [...data.carousel];
            }
            if (data.review) {
                manualData.review = { ...data.review };
            }
            
            // Handle existing schema
            if (data.existingSchema && data.existingSchema.length > 0) {
                displayExistingSchema(data.existingSchema);
            }
            
            showStatus('Website analyzed successfully! Review and edit the extracted data below.', 'success');
            generateSchema();
            
        } catch (error) {
            console.error('Analysis error:', error);
            showStatus(`Error: ${error.message}. Note: Some websites block automated requests. You can still manually enter data.`, 'error');
        } finally {
            loader.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }
}

function showSchemaForm() {
    const schemaType = document.getElementById('schemaTypeSelect').value;
    const formsContainer = document.getElementById('schemaForms');
    
    if (!schemaType) {
        formsContainer.innerHTML = '';
        return;
    }
    
    let formHTML = '';
    
    switch(schemaType) {
        case 'product':
            formHTML = `
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-purple-200 mb-1">Product Name</label>
                        <input type="text" id="productName" value="${manualData.product.name || ''}" onchange="updateManualData('product', 'name', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-purple-200 mb-1">Description</label>
                        <textarea id="productDescription" onchange="updateManualData('product', 'description', this.value)" class="w-full px-3 py-2 rounded-lg text-sm" rows="3">${manualData.product.description || ''}</textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Brand</label>
                            <input type="text" id="productBrand" value="${manualData.product.brand || ''}" onchange="updateManualData('product', 'brand', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">SKU</label>
                            <input type="text" id="productSKU" value="${manualData.product.sku || ''}" onchange="updateManualData('product', 'sku', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Price</label>
                            <input type="number" id="productPrice" value="${manualData.product.price || ''}" step="0.01" onchange="updateManualData('product', 'price', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Currency</label>
                            <input type="text" id="productCurrency" value="${manualData.product.currency || 'USD'}" onchange="updateManualData('product', 'currency', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-purple-200 mb-1">Availability</label>
                        <select id="productAvailability" onchange="updateManualData('product', 'availability', this.value)" class="w-full px-3 py-2 rounded-lg text-sm bg-black/30 text-white">
                            <option value="https://schema.org/InStock" ${manualData.product.availability === 'https://schema.org/InStock' ? 'selected' : ''}>In Stock</option>
                            <option value="https://schema.org/OutOfStock" ${manualData.product.availability === 'https://schema.org/OutOfStock' ? 'selected' : ''}>Out of Stock</option>
                            <option value="https://schema.org/PreOrder" ${manualData.product.availability === 'https://schema.org/PreOrder' ? 'selected' : ''}>Pre-Order</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-purple-200 mb-1">Image URL</label>
                        <input type="url" id="productImage" value="${manualData.product.image || ''}" onchange="updateManualData('product', 'image', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Rating (1-5)</label>
                            <input type="number" id="productRating" value="${manualData.product.ratingValue || ''}" min="1" max="5" step="0.1" onchange="updateManualData('product', 'ratingValue', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Review Count</label>
                            <input type="number" id="productReviewCount" value="${manualData.product.reviewCount || ''}" onchange="updateManualData('product', 'reviewCount', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                    </div>
                </div>`;
            break;
            
        case 'breadcrumb':
            formHTML = `
                <div class="space-y-3" id="breadcrumbItems">
                    ${renderBreadcrumbItems()}
                </div>
                <button class="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors" onclick="addBreadcrumbItem()">
                    <i class="fas fa-plus mr-2"></i>Add Breadcrumb
                </button>`;
            break;
            
        case 'faq':
            formHTML = `
                <div class="space-y-3" id="faqItems">
                    ${renderFAQItems()}
                </div>
                <button class="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors" onclick="addFAQItem()">
                    <i class="fas fa-plus mr-2"></i>Add FAQ
                </button>`;
            break;
            
        case 'carousel':
            formHTML = `
                <div class="space-y-3" id="carouselItems">
                    ${renderCarouselItems()}
                </div>
                <button class="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors" onclick="addCarouselItem()">
                    <i class="fas fa-plus mr-2"></i>Add Carousel Item
                </button>`;
            break;
            
        case 'review':
            formHTML = `
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-purple-200 mb-1">Item Reviewed Name</label>
                        <input type="text" id="reviewItemName" value="${manualData.review.itemName || ''}" onchange="updateManualData('review', 'itemName', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Average Rating</label>
                            <input type="number" id="reviewRating" value="${manualData.review.ratingValue || ''}" min="1" max="5" step="0.1" onchange="updateManualData('review', 'ratingValue', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Review Count</label>
                            <input type="number" id="reviewCount" value="${manualData.review.reviewCount || ''}" onchange="updateManualData('review', 'reviewCount', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Best Rating</label>
                            <input type="number" id="reviewBestRating" value="${manualData.review.bestRating || 5}" onchange="updateManualData('review', 'bestRating', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-purple-200 mb-1">Worst Rating</label>
                            <input type="number" id="reviewWorstRating" value="${manualData.review.worstRating || 1}" onchange="updateManualData('review', 'worstRating', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-purple-200 mb-1">Author Name</label>
                        <input type="text" id="reviewAuthor" value="${manualData.review.author || ''}" onchange="updateManualData('review', 'author', this.value)" class="w-full px-3 py-2 rounded-lg text-sm">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-purple-200 mb-1">Review Body</label>
                        <textarea id="reviewBody" onchange="updateManualData('review', 'reviewBody', this.value)" class="w-full px-3 py-2 rounded-lg text-sm" rows="3">${manualData.review.reviewBody || ''}</textarea>
                    </div>
                </div>`;
            break;
    }
    
    formsContainer.innerHTML = formHTML;
}

function renderBreadcrumbItems() {
    if (!manualData.breadcrumb.length) {
        manualData.breadcrumb = [{ name: '', url: '' }];
    }
    
    return manualData.breadcrumb.map((item, index) => `
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-gray-500">Item ${index + 1}</span>
                ${manualData.breadcrumb.length > 1 ? `<button class="text-red-400 hover:text-red-300 text-sm" onclick="removeBreadcrumbItem(${index})"><i class="fas fa-trash"></i></button>` : ''}
            </div>
            <div class="space-y-2">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Name</label>
                    <input type="text" value="${item.name || ''}" onchange="updateBreadcrumbItem(${index}, 'name', this.value)" class="w-full px-2 py-1 rounded text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">URL</label>
                    <input type="url" value="${item.url || ''}" onchange="updateBreadcrumbItem(${index}, 'url', this.value)" class="w-full px-2 py-1 rounded text-sm">
                </div>
            </div>
        </div>
    `).join('');
}

function renderFAQItems() {
    if (!manualData.faq.length) {
        manualData.faq = [{ question: '', answer: '' }];
    }
    
    return manualData.faq.map((item, index) => `
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-gray-500">FAQ ${index + 1}</span>
                ${manualData.faq.length > 1 ? `<button class="text-red-400 hover:text-red-300 text-sm" onclick="removeFAQItem(${index})"><i class="fas fa-trash"></i></button>` : ''}
            </div>
            <div class="space-y-2">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Question</label>
                    <input type="text" value="${item.question || ''}" onchange="updateFAQItem(${index}, 'question', this.value)" class="w-full px-2 py-1 rounded text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                    <textarea onchange="updateFAQItem(${index}, 'answer', this.value)" class="w-full px-2 py-1 rounded text-sm" rows="2">${item.answer || ''}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCarouselItems() {
    if (!manualData.carousel.length) {
        manualData.carousel = [{ name: '', url: '', image: '', description: '', price: '' }];
    }
    
    return manualData.carousel.map((item, index) => `
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs text-gray-500">Item ${index + 1}</span>
                ${manualData.carousel.length > 1 ? `<button class="text-red-400 hover:text-red-300 text-sm" onclick="removeCarouselItem(${index})"><i class="fas fa-trash"></i></button>` : ''}
            </div>
            <div class="space-y-2">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Item Name</label>
                    <input type="text" value="${item.name || ''}" onchange="updateCarouselItem(${index}, 'name', this.value)" class="w-full px-2 py-1 rounded text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">URL</label>
                    <input type="url" value="${item.url || ''}" onchange="updateCarouselItem(${index}, 'url', this.value)" class="w-full px-2 py-1 rounded text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
                    <input type="url" value="${item.image || ''}" onchange="updateCarouselItem(${index}, 'image', this.value)" class="w-full px-2 py-1 rounded text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea onchange="updateCarouselItem(${index}, 'description', this.value)" class="w-full px-2 py-1 rounded text-sm" rows="2">${item.description || ''}</textarea>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Price</label>
                    <input type="text" value="${item.price || ''}" onchange="updateCarouselItem(${index}, 'price', this.value)" class="w-full px-2 py-1 rounded text-sm">
                </div>
            </div>
        </div>
    `).join('');
}

function updateManualData(type, field, value) {
    manualData[type][field] = value;
}

function updateBreadcrumbItem(index, field, value) {
    manualData.breadcrumb[index][field] = value;
}

function updateFAQItem(index, field, value) {
    manualData.faq[index][field] = value;
}

function updateCarouselItem(index, field, value) {
    manualData.carousel[index][field] = value;
}

function addBreadcrumbItem() {
    manualData.breadcrumb.push({ name: '', url: '' });
    showSchemaForm();
}

function addFAQItem() {
    manualData.faq.push({ question: '', answer: '' });
    showSchemaForm();
}

function addCarouselItem() {
    manualData.carousel.push({ name: '', url: '', image: '', description: '', price: '' });
    showSchemaForm();
}

function removeBreadcrumbItem(index) {
    manualData.breadcrumb.splice(index, 1);
    showSchemaForm();
}

function removeFAQItem(index) {
    manualData.faq.splice(index, 1);
    showSchemaForm();
}

function removeCarouselItem(index) {
    manualData.carousel.splice(index, 1);
    showSchemaForm();
}

function generateSchema() {
    // Check if any schema types are selected
    if (activeSchemaTypes.size === 0) {
        showStatus('Please select at least one schema type to generate (click the buttons to turn them blue)', 'error');
        document.getElementById('schemaCode').textContent = 'No schema types selected. Click the buttons above to select which types you want to generate.';
        return;
    }
    
    const schemas = [];
    
    // Generate Product Schema
    if (activeSchemaTypes.has('product') && (manualData.product.name || extractedData.product?.name)) {
        const productData = { ...extractedData.product, ...manualData.product };
        const productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": productData.name,
            "description": productData.description
        };
        
        if (productData.image) productSchema.image = productData.image;
        if (productData.brand) productSchema.brand = { "@type": "Brand", "name": productData.brand };
        if (productData.sku) productSchema.sku = productData.sku;
        
        if (productData.price) {
            productSchema.offers = {
                "@type": "Offer",
                "price": productData.price,
                "priceCurrency": productData.currency || "USD"
            };
            if (productData.availability) {
                productSchema.offers.availability = productData.availability;
            }
        }
        
        if (productData.ratingValue && productData.reviewCount) {
            productSchema.aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": productData.ratingValue,
                "reviewCount": productData.reviewCount
            };
        }
        
        schemas.push(productSchema);
    }
    
    // Generate Breadcrumb Schema
    if (activeSchemaTypes.has('breadcrumb') && manualData.breadcrumb.length > 0) {
        const validBreadcrumbs = manualData.breadcrumb.filter(b => b.name && b.url);
        if (validBreadcrumbs.length > 0) {
            const breadcrumbSchema = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": validBreadcrumbs.map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": item.name,
                    "item": item.url
                }))
            };
            schemas.push(breadcrumbSchema);
        }
    }
    
    // Generate Carousel Schema
    if (activeSchemaTypes.has('carousel') && manualData.carousel.length > 0) {
        const validCarouselItems = manualData.carousel.filter(c => c.name && c.url);
        if (validCarouselItems.length > 0) {
            const carouselSchema = {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": validCarouselItems.map((item, index) => {
                    const listItem = {
                        "@type": "ListItem",
                        "position": index + 1,
                        "item": {
                            "@type": "Product",
                            "name": item.name,
                            "url": item.url
                        }
                    };
                    
                    if (item.description) listItem.item.description = item.description;
                    if (item.image) listItem.item.image = item.image;
                    if (item.price) {
                        listItem.item.offers = {
                            "@type": "Offer",
                            "price": item.price,
                            "priceCurrency": "USD"
                        };
                    }
                    
                    return listItem;
                })
            };
            schemas.push(carouselSchema);
        }
    }
    
    // Generate FAQ Schema
    if (activeSchemaTypes.has('faq') && manualData.faq.length > 0) {
        const validFAQs = manualData.faq.filter(f => f.question && f.answer);
        if (validFAQs.length > 0) {
            const faqSchema = {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": validFAQs.map(item => ({
                    "@type": "Question",
                    "name": item.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": item.answer
                    }
                }))
            };
            schemas.push(faqSchema);
        }
    }
    
    // Generate Review Schema
    if (activeSchemaTypes.has('review') && manualData.review.itemName) {
        const reviewData = { ...extractedData.review, ...manualData.review };
        const reviewSchema = {
            "@context": "https://schema.org",
            "@type": "Review",
            "itemReviewed": {
                "@type": "Product",
                "name": reviewData.itemName
            }
        };
        
        if (reviewData.ratingValue) {
            reviewSchema.reviewRating = {
                "@type": "Rating",
                "ratingValue": reviewData.ratingValue,
                "bestRating": reviewData.bestRating || 5,
                "worstRating": reviewData.worstRating || 1
            };
        }
        
        if (reviewData.author) {
            reviewSchema.author = {
                "@type": "Person",
                "name": reviewData.author
            };
        }
        
        if (reviewData.reviewBody) {
            reviewSchema.reviewBody = reviewData.reviewBody;
        }
        
        schemas.push(reviewSchema);
    }
    
    // Display generated schemas
    const schemaOutput = document.getElementById('schemaCode');
    if (schemas.length > 0) {
        const output = schemas.map(schema => 
            `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
        ).join('\n\n');
        schemaOutput.textContent = output;
    } else {
        schemaOutput.textContent = 'No schema generated. Please provide data or select schema types.';
    }
}

function copySchema() {
    const schemaCode = document.getElementById('schemaCode').textContent;
    navigator.clipboard.writeText(schemaCode).then(() => {
        showStatus('Schema copied to clipboard!', 'success');
    }).catch(() => {
        showStatus('Failed to copy schema', 'error');
    });
}

// Helper function to get top-level @type from a schema object
function getTopLevelSchemaType(obj) {
    if (!obj || typeof obj !== 'object') {
        return null;
    }
    
    // Handle arrays (like @graph)
    if (Array.isArray(obj)) {
        return obj.map(item => getTopLevelSchemaType(item)).filter(Boolean);
    }
    
    // Get the @type at the root level only
    if (obj['@type']) {
        const typeValue = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
        return typeValue;
    }
    
    // Handle @graph case
    if (obj['@graph'] && Array.isArray(obj['@graph'])) {
        return obj['@graph'].map(item => getTopLevelSchemaType(item)).flat().filter(Boolean);
    }
    
    return null;
}

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
                // Show key info
                html += `<div class="grid grid-cols-2 gap-4 mb-3 text-sm">`;
                if (schema.data.name) html += `<div><span class="text-gray-500">Name:</span> ${schema.data.name}</div>`;
                if (schema.data.description) html += `<div><span class="text-gray-500">Description:</span> ${schema.data.description.substring(0, 50)}...</div>`;
                if (schema.data.url) html += `<div><span class="text-gray-500">URL:</span> ${schema.data.url}</div>`;
                if (schema.data['@context']) html += `<div><span class="text-gray-500">Context:</span> ${schema.data['@context']}</div>`;
                html += `</div>`;
                
                // Collapsible full JSON
                html += `<div class="border-t pt-3">`;
                html += `<button onclick="toggleSchemaDetails('existing-${index}')" class="text-sm text-blue-600 hover:text-blue-800 mb-2">`;
                html += `<i class="fas fa-eye mr-1"></i>View Full Schema`;
                html += `</button>`;
                html += `<pre id="existing-${index}" class="hidden bg-gray-50 p-3 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto">${JSON.stringify(schema.data, null, 2)}</pre>`;
                html += `<button onclick="copyExistingSchema('existing-${index}')" class="hidden text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded mt-2" id="copy-existing-${index}">`;
                html += `<i class="fas fa-copy mr-1"></i>Copy`;
                html += `</button>`;
                html += `</div>`;
            } else if (schema.note) {
                html += `<p class="text-gray-600 text-sm">${schema.note}</p>`;
                if (schema.count) html += `<p class="text-gray-500 text-xs mt-1">${schema.count} elements found</p>`;
            }
            
            html += `</div>`;
        });
    }
    
    content.innerHTML = html;
}

function toggleSchemaDetails(id) {
    const element = document.getElementById(id);
    const copyBtn = document.getElementById('copy-' + id);
    
    if (element.classList.contains('hidden')) {
        element.classList.remove('hidden');
        copyBtn.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
        copyBtn.classList.add('hidden');
    }
}

function copyExistingSchema(id) {
    const element = document.getElementById(id);
    navigator.clipboard.writeText(element.textContent).then(() => {
        showStatus('Existing schema copied to clipboard!', 'success');
    }).catch(() => {
        showStatus('Failed to copy schema', 'error');
    });
}