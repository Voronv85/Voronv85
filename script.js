const app = document.getElementById("app");

function generateBrowserId() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const txt = "browser.id";
  ctx.textBaseline = "top";
  ctx.font = "14px Arial";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f00";
  ctx.fillRect(125, 1, 62, 20);
  ctx.fillStyle = "#00f";
  ctx.fillText(txt, 2, 15);
  ctx.fillStyle = "#fff";
  ctx.fillText(txt, 4, 17);

  const dataUrl = canvas.toDataURL();
  let hash = 0;
  for (let i = 0; i < dataUrl.length; i++) {
    const char = dataUrl.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "user_" + Math.abs(hash).toString(16).substring(0, 8);
}

async function getAllStats() {
  try {
    const res = await fetch("/api/stats");
    return await res.json();
  } catch (err) {
    console.error("Ошибка загрузки статистики:", err);
    return {};
  }
}

async function createPlayerIfNotExists(username) {
  const stats = await getAllStats();
  if (!stats[username]) {
    // Новый игрок — добавляем с нулевой статистикой
    await updatePlayerStats(username, { wins: 0, losses: 0, level: 1 });
    console.log(`Новый игрок добавлен: ${username}`);
  }
}

async function updatePlayerStats(username, stats) {
  try {
    await fetch("/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, ...stats }),
    });
  } catch (err) {
    console.error("Ошибка сохранения статистики:", err);
  }
}

function showInputForm(browserId) {
  app.innerHTML = `
    <label for="username">Введите ваше имя:</label>
    <input type="text" id="username" placeholder="Ваше имя (необязательно)" />
    <button onclick="setName('${browserId}')">Продолжить</button>
    <p style="font-size: 0.75rem; text-align: center; margin-top: 0.5rem;">
      Если вы не введете имя, будет использован уникальный ID: <strong>${browserId}</strong>
    </p>
  `;
}

async function showGameMenu(username) {
  const stats = await getPlayerStats(username);

  app.innerHTML = `
    <div class="username-info">
      <p>Здравствуйте, <strong>${username}</strong>!</p>
      <div class="stats">
        Уровень: ${stats.level}<br/>
        Победы: ${stats.wins}<br/>
        Поражения: ${stats.losses}
      </div>
    </div>
    <div class="games-grid">
      <a href="/checkers.html?player=${encodeURIComponent(username)}" class="game-button block text-center">♟️ ШАШКИ</a>
      <a href="/tanks.html?player=${encodeURIComponent(username)}" class="game-button block text-center">🛻 ТАНКИ</a>
    </div>
    <div class="games-grid">
      <button class="game-button" onclick="showStats()">📊 Статистика</button>
      <button class="game-button" onclick="resetName()">🔄 Сменить имя</button>
    </div>
  `;
}

async function showStats() {
  const allStats = await getAllStats();

  let tableRows = "";
  for (const user in allStats) {
    const s = allStats[user];
    tableRows += `
      <tr>
        <td>${user}</td>
        <td>${s.wins}</td>
        <td>${s.losses}</td>
        <td>${s.level}</td>
      </tr>
    `;
  }

  app.innerHTML = `
    <h2 class="text-xl font-bold mb-4 text-center">Статистика игроков</h2>
    <div class="overflow-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th class="border-b p-2">Игрок</th>
            <th class="border-b p-2">Победы</th>
            <th class="border-b p-2">Поражения</th>
            <th class="border-b p-2">Уровень</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || '<tr><td colspan="4" class="text-center py-4">Нет данных</td></tr>'}
        </tbody>
      </table>
    </div>
    <button class="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg" onclick="goBack()">⬅️ Назад</button>
  `;
}

function goBack() {
  const storedName = localStorage.getItem("username");
  if (storedName) {
    showGameMenu(storedName);
  } else {
    const browserId = generateBrowserId();
    showInputForm(browserId);
  }
}

function setName(browserId) {
  const input = document.getElementById("username");
  const value = input.value.trim();
  const username = value || browserId;
  localStorage.setItem("username", username);
  location.reload();
}

async function getPlayerStats(username) {
  const allStats = await getAllStats();
  return allStats[username] || { wins: 0, losses: 0, level: 1 };
}

function resetName() {
  localStorage.removeItem("username");
  location.reload();
}

window.onload = async () => {
  const storedName = localStorage.getItem("username");
  const browserId = generateBrowserId();

  if (storedName) {
    await createPlayerIfNotExists(storedName);
    showGameMenu(storedName);
  } else {
    await createPlayerIfNotExists(browserId);
    showInputForm(browserId);
  }
};
