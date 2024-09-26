# Devolved AI WebApp Backend

## Description

This project is the backend for the Devolved AI WebApp, designed to provide efficient and scalable web services. Built with Express.js, it leverages a variety of packages to ensure security, performance, and ease of development.

## Features

- Buletproof 4 Layer Project Architecture
- Data Validation
- Security
- Logging
- Caching
- Rate Limiter
- Dependencies Injection
- Service Layer
- Pub/Sub Layer
- Unit Testing
- Corn Jobs Recurring Tasks
- Configurations and Secrets
- Loaders

## Getting Started

### Prerequisites

Ensure you have Node.js and npm installed on your machine. If not, follow the installation instructions on [Node.js official website](https://nodejs.org/).

### Cloning the Repository

To clone the repository and run the project on your local machine, follow these steps:

```bash
git clone https://github.com/Devolved-AI/Devolved_AI_Backend.git
cd Devolved_AI_Backend
npm install
```

Running the Application
For development, run:

```bash
npm run dev
```

For production, run:
```bash
npm start
```

## Packages
### Dependencies

[bcrypt]: Used for hashing and salting user passwords for secure storage.

[compression]: Middleware to compress response bodies for improved performance.

[dotenv]: Loads environment variables from a .env file into process.env.

[express]: Web application framework for Node.js, designed for building web applications and APIs.

[express-rate-limit]: Middleware for limiting repeated requests to public APIs and/or endpoints.

[express-session]: Session middleware for Express, supporting session management.

[helmet]: Helmet helps secure Express applications by setting various HTTP headers. It's not a silver bullet, but it can help prevent some common attack vectors by configuring headers such as Content-Security-Policy, X-Frame-Options, and X-XSS-Protection. It's a middleware that can be easily integrated into any Express application to enhance security with minimal effort.

[ioredis]: A robust, performance-focused, and full-featured Redis client for Node.js.

[joi]: Object schema validation to ensure data safety by validating JavaScript objects based on a predefined schema.

[jsonwebtoken]: Implements JSON Web Tokens for securely transmitting information between parties as a JSON object.

[module-alias]: Provides custom module path aliases to simplify imports in complex projects.

[mongoose]: MongoDB object modeling tool designed to work in an asynchronous environment.

[multer]: Middleware for handling multipart/form-data, primarily used for uploading files.

[rate-limit-redis]: Redis store for express-rate-limit, allowing rate limit counters to be stored in a Redis database.

[redis]: Node.js client for Redis, supports all Redis commands and focuses on high performance.

[winston]: A logger for just about everything, designed to be a simple and universal logging library.
DevDependencies

[chai]: Assertion library for Node.js and the browser, can be paired with any JavaScript testing framework.

[eslint]: Pluggable JavaScript linter that helps identify and report on patterns in JavaScript.

[migrate-mongo]: A database migration tool for MongoDB in Node.js.

[mocha]: A feature-rich JavaScript test framework running on Node.js, making asynchronous testing simple.

[nodemon]: Utility that monitors for any changes in your source and automatically restarts your server.

[supertest]: HTTP assertion library allowing you to test your Node.js HTTP servers.