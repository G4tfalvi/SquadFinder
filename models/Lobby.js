const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
    host: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        default: 'Bármilyen'
    },
    language: {
        type: String,
        default: 'Hungarian'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600
    }
});

module.exports = mongoose.model('Lobby', LobbySchema);
