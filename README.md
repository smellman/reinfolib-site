# 国交省 不動産情報ライブラリ Viewer

## 概要

国土交通省が提供する不動産情報ライブラリの情報を地図上に表示するための Viewer です。

## 使い方

Proxy サーバの実装は `reinfolib-proxy` を参照してください。

現在、 `reinfolib-proxy` は https://dev.smellman.org/reinfolib-proxy/proxy/ で公開されています。

定期的にシャットダウンされるので注意をしてください。

### 開発環境の構築

```bash
npm install
vim .env
```

```
VITE_API_KEY=hogehoge
```

```bash
npm run dev
```

