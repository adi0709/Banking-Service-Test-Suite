const TestHelpers = require('../utils/testHelper');
const { faker } = require('@faker-js/faker');

describe('Banking gRPC Service - Deposit API Tests', () => {
    let testHelpers;
    let userResponse;

    beforeAll(async () => {
        testHelpers = new TestHelpers();
        await testHelpers.initialize();
    });

    beforeEach(async () => {
        userResponse = await testHelpers.createUser();
    });

    afterAll(async () => {
        testHelpers.close();
    });

    describe('Successful Deposits', () => {
        test('should create a deposit successfully', async () => {
            const depositAmount = Number(faker.finance.amount());
            const depositRequest = testHelpers.generateDepositRequest(
                userResponse.data.account.account_id,
                userResponse.data.account_currency,
                depositAmount
            );

            const response = await testHelpers.promisifyCall('Deposit', depositRequest);

            expect(response.error).toBe("");
            expect(response.data).toBeDefined();
            expect(response.data.transaction_id).toBeDefined();
            expect(response.data.account_balance.amount).toBe(depositAmount);
            expect(response.data.account_balance.currency_code).toBe(depositRequest.money.currency_code);
            expect(response.data.transaction_summary).toContain(`Deposited ${depositAmount}`);
        });

        test('should handle multiple deposits correctly', async () => {
            const firstDeposit = 100;
            const secondDeposit = 50;

            const firstRequest = testHelpers.generateDepositRequest(
                userResponse.data.account.account_id,
                userResponse.data.account_currency,
                firstDeposit
            );

            const secondRequest = testHelpers.generateDepositRequest(
                userResponse.data.account.account_id,
                userResponse.data.account_currency,
                secondDeposit
            );

            await testHelpers.promisifyCall('Deposit', firstRequest);
            const secondResponse = await testHelpers.promisifyCall('Deposit', secondRequest);

            expect(secondResponse.data.account_balance.amount).toBe(firstDeposit + secondDeposit);
        });
    });

    describe('Deposit Validation', () => {
        test('should reject negative deposit amount', async () => {
            const depositRequest = testHelpers.generateDepositRequest(
                userResponse.data.account.account_id,
                userResponse.data.account_currency,
                -Number(faker.finance.amount())
            );

            const response = await testHelpers.promisifyCall('Deposit', depositRequest);

            expect(response.error).toBe("Deposit amount must be greater than 0");
            expect(response.data).toBeNull();
        });

        test('should reject zero deposit amount', async () => {
            const depositRequest = testHelpers.generateDepositRequest(
                userResponse.data.account.account_id,
                userResponse.data.account_currency,
                0
            );

            const response = await testHelpers.promisifyCall('Deposit', depositRequest);

            expect(response.error).toBe("Deposit amount must be greater than 0");
            expect(response.data).toBeNull();
        });

        test('should reject deposit to non-existent account', async () => {
            const depositRequest = testHelpers.generateDepositRequest(
                999999,
                userResponse.data.account_currency,
                Number(faker.finance.amount())
            );

            const response = await testHelpers.promisifyCall('Deposit', depositRequest);

            expect(response.error).toBe("Account not found");
            expect(response.data).toBeNull();
        });

        test('should reject deposit with currency mismatch', async () => {
            const differentCurrency = testHelpers.getDifferentCurrency(userResponse.data.account_currency);
            const depositRequest = testHelpers.generateDepositRequest(
                userResponse.data.account.account_id,
                differentCurrency,
                Number(faker.finance.amount())
            );

            const response = await testHelpers.promisifyCall('Deposit', depositRequest);

            expect(response.error).toBe("Currency mismatch between account currency and money sent currency");
            expect(response.data).toBeNull();
        });
    });
});