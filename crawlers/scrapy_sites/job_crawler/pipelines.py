"""
Define your item pipelines here
"""

import json
import os
from datetime import datetime
from pathlib import Path


class JobCrawlerPipeline:
    """
    Pipeline for processing job items
    """
    
    def __init__(self):
        self.items = []
        self.output_dir = Path(__file__).parent.parent.parent.parent / 'data' / 'output'
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def process_item(self, item, spider):
        """
        Process each item
        """
        # Add timestamp if not present
        if 'crawled_at' not in item:
            item['crawled_at'] = datetime.now().isoformat()
        
        # Add source if not present
        if 'source' not in item:
            item['source'] = spider.name
        
        # Store item
        self.items.append(dict(item))
        
        return item
    
    def close_spider(self, spider):
        """
        Save items when spider closes
        """
        # Create output file
        output_file = self.output_dir / f"{spider.name}_jobs.json"
        
        # Save items to file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.items, f, ensure_ascii=False, indent=2)
        
        spider.logger.info(f"Saved {len(self.items)} items to {output_file}")
