import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Board() {
    const { code } = useParams(); // Obtiene el código de la URL
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("😊");
    const [confirmed, setConfirmed] = useState(false);
    const [isValidBoard, setIsValidBoard] = useState(null);
    const [isBoardOwner, setIsBoardOwner] = useState(false); // Estado para verificar si es dueño

    // Lista de jugadores (data quemada)
    const [players, setPlayers] = useState([
        { id: 1, name: "MAX", icon: "🚀" },
        { id: 2, name: "LEO", icon: "🐱" },
        { id: 3, name: "ZOE", icon: "🎮" },
    ]);

    // Cartas disponibles para votar (data quemada, pero escalable)
    const [cards, setCards] = useState([0.5, 1, 2, 3, 5]);

    const icons = ["😊", "🚀", "🐱", "🎮", "⚡", "🔥", "👑", "🤖", "🎨", "💡"];

    const handleConfirm = () => {
        if (name.trim() !== "") {
            setConfirmed(true);
            setPlayers((prev) => [...prev, { id: prev.length + 1, name, icon: selectedIcon }]);
        }
    };

    const [selectedCard, setSelectedCard] = useState(null);
    const [playersVotes, setPlayersVotes] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleVote = (card) => {
        if (!showResults) { // Solo permite votar si los resultados no han sido revelados
            setSelectedCard(card);
            setPlayersVotes((prev) => ({
                ...prev,
                [name]: card, // Tu voto
            }));
        }
    };

    const revealVotes = () => {
        setShowResults(true);
    };

    const resetBoard = () => {
        setSelectedCard(null);
        setPlayersVotes({});
        setShowResults(false);
    };

    useEffect(() => {
        const validateBoard = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/tablero/${code}`);

                if (!response.ok) {
                    throw new Error("Tablero no encontrado" + code);
                }

                const data = await response.json();

                const storedOwners = JSON.parse(localStorage.getItem("owners") || "[]");

                // Verificar si el owner del tablero está en la lista de owners guardados en el localStorage
                if (Array.isArray(storedOwners) && storedOwners.includes(data.tablero.owner)) {
                    setIsBoardOwner(true);
                }
                console.log(isBoardOwner);
                console.log(Array.isArray(storedOwners));
                console.log(storedOwners.includes(data.tablero.owner));
                console.log(data.tablero.owner);
                console.log(storedOwners);
                setIsValidBoard(true);

                console.log("Tablero encontrado:", data);
            } catch (err) {
                console.error("Error:", err.message);
                navigate("/"); // Redirige a la página de inicio si el tablero no existe
            }
        };

        validateBoard();
    }, [code, navigate]);


    if (isValidBoard === null) {
        return (
            <div style={styles.loadingContainer}>
                <h2>🔄 Verificando tablero...</h2>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <AnimatePresence>
                {!confirmed ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.5 }}
                        style={styles.card}
                    >
                        <h2 style={styles.title}>👤 Configurar Perfil</h2>
                        <p style={styles.subtitle}>Ingresa tu nombre y elige un icono:</p>

                        <input
                            type="text"
                            placeholder="Tu nombre"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={10}
                            style={styles.input}
                        />

                        <h3 style={styles.subtitle}>Selecciona un icono:</h3>
                        <div style={styles.iconContainer}>
                            {icons.map((icon) => (
                                <motion.span
                                    key={icon}
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedIcon(icon)}
                                    style={{
                                        ...styles.icon,
                                        backgroundColor: selectedIcon === icon ? "#007bff" : "#ddd",
                                    }}
                                >
                                    {icon}
                                </motion.span>
                            ))}
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleConfirm}
                            style={styles.confirmButton}
                        >
                            ✅ Confirmar
                        </motion.button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        style={styles.board}
                    >
                        <h2>Planning Poker</h2>
                        <p>Estas participando como {selectedIcon} <strong>{name}</strong></p>

                        {/* Lista de jugadores */}
                        <h3 style={styles.sectionTitle}>Jugadores en el Tablero</h3>
                        <div style={styles.playersContainer}>
                            {players.map((player) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        ...styles.playerCard,
                                        backgroundColor: playersVotes[player.name] ? "#17a2b8" : "#ffc107",
                                    }}
                                >
                                    {player.icon} {player.name}{" "}
                                    {playersVotes[player.name] && "✅"}
                                </motion.div>
                            ))}
                        </div>

                        {/* Cartas de votación */}
                        <h3 style={styles.sectionTitle}>Selecciona tu Carta</h3>
                        <div style={styles.cardsContainer}>
                            {cards.map((card) => (
                                <motion.div
                                    key={card}
                                    whileHover={showResults ? {} : { scale: selectedCard === card ? 1 : 1.1 }}
                                    whileTap={showResults ? {} : { scale: 0.9 }}
                                    animate={{
                                        backgroundColor: selectedCard === card ? "#28a745" : "#007bff",
                                        opacity: showResults ? 0.5 : 1, // Hace que las cartas se vean atenuadas cuando está bloqueado
                                        pointerEvents: showResults ? "none" : "auto" // Bloquea la interacción cuando se muestran los resultados
                                    }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => handleVote(card)}
                                    style={styles.cardVote}
                                >
                                    {card}
                                </motion.div>
                            ))}
                        </div>
                        {isBoardOwner && selectedCard && !showResults && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={revealVotes}
                                style={styles.revealButton}
                            >
                                🔍 Revelar Votos
                            </motion.button>
                        )}
                        {showResults && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                style={styles.resultsContainer}
                            >
                                {players.map((player) => (
                                    <motion.div
                                        key={player.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        style={styles.voteResult}
                                    >
                                        {player.icon} {player.name}: {playersVotes[player.name] ?? "❓"}
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                        {isBoardOwner && showResults && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetBoard}
                                style={styles.resetButton}
                            >
                                🔄 Reiniciar Votación
                            </motion.button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        padding: "20px",
    },
    card: {
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        width: "350px",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    subtitle: {
        fontSize: "16px",
        color: "#666",
        marginBottom: "10px",
    },
    input: {
        width: "100%",
        height: "30px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        textAlign: "center",
        marginBottom: "15px",
    },
    iconContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "15px",
    },
    icon: {
        fontSize: "24px",
        padding: "10px",
        cursor: "pointer",
        borderRadius: "50%",
        textAlign: "center",
    },
    confirmButton: {
        padding: "10px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        width: "100%",
    },
    board: {
        width: "100%",
        maxWidth: "1200px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        padding: "20px",
    },
    playersContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        flexWrap: "wrap",
        width: "100%",
    },
    playerCard: {
        padding: "10px",
        backgroundColor: "#ffc107",
        color: "black",
        borderRadius: "5px",
        fontSize: "16px",
        fontWeight: "bold",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
    },
    cardsContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        flexWrap: "wrap",
        width: "100%",
    },
    cardVote: {
        width: "50px",
        height: "70px",
        backgroundColor: "#007bff",
        color: "white",
        fontSize: "18px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
    },
    revealButton: {
        marginTop: "20px",
        padding: "10px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "#17a2b8",
        color: "white",
        border: "none",
        borderRadius: "5px",
        width: "100%",
    },
    voteResult: {
        padding: "10px",
        backgroundColor: "#6c757d",
        color: "white",
        borderRadius: "5px",
        fontSize: "16px",
        fontWeight: "bold",
        textAlign: "center",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
    },
    resultsContainer: {
        marginTop: "20px",
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "15px",
        width: "100%",
    },
    resetButton: {
        marginTop: "20px",
        padding: "10px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "5px",
        width: "100%",
    },
};
