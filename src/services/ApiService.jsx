import axios from "axios";

export const lambdaClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
  },
});

export const apiClient = axios.create({
  baseURL: "https://5if2fz2zbr.eu-central-1.awsapprunner.com",
  headers: {
    Accept: "application/json",
  },
});
