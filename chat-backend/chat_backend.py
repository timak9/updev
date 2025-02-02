from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import json
import bcrypt
from datetime import datetime

DATABASE_URL = "sqlite:///./chat.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)

class MessageDB(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String)
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

class User(BaseModel):
    username: str
    password: str

class Message(BaseModel):
    username: str
    message: str
    timestamp: str = datetime.now().isoformat()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

@app.post("/register")
def register(user: User):
    db = SessionLocal()
    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if existing_user:
        db.close()
        raise HTTPException(status_code=400, detail="Utilisateur déjà existant")
    
    hashed_pwd = hash_password(user.password)
    new_user = UserDB(username=user.username, password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.close()
    return {"message": "Inscription réussie"}

@app.post("/login")
def login(user: User):
    db = SessionLocal()
    existing_user = db.query(UserDB).filter(UserDB.username == user.username).first()
    if not existing_user or not verify_password(user.password, existing_user.password):
        db.close()
        raise HTTPException(status_code=400, detail="Nom d'utilisateur ou mot de passe incorrect")
    db.close()
    return {"message": "Connexion réussie", "username": user.username}

@app.get("/messages")
def get_messages():
    db = SessionLocal()
    messages = db.query(MessageDB).order_by(MessageDB.timestamp).all()
    db.close()
    return [{"username": m.username, "message": m.message, "timestamp": m.timestamp.isoformat()} for m in messages]

@app.post("/messages")
async def post_message(msg: Message):
    db = SessionLocal()
    new_message = MessageDB(username=msg.username, message=msg.message)
    db.add(new_message)
    db.commit()
    db.close()
    await manager.broadcast(json.dumps({
        "username": msg.username,
        "message": msg.message,
        "timestamp": datetime.now().isoformat()
    }))
    return {"status": "Message envoyé"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            message["timestamp"] = datetime.now().isoformat()
            
            db = SessionLocal()
            new_message = MessageDB(username=message["username"], message=message["message"])
            db.add(new_message)
            db.commit()
            db.close()
            
            await manager.broadcast(json.dumps(message))
    except WebSocketDisconnect:
        manager.disconnect(websocket)
