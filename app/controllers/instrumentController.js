const { Instrument } = require('../models');

const instrumentController = {
    
    // Retrieve all instruments in alphabetical order

    getAllInstruments: async (req, res, next) => {
        try {
            const instruments = await Instrument.findAll({order: ['instrument_name']});
            res.json(instruments);

        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },
    
    // Get an instrument by his id
    
    getOneInstrument: async (req, res, next) => {
        try {
            const targetId = req.params.id;

            const instrument = await Instrument.findByPk(targetId);

            if (instrument) {
                res.json(instrument);
                
            } else {
                next(); // => 404
            }
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }
    },


};

module.exports = instrumentController;