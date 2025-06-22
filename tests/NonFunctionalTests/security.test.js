const TestHelpers = require("../../utils/testHelper");
const {faker} = require('@faker-js/faker');

describe('Banking gRPC Service - Security Tests', () => {
    let testHelpers;

    beforeAll(async () => {
        testHelpers = new TestHelpers();
        await testHelpers.initialize();
    });

    afterAll(async () => {
        testHelpers.close();
    });

    describe('Input Validation Security', () => {
        test('should handle SQL injection attempts in user data', async () => {
            const maliciousData = testHelpers.generateUserData({
                first_name: `'; DROP TABLE users; --`,
                last_name: `Robert'; DROP TABLE accounts; --`,
                email: `${faker.person.firstName()}@${faker.commerce.productName()}.com'; DELETE FROM users; --`
            });

            const response = await testHelpers.promisifyCall('CreateUser', maliciousData);

            if (response.error === "") {
                expect(response.data.first_name).toBe(maliciousData.first_name);
            } else {
                expect(typeof response.error).toBe('string');
            }
        })

        test('should handle XSS attempts in user data', async () => {
            const xssData = testHelpers.generateUserData({
                first_name: `<script>alert('${faker.finance.iban()}')</script>`,
                description: `<img src=x onerror=alert('${faker.finance.iban()}')>`
            });

            const response = await testHelpers.promisifyCall('CreateUser', xssData);

            if (response.error === "") {
                expect(response.data.first_name).toBe(xssData.first_name);
            }
        });

        test('should handle extremely long input strings', async () => {
            const longString = 'A'.repeat(Math.round(Math.random()*10000));
            const userData = testHelpers.generateUserData({
                first_name: longString,
                last_name: longString
            });

            const response = await testHelpers.promisifyCall('CreateUser', userData);

            // Should handle gracefully - either accept or reject with proper error
            expect(typeof response.error).toBe('string');
            console.log(response);
        });

        test('should handle special characters and unicode', async () => {
            const userData = testHelpers.generateUserData({
                first_name: "José María",
                last_name: "王小明",
                email: `test+${faker.person.firstName()}@domain.co.uk`
            });

            const response = await testHelpers.promisifyCall('CreateUser', userData);

            if (response.error === "") {
                expect(response.data.first_name).toBe(userData.first_name);
                expect(response.data.last_name).toBe(userData.last_name);
            }
        });
    })
})