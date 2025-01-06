import axios from 'axios';

// fetch all user details from the flask service
const fetchUserDetails = async(user_id) => {
    try {
        const response = await axios.get(`${process.env.FLASK_SERVICE_URL}/api/users/${user_id}`, {
            headers: { Authorization: `Bearer ${process.env.FLASK_API_KEY}` },
        });
        return response.data;
    } catch(error) {
        console.error('Error fetching user details:', error);
        throw new Error('Unable to fetch user details');
    }
};

// fetch all account details from the flask service
const fetchAccountDetails = async(account_id) => {
    try {
        const response = await axios.get(`${process.env.FLASK_SERVICE_URL}/api/accounts/${account_id}`, {
            headers: { Authorization: `Bearer ${process.env.FLASK_API_KEY}`},
        });
        return response.data;
    } catch(error) {
        console.error('Error fetching user details:', error);
        throw new Error('Unable to fetch user details');
    }
};

// fetch all cashwallet details from the flask service
const fetchCashwalletDetails = async(cashwallet_id) => {
    try {
        const response = await axios.get(`${process.env.FLASK_SERVICE_URL}/api/cashwallets/${cashwallet_id}`, {
            headers: { Authorization: `Bearer ${process.env.FLASK_API_KEY}`},
        });
        return response.data;
    } catch(error) {
        console.error('Error fetching user details: ', error);
        throw new Error('Unable to fetch user details');
    }
};

export default {
    fetchUserDetails,
    fetchAccountDetails,
    fetchCashwalletDetails
};