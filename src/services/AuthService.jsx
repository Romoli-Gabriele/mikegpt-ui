import {
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signOut,
} from "aws-amplify/auth";
import { lambdaClient, apiClient } from "./ApiService.jsx";

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
    };
  } catch (error) {
    await signOut();
    return null;
  }
};

const getUserData = async () => {
  return lambdaClient.get("/user");
};

const changePassword = async (oldPassword, newPassword) => {
  try {
    const session = await fetchAuthSession();
    const accessToken = session.tokens.accessToken.toString();

    const res = await apiClient.post("/change_password", {
      accessToken: accessToken,
      previousPassword: oldPassword,
      proposedPassword: newPassword,
    });

    return res.status === 200;
  } catch (error) {
    console.error("change password", error);
    return false;
  }
};

const AuthService = {
  getAuthenticatedUser,
  changePassword,
  getUserData,
};
export default AuthService;
