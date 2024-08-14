import {
    Box,
    Button,
    CircularProgress,
    Container,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {ConversationService} from "../services/ConversationService.jsx";
import {useState, useEffect} from "react";
import mike_logo from "../assets/mike_logo.jpg";
import {AddRounded, AttachmentRounded, ThumbDownRounded, ThumbUpRounded} from "@mui/icons-material";
import {useSnackbar} from "notistack";

const ChatPage = () => {

    const {enqueueSnackbar} = useSnackbar()

    const theme = useTheme();

    const [messages, setMessages] = useState([]);
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);

    const [conversationId, setConversationId] = useState();

    const [debugAB, setDebugAB] = useState('A');

    useEffect(() => {
        ConversationService.sendMessage('', '').then();
    }, [conversationId]);

    const createConversation = async () => {
        setLoading(true)
        try {
            const res = await ConversationService.addConversation();
            setConversationId(res.data['conversationid'])
            return res.data['conversationid'];
        } catch (e) {
            console.log(e);
        }
        setLoading(false)
    }

    const getConversation = async () => {
        setLoading(true)
        try {
            const res = await ConversationService.getConversation(conversationId);
            // remove first two messages
            const _messages = res.data['History'].slice(2);
            setMessages(_messages);
        } catch (e) {
            console.log(e);
        }
        setLoading(false)
    }

    const sendMessage = async () => {
        setLoading(true)
        try {
            let conversation_id = conversationId;
            if (!conversation_id) {
                conversation_id = await createConversation();
            }
            let _messages = [...messages, {
                data: {
                    content: question
                },
                type: 'human',
            }];
            setMessages([..._messages, {
                data: null,
                type: 'ai',
            }]);
            setLoading(true)
            try {
                const res = await ConversationService.sendMessage(conversation_id, question, import.meta.env.VITE_DEBUG_SELECT === 'true' ? debugAB : null);
                setMessages([..._messages, {
                    data: {
                        content: res.data['response'],
                        documents: res.data['documents'],
                        runid: res.data['runid']
                    },
                    type: 'ai',
                }]);
            } catch (e) {
                // skip
                // delete last message
                setMessages(_messages.slice(0, -1));
            }
            // await getConversation();
        } catch (e) {
            console.log(e);
        }
        setLoading(false)
    }

    return <Container sx={{flexGrow: 1, mb: 10, mt: 4}}>
        <Stack direction={"column"} spacing={2} sx={{height: '100%'}}>
            <Stack direction={"row"} spacing={2} justifyContent={"end"}>
                <Button startIcon={<AddRounded/>} variant={"outlined"} disabled={messages.length === 0} onClick={() => {
                    setMessages([]);
                    setConversationId(null);
                }}>
                    New Conversation
                </Button>
            </Stack>
            <Box sx={{flexGrow: 1, height: '100%', overflow: 'hidden'}}>
                <Box>
                    {messages.map((message, index) =>
                        <Stack direction={message.type === 'ai' ? "row" : "row-reverse"} spacing={2} key={index}>
                            <Stack direction={"column"} alignItems={message.type === 'ai' ? "start" : "end"} spacing={1} sx={{py: 2}}>
                                <Stack direction={"column"} spacing={2} sx={{
                                    maxWidth: '75%', minWidth: '240px', position: 'relative',
                                    background: message.type === 'ai' ? theme.palette.primary.main : '#EBEDEF',
                                    color: message.type === 'ai' ? 'white' : theme.palette.text.primary, borderRadius: '8px', padding: '1rem'
                                }}>
                                    {message.data ? message.data.content : <CircularProgress style={{color: "white"}}/>}
                                </Stack>
                                {message.type === 'ai' && <Box>
                                    <Stack direction={"row"}>
                                        <IconButton variant={"contained"} color={message.feedback === 1 ? "primary" : "default"}
                                                    onClick={() => {
                                                        // add positive feedback to current message
                                                        ConversationService.sendFeedback(message.data.runid, 1).then()
                                                        enqueueSnackbar('Feedback submitted', {variant: 'success'})
                                                        setMessages((_messages) => _messages.map((m, i) => {
                                                            if (i === index) {
                                                                return {
                                                                    ...m,
                                                                    feedback: 1
                                                                }
                                                            }
                                                            return m;
                                                        }))
                                                    }}
                                        ><ThumbUpRounded/></IconButton>
                                        <IconButton variant={"contained"} color={message.feedback === -1 ? "primary" : "default"}
                                                    onClick={() => {
                                                        ConversationService.sendFeedback(message.data.runid, -1).then()
                                                        enqueueSnackbar('Feedback submitted', {variant: 'success'})
                                                        setMessages((_messages) => _messages.map((m, i) => {
                                                            if (i === index) {
                                                                return {
                                                                    ...m,
                                                                    feedback: -1
                                                                }
                                                            }
                                                            return m;
                                                        }))
                                                    }}
                                        ><ThumbDownRounded/></IconButton>
                                    </Stack>
                                </Box>}
                                {message.data && message.data.documents && message.data.documents.map((document, index) =>
                                    <Button startIcon={<AttachmentRounded/>} key={index} variant={"outlined"} componet={"a"} target={"_blank"}
                                            href={document.url}>
                                        {document.title} {(new Date(document.date)).toLocaleDateString()}
                                    </Button>)}
                            </Stack>
                        </Stack>
                    )}
                    {
                        messages.length === 0 &&
                        <Stack direction={"column"} spacing={2} sx={{width: '100%', textAlign: 'center'}} alignItems={"center"} justifyContent={"center"}>
                            <img src={mike_logo} style={{width: '10rem', paddingTop: '15vh'}}/>
                            <Typography variant={"h5"} sx={{pt: 1}}>
                                Hello, I’m Mike. How can I help you?
                            </Typography>
                        </Stack>
                    }
                </Box>
            </Box>
            <Stack direction={"column"} spacing={2} alignItems={"start"}>
                {/* insert a select */}
                {import.meta.env.VITE_DEBUG_SELECT === 'true' && <FormControl sx={{width: '15rem', maxWidth: '100%'}}>
                    <InputLabel id="debug-select-label">A / B Testing</InputLabel>
                    <Select
                        labelId="debug-select-label"
                        id="debug-select"
                        value={debugAB}
                        label="A / B Testing"
                        onChange={(e) => setDebugAB(e.target.value)}
                    >
                        <MenuItem value={'A'}>A</MenuItem>
                        <MenuItem value={'B'}>B</MenuItem>
                    </Select>
                </FormControl>}
                <Stack direction={"row"} spacing={2} alignItems={"center"} sx={{position: 'relative', width: '100%'}}>
                    <TextField
                        sx={{width: "100%"}}
                        InputProps={{style: {paddingRight: '6rem'}}}
                        label="Question"
                        multiline
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <LoadingButton disabled={question === ''} variant={"contained"} sx={{position: 'absolute', right: '12px'}}
                                   onClick={sendMessage} loading={loading}>
                        ASK
                    </LoadingButton>
                </Stack>
            </Stack>
        </Stack>
    </Container>
}

export default ChatPage;
