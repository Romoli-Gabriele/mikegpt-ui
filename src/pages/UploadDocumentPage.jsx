import {Button, Container, Grid, IconButton, Input, Stack, TextField, Typography, useTheme} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {DateField} from '@mui/x-date-pickers/DateField';
import {useEffect, useState} from "react";
import {DesktopDatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {AttachFileRounded, DeleteRounded, UploadFileRounded} from "@mui/icons-material";
import {ConversationService} from "../services/ConversationService.jsx";
import FileService from "../services/FileService.jsx";
import {useAuth} from "../hooks/useAuth.jsx";
import {fetchAuthSession} from "aws-amplify/auth";

const UploadDocumentPage = () => {

    const theme = useTheme();
    const {user} = useAuth();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(dayjs());
    const [fileName, setFileName] = useState();
    const [attachment, setAttachment] = useState();
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAdmin().then();
        }
    }, [user]);

    const fetchAdmin = async () => {
        const session = await fetchAuthSession();
        if (session.tokens.idToken.payload && session.tokens.idToken.payload['cognito:groups']) {
            const groups = session.tokens.idToken.payload['cognito:groups'];
            if (groups.includes('admin')) {
                setAdmin(true);
            }
        }
    }

    const uploadDocument = async () => {
        setLoading(true)
        try {
            const res = await ConversationService.getFileUploadUrl(fileName);
            const uploadUrl = res.data['url'];
            await FileService.uploadFile(attachment, uploadUrl);
            await ConversationService.processFile(fileName, title, date.format('YYYY-MM-DD'));
            // return res.data['conversationid'];
        } catch (e) {
            console.log(e);
        }
        setLoading(false)
    }

    return <Container sx={{flexGrow: 1, mb: 10, mt: 4}}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            {admin && <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Stack direction={"row"} alignItems={"center"} spacing={2} sx={{mt: 1}}>
                        <Typography variant="body1">Selected File <Typography variant="caption">{attachment?.name}</Typography></Typography>
                        {attachment && <IconButton sx={{mx: 1, color: theme.palette.error.main}}
                                                   onClick={() => {
                                                       setAttachment(null)
                                                       setFileName("")
                                                   }}>
                            <DeleteRounded/>
                        </IconButton>}
                        <label htmlFor="contained-button-file">
                            <Input accept="*" id="contained-button-file" type="file"
                                   onChange={(e) => {
                                       setAttachment(e.target.files[0])
                                       setFileName(e.target.files[0].name)
                                   }}
                                   style={{display: 'none'}}/>
                            <Button variant="contained" disableElevation component="span" startIcon={<AttachFileRounded/>}>
                                {attachment ? "Replace" : "Upload"}
                            </Button>
                        </label>
                    </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Document Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <DesktopDatePicker
                        fullWidth
                        label="Document Date"
                        value={date}
                        onChange={(newValue) => setDate(newValue)}
                        sx={{width: '100%'}}
                        renderInput={(params) => <TextField {...params} sx={{width: '100%'}}/>}
                    />
                </Grid>
                <Grid item xs={12} align={"end"}>
                    <LoadingButton disabled={title === '' || !attachment || !date} variant={"contained"} onClick={uploadDocument}
                                   loading={loading} startIcon={<UploadFileRounded />}>
                        Upload
                    </LoadingButton>
                </Grid>
            </Grid>}
        </LocalizationProvider>
    </Container>
}

export default UploadDocumentPage;
