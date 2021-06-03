"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloGrafo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
let esquemaGrafo = new mongoose_1.default.Schema({
    version: Number,
    bordes: {
        left: {
            type: Number,
            default: 0,
        },
        right: {
            type: Number,
            default: 0,
        },
        top: {
            type: Number,
            default: 0,
        },
        bottom: {
            type: Number,
            default: 0,
        }
    }
});
esquemaGrafo.methods.updateBordes = function (posicion) {
    this.bordes.left = Math.min(this.bordes.left, posicion.x);
    this.bordes.right = Math.max(this.bordes.right, posicion.x);
    this.bordes.top = Math.max(this.bordes.top, posicion.y);
    this.bordes.bottom = Math.min(this.bordes.bottom, posicion.y);
};
exports.ModeloGrafo = mongoose_1.default.model("Grafo", esquemaGrafo);
