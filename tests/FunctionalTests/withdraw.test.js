const TestHelpers = require('../../utils/testHelper');

describe('Banking gRPC Service - Withdraw API Tests', () => {
    let testHelpers;
    let userWithDeposit;
    let depositAmount;

    beforeAll(async () => {
        testHelpers = new TestHelpers();
        await testHelpers.initialize();
    });

    beforeEach(async () => {
        depositAmount = 500; // Fixed amount for predictable testing
        const result = await testHelpers.createUserWithDeposit(null, depositAmount);
        userWithDeposit = result.userResponse;
    });

    afterAll(async () => {
        testHelpers.close();
    });

    describe('Successful Withdrawals', () => {
        test('should withdraw money successfully', async () => {
            const withdrawAmount = 200;
            const withdrawRequest = testHelpers.generateWithdrawRequest(
                userWithDeposit.data.account.account_id,
                userWithDeposit.data.account_currency,
                withdrawAmount
            );

            const response = await testHelpers.promisifyCall('Withdraw', withdrawRequest);
            const expectedBalance = depositAmount - withdrawAmount;

            expect(response.error).toBe("");
            expect(response.data).toBeDefined();
            expect(response.data.transaction_id).toBeDefined();
            expect(response.data.account_balance.amount).toBe(expectedBalance);
            expect(response.data.description).toBe(withdrawRequest.withdrawal_summary);
        });

        test('should withdraw entire balance successfully', async () => {
            const withdrawRequest = testHelpers.generateWithdrawRequest(
                userWithDeposit.data.account.account_id,
                userWithDeposit.data.account_currency,
                depositAmount
            );

            const response = await testHelpers.promisifyCall('Withdraw', withdrawRequest);

            expect(response.error).toBe("");
            expect(response.data.account_balance.amount).toBe(0);
        });
    });

    describe('Withdrawal Validation', () => {
        test('should reject withdrawal exceeding balance', async () => {
            const excessiveAmount = depositAmount + 100;
            const withdrawRequest = testHelpers.generateWithdrawRequest(
                userWithDeposit.data.account.account_id,
                userWithDeposit.data.account_currency,
                excessiveAmount
            );

            const response = await testHelpers.promisifyCall('Withdraw', withdrawRequest);

            expect(response.error).toBe("Insufficient balance");
            expect(response.data).toBeNull();
        });

        test('should reject negative withdrawal amount', async () => {
            const withdrawRequest = testHelpers.generateWithdrawRequest(
                userWithDeposit.data.account.account_id,
                userWithDeposit.data.account_currency,
                -100
            );

            const response = await testHelpers.promisifyCall('Withdraw', withdrawRequest);

            expect(response.error).toBe("Withdrawal amount must be greater than 0");
            expect(response.data).toBeNull();
        });

        test('should reject zero withdrawal amount', async () => {
            const withdrawRequest = testHelpers.generateWithdrawRequest(
                userWithDeposit.data.account.account_id,
                userWithDeposit.data.account_currency,
                0
            );

            const response = await testHelpers.promisifyCall('Withdraw', withdrawRequest);
            expect(response.error).toBe("Withdrawal amount must be greater than 0");
            expect(response.data).toBeNull();
        });
    });
});