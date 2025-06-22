const TestHelpers = require('../../utils/testHelper');
const { faker } = require('@faker-js/faker');

describe('Banking gRPC Service - SendMoney API Tests', () => {
    let testHelpers;
    let receiverResponse;

    beforeAll(async () => {
        testHelpers = new TestHelpers();
        await testHelpers.initialize();

        // Create a receiver user that will be used across all tests
        const receiverUserData = testHelpers.generateUserData();
        receiverResponse = await testHelpers.promisifyCall('CreateUser', receiverUserData);
    });

    afterAll(async () => {
        testHelpers.close();
    });

    describe('Successful Money Transfer', () => {
        test('should transfer money successfully', async () => {

            const {userResponse} = await testHelpers.createUserWithDeposit(null, 1000);


            // TODO: Use a new function to create both sender and receiver data to simplify tests
            // Create sender user with same currency as receiver
            const senderUserData = testHelpers.generateUserData({
                account_currency: receiverResponse.data.account_currency
            });
            const senderResponse = await testHelpers.promisifyCall('CreateUser', senderUserData);

            // Make a deposit to sender account
            const depositAmount = Number(faker.finance.amount());
            const depositRequest = {
                money: {
                    amount: depositAmount,
                    currency_code: senderResponse.data.account_currency
                },
                account_id: senderResponse.data.account.account_id,
                value_date: new Date().toLocaleDateString('en-GB'),
                description: "Test deposit"
            };
            await testHelpers.promisifyCall('Deposit', depositRequest);

            // Get sender's balance before transfer
            const getBalanceRequest = {
                account_id: senderResponse.data.account.account_id,
            };
            const getBalanceResponse = await testHelpers.promisifyCall('GetBalance', getBalanceRequest);

            // Generate transfer amount that's less than available balance
            let amountToBeSent = Number(faker.finance.amount());
            while (amountToBeSent > getBalanceResponse.account_balance.amount) {
                amountToBeSent = Number(faker.finance.amount());
            }

            const sendMoneyRequest = {
                sender_account_id: senderResponse.data.account.account_id,
                receiver_account_id: receiverResponse.data.account.account_id,
                money: {
                    amount: amountToBeSent,
                    currency_code: senderResponse.data.account_currency,
                },
                description: "Test transfer"
            };

            const sendMoneyResponse = await testHelpers.promisifyCall('SendMoney', sendMoneyRequest);

            const expectedReceiverBalance = receiverResponse.data.account.account_balance.amount + amountToBeSent;
            const expectedSenderBalance = getBalanceResponse.account_balance.amount - amountToBeSent;

            expect(sendMoneyResponse.error).toBe("");
            expect(sendMoneyResponse.data).toBeDefined();
            expect(sendMoneyResponse.data.transaction_id).toBeDefined();
            expect(sendMoneyResponse.data.sender_new_balance.amount).toBe(Number(expectedSenderBalance));
            expect(sendMoneyResponse.data.receiver_new_balance.amount).toBe(Number(expectedReceiverBalance));
        });
    });

    describe('Money Transfer Validation', () => {
        test('should reject transfer with insufficient balance', async () => {
            // Create sender user with same currency as receiver
            const senderUserData = testHelpers.generateUserData({
                account_currency: receiverResponse.data.account_currency
            });
            const senderResponse = await testHelpers.promisifyCall('CreateUser', senderUserData);

            // Make a deposit to sender account
            const depositAmount = Number(faker.finance.amount());
            const depositRequest = {
                money: {
                    amount: depositAmount,
                    currency_code: senderResponse.data.account_currency
                },
                account_id: senderResponse.data.account.account_id,
                value_date: new Date().toLocaleDateString('en-GB'),
                description: "Test deposit"
            };
            const depositResponse = await testHelpers.promisifyCall('Deposit', depositRequest);

            // Generate transfer amount that's more than available balance
            let amountToBeSent = Number(faker.finance.amount());
            while (amountToBeSent <= depositResponse.data.account_balance.amount) {
                amountToBeSent = Number(faker.finance.amount()) + depositResponse.data.account_balance.amount;
            }

            const sendMoneyRequest = {
                sender_account_id: senderResponse.data.account.account_id,
                receiver_account_id: receiverResponse.data.account.account_id,
                money: {
                    amount: amountToBeSent,
                    currency_code: senderResponse.data.account_currency,
                },
                description: "Test transfer"
            };

            const sendMoneyResponse = await testHelpers.promisifyCall('SendMoney', sendMoneyRequest);

            expect(sendMoneyResponse.error).toBe("Insufficient balance in sender account");
            expect(sendMoneyResponse.data).toBeNull();
        });

        test('should reject transfer to non-existent receiver', async () => {
            // Create sender user
            const senderUserData = testHelpers.generateUserData();
            const senderResponse = await testHelpers.promisifyCall('CreateUser', senderUserData);

            // Make a deposit to sender account
            const depositRequest = {
                money: {
                    amount: Number(faker.finance.amount()),
                    currency_code: senderResponse.data.account_currency
                },
                account_id: senderResponse.data.account.account_id,
                value_date: new Date().toLocaleDateString('en-GB'),
                description: "Test deposit"
            };
            await testHelpers.promisifyCall('Deposit', depositRequest);

            const sendMoneyRequest = {
                sender_account_id: senderResponse.data.account.account_id,
                receiver_account_id: 99999999, // Non-existent AccountId
                money: {
                    amount: Number(faker.finance.amount()),
                    currency_code: senderResponse.data.account_currency,
                },
                description: "Test transfer"
            };

            const sendMoneyResponse = await testHelpers.promisifyCall('SendMoney', sendMoneyRequest);

            expect(sendMoneyResponse.error).toBe("Receiver account not found");
            expect(sendMoneyResponse.data).toBeNull();
        });

        test('should reject transfer from non-existent sender', async () => {
            const sendMoneyRequest = {
                sender_account_id: 99999999, // Non-existent AccountId
                receiver_account_id: receiverResponse.data.account.account_id,
                money: {
                    amount: Number(faker.finance.amount()),
                    currency_code: receiverResponse.data.account_currency,
                },
                description: "Test transfer"
            };

            const sendMoneyResponse = await testHelpers.promisifyCall('SendMoney', sendMoneyRequest);

            expect(sendMoneyResponse.error).toBe("Sender account not found");
            expect(sendMoneyResponse.data).toBeNull();
        });
    });
});