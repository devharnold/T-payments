import axios from 'axios';

// fetch all user details from the flask service
export const fetchUserDetails = async(user_id) => {
    try {
        const response = await axios.get(`${process.env.FLASK_SERVICE_URL}/api/users/${user_id}`, {
            headers: { Authorization: `Bearer ${process.env.FLASK_API_KEY}` },
        });
        return response.data;
    } catch(error) {
        console.error('Error fetching User details:', error);
        throw new Error('Unable to fetch user details');
    }
};

// fetch all account details from the flask service
export const fetchAccountDetails = async(account_id) => {
    try {
        const response = await axios.get(`${process.env.FLASK_SERVICE_URL}/api/accounts/${account_id}`, {
            headers: { Authorization: `Bearer ${process.env.FLASK_API_KEY}`},
        });
        return response.data;
    } catch(error) {
        console.error('Error fetching Account details:', error);
        throw new Error('Unable to fetch Account details');
    }
};

// fetch all transaction details from the flask service
export const fetchTransactionDetails = async(user_id) => {
    try {
        const response = await axios.get(`${process.env.FLASK_SERVICE_URL}/api/transactions/${user_id}`, {
            headers: { Authorization: `Bearer ${process.env.FLASK_API_KEY}`},
        });
        return response.data;
    } catch(error) {
        console.error('Error fetching Transaction details:', error);
        throw new Error('Unable to fetch Transaction details');
    }
};

// fetch cashwallet details from the flask service
export const fetchCashWalletDetails = async(cashwallet_id) => {
    try {
        const response = await axios.get(`${process.env.FLASK_SERVICE_URL}/api/cashwallets/${cashwallet_id}`, {
            headers: { Authorization: `Bearer ${process.env.FLASK_API_KEY}`},
        });
        return response.data;
    } catch(error) {
        console.error('Error fetching Cashwallet details:', error);
        throw new Error('Unable to fetch Cashwallet details');
    }
}