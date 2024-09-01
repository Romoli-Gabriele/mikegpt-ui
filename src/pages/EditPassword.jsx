import { Alert, Box, Container, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import mike_legal from "../assets/mike_legal.jpg";
import { useState } from "react";
import { useSnackbar } from "notistack";

const EditPasswordPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [prevPassword, setPrevPassword] = useState("");
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (event) => {
    // event.preventDefault();
    // setLoading(true);
    // setError(null);
    // const res = await login(email, password);
    // setLoading(false);
    // if (!res.success) {
    //   setError(res.error);
    // } else {
    //   navigate("/");
    // }

    event.preventDefault();

    if (true) {
      setError("Something went wrong: maybe the current password is wrong");
    } else {
      enqueueSnackbar("Password updated", { variant: "success" });
      navigate("/");
    }
  };

  return (
    <Container
      maxWidth={"xs"}
      sx={{
        height: "100%",
        alignItems: "center",
        alignContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img src={mike_legal} style={{ width: "100%", maxWidth: "12rem" }} />
        <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
          Edit Password
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Vecchia Password"
            type="password"
            autoComplete="current-password"
            value={prevPassword}
            onChange={(event) => setPrevPassword(event.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Nuova Password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />

          <LoadingButton
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            loading={loading}
          >
            Update
          </LoadingButton>
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </Box>
    </Container>
  );
};

export default EditPasswordPage;
