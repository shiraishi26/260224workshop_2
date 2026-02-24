# 🍅 ゲーミフィケーションポモドーロタイマー

モチベーション維持と継続利用を促進するゲーミフィケーション要素を備えたポモドーロタイマーアプリケーション

![初期状態](https://github.com/user-attachments/assets/58e70421-a004-4dd7-90da-f79cd2635053)

## 機能

### 📊 経験値システム
- ポモドーロ完了ごとに **50 XP** 獲得
- **100 XP** ごとにレベルアップ
- 次のレベルまでの進捗をプログレスバーで可視化

### 🏆 バッジシステム
達成度に応じて様々なバッジを獲得できます：

#### 完了回数バッジ
- 🎖️ **初めの一歩**: 最初のポモドーロを完了
- 🎖️ **ビギナー**: 10回のポモドーロを完了
- 🎖️ **中級者**: 50回のポモドーロを完了
- 🎖️ **上級者**: 100回のポモドーロを完了

#### 連続達成バッジ
- 🔥 **3日連続**: 3日連続でポモドーロを完了
- 🔥 **1週間連続**: 7日連続でポモドーロを完了
- 🔥 **1ヶ月連続**: 30日連続でポモドーロを完了

#### レベル達成バッジ
- ⭐ **レベル5達成**: レベル5に到達
- ⭐ **レベル10達成**: レベル10に到達

### 📈 統計機能

#### 週間統計
- 過去7日間（月〜日）の完了ポモドーロ数
- 棒グラフによる視覚的な表示
- 各曜日の集中時間を把握

#### 月間統計
- 総ポモドーロ数
- 活動日数
- 総集中時間（時間単位）
- 完了率（活動日数 / 月の経過日数）

### 🔥 ストリーク機能
- **現在のストリーク**: 連続して達成している日数
- **最大ストリーク**: これまでの最長連続日数
- 日々の継続を視覚的にモチベーション化

### 🎮 タイマー機能
- 標準的な25分間のポモドーロタイマー
- スタート・一時停止・リセット機能
- 完了時の音声通知（ON/OFF可能）
- 完了時のアニメーション通知

## 技術スタック

### バックエンド
- **Flask 3.0.0**: Python Webフレームワーク
- **Flask-CORS**: Cross-Origin Resource Sharing対応
- **JSON**: データ永続化（ファイルロック機構付き）

### フロントエンド
- **HTML5**: セマンティックなマークアップ
- **CSS3**: グラデーション、アニメーション、レスポンシブデザイン
- **JavaScript (Vanilla)**: フレームワーク不要の軽量実装
- **Web Audio API**: 完了音の生成

### セキュリティ＆パフォーマンス
- 環境変数によるデバッグモード制御
- ファイルロック機構（`fcntl`）によるデータ整合性
- タブ非表示時のポーリング停止（効率化）
- 適切な例外処理

## インストール

### 必要要件
- Python 3.7以上
- pip

### セットアップ

```bash
# リポジトリのクローン（または移動）
cd 1.pomodoro

# 依存関係のインストール
pip install -r requirements.txt
```

## 使用方法

### 開発環境で実行
```bash
FLASK_DEBUG=true python app.py
```

### 本番環境で実行
```bash
python app.py
```

アプリケーションは **http://localhost:5000** で起動します。

### Docker での実行（オプション）
```bash
# Dockerfileを作成して実行
docker build -t pomodoro-timer .
docker run -p 5000:5000 pomodoro-timer
```

## API エンドポイント

### GET `/api/stats`
ユーザーの統計情報を取得

**レスポンス例:**
```json
{
  "xp": 500,
  "level": 6,
  "xp_progress": 0,
  "xp_needed": 100,
  "total_pomodoros": 10,
  "current_streak": 3,
  "max_streak": 5,
  "badges": [...],
  "weekly_stats": [...],
  "monthly_stats": {...}
}
```

### POST `/api/complete-pomodoro`
ポモドーロ完了を記録

**リクエストボディ:**
```json
{
  "focus_time": 25
}
```

**レスポンス例:**
```json
{
  "success": true,
  "xp_gained": 50,
  "level_up": false,
  "new_badges": [...],
  "current_streak": 3
}
```

### POST `/api/reset-data`
データをリセット（開発環境のみ）

**注意**: `FLASK_DEBUG=true` の環境でのみ利用可能

## データストレージ

ユーザーデータは `user_data.json` に保存されます：

```json
{
  "xp": 500,
  "level": 6,
  "total_pomodoros": 10,
  "current_streak": 3,
  "max_streak": 5,
  "last_completion_date": "2026-02-24T06:00:00",
  "badges": ["first_pomodoro", "ten_pomodoros", "streak_3"],
  "history": [...]
}
```

**注意**: `user_data.json` はGit管理から除外されています（個人データのため）

## カスタマイズ

### XP量の調整
`app.py` の以下の行を変更：
```python
xp_gained = int(focus_time * 2)  # 25分 = 50XP
```

### レベルアップ閾値の調整
```python
def calculate_level(xp):
    return (xp // 100) + 1  # 100XPごとにレベルアップ
```

### タイマー時間の変更
`templates/index.html` の以下の行を変更：
```javascript
let timeLeft = 25 * 60;  // 25分（秒単位）
```

### バッジの追加
`app.py` の `BADGES` 辞書に新しいバッジを追加：
```python
BADGES = {
    'custom_badge': {
        'name': 'カスタムバッジ',
        'description': 'カスタム条件を達成',
        'condition': lambda data: data['total_pomodoros'] >= 20
    }
}
```

## スクリーンショット

### 初期状態
![初期状態](https://github.com/user-attachments/assets/58e70421-a004-4dd7-90da-f79cd2635053)

### 進捗後（レベル6、3つのバッジ獲得）
![進捗後](https://github.com/user-attachments/assets/74c4c9e7-8986-455e-ba73-f0bbca03e4aa)

## 今後の改善案

- [ ] ユーザー認証システム
- [ ] データベース（SQLite/PostgreSQL）への移行
- [ ] 複数のタイマープリセット（短休憩・長休憩）
- [ ] ソーシャル機能（友達との競争）
- [ ] モバイルアプリ版（React Native/Flutter）
- [ ] 集中度のヒートマップ表示
- [ ] カスタムテーマ機能
- [ ] エクスポート機能（CSV/PDF）

## トラブルシューティング

### ポートが既に使用されている
```bash
# 別のポートで起動
python -c "from app import app; app.run(port=5001)"
```

### データが保存されない
- ファイルの書き込み権限を確認
- ディスク容量を確認
- ログでエラーを確認

### 統計が更新されない
- ブラウザのキャッシュをクリア
- F12で開発者ツールを開き、コンソールエラーを確認

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 作成者

GitHub Copilot Workshop 2024

## 謝辞

- Pomodoroテクニック: Francesco Cirillo
- Flask: Pallets Projects
- デザインインスピレーション: Material Design
