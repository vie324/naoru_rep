# 📖 バックエンドサーバー起動 - 完全ステップガイド

**所要時間: 5分（簡易版）/ 15分（完全版）**

---

## 🎯 このガイドで学べること

1. ✅ ターミナル（コマンドプロンプト）の使い方
2. ✅ Node.jsプロジェクトの起動方法
3. ✅ サーバーが正しく動いているか確認する方法
4. ✅ トラブルが起きた時の対処法

---

## 準備: Node.jsのインストール確認

### Windows の場合

1. **スタートメニュー**を開く
2. 「cmd」と入力して**コマンドプロンプト**を起動
3. 以下を入力してEnterキーを押す：

```cmd
node --version
```

4. `v18.0.0` のような表示が出ればOK！

表示されない場合 → [Node.js公式サイト](https://nodejs.org/)から「LTS版」をダウンロード＆インストール

### Mac の場合

1. **Spotlight検索**（⌘ + スペース）を開く
2. 「terminal」と入力して**ターミナル**を起動
3. 以下を入力してEnterキーを押す：

```bash
node --version
```

4. `v18.0.0` のような表示が出ればOK！

表示されない場合 → [Node.js公式サイト](https://nodejs.org/)から「LTS版」をダウンロード＆インストール

---

## 方法1: 簡易版サーバー（初心者におすすめ！）

### ステップ1: プロジェクトフォルダを開く

#### Windows

```cmd
cd C:\Users\あなたの名前\naoru_rep\backend
```

**ヒント**: エクスプローラーでbackendフォルダを開き、アドレスバーに `cmd` と入力してEnterを押すと、そのフォルダでコマンドプロンプトが開きます。

#### Mac

```bash
cd ~/naoru_rep/backend
```

**ヒント**: Finderでbackendフォルダを右クリック → 「サービス」 → 「フォルダに新規ターミナル」

---

### ステップ2: 依存関係をインストール

以下をコピー＆ペーストして実行：

```bash
npm install express cors
```

**何が起こるか**: `express`と`cors`という2つのパッケージがダウンロードされます（約10秒）。

**成功のサイン**:
```
added 57 packages
```
のような表示が出る。

---

### ステップ3: サーバーを起動

以下をコピー＆ペーストして実行：

```bash
node server-lite.js
```

**成功のサイン**:
```
🚀 ========================================
🚀 NAORU Backend Lite is running!
🚀 ========================================

📍 Server URL: http://localhost:3001
💡 Mode: DEMO (No real scraping)

✅ Ready to accept requests!
```

---

### ステップ4: 動作確認

#### 方法A: ブラウザで確認（簡単）

1. ブラウザを開く
2. アドレスバーに以下を入力：
```
http://localhost:3001/health
```

3. 以下のような表示が出ればOK！
```json
{
  "status": "ok",
  "version": "lite",
  "message": "NAORU Backend Lite is running (Demo mode)"
}
```

#### 方法B: フロントエンドで確認

1. 別のブラウザタブで `index.html` を開く
2. 「**競合分析**」タブをクリック
3. エリアに「渋谷」と入力
4. 「競合を検索」ボタンをクリック

✅ デモモードのメッセージが**消えて**、データが表示されれば成功！

---

### ステップ5: サーバーを停止する方法

サーバーを停止したい時：

- **Windows**: `Ctrl + C` を押す
- **Mac**: `Control + C` を押す

再度起動したい時は、ステップ3を繰り返してください。

---

## 方法2: 完全版サーバー（上級者向け）

### ⚠️ 注意事項

- インストールに10-20分かかります
- Chromiumが自動ダウンロードされます（約150MB）
- 実際のスクレイピングが動作します

---

### ステップ1: プロジェクトフォルダを開く

方法1と同じです。

---

### ステップ2: 全依存関係をインストール

```bash
npm install
```

**何が起こるか**:
- すべてのパッケージがダウンロードされます
- Puppeteer（ブラウザ自動化ツール）が含まれます
- Chromiumブラウザが自動ダウンロードされます

**所要時間**: 10-20分（インターネット速度による）

**進行状況の表示**:
```
⠸ : timing build:
```
のような表示が出ますが、これは正常です。待ちましょう。

---

### ステップ3: サーバーを起動

```bash
npm start
```

または

```bash
node server.js
```

**成功のサイン**:
```
🚀 NAORU Scraper Backend running on http://localhost:3001
📊 API Endpoints:
   POST /api/competitors/track
   POST /api/shop/details
   ...
```

---

### ステップ4: 動作確認

方法1と同じです。

---

## 方法3: Docker（最も確実）

### 前提条件

**Docker Desktop**がインストールされていること。

[Docker公式サイト](https://www.docker.com/products/docker-desktop/)からダウンロード＆インストール。

---

### ステップ1: Dockerが動いているか確認

```bash
docker --version
```

`Docker version 20.10.0` のような表示が出ればOK。

---

### ステップ2: イメージをビルド

backendフォルダで実行：

```bash
docker build -t naoru-backend .
```

**所要時間**: 5-10分

**進行状況**:
```
Step 1/10 : FROM node:18-slim
 ---> abc123def456
Step 2/10 : RUN apt-get update...
```

---

### ステップ3: コンテナを起動

```bash
docker run -p 3001:3001 naoru-backend
```

**成功のサイン**: 方法2と同じメッセージが表示されます。

---

### ステップ4: 停止と再起動

#### 停止

別のターミナルで：

```bash
docker ps
# CONTAINER ID を確認
docker stop <CONTAINER_ID>
```

または、元のターミナルで `Ctrl + C` / `Control + C`

#### 再起動

```bash
docker start <CONTAINER_ID>
```

---

## よくある質問（FAQ）

### Q1: 「npm: command not found」と表示される

**A**: Node.jsがインストールされていません。

→ [Node.js公式サイト](https://nodejs.org/)からインストール

---

### Q2: 「Cannot find module 'express'」と表示される

**A**: 依存関係がインストールされていません。

```bash
npm install express cors
```

を実行してください。

---

### Q3: ポート3001が使えないと言われる

**A**: 他のアプリが3001番ポートを使用しています。

#### 解決策1: 他のアプリを停止

タスクマネージャー（Windows）/ アクティビティモニタ（Mac）で確認

#### 解決策2: ポート番号を変更

`server-lite.js` の6行目を編集：

```javascript
const PORT = 3002; // 3001から3002に変更
```

---

### Q4: サーバーは起動しているのに、フロントエンドで接続できない

**A**: 以下を確認してください：

1. サーバーが本当に起動しているか
   → ターミナルに「Ready to accept requests!」が表示されているか

2. ブラウザで http://localhost:3001/health を開いて確認

3. index.htmlを再読み込み（F5キー）

4. ブラウザのコンソールでエラーを確認
   - F12キーを押す
   - 「Console」タブを開く
   - 赤いエラーがないか確認

---

### Q5: npm install が途中で止まる

**A**: ネットワークの問題かもしれません。

#### 解決策1: やり直す

```bash
# キャッシュをクリア
npm cache clean --force

# 再度インストール
npm install
```

#### 解決策2: タイムアウトを延長

```bash
npm install --timeout=60000
```

---

## 🎉 成功の確認チェックリスト

サーバーが正しく動いているか、以下を確認してください：

- [ ] ターミナルに「Ready to accept requests!」が表示されている
- [ ] http://localhost:3001/health にアクセスすると `{"status":"ok"}` が表示される
- [ ] index.htmlで競合分析タブを開き、エリアを入力すると結果が表示される
- [ ] デモモードのメッセージが表示されない（または「デモモード」と表示される）

すべてチェックできたら**完了**です！🎊

---

## 次のステップ

1. **フロントエンドを使ってみる**
   - index.htmlを開く
   - 競合分析タブで色々試す

2. **APIエンドポイントを直接叩いてみる**
   - Postman や Insomnia などのツールを使う
   - または、ブラウザの開発者ツールでfetchを実行

3. **完全版サーバーに挑戦**
   - 実際のスクレイピングを試す

---

## サポート

問題が解決しない場合は、以下の情報を添えて質問してください：

1. 使用しているOS（Windows / Mac）
2. Node.jsのバージョン（`node --version`）
3. 実行したコマンド
4. エラーメッセージ全文

---

**これでバックエンドサーバーの起動は完璧です！** 🚀
