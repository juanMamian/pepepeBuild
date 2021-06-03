"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drive = exports.jwToken = void 0;
const { google } = require("googleapis");
const scopes = ['https://www.googleapis.com/auth/drive'];
const credenciales = "" + process.env.CREDENCIALES_SERVICIO_GOOGLE_DRIVE;
const serviceAccount = JSON.parse(credenciales);
exports.jwToken = new google.auth.JWT(serviceAccount.client_email, null, serviceAccount.private_key, scopes, null);
exports.drive = google.drive({
    version: "v3"
});
