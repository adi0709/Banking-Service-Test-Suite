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
├── .gitignore
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

## 🚀 Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- npm package manager

### Installation

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

## 🎯 Available Commands

### Core Operations

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

### Manual Testing Workflow

1. **Start the server in one terminal:**
   ```bash
   npm run start:server
   ```

2. **Run tests in another terminal:**
   ```bash
   npm test
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

The CI pipeline triggers on every push to any branch.

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