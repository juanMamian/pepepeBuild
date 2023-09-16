"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloAdministracionAtlas = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const EsquemaAdministracionAtlas = new mongoose_1.default.Schema({
    idAtlas: String,
    lastPosicionamientoNodos: {
        type: Date,
        default: new Date('1995-12-17T03:24:00')
    },
    ciclosDefault: {
        type: Number,
        default: 5
    }
});
exports.ModeloAdministracionAtlas = mongoose_1.default.model("AdministracionAtlas", EsquemaAdministracionAtlas);
