Voting System
A comprehensive web-based election management platform built with the MERN stack. This system allows organizations to create, manage, and run secure online elections with real-time results and analytics.

<img alt="Voting System" src="https://img.shields.io/badge/Voting System-1.0.0-blue">
Features
User Authentication - Secure login/signup with JWT and role-based access control
Election Management - Create, edit, and manage election cycles
Candidate Applications - Users can apply as candidates with profile and manifesto
Admin Dashboard - Monitor live vote counts and election statistics
Advanced Analytics - Track voter engagement, time-based voting patterns, and election competitiveness
Responsive Design - Modern UI that works across all devices
Real-time Results - Live charts and visualizations of election outcomes
Tech Stack
Frontend
React.js (Vite)
TailwindCSS
Framer Motion for animations
Recharts for data visualization
React Router v6
Axios for API requests
Backend
Node.js
Express.js
MongoDB with Mongoose
JWT Authentication
Express Validator
Deployment
Frontend: Netlify
Backend: Heroku
Database: MongoDB Atlas
Installation
Prerequisites
Node.js (v14+)
npm or yarn
MongoDB Atlas account or local MongoDB installation
Setup Instructions
git clone https://github.com/yourusername/voting-system.git
cd voting-system
Backend Setup
cd backend
npm install

# Create a .env file with the following variables
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# PORT=5001

# Run the development server
npm run dev
Frontend Setup
cd frontend
npm install

# Create a .env file with the following variables
# VITE_API_URL=http://localhost:5001/api

# Run the development server
npm run dev


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

Acknowledgements
Built as part of a software requirements specification project
Uses Tailwind CSS for styling
Framer Motion for animations
Recharts for data visualization
Icon packs from Heroicons