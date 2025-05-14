# ResumeRadar

A machine learning-powered job application tool that helps job seekers find positions where their qualifications best match the requirements. ResumeRadar analyzes resume content against job listings to provide relevance scores and targeted application recommendations.

## Project Status: Alpha

This open source project aims to reduce resume black hole syndrome by helping candidates focus on opportunities where they're most competitive. The core algorithm uses NLP to compare resume skills and experiences with job posting requirements, calculating match percentages and identifying strength areas.

## Job Crawler System

The job crawler system is a modular, scalable solution for scraping job listings from remote job boards. It uses two different technologies based on the nature of the target website:

- **Crawlee (Node.js)** for JavaScript-heavy sites with dynamic content
- **Scrapy (Python)** for static sites with simple HTML structures

### Features

- Targets remote-friendly job boards
- Handles both static and dynamic websites
- Implements anti-blocking measures (proxy rotation, user agent rotation, request delays)
- Respects robots.txt for ethical scraping
- Standardized JSON output format
- Comprehensive error handling and logging

### Directory Structure

```
/crawlers/
  ├── crawlee_sites/           # JS-heavy sites (Node.js)
  │   ├── base_crawler.js      # Base crawler class
  │   ├── remoteok.js          # RemoteOK crawler
  │   └── index.js             # Entry point for all Crawlee crawlers
  ├── scrapy_sites/            # Static sites (Python)
  │   ├── job_crawler/         # Scrapy project
  │   │   ├── spiders/         # Spider implementations
  │   │   │   ├── base_spider.py     # Base spider class
  │   │   │   └── weworkremotely.py  # WeWorkRemotely spider
  │   │   ├── items.py         # Item definitions
  │   │   ├── pipelines.py     # Item processing pipelines
  │   │   └── settings.py      # Scrapy settings
  └── utils/                   # Shared utilities
      ├── logger.js            # Logging utility
      ├── proxy_rotator.js     # Proxy rotation utility
      └── user_agent_rotator.js # User agent rotation utility
```

### Setup and Installation

#### Prerequisites

- Node.js 14+ and npm
- Python 3.8+ and pip

#### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ResumeRadar.git
   cd ResumeRadar
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

### Usage

#### Running All Crawlers

To run all crawlers (both Crawlee and Scrapy):

```
node index.js
```

#### Running Only Crawlee Crawlers

To run only the JavaScript-based crawlers:

```
npm run crawl:all-js
```

#### Running Individual Crawlers

To run a specific Crawlee crawler:

```
npm run crawl:remoteok
```

To run a specific Scrapy spider:

```
cd crawlers/scrapy_sites
python -m scrapy crawl weworkremotely
```

### Output

All crawled job listings are saved as JSON files in the `data/output` directory. Each job listing contains the following fields:

```json
{
  "job_title": "Senior Software Engineer",
  "company": "Tech Corp",
  "url": "https://remoteok.com/job/123",
  "description": "Build scalable systems...",
  "location": "Remote (Global)",
  "salary": "$80k–$100k",
  "source": "RemoteOK",
  "crawled_at": "2023-05-14T12:34:56.789Z"
}
```

### Extending the System

#### Adding a New Crawlee Crawler

1. Add the site configuration to `data/job_boards.json`
2. Create a new crawler file in `crawlers/crawlee_sites/`
3. Extend the `BaseCrawler` class and implement the `requestHandler` method
4. Add the new crawler to `crawlers/crawlee_sites/index.js`

#### Adding a New Scrapy Spider

1. Add the site configuration to `data/job_boards.json`
2. Create a new spider file in `crawlers/scrapy_sites/job_crawler/spiders/`
3. Extend the `BaseJobSpider` class and implement the `parse` method

### Current Features
- Resume parsing and skill extraction
- Job listing data collection and analysis
- Match scoring based on qualification alignment
- Basic recommendation engine for top-matching positions
