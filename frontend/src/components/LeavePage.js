import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import LeaveManagement from "./LeaveManagement";
import LeaveRequest from "./LeaveRequest/LeaveRequest";

const LeavePage = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2,
            bgcolor: "white",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.9rem",
            },
          }}
        >
          <Tab label="My Leaves" />
          <Tab label="Leave Requests" />
        </Tabs>
      </Paper>

      {activeTab === 0 && <LeaveManagement />}
      {activeTab === 1 && <LeaveRequest />}
    </Box>
  );
};

export default LeavePage;
