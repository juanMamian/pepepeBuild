import mongoose from "mongoose";
export const esquemaConfiguracionAtlas = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        enum: ["solidaridad", "conocimiento"],
    },
    posicionando: {
        type: Boolean,
        default: false,
    },
    lastGeneralSnapshot: {
        type: Date,
    }
});
export const ModeloConfiguracionAtlas = mongoose.model("ConfiguracionAtlas", esquemaConfiguracionAtlas, "configuracionesAtlas");
