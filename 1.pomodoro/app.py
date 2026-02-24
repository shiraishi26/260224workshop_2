"""
Pomodoro Timer App with Gamification Elements
ゲーミフィケーション機能付きポモドーロタイマー
"""

from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import json
import os
import fcntl
from pathlib import Path

app = Flask(__name__)

# データファイルのパス
DATA_FILE = Path(__file__).parent / 'user_data.json'

# デフォルトのユーザーデータ
DEFAULT_USER_DATA = {
    'xp': 0,
    'level': 1,
    'total_pomodoros': 0,
    'current_streak': 0,
    'max_streak': 0,
    'last_completion_date': None,
    'badges': [],
    'history': []  # {date, pomodoros_completed, total_focus_time}
}

# バッジ定義
BADGES = {
    'first_pomodoro': {
        'name': '初めの一歩',
        'description': '最初のポモドーロを完了',
        'condition': lambda data: data['total_pomodoros'] >= 1
    },
    'ten_pomodoros': {
        'name': 'ビギナー',
        'description': '10回のポモドーロを完了',
        'condition': lambda data: data['total_pomodoros'] >= 10
    },
    'fifty_pomodoros': {
        'name': '中級者',
        'description': '50回のポモドーロを完了',
        'condition': lambda data: data['total_pomodoros'] >= 50
    },
    'hundred_pomodoros': {
        'name': '上級者',
        'description': '100回のポモドーロを完了',
        'condition': lambda data: data['total_pomodoros'] >= 100
    },
    'streak_3': {
        'name': '3日連続',
        'description': '3日連続でポモドーロを完了',
        'condition': lambda data: data['current_streak'] >= 3
    },
    'streak_7': {
        'name': '1週間連続',
        'description': '7日連続でポモドーロを完了',
        'condition': lambda data: data['current_streak'] >= 7
    },
    'streak_30': {
        'name': '1ヶ月連続',
        'description': '30日連続でポモドーロを完了',
        'condition': lambda data: data['current_streak'] >= 30
    },
    'level_5': {
        'name': 'レベル5達成',
        'description': 'レベル5に到達',
        'condition': lambda data: data['level'] >= 5
    },
    'level_10': {
        'name': 'レベル10達成',
        'description': 'レベル10に到達',
        'condition': lambda data: data['level'] >= 10
    }
}

def load_user_data():
    """ユーザーデータをロード（ファイルロック付き）"""
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            # 読み込み時は共有ロック
            try:
                fcntl.flock(f.fileno(), fcntl.LOCK_SH)
                data = json.load(f)
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
                return data
            except:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)
                raise
    return DEFAULT_USER_DATA.copy()

def save_user_data(data):
    """ユーザーデータを保存（ファイルロック付き）"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        # 書き込み時は排他ロック
        try:
            fcntl.flock(f.fileno(), fcntl.LOCK_EX)
            json.dump(data, f, ensure_ascii=False, indent=2)
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
        except:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
            raise

def calculate_level(xp):
    """XPからレベルを計算（100XPごとにレベルアップ）"""
    return (xp // 100) + 1

def calculate_xp_for_level(level):
    """レベルに必要なXP"""
    return (level - 1) * 100

def check_and_award_badges(data):
    """新しいバッジを確認して授与"""
    new_badges = []
    for badge_id, badge_info in BADGES.items():
        if badge_id not in data['badges'] and badge_info['condition'](data):
            data['badges'].append(badge_id)
            new_badges.append({
                'id': badge_id,
                'name': badge_info['name'],
                'description': badge_info['description']
            })
    return new_badges

def update_streak(data, completion_date):
    """ストリークを更新"""
    if data['last_completion_date']:
        last_date = datetime.fromisoformat(data['last_completion_date']).date()
        current_date = datetime.fromisoformat(completion_date).date()
        
        # 連続日数の確認
        if current_date == last_date:
            # 同じ日
            pass
        elif current_date == last_date + timedelta(days=1):
            # 連続
            data['current_streak'] += 1
        else:
            # 途切れた
            data['current_streak'] = 1
    else:
        data['current_streak'] = 1
    
    # 最大ストリークの更新
    if data['current_streak'] > data['max_streak']:
        data['max_streak'] = data['current_streak']
    
    data['last_completion_date'] = completion_date

def get_weekly_stats(data):
    """週間統計を取得"""
    today = datetime.now().date()
    week_start = today - timedelta(days=today.weekday())
    
    weekly_data = []
    for i in range(7):
        day = week_start + timedelta(days=i)
        day_str = day.isoformat()
        
        # その日の履歴を検索
        day_pomodoros = 0
        day_focus_time = 0
        for entry in data['history']:
            if entry['date'].startswith(day_str):
                day_pomodoros += entry['pomodoros_completed']
                day_focus_time += entry['total_focus_time']
        
        weekly_data.append({
            'date': day_str,
            'day_name': ['月', '火', '水', '木', '金', '土', '日'][i],
            'pomodoros': day_pomodoros,
            'focus_time': day_focus_time
        })
    
    return weekly_data

def get_monthly_stats(data):
    """月間統計を取得"""
    today = datetime.now()
    current_month = today.replace(day=1)
    
    monthly_data = {
        'total_pomodoros': 0,
        'total_focus_time': 0,
        'days_active': 0,
        'completion_rate': 0
    }
    
    days_in_month = set()
    for entry in data['history']:
        entry_date = datetime.fromisoformat(entry['date'])
        if entry_date.year == today.year and entry_date.month == today.month:
            monthly_data['total_pomodoros'] += entry['pomodoros_completed']
            monthly_data['total_focus_time'] += entry['total_focus_time']
            days_in_month.add(entry_date.date())
    
    monthly_data['days_active'] = len(days_in_month)
    
    # 完了率の計算（日数 / 月の経過日数）
    days_passed = today.day
    if days_passed > 0:
        monthly_data['completion_rate'] = (len(days_in_month) / days_passed) * 100
    
    return monthly_data

@app.route('/')
def index():
    """メインページ"""
    return render_template('index.html')

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """ユーザー統計を取得"""
    data = load_user_data()
    
    # バッジ情報を追加
    badges_info = []
    for badge_id in data['badges']:
        if badge_id in BADGES:
            badges_info.append({
                'id': badge_id,
                'name': BADGES[badge_id]['name'],
                'description': BADGES[badge_id]['description']
            })
    
    # 次のレベルまでのXP計算
    next_level = data['level'] + 1
    xp_for_next_level = calculate_xp_for_level(next_level)
    xp_progress = data['xp'] - calculate_xp_for_level(data['level'])
    xp_needed = xp_for_next_level - calculate_xp_for_level(data['level'])
    
    return jsonify({
        'xp': data['xp'],
        'level': data['level'],
        'xp_progress': xp_progress,
        'xp_needed': xp_needed,
        'total_pomodoros': data['total_pomodoros'],
        'current_streak': data['current_streak'],
        'max_streak': data['max_streak'],
        'badges': badges_info,
        'weekly_stats': get_weekly_stats(data),
        'monthly_stats': get_monthly_stats(data)
    })

@app.route('/api/complete-pomodoro', methods=['POST'])
def complete_pomodoro():
    """ポモドーロ完了時の処理"""
    data = load_user_data()
    request_data = request.json
    
    focus_time = request_data.get('focus_time', 25)  # 分単位
    completion_date = datetime.now().isoformat()
    
    # XPを付与（25分 = 50XP）
    xp_gained = int(focus_time * 2)
    data['xp'] += xp_gained
    data['total_pomodoros'] += 1
    
    # レベル計算
    old_level = data['level']
    data['level'] = calculate_level(data['xp'])
    level_up = data['level'] > old_level
    
    # ストリークの更新
    update_streak(data, completion_date)
    
    # 履歴の更新
    today_str = datetime.now().date().isoformat()
    today_entry = None
    for entry in data['history']:
        if entry['date'].startswith(today_str):
            today_entry = entry
            break
    
    if today_entry:
        today_entry['pomodoros_completed'] += 1
        today_entry['total_focus_time'] += focus_time
    else:
        data['history'].append({
            'date': completion_date,
            'pomodoros_completed': 1,
            'total_focus_time': focus_time
        })
    
    # バッジの確認
    new_badges = check_and_award_badges(data)
    
    # データを保存
    save_user_data(data)
    
    return jsonify({
        'success': True,
        'xp_gained': xp_gained,
        'level_up': level_up,
        'new_level': data['level'] if level_up else None,
        'new_badges': new_badges,
        'current_streak': data['current_streak']
    })

@app.route('/api/reset-data', methods=['POST'])
def reset_data():
    """データをリセット（開発/テスト用のみ）"""
    # 開発環境でのみ有効化
    if not os.getenv('FLASK_DEBUG', 'False').lower() == 'true':
        return jsonify({'success': False, 'error': 'This endpoint is only available in debug mode'}), 403
    save_user_data(DEFAULT_USER_DATA.copy())
    return jsonify({'success': True})

if __name__ == '__main__':
    # 環境変数でdebugモードを制御（本番環境では必ずFalseにする）
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
