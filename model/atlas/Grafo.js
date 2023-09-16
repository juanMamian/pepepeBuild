import mongoose from "mongoose";
let esquemaGrafo = new mongoose.Schema({
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
export const ModeloGrafo = mongoose.model("Grafo", esquemaGrafo);
