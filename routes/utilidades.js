"use strict";
const scopes = ['https://www.googleapis.com/auth/drive'];
const credenciales = "" + process.env.CREDENCIALES_SERVICIO_GOOGLE_DRIVE;
const serviceAccount = JSON.parse(credenciales);
