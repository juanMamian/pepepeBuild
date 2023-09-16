import mongoose from "mongoose";
import { validatorNombreCosa, validatorTexto } from "./config";
const maxDuracionEventos = 1000 * 60 * 60 * 10; //10 horas
const minDuracionEventos = 1000 * 60 * 5; //5 minutos
export const esquemaEventoPersonal = new mongoose.Schema({
    idPersona: {
        type: String,
        required: true,
    },
    idsParticipantes: {
        type: [String],
        validate: {
            validator: function (ids) {
                return !ids.includes(this.idPersona);
            },
            message: props => "idsParticipantes (" + props.value + ") no puede contener a la persona que creó el evento",
        },
        default: [],
    },
    idParent: {
        type: String,
        required: function () {
            return this.tipoParent;
        }
    },
    tipoParent: {
        type: String,
        enum: ["nodoSolidaridad"],
        required: function () {
            return this.idParent;
        }
    },
    nombre: {
        type: String,
        minLength: 3,
        maxLength: 1024,
        validate: validatorNombreCosa,
        default: "Nuevo evento"
    },
    descripcion: {
        type: String,
        validate: validatorTexto,
        maxLength: 2000
    },
    horarioInicio: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                const duracion = this.horarioFinal - this.horarioInicio;
                return duracion >= minDuracionEventos && duracion <= maxDuracionEventos;
            },
            message: props => props.value + "No es un valor válido"
        }
    },
    horarioFinal: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                const duracion = this.horarioFinal - this.horarioInicio;
                return duracion >= minDuracionEventos && duracion <= maxDuracionEventos;
            },
            message: props => props.value + "No es un valor válido"
        }
    },
    idEventoMarco: {
        type: String,
    },
    lugar: {
        type: String,
    },
});
export const esquemaEventoPublico = new mongoose.Schema({
    nombre: {
        type: String,
        minLength: 3,
        maxLength: 1024,
        validate: validatorNombreCosa,
        default: "Nuevo evento"
    },
    descripcion: {
        type: String,
        validate: validatorTexto,
        maxLength: 2000
    },
    idAdministrador: {
        type: String,
        required: true,
    },
    limiteDeCupos: {
        type: Number,
    },
    horarioInicio: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                const duracion = this.horarioFinal - this.horarioInicio;
                return duracion >= minDuracionEventos && duracion <= maxDuracionEventos;
            },
            message: props => props.value + "No es un valor válido"
        }
    },
    horarioFinal: {
        type: Date,
        required: true,
        validate: {
            validator: function () {
                const duracion = this.horarioFinal - this.horarioInicio;
                return duracion >= minDuracionEventos && duracion <= maxDuracionEventos;
            },
            message: props => props.value + "No es un valor válido"
        },
    },
    lugar: {
        type: String,
    },
    idParent: {
        type: String,
    },
    tipoParent: {
        type: String,
        enum: ["espacio"],
        required: function () {
            return this.idParent != null;
        }
    }
});
export const ModeloEventoPersonal = mongoose.model("EventoPersonal", esquemaEventoPersonal);
export const ModeloEventoPublico = mongoose.model("EventoPublico", esquemaEventoPublico);
