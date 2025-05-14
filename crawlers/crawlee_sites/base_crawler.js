const { PlaywrightCrawler, Dataset } = require('crawlee');
const fs = require('fs-extra');
const path = require('path');
const { getRandomUserAgent } = require('../utils/user_agent_rotator');
const { getRandomProxy } = require('../utils/proxy_rotator');
const { logger } = require('../utils/logger');

/**
 * Base crawler class for JS-heavy sites
 * Provides common functionality for all Crawlee crawlers
 */
class BaseCrawler {
  /**
   * @param {Object} config - Configuration object
   * @param {string} config.name - Name of the job board
   * @param {string} config.url - URL of the job board
   * @param {Object} config.selectors - CSS selectors for job elements
   */
  constructor(config) {
    this.name = config.name;
    this.url = config.url;
    this.selectors = config.selectors;
    this.outputDir = path.join(__dirname, '../../data/output');
    this.maxRetries = 3;
    this.delayBetweenRequests = {
      min: 1000, // 1 second
      max: 5000, // 5 seconds
    };
  }

  /**
   * Initialize the crawler
   */
  async init() {
    // Ensure output directory exists
    await fs.ensureDir(this.outputDir);
    
    // Create crawler instance
    this.crawler = new PlaywrightCrawler({
      maxRequestRetries: this.maxRetries,
      requestHandlerTimeoutSecs: 60,
      navigationTimeoutSecs: 60,
      
      // Add random delay between requests
      requestHandler: this.requestHandler.bind(this),
      
      // Configure proxy and user agent rotation
      preNavigationHooks: [
        async ({ page, request }) => {
          // Set random user agent
          const userAgent = getRandomUserAgent();
          await page.setExtraHTTPHeaders({
            'User-Agent': userAgent,
          });
          
          // Log request
          logger.info(`Crawling ${request.url} with user agent: ${userAgent}`);
          
          // Add random delay
          const delay = Math.floor(
            Math.random() * (this.delayBetweenRequests.max - this.delayBetweenRequests.min) + 
            this.delayBetweenRequests.min
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        },
      ],
      
      // Handle errors
      failedRequestHandler: async ({ request, error }) => {
        logger.error(`Request ${request.url} failed: ${error.message}`);
      },
    });
  }

  /**
   * Handle each request - to be implemented by subclasses
   */
  async requestHandler({ page, request }) {
    throw new Error('requestHandler must be implemented by subclass');
  }

  /**
   * Run the crawler
   */
  async run() {
    logger.info(`Starting crawler for ${this.name}`);
    
    // Initialize crawler if not already initialized
    if (!this.crawler) {
      await this.init();
    }
    
    // Add initial URL to the queue
    await this.crawler.run([this.url]);
    
    // Save results
    const dataset = await Dataset.open(this.name);
    const items = await dataset.getData();
    
    const outputPath = path.join(this.outputDir, `${this.name.toLowerCase()}_jobs.json`);
    await fs.writeJson(outputPath, items, { spaces: 2 });
    
    logger.info(`Crawler for ${this.name} completed. Saved ${items.count} jobs to ${outputPath}`);
    
    return items;
  }
}

module.exports = BaseCrawler;
