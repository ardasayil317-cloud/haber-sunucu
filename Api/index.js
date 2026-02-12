const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

// Ana sayfa - test
app.get('/', (req, res) => {
  res.send('Haber Sunucu Çalışıyor! 🚀');
});

// HABER API - Gerçek Gündem
app.get('/api/gercekgundem', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.gercekgundem.com/son-dakika-haberleri');
    const $ = cheerio.load(data);
    const haberler = [];

    // Siteye özel seçici (kendin sitene göre değiştireceksin)
    $('article .title a, .news-title a, h2 a').each((i, el) => {
      const baslik = $(el).text().trim();
      const link = $(el).attr('href');
      if (baslik && baslik.length > 15) {
        haberler.push({
          baslik,
          link: link.startsWith('http') ? link : 'https://www.gercekgundem.com' + link,
          kaynak: 'Gerçek Gündem'
        });
      }
    });

    res.json(haberler.slice(0, 15));
  } catch (error) {
    res.status(500).json({ hata: error.message });
  }
});

// HABER API - Ensonhaber
app.get('/api/ensonhaber', async (req, res) => {
  try {
    const { data } = await axios.get('https://www.ensonhaber.com/son-dakika-haberleri');
    const $ = cheerio.load(data);
    const haberler = [];

    $('.card .card-title a, .news-item a').each((i, el) => {
      const baslik = $(el).text().trim();
      const link = $(el).attr('href');
      if (baslik && baslik.length > 15) {
        haberler.push({
          baslik,
          link: link.startsWith('http') ? link : 'https://www.ensonhaber.com' + link,
          kaynak: 'Ensonhaber'
        });
      }
    });

    res.json(haberler.slice(0, 15));
  } catch (error) {
    res.status(500).json({ hata: error.message });
  }
});

// Tüm haberler - tek API'de topla
app.get('/api/tum', async (req, res) => {
  try {
    // Buraya zamanlayıcı koymadım, basitçe 2 kaynak
    const gg = await axios.get('http://localhost:3000/api/gercekgundem').catch(() => ({ data: [] }));
    const eh = await axios.get('http://localhost:3000/api/ensonhaber').catch(() => ({ data: [] }));
    
    const tum = [...gg.data, ...eh.data];
    res.json(tum);
  } catch (error) {
    res.status(500).json({ hata: error.message });
  }
});

module.exports = app;
