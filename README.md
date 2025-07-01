# 作業カウンター App

常駐型の作業記録カウンターアプリケーションです。

## 🎯 特徴

- **常駐表示**: システムトレイに常駐し、いつでもアクセス可能
- **複数カテゴリ**: 作業種別ごとにカウンターを管理
- **履歴表示**: 日別の作業記録を確認
- **数値調整**: +1/-1ボタンで簡単に数値修正
- **クラウド同期**: Notion APIでデータバックアップ（オプション）

## 🔧 使用技術

### クライアント
- **Electron**: デスクトップアプリケーション
- **HTML/CSS/JavaScript**: ユーザーインターフェース
- **electron-store**: ローカルデータ保存

### クラウド連携
- **Notion API**: データバックアップ・同期
- **GitHub**: コード管理・バージョン管理

## 📦 インストール

### 前提条件
- Node.js 18.0.0 以上

### セットアップ
```bash
# リポジトリをクローン
git clone https://github.com/Turbo777-777/work-counter-app.git
cd work-counter-app

# 依存関係をインストール
npm install

# アプリケーションを起動
npm start
```

## ⚙️ 設定

### Notion API 連携（オプション）
1. [Notion Developers](https://www.notion.so/my-integrations) でインテグレーションを作成
2. データベースを作成し、以下のプロパティを設定：
   - Category (タイトル)
   - Date (日付)
   - Count (数値)
3. 環境変数を設定：
```bash
# .env ファイルを作成
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id
```

## 🚀 使用方法

1. **アプリ起動**: `npm start` でアプリケーションを起動
2. **カテゴリ追加**: 新しい作業カテゴリを追加
3. **カウント**: +/-ボタンでカウントを調整
4. **常駐**: システムトレイからいつでもアクセス

### ショートカットキー
- `Ctrl + 1-9`: 各カテゴリのクイックカウント
- `Enter`: カテゴリ名入力後の追加

## 📱 対応プラットフォーム

- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 18.04+)

## 🔒 セキュリティ

- ローカルデータは `electron-store` で暗号化保存
- Notion API通信はHTTPS暗号化
- APIキーは環境変数で管理

## 📊 データ構造

### ローカルストレージ
```json
{
  "categories": [
    {
      "id": "programming",
      "name": "プログラミング",
      "color": "#4CAF50"
    }
  ],
  "counts": {
    "2025-07-01": {
      "programming": 5
    }
  }
}
```

## 🤝 コントリビューション

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 📞 サポート

問題や質問がある場合は [Issues](https://github.com/Turbo777-777/work-counter-app/issues) にて報告してください。

---

Made with ❤️ by Claude Assistant
