import requests
from bs4 import BeautifulSoup
import random
import time
from functools import wraps

# Configurações avançadas
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36"
]

PROXIES = {
    'http': 'http://user:pass@proxy_ip:port',
    'https': 'http://user:pass@proxy_ip:port'
}

def anti_detection(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Delay randômico entre requisições
        time.sleep(random.uniform(1, 5))
        return func(*args, **kwargs)
    return wrapper

class Scraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Accept-Language': 'pt-BR,pt;q=0.9',
            'Referer': 'https://www.google.com/',
            'DNT': '1'
        })
        
    def _rotate_headers(self):
        return {'User-Agent': random.choice(USER_AGENTS)}

    @anti_detection
    def get_html(self, url, timeout=15):
        try:
            response = self.session.get(
                url,
                headers=self._rotate_headers(),
                proxies=PROXIES,
                timeout=timeout
            )
            
            if self._check_captcha(response.text):
                raise Exception("CAPTCHA detectado - Requer intervenção manual")
                
            return response.text
            
        except requests.exceptions.RequestException as e:
            print(f"Erro na requisição: {str(e)}")
            return None

    def _check_captcha(self, html):
        soup = BeautifulSoup(html, 'html.parser')
        return bool(soup.find('div', {'id': 'captcha'}))

    def parse(self, html, selector, method='css', attr=None):
        soup = BeautifulSoup(html, 'html.parser')
        results = []
        
        elements = soup.select(selector) if method == 'css' else soup.find_all(selector)
        
        for element in elements:
            if attr:
                results.append(element.get(attr, ''))
            else:
                results.append(element.get_text(' ', strip=True))
                
        return results

# Uso
if __name__ == "__main__":
    scraper = Scraper()
    
    target_url = "https://cadunico.dataprev.gov.br/portal/"
    html_content = scraper.get_html(target_url)
    
    if html_content:
        data = scraper.parse(html_content, 'div.conteudo-portal', attr='innerHTML')
        print(f"Dados extraídos: {data[:500]}...")
