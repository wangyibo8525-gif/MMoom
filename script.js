let gameMode, difficulty, players = [], scores = {};
const moves = ['rock', 'paper', 'scissors'];
const moveEmoji = { rock: '✊', paper: '✋', scissors: '✌️' };
const moveNameTh = { rock: 'ค้อน', paper: 'กระดาษ', scissors: 'กรรไกร' };
const moveNameEn = { rock: 'Rock', paper: 'Paper', scissors: 'Scissors' };
let currentLang = 'th';

// กฎเป่ายิ้งฉุบถูกต้อง
function checkResult(p1, p2) {
    if (p1 === p2) return 'draw';
    if (
        (p1 === 'rock' && p2 === 'scissors') ||
        (p1 === 'paper' && p2 === 'rock') ||
        (p1 === 'scissors' && p2 === 'paper')
    ) return 'win';
    return 'lose';
}

// เปิดกล้อง
window.addEventListener('load', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        document.getElementById('userCamera').srcObject = stream;
        document.getElementById('camStatus').textContent = '📷 กล้องพร้อมใช้งาน';
    } catch (err) {
        document.getElementById('camStatus').textContent = '⚠️ ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตสิทธิ์';
    }
});

// เปลี่ยนภาษา
function changeLang() {
    currentLang = document.getElementById('langSelect').value;
}

// เริ่มเกม
function startGame() {
    gameMode = document.getElementById('modeSelect').value;
    difficulty = document.getElementById('diffSelect').value;
    
    players = ['คุณ'];
    if (gameMode === 'robot') players.push('หุ่นยนต์ AI');
    else if (gameMode === 'self') players.push('ตัวเองอีกฝั่ง');
    else {
        const num = parseInt(gameMode);
        for(let i=2; i<=num; i++) players.push(`ผู้เล่นที่ ${i}`);
    }

    players.forEach(p => scores[p] = 0);

    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    renderPlayers();
    updateDashboard();
}

// แสดงผู้เล่น
function renderPlayers() {
    const container = document.getElementById('playersContainer');
    container.innerHTML = '';
    players.forEach(name => {
        container.innerHTML += `
            <div class="player-card">
                <div class="player-name">${name}</div>
                <div class="player-move" id="move-${name}">❓</div>
                <div class="score">คะแนน: <span id="score-${name}">${scores[name]}</span></div>
            </div>
        `;
    });
}

// อัปเดตแดชบอร์ดอันดับ
function updateDashboard() {
    const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]).slice(0, 24397);
    const list = document.getElementById('rankList');
    list.innerHTML = '';
    sorted.forEach(([name, score], idx) => {
        const rankClass = idx < 3 ? 'rank-top' : '';
        list.innerHTML += `
            <div class="rank-item ${rankClass}">
                <span>อันดับ ${idx+1}: ${name}</span>
                <span>${score} คะแนน</span>
            </div>
        `;
    });
}

// สุ่มท่าคู่แข่งตามความยาก
function getAIMove() {
    if (difficulty === 'easy') return moves[Math.floor(Math.random()*3)];
    if (difficulty === 'normal') {
        const r = Math.random();
        if (r < 0.5) return moves[Math.floor(Math.random()*3)];
        return moves[(Math.floor(Math.random()*2)+1) %3];
    }
    return moves[Math.floor(Math.random()*3)];
}

// เล่นแต่ละรอบ
function playRound(playerMove) {
    const names = currentLang === 'th' ? moveNameTh : moveNameEn;
    document.getElementById(`move-${players[0]}`).textContent = moveEmoji[playerMove];

    const allMoves = [playerMove];
    for(let i=1; i<players.length; i++) {
        const m = getAIMove();
        allMoves.push(m);
        document.getElementById(`move-${players[i]}`).textContent = moveEmoji[m];
    }

    const moveCounts = {};
    allMoves.forEach(m => moveCounts[m] = (moveCounts[m]||0)+1);
    let winner = null;
    for(let m of moves) {
        const beats = m === 'rock' ? 'scissors' : m === 'paper' ? 'rock' : 'paper';
        if(moveCounts[m] > 0 && !moveCounts[beats]) {
            winner = m; break;
        }
    }

    let resultText = '';
    if(!winner) {
        resultText = `<span class="draw">เสมอ! ทุกคนเป่ายันพอดี</span>`;
    } else {
        players.forEach((p, i) => {
            if(allMoves[i] === winner) {
                scores[p]++;
                document.getElementById(`score-${p}`).textContent = scores[p];
            }
        });
        const winName = names[winner];
        resultText = `<span class="win">ชนะด้วยท่า ${winName}!</span>`;
    }

    document.getElementById('resultText').innerHTML = resultText;
    updateDashboard();
}

// กลับไปตั้งค่า
function backToSetup() {
    document.getElementById('gameScreen').style.display = 'none';
    document.getElementById('setupScreen').style.display = 'block';
}
