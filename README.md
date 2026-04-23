🎵 SocioCircle — Community Jamming & Social Platform

SocioCircle is a scalable full-stack social platform designed for music enthusiasts to connect, collaborate, and organize jamming sessions in real time.
The platform enables users to create communities, schedule sessions, and communicate instantly using WebSocket-based messaging.

This project demonstrates industry-level full-stack engineering, including secure authentication, real-time communication, and modular backend architecture using Spring Boot and React.

---

🚀 Key Features

- User Registration and Login
- Secure JWT Authentication
- Profile Management System
- Create and Join Community Groups
- Schedule Jamming Sessions
- Join and Leave Sessions
- Real-Time Chat using WebSocket
- Protected Routes with Authorization
- Responsive UI Design
- Pagination and Lazy Loading
- RESTful API Architecture
- Scalable Backend Design

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
- REST APIs
- Microservices-Ready Architecture

Database

- MySQL
- PostgreSQL

---

📁 Project Structure

sociocircle/

backend/
│
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── config/
├── websocket/
├── exception/
│
frontend/
│
├── components/
├── pages/
├── services/
├── store/
├── hooks/
├── utils/
└── styles/

---

🔐 Authentication Flow

User Login
     ↓
Credentials Validation
     ↓
JWT Token Generation
     ↓
Token Stored in Local Storage
     ↓
Token Sent with API Requests
     ↓
Protected Routes Authorization

---

📡 API Endpoints

Authentication

POST   /api/auth/register
POST   /api/auth/login

Groups

GET    /api/groups
POST   /api/groups
GET    /api/groups/{groupId}

Sessions

POST   /api/sessions
GET    /api/sessions/{groupId}
POST   /api/sessions/{sessionId}/join
POST   /api/sessions/{sessionId}/leave

Participants

GET /api/sessions/{sessionId}/participants

Chat — WebSocket

Connection:

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

Requirements

- Java 17+
- Maven
- MySQL or PostgreSQL

Run

cd backend

mvn spring-boot:run

Backend will start at:

http://localhost:8080

---

Step 3 — Run Frontend

Requirements

- Node.js
- npm

Run

cd frontend

npm install

npm run dev

Frontend will start at:

http://localhost:5173

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

🧠 System Design Highlights

- Stateless Authentication using JWT
- Real-Time Messaging via WebSocket
- RESTful API Architecture
- Layered Backend Architecture
- Secure Route Protection
- Scalable Service-Based Design
- Separation of Concerns
- Production-Ready Error Handling
- Pagination for Performance Optimization

---

📦 Future Improvements

- Notifications System
- File Upload Support
- Image Sharing
- Video Streaming
- Dark Mode
- Push Notifications
- Deployment (Docker + Cloud)
- Role-Based Access Control
- Email Verification
- Redis Caching

---

👨‍💻 Author

Prem Burnwal
Full Stack Developer

Tech Focus:
Java • Spring Boot • React • WebSocket • REST APIs • Microservices

---

⭐ Project Purpose

This project demonstrates:

- Full-stack application development
- Real-time communication systems
- Secure authentication using JWT
- Scalable backend architecture
- Modern frontend engineering
- Production-level software design
- Industry-ready development practices
