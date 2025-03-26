const { User, Clan } = require('../models');
const { generateToken } = require('../utils/jwt');
const { generateReferralLink } = require('../utils/referralGenerator');
const { ValidationError, DatabaseError, where } = require('sequelize');
const { handleReferral } = require('./referral.service');

class ClansService {

    // create clan
    static async createClan({telegramId, name}) {
        try {
            const user = await User.findOne({ where: { telegramId } });
            if (user.clanId){
                throw new Error('You are already in a clan');
            }

            if (!name) {
                throw new Error('Name is required');
            }

            // Генерация реферальных данных
            const { code } = await generateReferralLink();
            const clan = await Clan.create({ name, creatorId: user.id, referralCode: code });
            user.clanId = clan.id;
            await user.save();

            const token = generateToken(user);
        
            return { clan, token };
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    // delete clan
    static async deleteClan({telegramId, clanId}){
        try {
            const clan = await Clan.findByPk(clanId);
            if(!clan) {
                throw new Error('Clan not found');
            }
            const user = await User.findOne({ where: { telegramId } });
            if (clan.creatorId !== user.id){
                throw new Error('Only the creator can delete the clan');
            }
            await clan.destroy();
            await User.update({ clanId: null }, { where: { clanId: clan.id } });
            
            const token = generateToken(user);
            
            return { user, token };   
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    // join clan
    static async joinClan({telegramId, clanId}){
        try {
            const user = await User.findOne({ where: { telegramId } });
            if(user.clanId){
                throw new Error('You are already in a clan');
            }
            const clan = await Clan.findByPk(clanId);
            if(!clan) {
                throw new Error('Clan not found');
            }
            user.clanId = clan.id;
            await user.save();
            const token = generateToken(user);
            
            return { user, token };   
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    // join a clan with referralLink
    static async joinClanRef({telegramId, referralCode}){
        try {
            const user = await User.findOne({ where: { telegramId } });
            if(user.clanId){
                throw new Error('You are already in a clan')
            }
            const clan = await Clan.findOne({where: { referralCode }});
            if(!clan){
                throw new Error('Invalid referral code')
            }
            let referrerClan = null
            if(referralCode){
                referrerClan = await User.findOne({
                    where: {referralCode: referralCode},
                    attributes: ['id']
                })
            }
            user.clanId = clan.id;
            await user.save();
            if(referrerClan){
                try {
                    await handleReferral(referrerClan.id, user.id)
                } catch (referralError) {
                    console.error('Referral processing failed:', referralError)
                }
            }

            const token = generateToken(user);
            
            return { user, token };
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    // Leave a clan
    static async leaveClan({telegramId}){
        try {
            const user = await User.findOne({ where: { telegramId } });
            if(!user.clanId){
                throw new Error('You are not in a clan')
            }
            const clan = await Clan.findByPk(user.clanId);
            if(clan.creatorId === user.id){
                throw new Error('Creator cannot leave; delete the clan instead')
            }
            user.clanId = null;
            await user.save();
            const token = generateToken(user);
            
            return { user, token };
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    // Get clan details
    static async getClanDetails({clanId}){
        try {
            const clan = await Clan.findByPk(clanId, {
                include: [
                    {model: User, as: 'creator', attributes: ['id', 'username']},
                    {model: User,  attributes: ['id', 'username', 'balance']}
                ]
            });
            if (!clan) {
                throw new Error('Clan not found')
            }
    
            const members = clan.Users.sort((a, b) => b.coins - a.coins).map(user => ({
                id: user.id,
                username: user.username,
                balance: user.balance,
            }));
            const topUser = members[0] || null;
            const clanInfo = {
                id: clan.id,
                name: clan.name,
                creator: {id: clan.creator.id, username: clan.creator.username},
                members,
                topUser
            }
            return {clanInfo}
        } catch (error) {
            this.handleAuthError(error);
        }
    }

  /**
   * Обработка ошибок аутентификации
   * @param {Error} error - Ошибка
   */
    static handleAuthError(error) {
        console.error('Auth error:', error);
        
        if (error instanceof ValidationError) {
        throw new Error('Invalid user data');
        }
        if (error instanceof DatabaseError) {
        throw new Error('Database operation failed');
        }
        throw error;
    }
}

module.exports = ClansService;