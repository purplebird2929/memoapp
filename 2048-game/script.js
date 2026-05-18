// ゲームの状態
let board = [];
let score = 0;
let bestScore = 0;
let hasWon = false;

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    loadBestScore();
    initGame();
    
    // イベントリスナー
    document.getElementById('newGameBtn').addEventListener('click', initGame);
    document.getElementById('restartBtn').addEventListener('click', () => {
        hideModal('gameOverModal');
        initGame();
    });
    document.getElementById('continueBtn').addEventListener('click', () => {
        hideModal('winModal');
    });
    document.getElementById('newGameFromWinBtn').addEventListener('click', () => {
        hideModal('winModal');
        initGame();
    });
    
    // キーボードイベント
    document.addEventListener('keydown', handleKeyPress);
});

// ゲームの初期化
function initGame() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    score = 0;
    hasWon = false;
    updateScore();
    addRandomTile();
    addRandomTile();
    renderBoard();
}

// ボードの描画
function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const tile = document.createElement('div');
            const value = board[i][j];
            
            if (value === 0) {
                tile.className = 'tile';
            } else {
                tile.className = `tile tile-${value}`;
                tile.textContent = value;
            }
            
            gameBoard.appendChild(tile);
        }
    }
}

// ランダムなタイルを追加
function addRandomTile() {
    const emptyCells = [];
    
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    }
}

// キー入力の処理
function handleKeyPress(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        const oldBoard = JSON.stringify(board);
        
        switch (e.key) {
            case 'ArrowUp':
                moveUp();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
        }
        
        const newBoard = JSON.stringify(board);
        
        if (oldBoard !== newBoard) {
            addRandomTile();
            renderBoard();
            updateScore();
            
            if (!hasWon && checkWin()) {
                hasWon = true;
                setTimeout(() => showModal('winModal'), 500);
            } else if (checkGameOver()) {
                setTimeout(() => showModal('gameOverModal'), 500);
            }
        }
    }
}

// 上に移動
function moveUp() {
    for (let j = 0; j < 4; j++) {
        let column = [];
        for (let i = 0; i < 4; i++) {
            if (board[i][j] !== 0) {
                column.push(board[i][j]);
            }
        }
        
        column = mergeTiles(column);
        
        for (let i = 0; i < 4; i++) {
            board[i][j] = column[i] || 0;
        }
    }
}

// 下に移動
function moveDown() {
    for (let j = 0; j < 4; j++) {
        let column = [];
        for (let i = 3; i >= 0; i--) {
            if (board[i][j] !== 0) {
                column.push(board[i][j]);
            }
        }
        
        column = mergeTiles(column);
        
        for (let i = 3; i >= 0; i--) {
            board[i][j] = column[3 - i] || 0;
        }
    }
}

// 左に移動
function moveLeft() {
    for (let i = 0; i < 4; i++) {
        let row = board[i].filter(cell => cell !== 0);
        row = mergeTiles(row);
        
        for (let j = 0; j < 4; j++) {
            board[i][j] = row[j] || 0;
        }
    }
}

// 右に移動
function moveRight() {
    for (let i = 0; i < 4; i++) {
        let row = board[i].filter(cell => cell !== 0).reverse();
        row = mergeTiles(row);
        
        for (let j = 3; j >= 0; j--) {
            board[i][j] = row[3 - j] || 0;
        }
    }
}

// タイルの結合
function mergeTiles(line) {
    const result = [];
    let i = 0;
    
    while (i < line.length) {
        if (i + 1 < line.length && line[i] === line[i + 1]) {
            const mergedValue = line[i] * 2;
            result.push(mergedValue);
            score += mergedValue;
            i += 2;
        } else {
            result.push(line[i]);
            i++;
        }
    }
    
    return result;
}

// スコアの更新
function updateScore() {
    document.getElementById('score').textContent = score;
    
    if (score > bestScore) {
        bestScore = score;
        saveBestScore();
        document.getElementById('bestScore').textContent = bestScore;
    }
}

// ベストスコアの保存
function saveBestScore() {
    localStorage.setItem('2048-bestScore', bestScore);
}

// ベストスコアの読み込み
function loadBestScore() {
    const saved = localStorage.getItem('2048-bestScore');
    bestScore = saved ? parseInt(saved) : 0;
    document.getElementById('bestScore').textContent = bestScore;
}

// 勝利判定
function checkWin() {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 2048) {
                return true;
            }
        }
    }
    return false;
}

// ゲームオーバー判定
function checkGameOver() {
    // 空きマスがあるか
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (board[i][j] === 0) {
                return false;
            }
        }
    }
    
    // 結合可能なタイルがあるか
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const current = board[i][j];
            
            // 右のタイルと比較
            if (j < 3 && current === board[i][j + 1]) {
                return false;
            }
            
            // 下のタイルと比較
            if (i < 3 && current === board[i + 1][j]) {
                return false;
            }
        }
    }
    
    return true;
}

// モーダルの表示
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    
    if (modalId === 'gameOverModal') {
        document.getElementById('finalScore').textContent = score;
    } else if (modalId === 'winModal') {
        document.getElementById('winScore').textContent = score;
    }
    
    modal.classList.add('show');
}

// モーダルの非表示
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

// Made with Bob
