const { Member, Instrument, Level, Play, MusicStyle } = require('../models');

const associationController = {
  // CONTROLLERS OF ASSOCIATIONS MEMBER/INSTRUMENTS/LEVELS through table PLAY
  getMemberInstruments: async (req, res, next) => {
    try {
      const memberId = req.params.id;
      const member = await Play.findAll({
        where : {
          member_id : memberId,
        },
        include: ['instrument', 'level'],
      })
      return res.json(member);
    } catch(error) {
      console.trace(error);
      res.status(500).json(error);
    }
  },
  createAssociation: async (req, res, next) => {
    try{
      const memberId = req.params.id;
      const {instrument_id, level_id} = req.body;
      const newAssociation = await Play.create({
        member_id: memberId,
        instrument_id: instrument_id,
        level_id: level_id,
      });
      const newPlay = await Play.findByPk(newAssociation.id, {include: ['instrument', 'level']});
      res.json(newPlay);
    }catch(error){
      console.trace(error);
      res.status(500).json(error);
    }
  },
  updateMemberInstruments: async (req, res, next) => {
        try {
          //Getting params of the PATCH request, member id here 
          const memberId = Number(req.params.id);
          //Get the params of the body, an instrument_id and/or a level 
          const instrumentId = Number(req.body.instrument_id);
          const levelId = Number(req.body.level_id) || null;
          //Checking that member and instruments are numbers and that they exist in database, otherwise im leaving
          if(memberId === NaN || instrumentId === NaN) return next();
          const member = await Member.findByPk(memberId);
          const instrument = await Instrument.findByPk(instrumentId);
          // If at least 1 of the 2 does not exist we return
          if(!member || !instrument) return next();
          // checking if an association already exists bteween members and instrument
          const alreadyExist = await Play.findOne({where : {
            member_id : memberId,
            instrument_id: instrumentId,
          }});
          // If an association is found and the user has not sent a level_id, we return because the association already exists
          if(alreadyExist && !levelId){
            return next();
          } else if (!alreadyExist && !levelId) {
            await Play.findOrCreate({
              where : {
                member_id : memberId,
                instrument_id: instrumentId,
              }
            });
            const member = await Play.findAll({
              where : {
                member_id : memberId,
              },
              include: ['instrument', 'level'],
            })
            return res.json(member);
          }
          // If we find an association we delete it because here the member may just want to update his level, so we associate the 3 (user, instrument, level)
          if (levelId && levelId !== NaN) {
            if(alreadyExist) alreadyExist.destroy();
            const level = await Level.findByPk(levelId);
            if (!level) return next();
            await Play.findOrCreate({
              where : {
                member_id : memberId,
                instrument_id: instrumentId,
                level_id: levelId
              }
            });
            // send back all the associations instrument/level referred to member
            const member = await Play.findAll({
              where : {
                member_id : memberId,
              },
              include: ['instrument', 'level'],
            })
            return res.json(member);
          };
          // If the level_id has not been filled in by the user, the member and the instrument are associated, if the association does not already exist
          if(!levelId) {
            await Play.findOrCreate({
              where : {
                member_id : Number(member_id),
                instrument_id: Number(instrument_id)
              }
            });
            // all corresponding instrument/level associations are referred to the member
            const member = await Play.findAll({
              where : {
                member_id : memberId,
              },
              include: ['instrument', 'level'],
            })
            return res.json(member);
          }

        } catch (error) {   
            console.trace(error);
            res.status(500).json(error);
        }
  },
  deleteMemberInstruments: async (req, res, next) => {
    try {
      //I get the parameters of the DELETE request, here the member id
      const memberId = Number(req.params.id);
      //I get the parameters of the body, an instrument_id
      const instrumentId = Number(req.body.instrument_id);
      
      if(memberId === NaN || instrumentId === NaN) return next();
      const member = await Member.findByPk(memberId);
      const instrument = await Instrument.findByPk(instrumentId);
      // If at least 1 of the 2 does not exist we return
      if(!member || !instrument) return next();
      //whether an association already exists between the member and the instrument
      const alreadyExist = await Play.findOne({where : {
        member_id : memberId,
        instrument_id: instrumentId,
      }});
      if(alreadyExist) {
        alreadyExist.destroy();
        return res.json({message : 'Delete Association Member Instruments Successfull'})
      };
      // If there's nothing to delete => 404
      next();
    } catch(error) {
      console.trace(error);
      res.status(500).json(error);
    }
  },

  // CONTROLLERS ASSOCIATIONS MEMBER/MusicStyles
  getMemberMusicStyles: async (req, res, next) => {
    try {
      const memberId = Number(req.params.id);
      const member = await Member.findByPk(memberId, {include: 'styles'});
      return res.json(member);
    } catch(error) {
      console.trace(error);
      res.status(500).json(error);
    }
  },
  updateMemberMusicStyles: async (req, res, next) => {
      try {
        //I get the parameters of the PATCH request, here the member id in params and musicStyle_id in body
        const memberId = Number(req.params.id);
        const musicStyleId = Number(req.body.musicstyle_id);
        // If a parameter has been filled in incorrectly (other than number) or is missing, we next
        if((!musicStyleId || musicStyleId === NaN) || (!memberId || memberId === NaN)) return next();
        //searching if the member does exist
        const member = await Member.findByPk(memberId, {
          include: 'styles'
        });
        const musicStyle = await MusicStyle.findByPk(musicStyleId);
        // If at least one of the two does not exist => next 
        if (!member || !musicStyle) {
            return next();
        }
        // Otherwise we make the association => Sequelize provides us with an addStyle method
        await member.addStyle(musicStyle);
        // send back the member updated with his association on the styles
        const memberUpdate = await Member.findByPk(memberId, {include: 'styles'});
        return res.json(memberUpdate);


      } catch (error) {   
          console.trace(error);
          res.status(500).json(error);
      }
  },
  deleteMemberMusicStyles: async (req, res, next) => {
    try {
      // Same thing
      const memberId = Number(req.params.id);
      const musicStyleId = Number(req.body.musicstyle_id);
      
      if((!musicStyleId || musicStyleId === NaN) || (!memberId || memberId === NaN)) return next();
      // checking if the member does exists
      const member = await Member.findByPk(memberId, {
        include: 'styles'
      });
      const musicStyle = await MusicStyle.findByPk(musicStyleId);
      
      if (!member || !musicStyle) {
          return next();
      }
      const filteredStyles = member.styles.find((style) => style.id === musicStyleId);
      if(filteredStyles){
        await member.removeStyle(musicStyleId);
        const memberUpdated = await Member.findByPk(memberId, {
          include: 'styles'
        });
        return res.json(memberUpdated);
      }
      next();
    } catch(error) {
      console.trace(error);
      res.status(500).json(error);
    }
  },
  addMemberMusicStyle: async (req, res, next) => {
    try{
      const memberId = req.params.id;
      const musicstyleId = req.body.musicstyle_id;
      const member = await Member.findByPk(memberId);
      await member.addStyle(Number(musicstyleId));
      return res.json({message: 'Successfull add style'});
    } catch(error) {
      console.trace(error);
      res.status(500).json(error);
    }

  },
};


module.exports = associationController; 