import mongoose from "mongoose";
import { charProhibidosNombreCosa, charProhibidosTexto } from "./config";
const EsquemaIteracionSemanal = new mongoose.Schema({
    diaSemana: {
        type: Number,
        min: 0,
        max: 6
    },
    millisInicio: {
        type: Number,
        required: true,
        max: 86400000,
        validate: {
            validator: function () {
                return this.millisFinal > this.millisInicio;
            },
            message: "El tiempo de inicio debería ser menor que el tiempo de finalización"
        }
    },
    millisFinal: {
        type: Number,
        required: true,
        max: 86400000,
        validate: {
            validator: function () {
                return this.millisFinal > this.millisInicio;
            },
            message: "El tiempo de finalización debería ser mayor que el tiempo de inicio"
        }
    },
    idsParticipantesConstantes: {
        type: [String],
        default: []
    },
});
EsquemaIteracionSemanal.virtual('nombreEspacio').get(function () {
    return this.parent().nombre;
});
EsquemaIteracionSemanal.virtual('idAdministradorEspacio').get(function () {
    return this.parent().idAdministrador;
});
EsquemaIteracionSemanal.virtual('idEspacio').get(function () {
    return this.parent()._id;
});
EsquemaIteracionSemanal.virtual('paraChiquis').get(function () {
    return this.parent().paraChiquis;
});
export const esquemaEspacio = new mongoose.Schema({
    nombre: {
        type: String,
        default: "Nuevo espacio",
        validate: {
            validator: function (n) {
                return !charProhibidosNombreCosa.test(n);
            },
            message: props => `${props.value} contiene caracteres ilegales!`
        },
        minlength: 3,
        maxLength: 60,
    },
    descripcion: {
        type: String,
        validate: {
            validator: function (d) {
                return !charProhibidosTexto.test(d);
            },
            message: props => `${props.value} contiene caracteres ilegales`
        }
    },
    idAdministrador: {
        type: String,
        required: true,
    },
    iteracionesSemanales: {
        type: [EsquemaIteracionSemanal],
        default: [],
    },
    paraChiquis: {
        type: Boolean,
        default: false,
    }
});
export const ModeloEspacio = mongoose.model("Espacio", esquemaEspacio);
