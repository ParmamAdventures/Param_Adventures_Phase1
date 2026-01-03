# Param Adventures

**Param Adventures** is a premium adventure tourism platform connecting thrill-seekers with curated trekking, climbing, and expedition experiences.

## 🚀 Features
- **User Profiles**: Custom avatars, bio, and preferences.
- **Trip Discovery**: Advanced search and filtering for adventures.
- **Media Gallery**: High-performance image and video galleries (Cloudinary).
- **Secure Auth**: JWT-based authentication with Role-Based Access Control.
- **Admin Dashboard**: Comprehensive management of trips, bookings, and users.

## 📚 Documentation
- [System Architecture](docs/ARCHITECTURE.md) - Tech stack and component details.
- [Deployment Guide](docs/DEPLOYMENT.md) - How to deploy and configure environment variables.
- [API Documentation](apps/api/README.md) - Details on backend endpoints.

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Cloudinary Account

### Local Development
1.  **Clone the repo**:
    ```bash
    git clone https://github.com/your-username/param-adventures.git
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment**:
    - Copy `.env.example` to `apps/api/.env` and `apps/web/.env`.
    - Fill in DB, JWT, and Cloudinary keys.
4.  **Run Development Server**:
    ```bash
    npm run dev
    # Starts both API (localhost:4000) and Web (localhost:3000) using Turbo/Concurrently
    ```

## 🤝 Contributing
1.  Create a feature branch (`git checkout -b feature/amazing-feature`).
2.  Commit your changes.
3.  Push to the branch.
4.  Open a Pull Request.

## 📄 License
Proprietary / Private.
