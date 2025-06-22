const ErrorMessages = {
    MISSING_FIELDS: 'Please provide all the mandatory fields!',
    USER_EXISTS: 'User with this email or ID number already exists',
    ACCOUNT_NOT_FOUND: 'Account not found',
    SENDER_NOT_FOUND: 'Sender account not found',
    RECEIVER_NOT_FOUND: 'Receiver account not found',
    INVALID_DEPOSIT_AMOUNT: 'Deposit amount must be greater than 0',
    INVALID_WITHDRAWAL_AMOUNT: 'Withdrawal amount must be greater than 0',
    INVALID_TRANSFER_AMOUNT: 'Transfer amount must be greater than 0',
    INSUFFICIENT_BALANCE: 'Insufficient balance',
    INSUFFICIENT_SENDER_BALANCE: 'Insufficient balance in sender account',
    CURRENCY_MISMATCH: 'Currency mismatch between account currency and money sent currency'
};

module.exports = {ErrorMessages}