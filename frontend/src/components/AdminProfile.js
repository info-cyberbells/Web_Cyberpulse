import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  CircularProgress,
  Paper,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Chip,
  Grid,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera,
  Lock as LockIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  AdminPanelSettings as AdminIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Language as WebIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../features/employees/employeeSlice";
import {
  getAdminProfile,
  updateAdminProfile,
  updateOrgDetails,
} from "../services/services";

// ───────────────────────── helpers ──────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();


// ═══════════════════════ COMPONENT ══════════════════════════
const AdminProfile = () => {
  const dispatch = useDispatch();
  const { loading: reduxLoading } = useSelector((s) => s.employees);

  // ── tab ──
  const [activeTab, setActiveTab] = useState(0);

  // ── page loading ──
  const [pageLoading, setPageLoading] = useState(true);

  // ── admin personal data ──
  const [adminData, setAdminData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    dob: null,
    gender: "",
    department: "",
    position: "",
    jobRole: "",
    image: "",
    organizationId: "",
    type: 1,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [adminEditMode, setAdminEditMode] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminErrors, setAdminErrors] = useState({});

  // ── org data ──
  const [orgData, setOrgData] = useState({
    orgName: "",
    location: "",
    orgType: "",
    description: "",
    orgSize: "",
    phone: "",
    email: "",
    logo: "",
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [orgEditMode, setOrgEditMode] = useState(false);
  const [orgSaving, setOrgSaving] = useState(false);

  // ── password ──
  const [pwdModal, setPwdModal] = useState(false);
  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwdError, setPwdError] = useState("");
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // ─────────────────────── Fetch data on mount ─────────────────────────
  const fetchData = useCallback(async () => {
    setPageLoading(true);
    try {
      const res = await getAdminProfile();
      if (res?.success) {
        const { admin, organization } = res.data;
        setAdminData({
          id: admin.id || admin._id || "",
          name: admin.name || "",
          email: admin.email || "",
          phone: admin.phone || "",
          address: admin.address || "",
          city: admin.city || "",
          state: admin.state || "",
          pincode: admin.pincode || "",
          dob: admin.dob ? new Date(admin.dob) : null,
          gender: admin.gender || "",
          department: admin.department || "",
          position: admin.position || "",
          jobRole: admin.jobRole || "",
          image: admin.image || "",
          organizationId: admin.organizationId || "",
          type: admin.type,
        });
        setImagePreview(admin.image || null);

        if (organization) {
          setOrgData({
            orgName: organization.orgName || "",
            location: organization.location || "",
            orgType: organization.orgType || "",
            description: organization.description || "",
            orgSize: organization.orgSize || "",
            phone: organization.phone || "",
            email: organization.email || "",
            logo: organization.logo || "",
          });
          setLogoPreview(organization.logo || null);
        }
      }
    } catch (err) {
      // Fallback to localStorage
      try {
        const storedData = JSON.parse(localStorage.getItem("user"));
        const emp = storedData?.employee;
        if (emp) {
          setAdminData({
            id: emp.id || "",
            name: emp.name || "",
            email: emp.email || "",
            phone: emp.phone || "",
            address: emp.address || "",
            city: emp.city || "",
            state: emp.state || "",
            pincode: emp.pincode || "",
            dob: emp.dob ? new Date(emp.dob) : null,
            gender: emp.gender || "",
            department: emp.department || "",
            position: emp.position || "",
            jobRole: emp.jobRole || "",
            image: emp.image || "",
            organizationId: emp.organizationId || "",
            type: emp.type,
          });
          setImagePreview(emp.image || null);
        }
      } catch (_) { }
      toast.error("Could not load full profile from server.");
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─────────────────────── Image upload ─────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Image must be smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setAdminData((p) => ({ ...p, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      toast.error("Logo must be smaller than 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setOrgData((p) => ({ ...p, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ─────────────────────── Admin profile save ─────────────────────────
  const validateAdmin = () => {
    const errs = {};
    if (!adminData.name?.trim()) errs.name = "Name is required";
    if (adminData.phone && !/^\d{10}$/.test(adminData.phone.replace(/[- ]/g, "")))
      errs.phone = "Phone must be 10 digits";
    if (adminData.pincode && !/^\d{6}$/.test(adminData.pincode))
      errs.pincode = "Pincode must be 6 digits";
    setAdminErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAdminSave = async () => {
    if (!validateAdmin()) {
      toast.error("Please fix errors before saving.");
      return;
    }
    setAdminSaving(true);
    try {
      const payload = {
        name: adminData.name,
        phone: adminData.phone,
        address: adminData.address,
        city: adminData.city,
        state: adminData.state,
        pincode: adminData.pincode,
        gender: adminData.gender,
        dob: adminData.dob ? adminData.dob.toISOString() : null,
        image: adminData.image,
      };
      const res = await updateAdminProfile(payload);
      if (res?.success) {
        toast.success("Profile updated successfully!");
        setAdminEditMode(false);
        setAdminErrors({});
        // Update localStorage
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        if (stored?.employee) {
          stored.employee = { ...stored.employee, ...res.data };
          localStorage.setItem("user", JSON.stringify(stored));
        }
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setAdminSaving(false);
    }
  };

  const handleAdminCancel = () => {
    fetchData();
    setAdminEditMode(false);
    setAdminErrors({});
  };

  // ─────────────────────── Org save ─────────────────────────
  const handleOrgSave = async () => {
    if (!orgData.orgName?.trim()) {
      toast.error("Organization name is required.");
      return;
    }
    setOrgSaving(true);
    try {
      const res = await updateOrgDetails(orgData);
      if (res?.success) {
        toast.success("Organization details updated!");
        setOrgEditMode(false);
        // Trigger navbar refresh
        window.dispatchEvent(new CustomEvent("orgUpdated"));
      } else {
        toast.error("Failed to update organization.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update organization.");
    } finally {
      setOrgSaving(false);
    }
  };

  const handleOrgCancel = () => {
    fetchData();
    setOrgEditMode(false);
  };

  // ─────────────────────── Password ─────────────────────────
  const handlePasswordSubmit = () => {
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      setPwdError("Passwords do not match.");
      return;
    }
    if (pwdData.newPassword.length < 6) {
      setPwdError("Password must be at least 6 characters.");
      return;
    }
    dispatch(
      changePassword({
        id: adminData.id,
        passwordData: {
          currentPassword: pwdData.currentPassword,
          newPassword: pwdData.newPassword,
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Password changed successfully!");
        setPwdModal(false);
        setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPwdError("");
      })
      .catch((err) => setPwdError(err?.message || "Failed to change password."));
  };

  // ─────────────────────── Loader ─────────────────────────
  if (pageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <CircularProgress size={48} thickness={4} sx={{ color: "#2563eb" }} />
      </Box>
    );
  }

  // ─────────────────────── Render ─────────────────────────
  return (
    <Box sx={{ background: "#f0f4f8", minHeight: "100vh", pb: 6 }}>
      {/* ── Hero Banner ── */}
      <Box
        sx={{
          background: "#1976d2",
          px: 3,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -80,
            left: "30%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          },
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <AdminIcon sx={{ color: "rgba(255,255,255,0.85)", fontSize: 22 }} />
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 500, letterSpacing: 1 }}>
              ADMINISTRATOR
            </Typography>
          </Stack>
          <Typography variant="h4" fontWeight={700} color="white">
            Admin Profile
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 0.5 }}>
            Manage your personal details and organization information
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8, position: "relative", zIndex: 1 }}>
        {/* ── Profile Card ── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(37,99,235,0.13)",
            mb: 3,
          }}
        >
          {/* Avatar + meta row */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "center", sm: "flex-end" },
              gap: 3,
              px: { xs: 3, md: 5 },
              pt: 4,
              pb: 3,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            {/* Avatar */}
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={imagePreview || undefined}
                sx={{
                  width: 110,
                  height: 110,
                  fontSize: 38,
                  fontWeight: 700,
                  background: "#1976d2",
                  border: "4px solid white",
                  boxShadow: "0 6px 20px rgba(37,99,235,0.25)",
                }}
              >
                {!imagePreview && getInitials(adminData.name)}
              </Avatar>
              {adminEditMode && (
                <IconButton
                  component="label"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    bgcolor: "#2563eb",
                    color: "white",
                    width: 30,
                    height: 30,
                    "&:hover": { bgcolor: "#1d4ed8" },
                    boxShadow: 2,
                  }}
                >
                  <PhotoCamera sx={{ fontSize: 16 }} />
                  <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
                </IconButton>
              )}
            </Box>

            {/* Name / role */}
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                <Typography variant="h5" fontWeight={700} color="#111827">
                  {adminData.name || "—"}
                </Typography>
                <Chip
                  label="Admin"
                  size="small"
                  icon={<AdminIcon sx={{ fontSize: "14px !important" }} />}
                  sx={{
                    background: "#1976d2",
                    color: "white",
                    fontWeight: 600,
                    fontSize: 11,
                    height: 24,
                    "& .MuiChip-icon": { color: "white" },
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {adminData.jobRole || adminData.position || "Administrator"}{" "}
                {adminData.department ? `· ${adminData.department}` : ""}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {adminData.email}
              </Typography>
            </Box>

            {/* Actions */}
            <Stack direction={{ xs: "row", sm: "column", md: "row" }} spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<LockIcon />}
                onClick={() => setPwdModal(true)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Change Password
              </Button>
            </Stack>
          </Box>

          {/* ── Tabs ── */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              px: { xs: 2, md: 5 },
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, minHeight: 48 },
              "& .MuiTabs-indicator": { height: 3, borderRadius: 2 },
            }}
          >
            <Tab icon={<PersonIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Personal Details" />
            <Tab icon={<BusinessIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Organization" />
          </Tabs>

          {/* ═══════════ TAB 0 – Personal ═══════════ */}
          {activeTab === 0 && (
            <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
              {/* Edit / Save / Cancel header */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} color="#374151">
                  Personal Information
                </Typography>
                {!adminEditMode ? (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setAdminEditMode(true)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={adminSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                      onClick={handleAdminSave}
                      disabled={adminSaving}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {adminSaving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={handleAdminCancel}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Grid container spacing={3}>
                {/* Full Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={adminData.name}
                    onChange={(e) => setAdminData((p) => ({ ...p, name: e.target.value }))}
                    slotProps={{ input: { readOnly: !adminEditMode } }}
                    error={!!adminErrors.name}
                    helperText={adminErrors.name}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                {/* Email (read‑only always) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={adminData.email}
                    disabled
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                {/* Phone */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={adminData.phone}
                    onChange={(e) => setAdminData((p) => ({ ...p, phone: e.target.value }))}
                    slotProps={{ input: { readOnly: !adminEditMode } }}
                    error={!!adminErrors.phone}
                    helperText={adminErrors.phone}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                {/* Gender */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    value={adminData.gender}
                    onChange={(e) => setAdminData((p) => ({ ...p, gender: e.target.value }))}
                    slotProps={{ input: { readOnly: !adminEditMode } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                {/* DOB */}
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Birth"
                      value={adminData.dob}
                      onChange={(d) => setAdminData((p) => ({ ...p, dob: d }))}
                      readOnly={!adminEditMode}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>
                {/* Address */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={adminData.address}
                    onChange={(e) => setAdminData((p) => ({ ...p, address: e.target.value }))}
                    slotProps={{ input: { readOnly: !adminEditMode } }}
                    multiline
                    rows={2}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                {/* City */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    value={adminData.city}
                    onChange={(e) => setAdminData((p) => ({ ...p, city: e.target.value }))}
                    slotProps={{ input: { readOnly: !adminEditMode } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                {/* State */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    value={adminData.state}
                    onChange={(e) => setAdminData((p) => ({ ...p, state: e.target.value }))}
                    slotProps={{ input: { readOnly: !adminEditMode } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                {/* Pincode */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Pincode"
                    value={adminData.pincode}
                    onChange={(e) => setAdminData((p) => ({ ...p, pincode: e.target.value }))}
                    slotProps={{ input: { readOnly: !adminEditMode } }}
                    error={!!adminErrors.pincode}
                    helperText={adminErrors.pincode}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>


              </Grid>
            </Box>
          )}

          {/* ═══════════ TAB 1 – Organization ═══════════ */}
          {activeTab === 1 && (
            <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      background: "#1976d2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BusinessIcon sx={{ color: "white", fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="#374151">
                      Organization Details
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Update your company information
                    </Typography>
                  </Box>
                </Stack>

                {!orgEditMode ? (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setOrgEditMode(true)}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Edit Organization
                  </Button>
                ) : (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={orgSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                      onClick={handleOrgSave}
                      disabled={orgSaving}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {orgSaving ? "Saving…" : "Save"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CancelIcon />}
                      onClick={handleOrgCancel}
                      sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Stack>

              {/* Logo Section */}
              <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={logoPreview || undefined}
                    variant="rounded"
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: "#f0f4ff",
                      border: "2px solid #e5e7eb",
                      color: "#1976d2",
                    }}
                  >
                    {!logoPreview && <BusinessIcon sx={{ fontSize: 40 }} />}
                  </Avatar>
                  {orgEditMode && (
                    <IconButton
                      component="label"
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: -10,
                        right: -10,
                        bgcolor: "#1976d2",
                        color: "white",
                        "&:hover": { bgcolor: "#115293" },
                        boxShadow: 2,
                      }}
                    >
                      <PhotoCamera sx={{ fontSize: 16 }} />
                      <input hidden accept="image/*" type="file" onChange={handleLogoUpload} />
                    </IconButton>
                  )}
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#374151">
                    Organization Logo
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Showcase your brand across the platform
                  </Typography>
                </Box>
              </Box>

              {/* Org info cards (view mode) */}
              {!orgEditMode && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
                    gap: 2,
                    mb: 3,
                  }}
                >
                  {[
                    { icon: <BusinessIcon sx={{ color: "#2563eb" }} />, label: "Organization Name", value: orgData.orgName },
                    { icon: <LocationIcon sx={{ color: "#10b981" }} />, label: "Location", value: orgData.location },
                    { icon: <WebIcon sx={{ color: "#f59e0b" }} />, label: "Type", value: orgData.orgType },
                    { icon: <GroupIcon sx={{ color: "#8b5cf6" }} />, label: "Size", value: orgData.orgSize },
                    { icon: <PhoneIcon sx={{ color: "#0ea5e9" }} />, label: "Phone", value: orgData.phone },
                    { icon: <EmailIcon sx={{ color: "#ef4444" }} />, label: "Email", value: orgData.email },
                  ].map(({ icon, label, value }) => (
                    <Paper
                      key={label}
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        border: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.5,
                        background: "#fafbff",
                        transition: "box-shadow 0.2s",
                        "&:hover": { boxShadow: "0 4px 16px rgba(37,99,235,0.10)" },
                      }}
                    >
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          bgcolor: "#f0f4ff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block">
                          {label}
                        </Typography>
                        <Typography variant="body2" fontWeight={500} color={value ? "#111827" : "#9ca3af"}>
                          {value || "Not set"}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}

              {/* Description card */}
              {!orgEditMode && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid #e5e7eb",
                    background: "#fafbff",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                    DESCRIPTION
                  </Typography>
                  <Typography variant="body2" color={orgData.description ? "#374151" : "#9ca3af"} sx={{ lineHeight: 1.8 }}>
                    {orgData.description || "No description provided."}
                  </Typography>
                </Paper>
              )}

              {/* Edit form */}
              {orgEditMode && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Organization Name *"
                      value={orgData.orgName}
                      onChange={(e) => setOrgData((p) => ({ ...p, orgName: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={orgData.location}
                      onChange={(e) => setOrgData((p) => ({ ...p, location: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Organization Type"
                      value={orgData.orgType}
                      onChange={(e) => setOrgData((p) => ({ ...p, orgType: e.target.value }))}
                      placeholder="e.g. IT, Healthcare, Finance"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Organization Size"
                      value={orgData.orgSize}
                      onChange={(e) => setOrgData((p) => ({ ...p, orgSize: e.target.value }))}
                      placeholder="e.g. 50-100 employees"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Phone"
                      value={orgData.phone}
                      onChange={(e) => setOrgData((p) => ({ ...p, phone: e.target.value }))}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      value={orgData.email}
                      onChange={(e) => setOrgData((p) => ({ ...p, email: e.target.value }))}
                      type="email"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={orgData.description}
                      onChange={(e) => setOrgData((p) => ({ ...p, description: e.target.value }))}
                      multiline
                      rows={4}
                      placeholder="Describe your organization…"
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  </Grid>
                </Grid>
              )}
            </Box>
          )}
        </Paper>
      </Container>

      {/* ════════════════ Change Password Modal ════════════════ */}
      <Dialog open={pwdModal} onClose={() => { setPwdModal(false); setPwdError(""); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LockIcon sx={{ color: "#2563eb" }} />
              <Typography variant="h6" fontWeight={700}>Change Password</Typography>
            </Stack>
            <IconButton size="small" onClick={() => { setPwdModal(false); setPwdError(""); }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            {[
              { label: "Current Password", field: "currentPassword", key: "current" },
              { label: "New Password", field: "newPassword", key: "new" },
              { label: "Confirm New Password", field: "confirmPassword", key: "confirm" },
            ].map(({ label, field, key }) => (
              <TextField
                key={field}
                fullWidth
                label={label}
                name={field}
                type={showPwd[key] ? "text" : "password"}
                value={pwdData[field]}
                onChange={(e) => setPwdData((p) => ({ ...p, [field]: e.target.value }))}
                error={field === "confirmPassword" && !!pwdError}
                helperText={field === "confirmPassword" ? pwdError : ""}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd((p) => ({ ...p, [key]: !p[key] }))} edge="end">
                        {showPwd[key] ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => { setPwdModal(false); setPwdError(""); }}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handlePasswordSubmit}
            disabled={reduxLoading}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {reduxLoading ? "Updating…" : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default AdminProfile;
