const form = document.getElementById('messageForm');
const textInput = document.getElementById('text');
const messagesList = document.getElementById('messagesList');

// Загрузить текущие сообщения
async function loadMessages() {
    const res = await fetch('/messages');
    const messages = await res.json();

    messagesList.innerHTML = '';
    messages.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = msg.text;
        messagesList.appendChild(li);
    });
}

// Отправка нового сообщения
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    if (!text) return;

    await fetch('/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    textInput.value = '';
    loadMessages();
});

// Загружаем сообщения при старте
loadMessages();
