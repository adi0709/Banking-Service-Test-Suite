const TestHelpers = require('../../utils/testHelper');

describe('Banking gRPC Service - CreateUser API Tests', () => {
    let testHelpers;

    beforeAll(async () => {
        testHelpers = new TestHelpers();
        await testHelpers.initialize();
    });

    afterAll(async () => {
        testHelpers.close();
    });

    describe('Successful User Creation', () => {
        test('should create a new user successfully', async () => {
            const userData = testHelpers.generateUserData();
            const response = await testHelpers.promisifyCall('CreateUser', userData);

            expect(response.error).toBe("");
            expect(response.data).toBeDefined();
            expect(response.data.person_id).toBeDefined();

            // Verify all user data is correctly stored
            Object.keys(userData).forEach(key => {
                expect(response.data[key]).toBe(userData[key]);
            });

            // Verify account creation
            expect(response.data.account.account_balance.amount).toBe(0);
            expect(response.data.account.account_balance.currency_code).toBe(userData.account_currency);
            expect(response.data.account.account_id).toBeDefined();
        });
    });

    describe('Duplicate User Validation', () => {
        test('should reject user with existing email', async () => {
            const userData = testHelpers.generateUserData();

            // Create first user
            await testHelpers.promisifyCall('CreateUser', userData);

            // Try to create second user with same email
            const duplicateEmailData = testHelpers.generateUserData({ email: userData.email });
            const response = await testHelpers.promisifyCall('CreateUser', duplicateEmailData);

            expect(response.error).toBe("User with this email or ID number already exists");
            expect(response.data).toBeNull();
        });

        test('should reject user with existing ID number', async () => {
            const userData = testHelpers.generateUserData();

            // Create first user
            await testHelpers.promisifyCall('CreateUser', userData);

            // Try to create second user with same ID number
            const duplicateIdData = testHelpers.generateUserData({ id_number: userData.id_number });
            const response = await testHelpers.promisifyCall('CreateUser', duplicateIdData);

            expect(response.error).toBe("User with this email or ID number already exists");
            expect(response.data).toBeNull();
        });
    });

    describe('Field Validation', () => {
        test('should reject user with missing required fields', async () => {
            const incompleteData = testHelpers.generateIncompleteUserData();
            const response = await testHelpers.promisifyCall('CreateUser', incompleteData);

            expect(response.error).toBe("Please provide all the mandatory fields!");
            expect(response.data).toBeNull();
        });

        test('should reject user with empty fields', async () => {
            const emptyData = testHelpers.generateEmptyUserData();
            const response = await testHelpers.promisifyCall('CreateUser', emptyData);

            expect(response.error).toBe("Please provide all the mandatory fields!");
            expect(response.data).toBeNull();
        });

        test.each([
            ['first_name'],
            ['last_name'],
            ['email'],
            ['phone_number'],
            ['id_number'],
            ['account_currency']
        ])('should reject user missing %s field', async (missingField) => {
            const userData = testHelpers.generateUserData();
            delete userData[missingField];

            const response = await testHelpers.promisifyCall('CreateUser', userData);

            expect(response.error).toBe("Please provide all the mandatory fields!");
            expect(response.data).toBeNull();
        });
    });
});