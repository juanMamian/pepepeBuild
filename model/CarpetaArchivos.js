"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloCarpetaArchivos = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const esquemaArchivo = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        required: true,
        max: 100,
        min: 4,
    },
    payload: {
        type: Buffer,
        required: true
    },
    primario: {
        type: Boolean,
        required: true,
        default: false
    },
    mimetype: {
        type: String,
        required: true
    }
});
const esquemaCarpetaArchivos = new mongoose_1.default.Schema({
    archivos: [esquemaArchivo]
});
exports.ModeloCarpetaArchivos = mongoose_1.default.model("carpetasArchivosContenidosNodos", esquemaCarpetaArchivos, "carpetasArchivosContenidosNodos");
