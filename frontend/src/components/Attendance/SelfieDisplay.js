import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Paper,
  Alert,
} from '@mui/material';
import { Close as CloseIcon, ZoomIn as ZoomInIcon, CameraAlt } from '@mui/icons-material';

const SelfieDisplay = ({ clockInSelfie, clockOutSelfie, title }) => {
  const [openImage, setOpenImage] = useState(null);

  const handleOpenImage = (image) => {
    setOpenImage(image);
  };

  const handleCloseImage = () => {
    setOpenImage(null);
  };

  // Check if both selfies are missing
  const noSelfies = !clockInSelfie && !clockOutSelfie;

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}

      {noSelfies ? (
        <Paper
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: 'background.default',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CameraAlt sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography color="text.secondary">
              No selfies available for this attendance
            </Typography>
          </Stack>
        </Paper>
      ) : (
        <Stack direction="row" spacing={2} justifyContent="center">
          {clockInSelfie ? (
            <Paper 
              elevation={3}
              sx={{ 
                p: 1,
                position: 'relative',
                '&:hover .zoom-icon': {
                  opacity: 1,
                },
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Clock In Selfie
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={clockInSelfie}
                  alt="Clock In Selfie"
                  style={{ 
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => handleOpenImage(clockInSelfie)}
                />
                <IconButton
                  className="zoom-icon"
                  sx={{
                    position: 'absolute',
                    right: 5,
                    top: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                  size="small"
                  onClick={() => handleOpenImage(clockInSelfie)}
                >
                  <ZoomInIcon />
                </IconButton>
              </Box>
            </Paper>
          ) : (
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                width: '150px',
                height: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
              }}
            >
              <CameraAlt sx={{ fontSize: 24, color: 'text.disabled', mb: 1 }} />
              <Typography variant="caption" color="text.secondary">
                No Clock In Selfie
              </Typography>
            </Paper>
          )}

          {clockOutSelfie ? (
            <Paper 
              elevation={3}
              sx={{ 
                p: 1,
                position: 'relative',
                '&:hover .zoom-icon': {
                  opacity: 1,
                },
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Clock Out Selfie
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <img
                  src={clockOutSelfie}
                  alt="Clock Out Selfie"
                  style={{ 
                    width: '150px',
                    height: '150px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onClick={() => handleOpenImage(clockOutSelfie)}
                />
                <IconButton
                  className="zoom-icon"
                  sx={{
                    position: 'absolute',
                    right: 5,
                    top: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                  size="small"
                  onClick={() => handleOpenImage(clockOutSelfie)}
                >
                  <ZoomInIcon />
                </IconButton>
              </Box>
            </Paper>
          ) : (
            <Paper
              sx={{
                p: 2,
                textAlign: 'center',
                width: '150px',
                height: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
              }}
            >
              <CameraAlt sx={{ fontSize: 24, color: 'text.disabled', mb: 1 }} />
              <Typography variant="caption" color="text.secondary">
                No Clock Out Selfie
              </Typography>
            </Paper>
          )}
        </Stack>
      )}

      <Dialog 
        open={!!openImage} 
        onClose={handleCloseImage}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2 }}>
          <IconButton
            onClick={handleCloseImage}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {openImage && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={openImage}
                alt="Selfie"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SelfieDisplay;