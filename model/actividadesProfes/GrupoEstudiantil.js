"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloGrupoEstudiantil = exports.esquemaActividad = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const esquemaParticipacion = new mongoose_1.default.Schema({
    fechaUpload: {
        type: Date,
        default: Date.now,
    },
    archivo: {
        nombre: String,
        extension: String,
        idGoogleDrive: String,
        googleDriveDirectLink: String,
    },
    comentario: {
        type: String,
    },
    idAutor: {
        type: String,
        required: true,
    },
    infoAutor: {
        id: String,
        nombres: String,
        apellidos: String,
        username: String
    },
    enlaceAdjunto: {
        type: [String],
    }
});
esquemaParticipacion.pre('validate', function () {
    if ((this.isNew || this.isModified) && !this.archivos) {
        this.archivos = [];
    }
});
const esquemaDesarrollo = new mongoose_1.default.Schema({
    idEstudiante: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        default: "desarrollando",
        required: true,
        enum: ["desarrollando", "completado"]
    },
    participaciones: {
        type: [esquemaParticipacion],
        required: true,
        default: []
    },
    leidoPorProfe: {
        type: Boolean,
        required: true,
        default: true
    },
    infoEstudiante: {
        id: String,
        nombres: String,
        apellidos: String,
        username: String,
    }
});
exports.esquemaActividad = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        min: 3,
        max: 50,
        required: true,
        default: "Nueva actividad"
    },
    desarrollos: {
        type: [esquemaDesarrollo],
        required: true,
        default: [],
    },
    fechaUpload: {
        type: Date,
        default: Date.now,
    },
    idCreador: {
        type: String,
        required: true
    },
    guiaGoogleDrive: {
        idArchivo: {
            type: String,
        },
        enlace: {
            type: String
        }
    },
    infoCreador: {
        id: String,
        nombres: String,
        apellidos: String,
        username: String
    }
});
exports.esquemaActividad.pre('save', function () {
    if ((this.isNew || this.isModified) && !this.desarrollo) {
        this.desarrollo = [];
    }
});
const esquemaGrupoEstudiantil = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        min: 3,
        max: 50,
        required: true,
    },
    estudiantes: {
        type: [String],
        default: []
    },
    actividades: {
        type: [exports.esquemaActividad],
        default: []
    }
});
esquemaGrupoEstudiantil.pre('validate', function () {
    if ((this.isNew || this.isModified) && !this.actividades) {
        this.actividades = [];
    }
});
esquemaGrupoEstudiantil.methods.calcularIdleStudents = function () {
    let idles = [];
    this.estudiantes.forEach(idEsteEstudiante => {
        //Buscando si en alguna actividad no tiene desarrollo o, si lo tiene, está incompleto
        if (!this.actividades.some(a => !a.desarrollos.some(d => (d.idEstudiante == idEsteEstudiante && d.estado == "completado")))) {
            idles.push(idEsteEstudiante);
        }
    });
    this.estudiantesIdle = idles;
};
exports.ModeloGrupoEstudiantil = mongoose_1.default.model("GrupoEstudiantil", esquemaGrupoEstudiantil);
