const puppeteer = require('puppeteer');

async function testCookieBanner() {
    console.log('🚀 Starting Cookie Banner Test with Puppeteer...\n');
    
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    try {
        // Navigate to the demo page
        console.log('📍 Navigating to: https://swate101.github.io/lsretail-option-a-cookie-enhancer/');
        await page.goto('https://swate101.github.io/lsretail-option-a-cookie-enhancer/', {
            waitUntil: 'networkidle0'
        });
        
        // Take initial screenshot
        await page.screenshot({ path: 'screenshots/01-initial-page.png', fullPage: true });
        console.log('📸 Screenshot saved: 01-initial-page.png');
        
        // Click Show Cookie Banner
        console.log('\n🔘 Clicking "Show Cookie Banner"...');
        await page.click('button::-p-text(Show Cookie Banner)');
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
        const categories = await page.evaluate(() => {
            const elements = document.querySelectorAll('.category-label');
            return Array.from(elements).map(el => el.textContent.trim());
        });
        
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
        const alwaysActiveText = await page.evaluate(() => {
            const element = document.querySelector('.always-active-text');
            return element ? element.textContent : null;
        });
        
        if (alwaysActiveText) {
            console.log(`  ✅ Essential Cookies shows: "${alwaysActiveText}"`);
        } else {
            console.log('  ❌ "Always Active" text not found');
        }
        
        // Check button texts
        console.log('\n🔍 Verifying button texts...');
        
        // Save button
        const saveButtonText = await page.evaluate(() => {
            const button = Array.from(document.querySelectorAll('button')).find(b => 
                b.textContent.includes('Confirm My Choices') || b.textContent.includes('Save Preferences')
            );
            return button ? button.textContent.trim() : null;
        });
        
        if (saveButtonText === 'Confirm My Choices') {
            console.log('  ✅ Save button says: "Confirm My Choices"');
        } else {
            console.log(`  ℹ️ Save button says: "${saveButtonText}"`);
        }
        
        // Close button
        const settingsButtonText = await page.evaluate(() => {
            const button = document.getElementById('hs-eu-cookie-settings-button');
            return button ? button.textContent.trim() : null;
        });
        console.log(`  ℹ️ Settings button currently says: "${settingsButtonText}"`);
        
        // Test Learn More buttons
        console.log('\n🔍 Testing "Learn More" functionality...');
        
        // Count Learn More buttons
        const learnMoreCount = await page.evaluate(() => {
            return document.querySelectorAll('.learn-more-btn').length;
        });
        console.log(`  Found ${learnMoreCount} "Learn More" buttons`);
        
        // Click each Learn More button
        for (let i = 0; i < learnMoreCount; i++) {
            await page.evaluate((index) => {
                const buttons = document.querySelectorAll('.learn-more-btn');
                if (buttons[index]) buttons[index].click();
            }, i);
            await page.waitForTimeout(500);
        }
        
        // Take screenshot with all details expanded
        await page.screenshot({ path: 'screenshots/04-all-details-expanded.png', fullPage: true });
        console.log('📸 Screenshot saved: 04-all-details-expanded.png');
        
        // Test toggle functionality for non-essential cookies
        console.log('\n🔍 Testing toggle functionality...');
        const toggleCount = await page.evaluate(() => {
            return document.querySelectorAll('.toggle:not(.active)').length;
        });
        console.log(`  Found ${toggleCount} toggleable cookie categories`);
        
        // Click Confirm My Choices
        console.log('\n🔘 Clicking "Confirm My Choices"...');
        const confirmClicked = await page.evaluate(() => {
            const button = Array.from(document.querySelectorAll('button')).find(b => 
                b.textContent.includes('Confirm My Choices')
            );
            if (button) {
                button.click();
                return true;
            }
            return false;
        });
        
        if (confirmClicked) {
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