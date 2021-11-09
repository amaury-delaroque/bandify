const {Member} = require('../models');
const bcrypt = require('bcrypt');

const authController = {

checkPassword : async (req, res) => {
try {
    const targetId = Number(req.params.id);
    const member = await Member.findByPk(targetId,{
      attributes: {
        include: ['user_password'],
      }
    });
    const memberPassword = member.user_password;
    const isPasswordValid = await bcrypt.compare(req.body.user_password, memberPassword);

    // If the password is not valid, we go into the catch
    if(!isPasswordValid) {
        res.json({error : 'Mot de passe incorrect!'});
    }else {
          
    res.json({message: "Success"});
    }

} catch(error) {
        res.status(500).json(error)
    }
},
}

module.exports = authController;