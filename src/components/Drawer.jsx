import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ico from "../assets/mike_logo.png";
import { SettingsModal } from "./SettingsModal.jsx";
import {
  Add,
  Chat,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  Search,
  SettingsOutlined,
} from "@mui/icons-material";
import { useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { ConversationService } from "../services/ConversationService.jsx";
import { Typography } from "@mui/material";
import { useStoreState } from "easy-peasy";
const drawerWidth = 240;

const BORDER_RADIUS = "17px";

const styles = {
  listItemButton: {
    borderRadius: BORDER_RADIUS,
    borderWidth: "1px",
    borderColor: "var(--background-highlight-color)",
    borderStyle: "dashed",
    margin: "5px",
    display: "flex",
    alignItems: "center",
  },
  itemLabelTypographyProps: { fontSize: "12px", color: "#000" },
  chatLabelTypographyProps: {
    fontSize: "12px",
    color: "var(--support-text-color)",
  },
  searchInput: {
    border: "none",
    width: "100%",
    backgroundColor: "transparent",
    outline: "none",
    flex: 1,
    color: "#000000",
  },
  chatItem: {
    borderWidth: "0px",
  },
  searchSelectionButton: {
    borderRadius: BORDER_RADIUS,
  },
};

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer() {
  const [open, setOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { user, logout } = useAuth();
  const currentConversationId = useStoreState(
    (state) => state.chat.conversationId
  );
  const conversations = useStoreState((state) => state.chat.conversations);

  const chats = React.useMemo(() => {
    return {
      today:
        conversations?.filter(
          (conversation) => new Date().getDate() === conversation.date.getDate()
        ) || [],
      last30Days:
        conversations?.filter(
          (conversation) =>
            new Date().getDate() - conversation.date.getDate() <= 30 &&
            new Date().getDate() !== conversation.date.getDate()
        ) || [],
    };
  }, [conversations]);

  const handleOpenClose = () => {
    setOpen(!open);
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);

    const results = [];
    setSearchResults(results);
  };

  const renderChat = (chat, index) => {
    const isSelected = chat.conversationId === currentConversationId;
    return (
      <ListItemButton
        key={chat.conversationId}
        sx={{
          ...styles.listItemButton,
          display: "flex",
          backgroundColor: isSelected
            ? "var(--background-highlight-color)"
            : "",
        }}
        onClick={() => {
          ConversationService.openConversation(chat.conversationId);
        }}
      >
        <ListItemText
          primary={chat.title || "Untitled chat"}
          primaryTypographyProps={styles.itemLabelTypographyProps}
        />
      </ListItemButton>
    );
  };

  const renderChats = () => {
    return (
      <>
        <Typography
          fontSize="small"
          color="textSecondary"
          fontWeight={"bold"}
          sx={{ marginLeft: "10px", marginTop: "10px", marginBottom: "10px" }}
        >
          Today
        </Typography>
        {chats.today.map((chat, index) => renderChat(chat, index))}

        <Typography
          fontSize="small"
          color="textSecondary"
          fontWeight={"bold"}
          sx={{ marginLeft: "10px", marginTop: "10px", marginBottom: "10px" }}
        >
          Last 30 days
        </Typography>
        {chats.last30Days.map((chat, index) => renderChat(chat, index))}
      </>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <Box sx={{ borderRight: "solid #cccccc 1px", height: "100%" }}>
          <List>
            <ListItem disablePadding={true} sx={{ display: "block" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <img
                  src={ico}
                  alt="ico"
                  style={{
                    width: "3rem",
                  }}
                />
              </Box>
            </ListItem>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={styles.listItemButton}
                onClick={handleOpenClose}
              >
                <ListItemIcon>
                  {open ? <ChevronLeft /> : <ChevronRight />}
                </ListItemIcon>
                <ListItemText
                  primary="Close"
                  primaryTypographyProps={styles.itemLabelTypographyProps}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={styles.listItemButton}
                onClick={ConversationService.openNewConversation}
              >
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText
                  primary="New Chat"
                  primaryTypographyProps={styles.itemLabelTypographyProps}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={styles.listItemButton}
                onClick={handleSettingsOpen}
              >
                <ListItemIcon>
                  <SettingsOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Settings"
                  primaryTypographyProps={styles.itemLabelTypographyProps}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton sx={styles.listItemButton}>
                <ListItemIcon>
                  <Dashboard fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Workspace"
                  primaryTypographyProps={styles.itemLabelTypographyProps}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ display: "block" }}>
              <ListItemButton
                sx={{
                  ...styles.listItemButton,
                  backgroundColor: "#F5F5F5",
                  display: "flex",
                }}
                onClick={() => {
                  setOpen(true);
                  inputRef.current?.focus();
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.cursor = "text";
                }}
              >
                <ListItemIcon>
                  <Search />
                </ListItemIcon>
                <input
                  value={searchTerm}
                  onChange={handleSearch}
                  className="search-input"
                  ref={inputRef}
                  placeholder="Search"
                  style={{
                    ...styles.searchInput,
                    fontSize: styles.itemLabelTypographyProps.fontSize,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
          {open && (
            <List>
              {searchResults.map((item, index) => (
                <ListItem key={index} disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    key={index}
                    sx={{
                      ...styles.listItemButton,
                      display: "flex",
                    }}
                  >
                    <ListItemIcon>
                      <Chat />
                    </ListItemIcon>
                    <ListItemText
                      primary={item}
                      primaryTypographyProps={styles.itemLabelTypographyProps}
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              <ListItem disablePadding sx={{ display: "block" }}>
                {renderChats()}
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>

      <SettingsModal open={settingsOpen} setOpen={setSettingsOpen} />
    </Box>
  );
}
