const { chromium } = require('playwright');

async function testCookieBanner() {
    console.log('🚀 Starting Cookie Banner Test with Playwright...\n');
    
    const browser = await chromium.launch({ 
        headless: true,  // Run in headless mode
        slowMo: 100
    });
    
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    try {
        // Navigate to the demo page
        console.log('📍 Navigating to: https://swate101.github.io/lsretail-option-a-cookie-enhancer/');
        await page.goto('https://swate101.github.io/lsretail-option-a-cookie-enhancer/', {
            waitUntil: 'networkidle'
        });
        
        // Take initial screenshot
        await page.screenshot({ path: 'screenshots/01-initial-page.png', fullPage: true });
        console.log('📸 Screenshot saved: 01-initial-page.png');
        
        // Click Show Cookie Banner
        console.log('\n🔘 Clicking "Show Cookie Banner"...');
        await page.click('button:has-text("Show Cookie Banner")');
        await page.waitForTimeout(1000);
        
        // Take screenshot of banner
        await page.screenshot({ path: 'screenshots/02-banner-shown.png', fullPage: true });
        console.log('📸 Screenshot saved: 02-banner-shown.png');
        
        // Click Manage Cookie Preferences
        console.log('🔘 Clicking "Manage Cookie Preferences"...');
        await page.click('#hs-eu-cookie-settings-button');
        await page.waitForTimeout(1000);
        
        // Take screenshot of expanded preferences
        await page.screenshot({ path: 'screenshots/03-preferences-expanded.png', fullPage: true });
        console.log('📸 Screenshot saved: 03-preferences-expanded.png');
        
        // Verify all categories are present
        console.log('\n🔍 Verifying Cookie Categories...');
        const categories = await page.$$eval('.category-label', elements => 
            elements.map(el => el.textContent.trim())
        );
        
        console.log('✅ Found categories:', categories);
        const expectedCategories = ['Essential Cookies', 'Functional Cookies', 'Analytics Cookies', 'Marketing Cookies'];
        
        for (const expected of expectedCategories) {
            if (categories.includes(expected)) {
                console.log(`  ✓ ${expected} - FOUND`);
            } else {
                console.log(`  ✗ ${expected} - MISSING`);
            }
        }
        
        // Check for emojis
        console.log('\n🔍 Checking for emoji icons...');
        const pageContent = await page.content();
        const emojiPattern = /[🔒📊🎯🧩]/g;
        const emojisFound = pageContent.match(emojiPattern);
        
        if (emojisFound) {
            console.log(`  ⚠️ Found ${emojisFound.length} emoji(s):`, emojisFound);
        } else {
            console.log('  ✅ No emojis found - CORRECT');
        }
        
        // Check Essential Cookies for "Always Active"
        console.log('\n🔍 Checking Essential Cookies display...');
        const alwaysActiveElement = await page.$('.always-active-text');
        if (alwaysActiveElement) {
            const alwaysActiveText = await alwaysActiveElement.textContent();
            console.log(`  ✅ Essential Cookies shows: "${alwaysActiveText}"`);
        } else {
            console.log('  ❌ "Always Active" text not found');
        }
        
        // Check button texts
        console.log('\n🔍 Verifying button texts...');
        
        // Save button
        const saveButton = await page.$('button:has-text("Confirm My Choices")');
        if (saveButton) {
            console.log('  ✅ Save button says: "Confirm My Choices"');
        } else {
            const altSaveButton = await page.$('button:has-text("Save Preferences")');
            if (altSaveButton) {
                console.log('  ❌ Save button still says: "Save Preferences" (needs update)');
            }
        }
        
        // Close button
        const settingsButton = await page.$('#hs-eu-cookie-settings-button');
        const settingsButtonText = await settingsButton.textContent();
        console.log(`  ℹ️ Settings button currently says: "${settingsButtonText}"`);
        
        // Test Learn More buttons
        console.log('\n🔍 Testing "Learn More" functionality...');
        
        // Click each Learn More button
        const learnMoreButtons = await page.$$('.learn-more-btn');
        console.log(`  Found ${learnMoreButtons.length} "Learn More" buttons`);
        
        for (let i = 0; i < learnMoreButtons.length; i++) {
            await learnMoreButtons[i].click();
            await page.waitForTimeout(500);
        }
        
        // Take screenshot with all details expanded
        await page.screenshot({ path: 'screenshots/04-all-details-expanded.png', fullPage: true });
        console.log('📸 Screenshot saved: 04-all-details-expanded.png');
        
        // Test toggle functionality for non-essential cookies
        console.log('\n🔍 Testing toggle functionality...');
        const toggles = await page.$$('.toggle:not(.active)');
        console.log(`  Found ${toggles.length} toggleable cookie categories`);
        
        // Click a toggle
        if (toggles.length > 0) {
            await toggles[0].click();
            console.log('  ✅ Toggle clicked successfully');
        }
        
        // Click Confirm My Choices
        console.log('\n🔘 Clicking "Confirm My Choices"...');
        const confirmButton = await page.$('button:has-text("Confirm My Choices")');
        if (confirmButton) {
            await confirmButton.click();
            await page.waitForTimeout(1000);
            console.log('  ✅ Preferences saved');
        }
        
        // Final screenshot
        await page.screenshot({ path: 'screenshots/05-final-state.png', fullPage: true });
        console.log('📸 Screenshot saved: 05-final-state.png');
        
        console.log('\n✅ TEST COMPLETE - All screenshots saved to ./screenshots/');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        await page.screenshot({ path: 'screenshots/error-state.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

// Run the test
testCookieBanner().catch(console.error);