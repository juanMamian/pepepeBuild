import mongoose from "mongoose";
import { esquemaConversacion } from "./Conversacion";
const esquemaForo = new mongoose.Schema({
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
        type: [esquemaConversacion],
        required: true,
        default: []
    }
});
export const ModeloForo = mongoose.model("Foro", esquemaForo);
