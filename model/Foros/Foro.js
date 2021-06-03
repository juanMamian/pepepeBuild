"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloForo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Conversacion_1 = require("./Conversacion");
const esquemaForo = new mongoose_1.default.Schema({
    acceso: {
        type: String,
        required: true,
        default: "publico",
        enum: ["privado", "publico"]
    },
    miembros: {
        type: [String],
        required: true,
        default: []
    },
    conversaciones: {
        type: [Conversacion_1.esquemaConversacion],
        required: true,
        default: []
    }
});
exports.ModeloForo = mongoose_1.default.model("Foro", esquemaForo);
