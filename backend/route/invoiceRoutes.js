import express from "express";
import { createInvoice, getNextInvoiceNumber, getInvoices } from "../controller/invoiceController.js";

const invoiceRouter = express.Router();

invoiceRouter.post("/generateInvoice", createInvoice);
invoiceRouter.get("/getInvoiceNumber", getNextInvoiceNumber);
invoiceRouter.get("/getAllInvoices", getInvoices);

export default invoiceRouter;
