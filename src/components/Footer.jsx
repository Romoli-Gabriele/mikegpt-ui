import { Box, Stack, Typography } from "@mui/material";
import legalgpt from "../assets/legalgpt_logo.png";
import { useAuth } from "../hooks/useAuth";

export const ExtendedFooter = () => {
  return (
    <Box sx={{ width: "100%", px: 2, mt: 8 }}>
      <Stack direction={"column"} alignItems={"center"}>
        <Box sx={{ width: "10rem", pb: 2 }}>
          <img
            style={{ width: "100%", height: "auto" }}
            src={legalgpt}
            alt={"LegalGPT"}
          />
        </Box>
        <Box style={{ width: "100%", mb: 2 }}>
          <FooterCaption />
        </Box>
        <PoliciesLinks showLogoutButton />
      </Stack>
    </Box>
  );
};

export const MinimizedFooter = () => {
  return (
    <Box sx={{ width: "100%", pt: 10 }}>
      <FooterCaption />
    </Box>
  );
};

export const PoliciesLinks = (showLogoutButton = false) => {
  const { user, logout } = useAuth();

  return (
    <Typography
      variant={"caption"}
      component={"p"}
      color={"textSecondary"}
      textAlign={"center"}
      sx={{ width: "100%", pb: 2 }}
    >
      <a
        href={
          "https://legalgptpublic.s3.eu-central-1.amazonaws.com/PrivacyNotice.pdf"
        }
        target={"_blank"}
        rel="noreferrer"
      >
        Privacy Notice
      </a>{" "}
      -{" "}
      <a
        href={
          "https://legalgptpublic.s3.eu-central-1.amazonaws.com/CookiePolicy.pdf"
        }
        target={"_blank"}
        rel="noreferrer"
      >
        Cookie Policy
      </a>{" "}
      -{" "}
      <a
        href={"https://legalgptpublic.s3.eu-central-1.amazonaws.com/TOS.pdf"}
        target={"_blank"}
        rel="noreferrer"
      >
        ToS
      </a>
      {showLogoutButton && user && (
        <>
          {" "}
          -{" "}
          <a onClick={logout} target={"_self"} rel="noreferrer" href="#">
            Logout
          </a>
        </>
      )}
    </Typography>
  );
};

const FooterCaption = () => {
  return (
    <Typography
      variant={"caption"}
      component={"p"}
      color={"textSecondary"}
      textAlign={"center"}
      sx={{ width: "100%" }}
    >
      ThinkLegal S.r.l., Via Modigliani 7, 10137 Torino, P. Iva 01239070079,
      numero REA TO – 1278996, info@thinklegal.it, thinklegal@pec.it
    </Typography>
  );
};
