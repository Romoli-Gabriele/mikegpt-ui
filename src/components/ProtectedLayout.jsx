import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Box, Stack, Toolbar, useTheme } from "@mui/material";
import legalgpt_logo from "../assets/legalgpt_logo.png";
import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import AppDrawer from "./Drawer";

export const ProtectedLayout = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      fetchAdmin().then();
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const fetchAdmin = async () => {
    const session = await fetchAuthSession();
    if (
      session.tokens.idToken.payload &&
      session.tokens.idToken.payload["cognito:groups"]
    ) {
      const groups = session.tokens.idToken.payload["cognito:groups"];
      if (groups.includes("admin")) {
        setAdmin(true);
      }
    }
  };

  return (
      <>
          {/** DRAWER */}<AppDrawer />
    <Box sx={{ display: "flex", minHeight: "100%" }}>

      {/** APP */}
      <Box
        component="main"
        display="flex"
        flexDirection="column"
        sx={{
          flexGrow: 1,
          width: "100%",
          height: "100vh",
          background: "var(--background-highlight-color)",
        }}
      >
        {/** HEADER CON LOGO */}
        <Toolbar variant="dense">
          <Stack sx={{ flexGrow: 1, pt: 3 }} alignItems={"end"}>
            <Box component={Link} to={"/"}>
              <img src={legalgpt_logo} style={{ width: "10rem" }} />
            </Box>
          </Stack>
        </Toolbar>
        {/** CONTENUTO PAGINA */}
        <Outlet sx={{maxHeight: "70%", overflowY: "auto"}} />
      </Box>
    </Box>
</>
  );
};
