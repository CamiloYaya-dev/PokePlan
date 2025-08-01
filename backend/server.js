const express = require('express');
const cors = require('cors');
const { db, initializeDB } = require('./db'); 
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app); // Crear servidor HTTP
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Asegúrate de que este es el frontend
        methods: ["GET", "POST"]
    }
});
app.use(cors());
app.use(express.json());

// 🛠️ Inicializar la base de datos ANTES de usarla
initializeDB();

app.get('/', (req, res) => {
    res.send('Bienvenido a PokePlan API');
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

io.on("connection", (socket) => {
    console.log(`🟢 Cliente conectado: ${socket.id}`);

    socket.on("joinBoard", (boardCode) => {
        socket.join(boardCode);
        console.log(`Cliente ${socket.id} se unió al tablero ${boardCode}`);
    });

    socket.on("updateBoard", (boardCode, data) => {
        io.to(boardCode).emit("boardUpdated", data);
    });

    socket.on("disconnect", () => {
        console.log(`🔴 Cliente desconectado: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
