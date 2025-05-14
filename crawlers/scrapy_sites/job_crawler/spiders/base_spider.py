"""
Base spider for all job board spiders
"""

import json
import os
from pathlib import Path
import scrapy
from loguru import logger
from ..items import JobItem


class BaseJobSpider(scrapy.Spider):
    """
    Base spider with common functionality for all job board spiders
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Load job board configuration
        job_boards_path = Path(__file__).parent.parent.parent.parent.parent / 'data' / 'job_boards.json'
        
        with open(job_boards_path, 'r') as f:
            job_boards = json.load(f)
        
        # Find configuration for this spider
        for site in job_boards['static_sites']:
            if site['name'].lower() == self.name.lower():
                self.config = site
                break
        else:
            raise ValueError(f"Configuration for {self.name} not found in job_boards.json")
        
        # Set start URLs from configuration
        self.start_urls = [self.config['url']]
        
        # Set selectors from configuration
        self.selectors = self.config['selectors']
        
        logger.info(f"Initialized {self.name} spider with URL: {self.start_urls[0]}")
    
    def parse(self, response):
        """
        Default parse method - to be overridden by subclasses
        """
        raise NotImplementedError("Subclasses must implement parse method")
    
    def extract_jobs(self, response):
        """
        Extract jobs from response using configured selectors
        """
        jobs = []
        
        # Find all job containers
        job_containers = response.css(self.selectors['job_container'])
        
        self.logger.info(f"Found {len(job_containers)} jobs on {response.url}")
        
        # Extract data from each job container
        for job_container in job_containers:
            job = JobItem()
            
            # Extract job title
            job['job_title'] = self.extract_text(job_container, self.selectors['job_title'])
            
            # Extract company
            job['company'] = self.extract_text(job_container, self.selectors['company'])
            
            # Extract URL
            job_link = job_container.css('a::attr(href)').get()
            if job_link:
                job['url'] = response.urljoin(job_link)
            else:
                job['url'] = response.url
            
            # Extract location
            job['location'] = self.extract_text(job_container, self.selectors['location']) or 'Remote'
            
            # Extract salary
            job['salary'] = self.extract_text(job_container, self.selectors['salary']) or 'Not specified'
            
            # Extract description (if available)
            description_selector = self.selectors.get('description')
            if description_selector:
                job['description'] = self.extract_text(job_container, description_selector)
            else:
                job['description'] = ''
            
            # Add source and timestamp
            job['source'] = self.name
            
            jobs.append(job)
        
        return jobs
    
    def extract_text(self, selector, css_selector):
        """
        Extract text from a CSS selector
        """
        element = selector.css(css_selector)
        if element:
            return element.get().strip()
        return None
