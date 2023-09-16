import mongoose from "mongoose";
const esquemaAudioEmbeded = new mongoose.Schema({
    archivo: Buffer,
    tipoReproduccion: {
        type: String,
        enum: ["hover", "click"],
        default: "click",
    }
});
const esquemaCuadrosImagen = new mongoose.Schema({
    sinArchivo: {
        type: Boolean,
        default: true,
    },
    archivo: {
        type: Buffer,
    },
    archivoSecundario: {
        type: Buffer,
    },
    tipoActivacionSecundario: {
        type: String,
        enum: ["hover", "click"],
        default: "hover",
    },
    posicion: {
        x: Number,
        y: Number,
    },
    posicionZeta: {
        type: Number,
        min: 0,
        default: 0,
    },
    size: {
        x: Number,
        y: Number,
    },
    originalSize: {
        x: Number,
        y: Number,
    },
    audio: {
        type: esquemaAudioEmbeded
    }
});
const esquemaCuadroTexto = new mongoose.Schema({
    texto: {
        type: String,
        max: 3000,
    },
    posicion: {
        x: Number,
        y: Number,
    },
    posicionZeta: {
        type: Number,
        min: 0,
        default: 1,
    },
    size: {
        x: Number,
        y: Number,
    },
    formato: {
        alineacion: {
            type: String,
            default: "left"
        },
        fontSize: {
            type: Number,
            default: 15,
        },
        colorLetra: {
            type: String,
            max: 40,
            default: "#000000"
        },
        tipoLetra: {
            type: String,
            default: "Arial"
        }
    },
    audio: {
        type: esquemaAudioEmbeded,
    }
});
const esquemaPagina = new mongoose.Schema({
    cuadrosTexto: {
        type: [esquemaCuadroTexto],
        default: [],
    },
    cuadrosImagen: {
        type: [esquemaCuadrosImagen]
    },
    color: {
        type: String,
        max: 30,
        default: "#9acd92"
    },
    numPag: {
        type: Number,
    }
});
export const esquemaLibro = new mongoose.Schema({
    paginas: {
        type: [esquemaPagina],
        default: [],
    },
    idsEditores: {
        type: [String],
        default: [],
    },
    titulo: {
        type: String,
        default: "Nuevo libro"
    },
    idForo: {
        type: String,
    },
    publico: {
        type: Boolean,
        default: false,
    }
});
export const ModeloLibro = mongoose.model("Libro", esquemaLibro);
