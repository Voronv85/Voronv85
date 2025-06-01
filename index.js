const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Раздаём статические файлы из public как корень сайта
app.use(express.static(path.join(__dirname, 'public')));

// Роут для главной страницы — на случай, если нужно сделать редирект или обработку
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Инициализация Supabase
const supabaseUrl = 'https://fdbpacbuunjfipsiplzr.supabase.co'; 
const supabaseAnonKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Добавить сообщение
app.post('/add', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const { data, error } = await supabase
        .from('messages')
        .insert([{ text }]);

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
});

// Получить все сообщения
app.get('/messages', async (req, res) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*');

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
