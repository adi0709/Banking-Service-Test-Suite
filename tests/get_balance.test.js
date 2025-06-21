const TestHelpers = require('../utils/testHelper');
const { faker } = require('@faker-js/faker');

describe('Banking gRPC Service - GetBalance API Tests', () => {
    let testHelpers;

    beforeAll(async () => {
        testHelpers = new TestHelpers();
        await testHelpers.initialize();
    });

    afterAll(async () => {
        testHelpers.close();
    });

    describe('Successful Balance Retrieval', () => {
        test('should get balance of an account successfully', async () => {
            // Create user
            const userData = testHelpers.generateUserData();
            const userResponse = await testHelpers.promisifyCall('CreateUser', userData);

            // Make a deposit
            const depositRequest = {
                money: {
                    amount: Number(faker.finance.amount()),
                    currency_code: userResponse.data.account_currency
                },
                account_id: userResponse.data.account.account_id,
                value_date: new Date().toLocaleDateString('en-GB'),
                description: "Test deposit"
            };
            const depositResponse = await testHelpers.promisifyCall('Deposit', depositRequest);

            // Get balance
            const getBalanceRequest = {
                account_id: userResponse.data.account.account_id,
            };
            const getBalanceResponse = await testHelpers.promisifyCall('GetBalance', getBalanceRequest);

            const expectedBalance = depositResponse.data.account_balance.amount + userResponse.data.account.account_balance.amount;

            expect(getBalanceResponse.error).toBe("");
            expect(getBalanceResponse.account_balance.amount).toBe(expectedBalance);
        });
    });

    describe('Balance Retrieval Validation', () => {
        test('should reject get balance request with non-existent account ID', async () => {
            const getBalanceRequest = {
                account_id: 93999999,
            };
            const getBalanceResponse = await testHelpers.promisifyCall('GetBalance', getBalanceRequest);

            expect(getBalanceResponse.error).toBe("Account not found");
            expect(getBalanceResponse.account_balance).toBeNull();
        });
    });
});