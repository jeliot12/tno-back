const cache = new Map();

function getCachedUser(telegramId) {
  return cache.get(telegramId);
}

function setCachedUser(telegramId, data, ttl = 300000) {
  cache.set(telegramId, data);
  setTimeout(() => cache.delete(telegramId), ttl);
}

function calculateEnergy(user) {
  const now = new Date();
  const timeDiff = Math.floor((now - user.lastUpdate) / 1000); // разница в секундах
  const regenRate = 1 / 3; // 1 энергия за 20 секунд
  const regeneratedEnergy = Math.floor(timeDiff * regenRate);
  const newEnergy = Math.min(user.energy + regeneratedEnergy, user.maxEnergy);

  console.log(`Calculating energy for user ${user.telegramId || 'cached'}:`);
  console.log(`- Time since last update: ${timeDiff} seconds`);
  console.log(`- Regenerated energy: ${regeneratedEnergy}`);
  console.log(`- Old energy: ${user.energy}, New energy: ${newEnergy}`);

  // Обновляем lastUpdate только если энергия изменилась
  return {
    energy: newEnergy,
    lastUpdate: newEnergy === user.energy ? user.lastUpdate : now, // Сохраняем старое время, если энергия не изменилась
    maxEnergy: user.maxEnergy,
  };
}

module.exports = { getCachedUser, setCachedUser, calculateEnergy };