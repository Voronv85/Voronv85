require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = process.env.PORT || 3000;

// Инициализация Supabase клиента
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// Маршрут для получения данных из таблицы
app.get('/data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('your_table_name')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Маршрут для добавления данных
app.post('/data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('your_table_name')
      .insert([req.body]);
    
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Корневой маршрут
app.get('/', (req, res) => {
  res.send('Supabase + Render.com App is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
