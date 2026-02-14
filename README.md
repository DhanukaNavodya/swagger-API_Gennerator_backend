---

# 🔐 Swagger Manager – Backend API

Backend service for the **Swagger Manager Platform**.

This **Express.js** API handles authentication, project management, endpoint creation, and dynamic Swagger/OpenAPI documentation generation for internal team collaboration.

---

## 🚀 Tech Stack

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication
* bcryptjs
* Swagger UI
* swagger-jsdoc
* Nodemon (Development)

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/swagger-manager-backend.git
cd swagger-manager-backend
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file in the backend root directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_random_secret_key
NODE_ENV=development
```

---

### 4️⃣ Start the Server

#### Development Mode (with Nodemon)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

---

## 📂 Project Structure

```
backend/
│
├── config/              # Database connection
├── controllers/         # Business logic
├── middleware/          # JWT auth middleware
├── models/              # Mongoose schemas
├── routes/              # API route definitions
├── swagger/             # Swagger generation logic
├── swagger-files/       # Generated Swagger JSON files
├── server.js            # Entry point
└── package.json
```

---

## 🔐 Authentication

JWT-based authentication system including:

* User Registration
* User Login
* Token Verification Middleware
* Protected Routes

---

## 🌐 API Endpoints

### 🔑 Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |
| GET    | `/api/auth/me`       | Get current user  |

---

### 📁 Projects

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| GET    | `/api/projects`             | Get user projects     |
| POST   | `/api/projects`             | Create project        |
| GET    | `/api/projects/:id`         | Get project details   |
| PUT    | `/api/projects/:id`         | Update project        |
| DELETE | `/api/projects/:id`         | Delete project        |
| GET    | `/api/projects/:id/swagger` | Generate Swagger spec |

---

### 🔌 Endpoints Management

| Method | Endpoint                            | Description              |
| ------ | ----------------------------------- | ------------------------ |
| POST   | `/api/endpoints`                    | Create endpoint          |
| GET    | `/api/endpoints/project/:projectId` | Get endpoints by project |
| PUT    | `/api/endpoints/:id`                | Update endpoint          |
| DELETE | `/api/endpoints/:id`                | Delete endpoint          |

---

## 📖 Swagger Documentation

### View Swagger UI

```
http://localhost:5000/api-docs/:projectId
```

### Access Raw Swagger JSON

```
http://localhost:5000/swagger-files/:projectId
```

---

## 📜 Available Scripts

```bash
npm start      # Production server
npm run dev    # Development server (nodemon)
```

---

## 🔒 Security Best Practices

* Use a strong and secure `JWT_SECRET`
* Enable HTTPS in production
* Configure MongoDB Atlas IP whitelist
* Never expose credentials in source code
* Use environment variables for sensitive data

---

## 🧩 Features

* Multi-project API documentation management
* Dynamic Swagger/OpenAPI generation
* Secure JWT-based authentication
* Endpoint-level documentation storage
* Team collaboration ready

---

Niceee 😎 let’s give you proper credit.

Add this section at the bottom of your README:

---

## 👨‍💻 Author

**Dhanuka Navodya**  
Software Engineer  

📧 Email: dhanukanavodya97@gmail.com  
🔗 GitHub: https://github.com/DhanukaNavodya  
🔗 LinkedIn: https://www.linkedin.com/in/dhanuka-navodya-a69351314/


---


