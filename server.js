const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'players.json');

app.use(express.json());
app.use(express.static(__dirname));

// Сохраняем результат игрока
app.post('/api/update', (req, res) => {
  const { name, score } = req.body;

  let players = [];
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE);
    players = JSON.parse(data);
  }

  const playerIndex = players.findIndex(p => p.name === name);
  if (playerIndex > -1) {
    players[playerIndex].score += score;
  } else {
    players.push({ name, score });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
  res.json({ success: true });
});

// Получаем всех игроков
app.get('/api/players', (req, res) => {
  const data = fs.readFileSync(DATA_FILE);
  res.send(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
