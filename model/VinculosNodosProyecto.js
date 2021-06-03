"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsquemaVinculosNodosProyecto = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.EsquemaVinculosNodosProyecto = new mongoose_1.default.Schema({
    idRef: {
        type: String,
        required: true,
    },
    tipo: {
        type: String,
        required: true,
        enum: ["requiere"]
    },
    tipoRef: {
        type: String,
        required: true,
        enum: ["trabajo", "objetivo"]
    }
});
