import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Button,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField as MuiTextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Divider,
    Chip,
    Tooltip,
    Alert,
    Card,
    CardContent,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import PaymentsIcon from "@mui/icons-material/Payments";
import { Document, Packer, Paragraph, TextRun, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell } from "docx";
import { saveAs } from "file-saver";
import DownloadIcon from "@mui/icons-material/Download";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchEmployeesForSalary,
    calculateEmployeeSalary,
    clearError,
} from '../../features/salary/salarySlice';
const HeaderCard = styled(Card)(({ theme }) => ({
    background: "#ffffff",
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
}));


const EmployeeSalaryCalculator = () => {
    const dispatch = useDispatch();
    const {
        employees,
        calculationResults,
        loading,
        calculating,
        error
    } = useSelector((state) => state.salary);
    const [salaryData, setSalaryData] = useState({});
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];


    const currentYear = new Date().getFullYear();
    const years = [currentYear];

    useEffect(() => {
        dispatch(fetchEmployeesForSalary());
    }, [dispatch]);

    useEffect(() => {
        if (employees.length > 0) {
            const initialSalaryData = {};
            employees.forEach(emp => {
                initialSalaryData[emp._id] = "";
            });
            setSalaryData(initialSalaryData);
        }
    }, [employees]);

    useEffect(() => {
        if (error) {
            // Error is already set in Redux state, no need for local alert
            console.error("Salary calculation error:", error);
        }
    }, [error]);

    const handleSalaryChange = (employeeId, value) => {
        if (value === '' || (Number(value) >= 0 && value.length <= 7 && /^\d*$/.test(value))) {
            setSalaryData({
                ...salaryData,
                [employeeId]: value,
            });
        }
    };

    const handleCalculate = () => {
        const employeeSalaries = Object.keys(salaryData)
            .filter(id => salaryData[id] !== "")
            .map((employeeId) => ({
                employeeId,
                salary: salaryData[employeeId],
            }));

        const data = {
            employees: employeeSalaries,
            month: parseInt(month) - 1,
            year: parseInt(year),
        };

        dispatch(calculateEmployeeSalary(data));
    };


    const generateWordDocument = () => {
        console.log("Document constructor:", Document);
        if (!calculationResults) {
            console.warn("No calculation results available for download");
            return;
        }

        try {
            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            // Dummy lines
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Salary Calculation Report",
                                        bold: true,
                                        size: 24, // Font size in half-points (24 = 12pt)
                                    }),
                                ],
                                spacing: { after: 200 },
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Generated by Employee Salary Calculator",
                                        italics: true,
                                    }),
                                ],
                                spacing: { after: 400 },
                            }),


                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Employee Details",
                                        bold: true,
                                        size: 22,
                                    }),
                                ],
                                spacing: { after: 200 },
                            }),

                            // Salary Data Table
                            new DocxTable({
                                rows: [
                                    // Header Row
                                    new DocxTableRow({
                                        children: [
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({ text: "Employee", bold: true })],
                                                    }),
                                                ],
                                            }),
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({ text: "Base Salary", bold: true })],
                                                    }),
                                                ],
                                            }),
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({ text: "Per Day", bold: true })],
                                                    }),
                                                ],
                                            }),
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({ text: "Present/Absent", bold: true })],
                                                    }),
                                                ],
                                            }),
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({ text: "Deductions", bold: true })],
                                                    }),
                                                ],
                                            }),
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({ text: "Final Salary", bold: true })],
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),

                                    // Data Rows
                                    ...calculationResults.employees.map(emp => (
                                        new DocxTableRow({
                                            children: [
                                                new DocxTableCell({
                                                    children: [new Paragraph({
                                                        children: [new TextRun({ text: emp.name, bold: true })],
                                                    }),
                                                    new Paragraph({
                                                        children: [new TextRun({ text: emp.email || "N/A", italics: true })],
                                                    }),],
                                                }),
                                                new DocxTableCell({
                                                    children: [new Paragraph(emp.salary ? `₹${emp.salary}` : "Not set")],
                                                }),
                                                new DocxTableCell({
                                                    children: [new Paragraph(emp.perDaySalary ? formatCurrency(emp.perDaySalary) : "-")],
                                                }),
                                                new DocxTableCell({
                                                    children: [new Paragraph(`Present: ${emp.daysPresent}\nAbsent: ${emp.daysAbsent}`)],
                                                }),
                                                new DocxTableCell({
                                                    children: [new Paragraph(emp.deductionDays > 0 ? `${emp.deductionDays} days (${formatCurrency(emp.deductionDays * emp.perDaySalary)})` : "None")],
                                                }),
                                                new DocxTableCell({
                                                    children: [new Paragraph(formatCurrency(emp.finalSalary))],
                                                }),
                                            ],
                                        })
                                    )),
                                ],
                            }),
                        ],
                    },
                ],
            });

            Packer.toBlob(doc).then(blob => {
                saveAs(blob, `Salary_Report_${months.find(m => m.value === month)?.label}_${year}.docx`);
            }).catch(err => {
                console.error("Error generating Word document:", err);
            });
        } catch (err) {
            console.error("Error in generateWordDocument:", err);
        }
    };



    const generateDetailedWordDocument = () => {
        if (!calculationResults) {
            console.warn("No calculation results available for download");
            return;
        }

        try {
            // Calculate totals
            let totalBaseSalary = 0;
            let totalFinalSalary = 0;
            calculationResults.employees.forEach(emp => {
                totalBaseSalary += Number(emp.salary) || 0;
                totalFinalSalary += Number(emp.finalSalary) || 0;
            });

            const doc = new Document({
                sections: [
                    {
                        properties: {},
                        children: [
                            // Header
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Detailed Salary Report",
                                        bold: true,
                                        size: 24, // Font size in half-points (24 = 12pt)
                                    }),
                                ],
                                spacing: { after: 200 },
                            }),
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `Period: ${months.find(m => m.value === month)?.label} ${year}`,
                                        italics: true,
                                    }),
                                ],
                                spacing: { after: 400 },
                            }),


                            // Detailed Employee Information in a single table
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: "Employee Details",
                                        bold: true,
                                        size: 22,
                                    }),
                                ],
                                spacing: { after: 200 },
                            }),

                            // Single comprehensive table
                            new DocxTable({
                                rows: [
                                    // Header row
                                    new DocxTableRow({
                                        children: [
                                            new DocxTableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "Employee Name & Email", bold: true })]
                                                })],
                                            }),
                                            new DocxTableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "Bank Name", bold: true })]
                                                })],
                                            }),
                                            new DocxTableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "Account Number", bold: true })]
                                                })],
                                            }),
                                            new DocxTableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "IFSC Code", bold: true })]
                                                })],
                                            }),
                                            new DocxTableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "Base Salary (INR)", bold: true })]
                                                })],
                                            }),
                                            new DocxTableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({ text: "Final Salary (INR)", bold: true })]
                                                })],
                                            }),
                                        ],
                                    }),

                                    // Data rows - one for each employee
                                    ...calculationResults.employees.map(emp => (
                                        new DocxTableRow({
                                            children: [
                                                // Employee Name & Email
                                                new DocxTableCell({
                                                    children: [
                                                        new Paragraph({
                                                            children: [new TextRun({ text: emp.name, bold: true })],
                                                        }),
                                                        new Paragraph({
                                                            children: [new TextRun({ text: emp.email || "N/A", italics: true })],
                                                        }),
                                                    ],
                                                }),
                                                // Bank Name
                                                new DocxTableCell({
                                                    children: [new Paragraph(emp.BankName || "Not provided")],
                                                }),
                                                // Account Number
                                                new DocxTableCell({
                                                    children: [new Paragraph(emp.BankAccountNumber || "Not provided")],
                                                }),
                                                // IFSC Code
                                                new DocxTableCell({
                                                    children: [new Paragraph(emp.BankAccountIFSCCode || "Not provided")],
                                                }),
                                                // Base Salary
                                                new DocxTableCell({
                                                    children: [new Paragraph(emp.salary || "Not set")],
                                                }),
                                                // Final Salary
                                                new DocxTableCell({
                                                    children: [new Paragraph({
                                                        children: [new TextRun({
                                                            text: emp.finalSalary.toString(),
                                                            bold: true
                                                        })],
                                                    })],
                                                }),
                                            ],
                                        })
                                    )),

                                    // Totals row
                                    new DocxTableRow({
                                        children: [
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({ text: "TOTAL", bold: true })],
                                                    }),
                                                ],
                                            }),
                                            new DocxTableCell({
                                                children: [new Paragraph("")],
                                            }),
                                            new DocxTableCell({
                                                children: [new Paragraph("")],
                                            }),
                                            new DocxTableCell({
                                                children: [new Paragraph("")],
                                            }),
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({
                                                            text: totalBaseSalary.toString(),
                                                            bold: true
                                                        })],
                                                    }),
                                                ],
                                            }),
                                            new DocxTableCell({
                                                children: [
                                                    new Paragraph({
                                                        children: [new TextRun({
                                                            text: totalFinalSalary.toString(),
                                                            bold: true
                                                        })],
                                                    }),
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    },
                ],
            });

            Packer.toBlob(doc).then(blob => {
                saveAs(blob, `Detailed_Salary_Report_${months.find(m => m.value === month)?.label}_${year}.docx`);
            }).catch(err => {
                console.error("Error generating detailed Word document:", err);
            });
        } catch (err) {
            console.error("Error in generateDetailedWordDocument:", err);
        }
    };



    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <Box sx={{ p: 4, maxWidth: 1100, mx: "auto" }}>

            <HeaderCard>
                <CardContent sx={{ py: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: 'wrap' }}>
                        <Box>
                            <Typography variant="h5" fontWeight="700" color="#2563eb" gutterBottom>
                                Employee Salary Calculator
                            </Typography>
                            <Typography variant="body2" color="#6b7280">
                                Easily calculate employee salaries, deductions, and net pay
                            </Typography>
                        </Box>
                        <CalculateIcon
                            fontSize="large"
                            sx={{ color: "#2563eb" }}
                        />
                    </Box>
                </CardContent>
            </HeaderCard>


            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="month-select-label">Month</InputLabel>
                            <Select
                                labelId="month-select-label"
                                id="month-select"
                                value={month}
                                label="Month"
                                onChange={(e) => setMonth(e.target.value)}
                                startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                            >
                                {months.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>
                                        {m.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel id="year-select-label">Year</InputLabel>
                            <Select
                                labelId="year-select-label"
                                id="year-select"
                                value={year}
                                label="Year"
                                onChange={(e) => setYear(e.target.value)}
                            >
                                {years.map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Employee Salary Input Table */}
                {!loading && employees.length > 0 && (
                    <>
                        <TableContainer sx={{ mb: 3, boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: 1 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f5f9fc' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Name</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Email & Position</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Base Salary (₹)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {employees.map((employee) => (
                                        <TableRow key={employee._id} hover>
                                            <TableCell>{employee.name}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2">{employee.email}</Typography>
                                                <Chip
                                                    size="small"
                                                    label={employee.position}
                                                    sx={{ mt: 0.5, bgcolor: '#f0f4f8', color: '#2c3e50', border: '1px solid #e0e0e0' }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <MuiTextField
                                                    type="number"
                                                    value={salaryData[employee._id] || ""}
                                                    onChange={(e) => handleSalaryChange(employee._id, e.target.value)}
                                                    fullWidth
                                                    placeholder="Enter amount"
                                                    InputProps={{
                                                        startAdornment: <PaymentsIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                                        inputProps: {
                                                            min: 0,
                                                            max: 9999999,
                                                            maxLength: 7,
                                                            pattern: '[0-9]*'
                                                        }
                                                    }}
                                                    size="small"
                                                    onKeyPress={(e) => {
                                                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Button
                            variant="contained"
                            fullWidth
                            sx={{
                                py: 1.5,
                                mb: 3,
                                bgcolor: '#3f51b5',
                                '&:hover': {
                                    bgcolor: '#303f9f',
                                }
                            }}
                            startIcon={<CalculateIcon />}
                            onClick={handleCalculate}
                            disabled={calculating}
                        >
                            {calculating ? <CircularProgress size={24} /> : "Calculate Salary"}
                        </Button>
                    </>
                )}

                {/* Calculation Results */}
                {calculationResults && calculationResults.employees.length > 0 && (
                    <Box mt={4}>
                        <Box mt={4}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
                                <Tooltip title="Download detailed salary breakdown">
                                    <Button
                                        variant="contained"
                                        startIcon={<DownloadIcon />}
                                        onClick={generateWordDocument}
                                        sx={{
                                            bgcolor: '#3f51b5',
                                            color: '#ffffff',
                                            '&:hover': {
                                                bgcolor: '#303f9f',
                                            },
                                        }}
                                    >
                                        Download Report
                                    </Button>
                                </Tooltip>


                                <Tooltip title="Download summary salary report">
                                    <Button
                                        variant="outlined"
                                        startIcon={<DownloadIcon />}
                                        onClick={generateDetailedWordDocument}
                                        sx={{
                                            bgcolor: '#ffffff',
                                            borderColor: '#3f51b5',
                                            color: '#3f51b5',
                                            '&:hover': {
                                                bgcolor: '#f0f4f8',
                                                borderColor: '#303f9f',
                                            },
                                        }}
                                    >
                                        Download Full Detail
                                    </Button>
                                </Tooltip>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }}>
                            <Chip label="Calculation Results" sx={{ bgcolor: '#ebf5ff', color: '#3f51b5', border: '1px solid #c5cae9' }} />
                        </Divider>

                        {/* Summary Cards */}
                        <Grid container spacing={3} mb={4}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>Month</Typography>
                                        <Typography variant="h6">{months.find(m => m.value === month)?.label} {year}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>Total Days</Typography>
                                        <Typography variant="h6">{calculationResults.totalDaysInMonth}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>Weekend Days</Typography>
                                        <Typography variant="h6">{calculationResults.weekendDays}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Card>
                                    <CardContent>
                                        <Typography color="textSecondary" gutterBottom>Working Days</Typography>
                                        <Typography variant="h6">{calculationResults.totalWorkingDays}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Results Table */}
                        <Typography variant="h6" mb={2} sx={{ display: 'flex', alignItems: 'center' }}>
                            <WorkIcon sx={{ mr: 1 }} /> Salary Calculation Details
                        </Typography>
                        <TableContainer sx={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: 1 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f0f7ff' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Employee</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Base Salary</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Per Day</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Present/Absent</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Deductions</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: '#344767' }}>Final Salary</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {calculationResults.employees.map((emp) => (
                                        <TableRow key={emp.employeeId} hover>
                                            <TableCell>
                                                <Typography fontWeight="500">{emp.name}</Typography>
                                                <Typography variant="caption" color="textSecondary">{emp.email}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                {emp.salary ? `₹${emp.salary}` : "Not set"}
                                            </TableCell>                                            <TableCell>{emp.perDaySalary ? formatCurrency(emp.perDaySalary) : "-"}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Chip
                                                        size="small"
                                                        label={`Present: ${emp.daysPresent}`}
                                                        sx={{
                                                            bgcolor: '#e8f5e9',
                                                            color: '#2e7d32',
                                                            border: '1px solid #c8e6c9'
                                                        }}
                                                    />
                                                    <Chip
                                                        size="small"
                                                        label={`Absent: ${emp.daysAbsent}`}
                                                        sx={{
                                                            bgcolor: emp.daysAbsent > 0 ? '#fff8e1' : '#f5f5f5',
                                                            color: emp.daysAbsent > 0 ? '#f57c00' : '#757575',
                                                            border: '1px solid #ffe0b2'
                                                        }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {emp.deductionDays > 0 ? (
                                                    <Typography sx={{ color: '#e57373' }}>
                                                        {emp.deductionDays} days ({formatCurrency(emp.deductionDays * emp.perDaySalary)})
                                                    </Typography>
                                                ) : (
                                                    <Typography sx={{ color: '#66bb6a' }}>None</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#3f51b5' }}>
                                                    {formatCurrency(emp.finalSalary)}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}

                {!loading && employees.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No employees found. Please add employees to the system first.
                    </Alert>
                )}
            </Paper>
        </Box>
    );
};

export default EmployeeSalaryCalculator;