import * as React from "react";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { Box, IconButton, Stack } from "@mui/material";
import { ModalBox } from "./ModalBox";
import { useTheme } from "@emotion/react";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AttachmentRounded, LinkRounded } from "@mui/icons-material";

export const SourcesModal = ({ documents = [] }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const theme = useTheme();

  const displaySources = documents;

  const renderSource = (source, index) => {
    return (
      <Accordion key={index}>
        <AccordionSummary
          expandIcon={source.body ? <ExpandMoreIcon /> : null}
          aria-controls="panel2-content"
          id="panel2-header"
          sx={{ fontWeight: "bold" }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ flex: 1 }}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            {source.title}
            {source.url && (
              <IconButton aria-label="url" sx={{ ml: 2 }} href={source.url}>
                <LinkRounded color="primary" />
              </IconButton>
            )}
          </Stack>
        </AccordionSummary>
        {source.body && (
          <AccordionDetails
            componet={"a"}
            target={"_blank"}
            style={{ color: theme.palette.text.primary }}
          >
            {source.body}
          </AccordionDetails>
        )}
      </Accordion>
    );
  };

  if (displaySources.length === 0) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <IconButton
        color={"default"}
        onClick={handleOpen}
        sx={{
          ml: 2,
          "&:hover": { backgroundColor: "transparent" },
        }}
      >
        <Typography
          sx={{
            "&:hover": { color: theme.palette.text.primary },
          }}
          fontSize={"small"}
          color={"text.secondary"}
        >
          See sources
        </Typography>
      </IconButton>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <ModalBox
          sx={{
            width: "50vw",
            maxHeight: "80vh",
            overflowY: "auto",
            p: 7,
          }}
        >
          <Typography
            id="modal-modal-title"
            variant="h5"
            component="h1"
            sx={{ mb: 4 }}
          >
            Sources
          </Typography>

          {displaySources.map((source, index) => renderSource(source, index))}
        </ModalBox>
      </Modal>
    </div>
  );
};
