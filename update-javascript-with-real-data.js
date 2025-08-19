/**
 * Update JavaScript files with complete 54-cookie validated dataset
 * Updates mock data in source JavaScript files
 */

const fs = require('fs');
const path = require('path');

// Load validated cookie data
const validatedCookies = require('./validation-analysis/enhanced-cookie-data.json');

// Category mapping from HubSpot to our internal categories
const categoryMapping = {
    'necessary': '1',
    'functionality': '2', 
    'analytics': '3',
    'advertisement': '4'
};

// Generate HubDB-style mock data
function generateMockData() {
    const rows = validatedCookies.map(cookie => ({
        values: {
            category_key: categoryMapping[cookie.category] || '1',
            cookie_name: cookie.name,
            purpose: generatePurpose(cookie),
            duration: standardizeExpiry(cookie.expiry),
            description: cookie.description,
            provider: cookie.actualSource || cookie.provider
        }
    }));
    
    return { rows };
}

function generatePurpose(cookie) {
    const actualSource = cookie.actualSource || cookie.provider;
    const categoryNames = {
        'necessary': 'Essential functionality',
        'functionality': 'Enhanced features',
        'analytics': 'Website analytics',
        'advertisement': 'Marketing optimization'
    };
    
    return `${actualSource} - ${categoryNames[cookie.category] || 'Website functionality'}`;
}

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

// Update JavaScript files
function updateJavaScriptFiles() {
    console.log('🚀 Updating JavaScript files with 54 validated cookies...');
    
    const jsFiles = [
        'source-code/option-a-lsretail-cookie-enhancer.js',
        'source-code/cookie-banner-enhancer.js'
    ];
    
    const mockData = generateMockData();
    console.log(`📊 Generated mock data for ${mockData.rows.length} cookies`);
    
    let filesUpdated = 0;
    
    for (const file of jsFiles) {
        const filePath = path.join(__dirname, file);
        
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  File not found: ${file}`);
            continue;
        }
        
        console.log(`📝 Updating ${file}...`);
        
        try {
            // Read current file
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Find and replace the getLSRetailMockData function
            const mockDataRegex = /getLSRetailMockData:\s*function\(\)\s*{[\s\S]*?return\s*{[\s\S]*?};\s*}/;
            
            if (mockDataRegex.test(content)) {
                const newMockFunction = `getLSRetailMockData: function() {
            return ${JSON.stringify(mockData, null, 12)};
        }`;
                
                content = content.replace(mockDataRegex, newMockFunction);
                
                // Write updated file
                fs.writeFileSync(filePath, content, 'utf8');
                
                console.log(`✅ Updated ${file} with ${mockData.rows.length} cookies`);
                filesUpdated++;
            } else {
                console.warn(`⚠️  Could not find getLSRetailMockData function in ${file}`);
            }
            
        } catch (error) {
            console.error(`❌ Error updating ${file}:`, error.message);
        }
    }
    
    console.log(`🎉 Updated ${filesUpdated} JavaScript files!`);
    
    // Generate summary by category
    const byCategoryCount = {
        essential: 0,
        functional: 0,
        analytics: 0,
        marketing: 0
    };
    
    mockData.rows.forEach(row => {
        const key = row.values.category_key;
        if (key === '1') byCategoryCount.essential++;
        else if (key === '2') byCategoryCount.functional++;
        else if (key === '3') byCategoryCount.analytics++;
        else if (key === '4') byCategoryCount.marketing++;
    });
    
    console.log('\n📈 Cookie Summary by Category:');
    console.log(`   Essential (1): ${byCategoryCount.essential} cookies`);
    console.log(`   Functional (2): ${byCategoryCount.functional} cookies`);
    console.log(`   Analytics (3): ${byCategoryCount.analytics} cookies`);
    console.log(`   Marketing (4): ${byCategoryCount.marketing} cookies`);
    console.log(`   TOTAL: ${mockData.rows.length} cookies`);
    
    return filesUpdated > 0;
}

// Run the update
if (require.main === module) {
    updateJavaScriptFiles();
}

module.exports = { updateJavaScriptFiles, generateMockData };