import React from "react";
import { Dialog, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";

const ImageZoomModal = ({ open, onClose, imageSrc, employeeName }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          position: "relative",
          overflow: "hidden",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "white",
          bgcolor: "rgba(0, 0, 0, 0.5)",
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      {imageSrc ? (
        <Box
          component="img"
          src={imageSrc}
          alt={employeeName}
          sx={{
            width: "100%",
            height: "auto",
            maxHeight: "80vh",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "400px",
            bgcolor: "grey.300",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PersonIcon sx={{ fontSize: 150, color: "grey.500" }} />
        </Box>
      )}
    </Dialog>
  );
};

export default ImageZoomModal;
