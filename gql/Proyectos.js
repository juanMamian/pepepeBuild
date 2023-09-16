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
const Proyecto_1 = require("../model/Proyecto");
const Trabajo_1 = require("../model/Trabajo");
const Evento_1 = require("../model/Evento");
const Usuario_1 = require("../model/Usuario");
const Foro_1 = require("../model/Foros/Foro");
exports.typeDefs = apollo_server_express_1.gql `

    type InfoDiagramaProyecto{
        posicion:Coords
    }

    type PeticionBienProyecto{
        id: ID,
        idBeneficiario:String,
        cantidadSolicitada: Float,
        cantidadAsignada: Float
    }

    type PeticionServicioProyecto{
        id: ID,
        idBeneficiario:String,        
    }
    

    type VinculoNodoProyecto{
        idRef:ID,
        tipo:String,
        tipoRef:String,
    }

    type ServicioProyecto{
        id: ID,
        nombre: String,
        descripcion: String,      
        listaPeticiones: [PeticionServicioProyecto]                  
    }

    input InputPeticionBienProyecto{
        id:ID,
        idBeneficiario: ID,
        cantidadSolicitada:Float,
        cantidadAsignada:Float,
    }

    type BienProyecto{
        id: ID,
        nombre: String,
        descripcion: String,
        unidad: String,
        cantidad: Float,
        fechaCierre: Date,
        fechaReparticion: Date,
        instruccionesRecibir:String,
        listaPeticiones: [PeticionBienProyecto]
    }

    type ObjetivoDeProyecto{
       id: ID,
       nombre: String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,
       descripcion:String,       
       vinculos:[VinculoNodoProyecto],
       keywords:String,       
       estadoDesarrollo:String,       
       coords: Coords,       
   }

   type TrabajoDeProyecto{
       id: ID,       
       nombre: String,
       descripcion:String,
       responsables: [String],
       posiblesResponsables:[String],
       responsablesSolicitados:Int,       
       nodosConocimiento:[String],              
       vinculos:[VinculoNodoProyecto],
       keywords:String,       
       estadoDesarrollo:String,                   
       coords: Coords,       
   }

    type Proyecto{
        id: ID,
        nombre: String,
        descripcion:String,
        responsables: [String],
        participantes: [String],
        posiblesResponsables:[String],
        responsablesSolicitados:Int,
        personasResponsables:[Usuario]
        personasPosiblesResponsables:[Usuario],
        bienes:[BienProyecto],
        servicios:[ServicioProyecto],
        trabajos: [TrabajoDeProyecto],
        objetivos: [ObjetivoDeProyecto],
        idForo:ID,
        idsTrabajos:[ID],
        materiales:[MaterialTrabajo],
    }    

   union NodoProyecto=ObjetivoDeProyecto | TrabajoDeProyecto

   type RespuestaNodoProyecto{
       nodo: NodoProyecto,
   }

   type PaginaTrabajosProyectos{
        hayMas:Boolean,
        infoTrabajos:[InfoBasicaTrabajo]
    }

    extend type Query{
        proyectos: [Proyecto!],
        proyecto(idProyecto:ID!): Proyecto

        listaTodosTrabajosProyectos(pagina: Int!, pagina:Int!):PaginaTrabajosProyectos,
    }
    extend type Mutation{
        editarNombreProyecto(idProyecto: ID!, nuevoNombre: String!):Proyecto,
        editarDescripcionProyecto(idProyecto: ID!, nuevoDescripcion: String!):Proyecto,
        crearProyecto:Proyecto, 
        eliminarProyecto(idProyecto:ID!):Boolean,       
        addResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        addParticipanteProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        removeParticipanteProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        addPosibleResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        removeResponsableProyecto(idProyecto:ID!, idUsuario:ID!):Proyecto,
        setResponsablesSolicitadosProyecto(idProyecto:ID!, nuevoCantidadResponsablesSolicitados: Int!):Proyecto,
        
        crearTrabajoEnProyecto(idProyecto: ID!, posicion:CoordsInput):TrabajoDeProyecto,
        eliminarTrabajoDeProyecto(idTrabajo:ID!, idProyecto:ID!):Boolean,
        editarNombreTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoNombre: String!):TrabajoDeProyecto,
        editarDescripcionTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoDescripcion: String!):TrabajoDeProyecto,
        addResponsableTrabajoProyecto(idTrabajo:ID!,idUsuario:ID!):TrabajoDeProyecto,
        addPosibleResponsableTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, idUsuario:ID!):TrabajoDeProyecto,
        removeResponsableTrabajoProyecto(idProyecto: ID!, idTrabajo:ID!, idUsuario:ID!):TrabajoDeProyecto,
        setPosicionTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevaPosicion:CoordsInput):TrabajoDeProyecto,
        editarKeywordsTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoKeywords: String!):TrabajoDeProyecto,
        setEstadoTrabajoProyecto(idProyecto:ID!, idTrabajo:ID!, nuevoEstado:String!):TrabajoDeProyecto,

        crearObjetivoEnProyecto(idProyecto: ID!, posicion:CoordsInput):ObjetivoDeProyecto,
        eliminarObjetivoDeProyecto(idObjetivo:ID!, idProyecto:ID!):Boolean,
        editarNombreObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoNombre: String!):ObjetivoDeProyecto,
        editarDescripcionObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoDescripcion: String!):ObjetivoDeProyecto,
        addResponsableObjetivoProyecto(idObjetivo:ID!,idUsuario:ID!):ObjetivoDeProyecto,
        addPosibleResponsableObjetivoProyecto(idObjetivo:ID!, idUsuario:ID!):ObjetivoDeProyecto,
        removeResponsableObjetivoProyecto(idObjetivo:ID!, idUsuario:ID!):ObjetivoDeProyecto,
        setPosicionObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevaPosicion:CoordsInput):ObjetivoDeProyecto,
        editarKeywordsObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoKeywords: String!):ObjetivoDeProyecto,
        setEstadoObjetivoProyecto(idProyecto:ID!, idObjetivo:ID!, nuevoEstado:String!):ObjetivoDeProyecto,

        crearBienRepartirVacioProyecto(idProyecto: ID!):BienProyecto,
        setNombreBienProyecto(idProyecto: ID!, idBien: ID!, nuevoNombre: String!):BienProyecto,
        setUnidadBienProyecto(idProyecto: ID!, idBien: ID!, nuevoUnidad: String!):BienProyecto,
        setCantidadBienProyecto(idProyecto: ID!, idBien: ID!, nuevoCantidad: Float!):BienProyecto,
        setFechaCierreBienProyecto(idProyecto: ID!, idBien: ID!, nuevoFechaCierre: Date!):BienProyecto,
        setFechaReparticionBienProyecto(idProyecto: ID!, idBien: ID!, nuevoFechaReparticion: Date!):BienProyecto,
        eliminarBienProyecto(idProyecto: ID!, idBien: ID!):Boolean,
        addPeticionBienProyecto(idProyecto: ID!, idBien: ID!, peticion: InputPeticionBienProyecto!):PeticionBienProyecto,

        crearRequerimentoEntreNodosProyecto(idProyecto:ID!, idNodoRequiere:ID!, idNodoRequerido:ID!, tipoNodoRequiere:String!, tipoNodoRequerido:String!):RespuestaNodoProyecto,
        desvincularNodosProyecto(idProyecto:ID!, idNodoRequiere:ID!, idNodoRequerido:ID!, tipoNodoRequiere:String!, tipoNodoRequerido:String!):RespuestaNodoProyecto,

    }
    
    
`;
exports.resolvers = {
    Query: {
        proyectos: function (_, args, context) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`enviando lista de todos los proyectos`);
                try {
                    var listaP = yield Proyecto_1.ModeloProyecto.find({}).exec();
                }
                catch (error) {
                    console.log(`error buscando la lista de proyectos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("");
                }
                return listaP;
            });
        },
        proyecto: function (_, { idProyecto }, context) {
            return __awaiter(this, void 0, void 0, function* () {
                //   organizarDiagrama(idProyecto);
                console.log(`Buscando proyecto con id ${idProyecto}`);
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                    console.log(`En participantes: ${elProyecto.participantes}`);
                }
                catch (error) {
                    console.log(`Error buscando el proyecto. E:${error}`);
                    throw new apollo_server_express_1.ApolloError("Error en la conexión con la base de datos");
                }
                let tieneForo = true;
                if (!elProyecto.idForo) {
                    tieneForo = false;
                }
                else {
                    try {
                        let elForo = yield Foro_1.ModeloForo.findById(elProyecto.idForo).exec();
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
                    console.log(`El proyecto ${elProyecto.nombre} no tenía foro. Creando con responsables: ${elProyecto.responsables}.`);
                    try {
                        var nuevoForo = yield Foro_1.ModeloForo.create({
                            miembros: elProyecto.responsables,
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
                        elProyecto.idForo = idNuevoForo;
                        yield elProyecto.save();
                    }
                    catch (error) {
                        console.log(`Error guardando el proyecto`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                return elProyecto;
            });
        },
        listaTodosTrabajosProyectos(_, { pagina }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Petición de info basica de todos trabajos de proyectos`);
                const sizePaginaTrabajos = 35;
                if (contexto.usuario.id === "") {
                    console.log(`Usuario no logeado`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                try {
                    var numTrabajos = yield Trabajo_1.ModeloTrabajo.countDocuments({}).exec();
                    console.log(`Hay ${numTrabajos} trabajos en la base de datos`);
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({}, "nombre").limit(sizePaginaTrabajos).skip(pagina * sizePaginaTrabajos).exec();
                }
                catch (error) {
                    console.log(`Error buscando trabajos. E: ${error}`);
                    return new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                let hayMas = (pagina + 1) * sizePaginaTrabajos < numTrabajos;
                console.log(`Enviando pagina ${pagina} de trabajos`);
                return { hayMas, infoTrabajos: losTrabajos };
            });
        },
    },
    Mutation: {
        addPosibleResponsableProyecto: function (_, { idProyecto, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del proyecto ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion añadiendo posible responsable del proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (elProyecto.posiblesResponsables.includes(idUsuario) || elProyecto.responsables.includes(idUsuario)) {
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
                    elProyecto.posiblesResponsables.push(idUsuario);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Proyecto guardado`);
                return elProyecto;
            });
        },
        addResponsableProyecto: function (_, { idProyecto, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (elProyecto.responsables.length > 0 && !credencialesUsuario.permisos.includes("superadministrador") && !elProyecto.responsables.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion. Hay ${elProyecto.responsables.length} responsables: ${elProyecto.responsables}`);
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
                if (elProyecto.responsables.includes(idUsuario)) {
                    console.log(`El usuario ya era responsable de este proyecto`);
                    throw new apollo_server_express_1.ApolloError("El usuario ya estaba incluido");
                }
                elProyecto.responsables.push(idUsuario);
                if (elProyecto.responsablesSolicitados > 0)
                    elProyecto.responsablesSolicitados--;
                console.log(`Usuario añadido a la lista de responsables`);
                let indexPosibleResponsable = elProyecto.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elProyecto.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                let indexParticipante = elProyecto.participantes.indexOf(idUsuario);
                if (indexParticipante > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de participantes`);
                    elProyecto.participantes.splice(indexParticipante, 1);
                }
                //Añadir como participante en todos los eventos de este proyecto
                try {
                    var eventosProyecto = yield Evento_1.ModeloEvento.find({ idOrigen: elProyecto.id }).exec();
                }
                catch (error) {
                    console.log(`Error descargando los eventos del proyecto: ${error}`);
                }
                eventosProyecto.forEach(function (e) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let indexU = e.participantes.indexOf(idUsuario);
                        if (indexU > -1) {
                            e.participantes.splice(indexU, 1);
                        }
                        e.participantes.push(idUsuario);
                        try {
                            yield e.save();
                        }
                        catch (error) {
                            console.log(`Error guardando el evento con el nuevo participante: ${error}`);
                        }
                    });
                });
                //Guardar proyecto
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Mirror responsables del proyecto hacia miembros del foro
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elProyecto.idForo, { miembros: elProyecto.participantes.concat(elProyecto.responsables) });
                }
                catch (error) {
                    console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
                }
                console.log(`Proyecto guardado`);
                return elProyecto;
            });
        },
        removeResponsableProyecto: function (_, { idProyecto, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de remover un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion removiendo responsable o posible responsable de proyecto`);
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
                let indexPosibleResponsable = elProyecto.posiblesResponsables.indexOf(idUsuario);
                if (indexPosibleResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles responsables`);
                    elProyecto.posiblesResponsables.splice(indexPosibleResponsable, 1);
                }
                let indexResponsable = elProyecto.responsables.indexOf(idUsuario);
                if (indexResponsable > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de responsables`);
                    elProyecto.responsables.splice(indexResponsable, 1);
                }
                //Retirar como participante en todos los eventos de este proyecto
                try {
                    var eventosProyecto = yield Evento_1.ModeloEvento.find({ idOrigen: elProyecto.id }).exec();
                }
                catch (error) {
                    console.log(`Error descargando los eventos del proyecto: ${error}`);
                }
                eventosProyecto.forEach(function (e) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let indexU = e.participantes.indexOf(idUsuario);
                        if (indexU > -1) {
                            e.participantes.splice(indexU, 1);
                        }
                        try {
                            yield e.save();
                        }
                        catch (error) {
                            console.log(`Error guardando el evento con el nuevo participante: ${error}`);
                        }
                    });
                });
                //Guardar el proyecto
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Mirror responsables del proyecto hacia miembros del foro
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elProyecto.idForo, { miembros: elProyecto.participantes.concat(elProyecto.responsables) });
                }
                catch (error) {
                    console.log(`Error mirroring responsables del proyecto hacia miembros del foro. E: ${error}`);
                }
                console.log(`Proyecto guardado`);
                return elProyecto;
            });
        },
        addParticipanteProyecto: function (_, { idProyecto, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add como participante un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                const permisosEspeciales = ["superadministrador"];
                if (credencialesUsuario.id != idUsuario && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion. Hay ${elProyecto.participantes.length} participantes: ${elProyecto.participantes}`);
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
                if (elProyecto.participantes.includes(idUsuario)) {
                    console.log(`El usuario ya era participante de este proyecto`);
                    throw new apollo_server_express_1.UserInputError("El usuario ya estaba incluido");
                }
                elProyecto.participantes.push(idUsuario);
                console.log(`Usuario añadido a la lista de participantes`);
                //Añadir como participante en todos los eventos de este proyecto
                try {
                    var eventosProyecto = yield Evento_1.ModeloEvento.find({ idOrigen: elProyecto.id }).exec();
                }
                catch (error) {
                    console.log(`Error descargando los eventos del proyecto: ${error}`);
                }
                eventosProyecto.forEach(function (e) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let indexU = e.participantes.indexOf(idUsuario);
                        if (indexU > -1) {
                            e.participantes.splice(indexU, 1);
                        }
                        e.participantes.push(idUsuario);
                        try {
                            yield e.save();
                        }
                        catch (error) {
                            console.log(`Error guardando el evento con el nuevo participante: ${error}`);
                        }
                    });
                });
                //Guardar proyecto
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Mirror participantes del proyecto hacia miembros del foro
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elProyecto.idForo, { miembros: elProyecto.participantes.concat(elProyecto.responsables) });
                }
                catch (error) {
                    console.log(`Error mirroring participantes del proyecto hacia miembros del foro. E: ${error}`);
                }
                console.log(`Proyecto guardado`);
                return elProyecto;
            });
        },
        removeParticipanteProyecto: function (_, { idProyecto, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de remover un usuario con id ${idUsuario} a un proyecto con id ${idProyecto}`);
                let credencialesUsuario = contexto.usuario;
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                //Authorización
                if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador")) {
                    console.log(`Error de autenticacion removiendo participante o posible participante de proyecto`);
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
                let indexParticipante = elProyecto.participantes.indexOf(idUsuario);
                if (indexParticipante > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de participantes`);
                    elProyecto.participantes.splice(indexParticipante, 1);
                }
                //Retirar como participante en todos los eventos de este proyecto
                try {
                    var eventosProyecto = yield Evento_1.ModeloEvento.find({ idOrigen: elProyecto.id }).exec();
                }
                catch (error) {
                    console.log(`Error descargando los eventos del proyecto: ${error}`);
                }
                eventosProyecto.forEach(function (e) {
                    return __awaiter(this, void 0, void 0, function* () {
                        let indexU = e.participantes.indexOf(idUsuario);
                        if (indexU > -1) {
                            e.participantes.splice(indexU, 1);
                        }
                        try {
                            yield e.save();
                        }
                        catch (error) {
                            console.log(`Error guardando el evento con el nuevo participante: ${error}`);
                        }
                    });
                });
                //Guardando el proyecto
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                //Mirror participantes del proyecto hacia miembros del foro
                try {
                    yield Foro_1.ModeloForo.findByIdAndUpdate(elProyecto.idForo, { miembros: elProyecto.participantes.concat(elProyecto.responsables) });
                }
                catch (error) {
                    console.log(`Error mirroring participantes del proyecto hacia miembros del foro. E: ${error}`);
                }
                console.log(`Proyecto guardado`);
                return elProyecto;
            });
        },
        setResponsablesSolicitadosProyecto: function (_, { idProyecto, nuevoCantidadResponsablesSolicitados }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                let credencialesUsuario = contexto.usuario;
                console.log(`Solicitud de set cantidad de responsables solicitados de ${nuevoCantidadResponsablesSolicitados} en proyecto con id ${idProyecto}`);
                try {
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Error buscando el proyecto en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error de conexión con la base de datos");
                }
                if (!credencialesUsuario.permisos.includes("superadministrador") && !elProyecto.responsables.includes(credencialesUsuario.id)) {
                    console.log(`Error de autenticacion editando responsables solicitados.`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                elProyecto.responsablesSolicitados = nuevoCantidadResponsablesSolicitados;
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Retornando con ${elProyecto.responsablesSolicitados} responsables solicitados`);
                return elProyecto;
            });
        },
        editarNombreProyecto: function (_, { idProyecto, nuevoNombre }, contexto) {
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
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const charProhibidosNombreProyecto = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreProyecto.test(nuevoNombre)) {
                    throw new apollo_server_express_1.ApolloError("Nombre ilegal");
                }
                nuevoNombre = nuevoNombre.trim();
                try {
                    console.log(`guardando nuevo nombre ${elProyecto.nombre} en la base de datos`);
                    var resProyecto = yield Proyecto_1.ModeloProyecto.findByIdAndUpdate(idProyecto, { nombre: nuevoNombre }, { new: true }).exec();
                }
                catch (error) {
                    console.log(`error guardando el proyecto con coordenadas manuales: ${error}`);
                }
                console.log(`Nombre guardado`);
                return resProyecto;
            });
        },
        editarDescripcionProyecto: function (_, { idProyecto, nuevoDescripcion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`|||||||||||||||||||`);
                console.log(`Solicitud de set descripcion del proyecto con id ${idProyecto}`);
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
                const charProhibidosDescripcionProyecto = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionProyecto.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                try {
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    var resProyecto = yield Proyecto_1.ModeloProyecto.findByIdAndUpdate(idProyecto, { descripcion: nuevoDescripcion }, { new: true }).exec();
                }
                catch (error) {
                    console.log(`error guardando el proyecto: ${error}`);
                }
                console.log(`Descripcion guardado`);
                return resProyecto;
            });
        },
        crearProyecto(_, args, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`mutacion`);
                let usuario = contexto.usuario;
                if (!usuario) {
                    console.log(`Intento de crear un nuevo proyecto sin nombre de usuario seteado en el contexto`);
                    //throw new AuthenticationError("No autorizado");
                }
                if (!usuario.id) {
                    console.log(`No había id del usuario creador`);
                    throw new apollo_server_express_1.ApolloError("No ID");
                }
                console.log(`el usuario ${usuario.username} intenta crear un nuevo proyecto`);
                let elProyecto = yield new Proyecto_1.ModeloProyecto({
                    responsables: [usuario.id]
                });
                try {
                    var nuevoForo = yield Foro_1.ModeloForo.create({
                        acceso: "privado",
                        miembros: elProyecto.responsables,
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
                    elProyecto.idForo = idNuevoForo;
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el nuevo proyecto. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("error");
                }
                console.log(`proyecto creado`);
                return elProyecto;
            });
        },
        eliminarProyecto(_, { idProyecto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`peticion de eliminar un proyecto con id ${idProyecto}`);
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
                let esUltimoResponsable = (elProyecto.responsables.length == 1 && elProyecto.responsables[0] == credencialesUsuario.id);
                if (!esUltimoResponsable && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando nombre de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                console.log(`Eliminando eventos con idOrigen: ${idProyecto}`);
                try {
                    yield Evento_1.ModeloEvento.deleteMany({ idOrigen: idProyecto }).exec();
                }
                catch (error) {
                    console.log(`Error buscando eventos con idOrigen: ${idProyecto} para eliminarlos`);
                }
                try {
                    yield Proyecto_1.ModeloProyecto.findByIdAndDelete(idProyecto).exec();
                }
                catch (error) {
                    console.log("Error guardando el trabajo creado en el proyecto. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        crearTrabajoEnProyecto(_, { idProyecto, posicion }, contexto) {
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
                try {
                    var nuevoTrabajo = elProyecto.trabajos.create({
                        coords: posicion
                    });
                    elProyecto.trabajos.push(nuevoTrabajo);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error creando el nuevo trabajo. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevoTrabajo;
            });
        },
        eliminarTrabajoDeProyecto(_, { idTrabajo, idProyecto }, contexto) {
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
                elProyecto.trabajos.pull({ id: idTrabajo });
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error eliminando trabajo. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error introduciendo el trabajo en el proyecto");
                }
                console.log(`eliminado`);
                return true;
            });
        },
        editarNombreTrabajoProyecto(_, { idProyecto, idTrabajo, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`cambiando el nombre del trabajo con id ${idTrabajo} del proyecto con id ${idProyecto}`);
                const charProhibidosNombreTrabajo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
                if (charProhibidosNombreTrabajo.test(nuevoNombre)) {
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
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
                try {
                    elTrabajo.nombre = nuevoNombre;
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error cambiando el nombre en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error guardando el nombre en la base de datos");
                }
                console.log(`Nombre cambiado`);
                return elTrabajo;
            });
        },
        editarDescripcionTrabajoProyecto(_, { idProyecto, idTrabajo, nuevoDescripcion }, contexto) {
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
                const charProhibidosDescripcionTrabajo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?@=-]/;
                if (charProhibidosDescripcionTrabajo.test(nuevoDescripcion)) {
                    throw new apollo_server_express_1.ApolloError("Descripcion ilegal");
                }
                nuevoDescripcion = nuevoDescripcion.trim();
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
                try {
                    elTrabajo.descripcion = nuevoDescripcion;
                    console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Descripcion guardado`);
                return elTrabajo;
            });
        },
        editarKeywordsTrabajoProyecto(_, { idProyecto, idTrabajo, nuevoKeywords }, contexto) {
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
                const charProhibidosKeywordsTrabajo = /[^ a-zA-Zñ,]/;
                if (charProhibidosKeywordsTrabajo.test(nuevoKeywords)) {
                    throw new apollo_server_express_1.ApolloError("Keywords ilegal");
                }
                nuevoKeywords = nuevoKeywords.trim();
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
                try {
                    elTrabajo.keywords = nuevoKeywords;
                    console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                }
                console.log(`Keywords guardado`);
                return elTrabajo;
            });
        },
        addResponsableTrabajoProyecto: function (_, { idProyecto, idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de add un usuario con id ${idUsuario} a un trabajo de id ${idTrabajo}`);
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
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
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
                try {
                    const indexT = elUsuario.misTrabajos.indexOf(elTrabajo._id);
                    if (indexT > -1)
                        elUsuario.misTrabajos.splice(indexT, 1);
                    elTrabajo.responsables.push(idUsuario);
                    if (elTrabajo.responsablesSolicitados > 0)
                        elTrabajo.responsablesSolicitados--;
                    elUsuario.misTrabajos.push(elTrabajo._id);
                    console.log(`Usuario añadido a la lista de responsables`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Trabajo guardado`);
                return elTrabajo;
            });
        },
        addPosibleResponsableTrabajoProyecto: function (_, { idProyecto, idTrabajo, idUsuario }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`añadiendo usuario ${idUsuario} a la lista de posibles responsables del trabajo ${idTrabajo}`);
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
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
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
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                console.log(`Trabajo guardado`);
                return elTrabajo;
            });
        },
        removeResponsableTrabajoProyecto: function (_, { idProyecto, idTrabajo, idUsuario }, contexto) {
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
                    var elProyecto = yield Proyecto_1.ModeloProyecto.findById(idProyecto).exec();
                    if (!elProyecto) {
                        throw "proyecto no encontrado";
                    }
                }
                catch (error) {
                    console.log("Proyecto no encontrado. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectandose con la base de datos");
                }
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
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
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log("Error guardando datos en la base de datos. E: " + error);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                console.log(`Trabajo guardado`);
                return elTrabajo;
            });
        },
        setPosicionTrabajoProyecto: function (_, { idProyecto, idTrabajo, nuevaPosicion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de set posicion de trabajo en el diagrama del proyecto`);
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
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
                try {
                    elTrabajo.coords = nuevaPosicion;
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                }
                return elTrabajo;
            });
        },
        setEstadoTrabajoProyecto(_, { idProyecto, idTrabajo, nuevoEstado }, contexto) {
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
                var elTrabajo = elProyecto.trabajos.id(idTrabajo);
                try {
                    elTrabajo.estadoDesarrollo = nuevoEstado;
                    console.log(`guardando nuevo estado ${nuevoEstado} en la base de datos`);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`error guardando el trabajo modificado: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error guardando información en la base de datos");
                }
                console.log(`Estado guardado`);
                return elTrabajo;
            });
        },
        crearBienRepartirVacioProyecto: function (_, { idProyecto }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de crear nuevo bien para repartir vacío en el proyecto con id ${idProyecto}`);
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var nuevoBien = elProyecto.bienes.create();
                elProyecto.bienes.push(nuevoBien);
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto con un nuevo bien`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return nuevoBien;
            });
        },
        setNombreBienProyecto: function (_, { idProyecto, idBien, nuevoNombre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const charProhibidosNombreBien = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                if (charProhibidosNombreBien.test(nuevoNombre)) {
                    throw new apollo_server_express_1.UserInputError("El nuevo nombre contiene caracteres no permitidos");
                }
                console.log(`Solicitud de set nombre para un bien con id ${idBien} en un proyecto con id ${idProyecto}`);
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elBien = elProyecto.bienes.id(idBien);
                elBien.nombre = nuevoNombre;
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto con un nuevo bien`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elBien;
            });
        },
        setUnidadBienProyecto: function (_, { idProyecto, idBien, nuevoUnidad }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                const charProhibidosUnidadBien = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
                if (charProhibidosUnidadBien.test(nuevoUnidad)) {
                    throw new apollo_server_express_1.UserInputError("La nuevo unidad contiene caracteres no permitidos");
                }
                console.log(`Solicitud de set unidad para un bien con id ${idBien} en un proyecto con id ${idProyecto}`);
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elBien = elProyecto.bienes.id(idBien);
                elBien.unidad = nuevoUnidad;
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto con un nuevo bien`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elBien;
            });
        },
        setCantidadBienProyecto: function (_, { idProyecto, idBien, nuevoCantidad }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de set cantidad para un bien con id ${idBien} en un proyecto con id ${idProyecto}`);
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elBien = elProyecto.bienes.id(idBien);
                elBien.cantidad = nuevoCantidad;
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto con un nuevo bien`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elBien;
            });
        },
        setFechaCierreBienProyecto: function (_, { idProyecto, idBien, nuevoFechaCierre }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de set fechaCierre para un bien con id ${idBien} en un proyecto con id ${idProyecto}`);
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elBien = elProyecto.bienes.id(idBien);
                elBien.fechaCierre = nuevoFechaCierre;
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto con un nuevo bien`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elBien;
            });
        },
        setFechaReparticionBienProyecto: function (_, { idProyecto, idBien, nuevoFechaReparticion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de set fechaReparticion para un bien con id ${idBien} en un proyecto con id ${idProyecto}`);
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var elBien = elProyecto.bienes.id(idBien);
                elBien.fechaReparticion = nuevoFechaReparticion;
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto con un nuevo bien`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return elBien;
            });
        },
        eliminarBienProyecto: function (_, { idProyecto, idBien }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de eliminar un bien con id ${idBien} en un proyecto con id ${idProyecto}`);
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
                let permisosEspeciales = ["superadministrador"];
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion editando Estado de proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                var indexElBien = elProyecto.bienes.findIndex(b => b.id == idBien);
                if (indexElBien > -1) {
                    elProyecto.bienes.splice(indexElBien, 1);
                }
                else {
                    console.log(`El bien no existía`);
                    throw new apollo_server_express_1.UserInputError("El bien a eliminar no existía en el proyecto");
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto tras eliminar un bien`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return true;
            });
        },
        addPeticionBienProyecto: function (_, { idProyecto, idBien, peticion }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de crear una peticion para el bien con id ${idBien} con info ${peticion}`);
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
                var elBien = elProyecto.bienes.id(idBien);
                if (!elBien) {
                    console.log(`El bien no existía`);
                    throw new apollo_server_express_1.UserInputError("El bien no existía en el proyecto");
                }
                var indexPeticion = elBien.listaPeticiones.findIndex(p => p.idBeneficiario == peticion.idBeneficiario);
                if (indexPeticion > -1) {
                    elBien.listaPeticiones.splice(indexPeticion, 1);
                }
                var laPeticion = elBien.listaPeticiones.create(peticion);
                if (peticion.cantidadSolicitada > 0) {
                    elBien.listaPeticiones.push(laPeticion);
                }
                try {
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el proyecto con una nueva peticion en un bien`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return laPeticion;
            });
        },
        crearRequerimentoEntreNodosProyecto: function (_, { idProyecto, idNodoRequiere, idNodoRequerido, tipoNodoRequiere, tipoNodoRequerido }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de crear un requerimento entre un ${tipoNodoRequiere} con id ${idNodoRequiere} que requiere a un ${tipoNodoRequerido} con id ${idNodoRequerido}`);
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
                const permisosEspeciales = ["superadministrador"];
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando vinculos en proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                const vinculo = {
                    idRef: idNodoRequerido,
                    tipoRef: tipoNodoRequerido,
                    tipo: "requiere"
                };
                if (tipoNodoRequiere === "objetivo") {
                    try {
                        var elqueRequiere = elProyecto.objetivos.id(idNodoRequiere);
                        if (!elqueRequiere)
                            throw "El objetivo que requiere no encontrado";
                        elqueRequiere.tipo = "ObjetivoDeProyecto";
                    }
                    catch (error) {
                        console.log(`Error buscando al que requiere. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                else if (tipoNodoRequiere === "trabajo") {
                    try {
                        var elqueRequiere = elProyecto.trabajos.id(idNodoRequiere);
                        if (!elqueRequiere)
                            throw "El objetivo que requiere no encontrado";
                        elqueRequiere.tipo = "TrabajoDeProyecto";
                    }
                    catch (error) {
                        console.log(`Error buscando al que requiere. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                else {
                    console.log(`Tipo de nodo que requiere no reconocido`);
                    throw new apollo_server_express_1.ApolloError("Error. Tipo " + tipoNodoRequiere + " no soportado");
                }
                const indexV = elqueRequiere.vinculos.findIndex(v => v.idRef === idNodoRequerido);
                if (indexV > -1) {
                    console.log(`Reemplazando un vinculo ya existente`);
                    elqueRequiere.vinculos.splice(indexV, 1);
                }
                try {
                    elqueRequiere.vinculos.push(vinculo);
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el nodo modificado en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return { nodo: elqueRequiere };
            });
        },
        desvincularNodosProyecto: function (_, { idProyecto, idNodoRequiere, idNodoRequerido, tipoNodoRequiere, tipoNodoRequerido }, contexto) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Solicitud de eliminar vínculo entre un ${tipoNodoRequiere} con id ${idNodoRequiere} que requiere a un ${tipoNodoRequerido} con id ${idNodoRequerido}`);
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
                const permisosEspeciales = ["superadministrador"];
                let credencialesUsuario = contexto.usuario;
                if (!elProyecto.responsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion eliminando vinculos en proyecto`);
                    throw new apollo_server_express_1.AuthenticationError("No autorizado");
                }
                if (tipoNodoRequiere === "objetivo") {
                    try {
                        var elqueRequiere = elProyecto.objetivos.id(idNodoRequiere);
                        if (!elqueRequiere)
                            throw "El objetivo que requiere no encontrado";
                        elqueRequiere.tipo = "ObjetivoDeProyecto";
                    }
                    catch (error) {
                        console.log(`Error buscando al que requiere. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                else if (tipoNodoRequiere === "trabajo") {
                    try {
                        var elqueRequiere = elProyecto.trabajos.id(idNodoRequiere);
                        if (!elqueRequiere)
                            throw "El trabajo que requiere no encontrado";
                        elqueRequiere.tipo = "TrabajoDeProyecto";
                    }
                    catch (error) {
                        console.log(`Error buscando al que requiere. E: ${error}`);
                        throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                    }
                }
                else {
                    console.log(`Tipo de nodo que requiere no reconocido`);
                    throw new apollo_server_express_1.ApolloError("Error. Tipo " + tipoNodoRequiere + " no soportado");
                }
                try {
                    const indexV = elqueRequiere.vinculos.findIndex(v => v.idRef === idNodoRequerido);
                    if (indexV > -1) {
                        console.log(`Eliminando vinculo`);
                        elqueRequiere.vinculos.splice(indexV, 1);
                    }
                    else {
                        console.log(`El vinculo no existía`);
                        throw new apollo_server_express_1.ApolloError("El vinculo no existia");
                    }
                    yield elProyecto.save();
                }
                catch (error) {
                    console.log(`Error guardando el nodo modificado en la base de datos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                return { nodo: elqueRequiere };
            });
        },
    },
    Proyecto: {
        personasResponsables: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.responsables) {
                    return [];
                }
                let idsResponsables = parent.responsables;
                try {
                    var usuariosResponsables = yield Usuario_1.ModeloUsuario.find({ _id: { $in: idsResponsables } }).exec();
                    if (!usuariosResponsables) {
                        console.log(`No habia usuarios responsables`);
                    }
                }
                catch (error) {
                    console.log(`error buscando a los responsables del proyecto. E: ${error}`);
                    return [];
                }
                return usuariosResponsables;
            });
        },
        personasPosiblesResponsables: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!parent.posiblesResponsables) {
                    return [];
                }
                let idsPosiblesResponsables = parent.posiblesResponsables;
                try {
                    var usuariosPosiblesResponsables = Usuario_1.ModeloUsuario.find({ _id: { $in: idsPosiblesResponsables } }).exec();
                }
                catch (error) {
                    console.log(`error buscando a los posiblesResponsables del proyecto. E: ${error}`);
                    return [];
                }
                return usuariosPosiblesResponsables;
            });
        },
        materiales: function (parent, _, __) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`Resolviendo materiales de ${parent.id} con ${parent.idsTrabajos.length} trabajos`);
                try {
                    var losTrabajos = yield Trabajo_1.ModeloTrabajo.find({ "_id": { $in: parent.idsTrabajos } }).select("nombre materiales").exec();
                }
                catch (error) {
                    console.log(`Error querying los trabajos. E: ${error}`);
                    throw new apollo_server_express_1.ApolloError("Error conectando con la base de datos");
                }
                var aMateriales = [];
                for (var i = 0; i < losTrabajos.length; i++) {
                    let esteTrabajo = losTrabajos[i];
                    for (var j = 0; j < esteTrabajo.materiales.length; j++) {
                        let esteMaterial = esteTrabajo.materiales[j];
                        esteMaterial.idTrabajoParent = esteTrabajo._id;
                        aMateriales.push(esteMaterial);
                    }
                }
                return aMateriales;
            });
        },
    },
    NodoProyecto: {
        __resolveType: function (nodo) {
            return nodo.tipo;
        }
    }
};
