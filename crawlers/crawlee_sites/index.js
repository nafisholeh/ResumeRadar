const RemoteOKCrawler = require('./remoteok');
const { logger } = require('../utils/logger');
const fs = require('fs-extra');
const path = require('path');

/**
 * Run all Crawlee crawlers
 */
async function runAllCrawlers() {
  logger.info('Starting all Crawlee crawlers');
  
  // Get list of JS-heavy sites from job_boards.json
  const jobBoards = require('../../data/job_boards.json');
  const jsSites = jobBoards.js_heavy_sites;
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '../../data/output');
  await fs.ensureDir(outputDir);
  
  // Initialize crawlers
  const crawlers = [
    new RemoteOKCrawler(),
    // Add other crawlers as they are implemented
    // new PowerToFlyCrawler(),
    // new AutoApplyCrawler(),
  ];
  
  // Run crawlers sequentially to avoid overloading resources
  const results = [];
  for (const crawler of crawlers) {
    try {
      const jobsData = await crawler.run();
      results.push({
        site: crawler.name,
        count: jobsData.count,
        status: 'success',
      });
    } catch (error) {
      logger.error(`Error running crawler for ${crawler.name}: ${error.message}`);
      results.push({
        site: crawler.name,
        count: 0,
        status: 'error',
        error: error.message,
      });
    }
  }
  
  // Log summary
  logger.info('All Crawlee crawlers completed');
  logger.info('Results summary:');
  console.table(results);
  
  // Save summary to file
  const summaryPath = path.join(outputDir, 'crawlee_summary.json');
  await fs.writeJson(summaryPath, {
    timestamp: new Date().toISOString(),
    results,
  }, { spaces: 2 });
  
  return results;
}

// Run all crawlers if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await runAllCrawlers();
    } catch (error) {
      logger.error(`Error running crawlers: ${error.message}`);
      process.exit(1);
    }
  })();
}

module.exports = { runAllCrawlers };
