import {
  Box,
  CircularProgress,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ico from "../assets/mike_logo.png";
import { ConversationService } from "../services/ConversationService.jsx";
import { useState, useRef } from "react";
import {
  ThumbDownRounded,
  ThumbUpRounded,
  ContentCopyRounded,
  EditRounded,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { InputBar } from "../components/InputBar.jsx";
import { EmptyChatView } from "../components/EmptyChatView.jsx";
import { SourcesModal } from "../components/SourcesModal.jsx";
import { MinimizedFooter } from "../components/Footer.jsx";
import Markdown from "react-markdown";
import dedent from "dedent";
import { useStoreActions, useStoreState } from "easy-peasy";
import { useMediaQuery } from "@mui/material";
import TOOLS from "../services/TOOLS.json";
import { store } from "../store/index.jsx";

const CONTENT_PADDING = {
  paddingLeft: "3rem",
  paddingRight: "3rem",
};

const ChatPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const messages = useStoreState((state) => state.chat.messages);
  const setMessages = useStoreActions((actions) => actions.chat.setMessages);
  const conversationId = useStoreState((state) => state.chat.conversationId);
  const setConversationId = useStoreActions(
    (actions) => actions.chat.setConversationId
  );
  const removeMessagesAfter = useStoreActions(
    (actions) => actions.chat.removeMessagesAfter
  );
  const loading = useStoreState((state) => state.chat.loading);
  const setLoading = useStoreActions((actions) => actions.chat.setLoading);
  const [debugAB, setDebugAB] = useState("A");
  const inputBarRef = useRef(null);

  // Rimuove dal messaggio l'header del markdown ```markdown
  // Se no React-Markdown non riesce a formattare correttamente
  const fromatMessage = (message) => {
    if (!message) return "";
    let newMessage = message.replaceAll("```markdown", "");
    newMessage = newMessage.replaceAll("```", "");
    return newMessage;
  };

  // Controlla se l'utente è su mobile
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

  const createConversation = async () => {
    setLoading(true);
    try {
      const conversationid = await ConversationService.createConversation();
      return conversationid;
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const getConversation = async () => {
    setLoading(true);
    try {
      const res = await ConversationService.getConversation(conversationId);
      // remove first two messages
      const _messages = res.data["History"].slice(2);
      setMessages(_messages);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const sendMessage = async (
    question = "",
    kwargs = undefined,
    toolId = undefined,
    functionName = undefined,
    messageId = undefined
  ) => {
    setLoading(true);
    try {
      let current_conversation_id = conversationId;
      if (!current_conversation_id) {
        current_conversation_id = await createConversation();
      }

      let sentMessage = {
        data: {
          content: question,
          kwargs: kwargs,
          toolId: toolId,
          functionName: functionName,
        },
        type: "human",
        created_at: new Date().toISOString(),
      };

      let _messages = store.getState().chat.messages || [];

      // Se il messaggio inviato era una modifica, elimina tutti i messaggi dopo
      if (!!messageId) {
        const index = _messages.findIndex(
          (x) => x?.data?.runid == messageId && x?.type === "human"
        );
        if (index === -1) {
          console.error("Message to edit not found");
        } else {
          const lastMessage = _messages[index];
          const lastDate = new Date(lastMessage?.created_at);
          if (!lastDate || isNaN(lastDate.getTime())) {
            console.error("Invalid date");
          } else {
            _messages = _messages.filter((x) => {
              const date = new Date(x?.created_at);
              if (x?.data?.runid === messageId) return false;
              return !date || isNaN(date.getTime()) || date <= lastDate;
            });
          }
        }
      }

      setMessages([
        ..._messages,
        sentMessage,
        {
          data: null,
          type: "ai",
        },
      ]);

      setLoading(true);

      try {
        const res = await ConversationService.sendMessage(
          current_conversation_id,
          question,
          kwargs && Object.keys(kwargs).length > 0 ? kwargs : undefined,
          functionName,
          messageId,
          import.meta.env.VITE_DEBUG_SELECT === "true" ? debugAB : null
        );

        if (!res?.data) throw new Error("No data in response");

        // Controlla se l'utente è ancora nella chat che ha inviato il messaggio e questa non è cambiata
        // Se no c'è il bug che se invio un messaggio e subito dopo prima della risposta  cambio chat
        // La risposta arriva nella chat sbagliata e si porta tutti i vecchi messaggi
        if (
          String(current_conversation_id) === String(conversationId) ||
          !conversationId
        ) {
          // Aggiunge il runid al messaggio inviato
          sentMessage.data.runid = res.data["runid"];

          // Messaggio di risposta
          const responseMessage = {
            data: {
              content: res.data["response"],
              documents: res.data["documents"],
              runid: res.data["runid"],
            },
            type: "ai",
            created_at: new Date().toISOString(),
          };

          // Aggiunge il messaggio di risposta
          setMessages([..._messages, sentMessage, responseMessage]);
        }
      } catch (e) {
        // skip
        // delete last message
        setMessages(_messages.slice(0, -1));
        console.error(e);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (!conversationId)
      return (
        <Box sx={{ flexGrow: 1, ...CONTENT_PADDING }}>
          <EmptyChatView
            onToolPress={(tool) => {
              inputBarRef.current?.setTool(tool, {});
            }}
          />
        </Box>
      );

    return (
      <Stack
        sx={{
          flexGrow: 1,
          height: 10, // fix for overflow
          overflowY: "auto",
          ...CONTENT_PADDING,
        }}
      >
        {messages?.length === 0 && (
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
            }}
          >
            <CircularProgress
              size="2.5rem"
              style={{ color: theme.palette.text.secondary }}
            />
          </Box>
        )}

        {messages?.map((message, index) => (
          <Stack
            direction={message.type === "ai" ? "row" : "row-reverse"}
            spacing={2}
            key={
              message.runid && message.runid > -1
                ? message.type + ":" + message.runid
                : "DUMMY" + "_" + index
            }
          >
            <Stack
              direction={"column"}
              alignItems={message.type === "ai" ? "start" : "end"}
              spacing={1}
              sx={{ py: 2 }}
            >
              {message.type === "ai" && (
                <Stack direction={"row"} spacing={1} alignItems={"center"}>
                  <img src={ico} alt="mike" style={{ width: "2rem" }} />

                  <Typography fontWeight={"bold"}>Mike</Typography>
                </Stack>
              )}
              <Stack
                direction={"column"}
                spacing={2}
                sx={{
                  maxWidth: "100%",
                  minWidth: "240px",
                  position: "relative",
                  background:
                    message.type === "ai"
                      ? "transparent"
                      : theme.palette.background.foregroundontainerColor,
                  color:
                    message.type === "ai"
                      ? theme.palette.text.primary
                      : theme.palette.text.primary,
                  borderRadius: theme.shape.borderRadius + "px",
                  padding: message.type === "ai" ? 0 : "1rem",
                  boxShadow: message.type === "ai" ? "none" : theme.shadows[1],
                }}
              >
                {message.type !== "ai" &&
                  message.data.functionName != undefined && (
                    <Typography
                      fontSize={"0.8rem"}
                      fontWeight={"bold"}
                      color={theme.palette.text.secondary}
                    >
                      {
                        TOOLS.find(
                          (x) => x.endpoint === message.data.functionName
                        ).name
                      }
                    </Typography>
                  )}
                {message.data ? (
                  <Markdown>
                    {dedent(fromatMessage(message.data.content))}
                  </Markdown>
                ) : (
                  <CircularProgress
                    size="1.5rem"
                    style={{ color: theme.palette.primary }}
                  />
                )}

                {message?.data?.kwargs &&
                  Object.keys(message.data.kwargs).length > 0 && (
                    <Typography fontWeight={"bold"}>
                      {Object.entries(message.data.kwargs).map(
                        ([key, value]) => (
                          <Stack key={key} direction={"row"} spacing={1}>
                            <Typography
                              key={key}
                              variant={"body2"}
                              fontWeight={"bold"}
                            >
                              {key}
                            </Typography>
                            <Typography key={value} variant={"body2"}>
                              {value}
                            </Typography>
                          </Stack>
                        )
                      )}
                    </Typography>
                  )}

                {message.type !== "ai" && (
                  <Box>
                    <Stack direction={"row"} justifyContent={"flex-end"}>
                      <IconButton
                        variant={"contained"}
                        color={"default"}
                        onClick={() => {
                          inputBarRef.current?.edit(
                            message.data.runid,
                            message.data.content || "",
                            message.data.kwargs || {},
                            message.data.toolId || undefined
                          );
                        }}
                        size="small"
                      >
                        <EditRounded fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                )}
              </Stack>
              {message.type === "ai" ? (
                <Box>
                  <Stack direction={"row"}>
                    <IconButton
                      disabled={!message.data}
                      variant={"contained"}
                      color={"default"}
                      onClick={() => {
                        navigator.clipboard.writeText(message.data.content);
                        enqueueSnackbar("Message copied", {
                          variant: "success",
                        });
                      }}
                    >
                      <ContentCopyRounded />
                    </IconButton>

                    <IconButton
                      disabled={!message.data}
                      variant={"contained"}
                      color={message.feedback === 1 ? "primary" : "black"}
                      onClick={() => {
                        // add positive feedback to current message
                        ConversationService.sendFeedback(
                          message.data.runid,
                          1
                        ).then();
                        enqueueSnackbar("Feedback submitted", {
                          variant: "success",
                        });
                      }}
                    >
                      <ThumbUpRounded />
                    </IconButton>
                    <IconButton
                      disabled={!message.data}
                      variant={"contained"}
                      color={message.feedback === -1 ? "error" : "black"}
                      onClick={() => {
                        ConversationService.sendFeedback(
                          message.data.runid,
                          -1
                        ).then();
                        enqueueSnackbar("Feedback submitted", {
                          variant: "success",
                        });
                      }}
                    >
                      <ThumbDownRounded />
                    </IconButton>
                    {message.data &&
                      message.data.documents &&
                      message.data.documents.length > 0 && (
                        <SourcesModal documents={message.data.documents} />
                      )}
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Stack>
        ))}
      </Stack>
    );
  };

  return (
    <>
      <Container
        sx={{
          flexGrow: 1,
          mb: 1,
          maxHeight: "100%",
          paddingBottom: isSm ? "2vh" : 0,
          overflowY: "auto",
        }}
      >
        <Stack direction={"column"} sx={{ height: "100%" }}>
          {renderContent()}

          <Stack
            direction={"column"}
            spacing={1}
            alignItems={"start"}
            sx={{
              ...CONTENT_PADDING,
            }}
          >
            {/* insert a select */}
            {import.meta.env.VITE_DEBUG_SELECT === "true" && (
              <FormControl sx={{ width: "15rem", maxWidth: "100%" }}>
                <InputLabel id="debug-select-label">A / B Testing</InputLabel>
                <Select
                  labelId="debug-select-label"
                  id="debug-select"
                  value={debugAB}
                  label="A / B Testing"
                  onChange={(e) => setDebugAB(e.target.value)}
                >
                  <MenuItem value={"A"}>A</MenuItem>
                  <MenuItem value={"B"}>B</MenuItem>
                </Select>
              </FormControl>
            )}

            <Box
              sx={{
                position: "fixed",
                bottom: 0,
                right: isSm ? "10%" : "20%",
                left: isSm ? "10%" : "20%",
                width: isSm ? "80%" : "60%",
                zIndex: 1000,
                padding: theme.spacing(3), // Optional: to add some padding
              }}
            >
              <InputBar
                onSubmit={sendMessage}
                ref={inputBarRef}
                loading={loading}
              />
            </Box>
          </Stack>
        </Stack>
      </Container>
      {!isSm && !isMd && <MinimizedFooter />}
    </>
  );
};

export default ChatPage;
