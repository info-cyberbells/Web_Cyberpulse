import Invoice from "../model/invoiceModel.js";

const generateInvoiceNumber = async () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const datePrefix = `${dd}${mm}${yyyy}`;

    const startOfDay = new Date(yyyy, today.getMonth(), today.getDate());
    const endOfDay = new Date(yyyy, today.getMonth(), today.getDate() + 1);

    const count = await Invoice.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    const serial = String(count + 1).padStart(2, '0');
    return `${datePrefix}${serial}`;
};



export const createInvoice = async (req, res) => {
    try {
        const data = req.body;
        const subtotal = data.items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const discountAmount = (data.discount / 100) * subtotal;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (data.tax / 100) * afterDiscount;
        const shippingAmount = (data.shipping / 100) * afterDiscount;
        const total = afterDiscount + taxAmount + shippingAmount;
        const balanceDue = total - (data.amountPaid || 0);


        const invoiceNumber = await generateInvoiceNumber();

        const invoice = new Invoice({
            ...data,
            invoiceNumber,
            subtotal,
            total,
            balanceDue,
        });

        await invoice.save();

        res.status(201).json({
            success: true,
            message: "Invoice created successfully",
            invoice,
        });
    } catch (error) {
        console.error("Error saving invoice:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message,
        });
    }
};

export const getNextInvoiceNumber = async (req, res) => {
    try {
        const invoiceNumber = await generateInvoiceNumber();
        res.status(200).json({ invoiceNumber });
    } catch (err) {
        console.error("Error getting invoice number:", err);
        res.status(500).json({ error: "Failed to generate invoice number" });
    }
};


export const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Invoices fetched successfully",
            data: invoices,
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch invoices",
            error: error.message,
        });
    }
};
