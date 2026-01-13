const express = require('express');
const Scraper = require('./scraper');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const scraper = new Scraper();

app.post('/scrape', async (req, res) => {
    const { url, selector, attr } = req.body;

    if (!url || !selector) {
        return res.status(400).json({ error: 'URL e selector são obrigatórios.' });
    }

    try {
        const html = await scraper.getHtml(url);

        if (!html) {
            return res.status(500).json({ error: 'Falha ao obter HTML.' });
        }

        const data = scraper.parse(html, selector, attr);

        res.json({
            url,
            count: data.length,
            data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Scraper service is running' });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
