/**
 * Update Demo HTML with ALL 54 Cookies Visible in Categories
 * This will replace the hardcoded demo cookies with the complete dataset
 */

const fs = require('fs');
const path = require('path');

// Load the complete cookie data from the provided list
const completeCookieData = [
    { name: "__cf_bm", provider: "hscta.net", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "__cf_bm", provider: "hubspotvideo.com", category: "necessary", expiry: "29 minutes", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "ar_debug", provider: "google-analytics.com", category: "analytics", expiry: "session", description: "Google Analytics debug mode cookie for testing and validating tracking implementations." },
    { name: "sp_t", provider: "spotify.com", category: "functionality", expiry: "session", description: "Required to ensure the functionality of the integrated Spotify plugin. This does not result in any cross-site functionality." },
    { name: "sp_landing", provider: "spotify.com", category: "functionality", expiry: "session", description: "Required to ensure the functionality of the integrated Spotify plugin. This does not result in any cross-site functionality." },
    { name: "_ga", provider: "lsretail.com", category: "analytics", expiry: "399 days", description: "ID used to identify users" },
    { name: "__hs_do_not_track", provider: "lsretail.com", category: "necessary", expiry: "179 days", description: "Prevents the tracking code from sending any information to HubSpot" },
    { name: "MR", provider: "bing.com", category: "advertisement", expiry: "7 days", description: "Used to collect information for analytics purposes." },
    { name: "__hstc", provider: "lsretail.com", category: "analytics", expiry: "179 days", description: "Analytics tracking cookie" },
    { name: "AnalyticsSyncHistory", provider: "linkedin.com", category: "functionality", expiry: "29 days", description: "Used to store information about the time a sync with the lms_analytics cookie took place for users in the Designated Countries" },
    { name: "__cf_bm", provider: "usemessages.com", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "li_sugr", provider: "linkedin.com", category: "analytics", expiry: "89 days", description: "Used to make a probabilistic match of a user's identity outside the Designated Countries" },
    { name: "_ga_CWBWGSSZTV", provider: "lsretail.com", category: "analytics", expiry: "399 days", description: "Used to persist session state" },
    { name: "SM", provider: "clarity.ms", category: "analytics", expiry: "session", description: "Microsoft Clarity session identifier for user experience analytics and heatmap generation." },
    { name: "__cf_bm", provider: "hs-analytics.net", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "hubspotutk", provider: "lsretail.com", category: "analytics", expiry: "179 days", description: "Contains visitor's identity" },
    { name: "__hssrc", provider: "lsretail.com", category: "analytics", expiry: "session", description: "Used to determine if a session is a new session" },
    { name: "ANONCHK", provider: "clarity.ms", category: "advertisement", expiry: "session", description: "Used to store session ID for a users session to ensure that clicks from adverts on the Bing search engine are verified for reporting purposes and for personalisation" },
    { name: "bcookie", provider: "linkedin.com", category: "advertisement", expiry: "365 days", description: "Used by LinkedIn to track the use of embedded services." },
    { name: "__cf_bm", provider: "hs-banner.com", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "__hssc", provider: "lsretail.com", category: "analytics", expiry: "29 minutes", description: "Analytics session cookie" },
    { name: "_fbp", provider: "lsretail.com", category: "advertisement", expiry: "89 days", description: "Facebook analytics cookie" },
    { name: "_gcl_au", provider: "lsretail.com", category: "advertisement", expiry: "89 days", description: "Used by Google AdSense for experimenting with advertisement efficiency across websites using their services." },
    { name: "_rdt_uuid", provider: "lsretail.com", category: "advertisement", expiry: "session", description: "This cookie is set by Reddit and is used for remarketing on reddit.com" },
    { name: "__cf_bm", provider: "linkedin.com", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "__cf_bm", provider: "hsadspixel.net", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "__cf_bm", provider: "hubspot.com", category: "necessary", expiry: "29 minutes", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "_clck", provider: "lsretail.com", category: "functionality", expiry: "session", description: "Microsoft Clarity click tracking cookie for user interaction analysis and website optimization." },
    { name: "SRM_B", provider: "bing.com", category: "functionality", expiry: "session", description: "Collected user data is specifically adapted to the user or device. The usercan also be followed outside of the loaded website, creating a picture of the visitor's behavior." },
    { name: "MUID", provider: "clarity.ms", category: "necessary", expiry: "session", description: "Identifies unique web browsers visiting Microsoft sites. These cookies are used for advertising, site analytics, and other operational purposes." },
    { name: "__cf_bm", provider: "hsappstatic.net", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "lidc", provider: "linkedin.com", category: "advertisement", expiry: "1 days", description: "Used by the social networking service, LinkedIn, for tracking the use of embedded services." },
    { name: "__cf_bm", provider: "hsforms.com", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "MR", provider: "clarity.ms", category: "advertisement", expiry: "session", description: "Used to collect information for analytics purposes." },
    { name: "UserMatchHistory", provider: "linkedin.com", category: "advertisement", expiry: "29 days", description: "These cookies are set by LinkedIn for advertising purposes, including: tracking visitors so that more relevant ads can be presented, allowing users to use the 'Apply with LinkedIn' or the 'Sign-in with LinkedIn' functions, collecting information about how visitors use the site, etc." },
    { name: "bscookie", provider: "linkedin.com", category: "advertisement", expiry: "364 days", description: "Used by LinkedIn to track the use of embedded services." },
    { name: "__cf_bm", provider: "lsretail.com", category: "necessary", expiry: "29 minutes", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "CLID", provider: "clarity.ms", category: "analytics", expiry: "session", description: "Microsoft Clarity session ID for tracking user behavior and website performance metrics." },
    { name: "_clsk", provider: "lsretail.com", category: "functionality", expiry: "session", description: "Microsoft Clarity session key for maintaining user session state during analytics collection." },
    { name: "MUID", provider: "bing.com", category: "advertisement", expiry: "390 days", description: "Identifies unique web browsers visiting Microsoft sites. These cookies are used for advertising, site analytics, and other operational purposes." },
    { name: "__hs_cookie_cat_pref", provider: "lsretail.com", category: "necessary", expiry: "session", description: "The HubSpot Cookie Banner's consent preferences cookie." },
    { name: "__cf_bm", provider: "hubspotusercontent-na1.net", category: "necessary", expiry: "29 minutes", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "ARRAffinitySameSite", provider: "runevents.net", category: "functionality", expiry: "session", description: "When using Microsoft Azure as a hosting platform and enabling load balancing, this cookie ensures that requests from one visitor's browsing session are always handled by the same server in the cluster." },
    { name: "test_cookie", provider: "doubleclick.net", category: "functionality", expiry: "14 minutes", description: "This cookie is set by DoubleClick (which is owned by Google) to determine if the website visitor's browser supports cookies." },
    { name: "NID", provider: "google.com", category: "necessary", expiry: "183 days", description: "This cookies is used to collect website statistics and track conversion rates and Google ad personalisation" },
    { name: "VISITOR_INFO1_LIVE", provider: "youtube.com", category: "advertisement", expiry: "179 days", description: "Tries to estimate the users' bandwidth on pages with integrated YouTube videos." },
    { name: "IDE", provider: "doubleclick.net", category: "necessary", expiry: "399 days", description: "This cookie is used for targeting, analyzing and optimisation of ad campaigns in DoubleClick/Google Marketing Suite" },
    { name: "__Secure-ROLLOUT_TOKEN", provider: "youtube.com", category: "necessary", expiry: "session", description: "YouTube security token for progressive feature rollout and A/B testing." },
    { name: "__cf_bm", provider: "hsforms.net", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "__cf_bm", provider: "hubspot.net", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "__cf_bm", provider: "hubspotusercontent10.net", category: "necessary", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots. Cloudflare places the __cf_bm cookie on End User devices that access Customer sites that are protected by Bot Management or Bot Fight Mode. The __cf_bm cookie is necessary for the proper functioning of these bot solutions." },
    { name: "YSC", provider: "youtube.com", category: "functionality", expiry: "session", description: "Registers a unique ID to keep statistics of what videos from YouTube the user has seen." },
    { name: "fr", provider: "facebook.com", category: "advertisement", expiry: "89 days", description: "Contains a unique browser and user ID, used for targeted advertising." },
    { name: "VISITOR_PRIVACY_METADATA", provider: "youtube.com", category: "advertisement", expiry: "session", description: "YouTube visitor privacy metadata for GDPR compliance and privacy preference management." }
];

// Map categories
const categoryMap = {
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
    
    completeCookieData.forEach(cookie => {
        const mappedCategory = categoryMap[cookie.category] || 'essential';
        organized[mappedCategory].push(cookie);
    });
    
    return organized;
}

// Generate HTML for cookie items in a category
function generateCookieItemsHTML(cookies) {
    return cookies.map(cookie => `
                            <div class="cookie-item">
                                <div class="cookie-name">${cookie.name}</div>
                                <div class="cookie-purpose">Provider: ${cookie.provider} | Duration: ${cookie.expiry}</div>
                                <div class="cookie-description">${cookie.description}</div>
                            </div>`).join('');
}

// Update the demo HTML
function updateDemoHTML() {
    const demoPath = path.join(__dirname, 'demos-testing/SIMPLE_DEMO.html');
    
    if (!fs.existsSync(demoPath)) {
        console.error('❌ Demo file not found:', demoPath);
        return false;
    }
    
    console.log('📄 Reading demo HTML file...');
    let htmlContent = fs.readFileSync(demoPath, 'utf8');
    
    const organizedCookies = organizeCookiesByCategory();
    
    console.log('📊 Cookie counts by category:');
    Object.keys(organizedCookies).forEach(category => {
        console.log(`   ${category}: ${organizedCookies[category].length} cookies`);
    });
    
    // Update Essential Cookies section
    const essentialCookies = generateCookieItemsHTML(organizedCookies.essential);
    htmlContent = htmlContent.replace(
        /<div id="essential-details" class="category-details">[\s\S]*?<\/div>\s*<\/div>/,
        `<div id="essential-details" class="category-details">
                        <p><strong>These cookies are necessary for LS Retail's platform to function properly (${organizedCookies.essential.length} cookies).</strong></p>
                        <div class="cookie-list">
                            ${essentialCookies}
                        </div>
                    </div>
                </div>`
    );
    
    // Update Functional Cookies section
    const functionalCookies = generateCookieItemsHTML(organizedCookies.functional);
    htmlContent = htmlContent.replace(
        /<div id="functional-details" class="category-details">[\s\S]*?<\/div>\s*<\/div>/,
        `<div id="functional-details" class="category-details">
                        <p><strong>Enable enhanced functionality and personalization features (${organizedCookies.functional.length} cookies).</strong></p>
                        <div class="cookie-list">
                            ${functionalCookies}
                        </div>
                    </div>
                </div>`
    );
    
    // Update Analytics Cookies section
    const analyticsCookies = generateCookieItemsHTML(organizedCookies.analytics);
    htmlContent = htmlContent.replace(
        /<div id="analytics-details" class="category-details">[\s\S]*?<\/div>\s*<\/div>/,
        `<div id="analytics-details" class="category-details">
                        <p><strong>Help us understand how businesses use our retail solutions (${organizedCookies.analytics.length} cookies).</strong></p>
                        <div class="cookie-list">
                            ${analyticsCookies}
                        </div>
                    </div>
                </div>`
    );
    
    // Update Marketing Cookies section
    const marketingCookies = generateCookieItemsHTML(organizedCookies.marketing);
    htmlContent = htmlContent.replace(
        /<div id="marketing-details" class="category-details">[\s\S]*?<\/div>\s*<\/div>/,
        `<div id="marketing-details" class="category-details">
                        <p><strong>Enable targeted content about our unified commerce solutions (${organizedCookies.marketing.length} cookies).</strong></p>
                        <div class="cookie-list">
                            ${marketingCookies}
                        </div>
                    </div>
                </div>`
    );
    
    // Update page title and description
    htmlContent = htmlContent.replace(
        /<title>.*?<\/title>/,
        '<title>LS Retail Option A - Complete Demo with All 54 Cookies</title>'
    );
    
    htmlContent = htmlContent.replace(
        /<p>Interactive demonstration.*?<\/p>/,
        `<p>Interactive demonstration with <strong>all 54 real cookies</strong> from LS Retail HubSpot scanner.<br>
         <small>Updated: ${new Date().toISOString().split('T')[0]} | Complete dataset displayed</small></p>`
    );
    
    console.log('💾 Writing updated demo file...');
    fs.writeFileSync(demoPath, htmlContent, 'utf8');
    
    console.log('✅ Demo updated successfully!');
    console.log(`📊 Total cookies displayed in demo: ${completeCookieData.length}`);
    
    return true;
}

// Run the update
if (require.main === module) {
    console.log('🚀 Updating demo with ALL 54 cookies displayed visually...');
    
    const success = updateDemoHTML();
    
    if (success) {
        const organized = organizeCookiesByCategory();
        console.log('\n🎉 Demo now shows ALL cookies!');
        console.log(`   Essential: ${organized.essential.length} cookies displayed`);
        console.log(`   Functional: ${organized.functional.length} cookies displayed`);
        console.log(`   Analytics: ${organized.analytics.length} cookies displayed`);
        console.log(`   Marketing: ${organized.marketing.length} cookies displayed`);
        console.log(`   TOTAL: ${completeCookieData.length} cookies visible in demo`);
    }
}

module.exports = { updateDemoHTML, organizeCookiesByCategory };