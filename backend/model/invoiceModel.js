import mongoose from 'mongoose';
import encrypt from "mongoose-encryption";

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true },
    date: String,
    dueDate: String,

    companyName: String,

    billTo: String,
    shipTo: String,
    address: String,

    items: [
        {
            description: String,
            quantity: Number,
            rate: Number,
            amount: Number,
        }
    ],

    discount: Number,
    tax: Number,
    shipping: Number,
    amountPaid: Number,

    subtotal: Number,
    total: Number,
    balanceDue: Number,
    currency: String,
    currencySymbol: String,
    currencyPdfSymbol: String,

    createdAt: {
        type: Date,
        default: Date.now,
    }
});

invoiceSchema.plugin(encrypt, {
    secret: process.env.INVOICE_SECRET_KEY,
    excludeFromEncryption: ['invoiceNumber', 'createdAt', 'updatedAt']
});

export default mongoose.model("Invoice", invoiceSchema);
