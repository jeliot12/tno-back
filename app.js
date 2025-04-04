require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Sequelize } = require('sequelize');
const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '8177542388:AAEjYHcJ_iSfv7MmlDEuDoi_kBNtT5OfSA8';
const CHANNEL_ID = '@tno_community';
const bot = new TelegramBot(TOKEN, { polling: false });

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

// Импорт роутов
const authRoutes = require('./routes/auth');
const referralRoutes = require('./routes/referral');
const balanceRoutes = require('./routes/balance')
const statsRoutes = require('./routes/stats');
const clansRoutes = require('./routes/clans');
const avatarRoutes = require('./routes/avatar');

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
app.use(express.json()); // Парсинг JSON
app.use(morgan('combined')); // Логирование запросов

// Подключение роутов
app.use('/api/auth', authRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/user', balanceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/clans', clansRoutes);
app.use('/api/test', avatarRoutes);
// API Endpoint
app.post('/check-subscription', async (req, res) => {
  try {
    const userId = req.body.userId;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const isSubscribed = await checkSubscription(userId);
    res.json({ isSubscribed });
    
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


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

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});