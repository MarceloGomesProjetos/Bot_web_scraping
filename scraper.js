const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.6045.163 Mobile Safari/537.36"
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Random delay between 1 and 5 seconds (1000 to 5000 ms)
const getRandomDelay = () => Math.floor(Math.random() * (5000 - 1000 + 1) + 1000);

class Scraper {
    constructor() {
        this.baseHeaders = {
            'Accept-Language': 'pt-BR,pt;q=0.9',
            'Referer': 'https://www.google.com/',
            'DNT': '1'
        };
    }

    _rotateHeaders() {
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        return {
            ...this.baseHeaders,
            'User-Agent': userAgent
        };
    }

    async getHtml(url) {
        // Anti-detection delay
        const delay = getRandomDelay();
        console.log(`Waiting for ${delay}ms...`);
        await sleep(delay);

        try {
            const headers = this._rotateHeaders();
            const response = await axios.get(url, {
                headers,
                timeout: 15000
            });

            if (this._checkCaptcha(response.data)) {
                 throw new Error("CAPTCHA detectado - Requer intervenção manual");
            }

            return response.data;
        } catch (error) {
            console.error(`Erro na requisição: ${error.message}`);
            return null;
        }
    }

    _checkCaptcha(html) {
        if (!html) return false;
        const $ = cheerio.load(html);
        return $('#captcha').length > 0;
    }

    parse(html, selector, attr = null) {
        if (!html) return [];
        const $ = cheerio.load(html);
        const results = [];

        $(selector).each((i, element) => {
            if (attr) {
                if (attr === 'innerHTML') {
                     results.push($(element).html());
                } else {
                     results.push($(element).attr(attr) || '');
                }
            } else {
                results.push($(element).text().trim());
            }
        });

        return results;
    }
}

module.exports = Scraper;
