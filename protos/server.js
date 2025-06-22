const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const {ErrorMessages} = require("../data/errorMessageConstants");

// Load the proto file
const PROTO_PATH = path.join(__dirname, 'banking.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const bankingProto = grpc.loadPackageDefinition(packageDefinition).banking;

// Data storage
class DataStore {
    constructor() {
        this.users = [];
        this.accounts = [];
        this.transactions = [];
        this.nextUserId = 1;
        this.nextAccountId = 1;
        this.nextTransactionId = 1;
    }

    findAccount(accountId) {
        return this.accounts.find(account => account.account_id === accountId);
    }

    findUserByEmailOrId(email, idNumber) {
        return this.users.find(user => user.email === email || user.id_number === idNumber);
    }

    createTransaction(type, accountId, amount, currency, description, receiverAccountId = null) {
        const transaction = {
            transaction_id: this.nextTransactionId++,
            type,
            accountId,
            amount,
            currency,
            description,
            receiverAccountId,
            timestamp: new Date().toLocaleDateString('en-GB')
        };
        this.transactions.push(transaction);
        return transaction;
    }

    createAccount(currency) {
        const account = {
            account_id: this.nextAccountId++,
            account_balance: {
                amount: 0,
                currency_code: currency
            }
        };
        this.accounts.push(account);
        return account;
    }

    createUser(userData, account) {
        const user = {
            person_id: this.nextUserId++,
            account,
            ...userData
        };
        this.users.push(user);
        return user;
    }
}

// Validation utilities
class Validator {
    static validateRequiredFields(data, requiredFields) {
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
        return missingFields.length === 0;
    }

    static validateAmount(amount) {
        return amount > 0;
    }

    static validateCurrency(requestCurrency, accountCurrency) {
        return requestCurrency === accountCurrency;
    }

    static validateSufficientBalance(accountBalance, requestAmount) {
        return accountBalance >= requestAmount;
    }
}


// Service implementations
class BankingService {
    constructor() {
        this.dataStore = new DataStore();
    }

    createUser(call, callback) {
        try {
            const userData = call.request;
            const requiredFields = ['first_name', 'last_name', 'email', 'phone_number', 'id_number', 'account_currency'];

            // Validate required fields
            if (!Validator.validateRequiredFields(userData, requiredFields)) {
                return this.sendError(callback, ErrorMessages.MISSING_FIELDS);
            }

            // Check if user already exists
            if (this.dataStore.findUserByEmailOrId(userData.email, userData.id_number)) {
                return this.sendError(callback, ErrorMessages.USER_EXISTS);
            }

            // Create account and user
            const account = this.dataStore.createAccount(userData.account_currency);
            const user = this.dataStore.createUser(userData, account);

            console.log(`User created: ${userData.first_name} ${userData.last_name} with account ID: ${account.account_id}`);

            this.sendSuccess(callback, user);

        } catch (error) {
            this.sendError(callback, `Failed to create user: ${error.message}`);
        }
    }

    deposit(call, callback) {
        try {
            const { money, account_id, description } = call.request;

            // Find account
            const account = this.dataStore.findAccount(account_id);
            if (!account) {
                return this.sendError(callback, ErrorMessages.ACCOUNT_NOT_FOUND);
            }

            // Validate amount and currency
            if (!Validator.validateAmount(money.amount)) {
                return this.sendError(callback, ErrorMessages.INVALID_DEPOSIT_AMOUNT);
            }

            if (!Validator.validateCurrency(money.currency_code, account.account_balance.currency_code)) {
                return this.sendError(callback, ErrorMessages.CURRENCY_MISMATCH);
            }

            // Process deposit
            account.account_balance.amount += money.amount;
            const transaction = this.dataStore.createTransaction('DEPOSIT', account_id, money.amount, money.currency_code, description);

            console.log(`Deposit successful: ${money.amount} ${money.currency_code} to account ${account_id}`);

            this.sendSuccess(callback, {
                transaction_id: transaction.transaction_id,
                account_balance: { ...account.account_balance },
                transaction_summary: `Deposited ${money.amount} ${money.currency_code}. ${description || ''}`
            });

        } catch (error) {
            this.sendError(callback, `Deposit failed: ${error.message}`);
        }
    }

    withdraw(call, callback) {
        try {
            const { money, account_id, withdrawal_summary } = call.request;

            // Find account
            const account = this.dataStore.findAccount(account_id);
            if (!account) {
                return this.sendError(callback, ErrorMessages.ACCOUNT_NOT_FOUND);
            }

            // Validate amount and balance
            if (!Validator.validateAmount(money.amount)) {
                return this.sendError(callback, ErrorMessages.INVALID_WITHDRAWAL_AMOUNT);
            }

            if (!Validator.validateSufficientBalance(account.account_balance.amount, money.amount)) {
                return this.sendError(callback, ErrorMessages.INSUFFICIENT_BALANCE);
            }

            // Process withdrawal
            account.account_balance.amount -= money.amount;
            const transaction = this.dataStore.createTransaction('WITHDRAWAL', account_id, money.amount, money.currency_code, withdrawal_summary);

            console.log(`Withdrawal successful: ${money.amount} ${money.currency_code} from account ${account_id}`);

            this.sendSuccess(callback, {
                transaction_id: transaction.transaction_id,
                account_balance: { ...account.account_balance },
                description: withdrawal_summary || `Withdrawn ${money.amount} ${money.currency_code}`
            });

        } catch (error) {
            this.sendError(callback, `Withdrawal failed: ${error.message}`);
        }
    }

    getBalance(call, callback) {
        try {
            const { account_id } = call.request;

            // Find account
            const account = this.dataStore.findAccount(account_id);
            if (!account) {
                return callback(null, {
                    error: ErrorMessages.ACCOUNT_NOT_FOUND,
                    account_balance: null
                });
            }

            console.log(`Balance inquiry for account ${account_id}: ${account.account_balance.amount} ${account.account_balance.currency_code}`);

            callback(null, {
                error: "",
                account_balance: { ...account.account_balance }
            });

        } catch (error) {
            callback(null, {
                error: `Failed to get balance: ${error.message}`,
                account_balance: null
            });
        }
    }

    sendMoney(call, callback) {
        try {
            const { sender_account_id, receiver_account_id, money, description } = call.request;

            // Find both accounts
            const senderAccount = this.dataStore.findAccount(sender_account_id);
            const receiverAccount = this.dataStore.findAccount(receiver_account_id);

            if (!senderAccount) {
                return this.sendError(callback, ErrorMessages.SENDER_NOT_FOUND);
            }

            if (!receiverAccount) {
                return this.sendError(callback, ErrorMessages.RECEIVER_NOT_FOUND);
            }

            // Validate amount and balance
            if (!Validator.validateAmount(money.amount)) {
                return this.sendError(callback, ErrorMessages.INVALID_TRANSFER_AMOUNT);
            }

            if (!Validator.validateSufficientBalance(senderAccount.account_balance.amount, money.amount)) {
                return this.sendError(callback, ErrorMessages.INSUFFICIENT_SENDER_BALANCE);
            }

            // Process transfer
            senderAccount.account_balance.amount -= money.amount;
            receiverAccount.account_balance.amount += money.amount;

            // Create transaction records
            const transactionId = this.dataStore.nextTransactionId++;
            this.dataStore.createTransaction('TRANSFER_OUT', sender_account_id, money.amount, money.currency_code, description, receiver_account_id);
            this.dataStore.createTransaction('TRANSFER_IN', receiver_account_id, money.amount, money.currency_code, description, sender_account_id);

            console.log(`Money transfer successful: ${money.amount} ${money.currency_code} from account ${sender_account_id} to ${receiver_account_id}`);

            this.sendSuccess(callback, {
                sender_new_balance: { ...senderAccount.account_balance },
                receiver_new_balance: { ...receiverAccount.account_balance },
                transaction_id: transactionId.toString()
            });

        } catch (error) {
            this.sendError(callback, `Money transfer failed: ${error.message}`);
        }
    }

    // Helper methods
    sendSuccess(callback, data) {
        callback(null, { error: "", data });
    }

    sendError(callback, errorMessage) {
        callback(null, { error: errorMessage, data: null });
    }
}

// Server setup
function startServer() {
    const bankingService = new BankingService();
    const server = new grpc.Server();

    // Map service methods
    const serviceImplementation = {
        CreateUser: bankingService.createUser.bind(bankingService),
        Deposit: bankingService.deposit.bind(bankingService),
        Withdraw: bankingService.withdraw.bind(bankingService),
        GetBalance: bankingService.getBalance.bind(bankingService),
        SendMoney: bankingService.sendMoney.bind(bankingService)
    };

    server.addService(bankingProto.CreateBankingService.service, serviceImplementation);

    const port = '50052';
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.error('Failed to start server:', error);
            return;
        }
        console.log(`Banking gRPC Server started on port ${port}`);
        console.log('Available services: CreateUser, Deposit, Withdraw, GetBalance, SendMoney');
    });
}

if (require.main === module) {
    startServer();
}

module.exports = { BankingService, DataStore, Validator, ErrorMessages };