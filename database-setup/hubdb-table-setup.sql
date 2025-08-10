-- LS Retail Option A - HubDB Table Setup Script
-- Cookie Documentation and Management System
-- 
-- USAGE:
-- 1. Log into HubSpot portal 491011
-- 2. Navigate to Marketing > Files and Templates > HubDB
-- 3. Create new table using this schema
-- 4. Import sample data using the CSV provided
-- 5. Update table ID in option-a-lsretail-cookie-enhancer.js

-- ==============================================
-- HubDB Table Schema: LS_Retail_Cookie_Documentation
-- ==============================================

-- Table Configuration:
-- Name: LS_Retail_Cookie_Documentation
-- Description: Complete cookie documentation for Option A individual "Learn More" sections
-- Table Type: Standard (not dynamic)
-- Permissions: Private (portal access only)

-- ==============================================
-- Column Definitions
-- ==============================================

-- Primary identifier for cookie category mapping
-- Maps to CONFIG.categories[].key in JavaScript (1, 2, 3)
COLUMN: category_key
    Type: Single-line text
    Required: Yes
    Options: None
    Description: "Cookie category identifier - must match JavaScript config (1=Essential, 2=Analytics, 3=Marketing)"
    Validation: Must be one of: "1", "2", "3"

-- Cookie name as it appears in browser
COLUMN: cookie_name  
    Type: Single-line text
    Required: Yes
    Unique: Yes
    Description: "Exact cookie name as set in browser (e.g., '_ga', '__hstc')"
    Validation: No spaces, alphanumeric and underscores only

-- Brief purpose description (shown in category list)
COLUMN: purpose
    Type: Single-line text  
    Required: Yes
    Max Length: 100
    Description: "Brief description of cookie purpose for category overview"
    Example: "Website analytics and user behavior tracking"

-- Cookie duration/expiration 
COLUMN: duration
    Type: Single-line text
    Required: Yes
    Max Length: 50
    Description: "Cookie expiration time in human-readable format"
    Example: "2 years", "Session", "13 months", "30 minutes"

-- Detailed explanation (shown when "Learn More" is clicked)
COLUMN: description
    Type: Rich text
    Required: Yes
    Description: "Detailed explanation of cookie functionality and data collected"
    HTML Allowed: Yes (for formatting)

-- Optional: Cookie provider/vendor
COLUMN: provider
    Type: Single-line text
    Required: No
    Max Length: 50
    Description: "Cookie provider or service (e.g., 'Google Analytics', 'HubSpot', 'Facebook')"

-- Optional: Data collected description
COLUMN: data_collected
    Type: Multi-line text
    Required: No
    Description: "Specific data points collected by this cookie"
    Example: "IP address, browser type, page views, session duration"

-- Optional: Third-party sharing
COLUMN: third_party_sharing
    Type: Single-line text
    Required: No
    Options: ["None", "Analytics only", "Marketing partners", "Legal requirements"]
    Description: "Whether data is shared with third parties"

-- Administrative fields
COLUMN: active_status
    Type: Single-line text
    Required: Yes
    Default: "Active"
    Options: ["Active", "Inactive", "Deprecated"]
    Description: "Whether cookie is currently in use"

COLUMN: last_reviewed
    Type: Date
    Required: No
    Description: "Date when cookie information was last reviewed for accuracy"

COLUMN: legal_basis
    Type: Single-line text
    Required: No
    Options: ["Necessary", "Legitimate Interest", "Consent", "Legal Obligation"]
    Description: "GDPR legal basis for processing this cookie data"

-- ==============================================
-- Table Indexes (for performance)
-- ==============================================

INDEX: category_key_index
    Column: category_key
    Type: Standard
    Purpose: Fast filtering by cookie category

INDEX: active_status_index  
    Column: active_status
    Type: Standard
    Purpose: Filter only active cookies

-- ==============================================
-- Sample Data Import
-- ==============================================

-- Row 1: Essential Cookie - HubSpot Session
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "1",
    cookie_name: "_hs_session",
    purpose: "LS Retail session management",
    duration: "Session",
    description: "<p><strong>Essential for LS Central access:</strong> This cookie maintains your secure session while using LS Retail's unified commerce platform. It ensures you remain logged in as you navigate between different LS Central modules.</p><p><strong>What we collect:</strong> Session identifier, login status, dashboard preferences.</p><p><strong>Why it's necessary:</strong> Required for platform security and user experience. Cannot be disabled.</p>",
    provider: "HubSpot",
    data_collected: "Session ID, authentication status, timestamp",
    third_party_sharing: "None",
    active_status: "Active",
    last_reviewed: "2025-08-10",
    legal_basis: "Necessary"
);

-- Row 2: Essential Cookie - Privacy Preferences
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "1",
    cookie_name: "__hs_opt_out",
    purpose: "Privacy preferences storage",
    duration: "6 months",
    description: "<p><strong>Remembers your cookie choices:</strong> This cookie stores your privacy preferences so we don't ask you about cookie consent repeatedly.</p><p><strong>What we collect:</strong> Your consent choices for different cookie categories, timestamp of consent.</p><p><strong>Why it's necessary:</strong> Required to respect your privacy choices and comply with privacy regulations.</p>",
    provider: "HubSpot",
    data_collected: "Consent preferences, date of consent",
    third_party_sharing: "None",
    active_status: "Active",
    last_reviewed: "2025-08-10",
    legal_basis: "Necessary"
);

-- Row 3: Essential Cookie - Security
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "1", 
    cookie_name: "__cf_bm",
    purpose: "Bot protection and security",
    duration: "30 minutes",
    description: "<p><strong>Protects against malicious activity:</strong> This cookie helps protect LS Retail's website from automated attacks, spam, and malicious bots that could compromise your data.</p><p><strong>What we collect:</strong> Browser fingerprint data, request patterns, security tokens.</p><p><strong>Provider:</strong> Cloudflare (our CDN security provider).</p><p><strong>Why it's necessary:</strong> Essential for website security and protecting customer data.</p>",
    provider: "Cloudflare",
    data_collected: "Browser fingerprint, request timing, security flags",
    third_party_sharing: "None",
    active_status: "Active",
    last_reviewed: "2025-08-10",
    legal_basis: "Necessary"
);

-- Row 4: Analytics Cookie - Google Analytics
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "2",
    cookie_name: "_ga",
    purpose: "Website analytics and optimization",
    duration: "2 years",
    description: "<p><strong>Helps us improve your experience:</strong> This Google Analytics cookie helps us understand how retail businesses use our website, which pages are most valuable, and how we can improve our content.</p><p><strong>What we collect:</strong> Anonymous usage statistics, page views, time spent on pages, geographic region (country-level only).</p><p><strong>How it helps:</strong> We use this data to optimize our unified commerce solutions content for businesses like yours.</p><p><strong>Privacy note:</strong> Data is anonymized and cannot identify individual users.</p>",
    provider: "Google Analytics",
    data_collected: "Page views, session duration, bounce rate, geographic region",
    third_party_sharing: "Analytics only",
    active_status: "Active",
    last_reviewed: "2025-08-10",
    legal_basis: "Consent"
);

-- Row 5: Analytics Cookie - HubSpot Analytics  
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "2",
    cookie_name: "__hstc",
    purpose: "Visitor behavior and content optimization",
    duration: "13 months", 
    description: "<p><strong>Optimizes content for retail professionals:</strong> This cookie tracks how visitors interact with our LS Central documentation, case studies, and product information to make our content more relevant to retail businesses.</p><p><strong>What we collect:</strong> Page navigation patterns, document downloads, video engagement, form interactions.</p><p><strong>Business benefit:</strong> Helps us create better resources for retailers and identify which LS Central features are most interesting to prospects like you.</p>",
    provider: "HubSpot",
    data_collected: "Page sequence, content engagement, referral source, visitor timeline",
    third_party_sharing: "Analytics only",
    active_status: "Active",
    last_reviewed: "2025-08-10",
    legal_basis: "Consent"
);

-- Row 6: Analytics Cookie - Session Tracking
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "2",
    cookie_name: "__hssc", 
    purpose: "Session analysis and user journey mapping",
    duration: "30 minutes",
    description: "<p><strong>Understands your retail solution research:</strong> Tracks how retail professionals research LS Central features within a single visit, helping us organize our content better.</p><p><strong>What we collect:</strong> Pages visited in sequence, time spent researching different solutions (POS, inventory, etc.), form completions.</p><p><strong>Why it matters:</strong> Helps us understand which LS Central modules are most relevant to different types of retail businesses.</p>",
    provider: "HubSpot", 
    data_collected: "Session pages, visit duration, feature interest patterns",
    third_party_sharing: "None",
    active_status: "Active",
    last_reviewed: "2025-08-10",
    legal_basis: "Consent"
);

-- Row 7: Marketing Cookie - Facebook Pixel
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "3",
    cookie_name: "_fbp",
    purpose: "Targeted retail industry advertising",
    duration: "3 months",
    description: "<p><strong>Shows relevant LS Central content:</strong> Enables us to show targeted information about unified commerce solutions to retail professionals who have shown interest in LS Central.</p><p><strong>What we collect:</strong> Interest in specific LS Central modules (POS, inventory, e-commerce), business type indicators, engagement with retail content.</p><p><strong>Advertising benefit:</strong> Ensures you see relevant case studies, webinars, and product updates for your type of retail business rather than generic advertising.</p><p><strong>Control:</strong> You can opt out while still accessing all LS Retail website content and functionality.</p>",
    provider: "Facebook",
    data_collected: "Content interests, business type signals, page engagement",
    third_party_sharing: "Marketing partners",
    active_status: "Active",
    last_reviewed: "2025-08-10",
    legal_basis: "Consent"
);

-- Row 8: Marketing Cookie - HubSpot CTA Tracking
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "3",
    cookie_name: "__hs_cta_track",
    purpose: "Content personalization for retail solutions",
    duration: "6 months",
    description: "<p><strong>Personalizes your LS Central experience:</strong> Tracks which LS Central features and solutions you're most interested in to show personalized content recommendations.</p><p><strong>What we collect:</strong> Downloads of retail-specific resources, webinar registrations, demo requests, whitepaper interests.</p><p><strong>Personalization benefit:</strong> Shows case studies from your industry, highlights LS Central modules most relevant to your business size, suggests appropriate implementation resources.</p><p><strong>Example:</strong> If you've shown interest in omnichannel retail, we'll prioritize showing you content about LS Central's unified commerce capabilities.</p>",
    provider: "HubSpot",
    data_collected: "Content preferences, resource downloads, feature interests, business needs indicators",
    third_party_sharing: "None",
    active_status: "Active", 
    last_reviewed: "2025-08-10",
    legal_basis: "Consent"
);

-- Row 9: Marketing Cookie - LinkedIn Insight
INSERT INTO LS_Retail_Cookie_Documentation VALUES (
    category_key: "3",
    cookie_name: "_lfa",
    purpose: "B2B retail professional targeting",
    duration: "2 years",
    description: "<p><strong>Reaches retail decision makers:</strong> Helps us identify and reach retail executives, IT directors, and operations managers who would benefit from LS Central's unified commerce platform.</p><p><strong>What we collect:</strong> Professional role indicators, company size signals, retail industry markers, job function relevance to LS Central solutions.</p><p><strong>B2B targeting:</strong> Ensures our LS Central advertising reaches the right decision-makers at retail companies rather than irrelevant audiences.</p><p><strong>Professional benefit:</strong> You'll see LS Central content tailored to your role (e.g., ROI content for executives, technical specs for IT professionals).</p>",
    provider: "LinkedIn",
    data_collected: "Professional context, role relevance, industry signals, company characteristics",
    third_party_sharing: "Marketing partners",
    active_status: "Active",
    last_reviewed: "2025-08-10", 
    legal_basis: "Consent"
);

-- ==============================================
-- Data Validation Queries
-- ==============================================

-- Validate category distribution
-- Should have roughly: 3-4 Essential, 3-4 Analytics, 3-4 Marketing
SELECT category_key, COUNT(*) as cookie_count
FROM LS_Retail_Cookie_Documentation 
WHERE active_status = 'Active'
GROUP BY category_key
ORDER BY category_key;

-- Validate all required fields populated
SELECT cookie_name, category_key, purpose, duration, description
FROM LS_Retail_Cookie_Documentation
WHERE active_status = 'Active'
  AND (category_key IS NULL 
       OR cookie_name IS NULL 
       OR purpose IS NULL 
       OR duration IS NULL 
       OR description IS NULL);
-- Should return 0 rows

-- Check for duplicate cookie names
SELECT cookie_name, COUNT(*) as duplicates
FROM LS_Retail_Cookie_Documentation
WHERE active_status = 'Active'
GROUP BY cookie_name
HAVING COUNT(*) > 1;
-- Should return 0 rows

-- ==============================================
-- JavaScript Integration Code
-- ==============================================

/*
Update in option-a-lsretail-cookie-enhancer.js:

const CONFIG = {
    hubdbTableId: 'YOUR_ACTUAL_TABLE_ID', // Replace with generated table ID
    apiEndpoint: '/hubdb/api/v2/tables',
    // ... rest of config
};

The table ID will be provided after table creation in format: 12345678
*/

-- ==============================================
-- Maintenance Procedures  
-- ==============================================

-- Monthly Review: Check for new cookies
-- 1. Review browser DevTools > Application > Cookies for new entries
-- 2. Add any new cookies to table with proper categorization
-- 3. Update last_reviewed date for existing entries

-- Quarterly Legal Review:  
-- 1. Review legal_basis assignments for GDPR compliance
-- 2. Validate third_party_sharing accuracy
-- 3. Update cookie descriptions for clarity

-- Annual Audit:
-- 1. Verify all cookies in table still exist on website
-- 2. Remove deprecated cookies (set active_status = 'Deprecated')
-- 3. Update duration and description for any changed cookies
-- 4. Legal team review of all cookie descriptions for accuracy

-- ==============================================
-- API Testing Commands
-- ==============================================

-- Test API endpoint after table creation:
-- GET https://api.hubapi.com/hubdb/api/v2/tables/{table_id}/rows?portalId=491011
-- Expected: JSON response with all active cookie data

-- Test category filtering:  
-- GET https://api.hubapi.com/hubdb/api/v2/tables/{table_id}/rows?portalId=491011&category_key=1
-- Expected: Only Essential cookies (category_key = "1")

-- ==============================================
-- Backup & Recovery
-- ==============================================

-- Export data monthly for backup:
-- HubSpot > HubDB > Export Table > CSV format
-- Store with filename: LS_Retail_Cookie_Documentation_YYYY-MM-DD.csv

-- Recovery procedure:
-- 1. Create new table using this schema
-- 2. Import from most recent CSV backup
-- 3. Update table ID in JavaScript config
-- 4. Test API connectivity and data retrieval

-- ==============================================
-- Performance Optimization
-- ==============================================

-- Cache configuration in JavaScript:
-- localStorage key: 'lsretail_option_a_cookies' 
-- Cache duration: 24 hours (86400000ms)
-- Cache invalidation: Check last_reviewed dates

-- API rate limiting:
-- HubSpot allows 100 API calls per 10 seconds
-- Option A makes 1 API call per page load (cached for 24 hours)
-- Expected load: <1% of API quota for typical website traffic

-- Performance monitoring:
-- Track API response times (target: <200ms)
-- Monitor cache hit rates (target: >95%)
-- Alert if API calls exceed 50% of quota

-- ==============================================
-- Security Considerations
-- ==============================================

-- Data classification: Internal/Confidential
-- Access control: Portal administrators only
-- API security: Portal ID validation required
-- Data retention: Keep indefinitely for compliance
-- Audit trail: HubSpot maintains change logs automatically

-- PII considerations: 
-- Cookie data descriptions contain no personal information
-- All examples use generic/anonymized language
-- Safe for public display in cookie consent interface

-- End of Setup Script
-- ==============================================
-- 
-- NEXT STEPS:
-- 1. Create table in HubSpot portal 491011
-- 2. Record the generated table ID 
-- 3. Update table ID in option-a-lsretail-cookie-enhancer.js
-- 4. Test API connectivity with sample queries
-- 5. Verify Option A displays cookie data correctly