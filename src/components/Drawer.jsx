import React, { useState, useEffect, useRef } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  CssBaseline,
  Box,
  ListItemButton,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  SettingsOutlined,
  ChevronLeft,
  ChevronRight,
  Dashboard,
  LogoutOutlined,
} from "@mui/icons-material";
import ico from "../assets/mike_logo.png";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "@emotion/react";
import { SettingsModal } from "./SettingsModal";

const drawerWidth = 240;
const minimizedDrawerWidth = 60;

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

const AppDrawer = () => {
  const [open, setOpen] = useState(true);
  const inputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { user, logout } = useAuth();

  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const md = useMediaQuery(theme.breakpoints.down("md"));

  const handleSignOut = () => {
    logout().then();
  };

  const handleDrawerToggle = () => {
    setOpen((o) => !o);
  };

  const handleSearch = (event) => {
    const { value } = event.target;
    setSearchTerm(value);

    const results = [];
    setSearchResults(results);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: open ? drawerWidth : minimizedDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : minimizedDrawerWidth,
            boxSizing: "border-box",
            transition: "width 0.3s",
          },
        }}
      >
        <div>
          <List>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <ListItemButton sx={styles.listItemButton}>
                <ListItemIcon>
                  <img
                    src={ico}
                    alt="ico"
                    style={{
                      width: "1.5rem",
                      resizeMode: "contain",
                    }}
                  />
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary="New Chat"
                    primaryTypographyProps={styles.itemLabelTypographyProps}
                  />
                )}
              </ListItemButton>
              {open && <SettingsModal />}
            </div>

            <ListItemButton sx={styles.listItemButton}>
              <ListItemIcon>
                <Dashboard fontSize="10" />
              </ListItemIcon>
              <ListItemText
                primary="Workspace"
                primaryTypographyProps={styles.itemLabelTypographyProps}
              />
            </ListItemButton>
            <ListItemButton
              sx={{
                ...styles.listItemButton,
                backgroundColor: "#F5F5F5",
                dispelay: "flex",
              }}
              onClick={() => {
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
          </List>
        </div>
        {/** BOTTONI "All"  & "Folder1" */}
        {/* <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <ListItemButton sx={styles.searchSelectionButton}>
            <ListItemText
              primary="All"
              primaryTypographyProps={styles.itemLabelTypographyProps}
            />
          </ListItemButton>
          <ListItemButton sx={styles.searchSelectionButton}>
            <ListItemText
              primary="Folder1"
              primaryTypographyProps={styles.itemLabelTypographyProps}
            />
          </ListItemButton>
        </Stack> */}
        {open && (
          <>
            <List>
              {searchResults.map((item, index) => (
                <ListItemButton key={index}>
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={styles.itemLabelTypographyProps}
                  />
                </ListItemButton>
              ))}

              <ListItem sx={{ ml: "5px", width: "auto" }}>
                <ListItemText
                  primary="Today"
                  primaryTypographyProps={styles.chatLabelTypographyProps}
                />
              </ListItem>

              <ListItemButton
                sx={{ ...styles.listItemButton, ...styles.chatItem }}
              >
                <ListItemText
                  primary="Chat 1"
                  primaryTypographyProps={styles.itemLabelTypographyProps}
                />
              </ListItemButton>

              <ListItemButton
                sx={{ ...styles.listItemButton, ...styles.chatItem }}
              >
                <ListItemText
                  primary="Chat 2"
                  primaryTypographyProps={styles.itemLabelTypographyProps}
                />
              </ListItemButton>

              <ListItemButton
                sx={{ ...styles.listItemButton, ...styles.chatItem }}
              >
                <ListItemText
                  primary="Chat 3"
                  primaryTypographyProps={styles.itemLabelTypographyProps}
                />
              </ListItemButton>

              <ListItem sx={{ ml: "5px", width: "auto" }}>
                <ListItemText
                  primary="Last 30 days"
                  primaryTypographyProps={styles.chatLabelTypographyProps}
                />
              </ListItem>
            </List>
          </>
        )}

        <ListItem
          sx={{
            marginTop: "auto",
            justifyContent: open ? "flex-start" : "center",
            flexDirection: "row",
          }}
        >
          <Avatar alt="User Logo" src="logo.png" />

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
          <IconButton edge="end" onClick={handleSignOut}>
            <LogoutOutlined color="primary" />
          </IconButton>
        )}
      </Drawer>

      {/* Ceneterd arrow to open/close the drawer */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          zIndex: 1,
          backgroundColor: "var(--background-highlight-color)",
        }}
      >
        <IconButton onClick={handleDrawerToggle}>
          {open ? (
            <ChevronLeft
              fontSize="large"
              sx={{ color: "var(--support-text-color)" }}
            />
          ) : (
            <ChevronRight
              fontSize="large"
              sx={{ color: "var(--support-text-color)" }}
            />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

export default AppDrawer;
