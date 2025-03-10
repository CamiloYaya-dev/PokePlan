const express = require('express');
const cors = require('cors');
const { db, initializeDB } = require('./db'); // Importa la inicialización de la BD

const app = express();
app.use(cors());
app.use(express.json());

// 🛠️ Inicializar la base de datos ANTES de usarla
initializeDB();

app.get('/', (req, res) => {
    res.send('Bienvenido a MeliVote API');
});

app.post('/api/tablero', (req, res) => {
    const { numCards, code, ownerVotes, autoClose, owner } = req.body;

    if (!code || numCards < 2 || numCards > 9) {
        return res.status(400).json({ error: 'Datos inválidos' });
    }

    try {
        const stmt = db.prepare(`
            INSERT INTO tablero (num_cards, code, owner_votes, auto_close, owner, status) 
            VALUES (?, ?, ?, ?, ?, 1)
        `);
        stmt.run(numCards, code, ownerVotes ? 1 : 0, autoClose ? 1 : 0, owner);
        res.status(201).json({ message: 'Tablero creado', id: code, owner });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tablero/:code', (req, res) => {
    const { code } = req.params;

    try {
        const stmt = db.prepare("SELECT * FROM tablero WHERE code = ?");
        const tablero = stmt.get(code);

        if (!tablero) {
            return res.status(404).json({ error: "Tablero no encontrado" });
        }
        
        res.json({ message: "Tablero encontrado", tablero });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
