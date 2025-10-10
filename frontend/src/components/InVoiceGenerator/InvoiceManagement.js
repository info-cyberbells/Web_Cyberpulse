import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllInvoices, setShowCreateForm } from "../../features/invoice/invoiceSlice";
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    Card,
    CardContent,
    TableRow,
    CircularProgress,
    Fab,
    Dialog,
    DialogContent,
    Grid,
    Chip
} from "@mui/material";
import {
    Add as AddIcon,
    Visibility as ViewIcon,
    Download as DownloadIcon,
} from "@mui/icons-material";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { styled } from "@mui/material/styles";
import cyberlogo from '../../assets/cyberlogo.png';

const HeaderCard = styled(Card)(({ theme }) => ({
    background: "#ffffff",
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
}));

const InvoiceManagement = () => {
    const dispatch = useDispatch();
    const { invoices, loading, showCreateForm } = useSelector((state) => state.invoice);
    const [previewInvoice, setPreviewInvoice] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const currencyMap = {
        USD: { symbol: '$', name: 'USD', pdfSymbol: '$' },
        INR: { symbol: '₹', name: 'INR', pdfSymbol: 'Rs.' },
        AUD: { symbol: 'A$', name: 'AUD', pdfSymbol: 'A$' },
        EUR: { symbol: '€', name: 'EUR', pdfSymbol: 'EUR' }
    };

    useEffect(() => {
        dispatch(fetchAllInvoices());
    }, [dispatch]);

    const generateInvoicePDF = (invoice, shouldDownload = true) => {
        const doc = new jsPDF();
        doc.setFont('helvetica');

        // Currency mapping
        const currencyMap = {
            USD: { symbol: '$', pdfSymbol: '$' },
            INR: { symbol: '₹', pdfSymbol: 'Rs.' },
            AUD: { symbol: 'A$', pdfSymbol: 'A$' },
            EUR: { symbol: '€', pdfSymbol: 'EUR' }
        };

        // Get currency from invoice or default to INR
        const selectedCurrency = invoice.currency || 'INR';

        // Add Logo (smaller height and properly positioned)
        try {
            doc.addImage(cyberlogo, 'PNG', 20, 10, 40, 13);
        } catch (error) {
            console.log('Logo could not be added:', error);
        }

        // Header - INVOICE (right aligned)
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', 200, 20, { align: 'right' });

        // Invoice Number (right aligned)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`# ${invoice.invoiceNumber || 'N/A'}`, 200, 27, { align: 'right' });

        // Company Name (positioned below logo)
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Cyberbells ITES Services Pvt Ltd', 20, 32); // Below logo, aligned left

        // Bill To Section (proper spacing after company name)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 20, 45);
        doc.setFont('helvetica', 'bold'); // Make client name bold
        doc.text(invoice.billTo || 'N/A', 20, 52);

        // Email (if available)
        if (invoice.shipTo) {
            doc.setFont('helvetica', 'normal');
            doc.text(invoice.shipTo, 20, 59);
        }

        // Address (if available)
        if (invoice.address) {
            doc.setFont('helvetica', 'normal');
            const addressLines = doc.splitTextToSize(invoice.address, 80);
            doc.text(addressLines, 20, 66);
        }

        // Date Section (right aligned)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${invoice.date || 'N/A'}`, 200, 45, { align: 'right' });
        doc.text(`Due Date: ${invoice.dueDate || 'N/A'}`, 200, 52, { align: 'right' });

        // Balance Due (right aligned, with background highlight)
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');

        // Add background rectangle for balance due
        const balanceText = `Balance Due: ${currencyMap[selectedCurrency].pdfSymbol}${Number(invoice.balanceDue).toFixed(2)}`;
        const textWidth = doc.getTextWidth(balanceText);
        doc.setFillColor(240, 240, 240); // Light gray background
        doc.rect(200 - textWidth - 5, 60, textWidth + 10, 10, 'F'); // Background rectangle

        doc.text(balanceText, 200, 67, { align: 'right' });

        // Items Table
        const tableData = invoice.items.map(item => [
            item.description,
            Number(item.quantity) || 0,
            `${currencyMap[selectedCurrency].pdfSymbol}${(Number(item.rate) || 0).toFixed(2)}`,
            `${currencyMap[selectedCurrency].pdfSymbol}${Number(item.amount).toFixed(2)}`
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['Item', 'Quantity', 'Rate', 'Amount']],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: [51, 65, 85],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 12
            },
            bodyStyles: {
                fontSize: 11
            },
            columnStyles: {
                0: { cellWidth: 80, halign: 'left' }, // Item column
                1: { cellWidth: 30, halign: 'center' }, // Quantity
                2: { cellWidth: 30, halign: 'right' }, // Rate
                3: { cellWidth: 40, halign: 'right' }  // Amount
            },
            didParseCell: function (data) {
                if (data.section === 'head') {
                    if (data.column.index === 0) {
                        data.cell.styles.halign = 'left';
                    } else if (data.column.index === 1) {
                        data.cell.styles.halign = 'center';
                    } else if (data.column.index === 2 || data.column.index === 3) {
                        data.cell.styles.halign = 'right';
                    }
                }
            }
        });

        // Total (right aligned, bold)
        let finalY = 90 + (tableData.length * 12) + 35;
        if (doc.lastAutoTable && doc.lastAutoTable.finalY) {
            finalY = doc.lastAutoTable.finalY + 15;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: ${currencyMap[selectedCurrency].pdfSymbol}${Number(invoice.total).toFixed(2)}`, 200, finalY, { align: 'right' });


        if (invoice.amountPaid > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Amount Paid: ${currencyMap[selectedCurrency].pdfSymbol}${Number(invoice.amountPaid).toFixed(2)}`, 200, finalY + 8, { align: 'right' });
            finalY += 8; // Adjust position for balance due
        }

        // Payee Details (moved down a little for better spacing)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payee Details:', 20, finalY + 30); // Increased gap from +25 to +30

        // Underline
        doc.line(20, finalY + 33, 190, finalY + 33); // Adjusted line position

        // Bank details (smaller font, better spacing)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const payeeDetails = [
            'Account Holder\'s Name: CYBERBELLS ITES SERVICES PVT LTD',
            'Bank Account Number: 400076767676',
            'Bank IFSC: RATN0000298',
            'Bank Name: Ratnakar Bank Limited',
            'Account Holder\'s Address: SCO 11, Phase 2, Industrial Area, Chandigarh, India, 160002'
        ];

        payeeDetails.forEach((detail, index) => {
            doc.text(detail, 20, finalY + 40 + (index * 6)); // Adjusted starting position
        });

        if (shouldDownload) {
            doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
        } else {
            // For preview, convert to blob URL
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            window.open(pdfUrl, '_blank');
        }
    };

    const handleViewInvoice = (invoice) => {
        generateInvoicePDF(invoice, false);
    };

    const handleDownloadInvoice = (invoice) => {
        generateInvoicePDF(invoice, true);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", bgcolor: 'white', minHeight: '100vh' }}>
            <HeaderCard>
                <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                                Manage Invoices
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                                Create and manage invoices for your clients.
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center", bgcolor: "#f8fafc", borderRadius: 2, p: 2, border: "1px solid #e5e7eb" }}>
                            <Typography variant="h4" fontWeight="700" color="#1f2937">
                                {invoices.length}
                            </Typography>
                            <Typography variant="caption" color="#6b7280">
                                Invoices Generated
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </HeaderCard>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    mt: 3
                }}
            >
                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* No Invoices */}
                {!loading && invoices.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 0 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            No invoices found
                        </Typography>
                    </Box>
                )}
                {/* Invoices Table */}
                {!loading && invoices.length > 0 && (
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: 'grey.200',
                            borderRadius: 2
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#334155' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                        Invoice
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                        Client
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                        Date
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                        Amount
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '14px', textAlign: 'center' }}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {invoices.map((invoice) => (
                                    <TableRow key={invoice._id} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            #{invoice.invoiceNumber}
                                        </TableCell>
                                        <TableCell>
                                            {invoice.billTo}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(invoice.date)}
                                        </TableCell>
                                        <TableCell>
                                            {invoice.currencyPdfSymbol}{Number(invoice.total).toFixed(2)}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<ViewIcon />}
                                                onClick={() => handleViewInvoice(invoice)}
                                                sx={{ mr: 1, fontSize: '12px' }}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => handleDownloadInvoice(invoice)}
                                                sx={{ fontSize: '12px' }}
                                            >
                                                Download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* FAB Button */}
            <Fab
                color="primary"
                aria-label="add"
                onClick={() => window.location.href = '/invoice-generator'}
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                }}
            >
                <AddIcon />
            </Fab>

        </Box>
    );
};

export default InvoiceManagement;