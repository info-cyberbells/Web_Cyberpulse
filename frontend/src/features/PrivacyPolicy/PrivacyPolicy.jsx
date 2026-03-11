import { Box, Typography, Container, Divider } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import Footer from "../../components/CyberHome/Footer";

const sectionStyle = {
  mb: 4,
};

const headingStyle = {
  fontSize: { xs: "20px", md: "22px" },
  fontWeight: 700,
  color: "#1e293b",
  mb: 1.5,
  fontFamily: "'Inter', sans-serif",
};

const paragraphStyle = {
  fontSize: "15px",
  lineHeight: 1.8,
  color: "#475569",
  fontFamily: "'Inter', sans-serif",
};

const listStyle = {
  fontSize: "15px",
  lineHeight: 1.8,
  color: "#475569",
  fontFamily: "'Inter', sans-serif",
  pl: 2,
  "& li": {
    mb: 0.5,
  },
};

export default function PrivacyPolicy() {

  const sections = [
    {
      title: "1. Information We Collect",
      content: (
        <>
          <Typography sx={paragraphStyle}>
            We collect information to provide and improve our services. The types
            of information we collect include:
          </Typography>
          <Box component="ul" sx={listStyle}>
            <li>
              <strong>Personal Information:</strong> Name, email address, phone
              number, job title, and other details provided during registration
              or by your company administrator.
            </li>
            <li>
              <strong>Employment Data:</strong> Employee ID, department,
              designation, date of joining, salary details, and organizational
              hierarchy information.
            </li>
            <li>
              <strong>Attendance & Activity Data:</strong> Clock-in/out times,
              GPS location (if enabled), selfie verification images, work hours,
              break durations, and overtime records.
            </li>
            <li>
              <strong>Task & Project Data:</strong> Task assignments, progress
              updates, time spent on tasks, project associations, and
              performance metrics.
            </li>
            <li>
              <strong>Device & Technical Data:</strong> IP address, browser type,
              operating system, device identifiers, and access logs for security
              and troubleshooting purposes.
            </li>
            <li>
              <strong>Communication Data:</strong> Messages sent through in-app
              chat, help desk tickets, and announcement interactions.
            </li>
          </Box>
        </>
      ),
    },
    {
      title: "2. How We Use Your Information",
      content: (
        <>
          <Typography sx={paragraphStyle}>
            We use the collected information for the following purposes:
          </Typography>
          <Box component="ul" sx={listStyle}>
            <li>
              To provide, operate, and maintain the CyberPulse platform and its
              features.
            </li>
            <li>
              To manage employee records, attendance tracking, leave management,
              and payroll processing.
            </li>
            <li>
              To facilitate task assignment, project management, and performance
              analysis.
            </li>
            <li>
              To enable real-time communication between team members and
              management.
            </li>
            <li>
              To generate reports, analytics, and insights for organizational
              decision-making.
            </li>
            <li>
              To improve platform performance, fix bugs, and enhance user
              experience.
            </li>
            <li>
              To send important notifications, updates, and security alerts.
            </li>
            <li>
              To comply with legal obligations and enforce our terms of service.
            </li>
          </Box>
        </>
      ),
    },
    {
      title: "3. Data Sharing & Disclosure",
      content: (
        <>
          <Typography sx={paragraphStyle}>
            CyberPulse does not sell, rent, or trade your personal data. We may
            share information only in the following circumstances:
          </Typography>
          <Box component="ul" sx={listStyle}>
            <li>
              <strong>With Your Organization:</strong> Your employer or company
              administrator has access to employee data as part of the workforce
              management system.
            </li>
            <li>
              <strong>Service Providers:</strong> We work with trusted
              third-party providers (hosting, analytics, email services) who
              process data on our behalf under strict confidentiality agreements.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information
              when required by law, court order, or government regulation.
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger,
              acquisition, or sale of assets, user data may be transferred as
              part of the business transaction.
            </li>
          </Box>
        </>
      ),
    },
    {
      title: "4. Data Security",
      content: (
        <Typography sx={paragraphStyle}>
          We implement industry-standard security measures to protect your data,
          including encrypted data transmission (SSL/TLS), secure password
          hashing, role-based access controls, regular security audits, and
          secure cloud infrastructure. While we strive to protect your
          information, no method of electronic storage or transmission is 100%
          secure. We continuously monitor and update our security practices to
          mitigate risks.
        </Typography>
      ),
    },
    {
      title: "5. Data Retention",
      content: (
        <Typography sx={paragraphStyle}>
          We retain personal data only for as long as necessary to fulfill the
          purposes outlined in this policy, or as required by law. When data is
          no longer needed, it is securely deleted or anonymized. Company
          administrators may request data deletion upon account termination.
          Individual employees can request data access or deletion through their
          company administrator or by contacting our support team directly.
        </Typography>
      ),
    },
    {
      title: "6. Your Rights",
      content: (
        <>
          <Typography sx={paragraphStyle}>
            Depending on your jurisdiction, you may have the following rights
            regarding your personal data:
          </Typography>
          <Box component="ul" sx={listStyle}>
            <li>
              <strong>Right to Access:</strong> Request a copy of the personal
              data we hold about you.
            </li>
            <li>
              <strong>Right to Rectification:</strong> Request correction of
              inaccurate or incomplete data.
            </li>
            <li>
              <strong>Right to Deletion:</strong> Request deletion of your
              personal data, subject to legal and contractual obligations.
            </li>
            <li>
              <strong>Right to Data Portability:</strong> Request your data in a
              structured, machine-readable format.
            </li>
            <li>
              <strong>Right to Object:</strong> Object to certain processing
              activities, such as direct marketing.
            </li>
            <li>
              <strong>Right to Withdraw Consent:</strong> Where processing is
              based on consent, you can withdraw it at any time.
            </li>
          </Box>
          <Typography sx={{ ...paragraphStyle, mt: 1 }}>
            To exercise any of these rights, please contact us at{" "}
            <strong>support@cyberpulse360.com</strong> or through your company
            administrator.
          </Typography>
        </>
      ),
    },
    {
      title: "7. Cookies & Tracking Technologies",
      content: (
        <Typography sx={paragraphStyle}>
          CyberPulse uses cookies and similar technologies to maintain user
          sessions, remember preferences, and improve platform usability. We use
          essential cookies required for the platform to function correctly and
          analytics cookies to understand usage patterns and improve our
          services. You can manage cookie preferences through your browser
          settings. Disabling essential cookies may affect platform
          functionality.
        </Typography>
      ),
    },
    {
      title: "8. Third-Party Links",
      content: (
        <Typography sx={paragraphStyle}>
          Our platform may contain links to third-party websites or services.
          CyberPulse is not responsible for the privacy practices or content of
          these external sites. We recommend reviewing the privacy policies of
          any third-party services before providing your information.
        </Typography>
      ),
    },
    {
      title: "9. Children's Privacy",
      content: (
        <Typography sx={paragraphStyle}>
          CyberPulse is designed for use by businesses and their employees. Our
          services are not intended for individuals under the age of 18. We do
          not knowingly collect personal data from minors. If we become aware
          that we have collected data from a minor, we will take steps to delete
          it promptly.
        </Typography>
      ),
    },
    {
      title: "10. Policy Updates",
      content: (
        <Typography sx={paragraphStyle}>
          We may update this Privacy Policy from time to time to reflect changes
          in our practices, technology, or legal requirements. When we make
          significant changes, we will notify users through the platform or via
          email. The "Last Updated" date at the top of this page indicates when
          the policy was last revised. We encourage you to review this policy
          periodically.
        </Typography>
      ),
    },
    {
      title: "11. Contact Us",
      content: (
        <>
          <Typography sx={paragraphStyle}>
            If you have any questions, concerns, or requests regarding this
            Privacy Policy or your personal data, please contact us:
          </Typography>
          <Box sx={{ mt: 2, pl: 2 }}>
            <Typography sx={{ ...paragraphStyle, mb: 0.5 }}>
              <strong>Email:</strong> support@cyberpulse360.com
            </Typography>
            <Typography sx={{ ...paragraphStyle, mb: 0.5 }}>
              <strong>Website:</strong> https://cyberpulse360.com
            </Typography>
            <Typography sx={{ ...paragraphStyle, mb: 0.5 }}>
              <strong>Address:</strong> CyberPulse Group, 3790 El Camino Real,
              Palo Alto, CA 94306, USA
            </Typography>
          </Box>
        </>
      ),
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
          <SecurityIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography
            sx={{
              fontSize: { xs: "32px", md: "42px" },
              fontWeight: 700,
              fontFamily: "'Inter', sans-serif",
              mb: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            Privacy Policy
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
            Your privacy matters to us. Learn how CyberPulse collects, uses, and
            protects your personal information.
          </Typography>
          <Typography
            sx={{
              fontSize: "14px",
              opacity: 0.7,
              mt: 2,
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Last updated: February 2026
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Box sx={{ backgroundColor: "#f8fafc", py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md">
          <Box
            sx={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
              p: { xs: 3, md: 5 },
            }}
          >
            {/* Introduction */}
            <Box sx={sectionStyle}>
              <Typography sx={paragraphStyle}>
                CyberPulse ("we", "our", "us") is a comprehensive employee
                management platform designed to help organizations manage
                employees, attendance, tasks, payroll, and internal operations
                efficiently. This Privacy Policy explains how we collect, use,
                store, and protect your personal information when you use our
                platform.
              </Typography>
              <Typography sx={{ ...paragraphStyle, mt: 1.5 }}>
                By accessing or using CyberPulse, you agree to the terms of this
                Privacy Policy. If you do not agree, please discontinue use of
                the platform.
              </Typography>
            </Box>

            <Divider sx={{ my: 3, borderColor: "#e2e8f0" }} />

            {/* Sections */}
            {sections.map((section, index) => (
              <Box key={index} sx={sectionStyle}>
                <Typography sx={headingStyle}>{section.title}</Typography>
                {section.content}
                {index < sections.length - 1 && (
                  <Divider sx={{ mt: 3, borderColor: "#f1f5f9" }} />
                )}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Footer />
    </>
  );
}
