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
exports.resolvers = exports.NUEVA_NOTIFICACION_PERSONAL = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Usuario_1 = require("../model/Usuario");
const graphql_iso_date_1 = require("graphql-iso-date");
const GrupoEstudiantil_1 = require("../model/actividadesProfes/GrupoEstudiantil");
exports.typeDefs = apollo_server_express_1.gql `
    scalar Date

    type MinimoCausante{
        id:ID,
        tipo:String,
    }

    type NotificacionActividadForos{
        idParent:ID,
        tipoParent:String,
        nombreParent:String,
        numeroRespuestasNuevas:Int,        
    }

    type Notificacion{
        id:ID,
        texto:String,
        causante:MinimoCausante,
        elementoTarget: MinimoElemento,
        fecha:Date
    }

    type DatoNodoUsuario{
        idNodo:ID,
        objetivo:Boolean,
        aprendido:Boolean
    }

    type infoAtlas{
        centroVista:Coords,
        datosNodos:[DatoNodoUsuario],
        idNodoTarget:ID
    }

    enum relacionUsuarioConocimiento{
        APRENDIENDO
        APRENDIDO
        OBJETIVO
    }

    type ConocimientoUsuario{
        tipo: relacionUsuarioConocimiento,
        nodoConocimiento: NodoConocimiento
    }

    type InfoConversacionesUsuario{
        idConversacion:ID,
        respuestasLeidas:Int,
    }

    type InfoForosUsuario{
        idForo:ID,
        conversaciones:[InfoConversacionesUsuario]
    }

    type Usuario{
        id: ID,
        nombres:String,
        apellidos: String,
        fechaNacimiento:Date,
        edad:Int,
        lugarResidencia:String,
        email:String,
        numeroTel:String,
        username:String,
        nodosConocimiento: [ConocimientoUsuario],
        atlas:infoAtlas,        
        permisos:[String]
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
        notificaciones:[Notificacion],
        notificacionesActividadForos:[NotificacionActividadForos],
        foros:[InfoForosUsuario],

    }
    input DatosEditablesUsuario{
        nombres:String,
        apellidos: String,
        fechaNacimiento:String,
        lugarResidencia:String,
        email:String,
        numeroTel:String,
        username:String
    }
    type PublicUsuario{
        id: ID,
        username:String, 
        nombres:String,
        apellidos:String,
        email:String,
        numeroTel:String,
        lugarResidencia:String,
        edad:Int,
        idGrupoEstudiantil:String,       
        nombreGrupoEstudiantil:String,
    }

    extend type Query {
        todosUsuarios:[PublicUsuario],
        usuariosProfe:[PublicUsuario],
        yo:Usuario,
        publicUsuario(idUsuario:ID!): PublicUsuario,
    }
    extend type Mutation{
        setCentroVista(idUsuario:ID, centroVista: CoordsInput):Boolean,
        editarDatosUsuario(nuevosDatos: DatosEditablesUsuario):Usuario,
        addPermisoUsuario(nuevoPermiso:String!, idUsuario:ID!):Usuario,  
        eliminarUsuario(idUsuario:ID!):Boolean,
        eliminarNotificacion(idNotificacion:ID!):Boolean,
        eliminarNotificacionActividadForos(idParent:ID!):Boolean,
        setNodoObjetivo(idNodo:ID!, nuevoEstadoObjetivo:Boolean):Boolean
        setNodoAtlasAprendidoUsuario(idNodo:ID!, nuevoEstadoAprendido:Boolean):Boolean        
        setNodoAtlasTarget(idNodo:ID!):Boolean,
        nulificarNodoTargetUsuarioAtlas:Boolean

    }
    extend type Subscription{
        nuevaNotificacion:Notificacion
    }

`;
exports.NUEVA_NOTIFICACION_PERSONAL = "nueva_notificacion_personal";
exports.resolvers = {
    Subscription: {
        nuevaNotificacion: {
            subscribe: apollo_server_express_1.withFilter((_, __, contexto) => {
                console.log(`--------------------------Creando una subscripción a notificaciones personales de ${contexto.usuario.username}`);
                return contexto.pubsub.asyncIterator(exports.NUEVA_NOTIFICACION_PERSONAL);
            }, (payloadNuevaNotificacion, variables, contexto) => {
                console.log(`Decidiendo si notificar a ${contexto.usuario.id} con idNotificado=${payloadNuevaNotificacion.idNotificado}`);
                if (payloadNuevaNotificacion.idNotificado != contexto.usuario.id) {
                    return false;
                }
                console.log(`Nueva notificacion personal para ${contexto.usuario.username}`);
                return true;
            })
        }
    },
    Query: {
        usuariosProfe: function (_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Fetching la lista de todos los profes`);
                try {
                    var profes = yield Usuario_1.ModeloUsuario.find({ permisos: "actividadesEstudiantiles-profe" }).exec();
                }
                catch (error) {
                    console.log(`Error buscando profes en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return profes;
            });
        },
        todosUsuarios: function (_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de la lista de todos los usuarios`);
                try {
                    var todosUsuarios = yield Usuario_1.ModeloUsuario.find({}).exec();
                }
                catch (error) {
                    console.log("Error fetching la lista de usuarios de la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión a la base de datos");
                }
                console.log(`Enviando lista de todos los usuarios`);
                return todosUsuarios;
            });
        },
        publicUsuario: function (_, { idUsuario }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                }
                catch (error) {
                    console.log(`error buscando usuario con id ${idUsuario} en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("Error buscando usuario");
                }
                return elUsuario;
            });
        },
        yo: function (_, __, context) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = context.usuario;
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id);
                }
                catch (error) {
                    console.log("Error buscando el usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error accediendo a los datos de usuario");
                }
                return elUsuario;
            });
        },
    },
    Mutation: {
        editarDatosUsuario: function (_, { nuevosDatos }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`solicitud de edicion de datos de usuario`);
                let credencialesUsuario = context.usuario;
                console.log(`Usuario: Id: ${credencialesUsuario.id}, username: ${credencialesUsuario.username}`);
                if (!credencialesUsuario.permisos) {
                    console.log(`No habia campo permisos activado en las credenciales del usuario`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    if (!elUsuario) {
                        throw "Usuario no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let errores = Usuario_1.validarDatosUsuario(nuevosDatos);
                if (errores.length > 0) {
                    console.log(`Error validando datos: ${errores}`);
                    throw new apollo_server_express_1.ApolloError("Datos invalidos");
                }
                console.log(`asignando ${nuevosDatos} al usuario`);
                try {
                    Object.assign(elUsuario, nuevosDatos);
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log("Error guardando el usuario merged con nuevos datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando datos");
                }
                console.log(`Nuevos datos guardados`);
                return elUsuario;
            });
        },
        setCentroVista: function (_, { idUsuario, centroVista }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Seting centro vista en ${JSON.stringify(centroVista)} para el usuario ${idUsuario}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario, "atlas").exec();
                    if (!elUsuario) {
                        throw "Error recopilando datos";
                    }
                }
                catch (error) {
                    console.log(`error buscando usuario en la base de datos`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                elUsuario.atlas.centroVista = centroVista;
                try {
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`error buscando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                console.log(`Set`);
                return true;
            });
        },
        addPermisoUsuario: function (_, { idUsuario, nuevoPermiso }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de dar permiso ${nuevoPermiso} a un usuario con id ${idUsuario}`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.permisos) {
                    console.log(`No habia permisos en las credenciales`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let permisosValidos = ["superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`Usuario no tiene permisos válidos`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (!Usuario_1.permisosDeUsuario.includes(nuevoPermiso)) {
                    console.log(`${nuevoPermiso} no es un permiso de usuario válido`);
                    console.log(`los permisos válidos son: ${Usuario_1.permisosDeUsuario}`);
                    throw new apollo_server_express_1.AuthenticationError("Permiso no reconocido");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!Array.isArray(elUsuario.permisos)) {
                        console.log(`Los permisos no eran un array: Eran: ${elUsuario.permisos}`);
                    }
                    if (!elUsuario.permisos.includes(nuevoPermiso)) {
                        console.log(`Añadiendo ${nuevoPermiso} a la lista de permisos`);
                        elUsuario.permisos.push(nuevoPermiso);
                        elUsuario.permisos = elUsuario.permisos.filter(p => p != "actividadesProfes-profe");
                    }
                    else {
                        console.log(`El usuario ya tenía ese permiso`);
                    }
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log(`Error updating el usuario en la base de datos. e. ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Permiso añadido.Quedó con: ${elUsuario.permisos}`);
                return elUsuario;
            });
        },
        eliminarUsuario: function (_, { idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`||||||||||||||||||||||`);
                console.log(`Solicitud de eliminar un usuario con id ${idUsuario} de la base de datos`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.permisos) {
                    console.log(`No habia permisos en las credenciales`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let permisosValidos = ["superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                    console.log(`Usuario no tiene permisos válidos`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    let elEliminado = yield Usuario_1.ModeloUsuario.findByIdAndDelete(idUsuario).exec();
                    if (!elEliminado) {
                        throw "Usuario no encontrado";
                    }
                    console.log(`Eliminado ${elEliminado.username}`);
                }
                catch (error) {
                    console.log(`Error eliminando usuario. E: ${error}`);
                    throw new apollo_server_express_1.AuthenticationError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        eliminarNotificacion: function (_, { idNotificacion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||1`);
                console.log(`Peticion de eliminar una notificacion con id ${idNotificacion}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (credencialesUsuario.permisos.length < 1) {
                    console.log(`El usuario no estaba logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Usuario_1.ModeloUsuario.findByIdAndUpdate(credencialesUsuario.id, { $pull: { notificaciones: { _id: idNotificacion } } }).exec();
                }
                catch (error) {
                    console.log(`Error eliminando la notificacion de la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Notificacion eliminada`);
                return true;
            });
        },
        eliminarNotificacionActividadForos: function (_, { idParent }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||||1`);
                console.log(`Peticion de eliminar una notificacion de actividad en foros con id ${idParent}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (credencialesUsuario.permisos.length < 1) {
                    console.log(`El usuario no estaba logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Usuario_1.ModeloUsuario.findByIdAndUpdate(credencialesUsuario.id, { $pull: { notificacionesActividadForos: { idParent: idParent } } }).exec();
                }
                catch (error) {
                    console.log(`Error eliminando la notificacion de la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Notificacion eliminada`);
                return true;
            });
        },
        setNodoObjetivo: function (_, { idNodo, nuevoEstadoObjetivo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
                }
                console.log(`Seting nodo objetivo de ${idNodo} en ${nuevoEstadoObjetivo} para el usuario ${credencialesUsuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    var indexN = elUsuario.atlas.datosNodos.findIndex(n => n.idNodo == idNodo);
                    if (indexN > -1) {
                        elUsuario.atlas.datosNodos[indexN].objetivo = nuevoEstadoObjetivo;
                    }
                    else {
                        elUsuario.atlas.datosNodos.push({
                            idNodo,
                            objetivo: nuevoEstadoObjetivo
                        });
                    }
                    yield elUsuario.save();
                    return true;
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
            });
        },
        setNodoAtlasAprendidoUsuario: function (_, { idNodo, nuevoEstadoAprendido }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
                }
                console.log(`Seting nodo ${idNodo} en estado de aprendido ${nuevoEstadoAprendido} para el usuario ${credencialesUsuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    var indexN = elUsuario.atlas.datosNodos.findIndex(n => n.idNodo == idNodo);
                    if (indexN > -1) {
                        elUsuario.atlas.datosNodos[indexN].aprendido = nuevoEstadoAprendido;
                    }
                    else {
                        elUsuario.atlas.datosNodos.push({
                            idNodo,
                            aprendido: nuevoEstadoAprendido
                        });
                    }
                    yield elUsuario.save();
                    return true;
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
            });
        },
        setNodoAtlasTarget: function (_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
                }
                console.log(`Seting nodo ${idNodo} como target para el usuario ${credencialesUsuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    elUsuario.atlas.idNodoTarget = idNodo;
                    yield elUsuario.save();
                    return true;
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
            });
        },
        nulificarNodoTargetUsuarioAtlas: function (_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("No autenticado");
                }
                console.log(`Seting nodo target null para el usuario ${credencialesUsuario.id}`);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(credencialesUsuario.id).exec();
                    elUsuario.atlas.idNodoTarget = null;
                    yield elUsuario.save();
                    return true;
                }
                catch (error) {
                    console.log(`error guardando usuario en la base de datos: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
            });
        },
    },
    Usuario: {
        edad: function (parent, _, __) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            console.log(`Usuario tiene edad: ${edad}`);
            let edadAños = Math.floor(edad / (60 * 60 * 24 * 365 * 1000));
            edadAños = parseInt(edadAños.toFixed());
            return edadAños;
        },
        nombreGrupoEstudiantil: function (parent) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent._id) {
                    return "";
                }
                try {
                    let elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ estudiantes: parent._id }).exec();
                    if (!elGrupo)
                        return "";
                    var nombreGrupo = elGrupo.nombre;
                }
                catch (error) {
                    console.log(`Error buscando grupo en la base de datos. E: ${error}`);
                    return "";
                }
                return nombreGrupo;
            });
        },
        idGrupoEstudiantil: function (parent) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent._id) {
                    return "";
                }
                try {
                    let elGrupo = yield GrupoEstudiantil_1.ModeloGrupoEstudiantil.findOne({ estudiantes: parent._id });
                    if (!elGrupo)
                        return "";
                    var idGrupo = elGrupo._id;
                }
                catch (error) {
                    console.log(`Error buscando grupo en la base de datos. E: ${error}`);
                    return "";
                }
                return idGrupo;
            });
        }
    },
    PublicUsuario: {
        edad: function (parent, _, __) {
            if (!parent.fechaNacimiento) {
                return 0;
            }
            let edad = Date.now() - parent.fechaNacimiento;
            let edadAños = edad / (60 * 60 * 24 * 365 * 1000);
            edadAños = parseInt(edadAños.toFixed());
            return edadAños;
        },
    },
    Date: {
        GraphQLDateTime: graphql_iso_date_1.GraphQLDateTime
    }
};
