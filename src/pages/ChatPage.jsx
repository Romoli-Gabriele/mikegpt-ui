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
  Typography,
  useTheme,
} from "@mui/material";
import ico from "../assets/mike_logo.png";
import { ConversationService } from "../services/ConversationService.jsx";
import { useState, useEffect, useRef } from "react";
import {
  AttachmentRounded,
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

const CONTENT_PADDING = {
  paddingLeft: "3rem",
  paddingRight: "3rem",
};

const markdownContent = `
# Termini di Servizio

## 1. Introduzione
Benvenuti nell'app [Nome dell'App]. Questi Termini di Servizio ("ToS") regolano l'uso della nostra applicazione. Utilizzando l'app, accetti di essere vincolato da questi termini.

## 2. Accettazione dei Termini
Utilizzando l'app, accetti i presenti ToS. Se non accetti questi termini, non utilizzare l'app.

## 3. Modifiche ai Termini
Ci riserviamo il diritto di modificare questi ToS in qualsiasi momento. Le modifiche saranno comunicate tramite [modalità di notifica].

## 4. Uso dell'App
L'utente si impegna a utilizzare l'app in conformità con tutte le leggi applicabili e a non utilizzare l'app per scopi illeciti.

## 5. Account Utente
Per utilizzare alcune funzionalità dell'app, potrebbe essere necessario creare un account. L'utente è responsabile della sicurezza del proprio account.

## 6. Contenuti Generati dagli Utenti
Gli utenti possono pubblicare contenuti sull'app. Pubblicando contenuti, l'utente concede all'azienda una licenza non esclusiva per utilizzare tali contenuti.

## 7. Proprietà Intellettuale
Tutti i contenuti dell'app sono di proprietà dell'azienda o dei suoi licenziatari e sono protetti dalle leggi sul copyright.

## 8. Limitazione di Responsabilità
L'azienda non sarà responsabile per eventuali danni derivanti dall'uso dell'app.

## 9. Privacy
Per informazioni su come trattiamo i dati personali degli utenti, consultare la nostra [Politica sulla Privacy].

## 10. Legge Applicabile e Foro Competente
Questi ToS sono regolati dalla legge [indicare la giurisdizione]. Qualsiasi controversia sarà risolta presso il foro competente di [indicare il foro].

## 11. Contatti
Per domande o problemi relativi a questi ToS, contattaci a [indirizzo email].
`;

const ChatPage = () => {
  const { enqueueSnackbar } = useSnackbar();

  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState();
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

  useEffect(() => {
    ConversationService.sendMessage("", "").then();
  }, [conversationId]);

  const handleNewConversation = async () => {
    setMessages([]);
    setConversationId(null);
  };

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

  const sendMessage = async (question, kwargs) => {
    setLoading(true);
    try {
      let conversation_id = conversationId;
      if (!conversation_id) {
        conversation_id = await createConversation();
      }
      console.log("conversation_id", conversation_id);
      let _messages = [
        ...messages,
        {
          data: {
            content: question,
          },
          type: "human",
        },
      ];
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
          conversation_id,
          question,
          import.meta.env.VITE_DEBUG_SELECT === "true" ? debugAB : null
        );

        setMessages([
          ..._messages,
          {
            data: {
              content: res.data["response"],
              documents: res.data["documents"],
              runid: res.data["runid"],
            },
            type: "ai",
          },
        ]);
      } catch (e) {
        // skip
        // delete last message
        setMessages(_messages.slice(0, -1));
      }
      // await getConversation();
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const renderContent = () => {
    if (messages.length === 0)
      return (
        <Box sx={{ flexGrow: 1, ...CONTENT_PADDING }}>
          <EmptyChatView />
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
                            {} // TODO: add attachments
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

          <InputBar
            onSubmit={sendMessage}
            ref={inputBarRef}
            loading={loading}
          />
          <MinimizedFooter />
        </Stack>
      </Stack>
    </Container>
  );
};

export default ChatPage;
