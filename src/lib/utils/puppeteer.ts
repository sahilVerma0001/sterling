/**
 * Get Puppeteer browser configuration for serverless environments
 * Works with Vercel, AWS Lambda, and other serverless platforms
 */
export async function getPuppeteerBrowser() {
  // Always try serverless first - it works in both local and production
  // Only fall back to regular Puppeteer if serverless fails AND we're in local dev
  try {
    console.log("[Puppeteer] Attempting to use serverless Chromium...");
    console.log("[Puppeteer] Environment:", {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      AWS_LAMBDA: process.env.AWS_LAMBDA_FUNCTION_NAME,
    });
    
    const puppeteer = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium");
    
    const executablePath = await chromium.default.executablePath();
    
    console.log("[Puppeteer] Chromium executable path:", executablePath);
    
    return await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: executablePath,
      headless: chromium.default.headless,
    });
  } catch (error: any) {
    console.error("[Puppeteer] Serverless Chromium failed:", error.message);
    console.error("[Puppeteer] Error details:", error);
    
    // Only fall back to regular Puppeteer in local development
    const isLocalDev = process.env.NODE_ENV === 'development' && 
                       !process.env.VERCEL && 
                       !process.env.VERCEL_ENV;
    
    if (isLocalDev) {
      console.log("[Puppeteer] Falling back to regular Puppeteer for local dev");
      try {
        const puppeteer = await import("puppeteer");
        return await puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
          timeout: 30000,
        });
      } catch (fallbackError: any) {
        console.error("[Puppeteer] Fallback also failed:", fallbackError.message);
        throw new Error(`Failed to launch browser: ${error.message}`);
      }
    } else {
      // In production, don't fall back - throw error
      throw new Error(`Failed to launch serverless Chromium: ${error.message}. Ensure @sparticuz/chromium is installed and properly configured.`);
    }
  }
}
