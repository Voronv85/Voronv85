let score = 0;
let playerName = '';

function increaseScore() {
  score++;
  document.getElementById('score').innerText = score;
}

function submitScore() {
  playerName = document.getElementById("playerName").value;
  if (!playerName) return alert("Введите имя!");

  fetch('/api/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: playerName, score })
  }).then(() => {
    alert('Результат отправлен!');
    window.location.href = '/leaderboard.html';
  });
}
