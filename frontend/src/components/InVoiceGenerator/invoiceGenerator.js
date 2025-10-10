import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { submitInvoice, fetchInvoiceNumber, fetchAllInvoices, clearError, clearSuccessMessage, setShowCreateForm } from "../../features/invoice/invoiceSlice";
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid,
    IconButton,
    Stack,
    InputAdornment,
} from "@mui/material";
import {
    Add as AddIcon,
    Delete as DeleteIcon,
} from "@mui/icons-material";
import cyberlogo from '../../assets/cyberlogo.png'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "react-toastify/dist/ReactToastify.css";
import { Close as CloseIcon } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";

const InvoiceGenerator = () => {
    const dispatch = useDispatch();
    const { submitLoading, loading, error, successMessage, currentInvoiceNumber } = useSelector((state) => state.invoice);
    const [invoiceData, setInvoiceData] = useState({
        invoiceNumber: "",
        date: "",
        dueDate: "",
        billTo: "",
        shipTo: "",
        address: "",
    });

    const [items, setItems] = useState([
        {
            id: 1,
            description: "",
            quantity: "",
            rate: "",
            amount: 0,
        },
    ]);

    const [calculations, setCalculations] = useState({
        discount: 0,
        tax: 0,
        shipping: 0,
        amountPaid: 0,
    });

    const [activeFields, setActiveFields] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');

    const currencyMap = {
        USD: { symbol: '$', name: 'USD', pdfSymbol: '$' },
        INR: { symbol: '₹', name: 'INR', pdfSymbol: 'Rs.' },
        AUD: { symbol: 'A$', name: 'AUD', pdfSymbol: 'A$' },
        EUR: { symbol: '€', name: 'EUR', pdfSymbol: 'EUR' }
    };
    useEffect(() => {
        dispatch(fetchInvoiceNumber());
    }, [dispatch]);

    useEffect(() => {
        if (currentInvoiceNumber) {
            setInvoiceData(prev => ({
                ...prev,
                invoiceNumber: currentInvoiceNumber
            }));
        }
    }, [currentInvoiceNumber]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
        if (successMessage) {
            toast.success(successMessage);
            dispatch(clearSuccessMessage());
        }
    }, [error, successMessage, dispatch]);

    useEffect(() => {
        if (successMessage && successMessage.includes('created successfully')) {
            dispatch(fetchAllInvoices());
            setTimeout(() => {
                window.history.back();
            }, 1500);
        }
    }, [successMessage, dispatch]);

    const validateForm = () => {
        if (!invoiceData.billTo.trim()) {
            toast.dismiss();
            toast.error('Client name is required');
            return false;
        }
        if (!invoiceData.shipTo.trim()) {
            toast.dismiss()
            toast.error('Client email is required');
            return false;
        }
        if (!invoiceData.date) {
            toast.dismiss()
            toast.error('Date is required');
            return false;
        }
        if (!invoiceData.dueDate) {
            toast.dismiss()
            toast.error('Due date is required');
            return false;
        }

        const hasValidItem = items.some(item => item.description.trim() !== '');
        if (!hasValidItem) {
            toast.dismiss()
            toast.error('At least one item description is required');
            return false;
        }

        return true;
    };

    const handleInputChange = (field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleCalculationChange = (field, value) => {
        setCalculations(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    const handleItemChange = (id, field, value) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                // Calculate amount when quantity or rate changes
                if (field === 'quantity' || field === 'rate') {
                    const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItem.quantity) || 0;
                    const rate = field === 'rate' ? parseFloat(value) || 0 : parseFloat(updatedItem.rate) || 0;
                    updatedItem.amount = quantity * rate;
                }

                return updatedItem;
            }
            return item;
        }));
    };


    const generatePDF = () => {
        if (!validatePDF()) return;

        const doc = new jsPDF();
        doc.setFont('helvetica');

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
        doc.text(`# ${invoiceData.invoiceNumber || 'N/A'}`, 200, 27, { align: 'right' });

        // Company Name (positioned below logo)
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Cyberbells ITES Services Pvt Ltd', 20, 32); // Below logo, aligned left

        // Bill To Section (proper spacing after company name)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Bill To:', 20, 45);
        doc.setFont('helvetica', 'bold'); // Make client name bold
        doc.text(invoiceData.billTo || 'N/A', 20, 52);

        // Email (if available)
        if (invoiceData.shipTo) {
            doc.setFont('helvetica', 'normal');
            doc.text(invoiceData.shipTo, 20, 59);
        }

        // Address (if available)
        if (invoiceData.address) {
            doc.setFont('helvetica', 'normal');
            const addressLines = doc.splitTextToSize(invoiceData.address, 80);
            doc.text(addressLines, 20, 66);
        }

        // Date Section (right aligned)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${invoiceData.date || 'N/A'}`, 200, 45, { align: 'right' });
        doc.text(`Due Date: ${invoiceData.dueDate || 'N/A'}`, 200, 52, { align: 'right' });

        // Balance Due (right aligned, with background highlight)
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');

        // Add background rectangle for balance due
        const balanceText = `Balance Due: ${currencyMap[selectedCurrency].pdfSymbol}${Number(getBalanceDue()).toFixed(2)}`;
        const textWidth = doc.getTextWidth(balanceText);
        doc.setFillColor(240, 240, 240); // Light gray background
        doc.rect(200 - textWidth - 5, 60, textWidth + 10, 10, 'F'); // Background rectangle

        doc.text(balanceText, 200, 67, { align: 'right' });

        // Items Table
        const tableData = items.filter(item => item.description.trim() !== '').map(item => [
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
        doc.text(`Total: ${currencyMap[selectedCurrency].pdfSymbol}${Number(getTotal()).toFixed(2)}`, 200, finalY, { align: 'right' });

        if (calculations.amountPaid > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Amount Paid: ${currencyMap[selectedCurrency].pdfSymbol}${Number(calculations.amountPaid).toFixed(2)}`, 200, finalY + 8, { align: 'right' });
            finalY += 8;
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

        // Download PDF
        doc.save(`Invoice_${invoiceData.invoiceNumber || 'Draft'}.pdf`);
        toast.dismiss();
        toast.success('PDF downloaded successfully!');
    };

    const validatePDF = () => {
        if (!invoiceData.billTo.trim() && !invoiceData.date && items.every(item => !item.description.trim())) {
            toast.dismiss();
            toast.error('Please fill at least some invoice details');
            return false;
        }
        return true;
    };


    const addLineItem = () => {
        const newId = Math.max(...items.map(item => item.id)) + 1;
        setItems(prev => [...prev, {
            id: newId,
            description: "",
            quantity: "",
            rate: "",
            amount: 0,
        }]);
    };

    const removeLineItem = (id) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const getSubtotal = () => {
        return items.reduce((total, item) => total + (item.amount || 0), 0);
    };

    const getTotal = () => {
        const subtotal = getSubtotal();
        const discountAmount = (calculations.discount / 100) * subtotal;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (calculations.tax / 100) * afterDiscount;
        const shippingAmount = (calculations.shipping / 100) * afterDiscount;
        return afterDiscount + taxAmount + shippingAmount;
    };

    const getBalanceDue = () => {
        return getTotal() - calculations.amountPaid;
    };


    const handleGenerateInvoice = () => {
        if (!validateForm()) return;

        const invoicePayload = prepareInvoiceData();
        console.log('Invoice payload being sent:', invoicePayload);
        dispatch(submitInvoice(invoicePayload));
    };

    const prepareInvoiceData = () => {
        return {
            date: invoiceData.date,
            dueDate: invoiceData.dueDate,
            companyName: "Cyberbells ITES Services Pvt Ltd",
            billTo: invoiceData.billTo,
            shipTo: invoiceData.shipTo,
            address: invoiceData.address,
            currency: selectedCurrency,
            currencySymbol: currencyMap[selectedCurrency].symbol,
            currencyPdfSymbol: currencyMap[selectedCurrency].pdfSymbol,
            items: items.map(item => ({
                description: item.description,
                quantity: Number(item.quantity) || 0,
                rate: Number(item.rate) || 0,
                amount: item.amount
            })),
            discount: calculations.discount,
            tax: calculations.tax,
            shipping: calculations.shipping,
            amountPaid: calculations.amountPaid,
            subtotal: getSubtotal(),
            total: getTotal(),
            balanceDue: getBalanceDue()
        };
    };

    return (
        <>
            {/* Currency Selector - Outside main container */}
            <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                    variant="outlined"
                    onClick={() => window.history.back()}
                    sx={{
                        textTransform: 'none',
                        fontSize: '12px',
                        minWidth: 'auto',
                        px: 2,
                        py: 0.5,
                        bgcolor: '#1976d2',
                        borderColor: '#1976d2',
                        color: 'white',
                        fontWeight: 500,
                        '&:hover': {
                            bgcolor: '#1565c0',
                            borderColor: '#1565c0'
                        }
                    }}
                >
                    ← Back
                </Button>
                <TextField
                    select
                    size="small"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    SelectProps={{ native: true }}
                    sx={{
                        minWidth: 80,
                        bgcolor: 'white',
                        borderRadius: 1,
                        '& .MuiInputBase-input': {
                            fontSize: '12px',
                            padding: '6px 8px',
                        }
                    }}
                >
                    {Object.entries(currencyMap).map(([key, currency]) => (
                        <option key={key} value={key}>
                            {currency.symbol} {currency.name}
                        </option>
                    ))}
                </TextField>
            </Box>
            <Box sx={{ p: 2, maxWidth: 1000, mx: "auto", bgcolor: '#f5f5f5', minHeight: '100vh' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        pt: 0.5,
                        bgcolor: 'white',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.200'
                    }}
                >
                    {/* Header */}
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        sx={{ mb: 0 }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                component="img"
                                src={cyberlogo}
                                alt="Company Logo"
                                sx={{
                                    width: 150,
                                    height: 120,
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                }}
                            />
                        </Stack>

                        <Box sx={{ textAlign: 'right', mt: 2, position: 'relative' }}>
                            <Typography variant="h4" fontWeight="600" color="text.primary" sx={{ mb: 1 }}>
                                INVOICE
                            </Typography>

                            <TextField
                                value={invoiceData.invoiceNumber}
                                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{
                                    width: 120,
                                    '& .MuiInputBase-input': {
                                        fontSize: '13px',
                                        padding: '6px 8px',
                                        color: 'rgba(0, 0, 0, 0.4)',
                                    },
                                    '& .MuiInputAdornment-root': {
                                        marginRight: '2px', // tighter spacing
                                    },
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: 'rgba(0, 0, 0, 0.4)',
                                                fontSize: '13px',
                                                lineHeight: 1,
                                            }}
                                        >
                                            #
                                        </Typography>
                                    ),
                                }}
                            />
                        </Box>

                    </Stack>

                    {/* From Company */}
                    <Box sx={{ mb: 4, mt: -3 }}>
                        <Typography
                            variant="body1"
                            fontWeight="700"
                            sx={{
                                fontSize: '16px',  // Normal size, not too big
                                color: 'text.primary',
                                lineHeight: 1.5
                            }}
                        >
                            Cyberbells ITES Services Pvt Ltd
                        </Typography>
                    </Box>

                    <Grid container spacing={0} sx={{ mb: 3 }}>
                        {/* Left side - Bill To section */}
                        <Grid item xs={8}>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 0.5, fontSize: '14px' }}>
                                        Bill To
                                    </Typography>
                                    <TextField
                                        placeholder="Client Name"
                                        value={invoiceData.billTo}
                                        onChange={(e) => handleInputChange('billTo', e.target.value)}
                                        variant="outlined"
                                        sx={{
                                            width: '100%',
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px',
                                                padding: '10px 12px',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 0.5, fontSize: '14px', visibility: 'hidden' }}>
                                        Email
                                    </Typography>
                                    <TextField
                                        placeholder="Client Email"
                                        value={invoiceData.shipTo}
                                        onChange={(e) => handleInputChange('shipTo', e.target.value)}
                                        variant="outlined"
                                        sx={{
                                            width: '100%',
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px',
                                                padding: '10px 12px',
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ mt: -3 }}>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 0.5, fontSize: '14px', visibility: 'hidden' }}>
                                        Address
                                    </Typography>
                                    <TextField
                                        placeholder="Client Address"
                                        value={invoiceData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        variant="outlined"
                                        multiline
                                        rows={2}
                                        sx={{
                                            width: '100%',
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px',
                                                padding: '0px 0px',
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Right side - Date and Due Date */}
                        <Grid item xs={4} sx={{ pl: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 0.5, fontSize: '14px' }}>
                                        Date
                                    </Typography>
                                    <TextField
                                        type="date"
                                        value={invoiceData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        variant="outlined"
                                        sx={{
                                            width: '100%',
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px',
                                                padding: '10px 12px',
                                            }
                                        }}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 0.5, fontSize: '14px' }}>
                                        Due Date
                                    </Typography>
                                    <TextField
                                        type="date"
                                        value={invoiceData.dueDate}
                                        onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                        variant="outlined"
                                        sx={{
                                            width: '100%',
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px',
                                                padding: '10px 12px',
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Items Table */}
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            mb: 2,
                            border: '1px solid',
                            borderColor: 'grey.200',
                            borderRadius: 2
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#334155' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, py: 1.5, fontSize: '14px' }}>
                                        Item
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, width: 100, py: 1.5, fontSize: '14px' }}>
                                        Quantity
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, width: 120, py: 1.5, fontSize: '14px' }}>
                                        Rate
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 600, width: 120, py: 1.5, fontSize: '14px' }}>
                                        Amount
                                    </TableCell>
                                    <TableCell sx={{ color: 'white', width: 40, py: 1.5 }}>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id} sx={{ '&:hover': { bgcolor: 'transparent' } }}>
                                        <TableCell sx={{ py: 0.25, px: 0.5, border: 'none' }}>
                                            <TextField
                                                fullWidth
                                                placeholder="Description of item/service..."
                                                value={item.description}
                                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        border: '1px solid #e8e8e8',
                                                        borderRadius: '8px',
                                                        '&:hover': {
                                                            borderColor: '#d4d4d4',
                                                            bgcolor: 'grey.50'
                                                        },
                                                        '&.Mui-focused': {
                                                            borderColor: 'primary.main',
                                                        }
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        fontSize: '14px',
                                                        fontWeight: item.description ? '600' : '400',
                                                        padding: '6px 10px',  // Reduced internal padding
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 0.25, px: 0.5, border: 'none' }}>  {/* Further reduced padding */}
                                            <TextField
                                                fullWidth
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    width: '80px',
                                                    marginLeft: '5px',
                                                    '& .MuiOutlinedInput-root': {
                                                        border: '1px solid #e8e8e8',  // Much lighter/faded border
                                                        borderRadius: '8px',
                                                        '&:hover': {
                                                            borderColor: '#d4d4d4',   // Lighter hover color
                                                            bgcolor: 'grey.50'
                                                        },
                                                        '&.Mui-focused': {
                                                            borderColor: 'primary.main',
                                                        }
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '6px 10px',  // Reduced internal padding
                                                    },
                                                    '& input[type=number]': {
                                                        '-moz-appearance': 'textfield',
                                                    },
                                                    '& input[type=number]::-webkit-outer-spin-button': {
                                                        '-webkit-appearance': 'none',
                                                        margin: 0,
                                                    },
                                                    '& input[type=number]::-webkit-inner-spin-button': {
                                                        '-webkit-appearance': 'none',
                                                        margin: 0,
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 0.25, px: 0.5, border: 'none' }}>  {/* Further reduced padding */}
                                            <TextField
                                                fullWidth
                                                type="number"
                                                value={item.rate}
                                                onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                                                variant="outlined"
                                                size="small"
                                                InputProps={{
                                                    startAdornment: <InputAdornment position="start">{currencyMap[selectedCurrency].symbol}</InputAdornment>,
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        border: '1px solid #e8e8e8',  // Much lighter/faded border
                                                        borderRadius: '8px',
                                                        '&:hover': {
                                                            borderColor: '#d4d4d4',   // Lighter hover color
                                                            bgcolor: 'grey.50'
                                                        },
                                                        '&.Mui-focused': {
                                                            borderColor: 'primary.main',
                                                        }
                                                    },
                                                    '& .MuiInputBase-input': {
                                                        padding: '6px 10px',  // Reduced internal padding
                                                    },
                                                    '& input[type=number]': {
                                                        '-moz-appearance': 'textfield',
                                                    },
                                                    '& input[type=number]::-webkit-outer-spin-button': {
                                                        '-webkit-appearance': 'none',
                                                        margin: 0,
                                                    },
                                                    '& input[type=number]::-webkit-inner-spin-button': {
                                                        '-webkit-appearance': 'none',
                                                        margin: 0,
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ py: 0.25, px: 0.5, border: 'none' }}>  {/* Further reduced padding */}
                                            <Box
                                                sx={{
                                                    border: '1px solid #e8e8e8',     // Much lighter/faded border
                                                    borderRadius: '8px',
                                                    padding: '6px 10px',             // Reduced internal padding
                                                    minHeight: '34px',               // Reduced height to match inputs
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    bgcolor: '#fafafa',              // Very light background
                                                }}
                                            >
                                                <Typography variant="body2" fontWeight="600" sx={{ fontSize: '14px' }}>
                                                    {currencyMap[selectedCurrency].symbol}{item.amount.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ py: 0.25, px: 0.5, border: 'none' }}>  {/* Further reduced padding */}
                                            <IconButton
                                                size="small"
                                                onClick={() => removeLineItem(item.id)}
                                                disabled={items.length === 1}
                                                sx={{
                                                    color: 'error.main',
                                                    border: '1px solid #fde7e7',    // Much lighter red border
                                                    borderRadius: '8px',
                                                    '&:hover': {
                                                        bgcolor: '#fef2f2',          // Very light red background
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Add Line Item Button */}
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addLineItem}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            borderColor: '#009e74',
                            color: '#009e74',
                            fontWeight: 500,
                            mb: 3,
                            fontSize: '14px',
                            '&:hover': {
                                borderColor: '#009e74',
                                bgcolor: 'rgba(6, 182, 212, 0.04)'
                            }
                        }}
                    >
                        Line Item
                    </Button>

                    {/* Notes and Calculations */}
                    <Grid container spacing={3}>
                        {/* Payee Details */}
                        <Box sx={{ mb: 3, mt: 10 }}>
                            <Typography variant="subtitle1" fontWeight="600" color="text.primary" sx={{ mb: 1, ml: 3, fontSize: '14px' }}>
                                Payee Details
                            </Typography>
                            <Box
                                sx={{
                                    border: '1px solid #e8e8e8',
                                    borderRadius: 2,
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    marginLeft: 1,
                                }}
                            >
                                <Typography variant="body2" sx={{ fontSize: '13px', lineHeight: 1.6 }}>
                                    <strong>Account Holder's Name:</strong> CYBERBELLS ITES SERVICES PVT LTD<br />
                                    <strong>Bank Account Number:</strong> 400076767676<br />
                                    <strong>Bank IFSC:</strong> RATN0000298<br />
                                    <strong>Bank Name:</strong> Ratnakar Bank Limited<br />
                                    <strong>Account Holder's Address:</strong> SCO 11, Phase 2, Industrial Area, Chandigarh, India, 160002
                                </Typography>
                            </Box>
                        </Box>

                        {/* Calculations Panel */}
                        <Grid item xs={12} md={4} sx={{ ml: 'auto' }}>
                            <Paper elevation={0} sx={{ bgcolor: 'white', p: 2, borderRadius: 2 }}>
                                <Stack spacing={2}>
                                    {/* Subtotal */}
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                            Subtotal
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                            {currencyMap[selectedCurrency].symbol}{getSubtotal().toFixed(2)}
                                        </Typography>
                                    </Stack>

                                    {/* Dynamic Fields (Discount, Tax, Shipping) */}
                                    <Stack spacing={1}>
                                        {/* Show all active fields */}
                                        {activeFields.map(field => (
                                            <Stack key={field} direction="row" justifyContent="space-between" alignItems="center">
                                                <Button
                                                    variant="text"
                                                    onClick={() => setActiveFields(prev => prev.filter(f => f !== field))}
                                                    sx={{
                                                        color: '#06b6d4',
                                                        textTransform: 'none',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        p: 0,
                                                        minWidth: 'auto',
                                                        '&:hover': { bgcolor: 'transparent' }
                                                    }}
                                                >
                                                    {`- ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                                                </Button>
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={calculations[field] === 0 ? '' : calculations[field]}
                                                    onChange={(e) => handleCalculationChange(field, e.target.value)}
                                                    placeholder="0"
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                    }}
                                                    sx={{
                                                        width: 120,
                                                        '& input[type=number]': {
                                                            '-moz-appearance': 'textfield',
                                                        },
                                                        '& input[type=number]::-webkit-outer-spin-button': {
                                                            '-webkit-appearance': 'none',
                                                            margin: 0,
                                                        },
                                                        '& input[type=number]::-webkit-inner-spin-button': {
                                                            '-webkit-appearance': 'none',
                                                            margin: 0,
                                                        }
                                                    }}
                                                />
                                            </Stack>
                                        ))}

                                        {/* Buttons for inactive fields only */}
                                        {['discount', 'tax', 'shipping'].filter(field => !activeFields.includes(field)).length > 0 && (
                                            <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                                                {['discount', 'tax', 'shipping'].filter(field => !activeFields.includes(field)).map(field => (
                                                    <Button
                                                        key={field}
                                                        variant="text"
                                                        onClick={() => setActiveFields(prev => [...prev, field])}
                                                        sx={{
                                                            color: '#06b6d4',
                                                            textTransform: 'none',
                                                            fontSize: '14px',
                                                            fontWeight: 500,
                                                            p: 0,
                                                            minWidth: 'auto',
                                                            '&:hover': { bgcolor: 'transparent' }
                                                        }}
                                                    >
                                                        {`+ ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                                                    </Button>
                                                ))}
                                            </Stack>
                                        )}
                                    </Stack>

                                    {/* Show calculation breakdown for active fields */}
                                    {activeFields.includes('discount') && calculations.discount > 0 && (
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" sx={{ fontSize: '14px', color: 'error.main' }}>
                                                Discount ({calculations.discount}%)
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px', color: 'error.main' }}>
                                                -{currencyMap[selectedCurrency].symbol}{((calculations.discount / 100) * getSubtotal()).toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    )}

                                    {activeFields.includes('tax') && calculations.tax > 0 && (
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                Tax ({calculations.tax}%)
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                +{currencyMap[selectedCurrency].symbol}{((calculations.tax / 100) * (getSubtotal() - (calculations.discount / 100) * getSubtotal())).toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    )}

                                    {activeFields.includes('shipping') && calculations.shipping > 0 && (
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                Shipping ({calculations.shipping}%)
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                                +{currencyMap[selectedCurrency].symbol}{((calculations.shipping / 100) * (getSubtotal() - (calculations.discount / 100) * getSubtotal())).toFixed(2)}
                                            </Typography>
                                        </Stack>
                                    )}

                                    {/* Total */}
                                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
                                        <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '16px' }}>
                                            Total
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '16px' }}>
                                            {currencyMap[selectedCurrency].symbol}{getTotal().toFixed(2)}

                                        </Typography>
                                    </Stack>

                                    {/* Amount Paid */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" sx={{ fontSize: '14px' }}>
                                            Amount Paid
                                        </Typography>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={calculations.amountPaid === 0 ? '' : calculations.amountPaid}
                                            onChange={(e) => handleCalculationChange('amountPaid', e.target.value)}
                                            placeholder="0"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start">{currencyMap[selectedCurrency].symbol}</InputAdornment>,
                                            }}
                                            sx={{
                                                width: 120,
                                                '& input[type=number]': {
                                                    '-moz-appearance': 'textfield',
                                                },
                                                '& input[type=number]::-webkit-outer-spin-button': {
                                                    '-webkit-appearance': 'none',
                                                    margin: 0,
                                                },
                                                '& input[type=number]::-webkit-inner-spin-button': {
                                                    '-webkit-appearance': 'none',
                                                    margin: 0,
                                                }
                                            }}
                                        />
                                    </Stack>

                                    {/* Balance Due */}
                                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
                                        <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '16px' }}>
                                            Balance Due
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight="600" sx={{ fontSize: '16px' }}>
                                            {currencyMap[selectedCurrency].symbol}{getBalanceDue().toFixed(2)}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={generatePDF}
                            disabled={loading}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                fontWeight: 500,
                                fontSize: '14px'
                            }}
                        >
                            Save as PDF
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleGenerateInvoice}
                            disabled={submitLoading}
                            startIcon={submitLoading ? <CircularProgress size={16} /> : null}
                            sx={{
                                textTransform: 'none',
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                fontWeight: 500,
                                fontSize: '14px'
                            }}
                        >
                            {submitLoading ? 'Generating...' : 'Generate Invoice'}
                        </Button>
                    </Stack>
                </Paper>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </Box>
        </>
    );
};

export default InvoiceGenerator;