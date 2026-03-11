import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  Stack,
  Avatar,
  useTheme,
  Container,
} from "@mui/material";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import GradingIcon from "@mui/icons-material/Grading";
import ListAltIcon from "@mui/icons-material/ListAlt";
import WfhCreditEvaluation from "./WfhCreditEvaluation";
import WfhCreditList from "./WfhCreditList";

const WfhCreditsPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 2, mt: -1 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              bgcolor: "white",
              color: "primary.main",
              width: 48,
              height: 48,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
            }}
          >
            <HomeWorkIcon />
          </Avatar>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={600}>
              WFH Credits
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Evaluate and manage employee Work From Home credits
            </Typography>
          </Stack>
        </Box>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 52,
            },
          }}
        >
          <Tab icon={<GradingIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Evaluation" />
          <Tab icon={<ListAltIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Credit List" />
        </Tabs>

        {/* Tab Content */}
        {activeTab === 0 && <WfhCreditEvaluation />}
        {activeTab === 1 && <WfhCreditList />}
      </Paper>
    </Container>
  );
};

export default WfhCreditsPage;
