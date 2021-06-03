"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Trabajo_1 = require("../model/Trabajo");
const Nodo = require("../model/atlas/Nodo");
const Foro_1 = require("../model/Foros/Foro");
const Proyecto_1 = require("../model/Proyecto");
exports.typeDefs = apollo_server_express_1.gql `

    type MaterialTrabajo{
        id: ID,
        nombre: String,
        descripcion:String,
        cantidadNecesaria:Int,
        cantidadDisponible:Int,    
        idTrabajoParent:ID,
    }

   type Trabajo{
       id: ID,
       nombre: String,
       descripcion:String,
       responsables: [String],
       nodosConocimiento:[String],
       idForo:ID,
       diagramaProyecto:InfoDiagramaProyecto,
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       idProyectoParent:ID,
       estadoDesarrollo:String,
       materiales:[MaterialTrabajo]
   }

   type InfoBasicaTrabajo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   extend type Query{
       trabajo(idTrabajo: ID!):Trabajo,
       busquedaTrabajosProyectos(textoBusqueda:String!):[InfoBasicaTrabajo],
       trabajosDeProyectoDeUsuario(idUsuario:ID!):[InfoBasicaTrabajo]
   }

   extend type Mutation{
    crearMaterialEnTrabajoDeProyecto(idProyecto:ID!, idTrabajo:ID!):MaterialTrabajo,
    eliminarMaterialDeTrabajo(idTrabajo:ID!, idMaterial: ID!):Boolean,
    editarNombreMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoNombre: String!):MaterialTrabajo,
    editarDescripcionMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoDescripcion: String!):MaterialTrabajo,
    editarCantidadesMaterialTrabajo(idTrabajo: ID!, idMaterial:ID!, nuevoCantidadNecesaria:Int!, nuevoCantidadDisponible:Int):MaterialTrabajo,
   }

`;
exports.resolvers = {
    Query: {
        trabajo: function (_, { idTrabajo }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let tieneForo = true;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando un trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                if (!elTrabajo.idProyectoParent) {
                    console.log(`Trabajo ${elTrabajo.nombre} no tenia idProyectoParent. Buscándole`);
                    try {
                        let elProyectoParent = yield Proyecto_1.ModeloProyecto.findOne({ idsTrabajos: { $in: elTrabajo._id } }).exec();
                        if (!elProyectoParent)
                            throw "No habia proyecto parent";
                        console.log(`Era del proyecto ${elProyectoParent.nombre}`);
                        elTrabajo.idProyectoParent = elProyectoParent._id;
                        yield elTrabajo.save();
                    }
                    catch (error) {
                        console.log(`Error buscando proyecto parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base datos");
                    }
                }
                if (!elTrabajo.idForo) {
                    tieneForo = false;
                }
                else {
                    try {
                        let elForo = yield Foro_1.ModeloForo.findById(elTrabajo.idForo).exec();
                        if (!elForo) {
                            console.log(`El foro no existía. Se creará uno nuevo`);
                            tieneForo = false;
                        }
                    }
                    catch (error) {
                        console.log(`Error buscando foro en la base de datos. E :${error}`);
                    }
                }
                if (!tieneForo) {
                    console.log(`El trabajo ${elTrabajo.nombre} no tenía foro. Creando con miembros: ${elTrabajo.responsables}.`);
                    try {
                        var nuevoForo = yield Foro_1.ModeloForo.create({
                            miembros: elTrabajo.responsables,
                            acceso: "privado"
                        });
                        var idNuevoForo = nuevoForo._id;
                        yield nuevoForo.save();
                    }
                    catch (error) {
                        console.log(`Error creando el nuevo foro. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    console.log(`Nuevo foro creado`);
                    try {
                        elTrabajo.idForo = idNuevoForo;
                        yield elTrabajo.save();
                    }
                    catch (error) {
                        console.log(`Error guardando el trabajo`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                return elTrabajo;
            });
        },
        busquedaTrabajosProyectos: function (_, { textoBusqueda }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Buscando trabajo usando texto de búsqueda: ${textoBusqueda}`);
                const sizePaginaTrabajos = 50;
                if (contexto.usuario.id === "") {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ $text: { $search: textoBusqueda } }, { score: { $meta: 'textScore' } }).select("nombre").sort({ score: { $meta: 'textScore' } }).limit(sizePaginaTrabajos).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losTrabajos.length} trabajos encontrados`);
                return losTrabajos;
            });
        },
        trabajosDeProyectoDeUsuario: function (_, { idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('Peticion de trabajos de usuario con id ' + idUsuario);
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ "responsables": idUsuario }).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos de usuario. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losTrabajos.length} trabajos`);
                return losTrabajos;
            });
        }
    },
    Mutation: {
        crearMaterialEnTrabajoDeProyecto(_, { idProyecto, idTrabajo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo material en el trabajo con id ${idTrabajo}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.id) {
                    console.log(`Usuario no autenticado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo)
                        throw "Trabajo no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    var nuevoMaterial = elTrabajo.materiales.create();
                    elTrabajo.materiales.push(nuevoMaterial);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error guardando el material creado en el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el material en el trabajo");
                }
                console.log(`Enviando nuevo material: ${nuevoMaterial}`);
                return nuevoMaterial;
            });
        },
        editarNombreMaterialTrabajo(_, { idTrabajo, idMaterial, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
                const charProhibidosNombreMaterial = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreMaterial.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elMaterial = elTrabajo.materiales.id(idMaterial);
                    if (!elMaterial) {
                        console.log(`Material no encontrado en el trabajo`);
                        throw "No existía el material";
                    }
                    elMaterial.nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                try {
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error guardando el material creado en el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el material en el trabajo");
                }
                console.log(`Nombre cambiado`);
                return elMaterial;
            });
        },
        editarDescripcionMaterialTrabajo(_, { idTrabajo, idMaterial, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set descripcion de material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el trabajo. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Descripcion de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosDescripcionMaterial = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionMaterial.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                let elMaterial = elTrabajo.materiales.id(idMaterial);
                if (!elMaterial) {
                    console.log(`No existía el material`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMaterial.descripcion = nuevoDescripcion;
                try {
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                return elMaterial;
            });
        },
        editarCantidadesMaterialTrabajo(_, { idTrabajo, idMaterial, nuevoCantidadNecesaria, nuevoCantidadDisponible }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set cantidades de material con id ${idMaterial} del trabajo con id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el trabajo. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Descripcion de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                //Validacion
                nuevoCantidadNecesaria = parseInt(nuevoCantidadNecesaria);
                nuevoCantidadDisponible = parseInt(nuevoCantidadDisponible);
                if (nuevoCantidadDisponible < 0 || nuevoCantidadNecesaria < 0) {
                    throw new apollo_server_express_1.UserInputError("Datos no válidos");
                }
                let elMaterial = elTrabajo.materiales.id(idMaterial);
                if (!elMaterial) {
                    console.log(`No existía el material`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMaterial.cantidadNecesaria = nuevoCantidadNecesaria;
                elMaterial.cantidadDisponible = nuevoCantidadDisponible;
                try {
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Cantidades guardado`);
                return elMaterial;
            });
        },
        eliminarMaterialDeTrabajo(_, { idMaterial, idTrabajo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un material con id ${idMaterial} de un trabajo con id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elTrabajo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando nombre de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Trabajo_1.ModeloTrabajo.findByIdAndUpdate(idTrabajo, { $pull: { materiales: { "_id": idMaterial } } });
                }
                catch (error) {
                    console.log("Error eliminando el material. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`eliminado`);
                return true;
            });
        },
    }
};
