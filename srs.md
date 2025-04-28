**Voting System - SRS (Software Requirements Specification)**

---

# 1. Introduction

## 1.1 Purpose
The purpose of this project is to develop a **web-based voting system** using the **MERN Stack**. The system will provide two main interfaces:
- **Admin Panel**: For managing elections, candidates, voters, and results.
- **Voting Panel (User Side)**: For users to apply as candidates and vote in elections.

Frontend will be deployed on **Netlify**, and backend on **Heroku**.

## 1.2 Scope
- Admin can create, manage, and end elections.
- Admin can view live results during ongoing elections.
- Candidates can apply for participation.
- Admin can verify and approve candidates.
- Admin can assign specific users as eligible voters.
- Users can vote during the election window.
- Admin can declare results after the election concludes.

## 1.3 Technologies Used
- **Frontend**: React.js (Vite), Axios, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Deployment**: Netlify (Frontend), Heroku (Backend)
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS, Framer Motion for animations

---

# 2. System Description

## 2.1 User Roles
| Role     | Description |
|----------|-------------|
| Admin    | Manages users, elections, candidates, and results. |
| User     | Can apply to be a candidate, and vote if eligible. |

## 2.2 High-Level Workflow
1. Admin creates an election.
2. Candidates apply to participate.
3. Admin verifies and approves candidates.
4. Admin assigns eligible voters.
5. Users cast their votes.
6. Admin monitors live vote counts.
7. Admin ends the election and declares the results.

---

# 3. Functional Requirements

## 3.1 Authentication
- Secure login/signup for users and admins using JWT.
- Role-based access control.

## 3.2 Admin Panel Features
- **User Management**
  - View, create, update, delete users.
- **Election Management**
  - Create, edit, delete elections.
  - End election manually.
- **Candidate Management**
  - View, verify, approve/reject candidate applications.
- **Voting Management**
  - Assign eligible voters.
  - Monitor live vote counts.
- **Results Management**
  - After ending an election, results are frozen.
  - Admin can declare and publish results.

## 3.3 User Panel Features
- **Candidate Application**
  - Apply to become a candidate.
- **Voting**
  - View elections they are eligible for.
  - Vote for a candidate.
- **View Elections**
  - Browse ongoing and past elections.

---

# 4. Non-Functional Requirements

| Category             | Details                                                                |
|----------------------|------------------------------------------------------------------------|
| Performance          | Handle up to 500 concurrent users.                                     |
| Scalability          | Easily add multiple elections and users.                               |
| Security             | JWT authentication, bcrypt password hashing.                          |
| Usability            | Highly intuitive and smooth user experience.                           |
| UI/UX Design         | Fancy, highly attractive, modern and "sexy to the core" UI using Tailwind CSS, animations with Framer Motion, responsive across devices. |
| Availability         | 99.9% uptime.                                                           |
| Maintainability      | Clean, modular codebase structure.                                     |

---

# 5. Database Design

## 5.1 Users Collection
| Field         | Type     | Description |
|---------------|----------|-------------|
| _id           | ObjectId | Unique ID |
| name          | String   | User's name |
| email         | String   | User's email (unique) |
| password      | String   | Hashed password |
| role          | String   | 'user' or 'admin' |
| eligibleElections | [ObjectId] | List of election IDs user can vote in |

## 5.2 Elections Collection
| Field         | Type     | Description |
|---------------|----------|-------------|
| _id           | ObjectId | Unique ID |
| title         | String   | Election title |
| description   | String   | Short description |
| startDate     | Date     | Start time |
| endDate       | Date     | End time |
| status        | String   | Upcoming, Ongoing, Ended |

## 5.3 Candidates Collection
| Field         | Type     | Description |
|---------------|----------|-------------|
| _id           | ObjectId | Unique ID |
| userId        | ObjectId | Reference to the user |
| electionId    | ObjectId | Reference to the election |
| status        | String   | Pending, Verified, Rejected |

## 5.4 Votes Collection
| Field         | Type     | Description |
|---------------|----------|-------------|
| _id           | ObjectId | Unique ID |
| electionId    | ObjectId | Reference to the election |
| voterId       | ObjectId | Reference to the voter |
| candidateId   | ObjectId | Reference to the candidate voted for |

---

# 6. API Overview

## 6.1 Auth APIs
- `POST /api/auth/register` - Register user.
- `POST /api/auth/login` - Login user/admin.

## 6.2 Admin APIs
- `POST /api/elections` - Create election.
- `PATCH /api/elections/:id/end` - End election.
- `GET /api/elections/live/:id` - Get live vote count.
- `POST /api/candidates/:id/verify` - Approve candidate.
- `PATCH /api/users/:id/assign-election` - Assign election to user.

## 6.3 User APIs
- `POST /api/candidates/apply` - Apply as a candidate.
- `GET /api/elections/eligible` - View elections eligible to vote in.
- `POST /api/votes` - Cast vote.

---

# 7. Deployment Plan

- Frontend will be built (`npm run build`) and deployed on **Netlify**.
- Backend will be deployed on **Heroku** with MongoDB Atlas integration.
- Environment variables for secrets and DB connections will be securely managed.

---

# 8. Deliverables

- Full working MERN Voting System.
- Admin panel with live election monitoring and result declaration.
- Fancy, modern, sexy-to-the-core UI.
- Separate frontend (Netlify) and backend (Heroku) deployments.
- Source code pushed to GitHub.