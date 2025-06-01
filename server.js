const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const STATS_FILE = path.join(__dirname, 'stats.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Загружаем данные из файла
function readStats() {
    const data = fs.readFileSync(STATS_FILE);
    return JSON.parse(data);
}

// Сохраняем данные в файл
function writeStats(data) {
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
}

// Получение/обновление данных пользователя
app.post('/update-user', (req, res) => {
    const { userId, name, wins = 0, losses = 0, level = 1 } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId обязателен' });
    }

    let stats = readStats();

    // Если пользователь существует — обновляем
    const userIndex = stats.findIndex(u => u.id === userId);
    if (userIndex > -1) {
        stats[userIndex].name = name || stats[userIndex].name;
        stats[userIndex].wins = wins;
        stats[userIndex].losses = losses;
        stats[userIndex].level = level;
    } else {
        // Иначе добавляем нового
        stats.push({
            id: userId,
            name: name || userId,
            wins,
            losses,
            level
        });
    }

    writeStats(stats);

    res.json(stats.find(u => u.id === userId));
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
