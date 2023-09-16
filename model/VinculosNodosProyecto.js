import mongoose from "mongoose";
export const EsquemaVinculosNodosProyecto = new mongoose.Schema({
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
