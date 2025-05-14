"""
Spider for WeWorkRemotely job board
"""

from .base_spider import BaseJobSpider


class WeWorkRemotelySpider(BaseJobSpider):
    """
    Spider for scraping jobs from WeWorkRemotely
    """
    name = 'weworkremotely'
    
    def parse(self, response):
        """
        Parse job listings page
        """
        # Extract jobs from the page
        jobs = self.extract_jobs(response)
        
        # Yield each job
        for job in jobs:
            yield job
        
        # Check for pagination
        next_page = response.css('a.next_page::attr(href)').get()
        if next_page:
            next_url = response.urljoin(next_page)
            self.logger.info(f"Following pagination to: {next_url}")
            yield response.follow(next_url, callback=self.parse)
    
    def extract_jobs(self, response):
        """
        Extract jobs from WeWorkRemotely
        """
        jobs = super().extract_jobs(response)
        
        # WeWorkRemotely specific processing
        for job in jobs:
            # Clean up job title (remove any "New!" or similar tags)
            if job['job_title']:
                job['job_title'] = job['job_title'].replace('New!', '').strip()
            
            # Ensure location is marked as Remote
            if not job['location'] or 'remote' not in job['location'].lower():
                job['location'] = 'Remote'
        
        return jobs
