# Node-TypeScript-Wizard (NTW)

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/fless-lab/Node-TypeScript-Wizard)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](https://opensource.org/licenses/ISC)

A comprehensive, production-ready Node.js framework built with TypeScript, designed to accelerate backend development with best practices and modern architecture patterns.

## 🚀 Features

- **Modular Architecture** - Well-organized codebase with clear separation of concerns
- **TypeScript Support** - Full TypeScript integration with proper type definitions
- **Authentication & Authorization** - Secure user management with JWT, session handling, and role-based access control
- **Email Service** - Templated email notifications using Nodemailer and Nunjucks
- **File Storage** - Multiple storage options including local disk and MinIO (S3-compatible)
- **Queue System** - Background job processing with Bull
- **Security** - Built-in protection against common web vulnerabilities with Helmet, rate limiting, and more
- **Database Integration** - MongoDB support with Mongoose
- **API Framework** - RESTful API development with Express
- **Logging** - Comprehensive logging with Winston
- **Testing** - Jest setup for unit, integration, and E2E testing
- **Docker Support** - Containerization for development and production environments

## 📋 Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB (optional, if using MongoDB features)
- Redis (optional, for queue and rate limiting features)
- Docker & Docker Compose (optional, for containerized setup)

## 🔧 Installation

### Option 1: Standard Installation

```bash
# Clone the repository
git clone https://github.com/fless-lab/Node-TypeScript-Wizard.git
cd Node-TypeScript-Wizard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm start
```

### Option 2: Docker Installation

```bash
# Clone the repository
git clone https://github.com/fless-lab/Node-TypeScript-Wizard.git
cd Node-TypeScript-Wizard

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start with Docker
npm run docker:launch
# Or for production
npm run docker:launch:prod
```

## 🏗️ Project Structure

```
├── src/
│   ├── apps/           # Application-specific modules
│   ├── core/           # Core framework components
│   ├── helpers/        # Utility functions and services
│   ├── modules/        # Shared business logic modules
│   ├── types/          # TypeScript type definitions
│   └── server.ts       # Application entry point
├── templates/          # Email templates
├── tests/              # Test files
├── views/              # EJS view templates
└── ... configuration files
```

## 🛠️ Key Components

### Email Service

Send templated emails with ease:

```typescript
// Example: Sending a password reset email
const emailData: IEmailJobData = {
  to: user.email,
  template: 'password-reset',
  data: {
    appName: 'Your App',
    code: resetCode,
    expiresIn: 30
  },
  metadata: {
    userId: user.id,
    category: 'account'
  }
};

// The email will be queued and sent asynchronously
```

### File Storage

Multiple storage options available:

```typescript
// Example: Uploading a file to disk storage
const result = await DiskStorageService.uploadFile(fileBuffer);

// Example: Retrieving a file
const file = await DiskStorageService.getFile(fileId);
```

### Authentication

Secure user authentication with multiple protection layers:

- JWT token-based authentication
- Session management
- Rate limiting and brute force protection
- Password hashing with bcrypt

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test types
npm run test:e2e       # End-to-end tests
npm run test:coverage  # Test coverage report
```

## 🚢 Deployment

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

### Docker Production

```bash
# Build and start production containers
npm run docker:launch:prod
```

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 👨‍💻 Author

Abdou-Raouf ATARMLA

---

Built with ❤️ using Node.js, TypeScript, and modern web technologies.