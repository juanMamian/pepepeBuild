"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloConversacion = exports.charProhibidosMensajeRespuesta = exports.esquemaConversacion = exports.esquemaRespuestaConversacion = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var esquemaInterpolacion = new mongoose_1.default.Schema({
    tipo: {
        type: String,
        required: true,
        enum: ["video", "quote", "imagen"]
    },
    enlaceIframe: {
        type: String,
    },
    mensaje: {
        type: String,
    }
});
esquemaInterpolacion.add({
    quote: {
        type: {
            mensaje: String,
            infoAutor: {
                id: String,
                nombres: String,
                apellidos: String,
                username: String,
            },
            interpolaciones: [esquemaInterpolacion],
            fecha: Date,
        },
    },
});
exports.esquemaRespuestaConversacion = new mongoose_1.default.Schema({
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    archivo: {
        nombre: String,
        extension: String,
        idGoogleDrive: String,
        googleDriveDirectLink: String,
    },
    mensaje: {
        type: String,
    },
    enlaceAdjunto: {
        type: [String],
        default: []
    },
    idAutor: {
        type: String,
        required: true,
    },
    infoAutor: {
        id: String,
        nombres: String,
        apellidos: String,
        username: String
    },
    interpolaciones: [esquemaInterpolacion]
});
exports.esquemaConversacion = new mongoose_1.default.Schema({
    titulo: {
        type: String,
        default: "Nueva conversación",
        required: true
    },
    estado: {
        type: String,
        default: "abierta",
        required: true,
        enum: ["abierta", "cerrada"]
    },
    idCreador: {
        type: String,
    },
    acceso: {
        type: String,
        required: true,
        default: "publico",
        enum: ["publico", "privado"]
    },
    cantidadRespuestas: {
        type: Number,
        default: 0,
        required: true,
    },
    infoUltimaRespuesta: {
        idAutor: String,
        fecha: {
            type: Date,
            required: true,
            default: new Date(2021, 2, 1),
        }
    }
});
exports.esquemaConversacion.pre('save', function (next) {
    if (!this.cantidadRespuestas) {
        console.log(`Llenando con cantidadRespuestas 0`);
        this.cantidadRespuestas = 0;
    }
    next();
});
exports.charProhibidosMensajeRespuesta = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;
exports.ModeloConversacion = mongoose_1.default.model("Conversacion", exports.esquemaConversacion);
