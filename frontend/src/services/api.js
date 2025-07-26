import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:5000';

export const submitPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/payments`, paymentData);
        return response.data;
    } catch (error) {
        throw new Error('Error submitting payment: ' + error.message);
    }
};

export const getPaymentStatus = async (paymentId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`);
        return response.data;
    } catch (error) {
        throw new Error('Error retrieving payment status: ' + error.message);
    }
};