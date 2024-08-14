import {Alert, Box, Container, Grid, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import mike_legal from "../assets/mike_legal.jpg";
import {useEffect, useState} from "react";
import {useAuth} from "../hooks/useAuth.jsx";

const RegisterPage = () => {

    const navigate = useNavigate();
    const {confirmSignUp} = useAuth();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        setError(null);
        event.preventDefault();
        const res = await confirmSignUp(email, code);
        console.log(res);
        if (!res.success) {
            setError(res.error);
        } else {
            navigate('/');
        }
    }

    return <Container maxWidth={'xs'}>
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <img src={mike_legal} style={{width: '100%', maxWidth: '10rem'}}/>
            <Typography component="h1" variant="h5">
                Confirm Sign Up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{mt: 3}}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            autoComplete="email"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            name="code"
                            label="Code"
                            id="code"
                            value={code}
                            onChange={(event) => setCode(event.target.value)}
                        />
                    </Grid>
                </Grid>
                <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{mt: 3, mb: 2}}
                >
                    Confirm Sign Up
                </LoadingButton>
                {error && <Alert severity="error">{error}</Alert>}
            </Box>
        </Box>
    </Container>
}

export default RegisterPage;
