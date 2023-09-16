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
exports.intervaloPosicionamiento = exports.getResponsablesAmplioNodo = exports.resolvers = exports.idAtlasSolidaridad = exports.timerPosicionamiento = exports.NODOS_ATLAS_POSICIONADOS = exports.NODOS_FAMILY_ELIMINADOS = exports.NODO_FAMILY_ELIMINADO = exports.NODO_FAMILY_EDITADO = exports.NODOS_ELIMINADOS = exports.NODO_ELIMINADO = exports.NODO_EDITADO = exports.typeDefs = void 0;
const apollo_server_express_1 = require("apollo-server-express");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const AdministracionAtlasSolidaridad_1 = require("../model/atlasSolidaridad/AdministracionAtlasSolidaridad");
const Usuario_1 = require("../model/Usuario");
const control_1 = require("../control");
const NodoSolidaridad_1 = require("../model/atlasSolidaridad/NodoSolidaridad");
const Evento_1 = require("../model/Evento");
const charProhibidosDescripcion = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;
const charProhibidosTexto = /[^\n\r a-zA-ZÀ-ž0-9_()":;.,+¡!¿?@=-]/;
exports.typeDefs = apollo_server_express_1.gql `    

    input NodoSolidaridadInput{        
        tipoNodo:String,
        nombre: String,        
        coords:CoordsInput,
        vinculos:[vinculoInput]
    }    

    
    type InfoNodoSolidaridad{
        idNodo: ID        
        tipoNodo:String,
    }     

    type ItemsAdministracionNodoSolidaridad{
        movimientosDinero:[MovimientoDineroNodoSolidaridad]
    }

    type MovimientoDineroNodoSolidaridad{
        id: ID,
        fecha:Date,
        articulo: String,
        unidad:String,
        movimientoUnitario:Float,
        cantidad:Int,
        movimientoTotal:Float,   
        realizado:Boolean, 
        informacion:String,            
    }

    type EventoNodoSolidaridad{
        id: ID,
        fecha: Date,
        nombre: String,
        tipo:String,
        descripcion: String,
    }

    type RecursoExternoNodoSolidaridad{
        id: ID!, 
        nombre: String,
        descripcion: String,
        link: String,
        tipo: String
    }

   type NodoSolidaridad{
       id: ID,       
       nombre: String,
       descripcion:String,
       tipoNodo:String,
       recursosExternos: [RecursoExternoNodoSolidaridad], 
       responsables: [String],
       responsablesAmplio:[String],
       posiblesResponsables:[String],
       administradores:[String],
       responsablesSolicitados:Int,
       nodoParent:ID,
       tipoParent:String,   
       publicitado:Boolean,
       idForoResponsables:ID,       
       vinculos:[VinculoNodoSolidaridad],
       keywords:String,       
       estadoDesarrollo:String,
       movimientosDinero:[MovimientoDineroNodoSolidaridad],
       eventos: [EventoNodoSolidaridad]
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
       fuerzaColision: FuerzaPolar,
       fuerzaCentroMasa: FuerzaPolar
   }   

   type VinculoNodoSolidaridad{
        id:ID,
        idRef:ID,
        tipo:String,        
    }
    type ResultadoCrearNodoSolidaridadUnderNodo{
        nodosModificados: [NodoSolidaridad],
        nuevoNodo:NodoSolidaridad,
        usuariosModificados: [Usuario],
    }

    type ResultadoOperacionNodosAtlas{
        nodosModificados:[NodoSolidaridad],
        usuariosModificados:[Usuario],
    }

    type NodoAtlasSolidaridad{
        nodoSolidaridad: NodoSolidaridad,
        persona: Usuario
    }

    input InfoNodoDeAtlasSolidaridad{
        id: ID,
        tipo:String,
    }

    type NodosAtlasSolidaridadByType{
        nodosSolidaridad:[NodoSolidaridad],
        personas: [Usuario]
    }

    input vinculoInput{
    id:ID,
    tipo: String,
    idRef: ID,    
    }
   
   extend type Query{    
    nodosSolidaridad:[NodoSolidaridad],
    nodosSolidaridadPublicitados:[NodoSolidaridad],
    personas:[Usuario],        
    nodoSolidaridad(idNodo: ID!):NodoSolidaridad,
    nodosSolidaridadUsuario(idUsuario:ID!, incluirCompletados: Boolean):[NodoSolidaridad],    
    nodosSolidaridadByIds(idsNodos:[ID!]):[NodoSolidaridad],    
    nodosSolidaridadSegunCentro(centro:CoordsInput!, radio: Int!):[NodoSolidaridad],
    nodosSolidaridadRecursiveChildrenDeNodo(idParent:ID!):[NodoSolidaridad],
    nodosSolidaridadUnderNodo(idParent:ID!):[NodoSolidaridad],
    nodoAtlasSolidaridadByIdAndTipo(idNodo:ID!, tipoNodo:String!):NodoAtlasSolidaridad
    todosNodosSolidaridad:[NodoSolidaridad],
    nodosSolidaridadPropios:[NodoSolidaridad],
    nodosSolidaridadRoot:[NodoSolidaridad],
    nodosSolidaridadPropiosAndRoot:[NodoSolidaridad],
    nodosSolidaridadByNivel(nivel:Int!):[NodoSolidaridad],
    busquedaAmpliaNodosSolidaridad(textoBuscado:String!):[NodoSolidaridad],    
    posicionarNodosSolidaridadByFuerzas(ciclos:Int!):Boolean,

    relacionesNodosAtlasByIds(infoNodos: [InfoNodoDeAtlasSolidaridad!]!):NodosAtlasSolidaridadByType

    getItemsAdministracionNodosSolidaridadUnderParent(idNodoParent: ID!):ItemsAdministracionNodoSolidaridad

   }

   extend type Mutation{    
    

    crearNodoSolidaridad(infoNodo:NodoSolidaridadInput!):NodoSolidaridad,
    crearNuevoNodoSolidaridadUnderNodo(infoNodo:NodoSolidaridadInput!, idNodoParent:ID!, tipoParent:String!): ResultadoCrearNodoSolidaridadUnderNodo,
    eliminarNodoSolidaridad(idNodo:ID!):Boolean,
    editarNombreNodoSolidaridad(idNodo:ID!, nuevoNombre: String!):NodoSolidaridad,
    editarDescripcionNodoSolidaridad(idNodo:ID!, nuevoDescripcion: String!):NodoSolidaridad,
    editarKeywordsNodoSolidaridad(idNodo:ID!, nuevoKeywords: String!):NodoSolidaridad,
    usuarioEntrarResponsableNodoSolidaridad(idNodo:ID!):NodoSolidaridad,
    addResponsableNodoSolidaridad(idNodo:ID!,idUsuario:ID!):NodoSolidaridad,
    addPosibleResponsableNodoSolidaridad(idNodo:ID!, idUsuario:ID!):NodoSolidaridad,
    removeResponsableNodoSolidaridad(idNodo:ID!, idUsuario:ID!):NodoSolidaridad,
    setEstadoNodoSolidaridad(idNodo:ID!, nuevoEstado:String!):NodoSolidaridad,    
    setPosicionNodoSolidaridad(idNodo:ID!, nuevaPosicion:CoordsInput):NodoSolidaridad,
    deleteRequerimentoNodosAtlasSolidaridad(idNodoRequiriente:ID!, tipoRequiriente:String!, idNodoRequerido: ID!):ResultadoOperacionNodosAtlas,
    crearRequerimentoEntreNodosAtlasSolidaridad(idNodoRequiriente:ID!, tipoRequiriente:String!, idNodoRequerido:ID!):ResultadoOperacionNodosAtlas,
    crearParentingEntreNodosAtlasSolidaridad(idNodoRequiriente:ID!, tipoRequiriente: String!, idNodoRequerido:ID!):ResultadoOperacionNodosAtlas,
    transferirRequerimentoBetweenNodosSolidaridad(idNodoRequerido: ID!, idNodoSource: ID!, tipoNodoSource: String, idNodoTarget: ID!, tipoNodoTarget: String!, index: Int):ResultadoOperacionNodosAtlas
    setPublicitadoNodoSolidaridad(idNodo:ID!, nuevoEstado:Boolean!):NodoSolidaridad,

    crearRecursoExternoNodoSolidaridad(idNodo:ID!):RecursoExternoNodoSolidaridad,
    eliminarRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno:ID!):Boolean,
    editarDatosRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno:ID!, nuevoNombre: String!, nuevoDescripcion:String, nuevoLink: String!):RecursoExternoNodoSolidaridad,
    editarNombreRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno: ID!, nuevoNombre: String!):RecursoExternoNodoSolidaridad,
    editarDescripcionRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno: ID!, nuevoDescripcion: String!):RecursoExternoNodoSolidaridad,
    editarLinkRecursoExternoNodoSolidaridad(idNodo:ID!, idRecursoExterno: ID!, nuevoLink: String!):RecursoExternoNodoSolidaridad,    

    crearNuevoMovimientoDineroNodoSolidaridad(idNodo:ID!):MovimientoDineroNodoSolidaridad,
    eliminarMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!):Boolean,
    editarArticuloMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!, nuevoArticulo: String!):MovimientoDineroNodoSolidaridad,
    editarFechaMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!, nuevoFecha: Date!):MovimientoDineroNodoSolidaridad,
    editarInformacionMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!, nuevoInformacion: String!):MovimientoDineroNodoSolidaridad,
    editarCantidadMovimientoDineroNodoSolidaridad(idNodo: ID!, idMovimientoDinero:ID!, nuevoCantidad:Float!):MovimientoDineroNodoSolidaridad,
    editarMovimientoUnitarioMovimientoDineroNodoSolidaridad(idNodo: ID!, idMovimientoDinero:ID!, nuevoMovimientoUnitario:Float!):MovimientoDineroNodoSolidaridad,
    editarMovimientoTotalMovimientoDineroNodoSolidaridad(idNodo: ID!, idMovimientoDinero:ID!, nuevoMovimientoTotal:Float!):MovimientoDineroNodoSolidaridad,
    editarNumerosMovimientoDineroNodoSolidaridad(idNodo: ID!, idMovimientoDinero:ID!, nuevoMovimientoTotal:Float!, nuevoMovimientoUnitario: Float!, nuevoCantidad:Float!):MovimientoDineroNodoSolidaridad,
    setRealizadoMovimientoDineroNodoSolidaridad(idNodo:ID!, idMovimientoDinero: ID!, nuevoRealizado:Boolean!):MovimientoDineroNodoSolidaridad,

    crearNuevoEventoNodoSolidaridad(idNodo:ID!):EventoNodoSolidaridad,
    eliminarEventoNodoSolidaridad(idNodo:ID!, idEvento: ID!):Boolean,
    editarNombreEventoNodoSolidaridad(idNodo:ID!, idEvento: ID!, nuevoNombre: String!):EventoNodoSolidaridad,
    editarFechaEventoNodoSolidaridad(idNodo:ID!, idEvento: ID!, nuevoFecha: Date!):EventoNodoSolidaridad,
    editarDescripcionEventoNodoSolidaridad(idNodo:ID!, idEvento: ID!, nuevoDescripcion: String!):EventoNodoSolidaridad

   }

   extend type Subscription{
        nodoEditado(centro:CoordsInput!, radio:Int!):NodoSolidaridad
        nodoEliminado(centro:CoordsInput!, radio:Int!):ID,
        nodosEliminados:[ID],
        nodoSolidaridadFamilyEditado(idNodoParent:ID!):NodoSolidaridad,
        nodoSolidaridadFamilyEliminado(idNodoParent:ID!):ID,
        nodosSolidaridadFamilyEliminados(idNodoParent:ID!):[ID],

        nodosAtlasPosicionados(idAtlas:ID!):ID,
   }

`;
exports.NODO_EDITADO = "nodo_solidaridad_editado";
exports.NODO_ELIMINADO = "nodo_solidaridad_eliminado";
exports.NODOS_ELIMINADOS = "nodos_solidaridad_eliminados";
exports.NODO_FAMILY_EDITADO = "nodo_solidaridad_family_editado";
exports.NODO_FAMILY_ELIMINADO = "nodo_solidaridad_family_eliminado";
exports.NODOS_FAMILY_ELIMINADOS = "nodos_solidaridad_family_eliminados";
exports.NODOS_ATLAS_POSICIONADOS = "nodos_de_atlas_posicionados";
exports.timerPosicionamiento = null;
exports.idAtlasSolidaridad = "61ea0b0f17a5d80da7e94320";
exports.resolvers = {
    Subscription: {
        nodoEditado: {
            subscribe: graphql_subscriptions_1.withFilter((_, { centro, radio }, contexto) => {
                return contexto.pubsub.asyncIterator(exports.NODO_EDITADO);
            }, (nodoEditado, variables, contexto) => {
                if (variables.radio === 0) {
                    return true;
                }
                if (nodoEditado.nodoEditado.coords.x > variables.centro.x + variables.radio || nodoEditado.nodoEditado.coords.x < variables.centro.x - variables.radio || nodoEditado.nodoEditado.coords.y > variables.centro.y + variables.radio || nodoEditado.nodoEditado.coords.y < variables.centro.y - variables.radio) {
                    return false;
                }
                return true;
            })
        },
        nodoEliminado: {
            subscribe: graphql_subscriptions_1.withFilter((_, { centro, radio }, contexto) => {
                return contexto.pubsub.asyncIterator(exports.NODO_ELIMINADO);
            }, (nodoEliminado, variables, contexto) => {
                var elNodoEliminado = nodoEliminado.elNodoEliminado;
                var idNodoEliminado = nodoEliminado.nodoEliminado;
                if (variables.radio === 0) {
                    return true;
                }
                if (elNodoEliminado.coords.x > variables.centro.x + variables.radio || elNodoEliminado.coords.x < variables.centro.x - variables.radio || elNodoEliminado.coords.y > variables.centro.y + variables.radio || elNodoEliminado.coords.y < variables.centro.y - variables.radio) {
                    return false;
                }
                return true;
            })
        },
        nodosEliminados: {
            subscribe: graphql_subscriptions_1.withFilter((_, __, contexto) => {
                return contexto.pubsub.asyncIterator(exports.NODOS_ELIMINADOS);
            }, ({ nodosEliminados }, variables, contexto) => {
                return true;
            })
        },
        nodoSolidaridadFamilyEditado: {
            subscribe: graphql_subscriptions_1.withFilter((_, { idNodoParent }, contexto) => {
                return contexto.pubsub.asyncIterator(exports.NODO_FAMILY_EDITADO);
            }, (nodoEditado, variables, contexto) => __awaiter(void 0, void 0, void 0, function* () {
                var elNodoEditado = nodoEditado.nodoSolidaridadFamilyEditado;
                var idParentFamily = variables.idNodoParent;
                if (elNodoEditado.id === idParentFamily)
                    return true;
                var idCurrent = elNodoEditado.nodoParent;
                var cuenta = 0;
                while (cuenta < 1000 && idCurrent) {
                    if (idCurrent === idParentFamily) {
                        return true;
                    }
                    //Este no es child de parentFamily, continuar
                    try {
                        var elProximo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idCurrent).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando parent: ${error}`);
                        return false;
                    }
                    idCurrent = elProximo.nodoParent;
                }
                return false;
            }))
        },
        nodoSolidaridadFamilyEliminado: {
            subscribe: graphql_subscriptions_1.withFilter((_, { idNodoParent }, contexto) => {
                return contexto.pubsub.asyncIterator(exports.NODO_FAMILY_ELIMINADO);
            }, (nodoEliminado, variables, contexto) => __awaiter(void 0, void 0, void 0, function* () {
                var elNodoEliminado = nodoEliminado.elNodoEliminado;
                var idParentFamily = variables.idNodoParent;
                if (elNodoEliminado.id === idParentFamily)
                    return true;
                var idCurrent = elNodoEliminado.nodoParent;
                var cuenta = 0;
                while (cuenta < 1000 && idCurrent) {
                    if (idCurrent === idParentFamily) {
                        return true;
                    }
                    //Este no es child de parentFamily, continuar
                    try {
                        var elProximo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idCurrent).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando parent: ${error}`);
                        return false;
                    }
                    idCurrent = elProximo.nodoParent;
                }
                return false;
            }))
        },
        nodosSolidaridadFamilyEliminados: {
            subscribe: graphql_subscriptions_1.withFilter((_, { idNodoParent }, contexto) => {
                return contexto.pubsub.asyncIterator(exports.NODOS_FAMILY_ELIMINADOS);
            }, ({ primerEliminado }, variables, contexto) => __awaiter(void 0, void 0, void 0, function* () {
                var idParentFamily = variables.idNodoParent;
                if (primerEliminado.id === idParentFamily)
                    return true;
                var idCurrent = primerEliminado.nodoParent;
                var cuenta = 0;
                while (cuenta < 1000 && idCurrent) {
                    if (idCurrent === idParentFamily) {
                        return true;
                    }
                    //Este no es child de parentFamily, continuar
                    try {
                        var elProximo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idCurrent).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando parent: ${error}`);
                        return false;
                    }
                    idCurrent = elProximo.nodoParent;
                }
                return false;
            }))
        },
        nodosAtlasPosicionados: {
            subscribe: graphql_subscriptions_1.withFilter((_, { idAtlas }, contexto) => {
                return contexto.pubsub.asyncIterator(exports.NODOS_ATLAS_POSICIONADOS);
            }, ({ nodosAtlasPosicionados }, { idAtlas }, contexto) => {
                if (nodosAtlasPosicionados === idAtlas) {
                    return true;
                }
                return false;
            })
        }
    },
    Query: {
        nodoSolidaridad: function (_, { idNodo }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no existía";
                    }
                }
                catch (error) {
                    console.log(`error buscando un nodo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return elNodo;
            });
        },
        nodosSolidaridadPublicitados: function (_, __, context) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    var losNodos = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ publicitado: true }).exec();
                }
                catch (error) {
                    console.log(`error buscando nodos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return losNodos;
            });
        },
        nodosSolidaridadUsuario: function (_, { idUsuario, incluirCompletados }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('Peticion de nodos de solidaridad de los cuales es responsable el usuario con id ' + idUsuario);
                console.log(`Incluir completados: ${incluirCompletados}`);
                try {
                    var condicion = { "responsables": { $in: idUsuario } };
                    if (!incluirCompletados) {
                        condicion.estadoDesarrollo = "noCompletado";
                    }
                    var losNodos = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find(condicion).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodos de usuario. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losNodos.length} nodos de usuario`);
                return losNodos;
            });
        },
        nodosSolidaridadSegunCentro: function (_, { centro, radio }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Nodos alrededor de un centro ${JSON.stringify(centro)} con radio ${radio} solicitados`);
                try {
                    var losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ "coords.x": { $gt: centro.x - radio, $lt: centro.x + radio }, "coords.y": { $gt: centro.y - radio, $lt: centro.y + radio } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`${losNodosSolidaridad.length} nodosSolidaridad encontrados.`);
                return losNodosSolidaridad;
            });
        },
        nodosSolidaridadRecursiveChildrenDeNodo: function (_, { idParent }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Nodos solidaridad children recursivamente de ${idParent} solicitados`);
                try {
                    var losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var nodosChildren = losNodosSolidaridad.filter(n => {
                    var cuenta = 0;
                    var idCurrentParent = n.nodoParent;
                    while (cuenta < 1000 && idCurrentParent) {
                        cuenta++;
                        if (idCurrentParent === idParent) {
                            return true;
                        }
                        var nodoCurrentParent = losNodosSolidaridad.find(n => n.id === idCurrentParent);
                        if (!nodoCurrentParent) {
                            console.log(`Nodo con nodoParent no existente`);
                        }
                        idCurrentParent = nodoCurrentParent.nodoParent;
                    }
                    return false;
                });
                return nodosChildren;
            });
        },
        nodosSolidaridadUnderNodo: function (_, { idParent }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Nodos solidaridad under ${idParent} solicitados`);
                try {
                    var elNodoParent = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idParent).exec();
                }
                catch (error) {
                    console.log(`Error buscando el nodoParent: ${error}`);
                    throw new apollo_server_express_1.UserInputError("Datos inválidos");
                }
                var idsRequeridosParent = elNodoParent.vinculos.map(v => v.idRef);
                try {
                    var losNodosUnder = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ "_id": { $in: idsRequeridosParent } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losNodosUnder.length} nodos under`);
                return losNodosUnder;
            });
        },
        todosNodosSolidaridad: function (_, ___, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Todos nodos solidaridad solicitados`);
                try {
                    var losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({}).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`${losNodosSolidaridad.length} nodosSolidaridad encontrados.`);
                return losNodosSolidaridad;
            });
        },
        nodosSolidaridadByNivel: function (_, { nivel }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Todos nodos solidaridad hasta el nivel ${nivel} solicitados`);
                const minNivel = 1;
                if (nivel < minNivel)
                    nivel = minNivel;
                try {
                    var losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ nodoParent: null }).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                for (var i = 1; i < nivel; i++) {
                    console.log(`FALTA PROGRAMAR LA LOGICA DE LOS SIGUIENTES NIVELES`);
                }
                console.log(`${losNodosSolidaridad.length} nodosSolidaridad hasta nivel ${nivel} encontrados.`);
                return losNodosSolidaridad;
            });
        },
        nodosSolidaridadPropios: function (_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Todos nodos solidaridad propios solicitados`);
                if (!contexto.usuario) {
                    console.log(`No habia info de logín`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ nodoParent: credencialesUsuario.id }).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad propios de ${credencialesUsuario.id}. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`${losNodosSolidaridad.length} nodosSolidaridad propios de ${credencialesUsuario.id} encontrados.`);
                return losNodosSolidaridad;
            });
        },
        nodoAtlasSolidaridadByIdAndTipo: function (_, { idNodo, tipoNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Nodo solidaridad de tipo ${tipoNodo} con id ${idNodo} solicitado`);
                if (!contexto.usuario) {
                    console.log(`No habia info de logín`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                var elNodo = null;
                try {
                    if (tipoNodo === 'usuario') {
                        elNodo = yield Usuario_1.ModeloUsuario.findById(idNodo).exec();
                    }
                    else {
                        elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var respuesta = null;
                if (tipoNodo === 'usuario') {
                    respuesta = {
                        persona: elNodo
                    };
                }
                else {
                    respuesta = {
                        nodoSolidaridad: elNodo
                    };
                }
                return respuesta;
            });
        },
        nodosSolidaridadRoot: function (_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Todos nodos solidaridad root solicitados`);
                if (!contexto.usuario) {
                    console.log(`No habia info de logín`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ nodoParent: null }).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad propios and root de ${credencialesUsuario.id}. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`${losNodosSolidaridad.length} nodosSolidaridad propios and root de ${credencialesUsuario.id} encontrados.`);
                return losNodosSolidaridad;
            });
        },
        nodosSolidaridadPropiosAndRoot: function (_, __, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Todos nodos solidaridad propios and root solicitados`);
                if (!contexto.usuario) {
                    console.log(`No habia info de logín`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                try {
                    var losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ $or: [{ nodoParent: credencialesUsuario.id }, { nodoParent: null }] }).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad propios and root de ${credencialesUsuario.id}. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`${losNodosSolidaridad.length} nodosSolidaridad propios and root de ${credencialesUsuario.id} encontrados.`);
                return losNodosSolidaridad;
            });
        },
        nodosSolidaridadByIds: function (_, { idsNodos }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                // console.log(`nodos solidaridad by id list solicitados`);
                // console.log(`idsNodos: ${idsNodos}`);
                var losNodosSolidaridad = [];
                try {
                    if (!idsNodos) {
                        losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ nodoParent: null }).exec();
                    }
                    else {
                        losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ "_id": { $in: idsNodos } }).exec();
                    }
                }
                catch (error) {
                    console.log(`Error buscando nodosSolidaridad. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return losNodosSolidaridad;
            });
        },
        busquedaAmpliaNodosSolidaridad: function (_, { textoBuscado }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`buscando nodos de solidaridad que contengan: ${textoBuscado}`);
                // console.log(`tipo de input: ${typeof (textoBuscado)}`);
                textoBuscado = textoBuscado.trim();
                textoBuscado = textoBuscado.replace(/[\n\r]/g, "");
                //Validar
                if (textoBuscado.length < 1) {
                    console.log(`No habia palabras buscadas`);
                }
                try {
                    var losNodosSolidaridad = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ estadoDesarrollo: "noCompletado", $text: { $search: textoBuscado } }, { score: { $meta: 'textScore' } }).collation({ locale: "en", strength: 1 }).select("nombre descripcion coords").sort({ score: { $meta: 'textScore' } }).limit(20).exec();
                }
                catch (error) {
                    console.log(". E: " + error);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return losNodosSolidaridad;
            });
        },
        relacionesNodosAtlasByIds: function (_, { infoNodos }, __) {
            return __awaiter(this, void 0, void 0, function* () {
                const idsPersonasSolicitados = infoNodos.filter(info => info.tipo === 'usuario').map(info => info.id);
                const idsNodosSolidaridadSolicitados = infoNodos.filter(info => info.tipo === 'nodoSolidaridad').map(info => info.id);
                console.log(`Query for nodos relacionados con las personas ${idsPersonasSolicitados} y los nodosSolidaridad: ${idsNodosSolidaridadSolicitados}`);
                try {
                    var losPersonasSolicitados = yield Usuario_1.ModeloUsuario.find({ "_id": { $in: idsPersonasSolicitados } }).exec();
                    var losNodosSolidaridadSolicitados = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ "_id": { $in: idsNodosSolidaridadSolicitados } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando solicitados for query relaciones: ${error}`);
                    throw new apollo_server_express_1.UserInputError("Datos inválidos");
                }
                var idsNodosSolidaridadRelacionados = [];
                var idsPersonasRelacionados = [];
                losPersonasSolicitados.concat(losNodosSolidaridadSolicitados).forEach(nodo => {
                    let idsVinculos = nodo.vinculos.map(v => v.idRef);
                    let nuevosIdsVinculos = idsVinculos.filter(iv => !idsNodosSolidaridadRelacionados.includes(iv));
                    idsNodosSolidaridadRelacionados = idsNodosSolidaridadRelacionados.concat(nuevosIdsVinculos);
                });
                losNodosSolidaridadSolicitados.forEach(nodoS => {
                    let idsResponsables = nodoS.responsables;
                    let nuevosIdsResponsables = idsResponsables.filter(ir => !idsPersonasRelacionados.includes(ir));
                    idsPersonasRelacionados = idsPersonasRelacionados.concat(nuevosIdsResponsables);
                });
                try {
                    var losNodosSolidaridadRelacionados = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ "_id": { $in: idsNodosSolidaridadRelacionados } }).exec();
                    var losPersonasRelacionados = yield Usuario_1.ModeloUsuario.find({ "_id": { $in: idsPersonasRelacionados } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando nodos relacionados. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Enviando ${losNodosSolidaridadRelacionados.length} nodosSolidaridad relacionados y ${losPersonasRelacionados.length} personas relacionadas`);
                return { personas: losPersonasRelacionados, nodosSolidaridad: losNodosSolidaridadRelacionados };
            });
        },
        getItemsAdministracionNodosSolidaridadUnderParent: function (_, { idNodoParent }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de items de administracion de nodos de solidaridad under ${idNodoParent}`);
                if (!contexto.usuario) {
                    console.log(`No logeado`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                try {
                    var elNodoParent = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoParent).exec();
                }
                catch (error) {
                    console.log(`Error buscando el nodo parent: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var cuenta = 0;
                var currentIdsNodosUnder = elNodoParent.vinculos.map(v => v.idRef);
                var currentNodos = [];
                var totalMovimientosDinero = [];
                while (currentIdsNodosUnder && currentIdsNodosUnder.length > 0) {
                    cuenta++;
                    if (cuenta > 1000) {
                        console.log(`Overflow de cuenta recogiendo itemsAdministracion `);
                    }
                    try {
                        currentNodos = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ "_id": { $in: currentIdsNodosUnder } }).exec();
                    }
                    catch (error) {
                        console.log(`Error recogiendo lista de nodosUnder: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                    let movimientosDinero = currentNodos.reduce((acc, cn) => acc.concat(cn.movimientosDinero), []);
                    totalMovimientosDinero = totalMovimientosDinero.concat(movimientosDinero);
                    let proximosIds = currentNodos.reduce((acc, cn) => acc.concat(cn.vinculos.map(v => v.idRef)), []);
                    currentIdsNodosUnder = proximosIds;
                }
                return {
                    movimientosDinero: totalMovimientosDinero
                };
            });
        },
        posicionarNodosSolidaridadByFuerzas(_, { ciclos }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de ejecutar un posicionamiento de nodos de solidaridad by fuerzas de ${ciclos} ciclos`);
                control_1.ejecutarPosicionamientoNodosSolidaridadByFuerzas(ciclos, Date.now(), true);
                console.log(`Terminado`);
                return true;
            });
        }
    },
    Mutation: {
        setPosicionNodoSolidaridad(_, { idNodo, nuevaPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Guardando posicion de nodo en el diagrama del grupo`);
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = yield getAdministradoresNodo(elNodo);
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de nodo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elNodo.coords = nuevaPosicion;
                    elNodo.autoCoords = nuevaPosicion;
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodo modificado: ${error}`);
                }
                return elNodo;
            });
        },
        crearNuevoNodoSolidaridadUnderNodo(_, { infoNodo, idNodoParent, tipoParent }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de crear un nodo de solidaridad bajo el nodo con id ${idNodoParent} de tipo ${tipoParent}`);
                if (!contexto.usuario) {
                    throw new apollo_server_express_1.AuthenticationError("Usuario no logeado");
                }
                const credencialesUsuario = contexto.usuario;
                var nuevoNodo = new NodoSolidaridad_1.ModeloNodoSolidaridad(Object.assign(Object.assign({}, infoNodo), { nodoParent: idNodoParent }));
                if (tipoParent === 'usuario') {
                    nuevoNodo.tipoParent = tipoParent;
                }
                var nodoParent = null;
                try {
                    if (tipoParent === 'usuario') {
                        nodoParent = yield Usuario_1.ModeloUsuario.findById(idNodoParent).exec();
                    }
                    else {
                        nodoParent = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoParent).exec();
                    }
                    if (!nodoParent) {
                        throw "Nodo parent no encontrado en la base de datos";
                    }
                }
                catch (error) {
                    console.log(`Error buscando el nodo parent: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                var responsablesAmplio = [];
                if (tipoParent === 'usuario') {
                    responsablesAmplio = [nodoParent.id];
                }
                else {
                    responsablesAmplio = yield exports.getResponsablesAmplioNodo(nodoParent);
                }
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando nodo under nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var nuevoVinculo = nodoParent.vinculos.create({
                    tipo: 'requiere',
                    idRef: nuevoNodo.id,
                });
                nodoParent.vinculos.push(nuevoVinculo);
                try {
                    yield nodoParent.save();
                }
                catch (error) {
                    console.log(`Error guardando el nodo parent: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Ubicar el nuevo nodo
                var nuevaDireccion = Number((Math.random() * 2 * Math.PI).toFixed(3));
                const distanciaDefault = 100;
                const coords = {
                    x: nodoParent.autoCoords.x + Math.round(distanciaDefault * Math.cos(nuevaDireccion)),
                    y: nodoParent.autoCoords.y + Math.round(distanciaDefault * Math.sin(nuevaDireccion))
                };
                nuevoNodo.coords = coords;
                nuevoNodo.autoCoords = coords;
                try {
                    yield nuevoNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando en base de datos");
                }
                // emitirPosicionamientoNodos();
                console.log(`nuevo nodo de solidaridad creado:`);
                var respuesta = null;
                if (tipoParent === 'usuario') {
                    respuesta = {
                        nuevoNodo,
                        usuariosModificados: [nodoParent]
                    };
                }
                else {
                    respuesta = {
                        nodosModificados: [nodoParent],
                        nuevoNodo
                    };
                }
                return respuesta;
            });
        },
        eliminarNodoSolidaridad(_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un nodoSolidaridad con id ${idNodo}`);
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                    var idsNodosActuales = [elNodo.id];
                    var idsNodosArbol = [elNodo.id];
                    var cuenta = 0;
                    while (cuenta < 1000 && idsNodosActuales && idsNodosActuales.length > 0) {
                        cuenta++;
                        let childrenElNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ "nodoParent": { $in: idsNodosActuales } }).exec();
                        idsNodosArbol = idsNodosArbol.concat(childrenElNodo.map(c => c.id));
                        idsNodosActuales = childrenElNodo.map(n => n.id);
                    }
                    if (cuenta >= 1000) {
                        console.log(`OVERFLOW DE LOOP WHILE CREANDO LA LISTA DE NODOS A ELIMINAR JUNTO CON UN NODO PARENT DE ID ${idNodo}`);
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = yield getAdministradoresNodo(elNodo);
                //Authorización
                let permisosEspeciales = ["superadministrador"];
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion eliminando nodo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`Se eliminarán los nodos: `);
                idsNodosArbol.forEach(id => {
                    console.log(`${id}`);
                });
                try {
                    yield NodoSolidaridad_1.ModeloNodoSolidaridad.deleteMany({ _id: { $in: idsNodosArbol } }).exec();
                }
                catch (error) {
                    console.log("Error eliminando nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error eliminando elemento");
                }
                console.log(`eliminados`);
                // emitirPosicionamientoNodos();
                contexto.pubsub.publish(exports.NODOS_ELIMINADOS, { nodosEliminados: idsNodosArbol });
                contexto.pubsub.publish(exports.NODOS_FAMILY_ELIMINADOS, { nodosSolidaridadFamilyEliminados: idsNodosArbol, primerEliminado: elNodo });
                //Actualizar vinculos que miraban hacia estos nodos
                var nodosRequirientes = [];
                try {
                    if (elNodo.tipoParent === 'usuario') {
                        nodosRequirientes = yield Usuario_1.ModeloUsuario.find({ "vinculos.idRef": { $in: idsNodosArbol } }).exec();
                    }
                    else {
                        nodosRequirientes = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ "vinculos.idRef": { $in: idsNodosArbol } }).exec();
                    }
                }
                catch (error) {
                    console.log(`Error buscando nodos requirientes de nodos eliminados: ${error}`);
                }
                console.log(`${nodosRequirientes.length} nodos requerian a los nodos eliminados`);
                nodosRequirientes.forEach(nr => {
                    console.log(`Retirando el nodo de ${nr.nombre || nr.username}`);
                    let indexV = nr.vinculos.findIndex(v => idsNodosArbol.includes(v.idRef));
                    nr.vinculos.splice(indexV, 1);
                });
                nodosRequirientes.forEach((nr) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield nr.save();
                    }
                    catch (error) {
                        console.log(`Error guardando un nodo (${nr.nombre}) después de retirarle un vínculo a un nodo eliminado: ${error}`);
                    }
                }));
                return true;
            });
        },
        crearNodoSolidaridad(_, { infoNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de crear un nodo de solidaridad en la posicion ${infoNodo.coords}`);
                const credencialesUsuario = contexto.usuario;
                if (!credencialesUsuario || !credencialesUsuario.id) {
                    throw new apollo_server_express_1.AuthenticationError("Usuario no logeado");
                }
                const permisosAutorizados = ["superadministrador"];
                if (!credencialesUsuario.permisos.some(p => permisosAutorizados.includes(p))) {
                    console.log(`Usuario no autorizado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var nuevoNodo = new NodoSolidaridad_1.ModeloNodoSolidaridad(Object.assign(Object.assign({}, infoNodo), { autoCoords: infoNodo.coords }));
                    yield nuevoNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando en base de datos");
                }
                console.log(`nuevo nodo de solidaridad creado`);
                return nuevoNodo;
            });
        },
        deleteRequerimentoNodosAtlasSolidaridad(_, { idNodoRequiriente, tipoRequiriente, idNodoRequerido }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de delete requerimento entre ${idNodoRequiriente} de tipo ${tipoRequiriente} y ${idNodoRequerido}`);
                if (!contexto.usuario) {
                    console.log(`Usuario no estaba logeado. Cancelando`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                var nodoRequiriente = null;
                try {
                    if (tipoRequiriente === 'usuario') {
                        nodoRequiriente = yield Usuario_1.ModeloUsuario.findById(idNodoRequiriente).exec();
                    }
                    else {
                        nodoRequiriente = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoRequiriente).exec();
                    }
                    if (!nodoRequiriente)
                        throw "nodo requiriente no encontrado";
                    var nodoRequerido = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoRequerido).exec();
                    if (!nodoRequerido)
                        throw "nodo requerido no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando los nodos a desvincular: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var cambiosEnNodoRequerido = false;
                if (nodoRequerido.nodoParent === nodoRequiriente.id) {
                    console.log(`El nodo requerido era child, buscándole nuevo parent`);
                    try {
                        var tipoNuevoParent = "nodoSolidaridad";
                        var nuevoParent = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findOne({ "vinculos.idRef": nodoRequerido.id, "_id": { $ne: idNodoRequiriente } }).exec();
                        if (!nuevoParent) {
                            tipoNuevoParent = 'usuario';
                            nuevoParent = yield Usuario_1.ModeloUsuario.findOne({ "vinculos.idRef": nodoRequerido.id, "_id": { $ne: idNodoRequiriente } }).exec();
                        }
                        if (!nuevoParent) {
                            throw "El nodo requerido no tenía otro vínculo que lo recibiera";
                        }
                    }
                    catch (error) {
                        console.log(`Error buscándole nuevoParent al nodoRequerido: ${error}`);
                        throw new apollo_server_express_1.UserInputError("Operación no permitida");
                    }
                    console.log(`El nuevo parent será: ${nuevoParent.nombre || nuevoParent.nombres}`);
                    nodoRequerido.nodoParent = nuevoParent.id;
                    nodoRequerido.tipoParent = tipoNuevoParent;
                    cambiosEnNodoRequerido = true;
                }
                const permisosEspeciales = ["superadministrador"];
                var indexV = nodoRequiriente.vinculos.findIndex(v => v.idRef === idNodoRequerido);
                if (indexV > -1) {
                    var responsablesAmplioNodoRequiriente = [];
                    if (tipoRequiriente === 'usuario') {
                        responsablesAmplioNodoRequiriente = [nodoRequiriente.id];
                    }
                    else {
                        responsablesAmplioNodoRequiriente = yield exports.getResponsablesAmplioNodo(nodoRequiriente);
                    }
                    if (responsablesAmplioNodoRequiriente.includes(credencialesUsuario.id) || permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                        nodoRequiriente.vinculos.splice(indexV, 1);
                    }
                    else {
                        console.log(`Fallo de autenticación al eliminar el vinculo de ${idNodoRequiriente} requiriendo ${idNodoRequerido}`);
                        throw new apollo_server_express_1.AuthenticationError("No autorizado");
                    }
                }
                try {
                    yield nodoRequiriente.save();
                    if (cambiosEnNodoRequerido) {
                        yield nodoRequerido.save();
                    }
                }
                catch (error) {
                    console.log(`Error guardando los nodos después de la desvinculación: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Desrequerimentados`);
                var respuesta = null;
                if (tipoRequiriente === 'usuario') {
                    respuesta = {
                        usuariosModificados: [nodoRequiriente]
                    };
                }
                else {
                    respuesta = {
                        nodosModificados: [nodoRequiriente]
                    };
                }
                return respuesta;
            });
        },
        crearRequerimentoEntreNodosAtlasSolidaridad(_, { idNodoRequiriente, idNodoRequerido, tipoRequiriente }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de set que nodo ${idNodoRequiriente} de tipo ${tipoRequiriente} requiere al nodo ${idNodoRequerido}`);
                if (!contexto.usuario) {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("Login required");
                }
                const credencialesUsuario = contexto.usuario;
                var nodoRequiriente = null;
                try {
                    if (tipoRequiriente === 'usuario') {
                        nodoRequiriente = yield Usuario_1.ModeloUsuario.findById(idNodoRequiriente).exec();
                    }
                    else {
                        nodoRequiriente = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoRequiriente).exec();
                    }
                    if (!nodoRequiriente)
                        throw "Nodo requiriente no encontrado";
                    var nodoRequerido = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoRequerido).exec();
                    if (!nodoRequerido)
                        throw "Nodo requerido no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando los nodos a desvincular: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorization
                var responsablesAmplioNodoRequiriente = [];
                if (tipoRequiriente === 'usuario') {
                    responsablesAmplioNodoRequiriente = [nodoRequiriente.id];
                }
                else {
                    responsablesAmplioNodoRequiriente = yield exports.getResponsablesAmplioNodo(nodoRequiriente);
                }
                const permisosEspeciales = ["superadministrador"];
                if (!responsablesAmplioNodoRequiriente.includes(credencialesUsuario.id) && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p))) {
                    console.log(`Usuario no autorizado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                //Prevenir loop
                console.log(`Previniendo loop sobre ${nodoRequerido.nombre}`);
                if (yield checkIfNodoRecursivelyUnderNodo(nodoRequerido, idNodoRequiriente)) {
                    console.log(`Habría loop en esta operación. Cancelando.`);
                    throw new apollo_server_express_1.UserInputError("Requerimento genera bucle");
                }
                //Introducir vínculo
                var indexV = nodoRequiriente.vinculos.findIndex(v => v.idRef === idNodoRequerido);
                if (indexV > -1) {
                    nodoRequiriente.vinculos.splice(indexV, 1);
                }
                var nuevoVinculo = nodoRequiriente.vinculos.create({
                    idRef: idNodoRequerido,
                    tipo: "requiere",
                });
                nodoRequiriente.vinculos.push(nuevoVinculo);
                var indexOtroV = nodoRequerido.vinculos.findIndex(v => v.idRef === idNodoRequiriente);
                if (indexOtroV > -1) {
                    nodoRequerido.vinculos.splice(indexOtroV, 1);
                }
                //Si el nodo requerido estaba huérfano, entonces lo toma bajo su control.
                // if ((!nodoRequerido.responsables || nodoRequerido.responsables.length < 1) && (!nodoRequerido.nodoParent) ) {
                //     console.log(`El nodo requerido estaba huérfano. Tomando bajo el control del nodo requiriente.`);
                //     nodoRequerido.nodoParent = idNodoRequiriente
                // }
                try {
                    yield nodoRequiriente.save();
                    yield nodoRequerido.save();
                }
                catch (error) {
                    console.log(`Error guardando los nodos después de la vinculación: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Vinculados`);
                var respuesta = null;
                if (tipoRequiriente === 'usuario') {
                    respuesta = {
                        nodosModificados: [nodoRequerido],
                        usuariosModificados: [nodoRequiriente]
                    };
                }
                else {
                    respuesta = {
                        nodosModificados: [nodoRequerido, nodoRequiriente]
                    };
                }
                return respuesta;
            });
        },
        crearParentingEntreNodosAtlasSolidaridad(_, { idNodoRequiriente, tipoRequiriente, idNodoRequerido }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Query de set que nodo ${idNodoRequiriente} de tipo ${tipoRequiriente} es parent del nodo ${idNodoRequerido}`);
                if (!contexto.usuario) {
                    console.log(`Usuario no estaba logeado. Cancelando`);
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                const credencialesUsuario = contexto.usuario;
                var nodoRequiriente = null;
                try {
                    if (tipoRequiriente === 'usuario') {
                        nodoRequiriente = yield Usuario_1.ModeloUsuario.findById(idNodoRequiriente).exec();
                    }
                    else {
                        nodoRequiriente = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoRequiriente).exec();
                    }
                    if (!nodoRequiriente)
                        throw "Nodo requiriente no encontrado";
                    var nodoRequerido = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoRequerido).exec();
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
                    throw new apollo_server_express_1.UserInputError("Los nodos no estaban vinculados");
                }
                console.log(`El nodo requerido queda bajo el control del nodo requiriente.`);
                nodoRequerido.nodoParent = idNodoRequiriente;
                nodoRequerido.tipoParent = tipoRequiriente;
                try {
                    yield nodoRequiriente.save();
                    yield nodoRequerido.save();
                }
                catch (error) {
                    console.log(`Error guardando los nodos después de la vinculación: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Parented`);
                var respuesta = null;
                if (tipoRequiriente === 'usuario') {
                    respuesta = {
                        nodosModificados: [nodoRequerido],
                        usuariosModificados: [nodoRequiriente]
                    };
                }
                else {
                    respuesta = {
                        nodosModificados: [nodoRequerido, nodoRequiriente]
                    };
                }
                return respuesta;
            });
        },
        transferirRequerimentoBetweenNodosSolidaridad(_, { idNodoRequerido, idNodoSource, tipoNodoSource, idNodoTarget, tipoNodoTarget, index }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de transferencia del requerimento del nodo ${idNodoRequerido} desde ${idNodoSource} hacia ${idNodoTarget} en posicion ${index}`);
                if (!contexto || !contexto.usuario) {
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var nodosModificados = [];
                var usuariosModificados = [];
                var elNodoSource = null;
                try {
                    var elNodoRequerido = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoRequerido).exec();
                    if (tipoNodoSource === 'usuario') {
                        elNodoSource = yield Usuario_1.ModeloUsuario.findById(idNodoSource).exec();
                    }
                    else {
                        elNodoSource = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoSource).exec();
                    }
                    var elNodoTarget = null;
                    if (idNodoTarget != idNodoSource) {
                        if (tipoNodoTarget === 'usuario') {
                            elNodoTarget = yield Usuario_1.ModeloUsuario.findById(idNodoTarget).exec();
                        }
                        else {
                            elNodoTarget = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodoTarget).exec();
                        }
                    }
                    else {
                        var elNodoTarget = elNodoSource;
                    }
                }
                catch (error) {
                    console.log(`Error getting nodos involucrados: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var responsablesAmplioSource = [];
                if (tipoNodoSource === 'usuario') {
                    responsablesAmplioSource = [elNodoSource.id];
                }
                else {
                    responsablesAmplioSource = yield exports.getResponsablesAmplioNodo(elNodoSource);
                }
                if (!responsablesAmplioSource.includes(contexto.usuario.id)) {
                    console.log(`El usuario no era responsable amplio del nodoSource`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var responsablesAmplioTarget = [];
                if (tipoNodoTarget === 'usuario') {
                    responsablesAmplioTarget = [elNodoTarget.id];
                }
                else {
                    responsablesAmplioTarget = yield exports.getResponsablesAmplioNodo(elNodoTarget);
                }
                if (!responsablesAmplioTarget.includes(contexto.usuario.id)) {
                    console.log(`El usuario no era responsable amplio del nodoTarget`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                //Prevenir loop
                if (yield checkIfNodoRecursivelyUnderNodo(elNodoRequerido, idNodoTarget)) {
                    console.log(`Habría loop en esta operación. Cancelando.`);
                    throw new apollo_server_express_1.UserInputError("Requerimento genera bucle");
                }
                //Insertar vinculo en el nodo target            
                var nuevoVinculo = elNodoTarget.vinculos.create({
                    tipo: 'requiere',
                    idRef: elNodoRequerido.id,
                });
                elNodoTarget.vinculos.splice(index, 0, nuevoVinculo);
                if (tipoNodoTarget === 'usuario') {
                    usuariosModificados.push(elNodoTarget);
                }
                else {
                    nodosModificados.push(elNodoTarget);
                }
                //Retirar vínculo del nodo source.
                const indexSource = elNodoSource.vinculos.findIndex(v => v.idRef === idNodoRequerido && v.id != nuevoVinculo.id);
                if (indexSource > -1) {
                    elNodoSource.vinculos.splice(indexSource, 1);
                }
                else {
                    console.log(`El nodoRequerido no aparecía en los vínculos del nodoSource`);
                    throw new apollo_server_express_1.UserInputError("Datos inválidos");
                }
                if (tipoNodoSource === 'usuario') {
                    usuariosModificados.push(elNodoSource);
                }
                else {
                    nodosModificados.push(elNodoSource);
                }
                //Si es necesario, cambiar parenting del nodo requerido.
                if (elNodoRequerido.nodoParent === idNodoSource && idNodoSource != idNodoTarget) { //Estaba siendo sacado de su nodo parent
                    console.log(`Transfiriendo parenting`);
                    elNodoRequerido.tipoParent = tipoNodoTarget;
                    elNodoRequerido.nodoParent = idNodoTarget;
                    nodosModificados.push(elNodoRequerido);
                    try {
                        yield elNodoRequerido.save();
                    }
                    catch (error) {
                        console.log(`Error guardando el nodo rquerido: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                try {
                    yield elNodoSource.save();
                    if (idNodoTarget != idNodoSource) {
                        yield elNodoTarget.save();
                    }
                }
                catch (error) {
                    console.log(`Error guardando los nodos source y target: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                // if (idNodoSource != idNodoTarget) {
                //     emitirPosicionamientoNodos();
                // }
                return { nodosModificados, usuariosModificados };
            });
        },
        crearRecursoExternoNodoSolidaridad(_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo recursoExterno en el NodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var nuevoRecursoExterno = elNodo.recursosExternos.create();
                    elNodo.recursosExternos.push(nuevoRecursoExterno);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el recursoExterno creado en el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el recursoExterno en el nodo");
                }
                console.log(`Enviando nuevo recursoExterno: ${nuevoRecursoExterno}`);
                return nuevoRecursoExterno;
            });
        },
        eliminarRecursoExternoNodoSolidaridad(_, { idNodo, idRecursoExterno }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de eliminar un recursoExterno con id ${idRecursoExterno} en el NodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const indexE = elNodo.recursosExternos.findIndex(e => e.id === idRecursoExterno);
                if (indexE > -1) {
                    elNodo.recursosExternos.splice(indexE, 1);
                }
                else {
                    console.log(`Error. El recursoExterno a eliminar no existía.`);
                    throw new apollo_server_express_1.UserInputError("RecursoExterno no encontrado");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el recursoExterno en el nodo");
                }
                return true;
            });
        },
        editarDatosRecursoExternoNodoSolidaridad(_, { idNodo, idRecursoExterno, nuevoNombre, nuevoDescripcion, nuevoLink }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando la descripcion del recursoExterno con id ${idRecursoExterno} del nodosolidaridad con id ${idNodo}`);
                nuevoLink = nuevoLink.replace(/\s\s+/g, " ");
                nuevoLink = nuevoLink.trim();
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                nuevoNombre = nuevoNombre.trim();
                nuevoDescripcion = nuevoDescripcion.trim();
                if (charProhibidosDescripcion.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                if (NodoSolidaridad_1.charProhibidosNombreRecursoExterno.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elRecursoExterno = elNodo.recursosExternos.id(idRecursoExterno);
                    if (!elRecursoExterno) {
                        console.log(`RecursoExterno no encontrado en el nodosolidaridad`);
                        throw "No existía el recursoExterno";
                    }
                    elRecursoExterno.nombre = nuevoNombre;
                    elRecursoExterno.descripcion = nuevoDescripcion;
                    elRecursoExterno.link = nuevoLink;
                }
                catch (error) {
                    console.log("Error cambiando los datos del recursoExterno en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando los datos del recursoExterno en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el recursoExterno editado en el nodosolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo nuevos datos en el recursoExterno en el nodosolidaridad");
                }
                console.log(`Descripcion cambiado`);
                return elRecursoExterno;
            });
        },
        editarNombreRecursoExternoNodoSolidaridad(_, { idNodo, idRecursoExterno, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del recursoExterno con id ${idRecursoExterno} del nodosolidaridad con id ${idNodo}`);
                nuevoNombre = nuevoNombre.trim();
                nuevoNombre = nuevoNombre.replace(/[\n\r]/g, " ");
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (NodoSolidaridad_1.charProhibidosNombreRecursoExterno.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const responsablesAmplioNodo = yield exports.getResponsablesAmplioNodo(elNodo);
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (!responsablesAmplioNodo.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando nombre de nodosolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elRecursoExterno = elNodo.recursosExternos.id(idRecursoExterno);
                    if (!elRecursoExterno) {
                        console.log(`RecursoExterno no encontrado en el nodosolidaridad`);
                        throw "No existía el recursoExterno";
                    }
                    elRecursoExterno.nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el recursoExterno creado en el nodosolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el recursoExterno en el nodosolidaridad");
                }
                console.log(`Nombre cambiado`);
                return elRecursoExterno;
            });
        },
        editarDescripcionRecursoExternoNodoSolidaridad(_, { idNodo, idRecursoExterno, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando la descripcion del recursoExterno con id ${idRecursoExterno} del nodosolidaridad con id ${idNodo}`);
                if (charProhibidosDescripcion.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo a eliminar en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elRecursoExterno = elNodo.recursosExternos.id(idRecursoExterno);
                    if (!elRecursoExterno) {
                        console.log(`RecursoExterno no encontrado en el nodosolidaridad`);
                        throw "No existía el recursoExterno";
                    }
                    elRecursoExterno.descripcion = nuevoDescripcion;
                }
                catch (error) {
                    console.log("Error cambiando el descripcion en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el descripcion en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el recursoExterno creado en el nodosolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el recursoExterno en el nodosolidaridad");
                }
                console.log(`Descripcion cambiado`);
                return elRecursoExterno;
            });
        },
        editarLinkRecursoExternoNodoSolidaridad(_, { idNodo, idRecursoExterno, nuevoLink }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el link del recursoExterno con id ${idRecursoExterno} del nodosolidaridad con id ${idNodo}`);
                // const charProhibidosLinkRecursoExterno = /[^ a-zA-ZÀ-ž0-9_.-?/=:]/;
                nuevoLink = nuevoLink.replace(/\s\s+/g, " ");
                // if (charProhibidosLinkRecursoExterno.test(nuevoLink)) {
                //     throw new ApolloError("Link ilegal");
                // }
                nuevoLink = nuevoLink.trim();
                nuevoLink = nuevoLink.replace(/[\n\r]/g, "");
                nuevoLink = nuevoLink.replace(" ", "");
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando link de nodosolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elRecursoExterno = elNodo.recursosExternos.id(idRecursoExterno);
                    if (!elRecursoExterno) {
                        console.log(`RecursoExterno no encontrado en el nodosolidaridad`);
                        throw "No existía el recursoExterno";
                    }
                    elRecursoExterno.link = nuevoLink;
                    elRecursoExterno.tipo = 'enlace';
                }
                catch (error) {
                    console.log("Error cambiando el link en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el link en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el recursoExterno editado en el nodosolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el recursoExterno en el nodosolidaridad");
                }
                console.log(`Link cambiado`);
                return elRecursoExterno;
            });
        },
        editarNombreNodoSolidaridad(_, { idNodo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Petición de cambiar el nombre del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "NodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                var administradores = yield getAdministradoresNodo(elNodo);
                //Authorización
                const credencialesUsuario = contexto.usuario;
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosNombreNodoSolidaridad = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreNodoSolidaridad.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                nuevoNombre.replace(/  +/g, ' ');
                nuevoNombre = nuevoNombre.replace(/[\n\r]/g, "");
                try {
                    elNodo.nombre = nuevoNombre;
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                console.log(`Nombre cambiado`);
                return elNodo;
            });
        },
        editarDescripcionNodoSolidaridad(_, { idNodo, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo " + idNodo + ". E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = yield getAdministradoresNodo(elNodo);
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando descripció de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (charProhibidosDescripcion.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                nuevoDescripcion.replace("  ", "");
                try {
                    elNodo.descripcion = nuevoDescripcion;
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                return elNodo;
            });
        },
        editarKeywordsNodoSolidaridad(_, { idNodo, nuevoKeywords }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                var administradores = yield getAdministradoresNodo(elNodo);
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosKeywordsNodoSolidaridad = /[^ a-zA-Zñ,]/;
                if (charProhibidosKeywordsNodoSolidaridad.test(nuevoKeywords)) {
                    throw new apollo_server_express_1.ApolloError("Keywords ilegal");
                }
                nuevoKeywords = nuevoKeywords.trim();
                nuevoKeywords.replace(/  +/g, ' ');
                nuevoKeywords = nuevoKeywords.replace(/[\n\r]/g, "");
                try {
                    elNodo.keywords = nuevoKeywords;
                    console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad modificado: ${error}`);
                }
                console.log(`Keywords guardado`);
                return elNodo;
            });
        },
        addResponsableNodoSolidaridad: function (_, { idNodo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un nodo de id ${idNodo}`);
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo)
                        throw "Nodo no existía";
                }
                catch (error) {
                    console.log('Error buscando el nodo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
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
                //Authorización
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion `);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (elNodo.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este nodo`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                let indexPosibleResponsable = elNodo.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elNodo.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                else {
                    if (elNodo.responsables.length > 0) {
                        console.log(`Error. Se intentaba add como responsable un usuario que no estaba en la lista de posibles responsables.`);
                    }
                }
                try {
                    elNodo.responsables.push(idUsuario);
                    console.log(`Usuario añadido a la lista de responsables`);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Actualización en eventos
                console.log(`Buscando todos los nodos de solidaridad del árbol de este nodo`);
                var actualesIdsParents = [elNodo.id];
                var todosIdsArbol = [elNodo.id];
                while (actualesIdsParents.length > 0) {
                    try {
                        var actualesChildren = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ nodoParent: { $in: actualesIdsParents } }).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando childrens: ${error}`);
                    }
                    console.log(`encontrados:`);
                    actualesChildren.forEach(c => {
                        console.log(`${c.nombre}`);
                    });
                    let idsChildren = actualesChildren.map(c => c.id);
                    todosIdsArbol.push(...idsChildren);
                    actualesIdsParents = idsChildren;
                }
                console.log(`Resultado: ${todosIdsArbol}`);
                console.log(`Buscando todos los eventos personales futuros de estos nodos`);
                const dateActual = new Date();
                try {
                    var losEventosFuturos = yield Evento_1.ModeloEventoPersonal.find({ horarioInicio: { $gt: dateActual.getTime() }, idParent: { $in: todosIdsArbol } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando los eventos de este árbol: ${error}`);
                }
                console.log(`Eventos futuros:`);
                losEventosFuturos.forEach(ev => {
                    console.log(`${ev.nombre}`);
                });
                losEventosFuturos.forEach((ev) => __awaiter(this, void 0, void 0, function* () {
                    let indexP = ev.idsParticipantes.indexOf(idUsuario);
                    if (indexP === -1) {
                        ev.idsParticipantes.push(idUsuario);
                        try {
                            yield ev.save();
                        }
                        catch (error) {
                            console.log(`Error guardando el evento con el nuevo participante: ${error}`);
                        }
                    }
                }));
                console.log(`NodoSolidaridad guardado`);
                return elNodo;
            });
        },
        usuarioEntrarResponsableNodoSolidaridad: function (_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de un usuario para entrar a ser responsable de un nodo de id ${idNodo}`);
                var credencialesUsuario = contexto.usuario;
                const idUsuario = credencialesUsuario.id;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo)
                        throw "Nodo no existía";
                }
                catch (error) {
                    console.log('Error buscando el nodo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                if (elNodo.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este nodo`);
                    throw new apollo_server_express_1.UserInputError("El usuario ya estaba incluido");
                }
                if (elNodo.posiblesResponsables.includes(idUsuario)) {
                    console.log(`El usuario ya era posible responsable de este nodo`);
                    throw new apollo_server_express_1.UserInputError("El usuario ya estaba incluido");
                }
                const usuarioParent = elNodo.tipoParent === 'usuario' && elNodo.nodoParent === idUsuario;
                if ((elNodo.responsables.length === 0 && elNodo.tipoParent != 'usuario') || usuarioParent) {
                    console.log(`Entra a responsables`);
                    elNodo.responsables.push(idUsuario);
                }
                else {
                    console.log(`Entra a posibles responsables`);
                    elNodo.posiblesResponsables.push(idUsuario);
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`NodoSolidaridad guardado`);
                return elNodo;
            });
        },
        addPosibleResponsableNodoSolidaridad: function (_, { idNodo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del nodo ${idNodo}`);
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (!credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion añadiendo posible responsable del nodo`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (elNodo.posiblesResponsables.includes(idUsuario) || elNodo.responsables.includes(idUsuario)) {
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
                    elNodo.posiblesResponsables.push(idUsuario);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Nodo guardado`);
                //Crear notificacion para los responsables actuales del nodo
                try {
                    var currentResponsables = yield Usuario_1.ModeloUsuario.find({ _id: { $in: elNodo.responsables } }).exec();
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
                                id: elNodo.id
                            },
                        });
                        responsable.notificaciones.push(newNotificacion);
                    }));
                }
                return elNodo;
            });
        },
        removeResponsableNodoSolidaridad: function (_, { idNodo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de remove un usuario con id ${idUsuario} de un nodo de id ${idNodo}`);
                const credencialesUsuario = contexto.usuario;
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
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo)
                        throw "Nodo no existía";
                }
                catch (error) {
                    console.log('Error buscando el nodo . E: ' + error);
                    throw new apollo_server_express_1.ApolloError('Error conectando con la base de datos');
                }
                //Authorización
                const usuarioParent = elNodo.tipoParent === 'usuario' && elNodo.nodoParent === credencialesUsuario.id;
                const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !usuarioParent) {
                    console.log(`Error de autenticacion`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const indexPosibleResponsable = elNodo.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elNodo.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                const indexResponsable = elNodo.responsables.indexOf(idUsuario);
                if (indexResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                    elNodo.responsables.splice(indexResponsable, 1);
                }
                console.log(`Usuario retirado de la lista de responsables`);
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`NodoSolidaridad guardado`);
                console.log(`Buscando todos los nodos de solidaridad del árbol de este nodo`);
                var actualesIdsParents = [elNodo.id];
                var todosIdsArbol = [elNodo.id];
                while (actualesIdsParents.length > 0) {
                    try {
                        var actualesChildren = yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ nodoParent: { $in: actualesIdsParents } }).exec();
                    }
                    catch (error) {
                        console.log(`Error buscando childrens: ${error}`);
                    }
                    console.log(`encontrados:`);
                    actualesChildren.forEach(c => {
                        console.log(`${c.nombre}`);
                    });
                    let idsChildren = actualesChildren.map(c => c.id);
                    todosIdsArbol.push(...idsChildren);
                    actualesIdsParents = idsChildren;
                }
                console.log(`Resultado: ${todosIdsArbol}`);
                console.log(`Buscando todos los eventos personales futuros de estos nodos para sacar al usuario de la lista de participantes`);
                const dateActual = new Date();
                try {
                    var losEventosFuturos = yield Evento_1.ModeloEventoPersonal.find({ horarioInicio: { $gt: dateActual.getTime() }, idParent: { $in: todosIdsArbol } }).exec();
                }
                catch (error) {
                    console.log(`Error buscando los eventos de este árbol: ${error}`);
                }
                console.log(`Eventos futuros:`);
                losEventosFuturos.forEach(ev => {
                    console.log(`${ev.nombre}`);
                });
                losEventosFuturos.forEach((ev) => __awaiter(this, void 0, void 0, function* () {
                    let indexP = ev.idsParticipantes.indexOf(idUsuario);
                    if (indexP > -1) {
                        ev.idsParticipantes.splice(indexP, 1);
                        try {
                            yield ev.save();
                        }
                        catch (error) {
                            console.log(`Error guardando el evento con el nuevo participante: ${error}`);
                        }
                    }
                }));
                return elNodo;
            });
        },
        setEstadoNodoSolidaridad(_, { idNodo, nuevoEstado }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = yield getAdministradoresNodo(elNodo);
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion editando nombre de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elNodo.estadoDesarrollo = nuevoEstado;
                    console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Estado guardado`);
                return elNodo;
            });
        },
        setPublicitadoNodoSolidaridad(_, { idNodo, nuevoEstado }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log('\x1b[35m%s\x1b[0m', `Query de set en ${nuevoEstado} el publicitado de nodo solidaridad ${idNodo}`);
                const credencialesUsuario = contexto.usuario;
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "Nodo no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                var administradores = yield getAdministradoresNodo(elNodo);
                const permisosEspeciales = ["superadministrador"];
                const tienePermisosEspeciales = credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p));
                //Authorización
                if (!administradores.includes(credencialesUsuario.id) && !tienePermisosEspeciales) {
                    console.log(`Error de autenticacion editando nombre de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elNodo.publicitado = nuevoEstado;
                    console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Estado guardado`);
                return elNodo;
            });
        },
        crearNuevoMovimientoDineroNodoSolidaridad(_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo movimientoDinero en el nodoSolidaridad con id ${idNodo}`);
                if (!contexto.usuario) {
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo)
                        throw "NodoSolidaridad no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el nodoSolidaridad. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var nuevoMovimiento = elNodo.movimientosDinero.create();
                    elNodo.movimientosDinero.push(nuevoMovimiento);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el movimientoDinero creado en el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el movimientoDinero en el nodoSolidaridad");
                }
                return nuevoMovimiento;
            });
        },
        eliminarMovimientoDineroNodoSolidaridad(_, { idMovimientoDinero, idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un movimientoDinero con id ${idMovimientoDinero} de un nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion eliminando movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elNodo.movimientosDinero.id(idMovimientoDinero).remove();
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error eliminando el movimientoDinero. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        editarFechaMovimientoDineroNodoSolidaridad(_, { idNodo, idMovimientoDinero, nuevoFecha }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el fecha del movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando fecha de movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                    if (!elMovimiento) {
                        console.log(`MovimientoDinero no encontrado en el nodoSolidaridad`);
                        throw "No existía el movimientoDinero";
                    }
                    elMovimiento.fecha = nuevoFecha;
                }
                catch (error) {
                    console.log("Error cambiando fecha en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando fecha en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el movimientoDinero creado en el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el movimientoDinero en el nodoSolidaridad");
                }
                console.log(`Artículo cambiado`);
                return elMovimiento;
            });
        },
        editarArticuloMovimientoDineroNodoSolidaridad(_, { idNodo, idMovimientoDinero, nuevoArticulo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el articulo del movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo} a ${nuevoArticulo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando artículo de movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosArticulo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoArticulo = nuevoArticulo.replace(/\s\s+/g, " ");
                if (charProhibidosArticulo.test(nuevoArticulo)) {
                    throw new apollo_server_express_1.ApolloError("Articulo ilegal");
                }
                nuevoArticulo = nuevoArticulo.trim();
                nuevoArticulo.replace(/  +/g, ' ');
                nuevoArticulo = nuevoArticulo.replace(/[\n\r]/g, "");
                try {
                    var elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                    if (!elMovimiento) {
                        console.log(`MovimientoDinero no encontrado en el nodoSolidaridad`);
                        throw "No existía el movimientoDinero";
                    }
                    elMovimiento.articulo = nuevoArticulo;
                }
                catch (error) {
                    console.log("Error cambiando el artículo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el artículo en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el movimientoDinero creado en el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el movimientoDinero en el nodoSolidaridad");
                }
                console.log(`Artículo cambiado`);
                return elMovimiento;
            });
        },
        editarInformacionMovimientoDineroNodoSolidaridad(_, { idNodo, idMovimientoDinero, nuevoInformacion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set informacion de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodoSolidaridad. E: ` + error);
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando información de movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (charProhibidosTexto.test(nuevoInformacion)) {
                    throw new apollo_server_express_1.ApolloError("Informacion ilegal");
                }
                nuevoInformacion = nuevoInformacion.trim();
                nuevoInformacion.replace(/  +/g, ' ');
                let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                if (!elMovimiento) {
                    console.log(`No existía el movimientoDinero`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMovimiento.informacion = nuevoInformacion;
                try {
                    console.log(`guardando nuevo informacion ${nuevoInformacion} en la base de datos`);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Informacion guardado`);
                return elMovimiento;
            });
        },
        editarCantidadMovimientoDineroNodoSolidaridad(_, { idNodo, idMovimientoDinero, nuevoCantidad }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set cantidad de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodoSolidaridad. E: ` + error);
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando cantidad de movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                if (!elMovimiento) {
                    console.log(`No existía el movimientoDinero`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMovimiento.cantidad = nuevoCantidad;
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Cantidades guardado`);
                return elMovimiento;
            });
        },
        editarMovimientoUnitarioMovimientoDineroNodoSolidaridad(_, { idNodo, idMovimientoDinero, nuevoMovimientoUnitario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set movimientoUnitario de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodoSolidaridad. E: ` + error);
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando movimientoUnitario de movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                if (!elMovimiento) {
                    console.log(`No existía el movimientoDinero`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMovimiento.movimientoUnitario = nuevoMovimientoUnitario;
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`MovimientoUnitarioes guardado`);
                return elMovimiento;
            });
        },
        editarMovimientoTotalMovimientoDineroNodoSolidaridad(_, { idNodo, idMovimientoDinero, nuevoMovimientoTotal }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set movimientoTotal de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodoSolidaridad. E: ` + error);
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando movimientoTotal movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                if (!elMovimiento) {
                    console.log(`No existía el movimientoDinero`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMovimiento.movimientoTotal = nuevoMovimientoTotal;
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`MovimientoTotales guardado`);
                return elMovimiento;
            });
        },
        editarNumerosMovimientoDineroNodoSolidaridad(_, { idNodo, idMovimientoDinero, nuevoMovimientoUnitario, nuevoMovimientoTotal, nuevoCantidad }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set números de movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodoSolidaridad. E: ` + error);
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando números movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                let elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                if (!elMovimiento) {
                    console.log(`No existía el movimientoDinero`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMovimiento.movimientoUnitario = nuevoMovimientoUnitario;
                elMovimiento.movimientoTotal = nuevoMovimientoTotal;
                elMovimiento.cantidad = nuevoCantidad;
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`MovimientoUnitarioes guardado`);
                return elMovimiento;
            });
        },
        setRealizadoMovimientoDineroNodoSolidaridad(_, { idNodo, idMovimientoDinero, nuevoRealizado }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el realizado del movimientoDinero con id ${idMovimientoDinero} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion setting estado de movimientoDinero de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elMovimiento = elNodo.movimientosDinero.id(idMovimientoDinero);
                    if (!elMovimiento) {
                        console.log(`MovimientoDinero no encontrado en el nodoSolidaridad`);
                        throw "No existía el movimientoDinero";
                    }
                    elMovimiento.realizado = nuevoRealizado;
                }
                catch (error) {
                    console.log("Error cambiando el realizado en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el realizado en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el movimientoDinero creado en el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el movimientoDinero en el nodoSolidaridad");
                }
                console.log(`Realizado cambiado`);
                return elMovimiento;
            });
        },
        crearNuevoEventoNodoSolidaridad(_, { idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Peticion de crear un nuevo evento en el nodoSolidaridad con id ${idNodo}`);
                if (!contexto.usuario) {
                    throw new apollo_server_express_1.AuthenticationError("Login requerido");
                }
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo)
                        throw "NodoSolidaridad no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el nodoSolidaridad. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando evento de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var nuevoEvento = elNodo.eventos.create();
                    elNodo.eventos.push(nuevoEvento);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el evento creado en el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el evento en el nodoSolidaridad");
                }
                return nuevoEvento;
            });
        },
        eliminarEventoNodoSolidaridad(_, { idEvento, idNodo }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un evento con id ${idEvento} de un nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion eliminando evento de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    elNodo.eventos.id(idEvento).remove();
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error eliminando el evento. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        editarFechaEventoNodoSolidaridad(_, { idNodo, idEvento, nuevoFecha }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el fecha del evento con id ${idEvento} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando fecha de evento de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var elMovimiento = elNodo.eventos.id(idEvento);
                    if (!elMovimiento) {
                        console.log(`Evento no encontrado en el nodoSolidaridad`);
                        throw "No existía el evento";
                    }
                    elMovimiento.fecha = nuevoFecha;
                }
                catch (error) {
                    console.log("Error cambiando el artículo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el artículo en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el evento creado en el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el evento en el nodoSolidaridad");
                }
                console.log(`Artículo cambiado`);
                return elMovimiento;
            });
        },
        editarNombreEventoNodoSolidaridad(_, { idNodo, idEvento, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del evento con id ${idEvento} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Erro en la conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando artículo de evento de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosNombre = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombre.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                nuevoNombre.replace(/  +/g, ' ');
                nuevoNombre = nuevoNombre.replace(/[\n\r]/g, "");
                try {
                    var elMovimiento = elNodo.eventos.id(idEvento);
                    if (!elMovimiento) {
                        console.log(`Evento no encontrado en el nodoSolidaridad`);
                        throw "No existía el evento";
                    }
                    elMovimiento.nombre = nuevoNombre;
                }
                catch (error) {
                    console.log("Error cambiando el artículo en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el artículo en la base de datos");
                }
                try {
                    yield elNodo.save();
                }
                catch (error) {
                    console.log("Error guardando el evento creado en el nodoSolidaridad. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el evento en el nodoSolidaridad");
                }
                console.log(`Artículo cambiado`);
                return elMovimiento;
            });
        },
        editarDescripcionEventoNodoSolidaridad(_, { idNodo, idEvento, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set descripcion de evento con id ${idEvento} del nodoSolidaridad con id ${idNodo}`);
                try {
                    var elNodo = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idNodo).exec();
                    if (!elNodo) {
                        throw "nodoSolidaridad no encontrado";
                    }
                }
                catch (error) {
                    console.log(`error buscando el nodoSolidaridad. E: ` + error);
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                var responsablesAmplio = yield exports.getResponsablesAmplioNodo(elNodo);
                if (!responsablesAmplio.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando información de evento de nodoSolidaridad`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (charProhibidosTexto.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                nuevoDescripcion.replace(/  +/g, ' ');
                let elMovimiento = elNodo.eventos.id(idEvento);
                if (!elMovimiento) {
                    console.log(`No existía el evento`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                elMovimiento.descripcion = nuevoDescripcion;
                try {
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elNodo.save();
                }
                catch (error) {
                    console.log(`error guardando el nodoSolidaridad con coordenadas manuales: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                return elMovimiento;
            });
        },
    },
    Usuario: {
        responsables(usuario) {
            return [usuario.id];
        },
        responsablesAmplio(usuario) {
            return [usuario.id];
        },
        administradores(usuario) {
            return [usuario.id];
        }
    },
    NodoSolidaridad: {
        administradores(nodo) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield getAdministradoresNodo(nodo);
            });
        },
        coords(nodo) {
            return __awaiter(this, void 0, void 0, function* () {
                return nodo.autoCoords;
            });
        },
        responsablesAmplio(nodo) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield exports.getResponsablesAmplioNodo(nodo);
            });
        }
    },
};
const getResponsablesAmplioNodo = function (nodo) {
    return __awaiter(this, void 0, void 0, function* () {
        var responsablesAmplio = nodo.responsables;
        if (responsablesAmplio.length < 1) {
            var idParent = nodo.nodoParent;
            var elParent = nodo;
            while (responsablesAmplio.length < 1 && idParent) {
                if (elParent.tipoParent === 'usuario') {
                    return [elParent.nodoParent];
                }
                try {
                    elParent = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idParent).exec();
                    if (!elParent)
                        throw "Parent no encontrado";
                    responsablesAmplio = elParent.responsables;
                }
                catch (error) {
                    console.log(`Error descargando nodo parent con id ${idParent}: ${error}`);
                    return responsablesAmplio;
                }
                idParent = elParent.nodoParent;
            }
        }
        return responsablesAmplio;
    });
};
exports.getResponsablesAmplioNodo = getResponsablesAmplioNodo;
const checkIfNodoRecursivelyUnderNodo = function (nodoParent, idNodoUnder) {
    return __awaiter(this, void 0, void 0, function* () {
        var actualRequeridos = nodoParent.vinculos.filter(v => v.tipo === 'requiere').map(v => v.idRef);
        var recursivelyUnder = false;
        var cuenta = 0;
        while (actualRequeridos.length > 0) {
            cuenta++;
            if (cuenta > 1000) {
                console.log(`OVERFLOW CHECKING IF NODO RECURSIVELY UNDER`);
                throw new apollo_server_express_1.ApolloError("Error en el servidor");
                break;
            }
            try {
                var requeridos = (yield NodoSolidaridad_1.ModeloNodoSolidaridad.find({ _id: { $in: actualRequeridos } }).select("nombre vinculos").exec()) || [];
            }
            catch (error) {
                console.log(`Error descargando nodos requeridos for checking if nodo recursively under: ${error}`);
                throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
            }
            requeridos.forEach(r => console.log(r.nombre));
            if (requeridos.some(r => r.vinculos.some(v => v.idRef === idNodoUnder))) {
                return true;
            }
            actualRequeridos = requeridos.map(r => r.vinculos.filter(v => v.tipo === 'requiere').map(v => v.idRef)).flat(1);
        }
        return recursivelyUnder;
    });
};
const getAdministradoresNodo = function (nodo) {
    return __awaiter(this, void 0, void 0, function* () {
        var administradores = [];
        var elNodoParent = null;
        if (nodo.tipoParent === 'usuario') {
            if (!nodo.nodoParent) {
                console.log(`Detectado un nodo de usuario sin nodoParent apuntando a usuario`);
            }
            administradores = [nodo.nodoParent];
        }
        else if (!nodo.nodoParent) {
            administradores = nodo.responsables;
        }
        else {
            var idParent = nodo.nodoParent;
            try {
                elNodoParent = yield NodoSolidaridad_1.ModeloNodoSolidaridad.findById(idParent).exec();
                if (!elNodoParent)
                    throw "Nodo parent no encontrado";
            }
            catch (error) {
                console.log(`Error buscando el nodo parent de ${nodo.nombre}: ${elNodoParent}`);
                return administradores;
            }
            administradores = yield exports.getResponsablesAmplioNodo(elNodoParent);
        }
        return administradores;
    });
};
exports.intervaloPosicionamiento = 30000; //En milisegundos
function emitirPosicionamientoNodos() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var administracion = yield AdministracionAtlasSolidaridad_1.ModeloAdministracionAtlas.findById(exports.idAtlasSolidaridad).exec();
        }
        catch (error) {
            console.log(`Error buscando administracion de atlas`);
            return;
        }
        if (!administracion.lastPosicionamientoNodos) {
            administracion.lastPosicionamientoNodos = new Date('1995-12-17T03:24:00');
            try {
                yield administracion.save();
            }
            catch (error) {
                console.log(`Error guardando administración de atlas solidaridad: ${error}`);
                return;
            }
        }
        console.log(`Last posicionamiento de atlas ${administracion.id} en ${administracion.lastPosicionamientoNodos}`);
        const tiempoTranscurrido = Date.now() - administracion.lastPosicionamientoNodos.getTime();
        const tiempoTranscurridoSecs = tiempoTranscurrido / 1000;
        console.log(`Han pasado ${tiempoTranscurridoSecs} segundos`);
        var backoff = exports.intervaloPosicionamiento - tiempoTranscurrido;
        if (backoff < 0)
            backoff = 0;
        exports.timerPosicionamiento = setTimeout(() => {
            control_1.ejecutarPosicionamientoNodosSolidaridadByFuerzas(administracion.ciclosDefault, Date.now(), false);
        }, backoff);
        return;
    });
}
