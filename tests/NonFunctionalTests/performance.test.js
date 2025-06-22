const TestHelpers = require('../../utils/testHelper');
const {performance} = require('perf_hooks');
const {faker} = require('@faker-js/faker');
const PERFORMANCE_THRESHOLDS = require("../../data/performanceThresholds");

describe('Banking gRPC Service - Performance Tests', () => {
    let testHelpers;

    beforeAll(async () => {
        testHelpers = new TestHelpers();
        await testHelpers.initialize();
    });

    afterAll(async () => {
        testHelpers.close();
    });

    describe('Response Time Tests', () => {
        test('CreateUser should respond within acceptable time', async () => {
            const userData = testHelpers.generateUserData();

            const startTime = performance.now();
            const response = await testHelpers.promisifyCall('CreateUser', userData);
            const endTime = performance.now();

            const responseTime = endTime - startTime;

            expect(response.error).toBe("");
            expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CREATE_USER);
            console.log(`CreateUser response time: ${responseTime.toFixed(2)}ms`);
        });

        test('Deposit should respond within acceptable time', async () => {
            const userResponse = await testHelpers.createUser();
            const depositRequest = testHelpers.generateDepositRequest(
                userResponse.data.account.account_id,
                userResponse.data.account_currency,
                100
            );

            const startTime = performance.now();
            const response = await testHelpers.promisifyCall('Deposit', depositRequest);
            const endTime = performance.now();

            const responseTime = endTime - startTime;

            expect(response.error).toBe("");
            expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.DEPOSIT);
            console.log(`Deposit response time: ${responseTime.toFixed(2)}ms`);
        });

        test('GetBalance should respond within acceptable time', async () => {
            const {userResponse} = await testHelpers.createUserWithDeposit();

            const startTime = performance.now();
            const response = await testHelpers.promisifyCall('GetBalance', {
                account_id: userResponse.data.account.account_id
            });
            const endTime = performance.now();

            const responseTime = endTime - startTime;

            expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.GET_BALANCE);
            console.log(`GetBalance response time: ${responseTime.toFixed(2)}ms`);
        });

        test('Send Money should respond within acceptable time', async () => {
            // Create a receiver user
            const receiverUserData = testHelpers.generateUserData();
            receiverResponse = await testHelpers.promisifyCall('CreateUser', receiverUserData);

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

            const startTime = performance.now();
            const sendMoneyResponse = await testHelpers.promisifyCall('SendMoney', sendMoneyRequest);
            const endTime = performance.now();

            const responseTime = endTime - startTime;

            expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.SEND_MONEY);
            console.log(`Send Balance response time: ${responseTime.toFixed(2)}ms`);
        })

        test('Withdraw should respond within acceptable time', async () => {
            //Create a user account
            depositAmount = 500;
            const result = await testHelpers.createUserWithDeposit(null, depositAmount);
            userWithDeposit = result.userResponse;

            const withdrawAmount = 200;
            const withdrawRequest = testHelpers.generateWithdrawRequest(
                userWithDeposit.data.account.account_id,
                userWithDeposit.data.account_currency,
                withdrawAmount
            );

            const startTime = performance.now();
            const response = await testHelpers.promisifyCall('Withdraw', withdrawRequest);
            const endTime = performance.now();

            const responseTime = endTime - startTime;

            expect(responseTime).toBeLessThan(PERFORMANCE_THRESHOLDS.WITHDRAW);
            console.log(`Send Balance response time: ${responseTime.toFixed(2)}ms`);
        })
    });

    describe('Load Testing', () => {
        test('should handle concurrent user creation', async () => {
            const concurrentUsers = 10;
            const promises = [];

            const startTime = performance.now();

            for (let i = 0; i < concurrentUsers; i++) {
                const userData = testHelpers.generateUserData();
                promises.push(testHelpers.promisifyCall('CreateUser', userData));
            }

            const responses = await Promise.all(promises);
            const endTime = performance.now();

            const totalTime = endTime - startTime;
            const averageTime = totalTime / concurrentUsers;

            responses.forEach(response => {
                expect(response.error).toBe("");
            });

            expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.CREATE_USER * 2);
            console.log(`Concurrent user creation - Total: ${totalTime.toFixed(2)}ms, Average: ${averageTime.toFixed(2)}ms`);
        });

        test('should handle concurrent deposits to same account', async () => {
            const userResponse = await testHelpers.createUser();
            const concurrentDeposits = 10;
            const depositAmount = 100;
            const promises = [];

            for (let i = 0; i < concurrentDeposits; i++) {
                const depositRequest = testHelpers.generateDepositRequest(
                    userResponse.data.account.account_id,
                    userResponse.data.account_currency,
                    depositAmount
                );
                promises.push(testHelpers.promisifyCall('Deposit', depositRequest));
            }

            const responses = await Promise.all(promises);

            responses.forEach(response => {
                expect(response.error).toBe("");
            });

            // Verify final balance
            const balanceResponse = await testHelpers.promisifyCall('GetBalance', {
                account_id: userResponse.data.account.account_id
            });

            expect(balanceResponse.account_balance.amount).toBe(depositAmount * concurrentDeposits);
        });

        test('should handle high volume of balance inquiries', async () => {
            const {userResponse} = await testHelpers.createUserWithDeposit();
            const inquiryCount = 50;
            const promises = [];

            const startTime = performance.now();

            for (let i = 0; i < inquiryCount; i++) {
                promises.push(testHelpers.promisifyCall('GetBalance', {
                    account_id: userResponse.data.account.account_id
                }));
            }

            const responses = await Promise.all(promises);
            const endTime = performance.now();

            const totalTime = endTime - startTime;
            const averageTime = totalTime / inquiryCount;

            responses.forEach(response => {
                expect(response.error).toBe("");
            });

            expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.GET_BALANCE);
            console.log(`High volume balance inquiries - Average: ${averageTime.toFixed(2)}ms`);
        });

        test('should handle high volume of withdraw inquiries', async () => {
            const {userResponse} = await testHelpers.createUserWithDeposit(null, 1000);
            const withdrawCount = 80
            const withdrawAmount = 10
            const promises = [];
            const withdrawRequest = testHelpers.generateWithdrawRequest(userResponse.data.account.account_id, userResponse.data.account_currency, withdrawAmount);

            const startTime = performance.now();

            for (let i = 0; i < withdrawCount; i++) {
                promises.push(testHelpers.promisifyCall('withdraw', withdrawRequest, {
                    account_id: userResponse.data.account.account_id
                }));
            }

            const responses = await Promise.all(promises);
            const endTime = performance.now();

            const totalTime = endTime - startTime;
            const averageTime = totalTime / withdrawCount;

            responses.forEach(response => {
                expect(response.error).toBe("");
            });

            expect(averageTime).toBeLessThan(PERFORMANCE_THRESHOLDS.WITHDRAW);
            console.log(`High volume balance inquiries - Average: ${averageTime.toFixed(2)}ms`);
        })

    })
})
