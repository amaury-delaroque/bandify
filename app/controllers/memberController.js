const { Member, Play } = require('../models');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');


const { uploadFile, getFileStream } = require('../../s3');
/* Mise en place de Multer qui nous permets de récupérer un multipart form-data depuis le front
    Il nous met à disposition une fonction pour choisir le storage et une fonction upload 
    que l'on appelera dans notre controller, à l'intérieur on aura accés au req.body et req.file
*/

const memberController = {

    // Get the list of all members
    getAllMembers: async (req, res, next) => {
        try {
            const members = await Member.findAll();

            res.json(members);
            
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Get a member by his id 

    getOneMember: async (req, res, next) => {
        try {
            const targetId = req.params.id;

            const member = await Member.findByPk(targetId);

            // Soit le membre existe : Soit il n'existe pas
            if (member) {
                res.json(member);
            } else {
                next(); // => 404
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Create a member at registration

    createMember: async (req, res) => {
        try {
            const file = req.file;
            let result;
            if(file) result = await uploadFile(file);

            
             // We hash the password => the 3rd argument of the hash function is a cazllback, which gives us access to the error if error or the hashed mdp
            passwordHashed = bcrypt.hash(req.body.user_password, 10, async (err, hash) =>{
                if(err) return err;
                const foundMember = await Member.findOne({
                    where : {
                        email : req.body.email,
                    }
                });
                if (foundMember) {
                    return res.json({
                        error: 'Un utilisateur à déjà utiliser cette adresse email pour s\'inscirire'
                    });
                }
                 // Arrays passed into the req.body via the form must be decoded to be accessed;
                const instruments = JSON.parse(req.body.instruments);
                const styles = JSON.parse(req.body.styles);
                 // We create a member with the info retrieved from the body and the hashed mdp
                const member = await Member.create({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    email: req.body.email,
                    birthdate: req.body.birthdate,
                    user_description: req.body.user_description,
                    user_password: hash,
                    city_code: req.body.city_code,
                    profil_image: file ? `${result.key}`: null,
                    })
            
                 // If the member has selected styles, we loop over them to associate each style with the member
                if(styles) {
                    styles.map(async (style)=> await member.addStyle(Number(style))) 
                }

              

                 //  Loop on every objects instruments to create the association
                instruments.map(async (play) => play.instrument && await Play.create({
                  instrument_id: play.instrument,
                  member_id: member.id,
                  level_id: play.level
                }));
                const newMember = await Member.findByPk(member.id);
                // If everything's ok sending this to the front
                res.json({
                    success : 'New Member added', member: newMember
                });
            })
        }catch(error) {
            console.trace(error);
            res.status(500).json({
                error: `Une erreur est survenue ${error.message}`
            });
        }
    },

    // Update informations user

    updateOneMember: async (req, res, next) => {
        try {
            //Id of the target in url

            const targetId = req.params.id;
            // go through an instance
            const memberToUpdate = await Member.findByPk(targetId);
            if (!memberToUpdate) {

                return next(); // <= no list, 404
            }
            if(req.body.user_password) {
                // When update
                // hashing the password again
             const passwordHashed = await bcrypt.hash(req.body.user_password, 10);
             req.body.user_password = passwordHashed;
            }
            if(req.body.styles) {
               return req.body.styles.map(async (style)=> await memberToUpdate.addStyle(Number(style))) 
            }
            // Loop on every objects to create the association
            if(req.body.instrument) {
                req.body.instruments.map(async (play) => play.instrument && await Play.findOrCreate({
                    instrument_id: play.instrument,
                    member_id: memberToUpdate.id,
                    level_id: play.level
                  }));
                return res.json(memberToUpdate);
            }

            const file = req.file;
            let result;
            if(file) {
                result = await uploadFile(file);
                req.body.profil_image = result.key;
            } 
            // New props in the body
                await memberToUpdate.update(req.body);

                const member = await Member.findByPk(targetId)

                return res.json(member);
            
        } catch (error) {
            console.trace(error);
            res.status(500).json({error: `Une erreur est survenue ${error.message}`}); 
        }
    },

    // delete a member

    deleteOneMember: async (req, res, next) => {
        try {
            const targetId = req.params.id;

            const nbDeletedMember = await Member.destroy({
                where: {
                    id: targetId
                }
            });

            // If at least one member deleted
            if (nbDeletedMember > 0) {
                res.json({message: "ok, membre supprimé"});
            } else {
                next(); //  404
            }

        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },

    // Login member

    loginMember : async (req, res) => {
        try {
            
          // checking that a member matches with email
          const member = await Member.findOne({
              where: {
                  email: req.body.email
              },
              attributes: {
                include: ['user_password'],
              }
          });

          // if dont find 
          if(!member) {
            throw({error : 'Identifiants incorrects'});
          }
      
          // compare passwords with bcrypt
          const passwordToCompare=member.user_password;
          const isPasswordValid = await bcrypt.compare(req.body.user_password, passwordToCompare);
  
          
          if(!isPasswordValid) {
            throw({error : 'Identifiants incorrects'});
          }
  
          // JWT Config
          const jwtSecret = process.env.TOKEN_SECRET;
          const jwtContent = { memberId: member.id };
          const jwtOptions = { 
          algorithm: 'HS256', 
          expiresIn: '3h' 
        };
          // Response to the front if everything's ok
          
          res.json({
          id: member.id,
          email: member.email,
          token: jsonwebtoken.sign(jwtContent, jwtSecret, jwtOptions),
          });
  
        } catch(err) {
          // sending error if not
          console.trace(err);
            res.status(401).send(err);
        }
    },
    // Middleware which allows access to the static avatar file of the members
    streamMemberAvatar: (req, res) => {
        try{
            const key = req.params.key;
            const readStream = getFileStream(key);
            return readStream.pipe(res);

        }catch(err) {
            console.trace(err);
            res.status(401).send(err);
        }

    },
    // "Middleware" checking if its a good token
    verifyJWT: (req, res, next) => {
        const token = req.headers["x-acces-token"] || req.body.headers["x-acces-token"];
        
        const url =  req.route.path;
        if(!token) {
            res.status(401).send("Token needed");
        } else {
            jsonwebtoken.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
                if (err) {
                    res.json({
                        auth: false,
                        message: "Failed to authenticate"
                    });
                } else {
                    req.userId = decoded.id;
                    if (url === '/checkToken') {
                        return res.json({
                            auth: true,
                            message: "Authentification Success"
                        });
                    }
                    next();
                }
            });
        }
    }
        
    
};

module.exports = memberController;