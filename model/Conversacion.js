"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloConversacion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const esquemaRespuestaConversacion = new mongoose_1.default.Schema({
    fechaUpload: {
        type: Date
    },
    archivo: {
        nombre: String,
        extension: String,
        idGoogleDrive: String,
        googleDriveDirectLink: String,
    },
    comentario: {
        type: String,
    },
    idAutor: {
        type: String,
        required: true,
    }
});
const esquemaConversacion = new mongoose_1.default.Schema({
    visibilidad: {
        type: String,
        default: "publica",
        required: true,
        enum: ["publica", "privada"],
    },
    estado: {
        type: String,
        default: "abierta",
        required: true,
        enum: ["abierta", "cerrada"]
    },
    respuestas: {
        type: [esquemaRespuestaConversacion],
        required: true,
        default: []
    },
});
exports.ModeloConversacion = mongoose_1.default.model("Conversacion", esquemaConversacion);
