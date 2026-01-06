/**
 * Get Puppeteer browser configuration for serverless environments
 * Works with Vercel, AWS Lambda, and other serverless platforms
 */
export async function getPuppeteerBrowser() {
  // Check if we're in a serverless environment (Vercel, Lambda, etc.)
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (isServerless) {
    // Use Chromium for serverless environments
    const puppeteer = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium");
    
    return await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: chromium.default.headless,
    });
  } else {
    // Use local Puppeteer for development
    const puppeteer = await import("puppeteer");
    return await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 30000,
    });
  }
}

