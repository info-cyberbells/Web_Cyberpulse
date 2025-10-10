import React from 'react';
import styled from '@emotion/styled';
import Cyber from '../../assets/cyberlogo.png'

// Styled components from HTML CSS
const Container = styled.div`
  width: 800px;
  margin: 0 auto;
  padding: 20px;
  position: relative;
  overflow: hidden;
  font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
  color: #000;
`;

const Sidebar = styled.div`
  position: absolute;
  left: 0;
  top: 200px;
  bottom: 200px;
  width: 15px;
  background: linear-gradient(to bottom, #dc3545 50%, #6c757d 50%);
  z-index: 2;
`;



const Watermark = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.25;
  z-index: 1;
  text-align: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #dc3545;
  padding-bottom: 10px;
  margin-bottom: 20px;
  position: relative;
  z-index: 2;
`;

const Logo = styled.img`
  width: 250px;
`;

const CompanyInfo = styled.div`
  text-align: right;
  font-size: 14px;
`;

const Title = styled.div`
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin: 20px 0 30px;
  position: relative;
  z-index: 2;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 90px;
`;

const EmployeeDetails = styled.div`
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 10px;
  gap: 8px;
`;

const Label = styled.div`
  width: 150px;
  font-weight: bold;
`;

const Colon = styled.div`
  width: 20px;
  text-align: center;
`;

const Value = styled.div`
  flex-grow: 1;
  margin-left: 25px;
`;

const SalaryDetails = styled.div`
  margin-bottom: 30px;
  position: relative;
  z-index: 2;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 10px;
`;

const SalaryRow = styled.div`
  display: flex;
  margin-bottom: 5px;
  margin-left: 30px;
`;

const SalaryLabel = styled.div`
  width: 200px;
`;

const SalaryColon = styled.div`
  width: 20px;
  text-align: center;
`;

const SalaryValue = styled.div`
  white-space: nowrap;
  width: 150px;
  margin-left: 20px;
`;

const TotalRow = styled.div`
  margin-top: 10px;
  border-top: 1px solid #ddd;
  padding-top: 5px;
`;

const AmountText = styled.div`
text-align: center;
  font-style: italic;
  margin-top: 5px;
`;

const Note = styled.div`
  position: relative;
  z-index: 2;
`;

const NoteTitle = styled.div`
  font-weight: bold;
`;

const NoteText = styled.div`
  margin-top: 5px;
`;

// Simple number-to-words function for Indian English
const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';

    const convertLessThanThousand = (n) => {
        if (n === 0) return '';
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return `${tens[Math.floor(n / 10)]} ${units[n % 10]}`.trim();
        return `${units[Math.floor(n / 100)]} Hundred ${convertLessThanThousand(n % 100)}`.trim();
    };

    let parts = [];
    let i = 0;
    while (num > 0) {
        if (i === 0) {
            parts.push(convertLessThanThousand(num % 1000));
        } else if (i === 1) {
            parts.push(convertLessThanThousand(num % 100));
        } else if (i === 2) {
            parts.push(convertLessThanThousand(num % 100));
        }
        num = Math.floor(num / (i === 0 ? 1000 : 100));
        i++;
    }

    let result = '';
    for (let j = parts.length - 1; j >= 0; j--) {
        if (parts[j]) {
            result += `${parts[j]} ${thousands[j]} `;
        }
    }

    return `${result.trim()} Rupees only`;
};

const SalarySlipTemplate = ({ salarySlip }) => {
    return (
        <Container id="salary-slip-template">
            <Sidebar />
            <Watermark>
                <img src={Cyber} alt="Watermark" />
            </Watermark>
            <Header>
                <div>
                    <Logo src={Cyber} alt="Cyberbells Logo" />
                </div>
                <CompanyInfo>
                    Phone: +91-98778-85863<br />
                    Email: hr@cyberbells.com<br />
                    Email: info@cyberbells.com
                </CompanyInfo>
            </Header>
            <Title>Salary Slip - {salarySlip.month}</Title>
            <MainContent>
                <EmployeeDetails>
                    <DetailRow>
                        <Label>Name</Label>
                        <Colon>:</Colon>
                        <Value>{salarySlip.name}</Value>
                    </DetailRow>
                    <DetailRow>
                        <Label>Designation</Label>
                        <Colon>:</Colon>
                        <Value>{salarySlip.designation}</Value>
                    </DetailRow>
                    <DetailRow>
                        <Label>Month</Label>
                        <Colon>:</Colon>
                        <Value>{salarySlip.month}</Value>
                    </DetailRow>
                    <DetailRow>
                        <Label>Location</Label>
                        <Colon>:</Colon>
                        {/* <Value>{salarySlip.location}</Value> */}
                        <Value>Industrial Area Phase-2, Chandigarh</Value>
                    </DetailRow>
                </EmployeeDetails>
                <SalaryDetails>
                    <SectionTitle>a) Remuneration</SectionTitle>
                    {salarySlip.allowances.basicSalary && (
                        <SalaryRow>
                            <SalaryLabel>Basic Salary</SalaryLabel>
                            <SalaryColon>:</SalaryColon>
                            <SalaryValue>Rs. {salarySlip.allowances.basicSalary.toLocaleString('en-IN')}/- per month</SalaryValue>
                        </SalaryRow>
                    )}
                    {salarySlip.allowances.hra && (
                        <SalaryRow>
                            <SalaryLabel>House Rent Allowance</SalaryLabel>
                            <SalaryColon>:</SalaryColon>
                            <SalaryValue>Rs. {salarySlip.allowances.hra.toLocaleString('en-IN')}/- per month</SalaryValue>
                        </SalaryRow>
                    )}
                    {salarySlip.allowances.leaveTravelAllowance && (
                        <SalaryRow>
                            <SalaryLabel>Leave/Travel Allowance</SalaryLabel>
                            <SalaryColon>:</SalaryColon>
                            <SalaryValue>Rs. {salarySlip.allowances.leaveTravelAllowance.toLocaleString('en-IN')}/- per month</SalaryValue>
                        </SalaryRow>
                    )}
                    {salarySlip.allowances.conveyanceAllowance && (
                        <SalaryRow>
                            <SalaryLabel>Conveyance Allowance</SalaryLabel>
                            <SalaryColon>:</SalaryColon>
                            <SalaryValue>Rs. {salarySlip.allowances.conveyanceAllowance.toLocaleString('en-IN')}/- per month</SalaryValue>
                        </SalaryRow>
                    )}
                    {salarySlip.allowances.medicalAllowance && (
                        <SalaryRow>
                            <SalaryLabel>Medical Allowance</SalaryLabel>
                            <SalaryColon>:</SalaryColon>
                            <SalaryValue>Rs. {salarySlip.allowances.medicalAllowance.toLocaleString('en-IN')}/- per month</SalaryValue>
                        </SalaryRow>
                    )}
                    <SalaryRow>
                        <SalaryLabel>Total working days</SalaryLabel>
                        <SalaryColon>:</SalaryColon>
                        <SalaryValue>30 Days</SalaryValue>
                    </SalaryRow>
                    <SalaryRow className="total-row">
                        <SalaryLabel>Total</SalaryLabel>
                        <SalaryColon>:</SalaryColon>
                        <SalaryValue>Rs. {salarySlip.totalSalary.toLocaleString('en-IN')}/- per month</SalaryValue>
                    </SalaryRow>
                    <AmountText>({numberToWords(salarySlip.totalSalary)}).</AmountText>
                </SalaryDetails>
                <SalaryDetails>
                    <SectionTitle>b) Retrials</SectionTitle>
                    <p>Your TDS will be deducted from all payments made to you by company as per current rules for Govt. of India.</p>
                </SalaryDetails>
                <SalaryDetails>
                    <SectionTitle>c) Leave</SectionTitle>
                    <p>You will be entitled to privilege, sick and casual leave as applicable to your category of employees.</p>
                </SalaryDetails>
                <Note>
                    <NoteTitle>Note:</NoteTitle>
                    <NoteText>
                        • It is expected that individual compensation package would not be shared with other employees.<br />
                        The above compensation structure is subject to change without affecting emoluments adversely.
                    </NoteText>
                </Note>
            </MainContent>
        </Container>
    );
};

export default SalarySlipTemplate;
