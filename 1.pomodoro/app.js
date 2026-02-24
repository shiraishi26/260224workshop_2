// ポモドーロタイマーアプリケーション

class PomodoroTimer {
    constructor() {
        // デフォルト設定
        this.settings = {
            pomodoroTime: 25,
            breakTime: 5,
            theme: 'light',
            sounds: {
                start: true,
                end: true,
                tick: false
            }
        };

        // タイマー状態
        this.timeLeft = this.settings.pomodoroTime * 60;
        this.totalTime = this.settings.pomodoroTime * 60;
        this.isRunning = false;
        this.isPaused = false;
        this.isBreak = false;
        this.completedPomodoros = 0;
        this.timerInterval = null;

        // DOM要素
        this.timeDisplay = document.getElementById('timeDisplay');
        this.modeIndicator = document.getElementById('modeIndicator');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.completedPomodorosDisplay = document.getElementById('completedPomodoros');
        this.progressCircle = document.getElementById('progressCircle');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeBtn = document.getElementById('closeBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');

        // 初期化
        this.init();
    }

    init() {
        // 保存された設定を読み込む
        this.loadSettings();
        
        // イベントリスナーを設定
        this.setupEventListeners();
        
        // テーマを適用
        this.applyTheme();
        
        // 表示を更新
        this.updateDisplay();
        this.updateProgress();
    }

    setupEventListeners() {
        // タイマーコントロール
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());

        // 設定モーダル
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        // モーダル外クリックで閉じる
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // 設定オプションボタン
        document.querySelectorAll('[data-time]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-time]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        document.querySelectorAll('[data-break]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-break]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-theme]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.settingsModal.classList.contains('show')) {
                e.preventDefault();
                if (!this.isRunning) {
                    this.start();
                } else {
                    this.pause();
                }
            }
        });
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            // 開始音を再生
            if (this.settings.sounds.start) {
                this.playSound('start');
            }

            this.timerInterval = setInterval(() => {
                this.tick();
            }, 1000);
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            clearInterval(this.timerInterval);
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.isBreak = false;
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        clearInterval(this.timerInterval);
        
        this.timeLeft = this.settings.pomodoroTime * 60;
        this.totalTime = this.settings.pomodoroTime * 60;
        this.modeIndicator.textContent = '作業時間';
        
        this.updateDisplay();
        this.updateProgress();
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            
            // tick音を再生
            if (this.settings.sounds.tick) {
                this.playSound('tick');
            }
            
            this.updateDisplay();
            this.updateProgress();
        } else {
            this.complete();
        }
    }

    complete() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        
        // 終了音を再生
        if (this.settings.sounds.end) {
            this.playSound('end');
        }

        // 通知を表示
        this.showNotification();

        if (!this.isBreak) {
            // ポモドーロ完了
            this.completedPomodoros++;
            this.completedPomodorosDisplay.textContent = this.completedPomodoros;
            
            // 休憩時間に切り替え
            this.isBreak = true;
            this.timeLeft = this.settings.breakTime * 60;
            this.totalTime = this.settings.breakTime * 60;
            this.modeIndicator.textContent = '休憩時間';
        } else {
            // 休憩完了
            this.isBreak = false;
            this.timeLeft = this.settings.pomodoroTime * 60;
            this.totalTime = this.settings.pomodoroTime * 60;
            this.modeIndicator.textContent = '作業時間';
        }

        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.updateDisplay();
        this.updateProgress();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // ドキュメントタイトルも更新
        document.title = `${this.timeDisplay.textContent} - ポモドーロタイマー`;
    }

    updateProgress() {
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const circumference = 2 * Math.PI * 140; // r=140
        const offset = circumference - (progress * circumference);
        this.progressCircle.style.strokeDashoffset = offset;
    }

    openSettings() {
        this.settingsModal.classList.add('show');
        
        // 現在の設定を反映
        document.querySelectorAll('[data-time]').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.time) === this.settings.pomodoroTime);
        });
        
        document.querySelectorAll('[data-break]').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.break) === this.settings.breakTime);
        });
        
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.settings.theme);
        });
        
        document.getElementById('startSoundToggle').checked = this.settings.sounds.start;
        document.getElementById('endSoundToggle').checked = this.settings.sounds.end;
        document.getElementById('tickSoundToggle').checked = this.settings.sounds.tick;
    }

    closeSettings() {
        this.settingsModal.classList.remove('show');
    }

    saveSettings() {
        // ポモドーロ時間
        const pomodoroTime = document.querySelector('[data-time].active');
        if (pomodoroTime) {
            this.settings.pomodoroTime = parseInt(pomodoroTime.dataset.time);
        }

        // 休憩時間
        const breakTime = document.querySelector('[data-break].active');
        if (breakTime) {
            this.settings.breakTime = parseInt(breakTime.dataset.break);
        }

        // テーマ
        const theme = document.querySelector('[data-theme].active');
        if (theme) {
            this.settings.theme = theme.dataset.theme;
        }

        // サウンド設定
        this.settings.sounds.start = document.getElementById('startSoundToggle').checked;
        this.settings.sounds.end = document.getElementById('endSoundToggle').checked;
        this.settings.sounds.tick = document.getElementById('tickSoundToggle').checked;

        // 設定を保存
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));

        // テーマを適用
        this.applyTheme();

        // タイマーが実行中でない場合、時間をリセット
        if (!this.isRunning && !this.isPaused) {
            this.timeLeft = this.settings.pomodoroTime * 60;
            this.totalTime = this.settings.pomodoroTime * 60;
            this.updateDisplay();
            this.updateProgress();
        }

        this.closeSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            try {
                this.settings = JSON.parse(saved);
                this.timeLeft = this.settings.pomodoroTime * 60;
                this.totalTime = this.settings.pomodoroTime * 60;
            } catch (e) {
                console.error('設定の読み込みに失敗しました:', e);
            }
        }

        // 完了したポモドーロ数を読み込む
        const completed = localStorage.getItem('completedPomodoros');
        if (completed) {
            this.completedPomodoros = parseInt(completed);
            this.completedPomodorosDisplay.textContent = this.completedPomodoros;
        }
    }

    applyTheme() {
        document.body.setAttribute('data-theme', this.settings.theme);
    }

    playSound(type) {
        // Web Audio APIを使用して簡単な音を生成
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'start') {
            oscillator.frequency.value = 523.25; // C5
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'end') {
            oscillator.frequency.value = 659.25; // E5
            gainNode.gain.value = 0.3;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'tick') {
            oscillator.frequency.value = 440; // A4
            gainNode.gain.value = 0.05;
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.01);
        }
    }

    showNotification() {
        const message = this.isBreak ? 
            '🍅 ポモドーロ完了！休憩時間です。' : 
            '☕ 休憩終了！次のポモドーロを始めましょう。';

        // ブラウザ通知をリクエスト
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ポモドーロタイマー', {
                body: message,
                icon: './pomodoro.png'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('ポモドーロタイマー', {
                        body: message,
                        icon: './pomodoro.png'
                    });
                }
            });
        }

        // フォールバック: アラートメッセージ
        if (!('Notification' in window) || Notification.permission === 'denied') {
            alert(message);
        }
    }
}

// アプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    
    // ページを離れる前に完了数を保存
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('completedPomodoros', timer.completedPomodoros);
    });
});
