const Member = require('./member');
const Department = require('./department');
const Region = require('./region');
const City = require('./city');
const MusicStyle = require('./musicStyle');
const Instrument = require('./instrument');
const Level = require('./level');
const Message = require('./message');
const Invitation = require('./invitation');
const Play = require('./play');

// 1,N entre member et message
Member.hasMany(Message, {
    foreignKey: 'sender_id',
    as: 'OutgoingMessage'
});

Member.hasMany(Message, {
    foreignKey: 'receiver_id',
    as: 'IncomingMessage'
});

// 1,1 entre message et member
Message.belongsTo(Member, {
    foreignKey: 'sender_id',
    as: 'Sender'
});

Message.belongsTo(Member, {
    foreignKey: 'receiver_id',
    as: 'Receiver'
});

// 1,N entre member et invitation
Member.hasMany(Invitation, {
    foreignKey: 'sender_id',
    as: 'OutgoingInvitation'
});

Member.hasMany(Invitation, {
    foreignKey: 'receiver_id',
    as: 'IncomingInvitation'
});

// 1,1 entre invitation et member
Invitation.belongsTo(Member, {
    foreignKey: 'sender_id',
    as: 'InvitationSender'
});

Invitation.belongsTo(Member, {
    foreignKey: 'receiver_id',
    as: 'InvitationReceiver'
});

// 1,N entre member et city

City.hasMany(Member, {
    foreignKey: 'city_id',
    as: 'members'
})

// 1,1 entre member et city
Member.belongsTo(City, {
    foreignKey: 'city_id',
    as: 'member_city'
});

// 1,1 entre city et département

City.belongsTo(Department, {
    foreignKey: 'department_code',
    as: 'department'
})

// 1,N entre département et city
Department.hasMany(City, {
    foreignKey: 'department_code',
    as: 'department_city'
});

// 1,1 entre département et région

Department.belongsTo(Region, {
    foreignKey: 'region_code',
    as: 'region'
})

// 1,N entre région et département
Region.hasMany(Department, {
    foreignKey: 'region_code',
    as: 'region_department'
});

// N,N

Member.hasMany(Play, {
    foreignKey: 'member_id',
    otherKey: 'play_id',
    as : 'plays'
});
Play.belongsTo(Member, {
    targetKey: 'id',
    foreignKey: 'member_id',
    as: 'member',
    onDelete: 'CASCADE'
});

Instrument.hasMany(Play, {
    foreignKey: 'instrument_id',
    otherKey: 'play_id',
    as : 'plays'
});
Play.belongsTo(Instrument, {
    targetKey: 'id',
    foreignKey: 'instrument_id',
    as: 'instrument',
    onDelete: 'CASCADE'
});
Level.hasMany(Play, {
    foreignKey: 'level_id',
    otherKey: 'play_id',
    as : 'plays'
});
Play.belongsTo(Level, {
    targetKey: 'id',
    foreignKey: 'level_id',
    as: 'level',
    onDelete: 'CASCADE'
});

//N,N
MusicStyle.belongsToMany(Member, {
    through : 'appreciate_music_style',
    otherKey: 'member_id',
    foreignKey: 'music_style_id',
    as: 'music_style_member',
});

//N,N
Member.belongsToMany(MusicStyle, {
    through : 'appreciate_music_style',
    otherKey: 'music_style_id',
    foreignKey: 'member_id',
    as: 'member_music_style',
});

module.exports = { 
    Member,
    Department, 
    Region, 
    City, 
    MusicStyle, 
    Instrument, 
    Level, 
    Message, 
    Invitation,
    Play
};
