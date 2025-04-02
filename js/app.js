// Configuration
const DICTIONARY_URL = './daftar_baku_lantip.json';

// Game State
let kataPairs = []; // Array of {tidakBaku, baku} pairs
let currentQuestion = null;
let correctCount = 0;
let wrongCount = 0;
let soundEnabled = true;
let darkMode = false;

// DOM Elements
const btn1 = document.querySelector('.btn-1');
const btn2 = document.querySelector('.btn-2');
const answerText = document.querySelector('.answer-text');
const correctStat = document.querySelector('.correct-count');
const wrongStat = document.querySelector('.wrong-count');
const soundButton = document.querySelector('.btn-sound');
const themeButton = document.querySelector('.btn-theme');

// Audio
const correctSound = new Audio("https://zenoxetine.github.io/kataBaku/audio/correct.wav");
const wrongSound = new Audio("https://zenoxetine.github.io/kataBaku/audio/wrong.mp3");

// Initialize Game
async function initGame() {
    // Load settings
    loadSettings();
    
    // Load dictionary
    try {
        await loadDictionary();
        if (kataPairs.length === 0) {
            throw new Error('Kamus kosong');
        }
        generateQuestion();
    } catch (error) {
        console.error('Gagal memuat kamus:', error);
        answerText.textContent = 'Gagal memuat kamus. Coba muat ulang halaman.';
        answerText.classList.add('wrong');
    }
    
    // Set up event listeners
    setupEventListeners();
}

// Load dictionary from URL
async function loadDictionary() {
    const response = await fetch(DICTIONARY_URL);
    if (!response.ok) {
        throw new Error('Gagal mengambil kamus');
    }
    
    const kataDict = await response.json();
    kataPairs = Object.entries(kataDict).map(([tidakBaku, baku]) => ({
        tidakBaku,
        baku
    }));
}

// Generate new question
function generateQuestion() {
    const randomIndex = Math.floor(Math.random() * kataPairs.length);
    currentQuestion = kataPairs[randomIndex];
    
    // Randomize button positions
    if (Math.random() < 0.5) {
        btn1.textContent = currentQuestion.baku;
        btn2.textContent = currentQuestion.tidakBaku;
    } else {
        btn1.textContent = currentQuestion.tidakBaku;
        btn2.textContent = currentQuestion.baku;
    }
}

// Handle answer
function handleAnswer(selectedButton) {
    const selectedText = selectedButton.textContent;
    const isCorrect = selectedText === currentQuestion.baku;
    
    if (isCorrect) {
        correctCount++;
        correctStat.textContent = correctCount;
        answerText.innerHTML = `Jawaban Anda, "<a class='link' target='_blank' href='https://kbbi.kemdikbud.go.id/entri/${selectedText}'>${selectedText}</a>", benar!`;
        answerText.className = 'answer-text correct';
        playSound(true);
    } else {
        wrongCount++;
        wrongStat.textContent = wrongCount;
        answerText.innerHTML = `Jawaban Anda, "${selectedText}", salah. <br> Jawaban yang benar adalah: "<a class='link' target='_blank' href='https://kbbi.kemdikbud.go.id/entri/${currentQuestion.baku}'>${currentQuestion.baku}</a>"`;
        answerText.className = 'answer-text wrong';
        playSound(false);
    }
    
    generateQuestion();
}

// Sound functions
function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem('sound', soundEnabled);
    updateSoundIcon();
}

function playSound(isCorrect) {
    if (!soundEnabled) return;
    
    const sound = isCorrect ? correctSound : wrongSound;
    sound.currentTime = 0;
    sound.play().catch(e => console.log('Gagal memainkan suara:', e));
}

function updateSoundIcon() {
    const icon = soundButton.querySelector('i');
    icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
}

// Theme functions
function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    applyTheme();
}

function applyTheme() {
    if (darkMode) {
        document.documentElement.style.setProperty('--headingColor', '#5ce1e6');
        document.documentElement.style.setProperty('--textColor', '#d4f1f4');
        document.documentElement.style.setProperty('--backgroundColor', '#0f172a');
        document.documentElement.style.setProperty('--correctColor', '#00b894');
        document.documentElement.style.setProperty('--wrongColor', '#ff6b6b');
    } else {
        document.documentElement.style.setProperty('--headingColor', '#029e9d');
        document.documentElement.style.setProperty('--textColor', '#2f3e46');
        document.documentElement.style.setProperty('--backgroundColor', '#ffffff');
        document.documentElement.style.setProperty('--correctColor', '#00b894');
        document.documentElement.style.setProperty('--wrongColor', '#d62828');
    }
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = themeButton.querySelector('i');
    icon.className = darkMode ? 'fas fa-sun' : 'fas fa-moon';
}

// Load settings from localStorage
function loadSettings() {
    soundEnabled = localStorage.getItem('sound') !== 'false';
    darkMode = localStorage.getItem('theme') === 'dark';
    applyTheme();
    updateSoundIcon();
}

// Set up event listeners
function setupEventListeners() {
    btn1.addEventListener('click', () => handleAnswer(btn1));
    btn2.addEventListener('click', () => handleAnswer(btn2));
    soundButton.addEventListener('click', toggleSound);
    themeButton.addEventListener('click', toggleTheme);
}

// Start the game when page loads
document.addEventListener('DOMContentLoaded', initGame);
