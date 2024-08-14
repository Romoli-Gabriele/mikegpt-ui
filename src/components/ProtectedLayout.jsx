import {Link, Navigate, Outlet} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";
import {
    AppBar as MuiAppBar,
    Box,
    IconButton,
    Stack, styled,
    Toolbar, Typography, useMediaQuery, useTheme,
} from "@mui/material";
import {Logout} from "@mui/icons-material";
import legalgpt_logo from "../assets/legalgpt_logo.jpg";
import {drawerWidth} from "../config";
import {useEffect, useState} from "react";
import {fetchAuthSession} from "aws-amplify/auth";

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({theme, open}) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

export const ProtectedLayout = () => {
    const {user, logout} = useAuth();

    const theme = useTheme();

    const sm = useMediaQuery(theme.breakpoints.down('sm'));
    const md = useMediaQuery(theme.breakpoints.down('md'));
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAdmin().then();
        }
    }, [user]);

    if (!user) {
        return <Navigate to="/login"/>;
    }

    const fetchAdmin = async () => {
        const session = await fetchAuthSession();
        if (session.tokens.idToken.payload && session.tokens.idToken.payload['cognito:groups']) {
            const groups = session.tokens.idToken.payload['cognito:groups'];
            if (groups.includes('admin')) {
                setAdmin(true);
            }
        }
    }

    const handleSignOut = () => {
        logout().then();
    }

    return (
        <Box sx={{display: 'flex', minHeight: '100%'}}>
            <AppBar
                position="fixed" open={false} sx={{backgroundColor: '#FFF'}}
            >
                <Toolbar>
                    <Stack sx={{flexGrow: 1, pt: 1}}>
                        <Box component={Link} to={"/"}>
                            <img src={legalgpt_logo} style={{width: '10rem'}}/>
                        </Box>
                    </Stack>
                    {user && (
                        <div>
                            <Stack direction={"row"} alignItems={"center"}>
                                {user && admin && <>
                                    <Typography component={Link} to={"/"} variant={md ? "subtitle2" : "subtitle1"} color={"primary"} noWrap sx={{
                                        mr: {sm: 0.5, md: 2},
                                        mb: 0,
                                    }}>
                                        Home
                                    </Typography>
                                    { /* <Typography component={Link} to={"/upload"} variant={md ? "subtitle2" : "subtitle1"} color={"primary"} noWrap sx={{
                                        mr: {sm: 0.5, md: 2},
                                        mb: 0,
                                    }}>
                                        Upload Document
                                    </Typography> */ }
                                </>}
                                <Typography variant={md ? "subtitle2" : "subtitle1"} color={"primary"} noWrap sx={{
                                    mr: {sm: 0.5, md: 2},
                                    mb: 0,
                                }}>
                                    {user.given_name ?? ''} {user.family_name ?? ''}
                                </Typography>
                                {!sm && <IconButton
                                    sx={{ml: 2}}
                                    size="small"
                                    onClick={handleSignOut}
                                    color="primary"
                                >
                                    <Logout/>
                                </IconButton>}
                            </Stack>
                        </div>
                    )}
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                display="flex"
                flexDirection="column"
                sx={{flexGrow: 1, width: {sm: `calc(100% - ${drawerWidth}px)`}}}
            >
                <Toolbar/>
                <Outlet/>
            </Box>
        </Box>
    )
};
