import {
  Box,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
} from "@mui/material";
import { ConversationService } from "../services/ConversationService";
import { MoreHorizOutlined } from "@mui/icons-material";
import { ChatModal } from "./ChatModal";
import { useState } from "react";
import { useTheme } from "@emotion/react";
import { drawerItemMarginPx } from "../config";

export const ChatItem = ({ chat, currentConversationId, styles }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isSelected = String(chat.id) === String(currentConversationId);
  const theme = useTheme();

  return (
    <Stack sx={{ mr: drawerItemMarginPx * 2 + "px" }}>
      <ListItem
        sx={{
          flexGrow: 1,
          ...styles.listItemButton,
          backgroundColor: isSelected
            ? "var(--background-highlight-color)"
            : "transparent",
          borderWidth: 0,
          "&:hover": {
            backgroundColor: "var(--background-highlight-color)",
          },
        }}
        onClick={() => {
          ConversationService.openConversation(chat.id);
        }}
      >
        <ListItemText
          primary={chat.name || "Untitled chat"}
          primaryTypographyProps={{
            ...styles.itemLabelTypographyProps,
            // overflow fix
            noWrap: true,
          }}
        />
        <ListItemSecondaryAction>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: "transparent",
                color: theme.palette.text.primary,
              },
            }}
          >
            <MoreHorizOutlined fontSize="small" />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>

      <ChatModal open={isModalOpen} setOpen={setIsModalOpen} chat={chat} />
    </Stack>
  );
};
