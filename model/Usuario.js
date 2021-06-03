"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloUsuario = exports.validarDatosUsuario = exports.ModeloNotificacion = exports.permisosDeUsuario = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.permisosDeUsuario = [
    "usuario",
    "administrador",
    "atlasAdministrador",
    "superadministrador",
    "actividadesEstudiantiles-profe",
    "actividadesEstudiantiles-administrador",
    "actividadesEstudiantiles-guia"
];
const esquemaNotificacion = new mongoose_1.default.Schema({
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
            enum: ["actividadEstudiantil"]
        },
        id: String
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    }
});
const esquemaNotificacionActividadForo = new mongoose_1.default.Schema({
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
exports.ModeloNotificacion = mongoose_1.default.model("Notificacion", esquemaNotificacion);
const esquemaUsuario = new mongoose_1.default.Schema({
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
    fechaNacimiento: {
        type: Date,
        max: Date.now,
        min: new Date('1890-01-01'),
        default: Date.now
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
                default: "APRENDIENDO",
                enum: ["aprendiendo", "aprendido", "objetivo"]
            },
            nodoConocimiento: {
                type: String,
            }
        }],
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
        enum: exports.permisosDeUsuario
    },
    atlas: {
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
            type: [
                {
                    idNodo: String,
                    objetivo: Boolean,
                    aprendido: Boolean,
                }
            ],
            default: []
        },
        idNodoTarget: String,
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
    }
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
var charProhibidosPassword = /[^a-zA-Z0-9ñÑ*@_-]/g;
const validarDatosUsuario = function (datosUsuario) {
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
exports.validarDatosUsuario = validarDatosUsuario;
exports.ModeloUsuario = mongoose_1.default.model("Usuario", esquemaUsuario);
