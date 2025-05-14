/**
 * Main entry point for the crawler system
 */

const { runAllCrawlers } = require('./crawlers/crawlee_sites/index');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { logger } = require('./crawlers/utils/logger');

/**
 * Run Scrapy spiders
 * @returns {Promise<Array>} Results of Scrapy spiders
 */
async function runScrapySpiders() {
  logger.info('Starting Scrapy spiders');
  
  // Get list of static sites from job_boards.json
  const jobBoards = require('./data/job_boards.json');
  const staticSites = jobBoards.static_sites;
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, 'data/output');
  await fs.ensureDir(outputDir);
  
  // Run each spider
  const results = [];
  for (const site of staticSites) {
    const spiderName = site.name.toLowerCase();
    
    logger.info(`Running Scrapy spider for ${site.name}`);
    
    try {
      // Run Scrapy spider as a child process
      const process = spawn('python', [
        '-m', 'scrapy', 'crawl', spiderName,
        '-o', `${outputDir}/${spiderName}_jobs.json`,
      ], {
        cwd: path.join(__dirname, 'crawlers/scrapy_sites'),
      });
      
      // Wait for process to complete
      await new Promise((resolve, reject) => {
        process.on('close', (code) => {
          if (code === 0) {
            logger.info(`Scrapy spider for ${site.name} completed successfully`);
            results.push({
              site: site.name,
              status: 'success',
            });
            resolve();
          } else {
            logger.error(`Scrapy spider for ${site.name} failed with code ${code}`);
            results.push({
              site: site.name,
              status: 'error',
              error: `Process exited with code ${code}`,
            });
            resolve(); // Resolve anyway to continue with other spiders
          }
        });
        
        process.on('error', (error) => {
          logger.error(`Error running Scrapy spider for ${site.name}: ${error.message}`);
          results.push({
            site: site.name,
            status: 'error',
            error: error.message,
          });
          resolve(); // Resolve anyway to continue with other spiders
        });
      });
    } catch (error) {
      logger.error(`Error running Scrapy spider for ${site.name}: ${error.message}`);
      results.push({
        site: site.name,
        status: 'error',
        error: error.message,
      });
    }
  }
  
  // Log summary
  logger.info('All Scrapy spiders completed');
  logger.info('Results summary:');
  console.table(results);
  
  // Save summary to file
  const summaryPath = path.join(outputDir, 'scrapy_summary.json');
  await fs.writeJson(summaryPath, {
    timestamp: new Date().toISOString(),
    results,
  }, { spaces: 2 });
  
  return results;
}

/**
 * Run all crawlers
 */
async function runAllCrawlerSystems() {
  logger.info('Starting crawler system');
  
  try {
    // Run Crawlee crawlers
    const crawleeResults = await runAllCrawlers();
    
    // Run Scrapy spiders
    const scrapyResults = await runScrapySpiders();
    
    // Combine results
    const allResults = {
      timestamp: new Date().toISOString(),
      crawlee: crawleeResults,
      scrapy: scrapyResults,
    };
    
    // Save combined results
    const outputDir = path.join(__dirname, 'data/output');
    const summaryPath = path.join(outputDir, 'all_crawlers_summary.json');
    await fs.writeJson(summaryPath, allResults, { spaces: 2 });
    
    logger.info('All crawler systems completed successfully');
    logger.info(`Results saved to ${summaryPath}`);
    
    return allResults;
  } catch (error) {
    logger.error(`Error running crawler systems: ${error.message}`);
    throw error;
  }
}

// Run all crawler systems if this file is executed directly
if (require.main === module) {
  (async () => {
    try {
      await runAllCrawlerSystems();
    } catch (error) {
      logger.error(`Error running crawler systems: ${error.message}`);
      process.exit(1);
    }
  })();
}

module.exports = {
  runAllCrawlerSystems,
  runScrapySpiders,
};
