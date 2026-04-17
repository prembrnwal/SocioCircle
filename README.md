🎵 SocioCircle — Community Jamming & Social Platform

SocioCircle is a full-stack social community platform for music enthusiasts.
Users can create groups, schedule jamming sessions, and chat in real-time.

This project demonstrates industry-level full-stack development using React, Spring Boot, WebSocket, and JWT authentication.

---

🚀 Features

- User Registration and Login
- JWT Authentication
- Profile Management
- Create and Join Groups
- Schedule Jamming Sessions
- Join and Leave Sessions
- Real-Time Chat using WebSocket
- Responsive UI Design
- Protected Routes
- Pagination and Lazy Loading

---

🏗️ Tech Stack

Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Zustand / Context API
- Framer Motion

Backend

- Spring Boot
- Spring Security
- JWT Authentication
- WebSocket (STOMP)
- Hibernate / JPA

Database

- MySQL / PostgreSQL

---

📁 Project Structure

backend/

- controller/
- service/
- repository/
- entity/
- dto/
- config/
- websocket/
- exception/

frontend/

- components/
- pages/
- services/
- store/
- hooks/
- utils/
- styles/

---

🔐 Authentication Flow

1. User logs in
2. Backend verifies credentials
3. JWT token is generated
4. Token is stored in local storage
5. Token is sent with API requests
6. Protected routes validate access

---

📡 API Endpoints

Authentication

POST /api/auth/register
POST /api/auth/login

Groups

GET /api/groups
POST /api/groups
GET /api/groups/{groupId}

Sessions

POST /api/sessions
GET /api/sessions/{groupId}
POST /api/sessions/{sessionId}/join
POST /api/sessions/{sessionId}/leave

Participants

GET /api/sessions/{sessionId}/participants

Chat (WebSocket)

Connection Endpoint:

/ws/chat

Subscribe:

/topic/session/{sessionId}

Send Message:

/app/chat/send

---

⚡ How to Run the Project

Step 1 — Clone Repository

git clone https://github.com/your-username/sociocircle.git

cd sociocircle

---

Step 2 — Run Backend

Requirements:

Java 17+
Maven
MySQL or PostgreSQL

Run:

cd backend

mvn spring-boot:run

Backend will run on:

http://localhost:8080

---

Step 3 — Run Frontend

Requirements:

Node.js
npm

Run:

cd frontend

npm install

npm start

Frontend will run on:

http://localhost:3000

---

🌐 Environment Variables

Backend

DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=

Frontend

VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws

---

📦 Future Improvements

- Notifications
- File Upload
- Image Sharing
- Video Streaming
- Dark Mode
- Push Notifications

---

👨‍💻 Author

Prem Burnwal

Full Stack Developer
Java | Spring Boot | React | WebSocket

---

⭐ Project Purpose

This project demonstrates:

- Full-stack development
- Real-time communication
- Scalable backend architecture
- Professional frontend design
- Production-ready engineering practices
