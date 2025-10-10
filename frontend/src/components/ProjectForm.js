import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProject,
  updateProject,
} from "../features/projects/projectsSlice";
import { fetchEmployeeList } from "../features/employees/employeeSlice";
import { fetchTechnologyList } from "../features/technologies/technologySlice";
import { fetchStatusList } from "../features/status/statusSlice";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Stack,
  Autocomplete,
  Chip,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import { subMonths, format } from 'date-fns';


const ProjectForm = ({ project = {}, onSubmit, onClose }) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    name: project.name || "",
    description: project.description || "",
    clientName: project.clientName || "",
    clientAddress: project.clientAddress || "",
    department: project.department || "",
    assignedTo: project.assignedTo
      ? project.assignedTo.map((emp) => emp._id)
      : [],
    status: project.status ? project.status[0]._id : "",
    startDate: project.startDate ? formatDateForInput(project.startDate) : "",
    deliveryDate: project.deliveryDate
      ? formatDateForInput(project.deliveryDate)
      : "",
    urls: project.urls || "",
    technology: project.technology
      ? project.technology.map((tech) => tech._id)
      : [],
  });

  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const { employeeList } = useSelector((state) => state.employees);
  const { technologyList } = useSelector((state) => state.technologies);
  const { statusList } = useSelector((state) => state.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployeeList());
    dispatch(fetchTechnologyList());
    dispatch(fetchStatusList());
  }, [dispatch]);

  const sixMonthsAgo = format(subMonths(new Date(), 6), 'yyyy-MM-dd');

  const validate = () => {
    const tempErrors = {};

    if (!formData.name) tempErrors.name = "Project name is required";
    // if (!formData.description) tempErrors.description = "Description is required";
    // if (!formData.clientName) tempErrors.clientName = "Client name is required";
    if (!formData.department) tempErrors.department = "Department is required";
    if (formData.assignedTo.length === 0) tempErrors.assignedTo = "Please assign at least one employee";
    if (!formData.status) tempErrors.status = "Status is required";
    if (!formData.startDate) tempErrors.startDate = "Start date is required";
    if (!formData.deliveryDate) tempErrors.deliveryDate = "Delivery date is required";
    // if (formData.technology.length === 0) tempErrors.technology = "Please select at least one technology";

    if (formData.startDate && formData.deliveryDate) {
      if (new Date(formData.deliveryDate) < new Date(formData.startDate)) {
        tempErrors.deliveryDate = "Delivery date must be after start date";
      }
    }

    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (validate()) {
      setIsSubmitting(true);
      try {
        if (project._id) {
          await dispatch(
            updateProject({ projectId: project._id, updatedData: formData })
          );
        } else {
          await dispatch(createProject(formData));
        }
        onSubmit();
      } catch (error) {
        toast.error("Failed to save project");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.dismiss();
      toast.error("Please fix the validation errors");
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Sticky Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
          zIndex: 1000,
          pb: 2,
          px: 3,
        }}
      >
        <Typography variant="h5">
          {project._id ? "Edit Project" : "Add New Project"}
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          py: 2,
        }}
      >
        <Container maxWidth="">
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Project Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />

              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={!!errors.description}
                helperText={errors.description}
                // required
                multiline
                rows={4}
              />

              <TextField
                fullWidth
                label="Client Name"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                error={!!errors.clientName}
                helperText={errors.clientName}
              // required
              />

              <TextField
                fullWidth
                label="Client Address"
                name="clientAddress"
                value={formData.clientAddress}
                onChange={handleInputChange}
                multiline
                rows={2}
              />

              <TextField
                fullWidth
                label="Department"
                name="department"
                select
                value={formData.department}
                onChange={handleInputChange}
                error={!!errors.department}
                helperText={errors.department}
                required
              >
                <MenuItem value="Development">Development</MenuItem>
                <MenuItem value="SEO">SEO</MenuItem>
              </TextField>

              <Autocomplete
                multiple
                options={employeeList.filter(emp => emp && emp.status !== "0")}
                getOptionLabel={(option) => option.name}
                value={employeeList.filter(emp => emp && emp.status !== "0" && formData.assignedTo.includes(emp._id))}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    assignedTo: newValue.map(emp => emp._id)
                  }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option._id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assigned To"
                    error={!!errors.assignedTo}
                    helperText={errors.assignedTo}
                    required
                  />
                )}
              />

              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                error={!!errors.startDate}
                helperText={errors.startDate}
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: sixMonthsAgo,
                  max: format(new Date(), 'yyyy-MM-dd')
                }}
              />
              <TextField
                fullWidth
                label="Delivery Date"
                name="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={handleInputChange}
                error={!!errors.deliveryDate}
                helperText={errors.deliveryDate}
                required
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="URLs"
                name="urls"
                value={formData.urls}
                onChange={handleInputChange}
              />

              <Autocomplete
                multiple
                options={technologyList}
                getOptionLabel={(option) => option.name}
                value={technologyList.filter(tech => formData.technology.includes(tech._id))}
                onChange={(event, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    technology: newValue.map(tech => tech._id)
                  }));
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option._id}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Technology"
                    error={!!errors.technology}
                    helperText={errors.technology}
                    required
                  />
                )}
              />

              <TextField
                fullWidth
                label="Status"
                name="status"
                select
                value={formData.status}
                onChange={handleInputChange}
                error={!!errors.status}
                helperText={errors.status}
                required
              >
                {statusList.map((status) => (
                  <MenuItem key={status._id} value={status._id}>
                    {status.status_name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          p: 3,
          pb: 0,
          mt: 3,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Button variant="outlined" color="primary" onClick={() => onSubmit()}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : project._id ? "Update" : "Save"}
        </Button>
      </Box>
    </Box>
  );
};

export default ProjectForm;