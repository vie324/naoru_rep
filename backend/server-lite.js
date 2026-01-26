/**
 * NAORU Backend - Lite Version (No Puppeteer)
 *
 * 簡易版バックエンドサーバー
 * - Puppeteer不要（インストールが簡単）
 * - デモデータを返却
 * - APIエンドポイントの動作確認用
 *
 * 使い方:
 *   npm install express cors
 *   node server-lite.js
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory cache
const cache = {
  competitors: {},
  rankings: {},
  reviews: {}
};

// ===========================================
// DEMO DATA GENERATORS
// ===========================================

function generateDemoCompetitors(area, service = '整体') {
  console.log(`[DEMO] Generating competitors for ${area} ${service}`);

  const shopNames = [
    'リラクゼーションスペース',
    '癒しの整体院',
    'ボディケアサロン',
    'ヘルスケア整体',
    'リフレッシュ館',
    '快適整体',
    'もみほぐし専門店',
    'からだリセット',
    'ストレッチ整体',
    'トータルケア'
  ];

  const basePrices = [2980, 3500, 3980, 4500, 4980, 5500, 5980, 6500, 7000, 7500];

  return shopNames.map((name, index) => ({
    name: `${name} ${area}店`,
    url: `https://beauty.hotpepper.jp/demo/${area}/${index}`,
    price: `¥${basePrices[index].toLocaleString()}`,
    reviewCount: `${50 + Math.floor(Math.random() * 200)}`,
    rating: `${(3.5 + Math.random() * 1.5).toFixed(1)}`,
    rank: index + 1
  }));
}

function generateDemoShopDetails(url) {
  console.log(`[DEMO] Generating shop details for ${url}`);

  return {
    name: 'サンプル整体院',
    coupons: [
      { name: '初回限定クーポン', price: '¥2,980' },
      { name: 'リピーター割引', price: '¥3,500' },
      { name: '平日限定', price: '¥3,200' }
    ],
    reviewCount: '120',
    rating: '4.3',
    photoCount: 25,
    staffCount: 5
  };
}

function generateDemoReviews(url) {
  console.log(`[DEMO] Generating reviews for ${url}`);

  const sampleReviews = [
    { text: '施術が丁寧で、腰痛が改善しました。スタッフの方も親切でした。', rating: '5.0', date: '2025-01-20' },
    { text: '駅から近くて通いやすいです。予約も取りやすく満足しています。', rating: '4.5', date: '2025-01-18' },
    { text: '初回割引があってお得でした。次回も利用したいと思います。', rating: '4.0', date: '2025-01-15' },
    { text: '説明が分かりやすく、安心して施術を受けられました。', rating: '5.0', date: '2025-01-12' },
    { text: 'もう少し料金が安いと嬉しいですが、効果はありました。', rating: '3.5', date: '2025-01-10' },
    { text: '清潔感のある店内で、リラックスできました。', rating: '4.5', date: '2025-01-08' },
    { text: '肩こりが楽になりました。また通いたいです。', rating: '5.0', date: '2025-01-05' },
    { text: 'スタッフの対応が良く、相談しやすかったです。', rating: '4.5', date: '2025-01-03' }
  ];

  return sampleReviews;
}

function generateDemoRanking(keyword, shopName) {
  console.log(`[DEMO] Checking ranking for "${keyword}" - ${shopName}`);

  // ランダムで1-20位
  const rank = Math.floor(Math.random() * 20) + 1;

  return {
    keyword,
    rank,
    date: new Date().toISOString()
  };
}

function generateMarketAnalysis(area, service) {
  console.log(`[DEMO] Generating market analysis for ${area} ${service}`);

  const competitors = generateDemoCompetitors(area, service);
  const prices = [2980, 3500, 3980, 4500, 4980, 5500, 5980, 6500, 7000, 7500];

  return {
    area,
    service,
    competitorCount: competitors.length,
    averagePrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices)
    },
    averageReviewCount: 120,
    topShops: competitors.slice(0, 5)
  };
}

// ===========================================
// API ENDPOINTS
// ===========================================

/**
 * 【API 1】競合店舗トラッキング
 */
app.post('/api/competitors/track', (req, res) => {
  try {
    const { area, service } = req.body;

    if (!area) {
      return res.status(400).json({ error: 'Area is required' });
    }

    console.log(`📊 Competitor tracking request: ${area}, ${service || '整体'}`);

    const cacheKey = `${area}_${service || '整体'}`;

    // キャッシュチェック（15分有効）
    if (cache.competitors[cacheKey] &&
        Date.now() - cache.competitors[cacheKey].timestamp < 15 * 60 * 1000) {
      console.log('✅ Returning cached data');
      return res.json({
        data: cache.competitors[cacheKey].data,
        cached: true,
        timestamp: cache.competitors[cacheKey].timestamp,
        mode: 'demo'
      });
    }

    // デモデータ生成
    const competitors = generateDemoCompetitors(area, service);

    // キャッシュに保存
    cache.competitors[cacheKey] = {
      data: competitors,
      timestamp: Date.now()
    };

    console.log(`✅ Returning ${competitors.length} competitors (DEMO)`);

    res.json({
      data: competitors,
      cached: false,
      timestamp: Date.now(),
      mode: 'demo'
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 2】店舗詳細情報取得
 */
app.post('/api/shop/details', (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Shop URL is required' });
    }

    console.log(`📊 Shop details request: ${url}`);

    const details = generateDemoShopDetails(url);

    console.log('✅ Returning shop details (DEMO)');

    res.json({ data: details, mode: 'demo' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 3】口コミ取得
 */
app.post('/api/reviews/fetch', (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Shop URL is required' });
    }

    console.log(`📊 Reviews fetch request: ${url}`);

    const reviews = generateDemoReviews(url);

    console.log(`✅ Returning ${reviews.length} reviews (DEMO)`);

    res.json({ data: reviews, count: reviews.length, mode: 'demo' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 4】検索順位チェック
 */
app.post('/api/ranking/check', (req, res) => {
  try {
    const { keyword, shopName } = req.body;

    if (!keyword || !shopName) {
      return res.status(400).json({ error: 'Keyword and shop name are required' });
    }

    console.log(`📊 Ranking check request: "${keyword}" - ${shopName}`);

    const result = generateDemoRanking(keyword, shopName);

    console.log(`✅ Rank: ${result.rank} (DEMO)`);

    res.json({ data: result, mode: 'demo' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 5】複数キーワード順位一括チェック
 */
app.post('/api/ranking/bulk-check', (req, res) => {
  try {
    const { keywords, shopName } = req.body;

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }

    console.log(`📊 Bulk ranking check: ${keywords.length} keywords for ${shopName}`);

    const results = keywords.map(keyword => generateDemoRanking(keyword, shopName));

    console.log(`✅ Returning ${results.length} rankings (DEMO)`);

    res.json({ data: results, mode: 'demo' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 6】エリア相場分析
 */
app.post('/api/market/analysis', (req, res) => {
  try {
    const { area, service } = req.body;

    if (!area) {
      return res.status(400).json({ error: 'Area is required' });
    }

    console.log(`📊 Market analysis request: ${area}, ${service || '整体'}`);

    const analysis = generateMarketAnalysis(area, service);

    console.log('✅ Returning market analysis (DEMO)');

    res.json({ data: analysis, mode: 'demo' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 【API 7】モニタリング開始（簡易版ではダミー）
 */
app.post('/api/monitoring/start', (req, res) => {
  const { taskId } = req.body;

  console.log(`📊 Monitoring start request: ${taskId}`);
  console.log('⚠️  Monitoring is not available in lite version');

  res.json({
    message: 'Monitoring is not available in lite version (demo mode)',
    taskId,
    mode: 'demo'
  });
});

app.post('/api/monitoring/stop', (req, res) => {
  const { taskId } = req.body;

  console.log(`📊 Monitoring stop request: ${taskId}`);

  res.json({
    message: 'Monitoring stopped (demo mode)',
    taskId,
    mode: 'demo'
  });
});

app.get('/api/monitoring/results/:taskId', (req, res) => {
  const { taskId } = req.params;

  console.log(`📊 Monitoring results request: ${taskId}`);

  res.json({
    data: {
      results: [],
      timestamp: Date.now()
    },
    mode: 'demo'
  });
});

// ===========================================
// HEALTH CHECK
// ===========================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'lite',
    timestamp: new Date().toISOString(),
    message: 'NAORU Backend Lite is running (Demo mode)'
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'NAORU Backend API - Lite Version',
    version: '1.0.0',
    mode: 'demo',
    description: 'Lightweight backend without Puppeteer - Returns demo data',
    endpoints: [
      'POST /api/competitors/track',
      'POST /api/shop/details',
      'POST /api/reviews/fetch',
      'POST /api/ranking/check',
      'POST /api/ranking/bulk-check',
      'POST /api/market/analysis',
      'GET  /health'
    ]
  });
});

// ===========================================
// START SERVER
// ===========================================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('🚀 NAORU Backend Lite is running!');
  console.log('🚀 ========================================');
  console.log('');
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`💡 Mode: DEMO (No real scraping)`);
  console.log('');
  console.log('📊 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/api/competitors/track`);
  console.log(`   POST http://localhost:${PORT}/api/reviews/fetch`);
  console.log(`   POST http://localhost:${PORT}/api/ranking/check`);
  console.log('');
  console.log('✅ Ready to accept requests!');
  console.log('');
});
