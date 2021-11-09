const { Member, Play, Instrument, Level } = require('../models');
const memberController = require('./memberController');

const searchController = {
     getFilteredMembers: async (req, res, next) => {
        const filteredQuery = req.query;
        // Destructuring of the search
        const { instrument, level, musicstyle, city, department, region, searchValue } = filteredQuery;
        //we get all the mebres to be able to filter according to the queries
        try {
            const members = await Member.findAll();
            // copy the members into a variable to retrieve the filtered users after the search
            let membersToFilter = [...members];

            // If my search contains a searchValue field (search bar), I filter the members by their name/first name/both
            if (searchValue) membersToFilter = membersToFilter.filter((member) => {
                const memberFullName = member.firstname + ' ' + member.lastname;
                const reverseFullName = member.lastname + ' ' + member.firstname;

                if (member.firstname || member.lastname || memberFullName) {
                    return member.firstname.toLowerCase() === searchValue.toLowerCase() 
                    || member.lastname.toLowerCase() === searchValue.toLowerCase()
                    || memberFullName.toLowerCase() === searchValue.toLowerCase()
                    || reverseFullName.toLowerCase() === searchValue.toLowerCase();
                } 
            })
            
            //If my search contains a musicstyle field, I filter the members that have a corresponding style
            if (musicstyle) membersToFilter = membersToFilter.filter((member) => {
                // If member has an association with a style or many styles
                if(member.styles[0]){
                    // ... find if style = search
                    const foundSearched = member.styles.find((style) => {
                        return style.music_name === musicstyle;
                    })
                    // return result search by styles
                    return foundSearched;
                }
                
            }) 
             // If my search contains an instrument field, I filter the members that have a matching instrument
            if (instrument) membersToFilter = membersToFilter.filter((member) => {
                // If member has a association with instrument
                if (member.plays[0]) {
                    // ...find if instrument match the search
                    const foundSearched = member.plays.find((play) => {
                       return play.instrument.instrument_name === instrument;
                    });
                    // on retourne le résultat de la recherche par style
                    return foundSearched;
                }
            })
           // If my search contains an instrument field AND a level field, I filter the members who have a corresponding instrument
            // The user is not allowed to search just by level... an instrument is absolutely necessary because they are associated
            if (instrument && level) membersToFilter = membersToFilter.filter((member) => {
                // If a member has an association with instrument
                if (member.plays[0]) {
                    const foundSearched = member.plays.find((play) => {
                        // If the member has an association with an instrument and level
                        if(play.level){
                            return play.instrument.instrument_name === instrument && play.level.level_name === level;
                        }
                    });
                    // return the result
                    return foundSearched;
                }
            });
            // Filtrer by city
            if (city) membersToFilter = membersToFilter.filter((member) => {
                return member.city.city_name === city;
            })
            // FIltrer the search by Department if we have no city
            if (department && !city) membersToFilter = membersToFilter.filter((member) => {
                return member.city.department.department_name === department;
            }) 
            // We filter the search by Region if we have no city AND if we have no department
            //To avoid the user sending an incoherent request between region and department and city
            if (region && !city && !department) membersToFilter = membersToFilter.filter((member) => {
                return member.city.department.region.region_name === region;
            }) 
            // We send the result of the user's search contained in the membersToFilter variable
            res.json(membersToFilter);
        } catch (error) {
            console.trace(error);
            res.status(500).json(error);
        }

       
    }, 
};

module.exports = searchController;