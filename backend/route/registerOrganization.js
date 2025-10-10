import express from "express";
import { registerWithOrganization } from "../controller/registerWithOrganization.js";

const routerOrganization = express.Router();
routerOrganization.post("/registerOrgAdmin", registerWithOrganization);
export default routerOrganization;
