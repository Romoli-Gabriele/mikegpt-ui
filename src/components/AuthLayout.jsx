import { Suspense } from "react";
import { useLoaderData, useOutlet, Await, useLocation } from "react-router-dom";
import { LinearProgress, Stack } from "@mui/material";
import { AuthProvider } from "../hooks/useAuth.jsx";
import { ExtendedFooter, MinimizedFooter } from "./Footer.jsx";

export const AuthLayout = () => {
  const outlet = useOutlet();
  const location = useLocation();
  const { userPromise } = useLoaderData();

  const isChatScreen = location.pathname === "/";

  return (
    <Suspense fallback={<LinearProgress />}>
      <Await resolve={userPromise}>
        {(user) => (
          <AuthProvider userData={user}>
            <Stack direction={"column"} sx={{ height: "100%" }}>
              <div style={{ flexGrow: 1 }}>{outlet}</div>
              {isChatScreen ? null : <ExtendedFooter />}
            </Stack>
          </AuthProvider>
        )}
      </Await>
    </Suspense>
  );
};
