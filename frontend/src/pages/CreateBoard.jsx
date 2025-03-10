import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function CreateBoard() {
    const [numCards, setNumCards] = useState(5);
    const [ownerVotes, setOwnerVotes] = useState(false);
    const [autoClose, setAutoClose] = useState(true);
    const [votes, setVotes] = useState([]);
    const [boardCode, setBoardCode] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [hiddenButton, setHiddenButton] = useState(null);

    const navigate = useNavigate();

    const defaultScores = [0.5, 1, 2, 3, 5, 8, 13, 21, 34];
    const randomNames = ["MAX", "LEO", "ZOE", "LIA", "KAI", "SAM", "TOM", "LUC", "EVA", "NIA"];

    const cards = Array.from({ length: numCards }, (_, i) => ({
        id: i,
        value: defaultScores[i % defaultScores.length],
    }));

    const getRandomVote = () => cards[Math.floor(Math.random() * cards.length)].value;
    const getRandomName = (usedNames) => {
        let name;
        do {
            name = randomNames[Math.floor(Math.random() * randomNames.length)];
        } while (usedNames.includes(name));
        return name;
    };

    const generateBoardCode = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 4; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    };

    useEffect(() => {
        if (votes.length === 0) {
            const usedNames = [];
            const newVotes = Array.from({ length: 4 }, () => {
                const name = getRandomName(usedNames);
                usedNames.push(name);
                return { id: name, value: getRandomVote() };
            });

            setVotes(newVotes);
        }
    }, [numCards]);

    useEffect(() => {
        setVotes((prevVotes) => {
            if (ownerVotes) {
                if (!prevVotes.some((vote) => vote.id === "👑 OWN")) {
                    return [...prevVotes, { id: "👑 OWN", value: getRandomVote() }];
                }
            } else {
                return prevVotes.filter((vote) => vote.id !== "👑 OWN");
            }
            return prevVotes;
        });
    }, [ownerVotes]);

    const handleCreateBoard = async () => {
        const codigoGenerado = generateBoardCode();
        setBoardCode(codigoGenerado);
        setShowModal(true);

        const ownerHash = crypto.randomUUID(); // Generar un hash único para el dueño

        try {
            const response = await fetch('http://localhost:3000/api/tablero', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numCards,
                    code: codigoGenerado,
                    ownerVotes,
                    autoClose,
                    owner: ownerHash
                }),
            });

            if (!response.ok) {
                throw new Error('Error al crear el tablero');
            }

            // Obtener la lista actual de owners desde localStorage
            const storedOwners = JSON.parse(localStorage.getItem('owners')) || [];

            // Agregar el nuevo owner y guardar en localStorage
            storedOwners.push(ownerHash);
            localStorage.setItem('owners', JSON.stringify(storedOwners));

            console.log('Tablero guardado en la base de datos y owner registrado.');
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleNavigation = (path, button) => {
        setHiddenButton(button);
        setTimeout(() => {
            navigate(path);
        }, 400);
    };

    return (
        <div style={styles.container}>
            {!showModal ? (
                <div>
                    <h2 style={styles.title}>🃏 Crear Tablero</h2>
                    <p style={styles.subtitle}>Selecciona la cantidad de cartas:</p>

                    <input
                        type="number"
                        min="2"
                        max={defaultScores.length}
                        value={numCards}
                        onChange={(e) => setNumCards(Number(e.target.value))}
                        style={styles.input}
                    />

                    <h3 style={styles.sectionTitle}>Previsualización de cartas</h3>
                    <div style={styles.previewContainer}>
                        <AnimatePresence>
                            {cards.map((card) => (
                                <motion.div
                                    key={card.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3 }}
                                    style={styles.card}
                                >
                                    {card.value}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div style={styles.checkboxContainer}>
                        <label>
                            <input
                                type="checkbox"
                                checked={ownerVotes}
                                onChange={() => setOwnerVotes(!ownerVotes)}
                            />
                            &nbsp; ¿El dueño del tablero vota?
                        </label>
                    </div>

                    <h3 style={styles.sectionTitle}>Previsualización de votación</h3>
                    <div style={styles.previewContainer}>
                        <AnimatePresence mode="sync">
                            {votes.map((vote) => (
                                <motion.div
                                    key={vote.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    style={{
                                        ...styles.card,
                                        backgroundColor: vote.id === "👑 OWN" ? "#28a745" : "#ff9800",
                                    }}
                                >
                                    {vote.value}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <div style={styles.checkboxContainer}>
                        <label>
                            <input
                                type="checkbox"
                                checked={autoClose}
                                onChange={() => setAutoClose(!autoClose)}
                            />
                            &nbsp; ¿Cierre de votación automático?
                        </label>
                    </div>

                    <h3 style={styles.sectionTitle}>Previsualización de resultados</h3>
                    <div style={styles.previewContainer}>
                        {autoClose ? <Results votes={votes} /> : <HiddenResults />}
                    </div>
                    <div className="button-container" style={styles.buttonContainer}>
                        <AnimatePresence>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "#CED4DA" }}
                                whileTap={{ scale: 0.9 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.4 }}
                                onClick={() => handleNavigation("/", "home")}
                                style={{ ...styles.backButton, backgroundColor: "#ADB5BD" }}
                            >
                                Volver
                            </motion.button>
                        </AnimatePresence>
                        <AnimatePresence>
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "#218838" }}
                                whileTap={{ scale: 0.9 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.4 }}
                                onClick={handleCreateBoard}
                                style={{ ...styles.createButton, backgroundColor: "#28a745" }}
                            >
                                Entrar a Tablero
                            </motion.button>
                        </AnimatePresence>
                    </div>
                </div>
            ) : (
                <div>
                    <h3>📌 Código del Tablero</h3>
                    <p style={styles.code}>{boardCode}</p>
                    <AnimatePresence>
                        <motion.button
                            whileHover={{ scale: 1.1, backgroundColor: "#CED4DA" }}
                            whileTap={{ scale: 0.9 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.4 }}
                            onClick={() => handleNavigation(`/board/${boardCode}`, "board")}
                            style={{ ...styles.backButton, backgroundColor: "#ADB5BD" }}
                        >
                            Ir al Tablero
                        </motion.button>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

const Results = ({ votes }) => (
    <AnimatePresence mode="sync">
        {votes.map((vote) => (
            <motion.div
                key={vote.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    ...styles.card,
                    backgroundColor: vote.id === "👑 OWN" ? "#28a745" : "#ff9800",
                }}
            >
                {vote.id}: {vote.value}
            </motion.div>
        ))}
    </AnimatePresence>
);

const HiddenResults = () => (
    <motion.div style={styles.hiddenResults}>
        🔒 Resultados ocultos hasta que el dueño los revele
    </motion.div>
);

const styles = {
    container: {
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        width: "400px",
        margin: "auto",
    },
    title: {
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "bold",
        marginTop: "20px",
        color: "#444",
    },
    input: {
        padding: "8px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        width: "100px",
        textAlign: "center",
    },
    checkboxContainer: {
        marginTop: "15px",
        fontSize: "16px",
        color: "#444",
        textAlign: "center",
    },
    previewContainer: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginTop: "10px",
        flexWrap: "wrap",
    },
    card: {
        width: "50px",
        height: "70px",
        backgroundColor: "#007bff",
        color: "white",
        fontSize: "14px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "5px",
        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
    },
    hiddenResults: {
        width: "200px",
        height: "70px",
        backgroundColor: "#ccc",
        color: "#444",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "5px",
    },
    resultsContainer: {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: "10px",
        marginTop: "10px",
    },
    modal: {
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        width: "300px"
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    createButton: {
        marginTop: "20px",
        padding: "10px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "#28a745",
        color: "white",
        border: "none",
        borderRadius: "5px",

    },
    backButton: {
        marginTop: "20px",
        padding: "10px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
    },
    code: {
        fontSize: "24px",
        fontWeight: "bold",
        color: "#007bff"
    },
    buttonContainer: {
        display: "inline-flex",
        justifyContent: "space-between",
        gap: "25px",
    }
};
