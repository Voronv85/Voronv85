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
    // Убираем .single() и работаем с массивом
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .order('wins', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        error: 'Database error',
        details: error.message 
      });
    }

    if (!data || data.length === 0) {
      return res.json([]); // Возвращаем пустой массив вместо ошибки
    }

    res.json(data);
    
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
});

    if (!data || data.length === 0) {
      return res.status(404).json({ 
        message: 'No data found' 
      });
    }

    res.json(data);
    
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
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
