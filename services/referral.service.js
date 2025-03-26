const { Referral, User } = require('../models');
const config = require('../config/referral');

exports.handleReferral = async (referrerId, refereeId) => {
    // Приводим к числам
  referrerId = Number(referrerId);
  refereeId = Number(refereeId);

    // Проверка типов
  if (isNaN(referrerId)) throw new Error('Referrer ID must be a number');
  if (isNaN(refereeId)) throw new Error('Referee ID must be a number');
  let currentReferrer = await User.findByPk(referrerId);
  
  for (const levelConfig of config.levels) {
    // const referrals = await Referral.count({
    //   where: { referrerId: currentReferrer.id, level: levelConfig.level },
    // });

    if (referrals < levelConfig.limit) {
      await Referral.create({
        referrerId: currentReferrer.id,
        refereeId,
        level: levelConfig.level,
        bonus: levelConfig.bonus,
      });
    }
    await currentReferrer.increment('balance', { by: levelConfig.bonus });

    // Переходим к рефереру предыдущего уровня
    const nextReferrer = await User.findOne({
      where: { id: currentReferrer.referrerId },
    });
    if (!nextReferrer) break;
    currentReferrer = nextReferrer;
  }
};
