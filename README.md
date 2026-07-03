# 🐎 HorseRacing — Frontend

Frontend client for **HorseRacingMVP**, a full-stack web application for managing horse racing operations, including race scheduling, event management, and role-based access for different user types.

---

## 📋 Overview

This is the client-side application for HorseRacingMVP, built with React. It consumes the [backend REST API](../horseracing-backend) to provide a tailored interface for each of the platform's 6 user roles — from race administrators to spectators.

## ✨ Key Features

- **Role-Based Interface** — dynamic views and permissions for 6 user roles:
  - **Admin** — full system control, user and race management
  - **Staff** — operational management of races and events
  - **Owner** — manages horses and views race entries
  - **Jockey** — views assigned races and schedules
  - **User** — general registered access
  - **Spectator** — public/read-only access to race information
- **Race & Schedule Views** — browse, create, and update races and event calendars
- **JWT-Based Authentication** — secure login flow integrated with the backend API
- **Responsive UI** — built with React for a smooth cross-device experience

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Library | React |
| Auth | JWT (via backend API) |
| Package Manager | npm |
| Version Control | Git / GitHub |

## 👥 My Role — Team Coordinator & Frontend Contributor

As team coordinator for this 4-member project, I was responsible for:
- Breaking down project requirements into tasks and delegating them across the team
- Managing timelines and tracking deliverables to keep the project on schedule
- Coordinating integration between this frontend application and the [backend API](../horseracing-backend), including the JWT authentication flow and role-based UI logic

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- The [backend service](../horseracing-backend) running locally (or a configured API base URL)

### Setup
```bash
git clone <this-repo-url>
cd horseracing-frontend
npm install
npm start
```

Update the API base URL in your environment configuration to point to the running backend instance.

## 📌 Project Status

Developed as an academic MVP (Minimum Viable Product) for the Software Engineering / Software Testing coursework at FPT University, demonstrating full-stack integration, role-based UI design, and team collaboration.

---

*Developed by a 4-member team at FPT University, Ho Chi Minh City Campus.*
