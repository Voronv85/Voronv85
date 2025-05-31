const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const STATS_FILE_PATH = path.join(__dirname, 'stats.json');

app.use(express.json());
app.use(express.static(__dirname));

// Получить всю статистику
app.get('/api/stats', (req, res) => {
  try {
    const data = fs.readFileSync(STATS_FILE_PATH);
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).send({ error: "Не удалось прочитать файл" });
  }
});

// Обновить статистику игрока
app.post('/api/update', (req, res) => {
  const { id, name, wins, losses, level } = req.body;

  if (!id || wins === undefined || losses === undefined || level === undefined) {
    return res.status(400).send('Не все обязательные поля переданы');
  }

  let stats = {};
  try {
    const data = fs.readFileSync(STATS_FILE_PATH);
    stats = JSON.parse(data);
  } catch (err) {
    console.error("Ошибка чтения файла:", err);
  }

  stats[id] = { name, wins, losses, level };
  fs.writeFileSync(STATS_FILE_PATH, JSON.stringify(stats, null, 2));

  res.json({ success: true });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
