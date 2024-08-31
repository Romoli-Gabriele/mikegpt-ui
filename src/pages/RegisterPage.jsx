import {Alert, Box, Checkbox, Container, FormControlLabel, Grid, TextField, Typography} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import LoadingButton from "@mui/lab/LoadingButton";
import mike_legal from "../assets/mike_legal.jpg";
import {useState} from "react";
import {useAuth} from "../hooks/useAuth.jsx";

const RegisterPage = () => {

    const {register} = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        setLoading(true);
        setError(null);
        event.preventDefault();
        const res = await register(email, password, firstName, lastName);
        setLoading(false);
        if (!res.success) {
            setError(res.error);
        } else {
            navigate('/products');
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
            <img src={mike_legal} style={{width: '100%', maxWidth: '14rem'}}/>
            <Typography component="h1" variant="h5" sx={{mt: 4}}>
                Sign up
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{mt: 3}}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            autoComplete="given-name"
                            name="firstName"
                            required
                            fullWidth
                            id="firstName"
                            label="First Name"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            autoFocus
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="lastName"
                            label="Last Name"
                            name="lastName"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            autoComplete="family-name"
                        />
                    </Grid>
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
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            autoComplete="new-password"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            required
                            control={<Checkbox value="allowExtraEmails" color="primary"/>}
                            label={<Typography variant={"p"}>
                                I have read and agree to the <a href={"https://legalgptpublic.s3.eu-central-1.amazonaws.com/TOS.pdf"} target={"_blank"} rel="noreferrer">Terms of Service</a> and <a href={"https://legalgptpublic.s3.eu-central-1.amazonaws.com/PrivacyNotice.pdf"} target={"_blank"} rel="noreferrer">Privacy Notice</a>.
                            </Typography>}
                        />
                    </Grid>
                </Grid>
                <LoadingButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{mt: 3, mb: 2}}
                    loading={loading}
                >
                    Sign Up
                </LoadingButton>
                {error && <Alert severity="error">{error}</Alert>}
                <Grid container justifyContent="flex-end">
                    <Grid item>
                        <Link to={"/login"} variant="body2">
                            Already have an account? Sign in
                        </Link>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    </Container>
}

export default RegisterPage;
