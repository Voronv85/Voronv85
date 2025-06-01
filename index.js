const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// === Конфиг Supabase ===
const SUPABASE_URL = 'https://fdbpacbuunjfipsiplzr.supabase.co'; 
const SUPABASE_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkYnBhY2J1dW5qZmlwc2lwbHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjA3MTAsImV4cCI6MjA2NDMzNjcxMH0.tSa-URjkTfInYezog_o76-tDcRshSuvC0axS-NKmYmw';
const TABLE_NAME = 'voronv85';

// === Функция для получения данных из файла ===
function readLocalData() {
    const filePath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(filePath)) {
        throw new Error('Файл data.json не найден');
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// === Функция для отправки данных в Supabase ===
async function uploadToSupabase(data) {
    const response = await fetch(`${SUPABASE_URL}/${TABLE_NAME}`, {
        method: 'POST',
        headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
            Content-Type: 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка загрузки в Supabase: ${response.statusText} — ${errorText}`);
    }

    return await response.json();
}

// === Маршрут для загрузки из Supabase и сохранения в JSON ===
app.get('/download', async (req, res) => {
    try {
        const data = await fetchDataFromSupabase();

        const filePath = path.join(__dirname, 'data.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        res.send(`Данные успешно загружены из Supabase. Количество записей: ${data.length}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка загрузки данных из Supabase');
    }
});

// === Маршрут для отправки данных из JSON в Supabase ===
app.get('/upload', async (req, res) => {
    try {
        const localData = readLocalData();
        const result = await uploadToSupabase(localData);
        res.json({
            message: 'Данные успешно отправлены в Supabase.',
            inserted: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).send(`Ошибка отправки данных в Supabase: ${error.message}`);
    }
});

// === Маршрут для чтения JSON файла ===
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(filePath)) {
        return res.send('Файл data.json ещё не создан.');
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
});

// === Функция для получения данных из Supabase (для /download) ===
async function fetchDataFromSupabase() {
    const response = await fetch(`${SUPABASE_URL}/${TABLE_NAME}`, {
        method: 'GET',
        headers: {
            apikey: SUPABASE_API_KEY,
            Authorization: `Bearer ${SUPABASE_API_KEY}`,
            Prefer: 'return=representation'
        }
    });

    if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.statusText}`);
    }

    return await response.json();
}

// === Запуск сервера ===
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
