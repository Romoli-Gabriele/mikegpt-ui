import {Suspense} from "react";
import {useLoaderData, useOutlet, Await} from "react-router-dom";
import {Box, LinearProgress, Stack, Typography} from "@mui/material";
import {AuthProvider} from "../hooks/useAuth.jsx";
import legalgpt from "../assets/legalgpt_logo.jpg";

export const AuthLayout = () => {
    const outlet = useOutlet();

    const {userPromise} = useLoaderData();

    return (
        <Suspense fallback={<LinearProgress/>}>
            <Await
                resolve={userPromise}
            >
                {(user) => (
                    <AuthProvider userData={user}>
                        <Stack direction={"column"} sx={{height: '100%'}}>
                            <div style={{flexGrow: 1}}>
                                {outlet}
                            </div>
                            <Box sx={{
                                width: '100%', px: 2, mt: 8
                            }}>
                                <Stack direction={"column"} alignItems={"center"}>
                                    <Box sx={{width: '10rem', pb: 2}}>
                                        <img style={{width: '100%', height: 'auto'}} src={legalgpt} alt={"LegalGPT"}/>
                                    </Box>
                                    <Typography variant={"caption"} component={"p"} color={"textSecondary"} textAlign={"center"} sx={{width: '100%', pb: 2}}>
                                        ThinkLegal S.r.l., Via Modigliani 7, 10137 Torino, P. Iva 01239070079, numero REA TO – 1278996, info@thinklegal.it,
                                        thinklegal@pec.it
                                    </Typography>
                                    <Typography variant={"caption"} component={"p"} color={"textSecondary"} textAlign={"center"} sx={{width: '100%', pb: 2}}>
                                        <a href={"https://legalgptpublic.s3.eu-central-1.amazonaws.com/PrivacyNotice.pdf"} target={"_blank"} rel="noreferrer">Privacy
                                            Notice</a> - <a href={"https://legalgptpublic.s3.eu-central-1.amazonaws.com/CookiePolicy.pdf"} target={"_blank"}
                                                            rel="noreferrer">Cookie Policy</a> - <a
                                        href={"https://legalgptpublic.s3.eu-central-1.amazonaws.com/TOS.pdf"} target={"_blank"} rel="noreferrer">ToS</a>
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </AuthProvider>
                )}
            </Await>
        </Suspense>
    );
};
