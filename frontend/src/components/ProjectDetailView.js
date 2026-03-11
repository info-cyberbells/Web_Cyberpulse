import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Divider,
  alpha,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BusinessIcon from "@mui/icons-material/Business";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import TimerIcon from "@mui/icons-material/Timer";
import CodeIcon from "@mui/icons-material/Code";
import { format } from "date-fns";
import {
  fetchProjectDetail,
  fetchProjectTasks,
  clearCurrentProject,
} from "../features/projects/projectsSlice";

// ── Helpers ──

const formatDuration = (seconds) => {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const getStatusConfig = (status) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "work in progress":
      return { color: "#FF9800", label: "In Progress" };
    case "delayed":
      return { color: "#F44336", label: "Delayed" };
    case "completed":
      return { color: "#4CAF50", label: "Completed" };
    case "paused":
      return { color: "#9E9E9E", label: "Paused" };
    default:
      return { color: "#2196F3", label: status || "Unknown" };
  }
};

const getTaskStatusConfig = (status) => {
  switch (status) {
    case "Completed":
      return { color: "#4CAF50", bg: "#e8f5e9" };
    case "In Progress":
      return { color: "#2196F3", bg: "#e3f2fd" };
    case "Paused":
      return { color: "#FF9800", bg: "#fff3e0" };
    case "Pending":
      return { color: "#9E9E9E", bg: "#f5f5f5" };
    default:
      return { color: "#9E9E9E", bg: "#f5f5f5" };
  }
};

const stripHtml = (html) => {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// ── Component ──

const ProjectDetailView = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProject, projectTasks, detailLoading, error } = useSelector(
    (state) => state.projects
  );

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    dispatch(fetchProjectDetail(projectId));
    return () => dispatch(clearCurrentProject());
  }, [projectId, dispatch]);

  useEffect(() => {
    if (currentProject?.name) {
      dispatch(fetchProjectTasks(currentProject.name));
    }
  }, [currentProject?.name, dispatch]);

  if (detailLoading && !currentProject) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error && !currentProject) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">Failed to load project details.</Typography>
      </Box>
    );
  }

  if (!currentProject) return null;

  const project = currentProject;
  const projectStatus =
    project.status?.length > 0 ? project.status[0]?.name || project.status[0] : "Unknown";
  const statusConfig = getStatusConfig(projectStatus);
  const summary = projectTasks?.summary || {};
  const allTasks = projectTasks?.allTasks || [];
  const tasksByEmployee = projectTasks?.tasksByEmployee || [];

  const daysRemaining = (() => {
    if (!project.deliveryDate) return null;
    const today = new Date();
    const deadline = new Date(project.deliveryDate);
    return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
  })();

  return (
    <Box sx={{ bgcolor: "#f4f6fb", minHeight: "100vh", py: 3, px: { xs: 1.5, sm: 3 } }}>
      {/* ── Back Button ── */}
      <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
        <IconButton
          onClick={() => navigate("/projects")}
          sx={{
            bgcolor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} color="#1e1e2f">
          Project Details
        </Typography>
      </Stack>

      {/* ── Project Header Card ── */}
      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          mb: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* Top gradient bar */}
        <Box
          sx={{
            height: 6,
            background: `linear-gradient(90deg, ${statusConfig.color}, ${alpha(statusConfig.color, 0.4)})`,
          }}
        />
        <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={2}
            mb={2.5}
          >
            <Box>
              <Typography variant="h4" fontWeight={800} color="#1e1e2f" gutterBottom>
                {project.name}
              </Typography>
              {project.clientName && (
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <BusinessIcon sx={{ fontSize: 18, color: "#666" }} />
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    {project.clientName}
                  </Typography>
                </Stack>
              )}
            </Box>
            <Chip
              label={statusConfig.label}
              sx={{
                borderRadius: "20px",
                height: 32,
                bgcolor: alpha(statusConfig.color, 0.12),
                color: statusConfig.color,
                border: `1px solid ${alpha(statusConfig.color, 0.3)}`,
                fontWeight: 700,
                fontSize: "0.85rem",
              }}
            />
          </Stack>

          {/* Description */}
          {project.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 2.5, lineHeight: 1.7 }}
            >
              {project.description}
            </Typography>
          )}

          {/* Meta info row */}
          <Grid container spacing={2}>
            {/* Timeline */}
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  bgcolor: "#f8f9fc",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid #eef0f5",
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ letterSpacing: 1 }}
                >
                  Timeline
                </Typography>
                <Stack spacing={1.2} mt={1}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: "#1976D2" }} />
                    <Typography variant="body2" fontWeight={500}>
                      Start: {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "N/A"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <CalendarTodayIcon
                      sx={{
                        fontSize: 16,
                        color: daysRemaining !== null && daysRemaining < 0 ? "#F44336" : "#E65100",
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      Due: {project.deliveryDate ? format(new Date(project.deliveryDate), "MMM d, yyyy") : "N/A"}
                      {daysRemaining !== null && daysRemaining > 0 && (
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                          ({daysRemaining} days left)
                        </Typography>
                      )}
                      {daysRemaining === 0 && (
                        <Typography component="span" variant="caption" color="error" sx={{ ml: 0.5 }}>
                          (Due today)
                        </Typography>
                      )}
                      {daysRemaining !== null && daysRemaining < 0 && (
                        <Typography component="span" variant="caption" color="error" sx={{ ml: 0.5 }}>
                          (Overdue)
                        </Typography>
                      )}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Grid>

            {/* Department & Tech */}
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  bgcolor: "#f8f9fc",
                  borderRadius: 2,
                  p: 2,
                  border: "1px solid #eef0f5",
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ letterSpacing: 1 }}
                >
                  Details
                </Typography>
                <Stack spacing={1.2} mt={1}>
                  {project.department && (
                    <Typography variant="body2" fontWeight={500}>
                      Department: {project.department}
                    </Typography>
                  )}
                  {project.technology?.length > 0 && (
                    <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
                      <CodeIcon sx={{ fontSize: 16, color: "#5E35B1" }} />
                      {project.technology.map((tech, i) => (
                        <Chip
                          key={i}
                          label={tech.name || tech}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: "0.72rem",
                            bgcolor: "#EDE7F6",
                            color: "#5E35B1",
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Grid>

            {/* URLs */}
            {project.urls && (
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    bgcolor: "#f8f9fc",
                    borderRadius: 2,
                    p: 2,
                    border: "1px solid #eef0f5",
                  }}
                >
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    fontWeight={700}
                    sx={{ letterSpacing: 1 }}
                  >
                    URLs
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ mt: 1, wordBreak: "break-all" }}
                  >
                    {project.urls}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Box>
      </Paper>

      {/* ── Stats Cards ── */}
      <Grid container spacing={2} mb={3}>
        {[
          {
            label: "Total Tasks",
            value: summary.totalTasks || 0,
            icon: <AssignmentIcon />,
            color: "#1976D2",
            bg: "#e3f2fd",
          },
          {
            label: "Completed",
            value: summary.completed || 0,
            icon: <CheckCircleIcon />,
            color: "#2e7d32",
            bg: "#e8f5e9",
          },
          {
            label: "In Progress",
            value: summary.inProgress || 0,
            icon: <HourglassEmptyIcon />,
            color: "#ed6c02",
            bg: "#fff3e0",
          },
          {
            label: "Total Hours",
            value: formatDuration(summary.totalDuration || 0),
            icon: <TimerIcon />,
            color: "#7b1fa2",
            bg: "#f3e5f5",
          },
        ].map((stat, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card
              sx={{
                borderRadius: 2.5,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                border: "1px solid #eef0f5",
              }}
            >
              <CardContent sx={{ textAlign: "center", py: 2.5 }}>
                <Avatar
                  sx={{
                    bgcolor: stat.bg,
                    color: stat.color,
                    width: 44,
                    height: 44,
                    mx: "auto",
                    mb: 1,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h5" fontWeight={800} color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {stat.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Team Members ── */}
      <Paper
        sx={{
          borderRadius: 3,
          mb: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <GroupIcon sx={{ color: "#5E35B1", fontSize: 22 }} />
              <Typography variant="h6" fontWeight={700}>
                Team Members
              </Typography>
              <Chip
                label={project.assignedTo?.length || 0}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.72rem",
                  bgcolor: "#EDE7F6",
                  color: "#5E35B1",
                  fontWeight: 700,
                }}
              />
            </Stack>
            {selectedEmployee && (
              <Chip
                label="Show All"
                onClick={() => setSelectedEmployee(null)}
                onDelete={() => setSelectedEmployee(null)}
                size="small"
                sx={{
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  bgcolor: "#e3f2fd",
                  color: "#1976D2",
                }}
              />
            )}
          </Stack>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {(project.assignedTo || []).map((member, idx) => {
              const name = member.name || member;
              const memberId = member._id || name;
              const empData = tasksByEmployee.find(
                (te) => te.employee?._id === member._id || te.employee?.name === name
              );
              const taskCount = empData?.tasks?.length || 0;
              const totalTime = empData?.tasks?.reduce((sum, t) => sum + (t.duration || 0), 0) || 0;
              const isSelected = selectedEmployee === memberId;

              return (
                <Box
                  key={idx}
                  onClick={() => setSelectedEmployee(isSelected ? null : memberId)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    bgcolor: isSelected ? alpha("#5E35B1", 0.08) : "#f8f9fc",
                    borderRadius: 2,
                    px: 2,
                    py: 1.2,
                    border: isSelected ? "2px solid #5E35B1" : "1px solid #eef0f5",
                    minWidth: 200,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#5E35B1",
                      bgcolor: alpha("#5E35B1", 0.05),
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Avatar
                    src={member.image}
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: isSelected ? "#5E35B1" : "#7E57C2",
                      fontSize: 14,
                      fontWeight: 700,
                      border: isSelected ? "2px solid #5E35B1" : "none",
                    }}
                  >
                    {(name || "E")[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={700} fontSize="0.84rem">
                      {name}
                    </Typography>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="caption" color="text.secondary">
                        {taskCount} task{taskCount !== 1 ? "s" : ""}
                      </Typography>
                      {totalTime > 0 && (
                        <>
                          <Box sx={{ width: 3, height: 3, borderRadius: "50%", bgcolor: "#bbb" }} />
                          <Typography variant="caption" color="#7b1fa2" fontWeight={600}>
                            {formatDuration(totalTime)}
                          </Typography>
                        </>
                      )}
                    </Stack>
                  </Box>
                  {isSelected && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#5E35B1",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>

      {/* ── Tasks Table ── */}
      {(() => {
        // Filter tasks based on selected employee
        const filteredTasks = selectedEmployee
          ? allTasks.filter((task) => {
              const empId = task.employeeId?._id || task.employeeId;
              const empName = task.employeeId?.name;
              return empId === selectedEmployee || empName === selectedEmployee;
            })
          : allTasks;

        // Get selected employee info for summary bar
        const selectedEmpData = selectedEmployee
          ? tasksByEmployee.find((te) => {
              return te.employee?._id === selectedEmployee || te.employee?.name === selectedEmployee;
            })
          : null;

        const selectedEmpName = selectedEmpData?.employee?.name || "";
        const selectedTotalTime = filteredTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
        const selectedCompleted = filteredTasks.filter((t) => t.status === "Completed").length;
        const selectedInProgress = filteredTasks.filter((t) => t.status === "In Progress").length;

        return (
      <Paper
        sx={{
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Selected employee summary bar */}
        {selectedEmployee && selectedEmpName && (
          <Box
            sx={{
              bgcolor: alpha("#5E35B1", 0.06),
              borderBottom: "1px solid",
              borderColor: alpha("#5E35B1", 0.15),
              px: { xs: 2, sm: 3 },
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#5E35B1",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {selectedEmpName[0].toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} color="#5E35B1">
                  {selectedEmpName}'s Tasks
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" gap={1.5} flexWrap="wrap">
              <Chip
                label={`${filteredTasks.length} Total`}
                size="small"
                sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: "#e3f2fd", color: "#1976D2" }}
              />
              <Chip
                label={`${selectedCompleted} Done`}
                size="small"
                sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: "#e8f5e9", color: "#2e7d32" }}
              />
              <Chip
                label={`${selectedInProgress} Active`}
                size="small"
                sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: "#fff3e0", color: "#e65100" }}
              />
              <Chip
                icon={<TimerIcon sx={{ fontSize: "14px !important" }} />}
                label={formatDuration(selectedTotalTime)}
                size="small"
                sx={{ fontWeight: 700, fontSize: "0.72rem", bgcolor: "#f3e5f5", color: "#7b1fa2" }}
              />
            </Stack>
          </Box>
        )}

        <Box sx={{ p: { xs: 2, sm: 3 }, pb: 1.5 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
            <AssignmentIcon sx={{ color: "#1976D2", fontSize: 22 }} />
            <Typography variant="h6" fontWeight={700}>
              {selectedEmployee ? `${selectedEmpName}'s Tasks` : "All Tasks"}
            </Typography>
            {filteredTasks.length > 0 && (
              <Chip
                label={filteredTasks.length}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.72rem",
                  bgcolor: "#e3f2fd",
                  color: "#1976D2",
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>
        </Box>

        <Divider />

        {detailLoading && !allTasks.length ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : filteredTasks.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
            <AssignmentIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
            <Typography variant="body1">
              {selectedEmployee ? `No tasks found for ${selectedEmpName}` : "No tasks found for this project"}
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8f9fc" }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#555" }}>
                    Employee
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#555" }}>
                    Description
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#555" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#555" }}>
                    Estimated
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#555" }}>
                    Time Worked
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", color: "#555" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task, idx) => {
                  const taskStatus = getTaskStatusConfig(task.status);
                  const empName = task.employeeId?.name || "Unknown";
                  const desc = stripHtml(task.description);
                  const estH = task.estimatedHours || 0;
                  const estM = task.estimatedMinutes || 0;
                  const estStr = estH > 0 ? `${estH}h ${estM}m` : `${estM}m`;

                  let dateStr = "N/A";
                  try {
                    if (task.assignedDate) {
                      dateStr = format(new Date(task.assignedDate), "dd MMM yyyy");
                    }
                  } catch {
                    dateStr = "N/A";
                  }

                  return (
                    <TableRow
                      key={task._id || idx}
                      sx={{
                        "&:hover": { bgcolor: "#fafbfd" },
                        borderLeft: `3px solid ${taskStatus.color}`,
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: 12,
                              bgcolor: "#5E35B1",
                              fontWeight: 700,
                            }}
                          >
                            {empName[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600} fontSize="0.82rem">
                            {empName}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={desc} arrow placement="top">
                          <Typography
                            variant="body2"
                            fontSize="0.82rem"
                            sx={{
                              maxWidth: 280,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {desc || "No description"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.82rem" color="text.secondary">
                          {dateStr}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.82rem" color="text.secondary">
                          {estStr}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontSize="0.82rem" fontWeight={600}>
                          {formatDuration(task.duration)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.status}
                          size="small"
                          sx={{
                            bgcolor: taskStatus.bg,
                            color: taskStatus.color,
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            height: 24,
                            border: `1px solid ${alpha(taskStatus.color, 0.3)}`,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
        );
      })()}
    </Box>
  );
};

export default ProjectDetailView;
