# 🕷️ スクレイピング機能の設定ガイド

NAORUアプリでホットペッパービューティーのリアルタイムスクレイピングを有効化する方法を説明します。

## 📋 目次

1. [スクレイピング対象URL](#スクレイピング対象url)
2. [Vercelでスクレイピングを有効化](#vercelでスクレイピングを有効化)
3. [スクレイピングの仕組み](#スクレイピングの仕組み)
4. [トラブルシューティング](#トラブルシューティング)

---

## 🎯 スクレイピング対象URL

スクレイピング先のURLは**2つの方法**で指定できます：

### 方法1：エリア検索（自動URL生成）

ユーザーが入力した「エリア」と「サービス種類」から、自動的に検索URLを構築します。

**例**：
- **入力**: エリア=「渋谷」、サービス=「整体」
- **生成されるURL**: `https://beauty.hotpepper.jp/CSP/bt/search/?word=渋谷+整体`

**処理フロー**：
```
ユーザー入力
    ↓
buildSearchUrl()でURL構築
    ↓
Puppeteerでスクレイピング
    ↓
トップ10店舗のデータを抽出
```

### 方法2：URL直接指定

「URL指定トラッキング」セクションで、特定の店舗URLを直接入力します。

**例**：
```
https://beauty.hotpepper.jp/slnH000123456/
https://beauty.hotpepper.jp/slnH000789012/
```

**処理フロー**：
```
ユーザーがURL入力
    ↓
/api/scrape-url にリクエスト
    ↓
Puppeteerでそのページをスクレイピング
    ↓
店舗詳細データを抽出
```

---

## ⚙️ Vercelでスクレイピングを有効化

### ステップ1：Vercelダッシュボードにアクセス

1. https://vercel.com/dashboard を開く
2. 「naoru-rep」プロジェクトをクリック
3. 上部の **「Settings」** タブをクリック

### ステップ2：環境変数を設定

1. 左側のメニューから **「Environment Variables」** をクリック
2. **「Add New」** ボタンをクリック

3. 以下の情報を入力：

| 項目 | 値 |
|------|-----|
| **Key** | `USE_REAL_SCRAPING` |
| **Value** | `true` |
| **Environments** | ✅ Production<br>✅ Preview<br>✅ Development |

4. **「Save」** ボタンをクリック

### ステップ3：再デプロイ

環境変数を追加しただけでは反映されません。再デプロイが必要です。

**方法A：自動デプロイ（推奨）**
```bash
git commit --allow-empty -m "Enable real scraping"
git push origin claude/enhance-beauty-analysis-NVLrz
```

**方法B：手動再デプロイ**
1. **「Deployments」** タブを開く
2. 最新のデプロイメントの「...」メニューをクリック
3. **「Redeploy」** をクリック

### ステップ4：動作確認

デプロイ完了後、以下を確認：

1. **APIログを確認**
   - Vercelダッシュボード → プロジェクト → **「Logs」**
   - `[REAL] Competitor tracking` のようなログが表示されればOK

2. **実際にスクレイピングを実行**
   - アプリの「競合分析」タブを開く
   - エリアに「渋谷」と入力して検索
   - 結果にリアルなホットペッパーのデータが表示されればOK

---

## 🔧 スクレイピングの仕組み

### 使用技術

- **Puppeteer Core** - ヘッドレスブラウザ制御
- **chrome-aws-lambda** - Vercel環境用のChromium

### データ取得プロセス

#### エリア検索の場合

```javascript
// 1. 検索URLを構築
const searchUrl = buildSearchUrl("渋谷", "整体");
// → https://beauty.hotpepper.jp/CSP/bt/search/?word=渋谷+整体

// 2. Puppeteerでページを開く
await page.goto(searchUrl);

// 3. DOM要素からデータを抽出
const competitors = await page.evaluate(() => {
  // 店舗名、URL、価格、口コミ数、評価を取得
  return shopData;
});
```

#### URL直接指定の場合

```javascript
// 1. 指定されたURLを開く
await page.goto(userInputUrl);

// 2. ページから詳細情報を抽出
const shopData = await page.evaluate(() => {
  // 店舗名、価格、口コミ、評価を取得
  return data;
});
```

### 抽出するデータ

| データ | 説明 | CSSセレクタ例 |
|--------|------|---------------|
| 店舗名 | 店舗の名前 | `.shopName, .slnName, h1` |
| URL | 店舗ページのURL | `a[href*="beauty.hotpepper"]` |
| 価格 | クーポン価格 | `[class*="price"], .couponPrice` |
| 口コミ数 | レビュー件数 | `[class*="review"], [class*="kuchikomi"]` |
| 評価 | 星の数/スコア | `[class*="rating"], [class*="star"]` |

---

## 🚨 重要な注意事項

### 1. スクレイピングの制限

- **タイムアウト**: 30秒でタイムアウト
- **レート制限**: 連続リクエストは避ける
- **robots.txt**: ホットペッパーのrobots.txtを尊重

### 2. エラー処理

スクレイピングに失敗した場合、自動的に**デモモード**にフォールバックします：

```javascript
try {
  // 実際のスクレイピング
  data = await scrapeCompetitors();
} catch (error) {
  // 失敗したらデモデータを返す
  data = generateDemoCompetitors();
}
```

### 3. Vercelの制限

- **実行時間**: サーバーレス関数は最大10秒まで
- **メモリ**: 1024MB
- **同時実行数**: プランによる

---

## 🔍 トラブルシューティング

### Q1: スクレイピングが動かない

**確認ポイント**:
1. 環境変数 `USE_REAL_SCRAPING=true` が設定されているか
2. 再デプロイを実行したか
3. Vercelログでエラーが出ていないか

**ログの確認方法**:
```
Vercel Dashboard → プロジェクト → Logs
→ "Puppeteer not available" などのエラーを確認
```

### Q2: タイムアウトエラーが出る

**原因**: ページの読み込みに30秒以上かかっている

**対処法**:
- `waitUntil` オプションを変更: `networkidle0` → `domcontentloaded`
- タイムアウト時間を延長（ただしVercelの制限に注意）

### Q3: データが取得できない（空の結果）

**原因**: CSSセレクタがホットペッパーの構造と合っていない

**対処法**:
1. 実際のホットペッパーのページを開く
2. ブラウザの開発者ツールでHTML構造を確認
3. `/api/competitors-track.js` のセレクタを修正

**セレクタ修正例**:
```javascript
// 修正前
const shopElements = document.querySelectorAll('.slnLink');

// 修正後（実際の構造に合わせる）
const shopElements = document.querySelectorAll('.p-shopList__item');
```

### Q4: 依存関係エラー

**エラー例**:
```
Cannot find module 'chrome-aws-lambda'
```

**対処法**:
`package.json` が存在し、以下の依存関係が含まれているか確認：

```json
{
  "dependencies": {
    "chrome-aws-lambda": "^10.1.0",
    "puppeteer-core": "^21.6.1"
  }
}
```

---

## 📊 スクレイピング vs デモモード

| 項目 | デモモード | スクレイピングモード |
|------|-----------|---------------------|
| データ | ランダム生成 | リアルタイム取得 |
| 速度 | 高速（即座） | 遅い（3〜10秒） |
| 精度 | 低い | 高い |
| コスト | 無料 | Vercel実行時間消費 |
| 設定 | 不要 | 環境変数設定が必要 |

---

## 🎯 推奨設定

### 開発中
```
USE_REAL_SCRAPING=false  # デモモードで高速テスト
```

### 本番環境
```
USE_REAL_SCRAPING=true   # リアルデータ取得
```

---

## 📞 サポート

スクレイピング機能で問題が発生した場合：

1. Vercelのログを確認
2. ブラウザのコンソールでエラーを確認
3. このガイドのトラブルシューティングを参照

---

**最終更新**: 2026-01-27
