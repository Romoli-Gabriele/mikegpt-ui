import {
  createBrowserRouter,
  createRoutesFromElements,
  defer,
  Route,
} from "react-router-dom";
import { AuthLayout } from "./components/AuthLayout.jsx";
import { ProtectedLayout } from "./components/ProtectedLayout.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AuthService from "./services/AuthService.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports.jsx";
import UploadDocumentPage from "./pages/UploadDocumentPage.jsx";
import ProductListView from "./components/ProductListView.jsx";
import { store } from "./store/index.jsx";

Amplify.configure({
  Auth: {
    Cognito: {
      //  Amazon Cognito User Pool ID
      userPoolId: awsExports.USER_POOL_ID,
      // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
      userPoolClientId: awsExports.USER_POOL_APP_CLIENT_ID,
      // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
      // identityPoolId: 'XX-XXXX-X:XXXXXXXX-XXXX-1234-abcd-1234567890ab',
      // OPTIONAL - This is used when autoSignIn is enabled for Auth.signUp
      // 'code' is used for Auth.confirmSignUp, 'link' is used for email link verification
      signUpVerificationMethod: "code", // 'code' | 'link'
    },
  },
});

const getUserData = () =>
  new Promise((resolve, reject) => {
    try {
      AuthService.getAuthenticatedUser().then((user) => {
        // Carica le workspace salvate in memoria
        store.getActions().chat.loadCurrentWorkspaceId();

        resolve(user);
      });
    } catch (error) {
      reject(error);
    }
  });

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      element={<AuthLayout />}
      loader={() => defer({ userPromise: getUserData() })}
    >
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      {/*<Route path="/new-password" element={<NewPasswordPage />} />*/}
      {/*<Route path="/forgot-password" element={<ForgotPasswordPage />} />*/}
      {/*<Route path="/reset-password" element={<ResetPasswordPage />} />*/}
      <Route path="/products" element={<ProductListView />} />
      <Route path="/" element={<ProtectedLayout />}>
        <Route path="" element={<ChatPage />} />
        {/*<Route path="upload" element={<UploadDocumentPage />} />*/}
      </Route>
    </Route>
  )
);
