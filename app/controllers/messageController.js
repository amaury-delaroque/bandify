const { Message } = require('../models');
const { Op } = require("sequelize");

const messageController = {
    
    // Get all messages

    getAllMessages: async (req, res, next) => {

        const targetId = req.params.id;
        try {
            const messages = await Message.findAll({ where: { [Op.or]: [{ reicever_id: targetId }, { sender_id: targetId }] }, include: ['Receiver', 'Sender'], order: [['createdAt', 'ASC']] });
            res.json(messages);

        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },
    
    // Sending messages between 2 members

    sendMessage: async (req, res, next) => {
        try {
            const newMessage = await Message.create({
               content: req.body.content,
               status : req.body.status,
               sender_id : req.body.sender_id,
               reicever_id : req.body.reicever_id
            });
            const message = await Message.findByPk(newMessage.id, {include: ['Receiver', 'Sender'], order: [['createdAt', 'ASC']] })
              res.json(message);

        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Read a message sent from one member to another by id

    readMessage: async (req, res, next) => {
        try {
            const messageTarget = req.params.id;

            const messageInc = await Message.findByPk(messageTarget);

            if(messageInc) {
                res.json(messageInc);

            } else {
                next();
            }

        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },


    // Change the status from false to true when a message is read
    
    updateMessageStatus : async (req, res, next) => {
        try {
            
            const targetId = req.params.id;
            
            const updateStatus = await Message.findByPk(targetId);
            
            await updateStatus.update({status : true});
            
            res.json(updateStatus);
            
        } catch (error) {
            console.trace(error);
            res.status(500).json(error); 
        }
    }
};

module.exports = messageController;