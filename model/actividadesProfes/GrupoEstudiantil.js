import mongoose from "mongoose";
const esquemaParticipacion = new mongoose.Schema({
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
const esquemaDesarrollo = new mongoose.Schema({
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
export const esquemaActividad = new mongoose.Schema({
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
esquemaActividad.pre('save', function () {
    if ((this.isNew || this.isModified) && !this.desarrollo) {
        this.desarrollo = [];
    }
});
const esquemaGrupoEstudiantil = new mongoose.Schema({
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
        type: [esquemaActividad],
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
export const ModeloGrupoEstudiantil = mongoose.model("GrupoEstudiantil", esquemaGrupoEstudiantil);
