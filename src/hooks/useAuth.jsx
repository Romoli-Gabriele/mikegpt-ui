import { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  fetchUserAttributes,
  autoSignIn,
  signIn,
  signUp,
  signOut,
  resetPassword,
  confirmResetPassword,
  fetchAuthSession,
} from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { lambdaClient, apiClient } from "../services/ApiService.jsx";
import AuthService from "../services/AuthService.jsx";
import { store } from "../store/index.jsx";
import { clearStore } from "../store/utils.jsx";

export const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children, userData }) => {
  const [user, setUser] = useState(userData);
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  const login = async (username, password) => {
    try {
      clearStore();
      const _user = await signIn({ username, password });
      const _session = await fetchAuthSession();

      // lambdaClient.defaults.headers.Authorization = `Bearer ${token}`;
      if (_user.nextStep.signInStep === "DONE") {
        const token = _session.tokens.idToken;
        lambdaClient.defaults.headers.Authorization = `Bearer ${token}`;
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        const attributes = await fetchUserAttributes();
        // const userData = await AuthService.getUserData();
        const userData = {
          ..._user,
          ...attributes,
        };

        setUser(userData);
        return {
          success: true,
          response: _user,
          user: userData,
        };
      } else {
        console.log(_user);
        return {
          success: false,
          response: _user,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const fetchUserData = async () => {
    const res = await AuthService.getUserData();
    setUser({
      ...user,
      data: res.data.user,
    });
  };

  // call this function to sign out logged in user
  const logout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.log("error signing out: ", error);
    }
    setUser(null);
    navigate("/", { replace: true });
    clearStore();
  };

  const forgotPassword = async (username) => {
    try {
      const res = await resetPassword({ username });

      return {
        success: true,
        response: res,
      };
    } catch (error) {
      console.log("error forgot password");
      console.log(error);
      return {
        success: false,
        error: error,
      };
    }
  };

  const forgotPasswordSubmit = async (username, code, newPassword) => {
    try {
      const res = await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword,
      });
      console.log("Forgot password submit");
      console.log(res);
      return {
        success: true,
        response: res,
      };
    } catch (error) {
      console.log("error forgot password submit");
      console.log(error);
      return {
        success: false,
        error: error,
      };
    }
  };

  const confirmSignUp = async (username, code) => {
    try {
      const res = await confirmSignUp({ username, code });
      return {
        success: true,
        response: res,
      };
    } catch (error) {
      return {
        success: false,
        error: error,
      };
    }
  };

  const register = async (email, password, first_name, last_name) => {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            given_name: first_name,
            family_name: last_name,
          },
          // optional
          autoSignIn: true, // or SignInOptions e.g { authFlowType: "USER_SRP_AUTH" }
        },
      });

      if (isSignUpComplete) {
        await autoSignIn();
        clearStore();

        const _session = await fetchAuthSession();

        const token = _session.tokens.idToken;
        lambdaClient.defaults.headers.Authorization = `Bearer ${token}`;
        apiClient.defaults.headers.Authorization = `Bearer ${token}`;
        const attributes = await fetchUserAttributes();

        const userData = {
          userId,
          ...attributes,
        };

        setUser(userData);
      }

      return {
        success: isSignUpComplete,
        nextStep,
        user: userData,
      };
    } catch (error) {
      console.log("error signing up:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // const completeNewPassword = async (user, password) => {
  //     try {
  //         await completeNewPassword(user, password);
  //     } catch (error) {
  //         console.log('error completing new password', error);
  //         return {
  //             success: false,
  //             error: error.message,
  //         }
  //     }
  // }

  const value = useMemo(
    () => ({
      user,
      register,
      confirmSignUp,
      login,
      fetchUserData,
      logout,
      // completeNewPassword,
      forgotPassword,
      forgotPasswordSubmit,
    }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.any,
  userData: PropTypes.any,
};
