# Node-TypeScript-Wizard

A robust and scalable starter project for Node.js, Express, MongoDB, TypeScript, and more. This project provides a solid foundation for developing modern backend applications with a modular architecture and advanced security features.

## 🌟 Features

### 🔐 Authentication & Security
- JWT Authentication with refresh tokens
- OTP (One-Time Password) system for:
  - Account verification
  - Password reset
  - Secure login
  - Email update
  - Phone verification
- Protection against common attacks (CSRF, XSS, etc.)
- Rate limiting and brute force protection
- Secure session management

### 📧 Email System
- HTML and text email templates
- Email queue with Bull
- Templates for:
  - Account creation
  - Account verification
  - Password reset
  - OTP login
  - Password reset confirmation

### 🏗 Architecture
- Modular and scalable architecture
- Repository pattern for data access
- Centralized error handling
- Advanced logging
- Flexible configuration

### 🛠 Technologies
- Node.js & Express
- TypeScript
- MongoDB with Mongoose
- Redis for caching and sessions
- Bull for queues
- JWT for authentication
- Nodemailer for emails
- Jest for testing

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Redis
- Docker (optional)

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/fless-lab/Node-TypeScript-Wizard.git
cd Node-TypeScript-Wizard
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Start in development mode:
```bash
npm run start
```

### Docker Installation

```bash
# Start in development mode
npm run docker:launch

# Start in production mode
npm run docker:launch:prod
```

## 📁 Project Structure

```
├── src/
│   ├── apps/                 # Main applications and modules
│   ├── modules/             # Shared modules
│   │   ├── authz/          # Authentication and authorization
│   │   ├── features/       # Business features
│   │   └── shared/         # Shared utilities
│   └── server.ts           # Entry point
├── templates/              # Email templates
├── tests/                 # Unit and e2e tests
├── docs/                  # Documentation
└── ...
```

## 🔧 Configuration

The project uses a flexible configuration system based on environment variables. Main configurations include:

- Database configuration
- Redis configuration
- JWT configuration
- Email configuration
- Security configuration
- Logging configuration

## 📝 API Endpoints

### Authentication
- `POST /auth/register` - Registration
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset

### OTP
- `POST /auth/otp/generate` - Generate OTP
- `POST /auth/otp/validate` - Validate OTP

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e

# Run tests in watch mode
npm run test:watch
```

## 📧 Email Templates

The project includes email templates for different use cases:

- `account-creation` - Account creation
- `email-verification` - Email verification
- `otp-login` - OTP login
- `otp-reset-password` - Password reset
- `password-reset-confirmation` - Password reset confirmation
- `account-verified` - Account verified

## 🔐 Security

The project implements several security measures:

- CSRF protection
- Security headers with Helmet
- Rate limiting
- Input validation
- Secure session management
- Brute force protection

## 📈 Monitoring and Logging

- Structured logging with Winston
- Queue monitoring with Bull Board
- Request tracing with Morgan

## 🤝 Contributing

Contributions are welcome! Please check [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 👥 Authors

- fless-lab

## 🙏 Acknowledgments

- All contributors
- The open source community