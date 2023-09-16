import mongoose from "mongoose";
export const permisosDeUsuario = [
    "usuario",
    "subscripcion-ilimitada",
    "administrador",
    "atlasAdministrador",
    "superadministrador",
    "actividadesEstudiantiles-profe",
    "actividadesEstudiantiles-administrador",
    "actividadesEstudiantiles-guia",
    "visitante",
    "maestraVida",
    "maestraVida-estudiante",
    "maestraVida-profesor",
    "maestraVida-acompañante",
    "maestraVida-graduado",
    "comunere"
];
const esquemaSnapshotProgreso = new mongoose.Schema({
    dateRegistro: {
        type: Date,
        default: Date.now
    },
    progreso: {
        type: Number,
        required: true,
    },
});
const esquemaBloqueSubscripcion = new mongoose.Schema({
    dateInicio: {
        type: Date,
        required: true,
    },
    duracion: {
        type: Number,
        required: true,
    },
    valorPagado: {
        type: Number,
        required: true,
    }
});
const esquemaIteracionRepaso = new mongoose.Schema({
    intervalo: {
        type: Number,
        default: 86400000
    }
});
const EsquemaInformeUsuario = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
    },
    periodo: {
        type: String,
        required: true,
        enum: ["primero", "segundo", "tercero", "total"],
    },
    idProfe: {
        type: String,
        required: true,
    },
    categoria: {
        type: String,
        required: true,
        enum: ["objetivos", "comentario", "espacios", "proyectos"],
    },
    texto: {
        type: String,
    }
});
const esquemaColeccionNodosAtlasConocimiento = new mongoose.Schema({
    nombre: {
        type: String,
        default: "Nueva colección",
        min: 3,
        max: 30,
    },
    idsNodos: {
        type: [String],
        default: []
    },
    snapshotsProgreso: {
        type: [esquemaSnapshotProgreso],
        default: [],
    }
}, { strict: true });
esquemaColeccionNodosAtlasConocimiento.virtual("idUsuario").get(function () {
    return this.ownerDocument()._id;
});
const esquemaNotificacion = new mongoose.Schema({
    texto: {
        type: String,
        default: "Nueva notificacion",
    },
    causante: {
        tipo: String,
        id: String
    },
    elementoTarget: {
        tipo: {
            type: String,
            enum: ["actividadEstudiantil", "nodoAtlasSolidaridad"]
        },
        id: String
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    }
});
const esquemaNotificacionEventoAtlasSolidaridad = new mongoose.Schema({
    texto: {
        type: String,
        default: "Nueva notificacion",
    },
    causante: {
        tipo: String,
        id: String
    },
    nodoTarget: {
        id: String
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    }
});
const esquemaNotificacionActividadForo = new mongoose.Schema({
    idParent: {
        type: String,
        required: true
    },
    tipoParent: {
        type: String,
        required: true,
        enum: ["proyecto", "trabajo", "nodoConocimiento", "libro"],
    },
    nombreParent: {
        type: String,
        required: true,
    },
    numeroRespuestasNuevas: {
        type: Number,
        required: true,
        default: 1
    }
});
const esquemaDatoNodo = new mongoose.Schema({
    idNodo: {
        type: String, required: true
    },
    aprendido: {
        type: Boolean,
        default: false
    },
    estudiado: {
        type: Date
    },
    periodoRepaso: {
        type: Number,
        min: 86400000,
        default: 86400000 * 2,
    },
    diasRepaso: {
        type: Number,
        min: 1,
        default: 2,
        max: 1000,
    },
    iteracionesRepaso: {
        type: [esquemaIteracionRepaso],
        default: []
    },
});
esquemaDatoNodo.pre("save", function (next) {
    if (!this.diasRepaso && this.periodoRepaso) {
        //Periodo repaso in milliseconds to diasRepaso in days
        this.diasRepaso = this.periodoRepaso / 86400000;
    }
    if (this.estudiado && !this.diasRepaso) {
        this.diasRepaso = 2;
    }
    next();
});
const esquemaEstadoAtlas = new mongoose.Schema({
    centroVista: {
        x: {
            type: Number,
            required: true,
            default: 0
        },
        y: {
            type: Number,
            required: true,
            default: 0
        }
    },
    datosNodos: {
        type: [esquemaDatoNodo],
        default: []
    },
    configuracion: {
        modo: {
            type: String,
            default: 'estudiante',
            enum: ['estudiante', 'experto']
        }
    },
    colecciones: {
        type: [esquemaColeccionNodosAtlasConocimiento],
        default: []
    },
    idNodoTarget: String,
});
export const ModeloNotificacion = mongoose.model("Notificacion", esquemaNotificacion);
const esquemaUsuario = new mongoose.Schema({
    username: {
        type: String,
        min: 3,
        max: 50,
        unique: true
    },
    nombres: {
        type: String,
        max: 255,
        min: 2,
        required: true
    },
    apellidos: {
        type: String,
        max: 255,
        min: 2,
        required: true
    },
    titulo: {
        type: String,
        maxLength: 300,
    },
    fechaNacimiento: {
        type: Date,
        max: Date.now,
        min: new Date('1890-01-01'),
        default: Date.now
    },
    objetivos: {
        type: [String],
        default: [],
    },
    informesMaestraVida: {
        type: [EsquemaInformeUsuario],
        default: [],
    },
    fotografia: {
        type: Buffer,
    },
    lugarResidencia: {
        type: String
    },
    numeroTel: {
        type: String,
    },
    email: {
        type: String,
    },
    nodosConocimiento: [{
            tipo: {
                type: String,
                required: true,
                max: 20,
                default: "aprendiendo",
                enum: ["aprendiendo", "aprendido", "objetivo"]
            },
            nodoConocimiento: {
                type: String,
            }
        }],
    nodosCompletadosRutaGrado: {
        type: [String],
        default: []
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    permisos: {
        type: [String],
        required: true,
        max: 100,
        min: 2,
        default: ["usuario"],
        enum: permisosDeUsuario
    },
    bloquesSubscripcion: {
        type: [esquemaBloqueSubscripcion],
        default: [],
    },
    atlas: {
        type: esquemaEstadoAtlas,
        default: {
            datosNodos: [],
            colecciones: [],
        },
    },
    atlasSolidaridad: {
        coordsVista: {
            x: {
                type: Number,
                default: 0
            },
            y: {
                type: Number,
                default: 0
            }
        },
        idsNodosDesplegados: {
            type: [String],
            default: []
        }
    },
    notificaciones: {
        type: [esquemaNotificacion],
        required: true,
        default: []
    },
    notificacionesActividadForos: {
        type: [esquemaNotificacionActividadForo],
        default: [],
        required: true,
    },
    notificacionesAtlasSolidaridad: {
        type: [esquemaNotificacionEventoAtlasSolidaridad],
        default: []
    },
    misTrabajos: {
        type: [String],
        required: true,
        default: []
    },
    foros: {
        type: [{
                idForo: {
                    type: String,
                    required: true,
                },
                conversaciones: {
                    type: [{
                            idConversacion: {
                                type: String,
                                required: true,
                            },
                            respuestasLeidas: {
                                type: Number,
                                default: 0,
                            }
                        }],
                    default: []
                }
            }]
    },
    coords: {
        x: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        y: {
            type: Number,
            required: true,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        }
    },
    autoCoords: {
        x: {
            type: Number,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        },
        y: {
            type: Number,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value'
            }
        }
    },
    fuerzaCentroMasa: {
        fuerza: {
            type: Number,
            default: 0
        },
        direccion: {
            type: Number,
            default: 0
        }
    },
    fuerzaColision: {
        fuerza: {
            type: Number,
            default: 0
        },
        direccion: {
            type: Number,
            default: 0
        }
    }
});
esquemaUsuario.pre("save", function (next) {
    var nuevoDatosNodos = [];
    if (!this.atlas) {
        this.atlas = {};
    }
    if (!this.atlas.datosNodos) {
        this.atlas.datosNodos = [];
    }
    if (!this.atlas.colecciones) {
        this.atlas.colecciones = [];
    }
    if (!this.atlas.datosNodos) {
        next();
    }
    for (const dato of this.atlas.datosNodos) {
        if (!nuevoDatosNodos.map(dn => dn.idNodo).includes(dato.idNodo)) {
            nuevoDatosNodos.push(dato);
        }
        else {
            console.log("Habia un dato nodo repetido");
        }
    }
    this.atlas.datosNodos = nuevoDatosNodos;
    next();
});
esquemaUsuario.methods.getEdad = function () {
    console.log(`convirtiendo ${this.fechaNacimiento} a edad`);
    let hoy = new Date();
    let edad = hoy.getTime() - this.fechaNacimiento.getTime();
    let edadAños = Math.floor(edad / (60 * 60 * 24 * 365 * 1000));
    return edadAños;
};
var charProhibidos = /[^ a-zA-ZÀ-ž0-9_():.,-]/g;
var charProhibidosNombre = /[^ a-zA-ZÀ-žñÑ]/g;
var charProhibidosNumeroTel = /[^0-9+-]/g;
var emailChars = /\S+@\S+\.\S+/;
var dateChars = /[12][90][0-9][0-9]-[01][0-9]-[0-3][0-9]/;
export const validarDatosUsuario = function (datosUsuario) {
    var errores = [];
    for (let dato in datosUsuario) {
        if (!datosUsuario[dato]) {
            errores.push(`El dato ${dato} no tenia valor`);
            return errores;
        }
        datosUsuario[dato] = datosUsuario[dato].trim();
        if (dato == "nombres") {
            if (datosUsuario.nombres.length < 2) {
                errores.push("Tu nombre es muy corto");
            }
            if (charProhibidosNombre.test(datosUsuario.nombres)) {
                errores.push("Tu nombre contiene caracteres no permitidos");
            }
        }
        else if (dato == "apellidos") {
            if (datosUsuario.apellidos.length < 2) {
                errores.push("Tu apellido es muy corto");
            }
            if (charProhibidosNombre.test(datosUsuario.apellidos)) {
                errores.push("Tu apellido contiene caracteres no permitidos");
            }
        }
        else if (dato == "fechaNacimiento") {
            if (!dateChars.test(datosUsuario.fechaNacimiento)) {
                errores.push("Tu fecha de nacimiento es incorrecta");
            }
        }
        else if (dato == "email") {
            if (datosUsuario.email.length > 0 && !emailChars.test(datosUsuario.email)) {
                errores.push("Tu e-mail no es válido");
            }
        }
        else if (dato == "numeroTel") {
            if (charProhibidosNumeroTel.test(datosUsuario.numeroTel)) {
                errores.push("Tu número telefónico no es válido");
            }
        }
        else if (dato == "lugarResidencia") {
            if (datosUsuario.lugarResidencia.length < 2) {
                errores.push("Tu lugar de residencia es muy corto");
            }
            if (charProhibidos.test(datosUsuario.lugarResidencia)) {
                errores.push("Tu lugar de residencia contiene caracteres no permitidos");
            }
        }
        else if (dato == "username") {
            if (datosUsuario.username.length < 4) {
                errores.push("Tu nombre de usuario es muy corto");
            }
            if (charProhibidos.test(datosUsuario.username)) {
                errores.push("Tu nombre de usuario contiene caracteres no permitidos");
            }
        }
        else if (dato == "password") {
            if (datosUsuario.password.length < 6 || datosUsuario.password.length > 32) {
                errores.push("Tu contraseña debe contener entre 6 y 32 caracteres");
            }
            if (charProhibidosPassword.test(datosUsuario.password)) {
                errores.push("Tu password contiene caracteres no permitidos");
            }
        }
        else {
            errores.push(`El dato ${dato} no tenía lǵica de validación`);
        }
    }
    return errores;
};
export const charProhibidosNombresUsuario = /[^ a-zA-ZÀ-ž]/;
export const charProhibidosUsername = /[^ a-zA-ZÀ-ž0-9_-]/;
export const charProhibidosPassword = /\s\s+/;
export const emailValidator = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const minLengthNombresUsuario = 2;
export const minLengthApellidosUsuario = 2;
export const minLengthPassword = 6;
export const maxLengthPassword = 40;
export const minLengthEmail = 7;
export const minLengthUsername = 7;
esquemaUsuario.index({ nombres: "text", apellidos: "text" }, { name: "indexBusqueda" });
export const ModeloUsuario = mongoose.model("Usuario", esquemaUsuario);
