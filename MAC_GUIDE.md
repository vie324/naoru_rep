# 🍎 Mac版：バックエンドサーバー起動ガイド（超詳細版）

## 📌 このガイドでやること

バックエンドサーバーを起動して、フロントエンド（index.html）と連携させます。

**所要時間：5-10分**

---

## ステップ1: ターミナルを開く

ターミナルは、Macでコマンドを入力するためのアプリです。

### 方法A: Spotlightを使う（おすすめ）

1. **キーボードで `⌘（Command）+ スペース`を同時に押す**
   - 画面右上に検索窓が表示されます

2. **「terminal」と入力**
   - 「ターミナル」というアプリが候補に表示されます
   - アイコンは黒い四角に「>_」のようなマーク

3. **Enterキーを押す**
   - ターミナルが開きます

### 方法B: Finderから開く

1. **Finder（ファインダー）を開く**
   - Dockの笑顔アイコンをクリック

2. **「アプリケーション」をクリック**
   - 左側のサイドバーにあります

3. **「ユーティリティ」フォルダをダブルクリック**

4. **「ターミナル.app」をダブルクリック**

---

## ✅ ターミナルが開いたら

画面に以下のような表示が出ます：

```
あなたのMacの名前:~ あなたのユーザー名$
```

例：
```
MacBook-Pro:~ taro$
```

この `$` マークの後ろにコマンドを入力していきます。

---

## ステップ2: プロジェクトの場所を確認

まず、naoru_repプロジェクトがどこにあるか確認します。

### 2-1. プロジェクトの場所を見つける

#### パターンA: ダウンロードフォルダにある場合

1. **Finderを開く**
2. **「ダウンロード」をクリック**
3. **「naoru_rep」フォルダを探す**
4. **フォルダを右クリック → 「情報を見る」**
5. **「場所:」の欄を確認**

例：
```
場所: /Users/taro/Downloads
```

→ この場合、完全なパスは `/Users/taro/Downloads/naoru_rep`

#### パターンB: デスクトップにある場合

```
場所: /Users/taro/Desktop
```

→ 完全なパスは `/Users/taro/Desktop/naoru_rep`

#### パターンC: ホームフォルダにある場合

```
場所: /Users/taro
```

→ 完全なパスは `/Users/taro/naoru_rep`

---

## ステップ3: プロジェクトに移動する

ターミナルで、プロジェクトのbackendフォルダに移動します。

### 3-1. 現在の場所を確認

ターミナルに以下を入力してEnterを押す：

```bash
pwd
```

**pwdとは？**
- "Print Working Directory"の略
- 今いる場所を表示するコマンド

**表示例：**
```
/Users/taro
```

### 3-2. プロジェクトに移動

あなたのプロジェクトの場所に合わせて、以下のいずれかを入力：

#### ケース1: ホームフォルダにある場合

```bash
cd ~/naoru_rep/backend
```

#### ケース2: ダウンロードフォルダにある場合

```bash
cd ~/Downloads/naoru_rep/backend
```

#### ケース3: デスクトップにある場合

```bash
cd ~/Desktop/naoru_rep/backend
```

#### ケース4: 他の場所にある場合

```bash
cd /完全なパス/naoru_rep/backend
```

### 💡 簡単な方法（ドラッグ＆ドロップ）

コマンドを手入力するのが面倒な場合：

1. ターミナルに `cd ` と入力（最後にスペースを入れる）
2. **Finderでbackendフォルダを見つける**
3. **backendフォルダをターミナルにドラッグ＆ドロップ**
4. **Enterキーを押す**

→ 自動的にパスが入力されます！

### 3-3. 移動できたか確認

再度 `pwd` を実行：

```bash
pwd
```

**正しい表示例：**
```
/Users/taro/naoru_rep/backend
```

最後が `/backend` になっていればOK！

---

## ステップ4: 依存関係をインストール

サーバーの実行に必要なプログラム（パッケージ）をインストールします。

### 4-1. コマンドを実行

ターミナルに以下をコピー＆ペーストしてEnterを押す：

```bash
npm install
```

**npmとは？**
- Node Package Managerの略
- JavaScriptのパッケージを管理するツール
- Node.jsをインストールすると自動的に使えます

### 4-2. インストールの進行

以下のような表示が次々と出ます：

```
npm WARN deprecated ...
added 1 package, ...
added 10 packages, ...
added 50 packages, ...
```

**これは正常です！** 待ちましょう。

### 4-3. 完了の確認

最後に以下のような表示が出ればOK：

```
added 99 packages, and audited 100 packages in 3s

20 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

重要なのは：
- `added XX packages` → パッケージがインストールされた
- `found 0 vulnerabilities` → セキュリティ問題なし

---

## ステップ5: サーバーを起動

いよいよサーバーを起動します！

### 5-1. 起動コマンドを実行

以下のいずれかを入力してEnterを押す：

#### 方法A:
```bash
npm start
```

#### 方法B:
```bash
node server-lite.js
```

どちらも同じ結果になります。

### 5-2. 起動成功の確認

以下のような表示が出れば**大成功！** 🎉

```

🚀 ========================================
🚀 NAORU Backend Lite is running!
🚀 ========================================

📍 Server URL: http://localhost:3001
💡 Mode: DEMO (No real scraping)

📊 Available endpoints:
   GET  http://localhost:3001/health
   GET  http://localhost:3001/
   POST http://localhost:3001/api/competitors/track
   POST http://localhost:3001/api/reviews/fetch
   POST http://localhost:3001/api/ranking/check

✅ Ready to accept requests!

```

**このターミナルは閉じないでください！**
サーバーが動いている間、ターミナルは開いたままにしておきます。

---

## ステップ6: 動作確認

サーバーが正しく動いているか確認します。

### 6-1. ブラウザでテスト

1. **Safariまたは Chrome を開く**

2. **アドレスバーに以下を入力してEnter：**
   ```
   http://localhost:3001/health
   ```

3. **以下のような表示が出ればOK！**
   ```json
   {
     "status": "ok",
     "version": "lite",
     "timestamp": "2026-01-26T...",
     "message": "NAORU Backend Lite is running (Demo mode)"
   }
   ```

### 6-2. フロントエンドで確認

1. **新しいブラウザタブを開く**

2. **index.htmlを開く**
   - Finderで `naoru_rep/index.html` を見つける
   - ダブルクリックで開く

3. **「競合分析」タブをクリック**

4. **エリアに「渋谷」と入力**

5. **「競合を検索」ボタンをクリック**

6. **以下のようなデータが表示されればOK！**
   ```
   #1 リラクゼーションスペース 渋谷店  ¥2,980
   #2 癒しの整体院 渋谷店             ¥3,500
   #3 ボディケアサロン 渋谷店         ¥3,980
   ...
   ```

### 6-3. ターミナルでログ確認

フロントエンドで操作すると、ターミナルに以下のようなログが表示されます：

```
📊 Competitor tracking request: 渋谷, 整体
[DEMO] Generating competitors for 渋谷 整体
✅ Returning 10 competitors (DEMO)
```

これは、サーバーがリクエストを受け取って処理している証拠です！

---

## ステップ7: サーバーの停止と再起動

### サーバーを停止する

ターミナルで以下を押す：

```
Control + C
```

**注意**: `Command（⌘）`ではなく、`Control`キーです。

以下のような表示が出て、カーソルが戻ってきます：

```
^C
MacBook-Pro:backend taro$
```

### サーバーを再起動する

```bash
npm start
```

または

```bash
node server-lite.js
```

---

## 💡 便利なショートカット

### 過去のコマンドを再実行

- **↑キー（上矢印）**を押すと、過去に実行したコマンドが表示されます
- 何度も押すと、さらに前のコマンドが表示されます
- **Enterキー**でそのコマンドを実行

例：
1. `npm start` を実行
2. `Control + C` で停止
3. **↑キー**を押す → `npm start` が表示される
4. **Enter** → 再起動！

---

## ❓ よくある質問

### Q1: 「npm: command not found」と表示される

**A**: Node.jsがインストールされていません。

#### 解決方法：

1. [Node.js公式サイト](https://nodejs.org/)を開く
2. 「LTS版」（推奨版）をダウンロード
3. ダウンロードした `.pkg` ファイルをダブルクリック
4. 画面の指示に従ってインストール
5. **ターミナルを一度閉じて、再度開く**
6. `node --version` を実行して確認

---

### Q2: 「cd: no such file or directory」と表示される

**A**: パスが間違っています。

#### 解決方法：

1. Finderでbackendフォルダを開く
2. ターミナルに `cd ` と入力（スペース含む）
3. backendフォルダをターミナルにドラッグ＆ドロップ
4. Enterキーを押す

---

### Q3: 「Port 3001 is already in use」と表示される

**A**: 既にサーバーが起動しているか、他のアプリが3001ポートを使っています。

#### 解決方法：

1. **既存のサーバーを探す**
   ```bash
   lsof -i :3001
   ```

2. **プロセスを停止**
   ```bash
   kill -9 <PID番号>
   ```

または、別のターミナルウィンドウで既にサーバーが動いていないか確認してください。

---

### Q4: サーバーを起動したまま他のコマンドを実行したい

**A**: 新しいターミナルウィンドウを開きます。

#### 方法：

1. ターミナルのメニューバーで「シェル」→「新規ウィンドウ」
2. または `⌘ + N`

サーバーは最初のターミナルで動き続けます。

---

## 📋 完全なコマンド一覧（まとめ）

すべてのステップをまとめると：

```bash
# 1. プロジェクトに移動
cd ~/naoru_rep/backend

# 2. 場所を確認
pwd

# 3. 依存関係をインストール（初回のみ）
npm install

# 4. サーバーを起動
npm start

# 5. サーバーを停止（起動中に）
# Control + C を押す
```

---

## 🎯 次回以降の起動（2回目以降）

1回目のインストールが完了していれば、次回からは簡単です：

```bash
cd ~/naoru_rep/backend
npm start
```

たった2行だけ！

---

## 🎉 成功チェックリスト

以下がすべてOKなら完璧です：

- [ ] ターミナルに「Ready to accept requests!」と表示されている
- [ ] http://localhost:3001/health にアクセスすると `{"status":"ok"}` が表示される
- [ ] index.htmlで競合分析タブを開き、データが表示される
- [ ] ターミナルにログが表示される

---

## 🆘 それでも困ったら

以下を教えてください：

1. **エラーメッセージ全文**（ターミナルに表示された赤い文字）
2. **`node --version` の結果**
3. **`pwd` の結果**（どこにいるか）
4. **どのステップで止まったか**

すぐにサポートします！

---

**これであなたもバックエンドマスターです！** 🚀
