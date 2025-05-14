"""
Define here the models for your scraped items
"""

import scrapy


class JobItem(scrapy.Item):
    """
    Job item definition
    """
    job_title = scrapy.Field()
    company = scrapy.Field()
    url = scrapy.Field()
    description = scrapy.Field()
    location = scrapy.Field()
    salary = scrapy.Field()
    source = scrapy.Field()
    crawled_at = scrapy.Field()
