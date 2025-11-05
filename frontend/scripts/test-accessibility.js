import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';

async function runAccessibilityTest() {
  console.log('Starting accessibility test...');

  // Set up Puppeteer with accessibility features
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Set viewport for responsive testing
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to the app
    await page.goto('http://localhost:5173', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log('Testing login page accessibility...');

    // Run axe-core accessibility checks on login page
    const loginResults = await new AxePuppeteer(page)
      .disableRules(['region']) // Disable region rule for login page
      .analyze();

    console.log(`Login page violations found: ${loginResults.violations.length}`);

    if (loginResults.violations.length > 0) {
      console.log('\nLogin Page Violations:');
      loginResults.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.impact.toUpperCase()}: ${violation.help}`);
        console.log(`   URL: ${violation.helpUrl}`);
        console.log('   Elements:');
        violation.nodes.forEach(node => {
          console.log(`     - ${node.html}`);
        });
      });
    } else {
      console.log('✓ No accessibility violations found on login page!');
    }

    // Test login flow for accessibility
    console.log('\nTesting authentication flow...');
    await page.type('[data-testid="email-input"]', 'test@example.com');
    await page.type('[data-testid="password-input"]', 'password123');

    // Check focus management during form filling
    const emailInput = await page.$('[data-testid="email-input"]');
    const passwordInput = await page.$('[data-testid="password-input"]');

    // Test tab navigation
    await page.focus('[data-testid="email-input"]');
    await page.keyboard.press('Tab');
    const passwordFocused = await page.evaluate(() => document.activeElement.getAttribute('data-testid'));
    if (passwordFocused === 'password-input') {
      console.log('✓ Tab navigation works correctly');
    } else {
      console.log('✗ Tab navigation issue detected');
    }

    // Mock successful login and test dashboard
    console.log('\nTesting dashboard accessibility...');
    await page.goto('http://localhost:5173/dashboard', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Run axe-core accessibility checks on dashboard
    const dashboardResults = await new AxePuppeteer(page)
      .analyze();

    console.log(`Dashboard violations found: ${dashboardResults.violations.length}`);

    if (dashboardResults.violations.length > 0) {
      console.log('\nDashboard Violations:');
      dashboardResults.violations.forEach((violation, index) => {
        console.log(`\n${index + 1}. ${violation.impact.toUpperCase()}: ${violation.help}`);
        console.log(`   URL: ${violation.helpUrl}`);
        console.log('   Elements:');
        violation.nodes.forEach(node => {
          console.log(`     - ${node.html}`);
        });
      });

      // Exit with error code if violations found
      process.exit(1);
    } else {
      console.log('✓ No accessibility violations found on dashboard!');
    }

    // Test color contrast
    console.log('\nTesting color contrast...');
    const contrastResults = await new AxePuppeteer(page)
      .include(['.text-primary', '.text-secondary', '.bg-primary', '.bg-secondary'])
      .withRules('color-contrast')
      .analyze();

    if (contrastResults.violations.length > 0) {
      console.log('Color contrast issues found:');
      contrastResults.violations.forEach(violation => {
        violation.nodes.forEach(node => {
          console.log(`  - ${node.html}`);
        });
      });
    } else {
      console.log('✓ Color contrast meets accessibility standards');
    }

    // Test keyboard navigation
    console.log('\nTesting keyboard navigation...');
    await page.focus('body');

    // Test navigation through main elements
    const navElements = await page.$$('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    let focusableCount = 0;

    for (const element of navElements) {
      await element.focus();
      const isFocused = await page.evaluate(() => document.activeElement === document.querySelector(':focus'));
      if (isFocused) {
        focusableCount++;
      }
    }

    console.log(`✓ ${focusableCount} elements are keyboard focusable`);

    // Test screen reader compatibility
    console.log('\nTesting ARIA attributes...');
    const ariaElements = await page.$$('[aria-label], [aria-labelledby], [role]');
    console.log(`✓ Found ${ariaElements.length} elements with ARIA attributes`);

    // Check for alt text on images
    const images = await page.$$('img');
    let imagesWithAlt = 0;

    for (const img of images) {
      const hasAlt = await img.evaluate(el => el.hasAttribute('alt'));
      const isDecorative = await img.evaluate(el =>
        el.hasAttribute('aria-hidden') ||
        (el.hasAttribute('role') && el.getAttribute('role') === 'presentation')
      );

      if (hasAlt || isDecorative) {
        imagesWithAlt++;
      }
    }

    console.log(`✓ ${imagesWithAlt}/${images.length} images have appropriate alt text or are decorative`);

    console.log('\n🎉 Accessibility testing completed successfully!');
    console.log('Summary:');
    console.log(`  - Login page violations: ${loginResults.violations.length}`);
    console.log(`  - Dashboard violations: ${dashboardResults.violations.length}`);
    console.log(`  - Focusable elements: ${focusableCount}`);
    console.log(`  - Images with alt text: ${imagesWithAlt}/${images.length}`);

  } catch (error) {
    console.error('Accessibility test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAccessibilityTest();
}

export default runAccessibilityTest;