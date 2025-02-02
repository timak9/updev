import { useState } from "react";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");

    const handleAuth = async () => {
        const endpoint = isRegistering ? "register" : "login";
        const response = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            onLogin(username);
            localStorage.setItem("username", username);
        } else {
            setError(data.detail);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-xl font-bold">{isRegistering ? "Inscription" : "Connexion"}</h1>
            {error && <p className="text-red-500">{error}</p>}
            <input
                type="text"
                placeholder="Nom d'utilisateur"
                className="border p-2 w-full mt-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                className="border p-2 w-full mt-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleAuth} className="bg-blue-500 text-white p-2 mt-2 w-full">
                {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-500 mt-2">
                {isRegistering ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? Inscrivez-vous"}
            </button>
        </div>
    );
};

export default Login;
