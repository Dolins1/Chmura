const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const boardSizeSelect = document.getElementById('boardSize');
const gameModeSelect = document.getElementById('gameMode');

let board, currentPlayer, gameActive, winLine, boardSize, gameMode, aiPlayer;

function initializeGame(selectedSize, selectedMode) {
    boardSize = selectedSize || parseInt(boardSizeSelect.value, 10);
    gameMode = selectedMode || gameModeSelect.value;
    board = Array(boardSize * boardSize).fill('');
    currentPlayer = 'X';
    gameActive = true;
    winLine = null;
    aiPlayer = 'O'; // AI zawsze jako 'O'
    statusEl.textContent = `Ruch gracza: ${currentPlayer}`;
    renderBoard();
    // Jeśli AI zaczyna
    if (gameMode === 'vsAI' && currentPlayer === aiPlayer) {
        setTimeout(aiMove, 400);
    }
}

function renderBoard() {
    boardEl.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 60px)`;
    boardEl.style.gridTemplateRows = `repeat(${boardSize}, 60px)`;
    for (let i = 0; i < board.length; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        if (winLine && winLine.includes(i)) {
            cell.classList.add('win');
        }
        // Dodaj symbol (z animacją) jeśli pole nie jest puste
        if (board[i] !== '') {
            const symbolSpan = document.createElement('span');
            symbolSpan.className = 'symbol';
            symbolSpan.textContent = board[i];
            cell.appendChild(symbolSpan);
        }
        cell.addEventListener('click', handleCellClick);
        boardEl.appendChild(cell);
    }
}

function handleCellClick(e) {
    const idx = parseInt(e.target.dataset.index, 10);
    if (!gameActive || board[idx] !== '') return;
    if (gameMode === 'vsAI' && currentPlayer === aiPlayer) return; // blokuj kliknięcia dla AI

    makeMove(idx, currentPlayer, true);

    if (gameMode === 'vsAI' && gameActive && currentPlayer === aiPlayer) {
        setTimeout(aiMove, 400);
    }
}

function makeMove(idx, player, animate = false) {
    board[idx] = player;
    // renderBoard() wywoła animację symbolu
    renderBoard();

    // Jeśli animacja, dodaj klasę symbolowi tylko w nowym ruchu
    if (animate) {
        const cell = boardEl.children[idx];
        const symbolSpan = cell.querySelector('.symbol');
        if (symbolSpan) {
            symbolSpan.classList.remove('symbol'); // Reset (gdyby klasa już była)
            void symbolSpan.offsetWidth; // Wymuś reflow
            symbolSpan.classList.add('symbol');
        }
    }

    const winner = checkWin();
    if (winner) {
        winLine = winner;
        statusEl.textContent = `Wygrał gracz: ${player}!`;
        gameActive = false;
        renderBoard(); // podświetlenie
    } else if (board.every(cell => cell !== '')) {
        statusEl.textContent = 'Remis!';
        gameActive = false;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusEl.textContent = `Ruch gracza: ${currentPlayer}`;
    }
}

// Prosta AI: losowy ruch
function aiMove() {
    if (!gameActive) return;
    // znajdź wolne pola
    const free = board.map((cell, idx) => cell === '' ? idx : null).filter(idx => idx !== null);
    if (free.length === 0) return;
    // losowy wybór
    const aiIdx = free[Math.floor(Math.random() * free.length)];
    makeMove(aiIdx, aiPlayer, true);
}

function checkWin() {
    // Sprawdź wiersze
    for (let row = 0; row < boardSize; row++) {
        let start = row * boardSize;
        let pattern = [];
        for (let col = 0; col < boardSize; col++) {
            pattern.push(start + col);
        }
        if (pattern.every(idx => board[idx] === currentPlayer)) {
            return pattern;
        }
    }
    // Sprawdź kolumny
    for (let col = 0; col < boardSize; col++) {
        let pattern = [];
        for (let row = 0; row < boardSize; row++) {
            pattern.push(row * boardSize + col);
        }
        if (pattern.every(idx => board[idx] === currentPlayer)) {
            return pattern;
        }
    }
    // Sprawdź przekątną lewą-górną do prawej-dolnej
    let diag1 = [];
    for (let i = 0; i < boardSize; i++) {
        diag1.push(i * boardSize + i);
    }
    if (diag1.every(idx => board[idx] === currentPlayer)) {
        return diag1;
    }
    // Sprawdź przekątną prawą-górną do lewej-dolnej
    let diag2 = [];
    for (let i = 0; i < boardSize; i++) {
        diag2.push(i * boardSize + (boardSize - 1 - i));
    }
    if (diag2.every(idx => board[idx] === currentPlayer)) {
        return diag2;
    }
    return null;
}

restartBtn.addEventListener('click', () => initializeGame());
boardSizeSelect.addEventListener('change', () => initializeGame());
gameModeSelect.addEventListener('change', () => initializeGame());

initializeGame();