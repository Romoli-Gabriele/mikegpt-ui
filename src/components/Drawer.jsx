import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ico from "../assets/mike_logo.png";
import { drawerWidth, drawerItemMarginPx } from "../config.jsx";
import { SettingsModal } from "./SettingsModal.jsx";
import {
  Add,
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
import { ChatItem } from "./ChatItem.jsx";

const BORDER_RADIUS = "17px";

const styles = {
  listItemButton: {
    borderRadius: BORDER_RADIUS,
    borderWidth: "1px",
    borderColor: "var(--background-highlight-color)",
    borderStyle: "dashed",
    margin: drawerItemMarginPx + "px",
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
  const { user, logout } = useAuth();
  const currentConversationId = useStoreState(
    (state) => state.chat.conversationId
  );
  const conversations = useStoreState((state) => state.chat.conversations);

  const chats = React.useMemo(() => {
    let filteredConversations = [...conversations].filter(
      (conversation) =>
        // Elimina le conversazioni piu vecchie di 30 giorni
        new Date().getDate() - conversation.date.getDate() <= 30
    );

    if (searchTerm && searchTerm.length >= 3) {
      // usa una espressione regolare per cercare il termine di ricerca parziale e case insensitive
      const regex = new RegExp(searchTerm, "i");
      filteredConversations = filteredConversations.filter((conversation) =>
        regex.test(conversation.title)
      );
    }

    return {
      today:
        filteredConversations?.filter(
          (conversation) => new Date().getDate() === conversation.date.getDate()
        ) || [],
      last30Days:
        filteredConversations?.filter(
          (conversation) => new Date().getDate() !== conversation.date.getDate()
        ) || [],
    };
  }, [conversations, searchTerm]);

  const handleOpenClose = () => {
    setOpen(!open);
  };

  const handleSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
  };

  const renderChat = (chat, index) => {
    return (
      <ChatItem
        chat={chat}
        key={chat.conversationId}
        currentConversationId={currentConversationId}
        styles={styles}
      />
    );
  };

  const renderChats = () => {
    return (
      <>
        {chats.today.length > 0 && (
          <Typography
            fontSize="small"
            color="textSecondary"
            fontWeight={"bold"}
            sx={{ marginLeft: "10px", marginTop: "10px", marginBottom: "10px" }}
          >
            Today
          </Typography>
        )}
        {chats.today.map((chat, index) => renderChat(chat, index))}

        {chats.last30Days.length > 0 && (
          <Typography
            fontSize="small"
            color="textSecondary"
            fontWeight={"bold"}
            sx={{ marginLeft: "10px", marginTop: "10px", marginBottom: "10px" }}
          >
            Last 30 days
          </Typography>
        )}
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
