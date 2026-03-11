import React, { useState } from "react";
import { Box, Container, Paper, Tabs, Tab, Typography } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import HelpDeskAdmin from "./HelpDesk";
import HelpDeskUser from "./HelpDeskUser/HelpDesk";

const SupportDeskPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #e5e7eb",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1e3a5f 0%, #2d5f8a 100%)",
            p: 3,
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <SupportAgentIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Support Desk
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Submit tickets and manage all support requests
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
              },
            }}
          >
            <Tab label="Submit Ticket" />
            <Tab label="All Tickets" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box>
          {activeTab === 0 && <HelpDeskUser hideHeader />}
          {activeTab === 1 && <HelpDeskAdmin hideHeader />}
        </Box>
      </Paper>
    </Container>
  );
};

export default SupportDeskPage;
