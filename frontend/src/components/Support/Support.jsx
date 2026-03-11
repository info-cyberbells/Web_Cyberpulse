import { useState } from "react";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
} from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmailIcon from "@mui/icons-material/Email";
import ChatIcon from "@mui/icons-material/Chat";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BugReportIcon from "@mui/icons-material/BugReport";
import SchoolIcon from "@mui/icons-material/School";
import PhoneIcon from "@mui/icons-material/Phone";
import { toast } from "react-toastify";
import Footer from "../CyberHome/Footer";

const cardStyle = {
  backgroundColor: "white",
  borderRadius: "16px",
  p: { xs: 3, md: 4 },
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
  border: "1px solid #e2e8f0",
  textAlign: "center",
  transition: "all 0.3s ease",
  height: "100%",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 30px rgba(37, 99, 235, 0.12)",
    borderColor: "#2563eb",
  },
};

const iconBoxStyle = {
  width: 60,
  height: 60,
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  mx: "auto",
  mb: 2,
};

const faqData = [
  {
    question: "How do I reset my password?",
    answer:
      'Click on "Forgot Password" on the login page and enter your registered email address. You will receive a password reset link within a few minutes. If you don\'t receive it, check your spam folder or contact your company administrator.',
  },
  {
    question: "How do I mark my attendance?",
    answer:
      'After logging in, go to the Attendance section and click "Clock In" to start your workday. When leaving, click "Clock Out". Some organizations may require selfie verification or GPS location for attendance marking.',
  },
  {
    question: "How can I apply for leave?",
    answer:
      'Navigate to the Leave Management section, click "Apply for Leave", select the leave type, dates, and provide a reason. Your leave request will be sent to your manager/HR for approval. You can track the status in the same section.',
  },
  {
    question: "I can't see my dashboard or some features are missing.",
    answer:
      "Feature access depends on your user role (Employee, Team Lead, HR, Manager, Admin). Contact your company administrator to verify your role and permissions. Try logging out and logging back in if the issue persists.",
  },
  {
    question: "How do I update my profile information?",
    answer:
      "Go to Profile from the sidebar menu. You can update your personal details, profile picture, and contact information. Some fields like Employee ID and department may only be editable by HR or Admin.",
  },
  {
    question: "How do I raise a help desk ticket?",
    answer:
      'Go to the Help Desk section from the sidebar, click "Create Ticket", describe your issue in detail, and submit. Your ticket will be assigned to the appropriate team and you can track its progress in the same section.',
  },
  {
    question: "Is my data secure on CyberPulse?",
    answer:
      "Yes, we implement industry-standard security measures including SSL encryption, secure password hashing, role-based access controls, and regular security audits. Read our Privacy Policy for detailed information about data protection.",
  },
  {
    question: "Can I access CyberPulse on my mobile phone?",
    answer:
      "Yes, CyberPulse is fully responsive and works on mobile browsers. You can mark attendance, check tasks, apply for leave, and access all features from your mobile device.",
  },
];

export default function Support() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Your message has been sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const supportChannels = [
    {
      icon: <EmailIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
      bgColor: "rgba(37, 99, 235, 0.1)",
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours.",
      contact: "support@cyberpulse360.com",
    },
    {
      icon: <ChatIcon sx={{ fontSize: 28, color: "#059669" }} />,
      bgColor: "rgba(5, 150, 105, 0.1)",
      title: "Live Chat",
      description: "Chat with our support team in real-time during business hours.",
      contact: "Available Mon-Fri",
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 28, color: "#d97706" }} />,
      bgColor: "rgba(217, 119, 6, 0.1)",
      title: "Phone Support",
      description: "Call us for urgent issues that need immediate attention.",
      contact: "+1 (650) 555-0199",
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 28, color: "#7c3aed" }} />,
      bgColor: "rgba(124, 58, 237, 0.1)",
      title: "Business Hours",
      description: "Our support team is available during these hours.",
      contact: "Mon-Fri, 9AM - 6PM PST",
    },
  ];

  const resourceCards = [
    {
      icon: <HelpOutlineIcon sx={{ fontSize: 28, color: "#2563eb" }} />,
      bgColor: "rgba(37, 99, 235, 0.1)",
      title: "Knowledge Base",
      description:
        "Browse through our comprehensive guides and tutorials to get the most out of CyberPulse.",
    },
    {
      icon: <BugReportIcon sx={{ fontSize: 28, color: "#dc2626" }} />,
      bgColor: "rgba(220, 38, 38, 0.1)",
      title: "Report a Bug",
      description:
        "Found something not working? Report it and our engineering team will investigate.",
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 28, color: "#059669" }} />,
      bgColor: "rgba(5, 150, 105, 0.1)",
      title: "Getting Started",
      description:
        "New to CyberPulse? Check out our onboarding guide to set up your organization.",
    },
  ];

  return (
    <>
      {/* Hero Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
          color: "white",
          py: { xs: 6, md: 8 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <SupportAgentIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography
            sx={{
              fontSize: { xs: "32px", md: "42px" },
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              mb: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            How Can We Help?
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "18px" },
              opacity: 0.85,
              fontFamily: "'Inter', sans-serif",
              maxWidth: "600px",
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Get the support you need. Browse our FAQs, explore resources, or
            reach out to our team directly.
          </Typography>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: "#f8fafc", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          {/* Support Channels */}
          <Typography
            sx={{
              fontSize: { xs: "24px", md: "30px" },
              fontWeight: 700,
              color: "#1e293b",
              textAlign: "center",
              mb: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Get In Touch
          </Typography>

          <Grid container spacing={3} sx={{ mb: 8 }}>
            {supportChannels.map((channel, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={cardStyle}>
                  <Box sx={{ ...iconBoxStyle, backgroundColor: channel.bgColor }}>
                    {channel.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#1e293b",
                      mb: 1,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {channel.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#64748b",
                      mb: 2,
                      lineHeight: 1.6,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {channel.description}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#2563eb",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {channel.contact}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* FAQ Section */}
          <Typography
            sx={{
              fontSize: { xs: "24px", md: "30px" },
              fontWeight: 700,
              color: "#1e293b",
              textAlign: "center",
              mb: 1,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              color: "#64748b",
              textAlign: "center",
              mb: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Find quick answers to common questions
          </Typography>

          <Box sx={{ maxWidth: "800px", mx: "auto", mb: 8 }}>
            {faqData.map((faq, index) => (
              <Accordion
                key={index}
                sx={{
                  mb: 1.5,
                  borderRadius: "12px !important",
                  border: "1px solid #e2e8f0",
                  boxShadow: "none",
                  "&:before": { display: "none" },
                  "&.Mui-expanded": {
                    borderColor: "#2563eb",
                    boxShadow: "0 4px 16px rgba(37, 99, 235, 0.08)",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "#2563eb" }} />}
                  sx={{
                    minHeight: "56px",
                    "& .MuiAccordionSummary-content": { my: 1.5 },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#475569",
                      lineHeight: 1.8,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* Resources Section */}
          <Typography
            sx={{
              fontSize: { xs: "24px", md: "30px" },
              fontWeight: 700,
              color: "#1e293b",
              textAlign: "center",
              mb: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Helpful Resources
          </Typography>

          <Grid container spacing={3} sx={{ mb: 8, justifyContent: "center" }}>
            {resourceCards.map((resource, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Box sx={{ ...cardStyle, cursor: "pointer" }}>
                  <Box sx={{ ...iconBoxStyle, backgroundColor: resource.bgColor }}>
                    {resource.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "17px",
                      fontWeight: 700,
                      color: "#1e293b",
                      mb: 1,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {resource.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: "#64748b",
                      lineHeight: 1.6,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {resource.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Contact Form */}
          <Typography
            sx={{
              fontSize: { xs: "24px", md: "30px" },
              fontWeight: 700,
              color: "#1e293b",
              textAlign: "center",
              mb: 1,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Send Us a Message
          </Typography>
          <Typography
            sx={{
              fontSize: "16px",
              color: "#64748b",
              textAlign: "center",
              mb: 4,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Can't find what you're looking for? Drop us a message and we'll get
            back to you.
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              maxWidth: "700px",
              mx: "auto",
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
              p: { xs: 3, md: 5 },
              mb: 4,
            }}
          >
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Your Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontFamily: "'Inter', sans-serif",
                      "&:hover fieldset": { borderColor: "#2563eb" },
                      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontFamily: "'Inter', sans-serif",
                      "&:hover fieldset": { borderColor: "#2563eb" },
                      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontFamily: "'Inter', sans-serif",
                      "&:hover fieldset": { borderColor: "#2563eb" },
                      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Your Message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  multiline
                  rows={5}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontFamily: "'Inter', sans-serif",
                      "&:hover fieldset": { borderColor: "#2563eb" },
                      "&.Mui-focused fieldset": { borderColor: "#2563eb" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#2563eb" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={{
                    backgroundColor: "#2563eb",
                    color: "white",
                    borderRadius: "10px",
                    py: 1.5,
                    fontSize: "16px",
                    fontWeight: 600,
                    textTransform: "none",
                    fontFamily: "'Inter', sans-serif",
                    "&:hover": {
                      backgroundColor: "#1d4ed8",
                      boxShadow: "0 4px 16px rgba(37, 99, 235, 0.3)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Send Message
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
