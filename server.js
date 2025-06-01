const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.use(express.json());
app.use(express.static('public'));

// API для работы с пользователями
app.get('/api/user/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error) return res.status(500).json({ error });
  res.json(data || {});
});

app.get('/api/user/top', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_stats')  // Важно: имя таблицы должно совпадать
      .select('id, name, wins, losses, last_updated')
      .order('wins', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('Ошибка загрузки статистики:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user', async (req, res) => {
  const { data, error } = await supabase
    .from('user_stats')
    .upsert(req.body, { onConflict: 'id' });
    
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

// Маршруты для страниц
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stats.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
