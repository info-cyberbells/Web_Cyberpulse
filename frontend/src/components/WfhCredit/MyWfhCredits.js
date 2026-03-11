import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Avatar,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  WorkspacePremium,
  CalendarMonth,
  Person,
} from "@mui/icons-material";
import { fetchMyWfhCredits } from "../../features/wfhCredit/wfhCreditSlice";

const CRITERIA_LABELS = {
  targetAchievement: { label: "100% Target Achievement / Meeting Deadline", credits: 2 },
  attendance: { label: "100% Attendance", credits: 1 },
  clientAppreciation: { label: "Client Appreciation", credits: 1 },
  teamwork: { label: "Teamwork", credits: 1 },
};

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MyWfhCredits = () => {
  const dispatch = useDispatch();
  const { myCredits, loading, error } = useSelector((state) => state.wfhCredit);

  useEffect(() => {
    dispatch(fetchMyWfhCredits());
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        My WFH Credits
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        View your monthly WFH credit evaluations. 5/5 credits required for WFH eligibility.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === "string" ? error : error?.message || "Failed to load credits"}
        </Alert>
      )}

      {(!myCredits || myCredits.length === 0) && !loading && (
        <Alert severity="info">No credit evaluations found yet.</Alert>
      )}

      {(myCredits || []).map((credit) => (
        <Card
          key={credit._id}
          elevation={0}
          sx={{
            mb: 3,
            border: "1px solid",
            borderColor: credit.isEligible ? "success.light" : "error.light",
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CalendarMonth color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  {MONTHS[credit.month]} {credit.year}
                </Typography>
              </Stack>
              <Chip
                icon={<WorkspacePremium />}
                label={credit.isEligible ? "WFH ELIGIBLE" : "NOT ELIGIBLE"}
                color={credit.isEligible ? "success" : "error"}
                variant="filled"
                sx={{ fontWeight: "bold" }}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Criteria Details */}
            <Grid container spacing={2}>
              {Object.entries(CRITERIA_LABELS).map(([key, config]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: credit.criteria?.[key]?.status ? "success.50" : "grey.50",
                      border: "1px solid",
                      borderColor: credit.criteria?.[key]?.status ? "success.200" : "grey.200",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      {credit.criteria?.[key]?.status ? (
                        <CheckCircle color="success" fontSize="small" />
                      ) : (
                        <Cancel color="error" fontSize="small" />
                      )}
                      <Typography variant="body2" fontWeight="600">
                        {config.label}
                      </Typography>
                      <Chip
                        label={`${credit.criteria?.[key]?.status ? config.credits : 0}/${config.credits}`}
                        size="small"
                        color={credit.criteria?.[key]?.status ? "success" : "default"}
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      Reason: {credit.criteria?.[key]?.reason || "N/A"}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* Footer */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Person fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Evaluated by: <strong>{credit.evaluatorId?.name || "N/A"}</strong>
                </Typography>
              </Stack>
              <Typography variant="subtitle1" fontWeight="bold">
                Total Credits: {credit.totalCredits}/5
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default MyWfhCredits;
