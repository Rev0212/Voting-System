
# 🗳️ Voting System

A comprehensive web-based election management platform built with the **MERN stack**. This system allows organizations to create, manage, and run secure online elections with real-time results and analytics.

![Voting System](https://img.shields.io/badge/Voting%20System-1.0.0-blue)

---

## ✨ Features

- **User Authentication** – Secure login/signup with JWT and role-based access control  
- **Election Management** – Create, edit, and manage election cycles  
- **Candidate Applications** – Users can apply as candidates with profile and manifesto  
- **Admin Dashboard** – Monitor live vote counts and election statistics  
- **Advanced Analytics** – Track voter engagement, time-based voting patterns, and election competitiveness  
- **Responsive Design** – Modern UI that works across all devices  
- **Real-time Results** – Live charts and visualizations of election outcomes  

---

## 🛠️ Tech Stack

### Frontend
- [React.js (Vite)](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) – Animations
- [Recharts](https://recharts.org/en-US/) – Data visualization
- [React Router v6](https://reactrouter.com/)
- [Axios](https://axios-http.com/) – API requests

### Backend
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- [JWT Authentication](https://jwt.io/)
- [Express Validator](https://express-validator.github.io/docs/)

---

## 🚀 Deployment

- **Frontend:** [Netlify](https://www.netlify.com/)
- **Backend:** [Heroku](https://www.heroku.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## ⚙️ Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB Atlas account or local MongoDB installation

### Setup Instructions

```bash
git clone https://github.com/yourusername/voting-system.git
cd voting-system
```

#### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder with the following variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

Start the backend development server:

```bash
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder with the following variables:

```env
VITE_API_URL=http://localhost:5001/api
```

Start the frontend development server:

```bash
npm run dev
```

---

## 📁 Project Structure

```
voting-system/
├── backend/
│   ├── middleware/     # Authentication middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── scripts/        # Seed scripts
│   ├── utils/          # Utility functions
│   └── index.js        # Main server file
│
└── frontend/
    ├── public/         # Static assets
    └── src/
        ├── api/        # API service
        ├── components/ # Reusable components
        ├── contexts/   # React contexts
        ├── layouts/    # Page layouts
        ├── pages/      # Page components
        └── App.jsx     # Main app component
```

---

## 🙌 Acknowledgements

- Built as part of a software requirements specification project  
- Uses [Tailwind CSS](https://tailwindcss.com/) for styling  
- [Framer Motion](https://www.framer.com/motion/) for animations  
- [Recharts](https://recharts.org/en-US/) for data visualization  
- Icon packs from [Heroicons](https://heroicons.com/)  

---

## 📜 License

MIT License – See `LICENSE` file for details.
