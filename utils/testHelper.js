const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { faker } = require('@faker-js/faker');

// Load the proto file
const PROTO_PATH = path.join(__dirname, '../protos/banking.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const bankingProto = grpc.loadPackageDefinition(packageDefinition).banking;

class TestHelpers {
    constructor() {
        this.client = null;
        this.TEST_PORT = '50052';
    }

    // Create gRPC client
    createClient() {
        return new bankingProto.CreateBankingService(
            `localhost:${this.TEST_PORT}`,
            grpc.credentials.createInsecure()
        );
    }

    // Promisify gRPC calls
    promisifyCall(method, request) {
        return new Promise((resolve, reject) => {
            this.client[method](request, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });
    }

    // Initialize client and wait for server
    async initialize() {
        this.client = this.createClient();
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.client;
    }

    // Close client connection
    close() {
        if (this.client) {
            this.client.close();
        }
    }

    // Generate complete user data
    generateUserData(overrides = {}) {
        return {
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            id_number: faker.string.numeric(9),
            residency_country_code: faker.location.countryCode('alpha-2'),
            nationality: faker.location.country(),
            email: faker.internet.email(),
            phone_number: faker.phone.number('+############'),
            gender: faker.person.sex(),
            account_currency: faker.finance.currencyCode(),
            dob: faker.date.birthdate({ min: 18, max: 80, mode: 'age' }).toISOString().split('T')[0],
            ...overrides
        };
    }

    // Generate incomplete user data (missing required fields)
    generateIncompleteUserData(missingFields = ['last_name', 'account_currency']) {
        const userData = this.generateUserData();
        missingFields.forEach(field => delete userData[field]);
        return userData;
    }

    // Generate empty user data
    generateEmptyUserData() {
        return {
            first_name: "",
            last_name: "",
            id_number: "",
            residency_country_code: "",
            nationality: "",
            email: "",
            phone_number: "",
            gender: "",
            dob: ""
        };
    }

    // Create a user and return response
    async createUser(userData = null) {
        const data = userData || this.generateUserData();
        return await this.promisifyCall('CreateUser', data);
    }

    // Create a user with deposit and return both responses
    async createUserWithDeposit(userData = null, depositAmount = null) {
        const userResponse = await this.createUser(userData);
        if (userResponse.error) return { userResponse, depositResponse: null };

        const depositData = {
            money: {
                amount: depositAmount || Number(faker.finance.amount()),
                currency_code: userResponse.data.account_currency
            },
            account_id: userResponse.data.account.account_id,
            value_date: new Date().toLocaleDateString('en-GB'),
            description: "Test deposit"
        };

        const depositResponse = await this.promisifyCall('Deposit', depositData);
        return { userResponse, depositResponse };
    }

    // Generate deposit request
    generateDepositRequest(accountId, currency, amount = null) {
        return {
            money: {
                amount: amount !== undefined && amount !== null ? amount : Number(faker.finance.amount()),
                currency_code: currency
            },
            account_id: accountId,
            value_date: new Date().toLocaleDateString('en-GB'),
            description: "Test deposit"
        };
    }

    // Generate withdraw request
    generateWithdrawRequest(accountId, currency, amount) {
        return {
            money: {
                amount: amount !== undefined && amount !== null ? amount : Number(faker.finance.amount()),
                currency_code: currency
            },
            account_id: accountId,
            value_date: new Date().toLocaleDateString('en-GB'),
            withdrawal_summary: "Test withdrawal"
        };
    }


    // Generate send money request
    generateSendMoneyRequest(senderAccountId, receiverAccountId, currency, amount = null) {
        return {
            sender_account_id: senderAccountId,
            receiver_account_id: receiverAccountId,
            money: {
                amount: amount || Number(faker.finance.amount()),
                currency_code: currency
            },
            description: "Test transfer"
        };
    }

    // Get a valid amount that's less than the balance
    getValidAmount(balance) {
        let amount = Number(faker.finance.amount());
        while (amount > balance) {
            amount = Number(faker.finance.amount());
        }
        return amount;
    }

    // Get an invalid amount that's greater than the balance
    getInvalidAmount(balance) {
        let amount = Number(faker.finance.amount());
        while (amount <= balance) {
            amount = Number(faker.finance.amount());
        }
        return amount;
    }

    // Get a different currency code
    getDifferentCurrency(currentCurrency) {
        let newCurrency = faker.finance.currencyCode();
        while (newCurrency === currentCurrency) {
            newCurrency = faker.finance.currencyCode();
        }
        return newCurrency;
    }
}

module.exports = TestHelpers;