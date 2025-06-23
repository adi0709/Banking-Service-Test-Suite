# Banking Service Test Suite

This repository contains comprehensive functional and non-functional tests for a banking service built using gRPC and Protocol Buffers (protobuf). The service provides core banking operations including user management, deposits, withdrawals, balance inquiries, and money transfers.

## 🏗️ Repository Structure

```
yolo-tests/
├── .github/
│   └── workflows/
│       └── test.yml                 # GitHub Actions CI/CD pipeline
├── data/
│   ├── errorMessageConstants.js     # Centralized error message definitions
│   └── performanceThresholds.js     # Performance benchmark thresholds
├── protos/
│   ├── banking.proto               # gRPC service definitions
│   └── server.js                   # Mock banking server implementation
├── tests/
│   ├── FunctionalTests/
│   │   ├── createUser.test.js      # User creation API tests
│   │   ├── deposit.test.js         # Deposit operation tests
│   │   ├── getBalance.test.js      # Balance inquiry tests
│   │   ├── sendMoney.test.js       # Money transfer tests
│   │   └── withdraw.test.js        # Withdrawal operation tests
│   └── NonFunctionalTests/
│       ├── performance.test.js     # Response time and load tests
│       └── security.test.js        # Input validation and security tests
├── utils/
│   └── testHelper.js              # Test utilities and helper functions
├── .dockerignore                  # Docker ignore file
├── .gitignore
├── docker-compose.yml             # Docker Compose configuration
├── Dockerfile                     # Docker container definition
├── package.json
└── README.md
```

## 🛠️ Tools and Technologies

### Core Technologies
- **Node.js**: JavaScript runtime environment
- **gRPC**: High-performance RPC framework
- **Protocol Buffers**: Language-neutral data serialization

### Testing Framework
- **Jest**: JavaScript testing framework
- **@faker-js/faker**: Generate realistic test data
- **Performance API**: Built-in Node.js performance measurement

### gRPC Dependencies
- **@grpc/grpc-js**: Pure JavaScript gRPC implementation
- **@grpc/proto-loader**: Dynamic proto file loading
- **grpc-tools**: Protocol buffer compiler tools

### Development Tools
- **Concurrently**: Run multiple commands simultaneously
- **Wait-on**: Wait for services to be available
- **GitHub Actions**: Automated CI/CD pipeline

### Containerization
- **Docker**: Container platform for consistent environments
- **Docker Compose**: Multi-container Docker application management

## 🚀 Getting Started

### Prerequisites

#### For Local Development
- Node.js (version 20 or higher)
- npm package manager

#### For Docker Development
- Docker (version 20.0 or higher)
- Docker Compose (version 2.0 or higher)

### Installation Options

#### Option 1: Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yolo-tests
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate gRPC stubs**
   ```bash
   npm run generate:grpc
   ```

#### Option 2: Docker Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd yolo-tests
   ```

2. **Build Docker image**
   ```bash
   npm run docker:build
   ```

No additional setup required - the Docker container handles all dependencies and gRPC generation automatically.

## 🎯 Available Commands

### Local Development Commands

#### Generate gRPC Code
```bash
npm run generate:grpc
```
Compiles the Protocol Buffer definitions and generates JavaScript gRPC client/server code.

#### Start Banking Server
```bash
npm run start:server
```
Launches the mock banking service on `localhost:50052`.

#### Run All Tests
```bash
npm test
```
Executes the complete Jest test suite.

#### Run Integration Tests
```bash
npm run test:integration
```
Starts the server and runs tests automatically using concurrently.

### Docker Commands

#### Build Docker Image
```bash
npm run docker:build
# OR
docker-compose build
```
Builds the Docker image with all dependencies and generates gRPC stubs automatically.

#### Run Tests in Docker Container
```bash
npm run docker:up
# OR
docker-compose up
```
Starts the containerized application and runs the complete integration test suite.

#### Stop and Clean Up Docker Container
```bash
npm run docker:down
# OR
docker-compose down
```
Stops the running container and removes it.

#### Advanced Docker Commands

**Build and run in detached mode:**
```bash
docker-compose up -d
```

**View container logs:**
```bash
docker-compose logs -f banking-tests
```

**Run tests with custom command:**
```bash
docker-compose run --rm banking-tests npm test
```

**Run specific test file:**
```bash
docker-compose run --rm banking-tests npm test -- tests/FunctionalTests/deposit.test.js
```

**Access container shell for debugging:**
```bash
docker-compose run --rm banking-tests sh
```

## 🐳 Docker Configuration

### Dockerfile Features

The `Dockerfile` is optimized for:

- **Base Image**: Uses `node:20-alpine` for minimal footprint
- **System Dependencies**: Installs Python, make, and g++ for gRPC compilation
- **Security**: Creates non-root user (`banking`) for container execution
- **Port Exposure**: Exposes port 50052 for gRPC service
- **Automatic Setup**: Generates gRPC stubs during build process

### Docker Compose Configuration

The `docker-compose.yml` provides:

- **Service Name**: `banking-tests`
- **Port Mapping**: Maps container port 50052 to host port 50052
- **Environment**: Sets `NODE_ENV=test` for testing environment
- **Default Command**: Runs integration tests by default
- **Container Name**: `banking-integration-tests` for easy identification

### Docker Ignore Configuration

The `.dockerignore` file excludes unnecessary files from the Docker build context:

- Node modules (installed inside container)
- Log files and debug outputs
- IDE configuration files
- Test coverage reports
- Git history and documentation

## 🧪 Test Execution Methods

### Method 1: Docker Compose (Recommended)

**Quick start - Build and run tests:**
```bash
npm run docker:build && npm run docker:up
```

**For development iterations:**
```bash
# First time setup
docker-compose build

# Run tests (can be repeated)
docker-compose up
```

### Method 2: Direct Docker Commands

```bash
# Build the image
docker build -t banking-tests .

# Run the container with tests
docker run --rm -p 50052:50052 banking-tests
```

### Method 3: Local Development

**Manual testing workflow:**

1. **Start the server in one terminal:**
   ```bash
   npm run start:server
   ```

2. **Run tests in another terminal:**
   ```bash
   npm test
   ```

**Automated testing workflow:**
```bash
npm run test:integration
```

## 🔧 Docker Troubleshooting

### Common Issues and Solutions

**Port already in use:**
```bash
# Check what's using port 50052
lsof -i :50052

# Kill the process or use different port
docker-compose run --rm -p 50053:50052 banking-tests
```

**Container build failures:**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

**Permission issues:**
```bash
# The Dockerfile creates a non-root user, but if you encounter issues:
docker-compose run --rm --user root banking-tests sh
```

**View detailed logs:**
```bash
# Follow logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs banking-tests
```

### Development Workflow with Docker

**Recommended development cycle:**

1. **Initial setup:**
   ```bash
   docker-compose build
   ```

2. **Run tests during development:**
   ```bash
   docker-compose up
   ```

3. **Make code changes and test again:**
   ```bash
   # Docker will use volume mounts if configured, or rebuild if needed
   docker-compose up
   ```

4. **Clean up when done:**
   ```bash
   docker-compose down
   ```

## 🧪 Test Categories

### Functional Tests
Located in `tests/FunctionalTests/`, these tests verify the core business logic:

- **User Management** (`createUser.test.js`)
    - User creation with validation
    - Duplicate user prevention
    - Required field validation

- **Financial Operations**
    - **Deposits** (`deposit.test.js`): Amount validation, currency matching
    - **Withdrawals** (`withdraw.test.js`): Balance verification, amount validation
    - **Transfers** (`sendMoney.test.js`): Multi-account operations, balance updates
    - **Balance Inquiries** (`getBalance.test.js`): Account balance retrieval

### Non-Functional Tests
Located in `tests/NonFunctionalTests/`:

- **Performance Tests** (`performance.test.js`)
    - Response time benchmarks
    - Concurrent operation handling
    - Load testing scenarios

- **Security Tests** (`security.test.js`)
    - Input sanitization
    - SQL injection prevention
    - XSS attack protection
    - Unicode and special character handling

## 📊 Performance Benchmarks

The system is tested against these performance thresholds:

| Operation | Threshold (ms) |
|-----------|----------------|
| Create User | 100 |
| Deposit | 50 |
| Withdraw | 50 |
| Get Balance | 30 |
| Send Money | 100 |

## 🔧 Banking Service API

The gRPC service provides five main operations:

### CreateUser
Creates a new user account with validation for required fields and duplicate prevention.

### Deposit
Adds funds to an account with currency validation and amount verification.

### Withdraw
Removes funds from an account with balance and amount validation.

### GetBalance
Retrieves current account balance for a given account ID.

### SendMoney
Transfers funds between two accounts with comprehensive validation.

## 🤖 Continuous Integration

The repository includes a GitHub Actions workflow (`.github/workflows/test.yml`) that:

1. Sets up Node.js environment
2. Installs dependencies
3. Generates gRPC stubs
4. Runs the complete test suite

The CI pipeline triggers on every push to any branch and can also be configured to use Docker for consistent environments across different CI runners.

## 🧩 Test Utilities

The `TestHelpers` class in `utils/testHelper.js` provides:

- **gRPC Client Management**: Connection handling and cleanup
- **Data Generation**: Realistic test data using Faker.js
- **Promise Wrapping**: Converts gRPC callbacks to async/await
- **Common Operations**: User creation, deposits, and test scenarios

### Example Usage
```javascript
const testHelpers = new TestHelpers();
await testHelpers.initialize();

// Create a user
const userResponse = await testHelpers.createUser();

// Make a deposit
const {userResponse, depositResponse} = await testHelpers.createUserWithDeposit(null, 1000);

testHelpers.close();
```

## 📝 Error Handling

The system implements comprehensive error handling with standardized messages defined in `data/errorMessageConstants.js`:

- Missing required fields
- Duplicate user detection
- Account not found scenarios
- Insufficient balance conditions
- Currency mismatch validation
- Invalid amount detection

## 🔍 Monitoring and Logging

The server includes console logging for:
- User creation events
- Transaction completions
- Balance inquiries
- Error conditions
