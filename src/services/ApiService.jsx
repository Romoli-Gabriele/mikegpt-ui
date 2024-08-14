import axios from "axios";

export const lambdaClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        Accept: 'application/json',
    }
});

export const apiClient = axios.create({
    baseURL: 'https://n33ccvwzph.eu-central-1.awsapprunner.com',
    headers: {
        Accept: 'application/json',
    }
});
