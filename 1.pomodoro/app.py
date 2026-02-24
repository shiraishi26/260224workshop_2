# Pomodoro Timer App
"""
シンプルなポモドーロタイマーWebアプリケーション

使い方:
1. このディレクトリでPythonの簡易HTTPサーバーを起動:
   python -m http.server 8000
   
2. ブラウザで http://localhost:8000/index.html にアクセス

機能:
- ポモドーロ時間選択（15/25/35/45分）
- 休憩時間選択（5/10/15分）
- テーマ切り替え（ライト/ダーク/フォーカスモード）
- サウンド設定（開始音・終了音・tick音のオン/オフ）
"""

if __name__ == "__main__":
    import http.server
    import socketserver
    import os

    PORT = 8000
    DIRECTORY = os.path.dirname(os.path.abspath(__file__))

    class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=DIRECTORY, **kwargs)

    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"ポモドーロタイマーアプリケーションを起動しました")
        print(f"ブラウザで http://localhost:{PORT}/index.html にアクセスしてください")
        print("終了するには Ctrl+C を押してください")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nサーバーを停止しました")

