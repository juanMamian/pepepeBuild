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
const Objetivo_1 = require("../model/Objetivo");
const Nodo = require("../model/atlas/Nodo");
const Foro_1 = require("../model/Foros/Foro");
const Proyecto_1 = require("../model/Proyecto");
exports.typeDefs = apollo_server_express_1.gql `

   type Objetivo{
       id: ID,
       nombre: String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,
       descripcion:String,       
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       idProyectoParent:ID,
       estado:String,       
       coords: Coords,
       angulo:Float,
       stuck:Boolean,
       puntaje:Float,
       centroMasa:Coords,
       nivel: Int,
       turnoNivel:Float,
   }

   type InfoBasicaObjetivo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   extend type Query{
       objetivo(idObjetivo: ID!):Objetivo,
       busquedaObjetivosProyectos(textoBusqueda:String!):[InfoBasicaObjetivo],
       objetivosSegunCentro(centro: CoordsInput!, radio:Int!):[Objetivo],       
   }   

   extend type Mutation{
    crearObjetivo(posicion:CoordsInput):Objetivo,
    eliminarObjetivoDeProyecto(idObjetivo:ID!, idProyecto:ID!):Boolean,
    editarNombreObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoNombre: String!):Objetivo,
    editarDescripcionObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoDescripcion: String!):Objetivo,
    setPosicionObjetivoDiagramaProyecto(idObjetivo:ID!, nuevaPosicion:CoordsInput):Objetivo,
    editarKeywordsObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoKeywords: String!):Objetivo,
    setEstadoObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoEstado:String!):Objetivo,    
   }
`;
exports.resolvers = {
    Query: {
        objetivo: function (_, { idObjetivo }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando un objetivo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                if (!elObjetivo.idProyectoParent) {
                    console.log(`Objetivo ${elObjetivo.nombre} no tenia idProyectoParent. Buscándole`);
                    try {
                        let elProyectoParent = yield Proyecto_1.ModeloProyecto.findOne({ idsObjetivos: { $in: elObjetivo._id } }).exec();
                        if (!elProyectoParent)
                            throw "No habia proyecto parent";
                        console.log(`Era del proyecto ${elProyectoParent.nombre}`);
                        elObjetivo.idProyectoParent = elProyectoParent._id;
                        yield elObjetivo.save();
                    }
                    catch (error) {
                        console.log(`Error buscando proyecto parent. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base datos");
                    }
                }
                return elObjetivo;
            });
        },
        busquedaObjetivosProyectos: function (_, { textoBusqueda }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Buscando objetivo usando texto de búsqueda: ${textoBusqueda}`);
                const sizePaginaObjetivos = 50;
                if (contexto.usuario.id === "") {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var losObjetivos = yield Objetivo_1.ModeloObjetivo.find({ $text: { $search: textoBusqueda } }, { score: { $meta: 'textScore' } }).select("nombre").sort({ score: { $meta: 'textScore' } }).limit(sizePaginaObjetivos).exec();
                }
                catch (error) {
                    console.log(`Error buscando objetivos. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losObjetivos.length} objetivos encontrados`);
                return losObjetivos;
            });
        },
        objetivosSegunCentro: function (_, { centro, radio }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var losObjetivos = yield Objetivo_1.ModeloObjetivo.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando objetivos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando objetivos según centro`);
                return losObjetivos;
            });
        }
    },
    Mutation: {
        crearObjetivo(_, { posicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo objetivo`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario.id || credencialesUsuario.id.length < 2) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`Creando un foro para este objetivo`);
                try {
                    var nuevoForo = yield Foro_1.ModeloForo.create({
                        acceso: "privado",
                        miembros: [credencialesUsuario.id],
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
                    var nuevoObjetivo = yield new Objetivo_1.ModeloObjetivo({ idForo: idNuevoForo, diagramaProyecto: { posicion } });
                    yield nuevoObjetivo.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo objetivo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevoObjetivo;
            });
        },
        eliminarObjetivoDeProyecto(_, { idObjetivo, idProyecto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un objetivo con id ${idObjetivo} de un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    yield Objetivo_1.ModeloObjetivo.findByIdAndDelete(idObjetivo);
                    yield Proyecto_1.ModeloProyecto.findByIdAndUpdate(idProyecto, { $pull: { idsObjetivos: idObjetivo } });
                }
                catch (error) {
                    console.log("Error eliminando objetivo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el objetivo en el proyecto");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        editarNombreObjetivoProyecto(_, { idProyecto, idObjetivo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del objetivo con id ${idObjetivo} del proyecto con id ${idProyecto}`);
                const charProhibidosNombreObjetivo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreObjetivo.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "No existía el objetivo";
                    }
                    elObjetivo.nombre = nuevoNombre;
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                console.log(`Nombre cambiado`);
                return elObjetivo;
            });
        },
        editarDescripcionObjetivoProyecto(_, { idProyecto, idObjetivo, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el proyecto. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Descripcion de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosDescripcionObjetivo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionObjetivo.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no existía";
                    }
                    elObjetivo.descripcion = nuevoDescripcion;
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log(`error guardando el objetivo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                return elObjetivo;
            });
        },
        editarKeywordsObjetivoProyecto(_, { idProyecto, idObjetivo, nuevoKeywords }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el proyecto. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Keywords de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosKeywordsObjetivo = /[^ a-zA-Zñ,]/;
                if (charProhibidosKeywordsObjetivo.test(nuevoKeywords)) {
                    throw new apollo_server_express_1.ApolloError("Keywords ilegal");
                }
                nuevoKeywords = nuevoKeywords.trim();
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no existía";
                    }
                    elObjetivo.keywords = nuevoKeywords;
                    console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log(`error guardando el objetivo modificado: ${error}`);
                }
                console.log(`Keywords guardado`);
                return elObjetivo;
            });
        },
        setPosicionObjetivoDiagramaProyecto(_, { idObjetivo, nuevaPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Guardando posicion de objetivo en el diagrama del proyecto`);
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando el objetivo: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let credencialesUsuario = contexto.usuario;
                const idProyecto = elObjetivo.idProyectoParent;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el proyecto. E: ` + error);
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Descripcion de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elObjetivo.coords = nuevaPosicion;
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log(`error guardando el objetivo modificado: ${error}`);
                }
                return elObjetivo;
            });
        },
        setEstadoObjetivoProyecto(_, { idProyecto, idObjetivo, nuevoEstado }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el proyecto. E: ` + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no existía";
                    }
                    elObjetivo.estado = nuevoEstado;
                    console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log(`error guardando el objetivo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Estado guardado`);
                return elObjetivo;
            });
        },
    }
};
