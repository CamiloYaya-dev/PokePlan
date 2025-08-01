import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
    const navigate = useNavigate();
    const [hiddenButton, setHiddenButton] = useState(null);

    const handleNavigation = (path, button) => {
        setHiddenButton(button);
        setTimeout(() => {
            navigate(path);
        }, 400);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={styles.card}
            >
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={styles.title}
                >
                    🚀 PokePlan
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={styles.subtitle}
                >
                    Elige una opción para comenzar:
                </motion.p>

                <div className="button-container" style={styles.buttonContainer}>
                    <AnimatePresence>
                        {hiddenButton !== "create" && (
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "#0056b3" }}
                                whileTap={{ scale: 0.9 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.4 }}
                                onClick={() => handleNavigation("/create", "create")}
                                style={{ ...styles.button, backgroundColor: "#007bff" }}
                            >
                                Crear Tablero
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {hiddenButton !== "join" && (
                            <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: "#218838" }}
                                whileTap={{ scale: 0.9 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.4 }}
                                onClick={() => handleNavigation("/join", "join")}
                                style={{ ...styles.button, backgroundColor: "#28a745" }}
                            >
                                Entrar a Tablero
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}

const styles = {
    card: {
        padding: "20px",
        background: "#fff",
        borderRadius: "10px",
        boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.25)",
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
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
        gap: "15px",
    },
    button: {
        padding: "10px 20px",
        color: "white",
        fontSize: "16px",
        fontWeight: "bold",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
};
