import {fetchAuthSession, fetchUserAttributes, getCurrentUser, signOut} from 'aws-amplify/auth';
import {lambdaClient, apiClient} from "./ApiService.jsx";

const getAuthenticatedUser = async () => {
    try {
        const { username, userId } = await getCurrentUser();
        const _session = await fetchAuthSession();
        const token = _session.tokens.idToken;

        lambdaClient.defaults.headers.Authorization = `Bearer ${token}`;
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        // Get additional user attributes if they exist
        const attributes = await fetchUserAttributes();
        // const userData = await AuthService.getUserData();

        return {
            username,
            userId,
            // data: userData.data.user,
            ...attributes,
        }
    } catch (error) {
        await signOut();
        return null;
    }
};

const getUserData = async () => {
    return lambdaClient.get("/user");
}

const AuthService = {
    getAuthenticatedUser,
    getUserData,
};
export default AuthService;
