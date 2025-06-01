require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Инициализация Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API для работы с пользовательской статистикой
app.get('/api/user/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle(); // Возвращает null если нет данных

    if (error) throw error;
    res.json(data || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user', async (req, res) => {
  try {
    const userData = {
      ...req.body,
      last_updated: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_stats')
      .upsert(userData, { onConflict: 'id' });

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API для глобальной статистики
app.get('/api/user/top', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .order('wins', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Маршруты для страниц
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

app.get('/global-stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'global-stats.html'));
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
