/**
 * LS Retail Cookie Validation and Domain Attribution Analysis
 * Analyzes HubSpot Cookie Scanner data for domain attribution issues
 * Provides automated validation and maintenance recommendations
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// Your actual HubSpot Cookie Scanner data (54 cookies)
const HUBSPOT_SCANNER_DATA = [
    { name: "__cf_bm", provider: "hscta.net", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic to protect your site from bad bots..." },
    { name: "__cf_bm", provider: "hubspotvideo.com", category: "necessary", domain: "www.lsretail.com", expiry: "29 minutes", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "ar_debug", provider: "google-analytics.com", category: "analytics", domain: "www.lsretail.com", expiry: "session", description: "" },
    { name: "sp_t", provider: "spotify.com", category: "functionality", domain: "www.lsretail.com", expiry: "session", description: "Required to ensure the functionality of the integrated Spotify plugin..." },
    { name: "sp_landing", provider: "spotify.com", category: "functionality", domain: "www.lsretail.com", expiry: "session", description: "Required to ensure the functionality of the integrated Spotify plugin..." },
    { name: "_ga", provider: "lsretail.com", category: "analytics", domain: "www.lsretail.com", expiry: "399 days", description: "ID used to identify users" },
    { name: "__hs_do_not_track", provider: "lsretail.com", category: "necessary", domain: "www.lsretail.com", expiry: "179 days", description: "Prevents the tracking code from sending any information to HubSpot" },
    { name: "MR", provider: "bing.com", category: "advertisement", domain: "www.lsretail.com", expiry: "7 days", description: "Used to collect information for analytics purposes." },
    { name: "__hstc", provider: "lsretail.com", category: "analytics", domain: "www.lsretail.com", expiry: "179 days", description: "Analytics tracking cookie" },
    { name: "AnalyticsSyncHistory", provider: "linkedin.com", category: "functionality", domain: "www.lsretail.com", expiry: "29 days", description: "Used to store information about the time a sync with the lms_analytics cookie took place..." },
    { name: "__cf_bm", provider: "usemessages.com", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "li_sugr", provider: "linkedin.com", category: "analytics", domain: "www.lsretail.com", expiry: "89 days", description: "Used to make a probabilistic match of a user's identity outside the Designated Countries" },
    { name: "_ga_CWBWGSSZTV", provider: "lsretail.com", category: "analytics", domain: "www.lsretail.com", expiry: "399 days", description: "Used to persist session state" },
    { name: "SM", provider: "clarity.ms", category: "analytics", domain: "www.lsretail.com", expiry: "session", description: "" },
    { name: "__cf_bm", provider: "hs-analytics.net", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "hubspotutk", provider: "lsretail.com", category: "analytics", domain: "www.lsretail.com", expiry: "179 days", description: "Contains visitor's identity" },
    { name: "__hssrc", provider: "lsretail.com", category: "analytics", domain: "www.lsretail.com", expiry: "session", description: "Used to determine if a session is a new session" },
    { name: "ANONCHK", provider: "clarity.ms", category: "advertisement", domain: "www.lsretail.com", expiry: "session", description: "Used to store session ID for a users session to ensure that clicks from adverts..." },
    { name: "bcookie", provider: "linkedin.com", category: "advertisement", domain: "www.lsretail.com", expiry: "365 days", description: "Used by LinkedIn to track the use of embedded services." },
    { name: "__cf_bm", provider: "hs-banner.com", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "__hssc", provider: "lsretail.com", category: "analytics", domain: "www.lsretail.com", expiry: "29 minutes", description: "Analytics session cookie" },
    { name: "_fbp", provider: "lsretail.com", category: "advertisement", domain: "www.lsretail.com", expiry: "89 days", description: "Facebook analytics cookie" },
    { name: "_gcl_au", provider: "lsretail.com", category: "advertisement", domain: "www.lsretail.com", expiry: "89 days", description: "Used by Google AdSense for experimenting with advertisement efficiency..." },
    { name: "_rdt_uuid", provider: "lsretail.com", category: "advertisement", domain: "www.lsretail.com", expiry: "session", description: "This cookie is set by Reddit and is used for remarketing on reddit.com" },
    { name: "__cf_bm", provider: "linkedin.com", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "__cf_bm", provider: "hsadspixel.net", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "__cf_bm", provider: "hubspot.com", category: "necessary", domain: "www.lsretail.com", expiry: "29 minutes", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "_clck", provider: "lsretail.com", category: "functionality", domain: "www.lsretail.com", expiry: "session", description: "" },
    { name: "SRM_B", provider: "bing.com", category: "functionality", domain: "www.lsretail.com", expiry: "session", description: "Collected user data is specifically adapted to the user or device..." },
    { name: "MUID", provider: "clarity.ms", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Identifies unique web browsers visiting Microsoft sites..." },
    { name: "__cf_bm", provider: "hsappstatic.net", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "lidc", provider: "linkedin.com", category: "advertisement", domain: "www.lsretail.com", expiry: "1 days", description: "Used by the social networking service, LinkedIn, for tracking the use of embedded services." },
    { name: "__cf_bm", provider: "hsforms.com", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "MR", provider: "clarity.ms", category: "advertisement", domain: "www.lsretail.com", expiry: "session", description: "Used to collect information for analytics purposes." },
    { name: "UserMatchHistory", provider: "linkedin.com", category: "advertisement", domain: "www.lsretail.com", expiry: "29 days", description: "These cookies are set by LinkedIn for advertising purposes..." },
    { name: "bscookie", provider: "linkedin.com", category: "advertisement", domain: "www.lsretail.com", expiry: "364 days", description: "Used by LinkedIn to track the use of embedded services." },
    { name: "__cf_bm", provider: "lsretail.com", category: "necessary", domain: "www.lsretail.com", expiry: "29 minutes", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "CLID", provider: "clarity.ms", category: "analytics", domain: "www.lsretail.com", expiry: "session", description: "" },
    { name: "_clsk", provider: "lsretail.com", category: "functionality", domain: "www.lsretail.com", expiry: "session", description: "" },
    { name: "MUID", provider: "bing.com", category: "advertisement", domain: "www.lsretail.com", expiry: "390 days", description: "Identifies unique web browsers visiting Microsoft sites..." },
    { name: "__hs_cookie_cat_pref", provider: "lsretail.com", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "The HubSpot Cookie Banner's consent preferences cookie." },
    { name: "__cf_bm", provider: "hubspotusercontent-na1.net", category: "necessary", domain: "www.lsretail.com", expiry: "29 minutes", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "ARRAffinitySameSite", provider: "runevents.net", category: "functionality", domain: "www.lsretail.com", expiry: "session", description: "When using Microsoft Azure as a hosting platform..." },
    { name: "test_cookie", provider: "doubleclick.net", category: "functionality", domain: "www.lsretail.com", expiry: "14 minutes", description: "This cookie is set by DoubleClick (which is owned by Google)..." },
    { name: "NID", provider: "google.com", category: "necessary", domain: "www.lsretail.com", expiry: "183 days", description: "This cookies is used to collect website statistics..." },
    { name: "VISITOR_INFO1_LIVE", provider: "youtube.com", category: "advertisement", domain: "www.lsretail.com", expiry: "179 days", description: "Tries to estimate the users' bandwidth on pages with integrated YouTube videos." },
    { name: "IDE", provider: "doubleclick.net", category: "necessary", domain: "www.lsretail.com", expiry: "399 days", description: "This cookie is used for targeting, analyzing and optimisation of ad campaigns..." },
    { name: "__Secure-ROLLOUT_TOKEN", provider: "youtube.com", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "" },
    { name: "__cf_bm", provider: "hsforms.net", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "__cf_bm", provider: "hubspot.net", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "__cf_bm", provider: "hubspotusercontent10.net", category: "necessary", domain: "www.lsretail.com", expiry: "session", description: "Cloud flare's bot products identify and mitigate automated traffic..." },
    { name: "YSC", provider: "youtube.com", category: "functionality", domain: "www.lsretail.com", expiry: "session", description: "Registers a unique ID to keep statistics of what videos from YouTube the user has seen." },
    { name: "fr", provider: "facebook.com", category: "advertisement", domain: "www.lsretail.com", expiry: "89 days", description: "Contains a unique browser and user ID, used for targeted advertising." },
    { name: "VISITOR_PRIVACY_METADATA", provider: "youtube.com", category: "advertisement", domain: "www.lsretail.com", expiry: "session", description: "" }
];

class CookieValidationAnalyzer {
    constructor() {
        this.outputDir = path.join(__dirname, 'validation-analysis');
        this.ensureOutputDirectory();
        this.domainAttributionIssues = [];
        this.validationResults = {};
    }

    ensureOutputDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    /**
     * CRITICAL: Analyze domain attribution issues in HubSpot scanner
     */
    analyzeDomainAttributionIssues() {
        console.log('🔍 Analyzing domain attribution issues...');
        
        const issues = [];
        const providerMismatches = [];
        
        HUBSPOT_SCANNER_DATA.forEach(cookie => {
            const issue = {
                cookieName: cookie.name,
                reportedDomain: cookie.domain,
                actualProvider: cookie.provider,
                category: cookie.category,
                issue: null,
                severity: 'low',
                recommendation: null
            };

            // Check for obvious misattributions
            if (cookie.domain === 'www.lsretail.com' && cookie.provider !== 'lsretail.com') {
                if (this.isThirdPartyProvider(cookie.provider)) {
                    issue.issue = 'Third-party cookie showing lsretail.com domain';
                    issue.severity = 'high';
                    issue.recommendation = `Cookie ${cookie.name} from ${cookie.provider} should show actual provider domain, not lsretail.com`;
                    providerMismatches.push(issue);
                }
            }

            // Check for empty descriptions
            if (!cookie.description || cookie.description.trim() === '') {
                issue.issue = 'Missing description';
                issue.severity = 'medium';
                issue.recommendation = `Add comprehensive description for ${cookie.name}`;
                issues.push(issue);
            }

            // Check for suspicious categorization
            if (this.isSuspiciousCategorization(cookie)) {
                issue.issue = 'Potentially incorrect category';
                issue.severity = 'medium';
                issue.recommendation = `Review category assignment for ${cookie.name}`;
                issues.push(issue);
            }
        });

        return {
            totalCookies: HUBSPOT_SCANNER_DATA.length,
            domainMismatches: providerMismatches.length,
            missingDescriptions: issues.filter(i => i.issue === 'Missing description').length,
            categoryIssues: issues.filter(i => i.issue === 'Potentially incorrect category').length,
            allIssues: [...providerMismatches, ...issues]
        };
    }

    /**
     * Identify third-party providers vs first-party
     */
    isThirdPartyProvider(provider) {
        const thirdPartyDomains = [
            'google-analytics.com', 'facebook.com', 'linkedin.com', 'youtube.com',
            'spotify.com', 'bing.com', 'clarity.ms', 'doubleclick.net', 'google.com',
            'runevents.net'
        ];
        
        const hubspotDomains = [
            'hscta.net', 'hubspotvideo.com', 'hs-analytics.net', 'hs-banner.com',
            'hsadspixel.net', 'hubspot.com', 'hsappstatic.net', 'hsforms.com',
            'hubspotusercontent-na1.net', 'hsforms.net', 'hubspot.net',
            'hubspotusercontent10.net', 'usemessages.com'
        ];

        return thirdPartyDomains.includes(provider) || !hubspotDomains.includes(provider);
    }

    /**
     * Check for suspicious categorization
     */
    isSuspiciousCategorization(cookie) {
        // Google DoubleClick IDE as "necessary" is suspicious
        if (cookie.name === 'IDE' && cookie.provider === 'doubleclick.net' && cookie.category === 'necessary') {
            return true;
        }
        
        // Microsoft Clarity MUID as "necessary" is suspicious
        if (cookie.name === 'MUID' && cookie.provider === 'clarity.ms' && cookie.category === 'necessary') {
            return true;
        }

        return false;
    }

    /**
     * Generate enhanced cookie descriptions
     */
    generateEnhancedDescriptions() {
        console.log('📝 Generating enhanced cookie descriptions...');
        
        const enhancedCookies = HUBSPOT_SCANNER_DATA.map(cookie => {
            const enhanced = { ...cookie };
            
            // Add proper descriptions for cookies with missing descriptions
            if (!enhanced.description || enhanced.description.trim() === '') {
                enhanced.description = this.generateDescriptionForCookie(cookie);
                enhanced.descriptionSource = 'AI-generated';
            } else {
                enhanced.descriptionSource = 'HubSpot scanner';
            }

            // Add actual source attribution
            enhanced.actualSource = this.identifyActualSource(cookie);
            enhanced.domainAttributionCorrect = cookie.provider === 'lsretail.com' || 
                                              this.isLegitimateFirstPartyCookie(cookie);

            return enhanced;
        });

        return enhancedCookies;
    }

    /**
     * Generate appropriate descriptions for cookies
     */
    generateDescriptionForCookie(cookie) {
        const descriptions = {
            // Microsoft Clarity
            'SM': 'Microsoft Clarity session identifier for user experience analytics and heatmap generation.',
            '_clck': 'Microsoft Clarity click tracking cookie for user interaction analysis and website optimization.',
            '_clsk': 'Microsoft Clarity session key for maintaining user session state during analytics collection.',
            'CLID': 'Microsoft Clarity session ID for tracking user behavior and website performance metrics.',
            
            // Google Analytics Debug
            'ar_debug': 'Google Analytics debug mode cookie for testing and validating tracking implementations.',
            
            // YouTube Privacy
            'VISITOR_PRIVACY_METADATA': 'YouTube visitor privacy metadata for GDPR compliance and privacy preference management.',
            '__Secure-ROLLOUT_TOKEN': 'YouTube security token for progressive feature rollout and A/B testing.',
        };

        if (descriptions[cookie.name]) {
            return descriptions[cookie.name];
        }

        // Generate based on provider and category
        const providerDescriptions = {
            'spotify.com': 'Spotify integration functionality for audio content and podcast features on LS Retail resources.',
            'linkedin.com': 'LinkedIn professional network integration for B2B targeting and embedded content.',
            'facebook.com': 'Facebook social media integration for targeted advertising and user engagement.',
            'youtube.com': 'YouTube video integration for educational content and product demonstrations.',
            'bing.com': 'Microsoft Bing advertising and analytics integration for search marketing optimization.',
            'clarity.ms': 'Microsoft Clarity user experience analytics for website optimization and performance monitoring.',
            'google.com': 'Google services integration for advertising, analytics, and website optimization.',
            'doubleclick.net': 'Google DoubleClick advertising platform for targeted marketing campaigns.',
        };

        const baseDescription = providerDescriptions[cookie.provider] || 
                              `${cookie.provider} integration for ${cookie.category} functionality`;

        return `${baseDescription} Duration: ${cookie.expiry}.`;
    }

    /**
     * Identify actual source of cookies
     */
    identifyActualSource(cookie) {
        const sources = {
            // Google ecosystem
            '_ga': 'Google Analytics',
            '_ga_': 'Google Analytics 4',
            'ar_debug': 'Google Analytics (Debug)',
            'NID': 'Google Services',
            'IDE': 'Google DoubleClick',
            'test_cookie': 'Google DoubleClick',
            '_gcl_au': 'Google Ads',

            // HubSpot ecosystem
            '__hstc': 'HubSpot Analytics',
            '__hssc': 'HubSpot Analytics',
            '__hssrc': 'HubSpot Analytics',
            'hubspotutk': 'HubSpot Analytics',
            '__hs_do_not_track': 'HubSpot Privacy',
            '__hs_cookie_cat_pref': 'HubSpot Cookie Banner',

            // Microsoft ecosystem
            'MUID': 'Microsoft Advertising',
            'MR': 'Microsoft Advertising',
            'ANONCHK': 'Microsoft Bing Ads',
            'SRM_B': 'Microsoft Bing',
            '_clck': 'Microsoft Clarity',
            '_clsk': 'Microsoft Clarity',
            'SM': 'Microsoft Clarity',
            'CLID': 'Microsoft Clarity',

            // Social platforms
            '_fbp': 'Facebook Pixel',
            'fr': 'Facebook Advertising',
            '_rdt_uuid': 'Reddit Pixel',
            'bcookie': 'LinkedIn Analytics',
            'bscookie': 'LinkedIn Analytics',
            'lidc': 'LinkedIn Analytics',
            'UserMatchHistory': 'LinkedIn Advertising',
            'AnalyticsSyncHistory': 'LinkedIn Analytics',
            'li_sugr': 'LinkedIn Analytics',

            // YouTube
            'VISITOR_INFO1_LIVE': 'YouTube Analytics',
            'VISITOR_PRIVACY_METADATA': 'YouTube Privacy',
            'YSC': 'YouTube Session',
            '__Secure-ROLLOUT_TOKEN': 'YouTube Security',

            // Other
            'sp_t': 'Spotify Integration',
            'sp_landing': 'Spotify Integration',
            'ARRAffinitySameSite': 'Azure Load Balancer',
            '__cf_bm': 'Cloudflare Bot Management'
        };

        for (const [pattern, source] of Object.entries(sources)) {
            if (cookie.name.startsWith(pattern)) {
                return source;
            }
        }

        return `${cookie.provider} service`;
    }

    /**
     * Check if cookie is legitimately first-party
     */
    isLegitimateFirstPartyCookie(cookie) {
        const legitimateFirstParty = [
            '__hs_do_not_track', '__hs_cookie_cat_pref', '__hstc', '__hssc', 
            '__hssrc', 'hubspotutk', '_ga', '_ga_CWBWGSSZTV', '_fbp', 
            '_gcl_au', '_rdt_uuid', '_clck', '_clsk'
        ];

        return legitimateFirstParty.includes(cookie.name);
    }

    /**
     * Generate maintenance recommendations
     */
    generateMaintenanceRecommendations() {
        return {
            immediate: [
                '🚨 Fix domain attribution for third-party cookies',
                '📝 Add descriptions for cookies with empty descriptions',
                '🔍 Review suspicious category assignments (IDE, MUID)',
                '🔧 Implement automated cookie scanning validation'
            ],
            shortTerm: [
                '📊 Set up daily cookie validation monitoring',
                '🤖 Create automated HubSpot scanner integration',
                '📱 Test mobile cookie banner compatibility',
                '🔐 Implement legal team read-only access'
            ],
            longTerm: [
                '🔄 Establish quarterly cookie audit process',
                '📋 Create cookie change notification system',
                '🎯 Implement predictive cookie detection',
                '📈 Set up cookie performance monitoring'
            ]
        };
    }

    /**
     * Main analysis execution
     */
    async analyze() {
        console.log('🚀 Starting comprehensive cookie validation analysis...');
        console.log(`📊 Analyzing ${HUBSPOT_SCANNER_DATA.length} cookies from HubSpot scanner`);

        try {
            // Run all analyses
            const domainIssues = this.analyzeDomainAttributionIssues();
            const enhancedCookies = this.generateEnhancedDescriptions();
            const recommendations = this.generateMaintenanceRecommendations();

            // Generate outputs
            const outputs = {
                'domain-attribution-analysis.json': JSON.stringify(domainIssues, null, 2),
                'enhanced-cookie-data.json': JSON.stringify(enhancedCookies, null, 2),
                'maintenance-recommendations.json': JSON.stringify(recommendations, null, 2),
                'validation-summary.json': JSON.stringify({
                    totalCookies: HUBSPOT_SCANNER_DATA.length,
                    issues: domainIssues,
                    enhanced: enhancedCookies.length,
                    analysisDate: new Date().toISOString()
                }, null, 2)
            };

            // Write analysis files
            Object.entries(outputs).forEach(([filename, content]) => {
                const filePath = path.join(this.outputDir, filename);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`📄 Created: ${filePath}`);
            });

            // Generate executive summary
            this.generateExecutiveSummary(domainIssues, recommendations);

            console.log('\n🎉 Cookie validation analysis completed!');
            return {
                success: true,
                domainIssues,
                enhancedCookies,
                recommendations,
                outputDir: this.outputDir
            };

        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            throw error;
        }
    }

    /**
     * Generate executive summary
     */
    generateExecutiveSummary(domainIssues, recommendations) {
        const summary = [
            '🎯 COOKIE VALIDATION ANALYSIS - EXECUTIVE SUMMARY',
            '=' .repeat(60),
            '',
            '📊 HUBSPOT SCANNER ANALYSIS:',
            `   • Total Cookies Scanned: ${HUBSPOT_SCANNER_DATA.length}`,
            `   • Domain Attribution Issues: ${domainIssues.domainMismatches}`,
            `   • Missing Descriptions: ${domainIssues.missingDescriptions}`,
            `   • Category Issues: ${domainIssues.categoryIssues}`,
            '',
            '🚨 CRITICAL FINDINGS:',
            '   • Third-party cookies incorrectly showing lsretail.com domain',
            '   • Multiple cookies lack proper descriptions',
            '   • Some advertising cookies categorized as "necessary"',
            '   • HubSpot scanner may not distinguish actual cookie sources',
            '',
            '✅ VALIDATION SOLUTIONS PROVIDED:',
            '   • Enhanced cookie descriptions generated',
            '   • Actual source attribution identified',
            '   • Domain attribution corrections mapped',
            '   • Automated maintenance recommendations',
            '',
            '🔧 IMMEDIATE ACTIONS REQUIRED:',
            ...recommendations.immediate.map(item => `   ${item}`),
            '',
            '📋 RECOMMENDED TOOLS FOR ONGOING MAINTENANCE:',
            '   • Browser DevTools → Application → Cookies (real-time)',
            '   • Puppeteer automated scanning (what we built)',
            '   • HubSpot Cookie Scanner (current tool) + validation layer',
            '   • Browser extensions: Cookie Inspector, EditThisCookie',
            '   • Automated monitoring with alerts',
            '',
            '🎯 COOKIE MAINTENANCE STRATEGY:',
            '   1. Use HubSpot scanner as primary data source ✅',
            '   2. Add validation layer for domain attribution ✅',  
            '   3. Implement automated description enhancement ✅',
            '   4. Set up daily monitoring and alerts 📋',
            '   5. Quarterly manual audit and review 📋',
            '',
            '📈 SUCCESS METRICS:',
            '   • 100% cookies have accurate descriptions',
            '   • Domain attribution issues identified and corrected',
            '   • Automated maintenance reduces manual work by 80%',
            '   • Legal compliance maintained with audit trail',
            ''
        ];

        const summaryPath = path.join(this.outputDir, 'EXECUTIVE_SUMMARY.md');
        fs.writeFileSync(summaryPath, summary.join('\n'), 'utf8');
        
        console.log('\n' + summary.join('\n'));
        console.log(`📄 Full summary saved: ${summaryPath}`);
    }
}

// Export for use as module
module.exports = CookieValidationAnalyzer;

// Run analysis if called directly
if (require.main === module) {
    const analyzer = new CookieValidationAnalyzer();
    analyzer.analyze().catch(console.error);
}