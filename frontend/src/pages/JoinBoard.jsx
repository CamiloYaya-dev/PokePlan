import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function JoinBoard() {
    const [boardCode, setBoardCode] = useState("");
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleJoinBoard = () => {
        if (boardCode.trim() === "" || boardCode.length != 4) {
            setError(true);
            return;
        }
        navigate(`/board/${boardCode}`);
    };

    return (
        <div>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={styles.card}
            >
                <h2 style={styles.title}>🔑 Entrar a Tablero</h2>
                <p style={styles.subtitle}>Ingresa el código del tablero para unirte.</p>

                <input
                    type="text"
                    placeholder="Código del tablero"
                    value={boardCode}
                    onChange={(e) => {
                        setBoardCode(e.target.value.toUpperCase());
                        setError(false);
                    }}
                    maxLength={4}
                    style={styles.input}
                />

                {/* Mensaje de error */}
                <AnimatePresence>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={styles.errorText}
                        >
                            ⚠ Ingresa un código válido.
                        </motion.p>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleJoinBoard}
                    style={styles.joinButton}
                >
                    ➡ Unirse al Tablero
                </motion.button>
            </motion.div>
        </div>
    );
}

const styles = {
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
        marginBottom: "20px",
    },
    input: {
        width: "100%",
        height: "25px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        textAlign: "center",
        textTransform: "uppercase",
    },
    errorText: {
        color: "red",
        fontSize: "14px",
        marginTop: "8px",
    },
    joinButton: {
        marginTop: "15px",
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
};
