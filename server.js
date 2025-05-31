const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Путь к файлу stats.json
const STATS_FILE_PATH = path.join(__dirname, 'stats.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Раздаём статические файлы

// Получение всей статистики
app.get('/api/stats', (req, res) => {
  const data = fs.readFileSync(STATS_FILE_PATH);
  res.json(JSON.parse(data));
});

// Обновление статистики игрока
app.post('/api/update', (req, res) => {
  const { username, wins, losses, level } = req.body;
  if (!username) return res.status(400).send('Имя пользователя обязательно');

  let stats = {};
  try {
    const data = fs.readFileSync(STATS_FILE_PATH);
    stats = JSON.parse(data);
  } catch (err) {
    console.error("Ошибка чтения файла:", err);
  }

  stats[username] = { wins, losses, level };
  fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2));

  res.json({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
