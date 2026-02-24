// Pomodoro Timer Configuration
const WORK_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60; // 5 minutes in seconds

// State
let timeRemaining = WORK_TIME;
let totalTime = WORK_TIME;
let isRunning = false;
let isWorkMode = true;
let timerInterval = null;
let completedCycles = 0;

// DOM Elements
const timerDisplay = document.getElementById('timer-display');
const timerMode = document.getElementById('timer-mode');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const cyclesCount = document.getElementById('cycles-count');
const progressCircle = document.querySelector('.progress-ring-circle');
const particlesContainer = document.getElementById('particles-container');
const rippleContainer = document.getElementById('ripple-container');

// Progress circle calculations
let radius = progressCircle.r.baseVal.value;
let circumference = 2 * Math.PI * radius;

function updateCircleMetrics() {
    radius = progressCircle.r.baseVal.value;
    circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    updateProgressBar();
}

// Initialize
updateCircleMetrics();
updateDisplay();

// Handle window resize for responsive behavior
window.addEventListener('resize', updateCircleMetrics);

// Event Listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        if (isWorkMode) {
            startParticles();
            startRipples();
        }
        
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateDisplay();
            updateProgressBar();
            updateColorTheme();
            
            if (timeRemaining <= 0) {
                timerComplete();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (isRunning) {
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        clearInterval(timerInterval);
        stopParticles();
        stopRipples();
    }
}

function resetTimer() {
    pauseTimer();
    isWorkMode = true;
    timeRemaining = WORK_TIME;
    totalTime = WORK_TIME;
    updateDisplay();
    updateProgressBar();
    updateModeDisplay();
    updateColorTheme();
    document.body.className = '';
}

function timerComplete() {
    pauseTimer();
    
    if (isWorkMode) {
        completedCycles++;
        cyclesCount.textContent = completedCycles;
        isWorkMode = false;
        timeRemaining = BREAK_TIME;
        totalTime = BREAK_TIME;
        alert('お疲れ様でした！休憩時間です 🎉');
    } else {
        isWorkMode = true;
        timeRemaining = WORK_TIME;
        totalTime = WORK_TIME;
        alert('休憩終了！次のポモドーロを始めましょう 🍅');
    }
    
    updateDisplay();
    updateProgressBar();
    updateModeDisplay();
    updateColorTheme();
}

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateModeDisplay() {
    if (isWorkMode) {
        timerMode.textContent = '集中時間';
    } else {
        timerMode.textContent = '休憩時間';
    }
}

function updateProgressBar() {
    const progress = timeRemaining / totalTime;
    const offset = circumference * (1 - progress);
    progressCircle.style.strokeDashoffset = offset;
}

function updateColorTheme() {
    if (!isWorkMode) {
        document.body.className = 'break-mode';
        progressCircle.style.stroke = '#43e97b';
        return;
    }
    
    const progress = timeRemaining / totalTime;
    
    if (progress > 0.5) {
        // Blue phase (100% - 50%)
        document.body.className = 'focus-mode';
        progressCircle.style.stroke = '#4facfe';
    } else if (progress > 0.2) {
        // Yellow phase (50% - 20%)
        const yellowProgress = (progress - 0.2) / 0.3;
        const r = Math.floor(79 + (245 - 79) * (1 - yellowProgress));
        const g = Math.floor(172 + (185 - 172) * (1 - yellowProgress));
        const b = Math.floor(254 + (108 - 254) * (1 - yellowProgress));
        progressCircle.style.stroke = `rgb(${r}, ${g}, ${b})`;
    } else {
        // Red phase (20% - 0%)
        document.body.className = 'warning-mode';
        progressCircle.style.stroke = '#f5576c';
    }
}

// Particle Effects
let particleInterval = null;

function startParticles() {
    particleInterval = setInterval(createParticle, 300);
}

function stopParticles() {
    if (particleInterval) {
        clearInterval(particleInterval);
        particleInterval = null;
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    const size = Math.random() * 8 + 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = '0';
    particle.style.animationDuration = `${Math.random() * 4 + 6}s`;
    particle.style.animationDelay = `${Math.random() * 2}s`;
    
    particlesContainer.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 10000);
}

// Ripple Effects
let rippleInterval = null;

function startRipples() {
    rippleInterval = setInterval(createRipple, 2000);
}

function stopRipples() {
    if (rippleInterval) {
        clearInterval(rippleInterval);
        rippleInterval = null;
    }
}

function createRipple() {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.marginLeft = '-150px';
    ripple.style.marginTop = '-150px';
    
    rippleContainer.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 3000);
}

// Update mode display on init
updateModeDisplay();
