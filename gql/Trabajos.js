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
exports.resolvers = exports.NODO_EDITADO = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const Usuario_1 = require("../model/Usuario");
const Foro_1 = require("../model/Foros/Foro");
const Usuarios_1 = require("./Usuarios");
const Objetivo_1 = require("../model/Objetivo");
const Trabajo_1 = require("../model/Trabajo");
const Nodo = require("../model/atlas/Nodo");
const Proyecto_1 = require("../model/Proyecto");
exports.typeDefs = apollo_server_express_1.gql `
    input NodoSolidaridadInput{        
        tipo:String,
        nombre: String,        
        coords:CoordsInput,
        vinculos:[vinculoInput]
    }    

    type ResultadoBusquedaNodosSolidaridad{
        trabajos:[Trabajo]
        objetivos:[Objetivo]
    }

    type InfoNodoSolidaridad{
        idNodo: ID
        tipo: String
    }
    type Objetivo{
       id: ID,       
       nombre: String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,
       administradores:[String],
       descripcion:String,
       enlaces: [EnlaceNodoSolidaridad], 
       vinculos:[VinculoNodoProyecto],
       keywords:String,
       nodoParent:InfoNodoSolidaridad,
       idForoResponsables:ID,
       estadoDesarrollo:String,       
       coords: Coords,
       autoCoords: Coords,
       angulo:Float,
       stuck:Boolean,
       puntaje:Float,
       centroMasa:Coords,
       nivel: Int,
       turnoNivel:Float,
       peso:Int,
       fuerzaCentroMasa:FuerzaPolar
    fuerzaColision:FuerzaPolar

   }

   type InfoBasicaObjetivo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

    type MaterialTrabajo{
        id: ID,
        nombre: String,
        descripcion:String,
        cantidadNecesaria:Int,
        cantidadDisponible:Int,    
        idTrabajoParent:ID,
        
    }

    type EnlaceNodoSolidaridad{
        id: ID!, 
        nombre: String,
        descripcion: String,
        link: String,
        tipo: String
    }

   type Trabajo{
       id: ID,       
       nombre: String,
       descripcion:String,
       enlaces: [EnlaceNodoSolidaridad], 
       responsables: [String],
       posiblesResponsables:[String],
       administradores:[String],
       responsablesSolicitados:Int,
       nodoParent:InfoNodoSolidaridad
       nodosConocimiento:[String],
       idForoResponsables:ID,
       diagramaProyecto:InfoDiagramaProyecto,
       vinculos:[VinculoNodoProyecto],
       keywords:String,       
       estadoDesarrollo:String,
       materiales:[MaterialTrabajo],
       estado:String,       
       coords: Coords,
       autoCoords: Coords,
       angulo:Float,
       stuck:Boolean,
       puntaje:Float,
       centroMasa:Coords,
       nivel: Int,
       turnoNivel:Float,
       peso:Int,
       fuerzaCentroMasa:FuerzaPolar,
    fuerzaColision:FuerzaPolar
   }

   type InfoBasicaTrabajo{
       id:ID,
       nombre: String,
       idProyecto:ID
   }

   union NodoDeTrabajos = Trabajo | Objetivo

   extend type Query{
        objetivo(idObjetivo: ID!):Objetivo,
       busquedaObjetivosProyectos(textoBusqueda:String!):[InfoBasicaObjetivo],
       objetivosSegunCentro(centro: CoordsInput!, radio:Int!):[Objetivo],

       trabajo(idTrabajo: ID!):Trabajo,
       busquedaTrabajosProyectos(textoBusqueda:String!):[InfoBasicaTrabajo],
       trabajosDeProyectoDeUsuario(idUsuario:ID!):[InfoBasicaTrabajo],
       trabajosSegunCentro(centro: CoordsInput!, radio: Int!):[Trabajo],
       nodosTrabajosSegunCentro(centro:CoordsInput!, radio: Int!):[NodoDeTrabajos],
       todosNodosSolidaridad:[NodoDeTrabajos],
        busquedaAmpliaNodosSolidaridad(palabrasBuscadas:String!):ResultadoBusquedaNodosSolidaridad,
        
        todosMateriales:[MaterialTrabajo],

   }

   extend type Mutation{

    crearMaterialEnTrabajoSolidaridad(idTrabajo:ID!):MaterialTrabajo,
    eliminarMaterialDeTrabajoSolidaridad(idTrabajo:ID!, idMaterial: ID!):Boolean,
    editarNombreMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoNombre: String!):MaterialTrabajo,
    editarDescripcionMaterialTrabajo(idTrabajo:ID!, idMaterial: ID!, nuevoDescripcion: String!):MaterialTrabajo,
    editarCantidadesMaterialTrabajo(idTrabajo: ID!, idMaterial:ID!, nuevoCantidadNecesaria:Int!, nuevoCantidadDisponible:Int):MaterialTrabajo,

    crearEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!):EnlaceNodoSolidaridad,
    eliminarEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!, idEnlace:ID!):Boolean,
    editarNombreEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!, idEnlace: ID!, nuevoNombre: String!):EnlaceNodoSolidaridad,
    editarDescripcionEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!, idEnlace: ID!, nuevoDescripcion: String!):EnlaceNodoSolidaridad,
    editarLinkEnlaceNodoSolidaridad(idNodo:ID!, tipoNodo:String!, idEnlace: ID!, nuevoLink: String!):EnlaceNodoSolidaridad,

    crearObjetivo(posicion:CoordsInput):Objetivo,
    eliminarObjetivo(idObjetivo:ID!, idProyecto:ID!):Boolean,
    editarNombreObjetivo(idObjetivo:ID!, nuevoNombre: String!):Objetivo,
    editarDescripcionObjetivo(idObjetivo:ID!, nuevoDescripcion: String!):Objetivo,
    editarKeywordsObjetivo(idObjetivo:ID!, nuevoKeywords: String!):Objetivo,
    addResponsableObjetivo(idObjetivo:ID!,idUsuario:ID!):Objetivo,
    addPosibleResponsableObjetivo(idObjetivo:ID!, idUsuario:ID!):Objetivo,
    removeResponsableObjetivo(idObjetivo:ID!, idUsuario:ID!):Objetivo,
    setEstadoObjetivo(idObjetivo:ID!, nuevoEstado:String!):Objetivo,    
    setResponsablesSolicitadosObjetivo(idObjetivo:ID!, nuevoCantidadResponsablesSolicitados: Int!):Objetivo,
    setPosicionObjetivo(idObjetivo:ID!, nuevaPosicion:CoordsInput):Objetivo,

    crearTrabajo(idProyecto: ID!, posicion:CoordsInput):ID,
    eliminarTrabajo(idTrabajo:ID!, idProyecto:ID!):Boolean,
    editarNombreTrabajo(idTrabajo:ID!, nuevoNombre: String!):Trabajo,
    editarDescripcionTrabajo(idTrabajo:ID!, nuevoDescripcion: String!):Trabajo,
    editarKeywordsTrabajo(idTrabajo:ID!, nuevoKeywords: String!):Trabajo,
    addResponsableTrabajo(idTrabajo:ID!,idUsuario:ID!):Trabajo,
    addPosibleResponsableTrabajo(idTrabajo:ID!, idUsuario:ID!):Trabajo,
    removeResponsableTrabajo(idTrabajo:ID!, idUsuario:ID!):Trabajo,
    setEstadoTrabajo(idTrabajo:ID!, nuevoEstado:String!):Trabajo,    
    setResponsablesSolicitadosTrabajo(idTrabajo:ID!, nuevoCantidadResponsablesSolicitados: Int!):Trabajo,
    setPosicionTrabajo(idTrabajo:ID!, nuevaPosicion:CoordsInput):Trabajo,

    setPosicionNodoSolidaridad(idNodo:ID!, nuevaPosicion:CoordsInput):NodoDeTrabajos,
    eliminarNodoSolidaridad(idNodo:ID!, tipo: String!):Boolean,
    crearNodoSolidaridad(infoNodo:NodoSolidaridadInput!):NodoDeTrabajos,
    crearNodoSolidaridadRequerido(infoNodo:NodoSolidaridadInput!, idNodoRequiriente: ID!):[NodoDeTrabajos],
    desvincularNodosSolidaridad(idUnNodo:ID!, idOtroNodo:ID!):[NodoDeTrabajos],
    crearRequerimentoEntreNodosSolidaridad(idNodoRequiriente:ID!, idNodoRequerido:ID!):[NodoDeTrabajos],
    crearParentingEntreNodosSolidaridad(idNodoRequiriente:ID!, idNodoRequerido:ID!):[NodoDeTrabajos],

   }

   extend type Subscription{
        nodoEditado(centro:CoordsInput!, radio:Int!):NodoDeTrabajos
   }

`;
exports.NODO_EDITADO = "nodo_solidaridad_editado";
exports.resolvers = {
    Subscription: {
        nodoEditado: {
            subscribe: apollo_server_express_1.withFilter((_, { centro, radio }, contexto) => {
                console.log(`--------------------------Creando una subscripción a nodos editados de ${contexto.usuario.username} con centro en ${centro} y de radio ${radio}`);
                return contexto.pubsub.asyncIterator(exports.NODO_EDITADO);
            }, (nodoEditado, variables, contexto) => {
                if (variables.radio === 0) {
                    return true;
                }
                if (nodoEditado.nodoEditado.coords.x > variables.centro.x + variables.radio || nodoEditado.nodoEditado.coords.x < variables.centro.x - variables.radio || nodoEditado.nodoEditado.coords.y > variables.centro.y + variables.radio || nodoEditado.nodoEditado.coords.y < variables.centro.y - variables.radio) {
                    console.log(`No se notificara`);
                    return false;
                }
                console.log(`Nueva notificacion de un nodo editado para ${contexto.usuario.username}`);
                return true;
            })
        }
    },
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
                if (!elObjetivo.idForoResponsables) {
                    console.log(`El objetivo no tenía foro`);
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
        },
        trabajo: function (_, { idTrabajo }, context) {
            return __awaiter(this, void 0, void 0, function* () {
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
                if (!elTrabajo.idForoResponsables) {
                    console.log(`El trabajo no tenía foro`);
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
        },
        trabajosSegunCentro: function (_, { centro, radio }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losTrabajos;
            });
        },
        nodosTrabajosSegunCentro: function (_, { centro, radio }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Nodos alrededor de un centro ${JSON.stringify(centro)} con radio ${radio} solicitados`);
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ "coords.x": { $gt: centro.x - radio, $lt: centro.x + radio }, "coords.y": { $gt: centro.y - radio, $lt: centro.y + radio } }).exec();
                    var losObjetivos = yield Objetivo_1.ModeloObjetivo.find({ "coords.x": { $gt: centro.x - radio, $lt: centro.x + radio }, "coords.y": { $gt: centro.y - radio, $lt: centro.y + radio } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                losTrabajos.forEach(t => t.tipoNodo = "trabajo");
                losObjetivos.forEach(o => o.tipoNodo = "objetivo");
                console.log(`${losTrabajos.length} trabajos encontrados.`);
                console.log(`${losObjetivos.length} objetivos encontrados.`);
                const todosNodos = losTrabajos.concat(losObjetivos);
                console.log(`Retornando ${todosNodos.length} nodos`);
                return todosNodos;
            });
        },
        todosNodosSolidaridad: function (_, ___, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Todos nodos solidaridad solicitados`);
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({}).exec();
                    var losObjetivos = yield Objetivo_1.ModeloObjetivo.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                losTrabajos.forEach(t => t.tipoNodo = "trabajo");
                losObjetivos.forEach(o => o.tipoNodo = "objetivo");
                console.log(`${losTrabajos.length} trabajos encontrados.`);
                console.log(`${losObjetivos.length} objetivos encontrados.`);
                const todosNodos = losTrabajos.concat(losObjetivos);
                console.log(`Retornando ${todosNodos.length} nodos`);
                return todosNodos;
            });
        },
        busquedaAmpliaNodosSolidaridad: function (_, { palabrasBuscadas }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`buscando nodos de solidaridad que contengan: ${palabrasBuscadas}`);
                // console.log(`tipo de input: ${typeof (palabrasBuscadas)}`);
                if (palabrasBuscadas.length < 1) {
                    console.log(`No habia palabras buscadas`);
                }
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({ locale: "en", strength: 1 }).select("nombre descripcion coords").sort({ score: { $meta: 'textScore' } }).limit(20).exec();
                    var losObjetivos = yield Objetivo_1.ModeloObjetivo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({ locale: "en", strength: 1 }).select("nombre descripcion coords").sort({ score: { $meta: 'textScore' } }).limit(20).exec();
                    losTrabajos.forEach(t => t.tipoNodo = 'trabajo');
                    losObjetivos.forEach(o => o.tipoNodo = 'objetivo');
                    // var opciones:any = await Nodo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).collation({locale:"en", strength:1}).select("nombre descripcion coordsManuales coords").sort({ score: { $meta: 'textScore' } }).limit(10).exec();                
                    var opciones = losTrabajos.concat(losObjetivos);
                }
                catch (error) {
                    console.log(". E: " + error);
                    throw new apollo_server_express_1.ApolloError("");
                }
                console.log(`${opciones.length} opciones: ${opciones}`);
                return { trabajos: losTrabajos, objetivos: losObjetivos };
            });
        },
        todosMateriales: function (_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando los trabajos`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var listaMateriales = [];
                losTrabajos.forEach(trabajo => {
                    trabajo.materiales.forEach(material => {
                        material.idTrabajoParent = trabajo.id;
                    });
                    listaMateriales = listaMateriales.concat(trabajo.materiales);
                });
                return listaMateriales;
            });
        }
    },
    Mutation: {
        setPosicionNodoSolidaridad(_, { idNodo, nuevaPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Guardando posicion de nodo en el diagrama del proyecto`);
                const credencialesUsuario = contexto.usuario;
                try {
                    var tipoDeNodo = 'trabajo';
                    var elNodo = yield Trabajo_1.ModeloTrabajo.findById(idNodo).exec();
                    if (!elNodo) {
                        tipoDeNodo = 'objetivo';
                        elNodo = yield Objetivo_1.ModeloObjetivo.findById(idNodo).exec();
                    }
                    if (!elNodo) {
                        tipoDeNodo = '';
                        throw "Nodo no encontrado";
                    }
                    elNodo.tipoNodo = tipoDeNodo;
                }
                catch (error) {
                    console.log("Error buscando el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elNodo.nodoParent || !elNodo.nodoParent.idNodo || !elNodo.nodoParent.tipo) {
                    administradores = elNodo.responsables;
                }
                else {
                    var idParent = elNodo.nodoParent.idNodo;
                    var tipoParent = elNodo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elNodo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de nodo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elNodo.coords = nuevaPosicion;
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodo modificado: ${error}`);
                }
                return elNodo;
            });
        },
        eliminarNodoSolidaridad(_, { idNodo, tipo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un ${tipo} con id ${idNodo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = null;
                    if (tipo === 'objetivo') {
                        elNodo = yield Objetivo_1.ModeloObjetivo.findById(idNodo).exec();
                    }
                    else if (tipo === 'trabajo') {
                        elNodo = yield Trabajo_1.ModeloTrabajo.findById(idNodo).exec();
                    }
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var administradoresElNodo = [];
                if (!elNodo.nodoParent || !elNodo.nodoParent.idNodo || !elNodo.nodoParent.tipo) {
                    administradoresElNodo = elNodo.responsables;
                }
                else {
                    try {
                        var elNodoParent = null;
                        if (elNodo.nodoParent.tipo === 'trabajo') {
                            elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(elNodo.nodoParent.idNodo);
                        }
                        else if (elNodo.nodoParent.tipo === 'objetivo') {
                            elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(elNodo.nodoParent.idNodo);
                        }
                        if (!elNodoParent)
                            throw "Nodo parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    administradoresElNodo = elNodoParent.responsables;
                }
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!administradoresElNodo.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion eliminando nodo de tipo ${tipo}`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    if (tipo === 'objetivo') {
                        yield Objetivo_1.ModeloObjetivo.findByIdAndDelete(idNodo);
                    }
                    else if (tipo === 'trabajo') {
                        yield Trabajo_1.ModeloTrabajo.findByIdAndDelete(idNodo);
                    }
                    else {
                        throw "Tipo de nodo no reconocido";
                    }
                }
                catch (error) {
                    console.log("Error eliminando nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error eliminando elemento");
                }
                console.log(`eliminado`);
                //Buscar nodos que tuvieran a este como nodoParent
                try {
                    var trabajosHijos = yield Trabajo_1.ModeloTrabajo.find({ "nodoParent.idNodo": idNodo });
                    console.log(`${trabajosHijos.length} trabajos hijos encontrados`);
                    var objetivosHijos = yield Objetivo_1.ModeloObjetivo.find({ "nodoParent.idNodo": idNodo });
                    console.log(`${objetivosHijos.length} objetivos hijos encontrados`);
                    var todosHijos = trabajosHijos.concat(objetivosHijos);
                }
                catch (error) {
                    console.log(`Error buscando los hijos del nodo eliminado: ${error}`);
                }
                todosHijos.forEach((hijo) => __awaiter(this, void 0, void 0, function* () {
                    hijo.nodoParent = null;
                    try {
                        yield hijo.save();
                    }
                    catch (error) {
                        console.log(`Error guardando el hijo con nodoParent nullificado`);
                    }
                }));
                //Eliminar foro
                try {
                    yield Foro_1.ModeloForo.findByIdAndDelete(elNodo.idForoResponsables);
                }
                catch (error) {
                    console.log(`Error buscando los foros para ser eliminados`);
                }
                return true;
            });
        },
        crearNodoSolidaridad(_, { infoNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de crear un nodo de solidaridad de tipo ${infoNodo.tipo} en la posicion ${infoNodo.coords}`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("Usuario no logeado");
                }
                try {
                    var nuevoForoResponsables = yield Foro_1.ModeloForo.create({
                        acceso: "privado",
                        miembros: [],
                    });
                    var idForoResponsables = nuevoForoResponsables._id;
                    yield nuevoForoResponsables.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo foro de responsables. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo foro de responsables creado`);
                try {
                    var nuevoNodo = null;
                    if (infoNodo.tipo === 'trabajo')
                        nuevoNodo = new Trabajo_1.ModeloTrabajo(Object.assign(Object.assign({}, infoNodo), { idForoResponsables }));
                    else if (infoNodo.tipo === 'objetivo') {
                        nuevoNodo = new Objetivo_1.ModeloObjetivo(Object.assign(Object.assign({}, infoNodo), { idForoResponsables }));
                    }
                    else {
                        throw "Tipo " + infoNodo.tipo + " no reconocido";
                    }
                    yield nuevoNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                    try {
                        yield Foro_1.ModeloForo.findByIdAndDelete(nuevoForoResponsables.id).exec();
                    }
                    catch (error) {
                        console.log(`Error eliminando el foro de responsables: ${error}`);
                    }
                    throw new apollo_server_express_1.ApolloError("Error guardando en base de datos");
                }
                console.log(`nuevo nodo de solidaridad creado`);
                //PUBSUB
                nuevoNodo.tipoNodo = infoNodo.tipo;
                return nuevoNodo;
            });
        },
        crearNodoSolidaridadRequerido(_, { infoNodo, idNodoRequiriente }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de crear un nodo de solidaridad de tipo ${infoNodo.tipo} en la posicion ${infoNodo.coords} con requiriente ${idNodoRequiriente}`);
                let credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("Usuario no logeado");
                }
                try {
                    var nuevoForoResponsables = yield Foro_1.ModeloForo.create({
                        acceso: "privado",
                        miembros: [],
                    });
                    var idForoResponsables = nuevoForoResponsables._id;
                    yield nuevoForoResponsables.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo foro de responsables. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nuevo foro de responsables creado`);
                try {
                    var nuevoNodo = null;
                    if (infoNodo.tipo === 'trabajo')
                        nuevoNodo = new Trabajo_1.ModeloTrabajo(Object.assign(Object.assign({}, infoNodo), { idForoResponsables }));
                    else if (infoNodo.tipo === 'objetivo') {
                        nuevoNodo = new Objetivo_1.ModeloObjetivo(Object.assign(Object.assign({}, infoNodo), { idForoResponsables }));
                    }
                    else {
                        throw "Tipo " + infoNodo.tipo + " no reconocido";
                    }
                    try {
                        var tipoRequiriente = 'trabajo';
                        var nodoRequiriente = yield Trabajo_1.ModeloTrabajo.findById(idNodoRequiriente).exec();
                        if (!nodoRequiriente) {
                            tipoRequiriente = 'objetivo';
                            nodoRequiriente = yield Objetivo_1.ModeloObjetivo.findById(idNodoRequiriente).exec();
                            if (!nodoRequiriente) {
                                throw "Nodo requiriente no encontrado en la base de datos";
                            }
                        }
                        var nuevoVinculo = nodoRequiriente.vinculos.create({
                            tipo: 'requiere',
                            idRef: nuevoNodo.id,
                            tipoRef: infoNodo.tipo
                        });
                        if (!nodoRequiriente.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes('superadministrador')) {
                            console.log(`El usuario no podía crear este nodo requerido por no ser ni responsable ni superadministrador`);
                            throw new apollo_server_express_1.AuthenticationError("No autorizado");
                        }
                        nodoRequiriente.vinculos.push(nuevoVinculo);
                        console.log(`Guardando vínculo en el nodo requiriente ${nodoRequiriente.nombre}`);
                        yield nodoRequiriente.save();
                        nodoRequiriente.tipoNodo = tipoRequiriente;
                    }
                    catch (error) {
                        console.log(`Error buscando el nodo requiriente: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    nuevoNodo.nodoParent = {
                        idNodo: idNodoRequiriente,
                        tipo: tipoRequiriente
                    };
                    yield nuevoNodo.save();
                    nuevoNodo.tipoNodo = infoNodo.tipo;
                }
                catch (error) {
                    console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                    try {
                        yield Foro_1.ModeloForo.findByIdAndDelete(nuevoForoResponsables.id).exec();
                    }
                    catch (error) {
                        console.log(`Error eliminando el foro de responsables: ${error}`);
                    }
                    throw new apollo_server_express_1.ApolloError("Error guardando en base de datos");
                }
                console.log(`nuevo nodo de solidaridad creado:`);
                nuevoNodo.tipoNodo = infoNodo.tipo;
                return [nuevoNodo, nodoRequiriente];
            });
        },
        desvincularNodosSolidaridad(_, { idUnNodo, idOtroNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Query de desvincular los nodos: ${idUnNodo}, ${idOtroNodo}`);
                try {
                    var tipoUnNodo = 'trabajo';
                    var unNodo = yield Trabajo_1.ModeloTrabajo.findById(idUnNodo).exec();
                    if (!unNodo) {
                        tipoUnNodo = 'objetivo';
                        unNodo = yield Objetivo_1.ModeloObjetivo.findById(idUnNodo).exec();
                    }
                    if (!unNodo)
                        throw "Primer nodo no encontrado";
                    var tipoOtroNodo = 'trabajo';
                    var otroNodo = yield Trabajo_1.ModeloTrabajo.findById(idOtroNodo).exec();
                    if (!otroNodo) {
                        tipoOtroNodo = 'objetivo';
                        otroNodo = yield Objetivo_1.ModeloObjetivo.findById(idOtroNodo).exec();
                    }
                    if (!unNodo)
                        throw "Primer nodo no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando los nodos a desvincular: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const permisosEspeciales = ["superadministrador"];
                var indexUnV = unNodo.vinculos.findIndex(v => v.idRef === idOtroNodo);
                if (indexUnV > -1) {
                    if (unNodo.responsables.includes(credencialesUsuario.id) || permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                        unNodo.vinculos.splice(indexUnV, 1);
                    }
                    else {
                        console.log(`Fallo al eliminar el vinculo de ${idUnNodo} requiriendo ${idOtroNodo}`);
                        throw new apollo_server_express_1.AuthenticationError("No autorizado");
                    }
                }
                var indexOtroV = otroNodo.vinculos.findIndex(v => v.idRef === idUnNodo);
                if (indexOtroV > -1) {
                    if (otroNodo.responsables.includes(credencialesUsuario.id) || permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                        otroNodo.vinculos.splice(indexOtroV, 1);
                    }
                    else {
                        console.log(`Fallo al eliminar el vinculo de ${idOtroNodo} requiriendo ${idUnNodo}`);
                        throw new apollo_server_express_1.AuthenticationError("No autorizado");
                    }
                }
                //Al quedar desvinculados ya no puede haber una relación de administrador:
                if (unNodo.nodoParent && unNodo.nodoParent.idNodo === idOtroNodo) {
                    unNodo.nodoParent = {};
                }
                if (otroNodo.nodoParent && otroNodo.nodoParent.idNodo === idUnNodo) {
                    otroNodo.nodoParent = {};
                }
                try {
                    yield unNodo.save();
                    yield otroNodo.save();
                }
                catch (error) {
                    console.log(`Error guardando los nodos después de la desvinculación: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Desvinculados`);
                unNodo.tipoNodo = tipoUnNodo;
                otroNodo.tipoNodo = tipoOtroNodo;
                return [unNodo, otroNodo];
            });
        },
        crearRequerimentoEntreNodosSolidaridad(_, { idNodoRequiriente, idNodoRequerido }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Query de set que nodo ${idNodoRequiriente} requiere al nodo ${idNodoRequerido}`);
                try {
                    var tipoNodoRequiriente = 'trabajo';
                    var nodoRequiriente = yield Trabajo_1.ModeloTrabajo.findById(idNodoRequiriente).exec();
                    if (!nodoRequiriente) {
                        tipoNodoRequiriente = 'objetivo';
                        nodoRequiriente = yield Objetivo_1.ModeloObjetivo.findById(idNodoRequiriente).exec();
                    }
                    if (!nodoRequiriente)
                        throw "Nodo requiriente no encontrado";
                    var tipoNodoRequerido = 'trabajo';
                    var nodoRequerido = yield Trabajo_1.ModeloTrabajo.findById(idNodoRequerido).exec();
                    if (!nodoRequerido) {
                        tipoNodoRequerido = 'objetivo';
                        nodoRequerido = yield Objetivo_1.ModeloObjetivo.findById(idNodoRequerido).exec();
                    }
                    if (!nodoRequerido)
                        throw "Nodo requerido no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando los nodos a desvincular: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Administradores de nodoRequiriente
                var administradoresNodoRequiriente = [];
                if (!nodoRequiriente.nodoParent || !nodoRequiriente.nodoParent.idNodo || !nodoRequiriente.nodoParent.tipo) {
                    administradoresNodoRequiriente = nodoRequiriente.responsables;
                }
                else {
                    try {
                        var elNodoParent = null;
                        if (nodoRequiriente.nodoParent.tipo === 'trabajo') {
                            elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(nodoRequiriente.nodoParent.idNodo);
                        }
                        else if (nodoRequiriente.nodoParent.tipo === 'objetivo') {
                            elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(nodoRequiriente.nodoParent.idNodo);
                        }
                        if (!elNodoParent)
                            throw "Nodo parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    administradoresNodoRequiriente = elNodoParent.responsables;
                }
                //Administradores de nodoRequerido
                var administradoresNodoRequerido = [];
                if (!nodoRequerido.nodoParent || !nodoRequerido.nodoParent.idNodo || !nodoRequerido.nodoParent.tipo) {
                    administradoresNodoRequerido = nodoRequerido.responsables;
                }
                else {
                    try {
                        var elNodoParent = null;
                        if (nodoRequerido.nodoParent.tipo === 'trabajo') {
                            elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(nodoRequerido.nodoParent.idNodo);
                        }
                        else if (nodoRequerido.nodoParent.tipo === 'objetivo') {
                            elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(nodoRequerido.nodoParent.idNodo);
                        }
                        if (!elNodoParent)
                            throw "Nodo parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    administradoresNodoRequerido = elNodoParent.responsables;
                }
                const permisosEspeciales = ["superadministrador"];
                if (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !nodoRequiriente.responsables.includes(credencialesUsuario.id) && !administradoresNodoRequiriente.includes(credencialesUsuario.id)) {
                    console.log(`Fallo en autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var indexV = nodoRequiriente.vinculos.findIndex(v => v.idRef === idNodoRequerido);
                if (indexV > -1) {
                    nodoRequiriente.vinculos.splice(indexV, 1);
                }
                var nuevoVinculo = nodoRequiriente.vinculos.create({
                    idRef: idNodoRequerido,
                    tipo: "requiere",
                    tipoRef: tipoNodoRequerido
                });
                nodoRequiriente.vinculos.push(nuevoVinculo);
                var indexOtroV = nodoRequerido.vinculos.findIndex(v => v.idRef === idNodoRequiriente);
                if (indexOtroV > -1) {
                    nodoRequerido.vinculos.splice(indexOtroV, 1);
                }
                //Si el nodo requerido estaba huérfano, entonces lo toma bajo su control
                if ((!nodoRequerido.responsables || nodoRequerido.responsables.length < 1) && (!nodoRequerido.nodoParent || !nodoRequerido.nodoParent.idNodo)) {
                    console.log(`El nodo requerido estaba huérfano. Tomando bajo el control del nodo requiriente.`);
                    nodoRequerido.nodoParent = {
                        idNodo: idNodoRequiriente,
                        tipo: tipoNodoRequiriente
                    };
                }
                try {
                    yield nodoRequiriente.save();
                    yield nodoRequerido.save();
                }
                catch (error) {
                    console.log(`Error guardando los nodos después de la vinculación: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Vinculados`);
                nodoRequiriente.tipoNodo = tipoNodoRequiriente;
                nodoRequerido.tipoNodo = tipoNodoRequerido;
                return [nodoRequiriente, nodoRequerido];
            });
        },
        crearParentingEntreNodosSolidaridad(_, { idNodoRequiriente, idNodoRequerido }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Query de set que nodo ${idNodoRequiriente} es parent del nodo ${idNodoRequerido}`);
                try {
                    var tipoNodoRequiriente = 'trabajo';
                    var nodoRequiriente = yield Trabajo_1.ModeloTrabajo.findById(idNodoRequiriente).exec();
                    if (!nodoRequiriente) {
                        tipoNodoRequiriente = 'objetivo';
                        nodoRequiriente = yield Objetivo_1.ModeloObjetivo.findById(idNodoRequiriente).exec();
                    }
                    if (!nodoRequiriente)
                        throw "Nodo requiriente no encontrado";
                    var tipoNodoRequerido = 'trabajo';
                    var nodoRequerido = yield Trabajo_1.ModeloTrabajo.findById(idNodoRequerido).exec();
                    if (!nodoRequerido) {
                        tipoNodoRequerido = 'objetivo';
                        nodoRequerido = yield Objetivo_1.ModeloObjetivo.findById(idNodoRequerido).exec();
                    }
                    if (!nodoRequerido)
                        throw "Nodo requerido no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando los nodos a desvincular: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Autorización
                const permisosEspeciales = ["superadministrador"];
                if (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Fallo en autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var indexV = nodoRequiriente.vinculos.findIndex(v => v.idRef === idNodoRequerido);
                if (indexV === -1) {
                    console.log(`Error: No había vínculo previo entre estos nodos`);
                    throw new apollo_server_express_1.UserInputError("Los nodos no estavan vinculados");
                }
                //Si el nodo requerido estaba huérfano, entonces lo toma bajo su control
                console.log(`El nodo requerido queda bajo el control del nodo requiriente.`);
                nodoRequerido.nodoParent = {
                    idNodo: idNodoRequiriente,
                    tipo: tipoNodoRequiriente
                };
                try {
                    yield nodoRequiriente.save();
                    yield nodoRequerido.save();
                }
                catch (error) {
                    console.log(`Error guardando los nodos después de la vinculación: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Parented`);
                nodoRequiriente.tipoNodo = tipoNodoRequiriente;
                nodoRequerido.tipoNodo = tipoNodoRequerido;
                return [nodoRequiriente, nodoRequerido];
            });
        },
        crearEnlaceNodoSolidaridad(_, { idNodo, tipoNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo enlace en el NodoSolidaridad con id ${idNodo}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = null;
                    if (tipoNodo === 'objetivo') {
                        elNodo = yield Objetivo_1.ModeloObjetivo.findById(idNodo).exec();
                    }
                    else if (tipoNodo === 'trabajo') {
                        elNodo = yield Trabajo_1.ModeloTrabajo.findById(idNodo).exec();
                    }
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const permisosEspeciales = ["superadministrador"];
                if (!credencialesUsuario.id || (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elNodo.responsables.includes(credencialesUsuario.id))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var nuevoEnlace = elNodo.enlaces.create();
                    elNodo.enlaces.push(nuevoEnlace);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el enlace creado en el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el enlace en el nodo");
                }
                console.log(`Enviando nuevo enlace: ${nuevoEnlace}`);
                return nuevoEnlace;
            });
        },
        eliminarEnlaceNodoSolidaridad(_, { idNodo, tipoNodo, idEnlace }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de eliminar un enlace con id ${idEnlace} en el NodoSolidaridad con id ${idNodo}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = null;
                    if (tipoNodo === 'objetivo') {
                        elNodo = yield Objetivo_1.ModeloObjetivo.findById(idNodo).exec();
                    }
                    else if (tipoNodo === 'trabajo') {
                        elNodo = yield Trabajo_1.ModeloTrabajo.findById(idNodo).exec();
                    }
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const permisosEspeciales = ["superadministrador"];
                if (!credencialesUsuario.id || (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elNodo.responsables.includes(credencialesUsuario.id))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const indexE = elNodo.enlaces.findIndex(e => e.id === idEnlace);
                if (indexE > -1) {
                    elNodo.enlaces.splice(indexE, 1);
                }
                else {
                    console.log(`Error. El enlace a eliminar no existía.`);
                    throw new apollo_server_express_1.UserInputError("Enlace no encontrado");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el enlace en el nodo");
                }
                return true;
            });
        },
        editarNombreEnlaceNodoSolidaridad(_, { idNodo, tipoNodo, idEnlace, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del enlace con id ${idEnlace} del nodosolidaridad con id ${idNodo}`);
                const charProhibidosNombreEnlace = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreEnlace.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elNodo = null;
                    if (tipoNodo === 'objetivo') {
                        elNodo = yield Objetivo_1.ModeloObjetivo.findById(idNodo).exec();
                    }
                    else if (tipoNodo === 'trabajo') {
                        elNodo = yield Trabajo_1.ModeloTrabajo.findById(idNodo).exec();
                    }
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elNodo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de nodosolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elEnlace = elNodo.enlaces.id(idEnlace);
                    if (!elEnlace) {
                        console.log(`Enlace no encontrado en el nodosolidaridad`);
                        throw "No existía el enlace";
                    }
                    elEnlace.nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el enlace creado en el nodosolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el enlace en el nodosolidaridad");
                }
                console.log(`Nombre cambiado`);
                return elEnlace;
            });
        },
        editarDescripcionEnlaceNodoSolidaridad(_, { idNodo, tipoNodo, idEnlace, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando la descripcion del enlace con id ${idEnlace} del nodosolidaridad con id ${idNodo}`);
                const charProhibidosDescripcion = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcion.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    var elNodo = null;
                    if (tipoNodo === 'objetivo') {
                        elNodo = yield Objetivo_1.ModeloObjetivo.findById(idNodo).exec();
                    }
                    else if (tipoNodo === 'trabajo') {
                        elNodo = yield Trabajo_1.ModeloTrabajo.findById(idNodo).exec();
                    }
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elNodo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando descripcion de nodosolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elEnlace = elNodo.enlaces.id(idEnlace);
                    if (!elEnlace) {
                        console.log(`Enlace no encontrado en el nodosolidaridad`);
                        throw "No existía el enlace";
                    }
                    elEnlace.descripcion = nuevoDescripcion;
                }
                catch (error) {
                    console.log("Error cambiando el descripcion en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el descripcion en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el enlace creado en el nodosolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el enlace en el nodosolidaridad");
                }
                console.log(`Descripcion cambiado`);
                return elEnlace;
            });
        },
        editarLinkEnlaceNodoSolidaridad(_, { idNodo, tipoNodo, idEnlace, nuevoLink }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el link del enlace con id ${idEnlace} del nodosolidaridad con id ${idNodo}`);
                // const charProhibidosLinkEnlace = /[^ a-zA-ZÀ-ž0-9_.-?/=:]/;
                nuevoLink = nuevoLink.replace(/\s\s+/g, " ");
                // if (charProhibidosLinkEnlace.test(nuevoLink)) {
                //     throw new ApolloError("Link ilegal");
                // }
                nuevoLink = nuevoLink.trim();
                try {
                    var elNodo = null;
                    if (tipoNodo === 'objetivo') {
                        elNodo = yield Objetivo_1.ModeloObjetivo.findById(idNodo).exec();
                    }
                    else if (tipoNodo === 'trabajo') {
                        elNodo = yield Trabajo_1.ModeloTrabajo.findById(idNodo).exec();
                    }
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elNodo.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando link de nodosolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elEnlace = elNodo.enlaces.id(idEnlace);
                    if (!elEnlace) {
                        console.log(`Enlace no encontrado en el nodosolidaridad`);
                        throw "No existía el enlace";
                    }
                    elEnlace.link = nuevoLink;
                }
                catch (error) {
                    console.log("Error cambiando el link en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el link en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el enlace creado en el nodosolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el enlace en el nodosolidaridad");
                }
                console.log(`Link cambiado`);
                return elEnlace;
            });
        },
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
                    var nuevoObjetivo = yield new Objetivo_1.ModeloObjetivo({ idForoResponsables: idNuevoForo, diagramaProyecto: { posicion } });
                    yield nuevoObjetivo.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo objetivo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevoObjetivo;
            });
        },
        eliminarObjetivo(_, { idObjetivo, idProyecto }, contexto) {
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
        editarNombreObjetivo(_, { idObjetivo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del objetivo con id ${idObjetivo}`);
                const charProhibidosNombreObjetivo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreObjetivo.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el objetivo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                    administradores = elObjetivo.responsables;
                }
                else {
                    var idParent = elObjetivo.nodoParent.idNodo;
                    var tipoParent = elObjetivo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de objetivo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elObjetivo.nombre = nuevoNombre;
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                console.log(`Nombre cambiado`);
                elObjetivo.tipoNodo = 'objetivo';
                return elObjetivo;
            });
        },
        editarDescripcionObjetivo(_, { idObjetivo, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el objetivo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                    administradores = elObjetivo.responsables;
                }
                else { //Buscar el proximo nodo parent con responsables.
                    var idParent = elObjetivo.nodoParent.idNodo;
                    var tipoParent = elObjetivo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de objetivo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosDescripcionObjetivo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionObjetivo.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    elObjetivo.descripcion = nuevoDescripcion;
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log(`error guardando el objetivo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                elObjetivo.tipoNodo = 'objetivo';
                return elObjetivo;
            });
        },
        editarKeywordsObjetivo(_, { idProyecto, idObjetivo, nuevoKeywords }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el objetivo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                    administradores = elObjetivo.responsables;
                }
                else {
                    var idParent = elObjetivo.nodoParent.idNodo;
                    var tipoParent = elObjetivo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de objetivo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosKeywordsObjetivo = /[^ a-zA-Zñ,]/;
                if (charProhibidosKeywordsObjetivo.test(nuevoKeywords)) {
                    throw new apollo_server_express_1.ApolloError("Keywords ilegal");
                }
                nuevoKeywords = nuevoKeywords.trim();
                try {
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
        addResponsableObjetivo: function (_, { idObjetivo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un objetivo de id ${idObjetivo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo)
                        throw "Objetivo no existía";
                }
                catch (error) {
                    console.log('Error buscando el objetivo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                //Authorización
                if (elObjetivo.responsables.length > 0 && !credencialesUsuario.permisos.includes("superadministrador") && !elObjetivo.responsables.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion. Hay ${elObjetivo.responsables.length} responsables: ${elObjetivo.responsables}`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (elObjetivo.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este objetivo`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                let indexPosibleResponsable = elObjetivo.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elObjetivo.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                else {
                    if (elObjetivo.responsables.length > 0) {
                        console.log(`Error. Se intentaba add como responsable un usuario que no estaba en la lista de posibles responsables.`);
                        throw new apollo_server_express_1.UserInputError("El usuario no estaba en la lista de espera para responsables.");
                    }
                }
                try {
                    elObjetivo.responsables.push(idUsuario);
                    if (elObjetivo.responsablesSolicitados > 0)
                        elObjetivo.responsablesSolicitados--;
                    console.log(`Usuario añadido a la lista de responsables`);
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Objetivo guardado`);
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elObjetivo.idForoResponsables, { miembros: elObjetivo.responsables });
                }
                catch (error) {
                    console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
                }
                elObjetivo.tipoNodo = 'objetivo';
                return elObjetivo;
            });
        },
        addPosibleResponsableObjetivo: function (_, { idObjetivo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del objetivo ${idObjetivo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "objetivo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el objetivo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion añadiendo posible responsable del objetivo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (elObjetivo.posiblesResponsables.includes(idUsuario) || elObjetivo.responsables.includes(idUsuario)) {
                    console.log(`el usuario ya estaba en la lista`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba en la lista");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elObjetivo.posiblesResponsables.push(idUsuario);
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Objetivo guardado`);
                elObjetivo.tipoNodo = 'objetivo';
                //Crear notificacion para los responsables actuales del objetivo
                try {
                    var currentResponsables = yield Usuario_1.ModeloUsuario.find({ _id: { $in: elObjetivo.responsables } }).exec();
                }
                catch (error) {
                    console.log('Error buscando current responsables: ' + error);
                }
                if (currentResponsables) {
                    console.log("Se creará notificación de usuario para " + currentResponsables.length + " responsables actuales");
                    currentResponsables.forEach((responsable) => __awaiter(this, void 0, void 0, function* () {
                        let newNotificacion = responsable.notificaciones.create({
                            texto: "Nueva solicitud de participación en un nodo de solidaridad del que eres responsable",
                            causante: {
                                tipo: 'persona',
                                id: idUsuario
                            },
                            elementoTarget: {
                                tipo: 'nodoAtlasSolidaridad',
                                id: elObjetivo.id
                            },
                        });
                        responsable.notificaciones.push(newNotificacion);
                        try {
                            yield responsable.save();
                            const pubsub = contexto.pubsub;
                            pubsub.publish(Usuarios_1.NUEVA_NOTIFICACION_PERSONAL, { idNotificado: responsable.id, nuevaNotificacion: newNotificacion });
                        }
                        catch (error) {
                            console.log("Error guardando el responsable con nueva notificación: " + error);
                        }
                    }));
                }
                return elObjetivo;
            });
        },
        removeResponsableObjetivo: function (_, { idObjetivo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de remove un usuario con id ${idUsuario} de un objetivo de id ${idObjetivo}`);
                let credencialesUsuario = contexto.usuario;
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo)
                        throw "Objetivo no existía";
                }
                catch (error) {
                    console.log('Error buscando el objetivo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                const indexPosibleResponsable = elObjetivo.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elObjetivo.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                const indexResponsable = elObjetivo.responsables.indexOf(idUsuario);
                if (indexResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                    elObjetivo.responsables.splice(indexResponsable, 1);
                }
                console.log(`Usuario retirado de la lista de responsables`);
                try {
                    yield elObjetivo.save();
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Objetivo guardado`);
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elObjetivo.idForoResponsables, { miembros: elObjetivo.responsables });
                }
                catch (error) {
                    console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
                }
                elObjetivo.tipoNodo = 'objetivo';
                return elObjetivo;
            });
        },
        setEstadoObjetivo(_, { idObjetivo, nuevoEstado }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el objetivo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                    administradores = elObjetivo.responsables;
                }
                else {
                    var idParent = elObjetivo.nodoParent.idNodo;
                    var tipoParent = elObjetivo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de objetivo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elObjetivo.estadoDesarrollo = nuevoEstado;
                    console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log(`error guardando el objetivo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Estado guardado`);
                elObjetivo.tipoNodo = 'objetivo';
                return elObjetivo;
            });
        },
        setResponsablesSolicitadosObjetivo: function (_, { idObjetivo, nuevoCantidadResponsablesSolicitados }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Solicitud de set cantidad de responsables solicitados de ${nuevoCantidadResponsablesSolicitados} en objetivo con id ${idObjetivo}`);
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "objetivo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el objetivo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                if (!credencialesUsuario.permisos.includes("superadministrador") && !elObjetivo.responsables.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion editando responsables solicitados.`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elObjetivo.responsablesSolicitados = nuevoCantidadResponsablesSolicitados;
                try {
                    yield elObjetivo.save();
                }
                catch (error) {
                    console.log(`Error guardando el objetivo: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Retornando con ${elObjetivo.responsablesSolicitados} responsables solicitados`);
                elObjetivo.tipoNodo = 'objetivo';
                return elObjetivo;
            });
        },
        setPosicionObjetivo(_, { idObjetivo, nuevaPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Guardando posicion de objetivo en el diagrama del proyecto`);
                const credencialesUsuario = contexto.usuario;
                try {
                    var elObjetivo = yield Objetivo_1.ModeloObjetivo.findById(idObjetivo).exec();
                    if (!elObjetivo) {
                        throw "Objetivo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el objetivo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elObjetivo.nodoParent || !elObjetivo.nodoParent.idNodo || !elObjetivo.nodoParent.tipo) {
                    administradores = elObjetivo.responsables;
                }
                else {
                    var idParent = elObjetivo.nodoParent.idNodo;
                    var tipoParent = elObjetivo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elObjetivo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de objetivo`);
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
        crearTrabajo(_, { idProyecto, posicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo trabajo en el proyecto con id ${idProyecto}`);
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`Creando un foro para este trabajo`);
                try {
                    var nuevoForo = yield Foro_1.ModeloForo.create({
                        acceso: "privado",
                        miembros: [],
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
                    var nuevoTrabajo = yield new Trabajo_1.ModeloTrabajo({ idProyectoParent: idProyecto, idForoResponsables: idNuevoForo, diagramaProyecto: { posicion } });
                    var idNuevoTrabajo = nuevoTrabajo._id;
                    yield nuevoTrabajo.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elProyecto.idsTrabajos.push(idNuevoTrabajo);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                return idNuevoTrabajo;
            });
        },
        eliminarTrabajo(_, { idTrabajo, idProyecto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un trabajo con id ${idTrabajo} de un proyecto con id ${idProyecto}`);
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
                    yield Trabajo_1.ModeloTrabajo.findByIdAndDelete(idTrabajo);
                    yield Proyecto_1.ModeloProyecto.findByIdAndUpdate(idProyecto, { $pull: { idsTrabajos: idTrabajo } });
                }
                catch (error) {
                    console.log("Error eliminando trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        editarNombreTrabajo(_, { idTrabajo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del trabajo con id ${idTrabajo}`);
                const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreTrabajo.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                    administradores = elTrabajo.responsables;
                }
                else {
                    var idParent = elTrabajo.nodoParent.idNodo;
                    var tipoParent = elTrabajo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elTrabajo.nombre = nuevoNombre;
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                console.log(`Nombre cambiado`);
                elTrabajo.tipoNodo = 'trabajo';
                return elTrabajo;
            });
        },
        editarDescripcionTrabajo(_, { idTrabajo, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                    administradores = elTrabajo.responsables;
                }
                else {
                    var idParent = elTrabajo.nodoParent.idNodo;
                    var tipoParent = elTrabajo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando descripció de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionTrabajo.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    elTrabajo.descripcion = nuevoDescripcion;
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                elTrabajo.tipoNodo = 'trabajo';
                return elTrabajo;
            });
        },
        editarKeywordsTrabajo(_, { idProyecto, idTrabajo, nuevoKeywords }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                    administradores = elTrabajo.responsables;
                }
                else {
                    var idParent = elTrabajo.nodoParent.idNodo;
                    var tipoParent = elTrabajo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosKeywordsTrabajo = /[^ a-zA-Zñ,]/;
                if (charProhibidosKeywordsTrabajo.test(nuevoKeywords)) {
                    throw new apollo_server_express_1.ApolloError("Keywords ilegal");
                }
                nuevoKeywords = nuevoKeywords.trim();
                try {
                    elTrabajo.keywords = nuevoKeywords;
                    console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                }
                console.log(`Keywords guardado`);
                return elTrabajo;
            });
        },
        addResponsableTrabajo: function (_, { idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo)
                        throw "Trabajo no existía";
                }
                catch (error) {
                    console.log('Error buscando el trabajo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                //Authorización
                if (elTrabajo.responsables.length > 0 && !credencialesUsuario.permisos.includes("superadministrador") && !elTrabajo.responsables.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion. Hay ${elTrabajo.responsables.length} responsables: ${elTrabajo.responsables}`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (elTrabajo.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este trabajo`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                let indexPosibleResponsable = elTrabajo.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elTrabajo.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                else {
                    if (elTrabajo.responsables.length > 0) {
                        console.log(`Error. Se intentaba add como responsable un usuario que no estaba en la lista de posibles responsables.`);
                        throw new apollo_server_express_1.UserInputError("El usuario no estaba en la lista de espera para responsables.");
                    }
                }
                try {
                    elTrabajo.responsables.push(idUsuario);
                    if (elTrabajo.responsablesSolicitados > 0)
                        elTrabajo.responsablesSolicitados--;
                    console.log(`Usuario añadido a la lista de responsables`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Trabajo guardado`);
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elTrabajo.idForoResponsables, { miembros: elTrabajo.responsables });
                }
                catch (error) {
                    console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
                }
                elTrabajo.tipoNodo = 'trabajo';
                return elTrabajo;
            });
        },
        addPosibleResponsableTrabajo: function (_, { idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del trabajo ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion añadiendo posible responsable del trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (elTrabajo.posiblesResponsables.includes(idUsuario) || elTrabajo.responsables.includes(idUsuario)) {
                    console.log(`el usuario ya estaba en la lista`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba en la lista");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    elTrabajo.posiblesResponsables.push(idUsuario);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Trabajo guardado`);
                elTrabajo.tipoNodo = 'trabajo';
                //Crear notificacion para los responsables actuales del trabajo
                try {
                    var currentResponsables = yield Usuario_1.ModeloUsuario.find({ _id: { $in: elTrabajo.responsables } }).exec();
                }
                catch (error) {
                    console.log('Error buscando current responsables: ' + error);
                }
                if (currentResponsables) {
                    console.log("Se creará notificación de usuario para " + currentResponsables.length + " responsables actuales");
                    currentResponsables.forEach((responsable) => __awaiter(this, void 0, void 0, function* () {
                        let newNotificacion = responsable.notificaciones.create({
                            texto: "Nueva solicitud de participación en un nodo de solidaridad del que eres responsable",
                            causante: {
                                tipo: 'persona',
                                id: idUsuario
                            },
                            elementoTarget: {
                                tipo: 'nodoAtlasSolidaridad',
                                id: elTrabajo.id
                            },
                        });
                        responsable.notificaciones.push(newNotificacion);
                        try {
                            yield responsable.save();
                            const pubsub = contexto.pubsub;
                            pubsub.publish(Usuarios_1.NUEVA_NOTIFICACION_PERSONAL, { idNotificado: responsable.id, nuevaNotificacion: newNotificacion });
                        }
                        catch (error) {
                            console.log("Error guardando el responsable con nueva notificación: " + error);
                        }
                    }));
                }
                return elTrabajo;
            });
        },
        removeResponsableTrabajo: function (_, { idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de remove un usuario con id ${idUsuario} de un trabajo de id ${idTrabajo}`);
                let credencialesUsuario = contexto.usuario;
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo)
                        throw "Trabajo no existía";
                }
                catch (error) {
                    console.log('Error buscando el trabajo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                const indexPosibleResponsable = elTrabajo.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elTrabajo.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                const indexResponsable = elTrabajo.responsables.indexOf(idUsuario);
                if (indexResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                    elTrabajo.responsables.splice(indexResponsable, 1);
                }
                console.log(`Usuario retirado de la lista de responsables`);
                try {
                    yield elTrabajo.save();
                    yield elUsuario.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Trabajo guardado`);
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elTrabajo.idForoResponsables, { miembros: elTrabajo.responsables });
                }
                catch (error) {
                    console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
                }
                elTrabajo.tipoNodo = 'trabajo';
                return elTrabajo;
            });
        },
        setEstadoTrabajo(_, { idTrabajo, nuevoEstado }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                    administradores = elTrabajo.responsables;
                }
                else {
                    var idParent = elTrabajo.nodoParent.idNodo;
                    var tipoParent = elTrabajo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elTrabajo.estadoDesarrollo = nuevoEstado;
                    console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Estado guardado`);
                elTrabajo.tipoNodo = 'trabajo';
                return elTrabajo;
            });
        },
        setResponsablesSolicitadosTrabajo: function (_, { idTrabajo, nuevoCantidadResponsablesSolicitados }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Solicitud de set cantidad de responsables solicitados de ${nuevoCantidadResponsablesSolicitados} en trabajo con id ${idTrabajo}`);
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                if (!credencialesUsuario.permisos.includes("superadministrador") && !elTrabajo.responsables.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion editando responsables solicitados.`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elTrabajo.responsablesSolicitados = nuevoCantidadResponsablesSolicitados;
                try {
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`Error guardando el trabajo: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Retornando con ${elTrabajo.responsablesSolicitados} responsables solicitados`);
                elTrabajo.tipoNodo = 'trabajo';
                return elTrabajo;
            });
        },
        setPosicionTrabajo(_, { idTrabajo, nuevaPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Guardando posicion de trabajo en el diagrama del proyecto`);
                const credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo) {
                        throw "Trabajo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = [];
                if (!elTrabajo.nodoParent || !elTrabajo.nodoParent.idNodo || !elTrabajo.nodoParent.tipo) {
                    administradores = elTrabajo.responsables;
                }
                else {
                    var idParent = elTrabajo.nodoParent.idNodo;
                    var tipoParent = elTrabajo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${elTrabajo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    administradores = elNodoParent.responsables;
                }
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de trabajo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elTrabajo.coords = nuevaPosicion;
                    yield elTrabajo.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                }
                return elTrabajo;
            });
        },
        crearObjetivoEnProyecto(_, { idProyecto, posicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo objetivo en el proyecto con id ${idProyecto}`);
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                //Authorización
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var nuevoObjetivo = elProyecto.objetivos.create({
                        coords: posicion
                    });
                    elProyecto.objetivos.push(nuevoObjetivo);
                    yield elProyecto.save();
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
                elProyecto.objetivos.pull({ id: idObjetivo });
                try {
                    yield elProyecto.save();
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
                var elObjetivo = elProyecto.objetivos.id(idObjetivo);
                try {
                    elObjetivo.nombre = nuevoNombre;
                    yield elProyecto.save();
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
                var elObjetivo = elProyecto.objetivos.id(idObjetivo);
                try {
                    elObjetivo.descripcion = nuevoDescripcion;
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elProyecto.save();
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
                var elObjetivo = elProyecto.objetivos.id(idObjetivo);
                try {
                    elObjetivo.keywords = nuevoKeywords;
                    console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el objetivo modificado: ${error}`);
                }
                console.log(`Keywords guardado`);
                return elObjetivo;
            });
        },
        addResponsableObjetivoProyecto: function (_, { idProyecto, idObjetivo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un objetivo de id ${idObjetivo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                //Authorización
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elObjetivo = elProyecto.objetivos.id(idObjetivo);
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                if (elObjetivo.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este objetivo`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                let indexPosibleResponsable = elObjetivo.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elObjetivo.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                try {
                    elObjetivo.responsables.push(idUsuario);
                    if (elObjetivo.responsablesSolicitados > 0)
                        elObjetivo.responsablesSolicitados--;
                    console.log(`Usuario añadido a la lista de responsables`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Objetivo guardado`);
                return elObjetivo;
            });
        },
        addPosibleResponsableObjetivoProyecto: function (_, { idProyecto, idObjetivo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del objetivo ${idObjetivo}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                //Authorización
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elObjetivo = elProyecto.objetivos.id(idObjetivo);
                if (elObjetivo.posiblesResponsables.includes(idUsuario) || elObjetivo.responsables.includes(idUsuario)) {
                    console.log(`el usuario ya estaba en la lista`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba en la lista");
                }
                try {
                    var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario).exec();
                    if (!elUsuario) {
                        console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                        throw new apollo_server_express_1.ApolloError("Error buscando al usuario en la base de datos");
                    }
                }
                catch (error) {
                    console.log("Error buscando al usuario en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                console.log(`Objetivo guardado`);
                return elObjetivo;
            });
        },
        setPosicionObjetivoProyecto: function (_, { idProyecto, idObjetivo, nuevaPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de set posicion de objetivo en el diagrama del proyecto`);
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
                    console.log(`Error de autenticacion editando Descripcion de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elObjetivo = elProyecto.objetivos.id(idObjetivo);
                try {
                    elObjetivo.coords = nuevaPosicion;
                    yield elProyecto.save();
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
                var elObjetivo = elProyecto.objetivos.id(idObjetivo);
                try {
                    elObjetivo.estadoDesarrollo = nuevoEstado;
                    console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el objetivo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Estado guardado`);
                return elObjetivo;
            });
        },
        crearMaterialEnTrabajoSolidaridad(_, { idTrabajo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo material en el trabajo con id ${idTrabajo}`);
                //Authorización
                let credencialesUsuario = contexto.usuario;
                try {
                    var elTrabajo = yield Trabajo_1.ModeloTrabajo.findById(idTrabajo).exec();
                    if (!elTrabajo)
                        throw "Trabajo no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                const permisosEspeciales = ["superadministrador"];
                if (!credencialesUsuario.id || (!permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elTrabajo.responsables.includes(credencialesUsuario.id))) {
                    console.log(`Error de autenticación`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
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
        eliminarMaterialDeTrabajoSolidaridad(_, { idMaterial, idTrabajo }, contexto) {
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
    },
    NodoDeTrabajos: {
        __resolveType(nodo) {
            if (nodo.tipoNodo === "trabajo") {
                return "Trabajo";
            }
            else if (nodo.tipoNodo === "objetivo") {
                return "Objetivo";
            }
        },
    },
    Trabajo: {
        administradores(nodo) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!nodo.nodoParent || !nodo.nodoParent.idNodo || !nodo.nodoParent.tipo) {
                    return nodo.responsables;
                }
                else {
                    var idParent = nodo.nodoParent.idNodo;
                    var tipoParent = nodo.nodoParent.tipo;
                    var elNodoParent = null;
                    do {
                        try {
                            elNodoParent = null;
                            if (tipoParent === 'trabajo') {
                                elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(idParent);
                            }
                            else if (tipoParent === 'objetivo') {
                                elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(idParent);
                            }
                            if (!elNodoParent)
                                throw "Nodo parent no encontrado";
                        }
                        catch (error) {
                            console.log(`Error buscando el nodo parent de ${nodo.nombre}: ${elNodoParent}`);
                            throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                        }
                        if (elNodoParent.nodoParent) {
                            idParent = elNodoParent.nodoParent.idNodo;
                            tipoParent = elNodoParent.nodoParent.tipo;
                        }
                    } while (elNodoParent.responsables.length < 1 && elNodoParent.nodoParent && elNodoParent.nodoParent.idNodo && elNodoParent.nodoParent.tipo);
                    return elNodoParent.responsables;
                }
            });
        }
    },
    Objetivo: {
        administradores(nodo) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!nodo.nodoParent || !nodo.nodoParent.idNodo || !nodo.nodoParent.tipo) {
                    return nodo.responsables;
                }
                else {
                    try {
                        var elNodoParent = null;
                        if (nodo.nodoParent.tipo === 'trabajo') {
                            elNodoParent = yield Trabajo_1.ModeloTrabajo.findById(nodo.nodoParent.idNodo);
                        }
                        else if (nodo.nodoParent.tipo === 'objetivo') {
                            elNodoParent = yield Objetivo_1.ModeloObjetivo.findById(nodo.nodoParent.idNodo);
                        }
                        if (!elNodoParent)
                            throw "Nodo parent no encontrado";
                    }
                    catch (error) {
                        console.log(`Error buscando el nodo parent: ${elNodoParent}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    return elNodoParent.responsables;
                }
            });
        }
    }
};
