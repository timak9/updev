import { useState, useEffect } from "react";
import Login from "./Login";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [username, setUsername] = useState(localStorage.getItem("username") || "");
    const [ws, setWs] = useState(null);

    useEffect(() => {
        if (username) {
            const websocket = new WebSocket("ws://127.0.0.1:8000/ws");
            setWs(websocket);

            websocket.onmessage = (event) => {
                const newMessage = JSON.parse(event.data);
                setMessages((prev) => [...prev, newMessage]);
            };

            fetch("http://127.0.0.1:8000/messages")
                .then((res) => res.json())
                .then((data) => setMessages(data));

            return () => websocket.close();
        }
    }, [username]);

    const sendMessage = () => {
        if (message.trim() !== "" && ws) {
            ws.send(JSON.stringify({ username, message }));
            setMessage("");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    if (!username) {
        return <Login onLogin={setUsername} />;
    }

    return (
        <div className="flex flex-col h-screen p-4 max-w-lg mx-auto bg-gradient-to-r from-blue-500 to-purple-600">
            <h1 className="text-xl font-bold text-white text-center mb-4">💬 Chat en temps réel</h1>

            {/* Zone des messages */}
            <div className="flex flex-col flex-1 overflow-y-auto bg-white rounded-lg shadow-md p-3 space-y-2">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${
                            msg.username === username ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        <div 
                            className={`p-2 max-w-xs rounded-lg shadow-md ${
                                msg.username === username 
                                    ? 'bg-blue-500 text-white'  // Messages envoyés par l'utilisateur
                                    : 'bg-gray-200 text-gray-800' // Messages des autres utilisateurs
                            }`}
                        >
                            <span className="text-xs text-gray-300 block">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                            <strong className="text-sm">{msg.username}:</strong> {msg.message}
                        </div>
                    </div>
                ))}
            </div>

            {/* Zone d'envoi de message */}
            <div className="flex items-center gap-2 mt-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Écrivez un message..."
                />
                <button 
                    onClick={sendMessage} 
                    className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-md transition-all"
                >
                    Envoyer
                </button>
            </div>

            {/* Bouton de déconnexion */}
            <button 
                onClick={() => { localStorage.removeItem("username"); setUsername(""); }} 
                className="bg-red-500 text-white p-2 mt-2 w-full rounded-lg"
            >
                Déconnexion
            </button>
        </div>
    );
};

export default Chat;
