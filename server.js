const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// API Routes
app.get('/api/data', async (req, res) => {
  const { data, error } = await supabase
    .from('app_data')
    .select('*');
  
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post('/api/data', async (req, res) => {
  const { data, error } = await supabase
    .from('app_data')
    .insert([req.body]);
  
  if (error) return res.status(500).json({ error });
  res.status(201).json(data);
});

app.put('/api/data/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('app_data')
    .update(req.body)
    .eq('id', req.params.id);
  
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.delete('/api/data/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('app_data')
    .delete()
    .eq('id', req.params.id);
  
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
