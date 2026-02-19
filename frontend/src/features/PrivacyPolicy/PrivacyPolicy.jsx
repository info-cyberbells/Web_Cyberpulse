import { motion } from "framer-motion";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
                    <p className="text-muted-foreground mb-8">
                        Last updated: January 2026
                    </p>

                    <section className="space-y-6">
                        <p>
                            CyberPulse ("we", "our", "us") is an employee management web
                            application designed to help organizations manage employees,
                            attendance, tasks, and internal operations. We are committed to
                            protecting your privacy and handling personal data responsibly.
                        </p>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">1. Information We Collect</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Company and administrator details</li>
                                <li>Employee personal and professional information</li>
                                <li>Attendance, work hours, and activity logs</li>
                                <li>Login and device-related technical data</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">2. How We Use Information</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>To provide and operate the CyberPulse platform</li>
                                <li>To manage employee records and company operations</li>
                                <li>To improve performance, security, and user experience</li>
                                <li>To communicate important updates and alerts</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">3. Data Sharing</h2>
                            <p>
                                CyberPulse does not sell or rent personal data. Data is shared
                                only with the registered company, trusted service providers
                                under confidentiality, or when required by law.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">4. Data Security</h2>
                            <p>
                                We use industry-standard security measures including encrypted
                                passwords, access control, and secure servers to protect user
                                information.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">5. Data Retention</h2>
                            <p>
                                Data is retained only as long as necessary for business and
                                legal purposes. Companies may request deletion upon account
                                termination.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">6. User Rights</h2>
                            <p>
                                Users may request access, correction, or deletion of their
                                personal data through their company administrator or by
                                contacting support.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">7. Cookies</h2>
                            <p>
                                CyberPulse uses cookies to maintain sessions and improve
                                usability. You can manage cookies through your browser
                                settings.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">8. Policy Updates</h2>
                            <p>
                                We may update this Privacy Policy periodically. Updates will be
                                posted on this page.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold mb-2">9. Contact Us</h2>
                            <p>
                                If you have questions about this Privacy Policy, contact us at:
                            </p>
                            <p className="mt-2 font-medium">info@cyberpulse.com</p>
                        </div>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
