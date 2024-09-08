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
  LogoutOutlined,
  Search,
  SettingsOutlined,
  SpaceDashboardOutlined,
} from "@mui/icons-material";
import { useRef, useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";
import { ConversationService } from "../services/ConversationService.jsx";
import {
  Avatar,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useStoreState } from "easy-peasy";
import { ChatItem } from "./ChatItem.jsx";
import { useTheme } from "@emotion/react";
import { WorkspaceModal } from "./WorkspaceModal.jsx";
import { useMemo } from "react";

const BORDER_RADIUS = "17px";

const DRAWER_RIGHT_BORDER = "solid #cccccc 1px";

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
  folders: {
    ml: drawerItemMarginPx + "px",
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    overflowY: "hidden",
    whiteSpace: "nowrap",
    "&::-webkit-scrollbar": {
      display: "none",
    },
  },
  folder: {
    display: "block",
    p: 0.5,
    background: "red",
    mr: 1,
    borderRadius: "10px",

    "&:hover": {
      backgroundColor: "var(--background-highlight-color)",
    },
    cursor: "pointer",
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
  const [workspaceOpen, setWorkspaceOpen] = React.useState(false);
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout } = useAuth();
  const currentConversationId = useStoreState(
    (state) => state.chat.conversationId
  );
  const workspaces = useStoreState((state) => state.chat.workspaces);
  const workspaceLoaded = useStoreState((state) => state.chat.workspaceLoaded);
  const currentWorkspaceId = useStoreState(
    (state) => state.chat.currentWorkspaceId
  );

  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const md = useMediaQuery(theme.breakpoints.down("md"));

  const handleSignOut = () => {
    logout().then();
  };

  const shownFolders = useMemo(() => {
    const currentWorkspace = workspaces?.find(
      (workspace) => String(workspace.id) === String(currentWorkspaceId)
    );
    return currentWorkspace?.folders || [];
  }, [workspaces, currentWorkspaceId]);

  const shownChats = React.useMemo(() => {
    let merged = [];
    // Esegue il merge di tutte le conversazioni della workspace corrente
    const currentWorkspace = workspaces?.find(
      (workspace) => String(workspace.id) === String(currentWorkspaceId)
    );
    // Carica le chat senza cartella
    merged.push(...(currentWorkspace?.chatSessions || []));
    // Carica le chat delle cartelle
    merged.push(
      ...(currentWorkspace?.folders?.map(
        (folder) => folder?.chatSessions || []
      ) || [])
    );

    merged = merged
      // Filtra per data
      .filter(
        (conversation) =>
          // o non hanno data o sono degli ultimi 30 giorni
          !conversation.created_at ||
          new Date().getTime() - new Date(conversation.created_at).getTime() <
            30 * 24 * 60 * 60 * 1000
      )
      // ordina per data (se non c'è la data, metti in fondo)
      .sort((a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

    if (searchTerm && searchTerm.length >= 3) {
      // usa una espressione regolare per cercare il termine di ricerca parziale e case insensitive
      const regex = new RegExp(searchTerm, "i");
      merged = merged.filter((conversation) => regex.test(conversation?.name));
    }

    return {
      today:
        merged?.filter(
          (conversation) =>
            new Date().getDate() ===
            new Date(conversation.created_at)?.getDate()
        ) || [],
      last30Days:
        merged?.filter(
          (conversation) =>
            new Date().getDate() !==
            new Date(conversation.created_at)?.getDate()
        ) || [],
    };
  }, [workspaces, searchTerm]);

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

  const renderChat = (chat) => {
    return (
      <ChatItem
        chat={chat}
        key={chat.id}
        currentConversationId={currentConversationId}
        styles={styles}
      />
    );
  };

  const renderFolders = () => {
    if (!open) return null;

    console.log({ shownFolders });

    if (shownFolders.length === 0) return null;

    return (
      <List sx={styles.folders}>
        {[
          {
            name: "All",
            dummy: true,
            id: -1,
          },
          ...shownFolders,
        ].map((folder, index) => {
          const isSelected = index === 0;
          return (
            <ListItem
              key={folder.id}
              disablePadding
              sx={{
                ...styles.folder,
                backgroundColor: isSelected
                  ? "var(--background-highlight-color)"
                  : "transparent",
              }}
              onClick={() => {}}
            >
              <Typography
                fontSize={"12px"}
                color="textPrimary"
                sx={{ textAlign: "center" }}
              >
                {folder.name || "Unnamed folder"}
              </Typography>
            </ListItem>
          );
        })}
      </List>
    );
  };

  const renderChats = () => {
    return (
      <>
        {shownChats.today.length > 0 && (
          <Typography
            fontSize="small"
            color="textSecondary"
            fontWeight={"bold"}
            sx={{ marginLeft: "10px", marginTop: "10px", marginBottom: "10px" }}
          >
            Today
          </Typography>
        )}
        {shownChats.today.map((chat, index) => renderChat(chat, index))}

        {shownChats.last30Days.length > 0 && (
          <Typography
            fontSize="small"
            color="textSecondary"
            fontWeight={"bold"}
            sx={{ marginLeft: "10px", marginTop: "10px", marginBottom: "10px" }}
          >
            Last 30 days
          </Typography>
        )}
        {shownChats.last30Days.map((chat, index) => renderChat(chat, index))}
      </>
    );
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <Stack sx={{ height: "100vh", borderRight: DRAWER_RIGHT_BORDER }}>
          <Box sx={{ overflowY: "auto" }}>
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
                  disabled={!currentConversationId}
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
                <ListItemButton
                  sx={styles.listItemButton}
                  onClick={() => {
                    setWorkspaceOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <SpaceDashboardOutlined fontSize="small" />
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
            {renderFolders()}
            {open && <List>{renderChats()}</List>}
          </Box>

          <ListItem
            sx={{
              marginTop: "auto",
              justifyContent: open ? "flex-start" : "center",
              flexDirection: "row",
            }}
          >
            <Avatar
              alt={`${user.given_name ?? ""} ${user.family_name}`}
              sx={{
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
              }}
            >
              {user.given_name?.charAt(0) ?? ""}
            </Avatar>

            {open && (
              <Typography
                variant={md ? "subtitle2" : "subtitle1"}
                color={"primary"}
                noWrap
                sx={{
                  mr: { sm: 0.3, md: 1 },
                  ml: { sm: 0.3, md: 1 },
                  mb: 0,
                }}
              >
                {user.given_name ?? ""} {user.family_name ?? ""}
              </Typography>
            )}

            {open && (
              <IconButton edge="end" onClick={handleSignOut}>
                <LogoutOutlined color="primary" />
              </IconButton>
            )}
          </ListItem>
          {!open && (
            <Stack>
              <IconButton edge="end" onClick={handleSignOut}>
                <LogoutOutlined color="primary" />
              </IconButton>
            </Stack>
          )}
        </Stack>
      </Drawer>

      <SettingsModal open={settingsOpen} setOpen={setSettingsOpen} />
      <WorkspaceModal open={workspaceOpen} setOpen={setWorkspaceOpen} />
    </Box>
  );
}
