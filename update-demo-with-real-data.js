/**
 * Update Demo with Complete 54 Cookie Dataset
 * Updates SIMPLE_DEMO.html with all validated cookies from HubSpot scanner
 */

const fs = require('fs');
const path = require('path');

// Load validated cookie data
const validatedCookies = require('./validation-analysis/enhanced-cookie-data.json');

// Category mapping from HubSpot to our internal categories
const categoryMapping = {
    'necessary': 'essential',
    'functionality': 'functional', 
    'analytics': 'analytics',
    'advertisement': 'marketing'
};

// Organize cookies by category
function organizeCookiesByCategory() {
    const organized = {
        essential: [],
        functional: [],
        analytics: [],
        marketing: []
    };
    
    validatedCookies.forEach(cookie => {
        const mappedCategory = categoryMapping[cookie.category] || 'essential';
        organized[mappedCategory].push(cookie);
    });
    
    return organized;
}

// Generate HTML for cookie list in a category
function generateCookieListHTML(cookies, categoryId) {
    if (cookies.length === 0) {
        return `
                    <div class="category-details" id="${categoryId}-details" style="display: none;">
                        <div class="category-description">
                            <p>No cookies found in this category.</p>
                        </div>
                    </div>`;
    }
    
    const cookieItems = cookies.map(cookie => {
        const actualSource = cookie.actualSource || cookie.provider;
        const standardizedExpiry = standardizeExpiry(cookie.expiry);
        const cleanDescription = cookie.description.replace(/"/g, '&quot;');
        
        return `
                            <li class="cookie-item">
                                <div class="cookie-header">
                                    <strong>${cookie.name}</strong>
                                    <span class="cookie-duration">${standardizedExpiry}</span>
                                </div>
                                <div class="cookie-provider">Provider: ${actualSource}</div>
                                <div class="cookie-description">${cleanDescription}</div>
                            </li>`;
    }).join('');
    
    const categoryDescriptions = {
        essential: 'These cookies are necessary for our LS Retail platform to function properly and cannot be disabled.',
        functional: 'Enable enhanced functionality and personalization features for improved user experience.',
        analytics: 'Help us understand how businesses use our retail solutions to improve our products.',
        marketing: 'Enable targeted content about our unified commerce solutions for your business type.'
    };
    
    return `
                    <div class="category-details" id="${categoryId}-details" style="display: none;">
                        <div class="category-description">
                            <p>${categoryDescriptions[categoryId]}</p>
                        </div>
                        <div class="cookies-list">
                            <h4>Cookies in this category (${cookies.length}):</h4>
                            <ul class="cookie-list">
                                ${cookieItems}
                            </ul>
                        </div>
                    </div>`;
}

// Standardize cookie expiry format
function standardizeExpiry(expiry) {
    const mapping = {
        'session': 'Session',
        '29 minutes': '30 minutes',
        '14 minutes': '15 minutes',
        '1 days': '1 day',
        '7 days': '1 week',
        '29 days': '1 month',
        '89 days': '3 months',
        '179 days': '6 months',
        '183 days': '6 months',
        '364 days': '1 year',
        '365 days': '1 year',
        '390 days': '13 months',
        '399 days': '13 months'
    };
    
    return mapping[expiry] || expiry;
}

// Update the demo HTML file
function updateDemoHTML() {
    const demoPath = path.join(__dirname, 'demos-testing/SIMPLE_DEMO.html');
    
    if (!fs.existsSync(demoPath)) {
        console.error('❌ Demo file not found:', demoPath);
        return false;
    }
    
    console.log('📄 Reading demo file...');
    let htmlContent = fs.readFileSync(demoPath, 'utf8');
    
    const organizedCookies = organizeCookiesByCategory();
    
    console.log('📊 Cookie counts by category:');
    Object.keys(organizedCookies).forEach(category => {
        console.log(`   ${category}: ${organizedCookies[category].length} cookies`);
    });
    
    // Update each category section
    const categories = ['essential', 'functional', 'analytics', 'marketing'];
    
    categories.forEach(category => {
        const cookies = organizedCookies[category];
        const newDetailsHTML = generateCookieListHTML(cookies, category);
        
        // Find and replace the category details section
        const detailsRegex = new RegExp(
            `<div class="category-details" id="${category}-details"[^>]*>[\\s\\S]*?</div>\\s*</div>`,
            'g'
        );
        
        const replacement = newDetailsHTML + '\n                </div>';
        
        if (detailsRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(detailsRegex, replacement);
            console.log(`✅ Updated ${category} category with ${cookies.length} cookies`);
        } else {
            console.warn(`⚠️  Could not find ${category} details section to update`);
        }
    });
    
    // Update the header to reflect real data
    htmlContent = htmlContent.replace(
        /<title>.*?<\/title>/,
        '<title>LS Retail Option A - Live Demo with 54 Real Cookies</title>'
    );
    
    htmlContent = htmlContent.replace(
        /<h1>.*?<\/h1>/,
        '<h1>LS Retail Cookie Enhancer - Live Demo</h1>'
    );
    
    // Add a timestamp and cookie count
    const timestamp = new Date().toISOString().split('T')[0];
    htmlContent = htmlContent.replace(
        /<p>Interactive demonstration.*?<\/p>/,
        `<p>Interactive demonstration with <strong>54 real cookies</strong> from LS Retail HubSpot scanner.<br>
         <small>Updated: ${timestamp} | Cookies validated and enhanced</small></p>`
    );
    
    console.log('💾 Writing updated demo file...');
    fs.writeFileSync(demoPath, htmlContent, 'utf8');
    
    console.log('✅ Demo updated successfully!');
    console.log(`📊 Total cookies in demo: ${validatedCookies.length}`);
    
    return true;
}

// Also update other demo files if they exist
function updateAllDemos() {
    console.log('🚀 Starting demo update with complete 54-cookie dataset...');
    
    const success = updateDemoHTML();
    
    if (success) {
        console.log('🎉 All demos updated with real cookie data!');
        
        // Generate summary
        const organizedCookies = organizeCookiesByCategory();
        console.log('\n📈 Final Demo Cookie Summary:');
        console.log(`   Essential: ${organizedCookies.essential.length} cookies`);
        console.log(`   Functional: ${organizedCookies.functional.length} cookies`);
        console.log(`   Analytics: ${organizedCookies.analytics.length} cookies`);
        console.log(`   Marketing: ${organizedCookies.marketing.length} cookies`);
        console.log(`   TOTAL: ${validatedCookies.length} cookies`);
    }
    
    return success;
}

// Run the update
if (require.main === module) {
    updateAllDemos();
}

module.exports = { updateAllDemos, organizeCookiesByCategory };