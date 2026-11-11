const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');


const app = express();
const PORT = 3000;
const Lobby = require('./models/Lobby');

app.use(cors());
app.use(express.json());

// IDE AUTOMATIKUSAN BEKERÜL A TE SAJÁT, MÁR MŰKÖDŐ LINKED:
const MONGO_URI = '';

mongoose.connect(MONGO_URI)
    .then(() => console.log('Sikeresen csatlakoztunk a MongoDB Atlas adatbázishoz!'))
    .catch(err => console.error('Adatbázis kapcsolódási hiba:', err));

app.post('/api/messages/send', async (req, res) => {
    try {
        const { sender, receiver, text } = req.body;
        const newMessage = new Message({ sender, receiver, text });
        await newMessage.save();
        res.status(201).json({ message: 'Üzenet elmentve!', data: newMessage });
    } catch (err) {
        res.status(500).json({ message: 'Hiba az üzenet mentésekor.' });
    }
});

app.get('/api/messages/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const history = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json(history);
    } catch (err) {
        res.status(500).json({ message: 'Hiba az üzenetek lekérésekor.' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'A felhasználónév vagy e-mail már foglalt!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: 'Sikeres regisztráció!' });
    } catch (err) {
        res.status(500).json({ message: 'Szerver hiba történt a regisztráció során.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(200).json({ message: 'Hibás felhasználónév vagy jelszó!' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ message: 'Hibás felhasználónév vagy jelszó!' });
        }

        res.status(200).json({ message: 'Sikeres bejelentkezés!', username: user.username });
    } catch (err) {
        res.status(200).json({ message: 'Szerver hiba történt a bejelentkezés során.' });
    }
});

app.post('/api/friends/add', async (req, res) => {
    try {
        const { currentUsername, friendUsername } = req.body;

        if (currentUsername === friendUsername) {
            return res.status(400).json({ message: 'Nem veheted fel magad barátnak!' });
        }

        const friend = await User.findOne({ username: friendUsername });
        if (!friend) {
            return res.status(444).json({ message: 'Ez a felhasználó nem létezik!' });
        }

        const currentUser = await User.findOne({ username: currentUsername });

        if (currentUser.friends.includes(friend._id)) {
            return res.status(400).json({ message: 'Ez a felhasználó már a barátod!' });
        }

        currentUser.friends.push(friend._id);
        friend.friends.push(currentUser._id);

        await currentUser.save();
        await friend.save();

        res.status(200).json({ message: 'Barát sikeresen hozzáadva!' });
    } catch (err) {
        res.status(500).json({ message: 'Szerver hiba a barát felvételekor.' });
    }
});

// 7. JAVÍTOTT STÁTUSZ FRISSÍTÉSE VÉGPONT
app.post('/api/user/status', async (req, res) => {
    try {
        const { username, status } = req.body;
        
        // Frissítjük a felhasználót az adatbázisban, és ha nem létezne a státusz mező, most létrehozza
        const user = await User.findOneAndUpdate(
            { username: username }, 
            { $set: { status: status } }, 
            { new: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: 'Felhasználó nem található.' });
        }
        res.status(200).json({ message: 'Státusz sikeresen frissítve!', status: user.status });
    } catch (err) {
        res.status(500).json({ message: 'Szerver hiba a státusz frissítésekor.' });
    }
});

// 8. GOLYÓÁLLÓ BARÁTLISTA LEKÉRDEZÉS VÉGPONT
app.get('/api/friends/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).populate('friends', 'username status');
        if (!user) {
            return res.status(404).json({ message: 'Felhasználó nem található.' });
        }
        
        const friendsList = user.friends.map(friend => {
            return {
                _id: friend._id,
                username: friend.username,
                status: friend.status || 'online'
            };
        });

        res.status(200).json(friendsList);
    } catch (err) {
        res.status(500).json({ message: 'Szerver hiba a barát eltávolításakor.' });
    }
});

app.post('/api/friends/remove', async (req, res) => {
    try {
        const { currentUsername, friendUsername } = req.body;

        const currentUser = await User.findOne({ username: currentUsername });
        const friend = await User.findOne({ username: friendUsername });

        if (!currentUser || !friend) {
            return res.status(404).json({ message: 'Felhasználó nem található.' });
        }

        currentUser.friends.pull(friend._id);
        friend.friends.pull(currentUser._id);

        await currentUser.save();
        await friend.save();

        res.status(200).json({ message: 'Barát sikeresen eltávolítva!' });
    } catch (err) {
        res.status(500).json({ message: 'Szerver hiba a barát eltávolításakor.' });
    }
});

app.post('/api/lobbies/create', async (req, res) => {
    try {
        const { host, game, rank, language } = req.body;
        await Lobby.deleteMany({ host });
        const newLobby = new Lobby({ host, game, rank, language });
        await newLobby.save();

        res.status(201).json({ message: 'Sikeres kitűzés!' });
    } catch (err) {
        res.status(500).json({ message: 'Szerver hiba' });
    }
});

app.get('/api/lobbies', async (req, res) => {
    try {
        const lobbies = await Lobby.find().sort({ createdAt: -1 });
        res.status(200).json(lobbies);
    } catch (err) {
        // JAVÍTÁS: A sima szöveg helyett visszaküldjük a pontos adatbázis hibaüzenetet, így látni fogjuk a konzolban
        res.status(500).json({ message: 'Szerver hiba', error: err.message });
    }
});
app.post('/api/lobbies/remove', async (req, res) => {
    try {
        const { host } = req.body;
        await Lobby.deleteMany({ host });
        res.status(200).json({ message: 'Sikeres leszedés!' });
    } catch (err) {
        res.status(500).json({ message: 'Szerver hiba' });
    }
});

app.listen(PORT, () => {
    console.log(`A szerver elindult a http://localhost:${PORT} címen!`);
});
