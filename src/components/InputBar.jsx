import React, { useImperativeHandle, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowUpwardOutlined, ElectricBolt, Close } from "@mui/icons-material";
import { styled } from "@mui/system";
import TOOLS from "../services/TOOLS.json";
import { NoMarginTypography } from "./utils.jsx";
import { useTheme } from "@emotion/react";
import { QUERY_MAX_TOKEN } from "../config.jsx";

const PopupBody = styled("div")(({ theme }) => {
  return {
    backgroundColor: "var(--foreground-container-color)",
    boxShadow: theme.shadows[1],
    padding: "10px 20px",
    borderRadius: theme.shape.borderRadius,
    borderWidth: 1,
    borderColor: "var(--box-shadow-color)",
    borderStyle: "solid",
    maxHeight: "50vh",
    overflow: "scroll",
  };
});

export const InputBar = React.forwardRef(
  ({ onSubmit = (value, kwargs, messageId) => {}, loading = false }, ref) => {
    const theme = useTheme();
    const [toolsAnchor, setToolsAnchor] = useState(null);
    const [selectedTool, setSelectedTool] = useState(null);
    const [isExtended, setIsExtended] = useState(false);
    const isToolsPopupOpen = Boolean(toolsAnchor);
    const toolsPopupId = isToolsPopupOpen ? "ToolsPopupId" : undefined;
    const [kwargs, setKwargs] = useState({});
    const [value, setValue] = useState("");
    const [messageId, setMessageId] = useState(null);

    const canSubmit = useMemo(() => {
      if (loading) return false;
      if (isExtended) {
        return Object.values(kwargs).some((x) => x && x.length > 0);
      } else return value.length > 0;
    }, [value, isExtended, kwargs]);

    const clear = () => {
      setValue("");
      setKwargs({});
      setMessageId(null);
    };

    const submit = () => {
      if (!canSubmit) return;
      onSubmit(value, kwargs, messageId);
      clear();
    };

    const handleBoltClick = (event) => {
      setToolsAnchor(event.currentTarget);
      setSelectedTool(null);
    };

    const handleToolsPopupClose = () => {
      setToolsAnchor(null);
    };

    const onSelectedTool = (tool) => () => {
      setSelectedTool(tool);
      handleToolsPopupClose();
      if (tool.isForm) {
        setIsExtended(true);
      }
    };

    const closeExtended = () => {
      setIsExtended(false);
      setSelectedTool(null);
    };

    useImperativeHandle(ref, () => ({
      submit: submit,
      clear: clear,
      edit: (id, val, kwargs) => {
        setValue(val);
        setKwargs(kwargs);
        setMessageId(id);
      },
    }));

    const renderExtendedInput = (name) => {
      return (
        <Stack
          key={name}
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            pb: ".2rem",
            pt: ".2rem",
          }}
        >
          <div style={{ marginRight: "0.3rem", width: "6rem" }}>
            <Typography variant="subtitle2">{name}:</Typography>
          </div>
          <InputBase
            sx={{
              background: "red",
              background: "var(--background-highlight-color)",
              p: 0.3,
              pl: 2,
              borderRadius: "17px",
              width: "100%",
            }}
            inputProps={{ p: 1 }}
            value={kwargs[name]}
            onChange={(e) => setKwargs({ ...kwargs, [name]: e.target.value })}
          />
        </Stack>
      );
    };

    const renderExtendedForm = () => {
      return (
        <Stack direction="column" spacing={1} sx={{ flex: 1, p: "2rem 3rem" }}>
          {["Name", "Surname"].map((x) => {
            return renderExtendedInput(x);
          })}
        </Stack>
      );
    };

    return (
      <div
        style={{
          position: "relative",
          width: "100%",
        }}
      >
        <Box
          sx={{
            p: "2px 4px",
            display: "flex",

            background: "var(--foreground-container-color)",

            borderRadius: theme.shape.borderRadius + "px",
            width: "100%",
            boxShadow: theme.shadows[1],

            ...(isExtended
              ? {
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                }
              : {
                  alignItems: "center",
                }),
          }}
        >
          {!isExtended && (
            <IconButton
              sx={{ p: "10px" }}
              aria-label="menu"
              onClick={handleBoltClick}
            >
              <ElectricBolt
                style={{
                  color: "var(--support-text-color)",
                }}
              />
            </IconButton>
          )}
          {selectedTool && (
            <Typography
              variant="subtitle2"
              fontSize={"small"}
              sx={{ mr: "10px", color: "var(--support-text-color)" }}
            >
              {selectedTool.name}
            </Typography>
          )}

          {isExtended ? (
            renderExtendedForm()
          ) : (
            <>
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />

              <InputBase
                sx={{
                  ml: 1,
                  flex: 1,
                  color: "var(----main-title-color)",
                  fontWeight: "bold",
                }}
                placeholder="Send a Message"
                inputProps={{
                  "aria-label": "send a message",
                  maxLength: QUERY_MAX_TOKEN,
                }}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submit();
                  }
                }}
              />
            </>
          )}

          <Stack
            justifyContent={isExtended ? "space-around" : "center"}
            direction={isExtended ? "column" : "row"}
            spacing={isExtended ? 0 : 1}
          >
            {isExtended && (
              <IconButton
                onClick={closeExtended}
                sx={{
                  p: "10px",
                  color: "var(--generic-text-color)",
                }}
                aria-label="directions"
              >
                <Close />
              </IconButton>
            )}

            <IconButton
              disabled={!canSubmit}
              onClick={submit}
              sx={{
                p: "10px",
                color: "var(--generic-text-color)",
                background: "var(--background-highlight-color)",
                "&:hover": {
                  background: "var(--blue)",
                  color: "var(--foreground-container-color)",
                },
                borderRadius: !messageId
                  ? "50%"
                  : theme.shape.borderRadius + "px",
              }}
              aria-label="directions"
            >
              {loading ? (
                <CircularProgress
                  size="1.5rem"
                  style={{ color: theme.palette.primary }}
                />
              ) : (
                <ArrowUpwardOutlined />
              )}

              {messageId && !isExtended && (
                <Typography sx={{ pl: 1, pr: 1 }} fontSize={"small"}>
                  Edit
                </Typography>
              )}
            </IconButton>

            {messageId && !isExtended && (
              <IconButton
                onClick={clear}
                sx={{
                  p: "10px",
                  aspectRatio: 1,
                  color: "var(--generic-text-color)",
                  "&:hover": {
                    background: "transparent",
                    color: theme.palette.error.main,
                  },
                }}
              >
                <Close />
              </IconButton>
            )}
          </Stack>
        </Box>

        <Popover
          id={toolsPopupId}
          open={isToolsPopupOpen}
          anchorEl={toolsAnchor}
          onClose={handleToolsPopupClose}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: toolsAnchor ? toolsAnchor.getBoundingClientRect().top - 10 : 0,
            left: toolsAnchor ? toolsAnchor.getBoundingClientRect().left : 0,
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <PopupBody>
            {
              <List>
                {TOOLS.filter((x) => !!x).map((tool, index) => (
                  <ListItemButton
                    key={tool.ID}
                    style={{
                      borderRadius: theme.shape.borderRadius,
                      "&:hover": {
                        backgroundColor: "var(--background-highlight-color)",
                      },
                    }}
                    onClick={onSelectedTool(tool)}
                  >
                    <Stack>
                      <NoMarginTypography variant="subtitle2" fontWeight="bold">
                        {tool.name}
                      </NoMarginTypography>
                      <NoMarginTypography variant="caption" color="GrayText">
                        {tool.subTitle}
                      </NoMarginTypography>
                    </Stack>
                  </ListItemButton>
                ))}
              </List>
            }
          </PopupBody>
        </Popover>
      </div>
    );
  }
);
