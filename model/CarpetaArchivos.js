import mongoose from "mongoose";
const esquemaArchivo = new mongoose.Schema({
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
const esquemaCarpetaArchivos = new mongoose.Schema({
    archivos: [esquemaArchivo],
    default: [],
});
export const ModeloCarpetaArchivos = mongoose.model("carpetasArchivosContenidosNodos", esquemaCarpetaArchivos, "carpetasArchivosContenidosNodos");
