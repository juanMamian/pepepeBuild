import { ApolloError, AuthenticationError, UserInputError } from "apollo-server-express";
import { ModeloEventoPublico as EventoPublico, ModeloEventoPersonal as EventoPersonal } from "../model/Evento";
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { charProhibidosNombreCosa, charProhibidosTexto } from "../model/config";
import { ModeloEspacio as Espacio } from "../model/Espacio";
import { ModeloNodoSolidaridad as NodoSolidaridad } from "../model/atlasSolidaridad/NodoSolidaridad";
import { getResponsablesAmplioNodo } from "./AtlasSolidaridad";
var mongoose = require('mongoose');
export const typeDefs = `#graphql
    
    type InfoEventoCalendario{
        id:ID,
        tipoParent:String,
        nombreParent:String,
        participantes:Usuario
    }

    input InputCrearEventoPublico{
        
        nombre:String,
        descripcion: String,
        horarioInicio:Date,
        horarioFinal:Date,
        idAdministrador:ID,
        limiteDeCupos:Int,
        lugar:ID,
        idParent: ID,
        tipoParent:String
    }
    input InputCrearEventoPersonal{        
        idPersona:ID!,
        idParent: ID,
        tipoParent:String,
        nombre:String,
        descripcion: String,
        horarioInicio:Date,
        horarioFinal:Date,
        idEventoMarco:ID,
        lugar:ID,

    }

    type EventoPublico{
        id: ID,
        nombre: String,
        descripcion: String,  
        idAdministrador: ID,
        limiteDeCupos:Int,      
        horarioInicio: Date,
        horarioFinal: Date,
        participantes:[String],    
        lugar: ID,
        idParent:ID,
        tipoParent:String,
        eventosEnmarcados:[EventoPersonal]
    }

    type EventoPersonal{
        id: ID,        
        idPersona:ID,
        idParent:ID,
        tipoParent:String,        
        nombre: String,
        descripcion: String,          
        horarioInicio: Date,
        horarioFinal: Date,        
        idEventoMarco:ID,
        lugar:ID,
        nombresPersona:String,
        idsParticipantes:[String],
    }

    type infoDiaEventos{
        year:Int,
        mes:Int,
        dia: Int,
        cantidadEventos:Int,
    }

    union Evento = EventoPersonal | EventoPublico

    extend type Query{
        eventoPublico(idEvento:ID!):EventoPublico,
        todosEventosPublicos:[EventoPublico],
        eventosPublicosDia(dateInicioDia:Date!):[EventoPublico],
        eventosPublicosEspacio(idEspacio:ID!):[EventoPublico],
        
        eventosPersonalesDia(dateInicioDia:Date!, idUsuario:ID!):[EventoPersonal],
        eventosPersonalesDeParentDia(dateInicioDia:Date!, idParent:ID!, tipoParent:String!):[EventoPersonal],

        eventoPersonal(idEvento:ID!):EventoPersonal,

        cantidadEventosRelevantesMes(year:Int!, mes: Int!, idParent:ID!, tipoParent:String!, timeZoneOffset:Int!):[infoDiaEventos],
    }

    extend type Mutation{
        crearEventoPublico(infoNuevoEvento:InputCrearEventoPublico):EventoPublico,        

        crearEventoPersonal(infoEventoPersonal:InputCrearEventoPersonal):EventoPersonal,
        
        eliminarEvento(idEvento:ID!, tipoEvento:String!):Boolean,        
        editarNombreEvento(idEvento:ID!, tipoEvento: String!, nuevoNombre: String!):Evento,
        editarDescripcionEvento(idEvento:ID!, tipoEvento: String!, nuevoDescripcion: String!):Evento,
        editarLimiteDeCuposEvento(idEvento:ID!, tipoEvento: String!, nuevoLimiteDeCupos: Int!):EventoPublico,
        setDateFinalEvento(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
        setDateInicioEvento(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
        setDateInicioEventoHoldDuration(nuevoDate:Date!, tipoEvento: String!, idEvento:ID!):Evento,
        repetirEventoPeriodicamente(periodoRepetir: String, cantidadRepetir:Int!, idEvento:ID!, tipoEvento:String!):[Evento],
        repetirEventosTroughInterval(idParent: ID!, tipoParent:String, idUsuario: ID!, numRepeticiones:Int!, dateFrom: Date!, dateTo:Date!):Boolean,
        deleteEventosTroughInterval(idParent: ID!, tipoParent:String, idUsuario: ID!, dateFrom: Date!, dateTo:Date!):Boolean,

        setLimiteDeCuposEventosPublicosEspacioFromDate(idEspacio:ID!, dateFrom: Date!, limiteDeCupos:Int!):Boolean,

    }
`;
const charProhibidosNombreEvento = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
export const resolvers = {
    Query: {
        async eventoPublico(_, { idEvento }, contexto) {
            try {
                var elEventoPublico = await EventoPublico.findById(idEvento).exec();
            }
            catch (error) {
                console.log(`Error buscando evento: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elEventoPublico;
        },
        async todosEventosPublicos(_, __, contexto) {
            try {
                var losEventosPublicos = await EventoPublico.find({}).exec();
            }
            catch (error) {
                console.log(`Error buscando eventos publicos: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return losEventosPublicos;
        },
        async eventosPublicosDia(_, { dateInicioDia }, contexto) {
            dateInicioDia = new Date(dateInicioDia);
            const millisInicioDia = dateInicioDia.getTime();
            const millisFinalDia = millisInicioDia + 86400000;
            const dateFinalDia = new Date(millisFinalDia);
            try {
                var losEventosPublicosDia = await EventoPublico.find({ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }).exec();
            }
            catch (error) {
                console.log(`Error buscando eventos publicos: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return losEventosPublicosDia;
        },
        async eventosPublicosEspacio(_, { idEspacio }, contexto) {
            console.log(`Query de eventos publicos del espacio ${idEspacio}`);
            try {
                var losEventosPublicosEspacio = await EventoPublico.find({ "idParent": idEspacio }).exec();
            }
            catch (error) {
                console.log(`Error buscando eventos publicos: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losEventosPublicosEspacio.length} eventos públicos del espacio`);
            return losEventosPublicosEspacio;
        },
        async eventosPersonalesDia(_, { dateInicioDia, idUsuario }, contexto) {
            dateInicioDia = new Date(dateInicioDia);
            const millisInicioDia = dateInicioDia.getTime();
            const millisFinalDia = millisInicioDia + 86400000;
            const dateFinalDia = new Date(millisFinalDia);
            try {
                var losEventosPersonalesDia = await EventoPersonal.find().and([{ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }, { $or: [{ idPersona: idUsuario }, { idsParticipantes: idUsuario }] }]).exec();
            }
            catch (error) {
                console.log(`Error buscando eventos personales: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return losEventosPersonalesDia;
        },
        async eventosPersonalesDeParentDia(_, { dateInicioDia, idParent, tipoParent }, contexto) {
            console.log(`Query de eventos personales en el dia ${dateInicioDia} de un ${tipoParent} con id ${idParent}`);
            dateInicioDia = new Date(dateInicioDia);
            const millisInicioDia = dateInicioDia.getTime();
            const millisFinalDia = millisInicioDia + 86400000;
            const dateFinalDia = new Date(millisFinalDia);
            // get personas relevantes del parent
            var personasRelevantes = [];
            if (tipoParent === 'nodoSolidaridad') {
                try {
                    var elNodo = await NodoSolidaridad.findById(idParent).exec();
                }
                catch (error) {
                    console.log(`Error buscando el nodoSolidaridad parent: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
                personasRelevantes = await getResponsablesAmplioNodo(elNodo);
            }
            console.log(`Se buscaran eventos personales de ${personasRelevantes}`);
            try {
                // var losEventosPersonalesDia: any = await EventoPersonal.find().and([{ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }, {"idPersona":{$in:personasRelevantes} } ]).exec();
                var losEventosPersonalesDia = await EventoPersonal.find().and([{ horarioInicio: { $gt: dateInicioDia.getTime(), $lt: dateFinalDia.getTime() } }, { $or: [{ idPersona: { $in: personasRelevantes } }, { idsParticipantes: { $in: personasRelevantes } }] }]).exec();
            }
            catch (error) {
                console.log(`Error buscando eventos personales: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log("\x1b[32m%s\x1b[0m", `Enviando ${losEventosPersonalesDia.length} eventos relevantes`);
            console.log(`De ${losEventosPersonalesDia.map(e => e.idPersona)}`);
            console.log(`Llamados: ${losEventosPersonalesDia.map(e => e.nombre)}`);
            return losEventosPersonalesDia;
        },
        async eventoPersonal(_, { idEvento }, contexto) {
            // if (!contexto.usuario || !contexto.usuario.id) {
            //     console.log(`Usuario no logeado`);
            //     AuthenticationError("Login requerido");
            // }
            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const credencialesUsuario = contexto.usuario;
            try {
                var elEventoPersonal = await EventoPersonal.findById(idEvento).exec();
            }
            catch (error) {
                console.log(`Error buscando evento: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            if (credencialesUsuario.id != elEventoPersonal.idPersona && !elEventoPersonal.idsParticipantes.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Usuario no tenia permisos suficientes`);
                AuthenticationError("No autorizado");
            }
            return elEventoPersonal;
        },
        async cantidadEventosRelevantesMes(_, { year, mes, idParent, tipoParent, timeZoneOffset }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Query for cantidad de eventos relevantes de ${mes} de ${year} para ${tipoParent} con id ${idParent}. timeZoneOffset: ${timeZoneOffset}`);
            var dateInit = new Date(year, mes, 1);
            var dateFin = new Date(year, mes < 11 ? mes + 1 : 0, 1);
            var losEventosRelevantesMes = null;
            var eventosPersonalesRelevantesMes = null;
            var eventosPublicosRelevantesMes = null;
            timeZoneOffset = timeZoneOffset * 60000;
            dateInit = new Date(dateInit.getTime());
            dateFin = new Date(dateFin.getTime());
            try {
                if (tipoParent === 'usuario') {
                    eventosPersonalesRelevantesMes = await EventoPersonal.find().and([{ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() } }, { idPersona: idParent }]).select("horarioInicio").exec();
                    var eventosParticipadosRelevantesMes = await EventoPersonal.find({ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() }, idsParticipantes: idParent }).exec();
                    eventosPublicosRelevantesMes = await EventoPublico.find().and([{ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() } }, { idAdministrador: idParent }]).select("horarioInicio").exec();
                    losEventosRelevantesMes = eventosPersonalesRelevantesMes.concat(eventosPublicosRelevantesMes).concat(eventosParticipadosRelevantesMes);
                }
                else if (tipoParent === 'nodoSolidaridad') {
                    losEventosRelevantesMes = await EventoPersonal.find().and([{ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() } }, { idParent: idParent }]).select("horarioInicio").exec();
                }
                else if (tipoParent === 'espacio') {
                    losEventosRelevantesMes = await EventoPublico.find().and([{ horarioInicio: { $gt: dateInit.getTime(), $lt: dateFin.getTime() } }, { idParent: idParent }]).select("horarioInicio").exec();
                }
                else {
                    console.log(`Tipo ${tipoParent} no reconocido`);
                    UserInputError("Tipo inválido");
                }
            }
            catch (error) {
                console.log(`Error buscando eventos personales: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            var objetoDias = {};
            losEventosRelevantesMes.forEach(ev => {
                let dia = new Date(ev.horarioInicio).getDate();
                if (!objetoDias[dia]) {
                    objetoDias[dia] = 1;
                }
                else {
                    objetoDias[dia]++;
                }
            });
            console.log(`Objeto dias: ${JSON.stringify(objetoDias)}`);
            var arrayDias = [];
            Object.entries(objetoDias).forEach((pair) => {
                arrayDias.push({
                    year,
                    mes,
                    dia: pair[0],
                    cantidadEventos: pair[1],
                });
            });
            console.log(`arrayDias:`);
            arrayDias.forEach(item => {
                console.log(`${JSON.stringify(item)}`);
            });
            return arrayDias;
        },
    },
    Mutation: {
        async crearEventoPublico(_, { infoNuevoEvento }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Query de crear un nuevo evento público`);
            console.log(`Datos: ${JSON.stringify(infoNuevoEvento)}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                AuthenticationError("Login requerido");
            }
            var nuevoEventoPublico = new EventoPublico({
                ...infoNuevoEvento
            });
            if (infoNuevoEvento.tipoParent === 'espacio') {
                console.log(`Es la apertura de un espacio`);
                try {
                    var elEspacioParent = await Espacio.findById(infoNuevoEvento.idParent).exec();
                    if (!elEspacioParent)
                        throw "Espacio parent no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando el espacio parent: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
                //Authorización espacio
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (elEspacioParent.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando evento público`);
                    AuthenticationError("No autorizado");
                }
                var nombreAutomatico = 'Encuentro de ' + elEspacioParent.nombre;
                nuevoEventoPublico.nombre = nombreAutomatico;
                var descripcionAutomatico = elEspacioParent.descripcion;
                nuevoEventoPublico.descripcion = descripcionAutomatico;
                nuevoEventoPublico.idParent = elEspacioParent.id;
                nuevoEventoPublico.idAdministrador = elEspacioParent.idAdministrador;
            }
            try {
                await nuevoEventoPublico.save();
            }
            catch (error) {
                console.log(`Error creando el evento público: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento publico creado`);
            return nuevoEventoPublico;
        },
        async crearEventoPersonal(_, { infoEventoPersonal }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Query de crear un nuevo evento personal`);
            console.log(`Datos: ${JSON.stringify(infoEventoPersonal)}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                AuthenticationError("Login requerido");
            }
            var nuevoEventoPersonal = new EventoPersonal({
                ...infoEventoPersonal
            });
            if (infoEventoPersonal.idEventoMarco) {
                console.log(`Está enmarcado en el evento ${infoEventoPersonal.idEventoMarco}`);
                try {
                    var elEventoMarco = await EventoPublico.findById(infoEventoPersonal.idEventoMarco).exec();
                    if (!elEventoMarco)
                        throw "Evento marco no encontrado";
                }
                catch (error) {
                    console.log(`Error buscando evento marco: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
                if (elEventoMarco.horarioFinal < new Date().getTime()) {
                    UserInputError("No es posible asistir a eventos ya finalizados");
                }
                if (!infoEventoPersonal.nombre) {
                    var nombreAutomatico = 'Asistir a ' + elEventoMarco.nombre;
                    nuevoEventoPersonal.nombre = nombreAutomatico;
                }
                if (!infoEventoPersonal.horarioInicio) {
                    nuevoEventoPersonal.horarioInicio = elEventoMarco.horarioInicio;
                }
                if (!infoEventoPersonal.horarioFinal) {
                    nuevoEventoPersonal.horarioFinal = elEventoMarco.horarioFinal;
                }
                nuevoEventoPersonal.lugar = elEventoMarco.lugar;
                //Validar horarios.
                if (infoEventoPersonal.horarioInicio < elEventoMarco.horarioInicio || infoEventoPersonal.horarioFinal > elEventoMarco.horarioFinal) {
                    UserInputError("El evento debe estar dentro del evento marco");
                }
            }
            if (infoEventoPersonal.idParent) {
                var elParent = null;
                try {
                    if (infoEventoPersonal.tipoParent === 'nodoSolidaridad') {
                        console.log(`Es la ejecución de un nodoSolidaridad`);
                        elParent = await NodoSolidaridad.findById(infoEventoPersonal.idParent);
                    }
                    else {
                        console.log(`Tipo ${infoEventoPersonal.tipoParent} no reconocido`);
                        UserInputError("Tipo de evento no conocido");
                    }
                }
                catch (error) {
                    console.log(`Error buscando el parent del evento: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
                //Authorización nodoSolidaridad
                var idsResponsables = [];
                if (infoEventoPersonal.tipoParent === 'nodoSolidaridad') {
                    const responsablesAmplioNodo = await getResponsablesAmplioNodo(elParent);
                    idsResponsables = responsablesAmplioNodo;
                    console.log(`Los responsables amplios nodo son: ${idsResponsables}, adding ${responsablesAmplioNodo.filter(r => r != nuevoEventoPersonal.idPersona)} to participantes del evento creado`);
                    nuevoEventoPersonal.idsParticipantes = responsablesAmplioNodo.filter(r => r != nuevoEventoPersonal.idPersona);
                }
                const permisosEspeciales = ["superadministrador"];
                const credencialesUsuario = contexto.usuario;
                if (!idsResponsables.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion creando evento personal`);
                    AuthenticationError("No autorizado");
                }
                if (!infoEventoPersonal.nombre) {
                    var nombreAutomatico = 'Realización de ' + elParent.nombre;
                    nuevoEventoPersonal.nombre = nombreAutomatico;
                }
                if (!infoEventoPersonal.descripcion) {
                    nuevoEventoPersonal.descripcion = elParent.descripcion;
                }
                nuevoEventoPersonal.idParent = elParent.id;
                nuevoEventoPersonal.idAdministrador = elParent.idAdministrador;
            }
            try {
                await nuevoEventoPersonal.save();
            }
            catch (error) {
                console.log(`Error creando el evento personal: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento personal creado`);
            return nuevoEventoPersonal;
        },
        async eliminarEvento(_, { idEvento, tipoEvento }, contexto) {
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                AuthenticationError("Login requerido");
            }
            console.log('\x1b[35m%s\x1b[0m', `Query de eliminar evento con id ${idEvento}`);
            try {
                var elEvento = null;
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el evento a cambiar nombre en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            if (tipoEvento === 'eventoPublico') {
                //Buscando eventos personales que tengan como marco este evento publico
                await reScheduleEventosEnmarcadosEnEventoPublicoEliminado(elEvento);
            }
            try {
                if (tipoEvento === 'eventoPublico') {
                    await EventoPublico.findByIdAndRemove(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    await EventoPersonal.findByIdAndRemove(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
                }
            }
            catch (error) {
                console.log(`Error removiendo el evento: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento eliminado`);
            return true;
        },
        async editarNombreEvento(_, { idEvento, tipoEvento, nuevoNombre }, contexto) {
            console.log(`Query de cambiar el nombre del evento con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            nuevoNombre = nuevoNombre.trim();
            nuevoNombre = nuevoNombre.replace(/[\n\r]/g, " ");
            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreCosa.test(nuevoNombre)) {
                UserInputError("Nombre ilegal");
            }
            try {
                var elEvento = null;
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
                }
                if (!elEvento) {
                    throw "eventopublico no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el eventopublico a cambiar nombre en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            elEvento.nombre = nuevoNombre;
            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nombre cambiado`);
            return elEvento;
        },
        async editarDescripcionEvento(_, { idEvento, tipoEvento, nuevoDescripcion }, contexto) {
            console.log(`Query de cambiar el descripcion del evento con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            if (charProhibidosTexto.test(nuevoDescripcion)) {
                ApolloError("Descripcion ilegal");
            }
            nuevoDescripcion = nuevoDescripcion.trim();
            try {
                var elEvento = null;
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el evento a cambiar descripcion en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            elEvento.descripcion = nuevoDescripcion;
            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el evento con nuevo descripcion. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Descripcion cambiado`);
            return elEvento;
        },
        async editarLimiteDeCuposEvento(_, { idEvento, tipoEvento, nuevoLimiteDeCupos }, contexto) {
            console.log(`Query de cambiar el limitedecupos del evento con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            try {
                var elEvento = null;
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Evento " + tipoEvento + " no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el evento a cambiar limitedecupos en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            elEvento.limiteDeCupos = nuevoLimiteDeCupos;
            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el evento con nuevo limitedecupos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`LimiteDeCupos cambiado`);
            return elEvento;
        },
        async setDateInicioEvento(_, { nuevoDate, tipoEvento, idEvento }, contexto) {
            console.log(`Query de cambiar el dateInicio del eventopublico con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            var elEvento = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                }
                if (!elEvento) {
                    throw "eventopublico no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el eventopublico a cambiar nombre en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            elEvento.horarioInicio = nuevoDate;
            if (elEvento.idEventoMarco) {
                console.log(`Tenia evento marco`);
                try {
                    var elEventoMarco = await EventoPublico.findById(elEvento.idEventoMarco).exec();
                }
                catch (error) {
                    console.log(`Error buscando evento marco`);
                    ApolloError("Error conectando con la base de datos");
                }
                console.log(`Comparando ${nuevoDate} con ${elEventoMarco.horarioInicio}`);
                if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                    UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                }
                if (elEvento.horarioFinal > new Date(elEventoMarco.horarioFinal)) {
                    elEvento.horarioFinal = elEventoMarco.horarioFinal;
                }
            }
            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`HorarioInicio cambiado`);
            return true;
        },
        async setDateInicioEventoHoldDuration(_, { nuevoDate, tipoEvento, idEvento }, contexto) {
            console.log(`Query de cambiar el dateInicio del ${tipoEvento} con id ${idEvento} keeping duration`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            var elEvento = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el evento a cambiar nombre en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            const currentDuration = elEvento.horarioFinal - elEvento.horarioInicio;
            elEvento.horarioInicio = nuevoDate;
            elEvento.horarioFinal = new Date(new Date(nuevoDate).getTime() + currentDuration);
            if (elEvento.idEventoMarco) {
                console.log(`Tenia evento marco`);
                try {
                    var elEventoMarco = await EventoPublico.findById(elEvento.idEventoMarco).exec();
                }
                catch (error) {
                    console.log(`Error buscando evento marco`);
                    ApolloError("Error conectando con la base de datos");
                }
                console.log(`Comparando ${nuevoDate} con ${elEventoMarco.horarioInicio}`);
                if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                    UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                }
                if (elEvento.horarioFinal > new Date(elEventoMarco.horarioFinal)) {
                    elEvento.horarioFinal = elEventoMarco.horarioFinal;
                }
            }
            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el evento. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`HorarioInicio cambiado`);
            return elEvento;
        },
        async setDateFinalEvento(_, { nuevoDate, tipoEvento, idEvento }, contexto) {
            console.log(`Query de cambiar el dateFinal del evento con id ${idEvento}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            var elEvento = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el evento a cambiar nombre en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            elEvento.horarioFinal = nuevoDate;
            if (elEvento.idEventoMarco) {
                console.log(`Tenia evento marco`);
                try {
                    var elEventoMarco = await EventoPublico.findById(elEvento.idEventoMarco).exec();
                }
                catch (error) {
                    console.log(`Error buscando evento marco`);
                    ApolloError("Error conectando con la base de datos");
                }
                if (new Date(nuevoDate) < new Date(elEventoMarco.horarioInicio) || new Date(nuevoDate) > new Date(elEventoMarco.horarioFinal)) {
                    UserInputError("El evento no puede tener horario por fuera de " + elEventoMarco.nombre);
                }
            }
            try {
                await elEvento.save();
            }
            catch (error) {
                console.log("Error guardando el eventopublico con nuevo nombre. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`HorarioFinal cambiado`);
            return elEvento;
        },
        async repetirEventoPeriodicamente(_, { periodoRepetir, cantidadRepetir, idEvento, tipoEvento }, contexto) {
            console.log(`Query de repetir ${periodoRepetir} el evento ${idEvento} ${cantidadRepetir} veces`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            if (cantidadRepetir < 1 || cantidadRepetir > 52) {
                UserInputError("Cantidad de repeticiones inválida");
            }
            var periodoMillis = 86400000;
            if (periodoRepetir === 'semanalmente') {
                periodoMillis = 604800000;
            }
            else if (periodoRepetir === 'diariamente') {
                periodoMillis = 86400000;
            }
            else {
                UserInputError("Periodo " + periodoRepetir + " no reconocido");
            }
            var elEvento = null;
            try {
                if (tipoEvento === 'eventoPublico') {
                    elEvento = await EventoPublico.findById(idEvento).exec();
                }
                else if (tipoEvento === 'eventoPersonal') {
                    elEvento = await EventoPersonal.findById(idEvento).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoEvento + "' no reconocido";
                }
                if (!elEvento) {
                    throw "evento no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el evento a repetir en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoEvento === 'eventoPublico') {
                usuarioAdministrador = elEvento.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoEvento === 'eventoPersonal') {
                usuarioAdministrador = elEvento.idPersona === credencialesUsuario.id;
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoEvento);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            var arrayNuevosEventos = [];
            var infoNuevosEventos = {
                nombre: elEvento.nombre,
                descripcion: elEvento.descripcion,
                horarioInicio: elEvento.horarioInicio,
                horarioFinal: elEvento.horarioFinal,
                lugar: elEvento.lugar,
                idParent: elEvento.idParent,
                tipoParent: elEvento.tipoParent,
            };
            if (tipoEvento === 'eventoPublico') {
                infoNuevosEventos.idAdministrador = elEvento.idAdministrador;
                infoNuevosEventos.limiteDeCupos = elEvento.limiteDeCupos;
            }
            else if (tipoEvento === 'eventoPersonal') {
                infoNuevosEventos.idPersona = elEvento.idPersona;
                infoNuevosEventos.idsParticipantes = elEvento.idsParticipantes;
                infoNuevosEventos.idEventoMarco = elEvento.idEventoMarco;
            }
            for (var i = 1; i <= cantidadRepetir; i++) {
                let desplazamiento = periodoMillis * i;
                let infoNuevoEvento = {
                    ...infoNuevosEventos
                };
                infoNuevoEvento.horarioInicio = new Date(infoNuevoEvento.horarioInicio).getTime() + desplazamiento;
                infoNuevoEvento.horarioFinal = new Date(infoNuevoEvento.horarioFinal).getTime() + desplazamiento;
                arrayNuevosEventos.push(infoNuevoEvento);
            }
            var eventosCreados = [];
            try {
                if (tipoEvento === 'eventoPublico') {
                    eventosCreados = await EventoPublico.create(arrayNuevosEventos);
                }
                else if (tipoEvento === 'eventoPersonal') {
                    eventosCreados = await EventoPersonal.create(arrayNuevosEventos);
                }
                else {
                    console.log(`Tipo ${tipoEvento} not developed`);
                }
            }
            catch (error) {
                console.log("Error guardando los eventos repetidos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Evento repetido, enviando ${eventosCreados.length} repeticiones: `);
            console.log(`${eventosCreados}`);
            return eventosCreados;
        },
        async repetirEventosTroughInterval(_, { idParent, tipoParent, idUsuario, numRepeticiones, dateFrom, dateTo }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Query de repetir ${numRepeticiones} veces los eventos entre ${dateFrom} y ${dateTo} de tipo ${tipoParent} con idParent ${idParent}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            if (numRepeticiones < 1 || numRepeticiones > 52) {
                UserInputError("Cantidad de repeticiones inválida");
            }
            dateFrom = new Date(dateFrom);
            dateTo = new Date(dateTo);
            var periodoMillis = dateTo.getTime() - dateFrom.getTime();
            var losEventos = null;
            try {
                if (tipoParent === 'nodoSolidaridad') {
                    losEventos = await EventoPersonal.find({ idParent, idPersona: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                }
                else if (tipoParent === 'usuario') {
                    var losEventosPersonales = await EventoPersonal.find({ idPersona: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                    var losEventosPublicos = await EventoPublico.find({ idAdministrador: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                    losEventos = losEventosPersonales.concat(losEventosPublicos);
                }
                else if (tipoParent === 'espacio') {
                    losEventos = await EventoPublico.find({ idAdministrador: idUsuario, idParent, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoParent + "' no reconocido";
                }
                if (!losEventos) {
                    throw "eventos no encontrados";
                }
            }
            catch (error) {
                console.log("Error buscando los eventos a repetir en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoParent === 'espacio') {
                try {
                    var elEspacio = await Espacio.findById(idParent).exec();
                }
                catch (error) {
                    console.log(`Error buscando el espacio parent: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
                usuarioAdministrador = elEspacio.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoParent === 'usuario') {
                usuarioAdministrador = idUsuario === credencialesUsuario.id;
            }
            else if (tipoParent === 'nodoSolidaridad') {
                try {
                    var elNodo = await NodoSolidaridad.findById(idParent).exec();
                }
                catch (error) {
                    console.log(`Error buscando el espacio parent: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
                usuarioAdministrador = (await getResponsablesAmplioNodo(elNodo)).includes(credencialesUsuario.id);
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoParent);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            var eventosEnmarcados = losEventos.filter(e => e.idEventoMarco);
            console.log(`${eventosEnmarcados.length} eventos están enmarcados y no se tiene seguridad de que exista una instancia del evento marco en el horario nuevo`);
            losEventos.forEach(async (evento) => {
                var dateInicioOriginal = new Date(evento.horarioInicio);
                var dateFinalOriginal = new Date(evento.horarioFinal);
                const idEventoMarcoOriginal = evento.idEventoMarco;
                var idParentOriginal = null;
                if (idEventoMarcoOriginal) {
                    try {
                        var eventoPublicoParent = await EventoPublico.findById(idEventoMarcoOriginal).select("id nombre idParent").exec();
                    }
                    catch (error) {
                        console.log(`Error buscando nuevo eventoMarco para buscar nuevos eventos públicos que reciban los eventos repetidos: ${error}`);
                        ApolloError("Error configurando la base de datos");
                    }
                    idParentOriginal = eventoPublicoParent.idParent;
                }
                for (var i = 1; i <= numRepeticiones; i++) {
                    evento._id = mongoose.Types.ObjectId();
                    evento.isNew = true;
                    let desplazamiento = periodoMillis * i;
                    evento.horarioInicio = new Date(dateInicioOriginal.getTime() + desplazamiento);
                    evento.horarioFinal = new Date(dateFinalOriginal.getTime() + desplazamiento);
                    if (idEventoMarcoOriginal) {
                        //Averiguar si hay un evento marco del mismo espacio para recibir este eventoPersonal.
                        try {
                            console.log(`Buscando un nuevo evento publico con idParent: ${idParentOriginal} `);
                            var nuevoEventoReceptor = await EventoPublico.findOne({ idParent: idParentOriginal, horarioInicio: { $lte: evento.horarioInicio }, horarioFinal: { $gte: evento.horarioFinal } }).exec();
                            if (!nuevoEventoReceptor) {
                                throw "no había evento receptor";
                            }
                        }
                        catch (error) {
                            console.log(`Error buscando nuevo eventoPublico del mismo espacio: ${error}`);
                            continue;
                        }
                        evento.idEventoMarco = nuevoEventoReceptor.id;
                    }
                    try {
                        console.log(`Guardando con id ${evento.id} y inicio ${evento.horarioInicio}`);
                        await evento.save();
                    }
                    catch (error) {
                        console.log(`Error guardando repeticion del evento ${evento.nombre}: ${error}`);
                    }
                }
            });
            return true;
        },
        async deleteEventosTroughInterval(_, { idParent, tipoParent, idUsuario, dateFrom, dateTo }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Query de eliminar los eventos entre ${dateFrom} y ${dateTo} de tipo ${tipoParent} con idParent ${idParent}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            dateFrom = new Date(dateFrom);
            dateTo = new Date(dateTo);
            var periodoMillis = dateTo.getTime() - dateFrom.getTime();
            var losEventos = null;
            try {
                if (tipoParent === 'nodoSolidaridad') {
                    losEventos = await EventoPersonal.find({ idParent, idPersona: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                }
                else if (tipoParent === 'usuario') {
                    var losEventosPersonales = await EventoPersonal.find({ idPersona: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                    var losEventosPublicos = await EventoPublico.find({ idAdministrador: idUsuario, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                    losEventos = losEventosPersonales.concat(losEventosPublicos);
                }
                else if (tipoParent === 'espacio') {
                    losEventos = await EventoPublico.find({ idAdministrador: idUsuario, idParent, horarioInicio: { $gt: dateFrom.getTime(), $lt: dateTo.getTime() } }).exec();
                }
                else {
                    throw "Tipo de evento '" + tipoParent + "' no reconocido";
                }
                if (!losEventos) {
                    throw "eventos no encontrados";
                }
            }
            catch (error) {
                console.log("Error buscando los eventos a repetir en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "maestraVida-profesor"];
            const credencialesUsuario = contexto.usuario;
            var usuarioAdministrador = false;
            if (tipoParent === 'espacio') {
                try {
                    var elEspacio = await Espacio.findById(idParent).exec();
                }
                catch (error) {
                    console.log(`Error buscando el espacio parent: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
                usuarioAdministrador = elEspacio.idAdministrador === credencialesUsuario.id;
            }
            else if (tipoParent === 'usuario') {
                usuarioAdministrador = idUsuario === credencialesUsuario.id;
            }
            else if (tipoParent === 'nodoSolidaridad') {
                try {
                    var elNodo = await NodoSolidaridad.findById(idParent).exec();
                }
                catch (error) {
                    console.log(`Error buscando el espacio parent: ${error}`);
                    ApolloError("Error conectando con la base de datos");
                }
                usuarioAdministrador = (await getResponsablesAmplioNodo(elNodo)).includes(credencialesUsuario.id);
            }
            else {
                UserInputError("Tipo de evento no reconocido: " + tipoParent);
            }
            if (!usuarioAdministrador && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            console.log(`Se eliminará un set de ${losEventos.length} eventos`);
            const idsEliminar = losEventos.map(e => e.id);
            try {
                await EventoPersonal.deleteMany({ _id: { $in: idsEliminar } }).exec();
                await EventoPublico.deleteMany({ _id: { $in: idsEliminar } }).exec();
            }
            catch (error) {
                console.log(`Error eliminando eventos: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async setLimiteDeCuposEventosPublicosEspacioFromDate(_, { idEspacio, dateFrom, limiteDeCupos }, contexto) {
            console.log(`Query de cambiar el limitedecupos de todos los eventos from ${dateFrom} del espacio ${idEspacio}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
            }
            catch (error) {
                console.log("Error buscando el espacio: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            try {
                var losEventosFuturos = await EventoPublico.find({ idParent: idEspacio, horarioInicio: { $gt: new Date(dateFrom).getTime() } }).exec();
            }
            catch (error) {
                console.log(`Error buscando los eventos futuros: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            losEventosFuturos.forEach(async (ev) => {
                try {
                    ev.limiteDeCupos = limiteDeCupos;
                    await ev.save();
                }
                catch (error) {
                    console.log(`Error guardando evento con nuevo límite de cupos: ${error}`);
                    ApolloError("Error guardando en la base de datos");
                }
            });
            console.log(`Nuevo límite de cupos fijado en ${losEventosFuturos.length} eventos públicos.`);
            return true;
        },
    },
    Evento: {
        __resolveType(evento, _, __) {
            if (evento.idPersona) {
                return "EventoPersonal";
            }
            return "EventoPublico";
        },
    },
    EventoPublico: {
        async eventosEnmarcados(eventoPublico, _, __) {
            try {
                var losEventosEnmarcados = await EventoPersonal.find({ idEventoMarco: eventoPublico.id }).exec();
            }
            catch (error) {
                console.log(`Error buscando eventos enmarcados: ${error}`);
            }
            //Descargar nombres
            try {
                var losNombres = await Usuario.find({ "_id": { $in: losEventosEnmarcados.map(ev => ev.idPersona) } }).select("id nombres apellidos").exec();
            }
            catch (error) {
            }
            return losEventosEnmarcados;
        }
    },
    EventoPersonal: {
        async nombresPersona(eventoPersonal, _, __) {
            try {
                var usuario = await Usuario.findById(eventoPersonal.idPersona).select("nombres").exec();
            }
            catch (error) {
                console.log(`Error buscando nombres de persona de evento personal: ${error}`);
            }
            return usuario.nombres;
        }
    }
};
export const reScheduleEventosEnmarcadosEnEventoPublicoEliminado = async function (eventoPublico) {
    try {
        var losEventosEnmarcados = await EventoPersonal.find({ idEventoMarco: eventoPublico.id }).exec();
    }
    catch (error) {
        console.log(`Error buscando los eventos enmarcados: ${error}`);
        ApolloError("Error conectando con la base de datos");
    }
    console.log(`Se encontraron ${losEventosEnmarcados.length} eventos enmarcados`);
    const idsEliminar = losEventosEnmarcados.filter(e => !e.idParent).map(e => e.id);
    const idsUpdate = losEventosEnmarcados.filter(e => e.idParent).map(e => e.id);
    console.log(`IDS a eliminar: ${idsEliminar}`);
    console.log(`IDS remove idParent, tipoParent: ${idsUpdate}`);
    try {
        var res = await EventoPersonal.deleteMany({ "_id": { $in: idsEliminar } }).exec();
        await EventoPersonal.updateMany({ "_id": { $in: idsUpdate } }, { $set: { "idEventoMarco": null } }).exec();
    }
    catch (error) {
        console.log(`Error eliminando eventos enmarcados: ${error}`);
        ApolloError("Error conectando con la base de datos");
    }
    console.log(`Res: ${res.ok}. Eventos enmarcados eliminados: ${res.n}`);
};
