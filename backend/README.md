# NAORU Backend - スクレイピングサーバー

## 概要

ホットペッパービューティーのデータをスクレイピングし、競合分析・市場調査を行うバックエンドサーバーです。

## 技術スタック

- **Node.js** v18+
- **Express.js** - Webサーバーフレームワーク
- **Puppeteer** - ブラウザ自動化・スクレイピング
- **Cheerio** - HTMLパーサー
- **node-cron** - スケジュールタスク

## インストール

```bash
npm install
```

## 起動

### 開発モード（ホットリロード）

```bash
npm run dev
```

### 本番モード

```bash
npm start
```

サーバーは `http://localhost:3001` で起動します。

## API エンドポイント

### 1. 競合店舗トラッキング

```http
POST /api/competitors/track
Content-Type: application/json

{
  "area": "渋谷",
  "service": "整体"
}
```

**レスポンス:**

```json
{
  "data": [
    {
      "name": "店舗名",
      "url": "https://...",
      "price": "¥3,980",
      "reviewCount": "120",
      "rating": "4.5",
      "rank": 1
    }
  ],
  "cached": false,
  "timestamp": 1234567890
}
```

### 2. 店舗詳細情報

```http
POST /api/shop/details
Content-Type: application/json

{
  "url": "https://beauty.hotpepper.jp/..."
}
```

### 3. 口コミ取得

```http
POST /api/reviews/fetch
Content-Type: application/json

{
  "url": "https://beauty.hotpepper.jp/..."
}
```

### 4. 検索順位チェック

```http
POST /api/ranking/check
Content-Type: application/json

{
  "keyword": "渋谷 整体",
  "shopName": "NAORU整体"
}
```

### 5. 一括順位チェック

```http
POST /api/ranking/bulk-check
Content-Type: application/json

{
  "keywords": ["渋谷 整体", "腰痛 新宿"],
  "shopName": "NAORU整体"
}
```

### 6. エリア相場分析

```http
POST /api/market/analysis
Content-Type: application/json

{
  "area": "渋谷",
  "service": "整体"
}
```

### 7. モニタリング開始

```http
POST /api/monitoring/start
Content-Type: application/json

{
  "taskId": "task_001",
  "keywords": ["渋谷 整体"],
  "shopName": "NAORU整体",
  "schedule": "0 9 * * *"
}
```

### 8. モニタリング停止

```http
POST /api/monitoring/stop
Content-Type: application/json

{
  "taskId": "task_001"
}
```

### 9. モニタリング結果取得

```http
GET /api/monitoring/results/:taskId
```

### 10. ヘルスチェック

```http
GET /health
```

## キャッシュ機能

競合データは15分間キャッシュされ、同じリクエストに対して高速にレスポンスを返します。

## レート制限

スクレイピングのレート制限として、連続リクエスト間に2秒の遅延を設けています。

## エラーハンドリング

すべてのエンドポイントは以下の形式でエラーを返します：

```json
{
  "error": "エラーメッセージ"
}
```

## 環境変数

`.env` ファイルを作成して設定：

```bash
PORT=3001
```

## 注意事項

- スクレイピングは利用規約に従って実施してください
- 過度なリクエストはサーバー負荷につながるため、適切な間隔を空けてください
- 本番環境では、適切なログ管理とエラー通知を実装してください

## デプロイ

### Heroku

```bash
heroku create naoru-backend
git push heroku main
```

### Docker

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## ライセンス

Proprietary
