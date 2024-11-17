import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
import re
import logging
import atexit
import signal
import sys
import os
import psutil

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class DynamicWebCrawler:
    def __init__(self, base_url):
        self.base_url = base_url
        self.domain = urlparse(base_url).netloc
        self.visited_urls = set()
        self.to_visit = set([base_url])
        self.products = []
        self.chrome_options = Options()
        self.chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        self.chrome_options.add_argument("--disable-gpu")
        self.chrome_options.add_argument("--no-sandbox")
        self.service = Service(ChromeDriverManager().install())
        self.driver = None
        self.start_time = time.time()
        self.page_count = 0
        self.is_running = True
        signal.signal(signal.SIGINT, self.signal_handler)
        atexit.register(self.cleanup)

    def initialize_driver(self):
        if not self.driver:
            self.driver = webdriver.Chrome(service=self.service, options=self.chrome_options)

    def cleanup(self):
        if self.driver:
            try:
                self.driver.quit()
            except Exception as e:
                logging.error(f"Error while closing WebDriver: {str(e)}")
            finally:
                self.kill_chrome_processes()
                self.driver = None
        logging.info("WebDriver closed and Chrome processes killed.")

    def kill_chrome_processes(self):
        try:
            current_process = psutil.Process(os.getpid())
            children = current_process.children(recursive=True)
            for child in children:
                if 'chrome' in child.name().lower():
                    child.terminate()
            logging.info("Chrome processes terminated.")
        except Exception as e:
            logging.error(f"Error while killing Chrome processes: {str(e)}")

    def signal_handler(self, signum, frame):
        logging.info("Received interrupt signal. Stopping gracefully...")
        self.is_running = False
        self.cleanup()
        self.save_data()
        self.print_stats()
        sys.exit(0)

    def crawl(self):
        try:
            self.initialize_driver()
            while self.to_visit and self.is_running:
                url = self.to_visit.pop()
                logging.info(f"Crawling URL: {url}")
                self._crawl_page(url)
                if self.page_count % 10 == 0:
                    self.print_status()
                    self.save_data()
                time.sleep(2)
        except KeyboardInterrupt:
            logging.info("Crawling interrupted. Saving data...")
        except WebDriverException as e:
            logging.error(f"WebDriver error: {str(e)}")
        except Exception as e:
            logging.error(f"Unexpected error occurred: {str(e)}")
        finally:
            self.save_data()
            self.cleanup()
            self.print_stats()

    def _crawl_page(self, url):
        if url in self.visited_urls:
            return

        self.visited_urls.add(url)
        self.page_count += 1

        try:
            self.driver.get(url)
            WebDriverWait(self.driver, 30).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
            
            time.sleep(2)

            if self.is_product_page():
                product = self.extract_product_info()
                if product:
                    self.products.append(product)
                    logging.info(f"Found product: {product.get('name', 'Unknown')}")
                else:
                    logging.warning(f"Product page detected but no product info extracted: {url}")
            else:
                logging.info("Not a product page, searching for links.")

            self.find_links()

        except TimeoutException:
            logging.warning(f"Timeout while loading {url}")
        except WebDriverException as e:
            logging.error(f"WebDriver error while crawling {url}: {str(e)}")
        except Exception as e:
            logging.error(f"Error crawling {url}: {str(e)}")

    def is_product_page(self):
        price_patterns = [
            r'\d+[,\.]\d+\s*(?:TL|USD|EUR|GBP)',
            r'(?:TL|USD|EUR|GBP)\s*\d+[,\.]\d+',
        ]
        
        page_source = self.driver.page_source
        
        if any(re.search(pattern, page_source) for pattern in price_patterns):
            return True
        
        product_indicators = [
            "add to cart",
            "buy now",
            "product description",
            "specifications",
            "reviews",
            "Sepete Ekle",  # HannAVM için özel gösterge
            "Ürün Özellikleri",  # HannAVM için özel gösterge
        ]
        
        return any(indicator in page_source.lower() for indicator in product_indicators)

    def find_links(self):
        try:
            links = self.driver.find_elements(By.TAG_NAME, "a")
            for link in links:
                href = link.get_attribute("href")
                if href and self.is_valid_url(href) and href not in self.visited_urls and href not in self.to_visit:
                    self.to_visit.add(href)
        except Exception as e:
            logging.error(f"Error finding links: {str(e)}")

    def clean_features(self, features):
        cleaned_features = {}
        current_key = None
        
        for item in features:
            if ':' in item:
                key, value = map(str.strip, item.split(':', 1))
                cleaned_features[key] = value
                current_key = key
            elif '\n' in item:
                key, value = map(str.strip, item.split('\n', 1))
                cleaned_features[key] = value
                current_key = key
            elif current_key and item.strip():
                cleaned_features[current_key] += f" {item.strip()}"
        
        return cleaned_features

    def extract_product_info(self):
        product = {'url': self.driver.current_url}
        
        selectors = {
            'name': [
                "//h2",  # HannAVM için
                "//h1", "//span[@id='productTitle']", "//h1[@class='proName']",
                "//h1[@id='title']", "//div[contains(@class, 'title')]",
                "//span[contains(@class, 'title')]", "//div[contains(@id, 'title')]",
                "//span[contains(@id, 'title')]", "//h1[contains(@class, 'product')]",
                "//h1[contains(@id, 'product')]", "//div[contains(@class, 'product-title')]//h1",
                "//h1[@class='pr-new-br']", "//h1[@class='pr-new-br']/span"
            ],
            'price': [
                "//p[contains(@class, 'product-detail-price')]",  # HannAVM için
                "//span[contains(@class, 'price')]", "//div[contains(@class, 'price')]",
                "//span[@class='a-price-whole']", "//span[contains(@class, 'product-price')]",
                "//span[contains(@id, 'price')]", "//div[contains(@id, 'price')]",
                "//span[@class='a-offscreen']", "//span[@class='a-color-price']",
                "//span[@id='price_inside_buybox']", "//div[@class='newPrice']//ins",
                "//div[@class='priceContainer']//ins", "//div[contains(@class, 'product-price')]",
                "//span[@id='priceblock_ourprice']", "//span[@id='priceblock_dealprice']",
                "//div[contains(@class, 'pricing')]//span",
                "//div[contains(@data-test-id, 'price-current-price')]//span",
                "//div[@class='pr-bx-w']//span[@class='prc-dsc']",
                "//div[@class='pr-bx-nm with-org-prc']//span[@class='prc-dsc']"
            ],
            'description': [
                "//p[contains(@class, 'product-detail-desc')]",  # HannAVM için
                "//div[contains(@class, 'description')]", "//div[@id='productDescription']",
                "//div[contains(@class, 'product-info')]", "//div[@class='product-description']",
                "//div[@class='ProductDescription']", "//div[contains(@id, 'desc')]",
                "//span[contains(@class, 'description')]", "//span[@id='productDescription']",
                "//p[contains(@class, 'product-desc')]", "//p[contains(@id, 'desc')]",
                "//div[@id='productDescription']//p", "//div[@id='aplus']",
                "//div[@id='dpx-aplus-product-description_feature_div']",
                "//div[@class='unf-p-detail']", "//ul[@class='detail-desc-list']",
                "//ul[@class='detail-attr-container']"
            ],
            'features': [
                "//div[@class='product-details']//p",  # HannAVM için
                "//div[contains(@class, 'features')]//li", "//div[@id='feature-bullets']//li",
                "//div[contains(@class, 'product-features')]//li",
                "//table[contains(@class, 'product-specs')]//tr",
                "//ul[contains(@class, 'features-list')]//li",
                "//div[contains(@id, 'feature-list')]//li",
                "//div[contains(@id, 'techSpecs')]//div",
                "//table[contains(@id, 'specs-table')]//tr",
                "//span[contains(@class, 'product-feature')]",
                "//li[contains(@class, 'feature-item')]",
                "//li[contains(@class, 'product-feature')]",
                "//div[contains(@class, 'product-features')]//li",
                "//div[@id='detailBullets_feature_div']//li",
                "//table[@id='productDetails_techSpec_section_1']//tr",
                "//table[@id='productDetails_detailBullets_sections1']//tr",
                "//div[@id='detailBulletsWrapper_feature_div']//li",
                "//div[@class='unf-attribute-cover']//div[@class='unf-attribute-label']",
                "//ul[@class='detail-attr-container']/li",
                "//ul[@class='detail-desc-list']/li"
            ]
        }
        
        for key, selector_list in selectors.items():
            for selector in selector_list:
                if key == 'features':
                    value = self.find_elements_text(selector)
                    if value:
                        product[key] = self.clean_features(value)
                        break
                else:
                    value = self.find_element_text(selector)
                    if value:
                        product[key] = value
                        break
        
        additional_info = self.extract_additional_info()
        product.update(additional_info)
        
        return product if any(product.values()) else None

    def find_element_text(self, xpath):
        try:
            element = self.driver.find_element(By.XPATH, xpath)
            return element.text.strip()
        except:
            return None

    def find_elements_text(self, xpath):
        try:
            elements = self.driver.find_elements(By.XPATH, xpath)
            return [element.text.strip() for element in elements if element.text.strip()]
        except:
            return []

    def extract_additional_info(self):
        additional_info = {}
        
        key_value_selectors = [
            "//table[contains(@class, 'product-info')]//tr",
            "//div[contains(@class, 'product-attributes')]//li",
            "//div[contains(@class, 'specs')]//div[contains(@class, 'spec-row')]",
            "//dl[contains(@class, 'product-features')]//dt | //dl[contains(@class, 'product-features')]//dd",
            "//div[contains(@class, 'product-detail')]//span[contains(@class, 'label')] | //div[contains(@class, 'product-detail')]//span[contains(@class, 'value')]",
            "//table[@id='productDetails_detailBullets_sections1']//tr",
            "//div[@id='detailBulletsWrapper_feature_div']//li",
        ]
        
        for selector in key_value_selectors:
            elements = self.driver.find_elements(By.XPATH, selector)
            for i in range(0, len(elements), 2):
                if i + 1 < len(elements):
                    key = elements[i].text.strip().lower().replace(" ", "_")
                    value = elements[i + 1].text.strip()
                    if key and value:
                        additional_info[key] = value
        
        dynamic_selectors = [
            "//div[contains(@class, 'product-info')]//div[contains(@class, 'row')]",
            "//section[contains(@class, 'product-details')]//div[contains(@class, 'item')]",
            "//ul[contains(@class, 'product-attributes')]//li"
        ]
        
        for selector in dynamic_selectors:
            elements = self.driver.find_elements(By.XPATH, selector)
            for element in elements:
                text = element.text.strip()
                if ':' in text:
                    key, value = map(str.strip, text.split(':', 1))
                    key = key.lower().replace(" ", "_")
                    if key and value:
                        additional_info[key] = value
        
        special_attributes = {
            'brand': [
                "//h2",  # HannAVM için (ürün adı marka olarak kullanılabilir)
                "//span[@class='brand']", "//a[@id='bylineInfo']",
                "//div[contains(@class, 'product-brand')]",
                "//meta[@itemprop='brand']/@content", "//a[@id='brand']",
                "//div[@class='unf-p-title']//a[@class='brand']",
                "//a[@class='product-brand-name-with-link']",
                "//h1[@class='pr-new-br']/a",
            ],
            'rating': [
                "//span[contains(@class, 'rating')]",
                "//div[contains(@class, 'star-rating')]",
                "//span[contains(@class, 'review-rating')]",
                "//div[@class='rating']//span[@class='average']",
                "//span[@id='acrPopover']/@title",
                "//span[@class='a-icon-alt']",
                "//div[@class='ratingCont']//span[@class='ratingScore']",
                "//div[@class='pr-in-rnr']//div[@class='total-review-count']",
                "//div[@class='pr-in-rnr']//div[@class='rating-line-count']",
            ],
            'sku': [
                "//span[@class='sku']",
                "//div[contains(@class, 'product-sku')]",
                "//meta[@itemprop='sku']/@content",
                "//div[@class='shopPoint']//span[@class='point']",
                "//div[@class='pr-in-rnr']//span[@class='total-review-count']",
            ],
            'availability': [
                "//button[contains(@class, 'product-detail-btn')]",  # HannAVM için
                "//div[contains(@class, 'availability')]",
                "//span[contains(@class, 'stock-status')]",
                "//meta[@itemprop='availability']/@content",
                "//span[@class='discountTitle']",
                "//div[@class='merchant-box-wrapper']//span[@class='merchant-text']",
            ]
        }
        
        for attr, selectors in special_attributes.items():
            for selector in selectors:
                try:
                    if selector.endswith('/@content'):
                        value = self.driver.find_element(By.XPATH, selector).get_attribute('content')
                    else:
                        value = self.find_element_text(selector)
                    if value:
                        additional_info[attr] = value.strip()
                        break
                except:
                    continue
        
        try:
            json_ld = self.driver.find_element(By.XPATH, "//script[@type='application/ld+json']")
            json_data = json.loads(json_ld.get_attribute('innerHTML'))
            if isinstance(json_data, list):
                json_data = json_data[0]
            for key, value in json_data.items():
                if isinstance(value, (str, int, float)):
                    additional_info[key.lower()] = str(value)
        except:
            pass
        
        return additional_info

    def is_valid_url(self, url):
        try:
            parsed = urlparse(url)
            return bool(parsed.netloc) and bool(parsed.scheme) and parsed.netloc == self.domain
        except Exception as e:
            logging.error(f"Error validating URL {url}: {str(e)}")
            return False

    def save_data(self):
        filename = f'{self.domain}_products.json'
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.products, f, ensure_ascii=False, indent=4)
        logging.info(f"Saved {len(self.products)} products to {filename}")

    def print_status(self):
        current_time = time.time()
        duration = current_time - self.start_time
        logging.info(f"Crawled {self.page_count} pages in {duration:.2f} seconds. Remaining pages to visit: {len(self.to_visit)}")

    def print_stats(self):
        end_time = time.time()
        duration = end_time - self.start_time
        logging.info(f"Crawling completed. Crawled {self.page_count} pages in {duration:.2f} seconds")
        logging.info(f"Found {len(self.products)} products")
        logging.info(f"Visited URLs: {len(self.visited_urls)}")
        logging.info(f"Remaining URLs to visit: {len(self.to_visit)}")

if __name__ == "__main__":
    base_url = input("Enter the base URL to crawl (e.g., https://www.example.com): ")
    crawler = DynamicWebCrawler(base_url)
    crawler.crawl()