const BaseCrawler = require('./base_crawler');
const { logger } = require('../utils/logger');
const { Dataset } = require('crawlee');

/**
 * RemoteOK crawler
 * Scrapes job listings from RemoteOK
 */
class RemoteOKCrawler extends BaseCrawler {
  constructor() {
    // Load config from job_boards.json
    const jobBoards = require('../../data/job_boards.json');
    const config = jobBoards.js_heavy_sites.find(site => site.name === 'RemoteOK');
    
    if (!config) {
      throw new Error('RemoteOK configuration not found in job_boards.json');
    }
    
    super(config);
  }
  
  /**
   * Handle each request
   */
  async requestHandler({ page, request }) {
    logger.info(`Processing ${request.url}`);
    
    // Wait for job listings to load
    await page.waitForSelector(this.selectors.job_container, { timeout: 30000 });
    
    // Extract job data
    const jobs = await page.evaluate((selectors) => {
      const jobElements = document.querySelectorAll(selectors.job_container);
      
      return Array.from(jobElements).map(job => {
        // Get job URL
        const jobLink = job.querySelector('a[href*="/remote-jobs/"]');
        const jobUrl = jobLink ? new URL(jobLink.href, window.location.origin).href : null;
        
        // Get job description
        const descriptionElement = job.querySelector('.description');
        const description = descriptionElement ? descriptionElement.textContent.trim() : '';
        
        return {
          job_title: job.querySelector(selectors.job_title)?.textContent.trim() || 'Unknown Title',
          company: job.querySelector(selectors.company)?.textContent.trim() || 'Unknown Company',
          url: jobUrl || window.location.href,
          description: description,
          location: job.querySelector(selectors.location)?.textContent.trim() || 'Remote',
          salary: job.querySelector(selectors.salary)?.textContent.trim() || 'Not specified',
          source: 'RemoteOK',
          crawled_at: new Date().toISOString(),
        };
      });
    }, this.selectors);
    
    // Log results
    logger.info(`Found ${jobs.length} jobs on ${request.url}`);
    
    // Save to dataset
    await Dataset.pushData(jobs);
    
    // Check for pagination
    const hasNextPage = await page.evaluate(() => {
      const nextButton = document.querySelector('.pagination a.next');
      return nextButton !== null;
    });
    
    if (hasNextPage) {
      const nextPageUrl = await page.evaluate(() => {
        const nextButton = document.querySelector('.pagination a.next');
        return nextButton.href;
      });
      
      // Add next page to the queue
      await this.crawler.addRequests([nextPageUrl]);
    }
  }
}

// Run the crawler if this file is executed directly
if (require.main === module) {
  (async () => {
    const crawler = new RemoteOKCrawler();
    await crawler.run();
  })();
}

module.exports = RemoteOKCrawler;
