require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const { Sequelize } = require('sequelize');
const TelegramBot = require('node-telegram-bot-api');
const WebSocket = require('ws');
const { User } = require('./models');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const FormData = require('form-data');
const axios = require('axios');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHANNEL_ID = '@tno_community';
const bot = new TelegramBot(TOKEN, { polling: false });
const WS_PORT = 8176;
const CHAT_ID = '-4690338550'

// Проверка подписки
async function checkSubscription(userId) {
  try {
    const member = await bot.getChatMember(CHANNEL_ID, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch (error) {
    console.error('Telegram API Error:', error.message);
    return false;
  }
}

async function bonusUser(telegramId, username, amount) {

  try {
    const updatedCount = await User.increment('balance', {
      by: Number(amount), // Указываем, на сколько увеличить
      where: { telegramId, username },
      returning: true, // Возвращает обновлённую запись (PostgreSQL)
    });

    if (updatedCount === 0) {
      console.error("User not found");
    }

    console.log("success: true")
  } catch (error) {
    console.error(error);
    console.log("server errpr")
  }  
}

// Импорт роутов
const authRoutes = require('./routes/auth');
const referralRoutes = require('./routes/referral');
const balanceRoutes = require('./routes/balance')
const statsRoutes = require('./routes/stats');
const clansRoutes = require('./routes/clans');
const avatarRoutes = require('./routes/avatar');
const energyRoutes = require('./routes/energy');
const checkuserRoutes = require('./routes/check-user')
const coinRouter = require("./routes/coins");
const earnRouter = require("./routes/earn");

// Инициализация Express
const app = express();


// Подключение middleware
// app.use(helmet()); // Безопасность HTTP-заголовков
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Настройте под свой фронтенд
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(bodyParser.json()); // Парсинг JSON
app.use(morgan('combined')); // Логирование запросов

// Подключение роутов
app.use('/api/auth', authRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/user', balanceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/clans', clansRoutes);
app.use('/api/test', avatarRoutes);
app.use('/api/user', checkuserRoutes);
app.use('/api', coinRouter);
app.use('/api/energy', energyRoutes);
app.use('/api/check', earnRouter);

app.post('/api/check-subscription', async (req, res) => {
  try {
    const {userId, username} = req.body;
    const telegramId = userId.toString()
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const isSubscribed = await checkSubscription(userId);
    if (isSubscribed){
      console.log("work");
      const [affectedRows] = await User.update(
        { isSubscribed: isSubscribed },
        {
          where: { telegramId },
          returning: true, // Для PostgreSQL возвращает обновленную запись
        }
      );
      if (affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      await bonusUser(telegramId, username, 3000)
    }
    res.json({ isSubscribed});
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/createSquad-to-telegram', upload.single('photo'), async (req, res) => {
  try {
    const { title, description, telegramId } = req.body;
    const photo = req.file;

    let message = `Заявка на создание сквада:\n\nЗаголовок: ${title}\nОписание: ${description}\nВладелец: ${telegramId}`;

    if (photo) {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('caption', message);
      formData.append('photo', photo.buffer, { filename: photo.originalname, contentType: photo.mimetype });

      const headers = {
        ...formData.getHeaders(),
        'Content-Length': formData.getLengthSync()
      };

      await axios.post(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, formData, {
        headers: headers
      });
    } else {
      await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: CHAT_ID,
        text: message
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});


const clients = new Map();
app.set('clients', clients); // Делаем clients доступным для маршрутов


// Инициализация Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false // Отключить логи SQL в продакшене
  }
);

// Проверка подключения к БД
sequelize.authenticate()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Unable to connect to the database:', err));

// Синхронизация моделей с БД
sequelize.sync({ alter: true }) // Используйте { force: true } только для разработки!
  .then(() => console.log('Database synchronized'))
  .catch(err => console.error('Database sync error:', err));

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found'
  });
});

// Централизованный обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

const wss = new WebSocket.Server({ port: WS_PORT }, () => {
  console.log(`WebSocket server running on ws://localhost:${WS_PORT}`);
});

const { getCachedUser, setCachedUser, calculateEnergy } = require('./utils/cache');
wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  let telegramId;

  ws.on('message', async (message) => {
    try {
      telegramId = JSON.parse(message).telegramId;
      clients.set(telegramId, ws);

      let userData = getCachedUser(telegramId);
      if (!userData) {
        const user = await User.findOne({ where: { telegramId } });
        if (!user) {
          console.log(`User ${telegramId} not found in DB`);
          return;
        }
        console.log('WebSocket: Fetching from DB for user:', telegramId);
        userData = calculateEnergy(user);
        user.energy = userData.energy;
        user.lastUpdate = userData.lastUpdate;
        await user.save();
        setCachedUser(telegramId, userData);
      } else {
        console.log('WebSocket: Using cached data for user:', telegramId);
        userData = calculateEnergy(userData);
        setCachedUser(telegramId, userData);
        await User.update(
          { energy: userData.energy, lastUpdate: userData.lastUpdate },
          { where: {telegramId} }
        );
      }

      if (userData) {
        ws.send(JSON.stringify({ energy: userData.energy, maxEnergy: userData.maxEnergy }));
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  const interval = setInterval(async () => {
    if (telegramId) {
      let userData = getCachedUser(telegramId);
      if (!userData) {
        const user = await User.findOne({ where: { telegramId } });
        if (user) userData = calculateEnergy(user);
      } else {
        userData = calculateEnergy(userData);
      }

      if (userData && userData.energy < userData.maxEnergy) {
        setCachedUser(telegramId, userData);
        await User.update(
          { energy: userData.energy, lastUpdate: userData.lastUpdate },
          { where: { telegramId } }
        );
        ws.send(JSON.stringify({ energy: userData.energy, maxEnergy: userData.maxEnergy }));
      }
    }
  }, 5000); // Каждые 5 секунд

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clearInterval(interval);
    if (telegramId) clients.delete(telegramId);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});


// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});