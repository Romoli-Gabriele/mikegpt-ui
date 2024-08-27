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
import { useState, useEffect, useRef } from "react";
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));


  useEffect(() => {
    ConversationService.sendMessage("", "").then();
  }, [conversationId]);

  const createConversation = async () => {
    setLoading(true);
    try {
      const res = await ConversationService.addConversation();

      setConversationId(res.data["conversationid"]);
      return res.data["conversationid"];
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
    messageId = undefined
  ) => {
    setLoading(true);
    try {
      let current_conversation_id = conversationId;
      if (!current_conversation_id) {
        current_conversation_id = await createConversation();
      }

      const sentMessage = {
        data: {
          content: question,
          kwargs: kwargs,
          toolId: toolId,
        },
        type: "human",
      };

      let _messages = [...messages, sentMessage];
      setMessages([
        ..._messages,
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
          import.meta.env.VITE_DEBUG_SELECT === "true" ? debugAB : null
        );

        // Controlla se l'utente è ancora nella chat che ha inviato il messaggio e questa non è cambiata
        // Se no c'è il bug che se invio un messaggio e subito dopo prima della risposta  cambio chat
        // La risposta arriva nella chat sbagliata e si porta tutti i vecchi messaggi
        if (current_conversation_id == conversationId) {
          const responseMessage = {
            data: {
              content: res.data["response"],
              documents: res.data["documents"],
              runid: res.data["runid"],
            },
            type: "ai",
          };

          setMessages([..._messages, responseMessage]);
        }
      } catch (e) {
        // skip
        // delete last message
        setMessages(_messages.slice(0, -1));
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const renderContent = () => {
    if (messages.length === 0)
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
        {messages.map((message, index) => (
          <Stack
            direction={message.type === "ai" ? "row" : "row-reverse"}
            spacing={2}
            key={index}
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
                  maxWidth: "75%",
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
                        setMessages((_messages) =>
                          _messages.map((m, i) => {
                            if (i === index) {
                              return {
                                ...m,
                                feedback: 1,
                              };
                            }
                            return m;
                          })
                        );
                      }}
                    >
                      <ThumbUpRounded />
                    </IconButton>
                    <IconButton
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
                        setMessages((_messages) =>
                          _messages.map((m, i) => {
                            if (i === index) {
                              return {
                                ...m,
                                feedback: -1,
                              };
                            }
                            return m;
                          })
                        );
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
    <Container
      sx={{
        flexGrow: 1,
        mb: 1,
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
              right: "20%",
              left: "20%",
              width: "60%",
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
      {!isMobile && <MinimizedFooter />}
    </Container>
  );
};

export default ChatPage;
