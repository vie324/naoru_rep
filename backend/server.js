const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory cache for scraped data
const cache = {
  competitors: {},
  rankings: {},
  reviews: {},
  marketData: {}
};

// ===========================================
// SCRAPING FUNCTIONS
// ===========================================

/**
 * スクレイピング機能1: 競合店舗情報取得
 * エリア×サービスで競合を自動収集
 */
async function scrapeCompetitors(area, service = '整体') {
  console.log(`Scraping competitors for ${area} ${service}...`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // ホットペッパービューティー検索URL
    const searchUrl = `https://beauty.hotpepper.jp/kr/${area}/`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // 店舗情報を抽出
    const shops = await page.evaluate(() => {
      const results = [];
      const shopElements = document.querySelectorAll('.slnList');

      shopElements.forEach((shop, index) => {
        if (index < 10) { // TOP10のみ
          const nameEl = shop.querySelector('.slnName a');
          const priceEl = shop.querySelector('.price');
          const reviewEl = shop.querySelector('.revCount');
          const ratingEl = shop.querySelector('.rating');

          results.push({
            name: nameEl ? nameEl.innerText.trim() : '',
            url: nameEl ? nameEl.href : '',
            price: priceEl ? priceEl.innerText.trim() : '',
            reviewCount: reviewEl ? reviewEl.innerText.trim() : '0',
            rating: ratingEl ? ratingEl.innerText.trim() : '0',
            rank: index + 1
          });
        }
      });

      return results;
    });

    return shops;
  } catch (error) {
    console.error('Scraping error:', error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * スクレイピング機能2: 店舗詳細情報取得
 * 特定店舗のPV、クーポン、写真などを取得
 */
async function scrapeShopDetails(shopUrl) {
  console.log(`Scraping shop details: ${shopUrl}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(shopUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const details = await page.evaluate(() => {
      return {
        name: document.querySelector('.shopName') ? document.querySelector('.shopName').innerText : '',
        coupons: Array.from(document.querySelectorAll('.couponName')).map(el => ({
          name: el.innerText,
          price: el.closest('.coupon').querySelector('.price') ? el.closest('.coupon').querySelector('.price').innerText : ''
        })),
        reviewCount: document.querySelector('.reviewCount') ? document.querySelector('.reviewCount').innerText : '0',
        rating: document.querySelector('.rating') ? document.querySelector('.rating').innerText : '0',
        photoCount: document.querySelectorAll('.galleryImg').length || 0,
        staffCount: document.querySelectorAll('.staffItem').length || 0
      };
    });

    return details;
  } catch (error) {
    console.error('Shop details scraping error:', error);
    return null;
  } finally {
    await browser.close();
  }
}

/**
 * スクレイピング機能3: 口コミ取得＆感情分析
 */
async function scrapeReviews(shopUrl) {
  console.log(`Scraping reviews: ${shopUrl}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // 口コミページにアクセス
    const reviewUrl = shopUrl.includes('?') ? `${shopUrl}&tab=review` : `${shopUrl}?tab=review`;
    await page.goto(reviewUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const reviews = await page.evaluate(() => {
      const results = [];
      const reviewElements = document.querySelectorAll('.reviewItem');

      reviewElements.forEach(review => {
        const textEl = review.querySelector('.reviewText');
        const ratingEl = review.querySelector('.rating');
        const dateEl = review.querySelector('.reviewDate');

        results.push({
          text: textEl ? textEl.innerText.trim() : '',
          rating: ratingEl ? ratingEl.innerText.trim() : '0',
          date: dateEl ? dateEl.innerText.trim() : ''
        });
      });

      return results;
    });

    return reviews;
  } catch (error) {
    console.error('Reviews scraping error:', error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * スクレイピング機能4: 検索順位チェック
 */
async function checkSearchRanking(keyword, targetShopName) {
  console.log(`Checking ranking for: ${keyword} - ${targetShopName}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const searchUrl = `https://beauty.hotpepper.jp/CSP/bt/search/?keyword=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const ranking = await page.evaluate((shopName) => {
      const shopElements = document.querySelectorAll('.slnName a');
      let rank = -1;

      shopElements.forEach((el, index) => {
        if (el.innerText.includes(shopName)) {
          rank = index + 1;
        }
      });

      return rank;
    }, targetShopName);

    return { keyword, rank: ranking, date: new Date().toISOString() };
  } catch (error) {
    console.error('Ranking check error:', error);
    return { keyword, rank: -1, date: new Date().toISOString(), error: error.message };
  } finally {
    await browser.close();
  }
}

// ===========================================
// API ENDPOINTS
// ===========================================

/**
 * 【API 1】競合店舗リアルタイムトラッキング
 */
app.post('/api/competitors/track', async (req, res) => {
  try {
    const { area, service } = req.body;

    if (!area) {
      return res.status(400).json({ error: 'Area is required' });
    }

    const cacheKey = `${area}_${service || '整体'}`;

    // キャッシュチェック（15分有効）
    if (cache.competitors[cacheKey] &&
        Date.now() - cache.competitors[cacheKey].timestamp < 15 * 60 * 1000) {
      return res.json({
        data: cache.competitors[cacheKey].data,
        cached: true,
        timestamp: cache.competitors[cacheKey].timestamp
      });
    }

    // スクレイピング実行
    const competitors = await scrapeCompetitors(area, service);

    // キャッシュに保存
    cache.competitors[cacheKey] = {
      data: competitors,
      timestamp: Date.now()
    };

    res.json({
      data: competitors,
      cached: false,
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 2】店舗詳細情報取得
 */
app.post('/api/shop/details', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Shop URL is required' });
    }

    const details = await scrapeShopDetails(url);
    res.json({ data: details });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 3】口コミ取得
 */
app.post('/api/reviews/fetch', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Shop URL is required' });
    }

    const reviews = await scrapeReviews(url);
    res.json({ data: reviews, count: reviews.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 4】検索順位チェック
 */
app.post('/api/ranking/check', async (req, res) => {
  try {
    const { keyword, shopName } = req.body;

    if (!keyword || !shopName) {
      return res.status(400).json({ error: 'Keyword and shop name are required' });
    }

    const result = await checkSearchRanking(keyword, shopName);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 5】複数キーワード順位一括チェック
 */
app.post('/api/ranking/bulk-check', async (req, res) => {
  try {
    const { keywords, shopName } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }

    const results = [];
    for (const keyword of keywords) {
      const result = await checkSearchRanking(keyword, shopName);
      results.push(result);

      // レート制限対策
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 6】エリア相場分析
 */
app.post('/api/market/analysis', async (req, res) => {
  try {
    const { area, service } = req.body;

    const competitors = await scrapeCompetitors(area, service);

    // 相場計算
    const prices = competitors
      .map(c => c.price)
      .filter(p => p && p.match(/\d+/))
      .map(p => parseInt(p.match(/\d+/)[0]));

    const avgPrice = prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;

    const analysis = {
      area,
      service,
      competitorCount: competitors.length,
      averagePrice: avgPrice,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      averageReviewCount: competitors.length > 0
        ? Math.round(competitors.reduce((sum, c) => sum + parseInt(c.reviewCount || 0), 0) / competitors.length)
        : 0,
      topShops: competitors.slice(0, 5)
    };

    res.json({ data: analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 7】定期モニタリング設定
 */
const monitoringTasks = {};

app.post('/api/monitoring/start', (req, res) => {
  try {
    const { taskId, keywords, shopName, schedule } = req.body;

    if (!taskId || !keywords || !shopName) {
      return res.status(400).json({ error: 'Task ID, keywords, and shop name are required' });
    }

    // Cronジョブ作成（デフォルト: 毎日9時）
    const cronSchedule = schedule || '0 9 * * *';

    const task = cron.schedule(cronSchedule, async () => {
      console.log(`Running monitoring task: ${taskId}`);
      const results = [];

      for (const keyword of keywords) {
        const result = await checkSearchRanking(keyword, shopName);
        results.push(result);
      }

      // 結果をキャッシュに保存
      cache.rankings[taskId] = {
        results,
        timestamp: Date.now()
      };
    });

    monitoringTasks[taskId] = task;

    res.json({
      message: 'Monitoring task started',
      taskId,
      schedule: cronSchedule
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/monitoring/stop', (req, res) => {
  try {
    const { taskId } = req.body;

    if (monitoringTasks[taskId]) {
      monitoringTasks[taskId].stop();
      delete monitoringTasks[taskId];
      res.json({ message: 'Monitoring task stopped', taskId });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/monitoring/results/:taskId', (req, res) => {
  const { taskId } = req.params;

  if (cache.rankings[taskId]) {
    res.json({ data: cache.rankings[taskId] });
  } else {
    res.status(404).json({ error: 'No results found for this task' });
  }
});

// ===========================================
// HEALTH CHECK
// ===========================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeTasks: Object.keys(monitoringTasks).length
  });
});

// ===========================================
// START SERVER
// ===========================================

app.listen(PORT, () => {
  console.log(`🚀 NAORU Scraper Backend running on http://localhost:${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   POST /api/competitors/track`);
  console.log(`   POST /api/shop/details`);
  console.log(`   POST /api/reviews/fetch`);
  console.log(`   POST /api/ranking/check`);
  console.log(`   POST /api/ranking/bulk-check`);
  console.log(`   POST /api/market/analysis`);
  console.log(`   POST /api/monitoring/start`);
  console.log(`   POST /api/monitoring/stop`);
  console.log(`   GET  /api/monitoring/results/:taskId`);
});
