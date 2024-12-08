const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// 브라우저 창 크기에 맞게 캔버스 크기 설정
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 윈도우 크기가 변경될 때마다 캔버스 크기 업데이트
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// 플레이어 설정
const player = {
  x: 370,
  y: 270,
  width: 60,
  height: 60,
  color: 'blue',
  speed: 5,
  velocityX: 0,
  velocityY: 0,
  health: 100,
  maxHealth: 100,
  lastAttackTime: 0,
  attackCooldown: 1000, // 공격 쿨타임 (밀리초 단위)
  attackCooldownTimeLeft: 0, // 남은 쿨타임
};

// 적 설정
let enemy = {
  x: Math.random() * (800 - 40),
  y: Math.random() * (600 - 40),
  width: 40,
  height: 40,
  color: 'red',
  health: 50,
  maxHealth: 50,
  damage: 10,
  lastAttackTime: 0,
  attackCooldown: 1500, // 공격 쿨타임 (밀리초 단위)
};

// 게임 시작 함수
function startGame() {
  startButton.style.display = 'none';  // 게임 시작 버튼 숨기기
  canvas.style.display = 'block';  // 게임 캔버스 표시

  // 게임 루프 시작
  spawnEnemy();
  gameLoop();
}

// 플레이어 및 적 그리기
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
  drawPlayerUI();
}

function drawEnemy() {
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  drawEnemyUI();
}

// 플레이어 체력 UI
function drawPlayerUI() {
  const barWidth = 100;
  const barHeight = 10;
  const healthPercentage = player.health / player.maxHealth;

  // 체력 바 배경
  ctx.fillStyle = 'gray';
  ctx.fillRect(10, 10, barWidth, barHeight);

  // 현재 체력
  ctx.fillStyle = 'green';
  ctx.fillRect(10, 10, barWidth * healthPercentage, barHeight);

  // 체력 텍스트
  ctx.fillStyle = 'black';
  ctx.font = '14px Arial';
  ctx.fillText(`Player HP: ${player.health}/${player.maxHealth}`, 10, 35);

  // 플레이어 공격 쿨타임 UI
  if (player.attackCooldownTimeLeft > 0) {
    // 원형으로 쿨타임 표시
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(120, 50, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // 쿨타임 진행 표시
    ctx.fillStyle = 'blue';
    const arcEnd = (player.attackCooldownTimeLeft / player.attackCooldown) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(120, 50, 30, -Math.PI / 2, -Math.PI / 2 + arcEnd);
    ctx.lineTo(120, 50);
    ctx.fill();
  }
}

// 적 체력 UI
function drawEnemyUI() {
  const barWidth = 80;
  const barHeight = 8;
  const healthPercentage = enemy.health / enemy.maxHealth;

  // 체력 바 배경
  ctx.fillStyle = 'gray';
  ctx.fillRect(enemy.x, enemy.y - 15, barWidth, barHeight);

  // 현재 체력
  ctx.fillStyle = 'red';
  ctx.fillRect(enemy.x, enemy.y - 15, barWidth * healthPercentage, barHeight);

  // 체력 텍스트
  ctx.fillStyle = 'black';
  ctx.font = '12px Arial';
  ctx.fillText(`${enemy.health}/${enemy.maxHealth}`, enemy.x, enemy.y - 20);
}

// 플레이어 이동
function updatePlayer() {
  player.x += player.velocityX;
  player.y += player.velocityY;

  // 화면 경계 제한
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

// 적 스폰
function spawnEnemy() {
  enemy.x = Math.random() * (800 - 40);
  enemy.y = Math.random() * (600 - 40);
  enemy.health = 50;
}

// 충돌 감지
function checkCollision() {
  return (
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y
  );
}

// 플레이어 공격
function attackEnemy() {
  const currentTime = Date.now();
  if (player.attackCooldownTimeLeft <= 0) { // 쿨타임이 다 끝나면 공격 가능
    if (checkCollision()) {
      enemy.health -= 20;
      console.log(`적 체력: ${enemy.health}`);
      if (enemy.health <= 0) {
        console.log("적 처치!");
        spawnEnemy(); // 새로운 적 스폰
      }
    }
    player.lastAttackTime = currentTime;
    player.attackCooldownTimeLeft = player.attackCooldown; // 쿨타임 시작
  }
}

// 적이 플레이어를 공격
function attackPlayer() {
  const currentTime = Date.now();
  if (currentTime - enemy.lastAttackTime >= enemy.attackCooldown) {
    if (checkCollision()) {
      player.health -= enemy.damage;
      console.log(`플레이어 체력: ${player.health}`);
      if (player.health <= 0) {
        console.log("게임 오버!");
        resetGame();
      }
    }
    enemy.lastAttackTime = currentTime;
  }
}

// 게임 초기화
function resetGame() {
  player.health = player.maxHealth;
  spawnEnemy();
  console.log("게임이 초기화되었습니다!");
}

// 키 입력 처리
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'w') player.velocityY = -player.speed;
  if (event.key === 'ArrowDown' || event.key === 's') player.velocityY = player.speed;
  if (event.key === 'ArrowLeft' || event.key === 'a') player.velocityX = -player.speed;
  if (event.key === 'ArrowRight' || event.key === 'd') player.velocityX = player.speed;
  if (event.key === 'e') attackEnemy(); // 공격 키
});

window.addEventListener('keyup', (event) => {
  if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(event.key)) player.velocityY = 0;
  if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(event.key)) player.velocityX = 0;
});

// 게임 루프
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 초기화

  // 업데이트 및 렌더링
  updatePlayer();
  attackPlayer(); // 적의 공격 처리

  // 쿨타임 업데이트
  if (player.attackCooldownTimeLeft > 0) {
    player.attackCooldownTimeLeft -= 100; // 100ms마다 쿨타임 감소
    if (player.attackCooldownTimeLeft < 0) {
      player.attackCooldownTimeLeft = 0;
    }
  }

  drawPlayer();
  drawEnemy();
  requestAnimationFrame(gameLoop); // 게임 루프 재귀 호출
}

// 게임 시작 버튼 클릭 시 게임 시작
startButton.addEventListener('click', startGame);
