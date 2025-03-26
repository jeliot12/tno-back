const { v4: uuidv4 } = require('uuid');
const Cryptojs = require('crypto-js');
const { User } = require('../models');

const REFERRAL_LINK_BASE = process.env.REFERRAL_LINK_BASE || 'https://t.me/tnocoin_bot/app?startapp=';
const SECRET_KEY = process.env.REFERRAL_SECRET || 'your_secret_key';

// Генерация уникального кода
const generateReferralCode = async () => {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    // Вариант 1: Используем UUID
    code = `REF_${uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()}`;

    // Проверка уникальности
    const existingUser = await User.findOne({ where: { referralCode: code } });
    if (!existingUser) {
      isUnique = true;
    }
    attempts++;
    
    // // Вариант 2: Детерминированная генерация на основе времени
    // const timestamp = Date.now().toString(36);
    // const randomPart = Math.random().toString(36).substr(2, 4);
    // code = (timestamp + randomPart).substr(-8);
    
    // // Шифрование кода
    // const encrypted = Cryptojs.AES.encrypt(code, SECRET_KEY).toString();
    // code = Buffer.from(encrypted).toString('base64').substr(0, 8);
    
    // // Проверка уникальности
    // const existing = await User.findOne({ where: { referralCode: code } });
    // if (!existing) isUnique = true;
    // attempts++;
  }

  if (!isUnique) throw new Error('Failed to generate unique referral code');
  return code;
};

// Формирование полной ссылки
module.exports.generateReferralLink = async () => {
  const code = await generateReferralCode();
  return {
    code,
    link: `${REFERRAL_LINK_BASE}${encodeURIComponent(code)}`
  };
};

// Валидация реферального кода
module.exports.validateReferralCode = (code) => {
  try {
    const decoded = Buffer.from(code, 'base64').toString();
    const bytes = Cryptojs.AES.decrypt(decoded, SECRET_KEY);
    return bytes.toString(Cryptojs.enc.Utf8);
  } catch (error) {
    return null;
  }
};