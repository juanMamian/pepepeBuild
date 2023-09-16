import { ApolloError, AuthenticationError } from "apollo-server-express";
import mongoose from "mongoose";
import { ModeloForo as Foro } from "../model/Foros/Foro";
import { esquemaRespuestaConversacion, charProhibidosMensajeRespuesta } from "../model/Foros/Conversacion";
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { ModeloNodo as NodoConocimiento } from "../model/atlas/Nodo";
const Nodo = require("../model/atlas/Nodo");
import { ModeloLibro as Libro } from "../model/cuentos/Libro";
export const typeDefs = `#graphql

    input InputInfoAutorQuote{
        id:String,
        nombres:String,
        apellidos:String,
        username:String,
    }

    input InputQuote{
        mensaje:String,
        interpolaciones:[InputInterpolacion]
        infoAutor:InputInfoAutorQuote
        fecha:Date
    }

    input InputInterpolacion{
        tipo:String,
        enlaceIframe:String,
        quote:InputQuote,        
        mensaje:String,
    }

    input InputNuevaRespuesta{
        mensaje:String,
        infoArchivo:InfoArchivoSubido,
        enlaceAdjunto:[String],
        interpolaciones:[InputInterpolacion]
    }

    input InputParent{
        id:ID,
        nombre:String,
        tipo: String,
    }

    input InputIniciarConversacion{
        titulo:String,
        primeraRespuesta:InputNuevaRespuesta
    }

    type InfoAutorQuote{
        id:String,
        nombres:String,
        apellidos:String,
        username:String,
    }

    type Quote{
        mensaje:String,
        interpolaciones:[Interpolacion]
        infoAutor:InfoAutorQuote
        fecha:Date
    }

    type Interpolacion{
        tipo:String,
        enlaceIframe:String,
        mensaje:String,
        quote:Quote
    }

    type RespuestaConversacionForo{
        id: ID
        fecha:Date,
        archivo:InfoArchivo,
        mensaje:String,
        interpolaciones:[Interpolacion]
        enlaceAdjunto:[String],
        autor: Usuario,
        infoAutor:Usuario,
    }

    type InfoRespuestasPaginasConversacion{
        numPaginas: Int,
        pagina:Int,
        respuestas: [RespuestaConversacionForo]
    }

    type InfoConversacionesPaginaForo{
        numPaginas: Int,
        pagina:Int,
        conversaciones: [Conversacion]
    }

    type InfoUltimaRespuesta{
        autor:Usuario,
        fecha:Date
    }

    type Conversacion{
        id:ID,
        titulo: String,
        estado:String,
        creador: Usuario,
        acceso:String,
        cantidadRespuestas:Int,
        infoUltimaRespuesta:InfoUltimaRespuesta,        
    }
  
    type Foro{
        id:ID,
        acceso:String,
        miembros:[String]       
        conversaciones:[Conversacion], 
    }

    extend type Query{
        foro(idForo:ID!):Foro,
        numPaginasConversacion(idConversacion: ID!):Int
        numPagsConversacionesForo(idForo: ID!):Int
        respuestasPaginaDeConversacion(idConversacion:ID!, pagina: Int!):InfoRespuestasPaginasConversacion,
        conversacionesPaginaForo(idForo:ID!, pagina: Int!):InfoConversacionesPaginaForo
    }

    extend type Mutation{
        iniciarConversacionConPrimerMensajeForo(idForo: ID!, input: InputIniciarConversacion, parent:InputParent):Conversacion,
        eliminarRespuesta(idRespuesta:ID!, idConversacion:ID!):Boolean,
        postRespuestaConversacion(idConversacion: ID!, nuevaRespuesta: InputNuevaRespuesta, parent: InputParent):RespuestaConversacionForo,
        setCantidadRespuestasConversacionLeidasPorUsuario(idUsuario:ID!, idForo:ID!, idConversacion: ID!, cantidadRespuestasLeidas:Int!):Boolean
        setTodasRespuestasConversacionLeidasPorUsuario(idUsuario:ID!, idForo:ID!, idConversacion: ID!):Int
    }

`;
const sizePaginaConversacion = 5;
const sizePaginaForo = 6;
export const resolvers = {
    Query: {
        async foro(_, { idForo }, contexto) {
            try {
                var elForo = await Foro.findById(idForo).exec();
                if (!elForo) {
                    throw "foro no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el foro con id ${idForo} en la base de datos. E:${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elForo;
        },
        async numPaginasConversacion(_, { idConversacion }, __) {
            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            try {
                var num = await Respuesta.countDocuments().exec();
                var pags = Math.ceil(num / sizePaginaConversacion);
            }
            catch (error) {
                console.log(`Error contando las respuestas. E: ${error}`);
                return 0;
            }
            return pags;
        },
        async numPagsConversacionesForo(_, { idForo }, __) {
            try {
                let elForo = await Foro.findById(idForo).exec();
                let num = elForo.conversaciones.length;
                var pags = Math.ceil(num / sizePaginaForo);
            }
            catch (error) {
                console.log(`Error contando las conversaciones. E: ${error}`);
                return 0;
            }
            return pags;
        },
        async respuestasPaginaDeConversacion(_, { idConversacion, pagina }, __) {
            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            let numRespuestas = await Respuesta.countDocuments().exec();
            var numPaginas = 0;
            if (numRespuestas > 0) {
                numPaginas = Math.ceil(numRespuestas / sizePaginaConversacion);
            }
            if (pagina < 1 || pagina > numPaginas) {
                pagina = numPaginas;
            }
            try {
                var lasRespuestas = await Respuesta.find({}).limit(sizePaginaConversacion).skip((pagina - 1) * sizePaginaConversacion).exec();
            }
            catch (error) {
                console.log(`Error descargando respuestas`);
                new ApolloError("Error conectando con la base de datos");
            }
            return { numPaginas, pagina, respuestas: lasRespuestas };
        },
        async conversacionesPaginaForo(_, { idForo, pagina }, __) {
            try {
                var elForo = await Foro.findById(idForo).exec();
                if (!elForo) {
                    throw "Foro no encontrado";
                }
            }
            catch (error) {
                console.log(`Error buscando el foro`);
                new ApolloError("Error conectando con la base de datos");
            }
            let todasConversaciones = elForo.conversaciones.sort((b, a) => a.infoUltimaRespuesta.fecha - b.infoUltimaRespuesta.fecha);
            let numConversaciones = todasConversaciones.length;
            console.log(`Hay un total de ${numConversaciones}`);
            var numPaginas = 0;
            if (numConversaciones > 0) {
                numPaginas = Math.ceil(numConversaciones / sizePaginaForo);
            }
            if (pagina < 1 || pagina > numPaginas) {
                pagina = 1;
            }
            let conversacionesPagina = todasConversaciones.splice((pagina - 1) * sizePaginaForo, sizePaginaForo);
            return { pagina, numPaginas, conversaciones: conversacionesPagina };
        }
    },
    Mutation: {
        async iniciarConversacionConPrimerMensajeForo(_, { idForo, input, parent }, contexto) {
            console.log(`|||||||||||||||||||||`);
            console.log(`Recibida solicitud de iniciar una conversacion con primera respuesta en foro con id ${idForo} con input: ${JSON.stringify(input)}`);
            try {
                var elForo = await Foro.findById(idForo).exec();
                if (!elForo) {
                    throw "foro no encontrado";
                }
            }
            catch (error) {
                console.log("Foro no encontrado. E: " + error);
                ApolloError("Error conectandose con la base de datos");
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            let credencialesUsuario = contexto.usuario;
            try {
                var elUsuario = await Usuario.findById(credencialesUsuario.id).exec();
            }
            catch (error) {
                console.log(`Error buscando al usuario en la base de datos. E:${error}`);
                AuthenticationError("No autorizado");
            }
            if (elForo.acceso == "privado") {
                if (!elForo.miembros.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion para crear conversacio en el foro`);
                    AuthenticationError("No autorizado");
                }
            }
            const charProhibidosTitulo = /[^ a-zA-ZÀ-ž0-9_():.,-¡!¿?]/;
            let titulo = input.titulo;
            titulo = titulo.trim();
            titulo = titulo.replace(/\s\s+/g, " ");
            if (charProhibidosTitulo.test(titulo)) {
                console.log(`El titulo contenia caracteres ilegales`);
                ApolloError("Titulo ilegal");
            }
            let primeraRespuesta = input.primeraRespuesta;
            let mensaje = primeraRespuesta.mensaje;
            var todosMensajes = mensaje;
            primeraRespuesta.interpolaciones.forEach(interpolacion => {
                if (interpolacion.mensaje) {
                    todosMensajes += interpolacion.mensaje;
                }
            });
            if (charProhibidosMensajeRespuesta.test(todosMensajes)) {
                console.log(`El mensaje contenia caracteres ilegales`);
                ApolloError("Mensaje ilegal");
            }
            primeraRespuesta.interpolaciones.forEach((interpolacion) => {
                if (interpolacion.tipo == "video" && interpolacion.enlaceIframe.substr(0, 24) != "https://www.youtube.com/") {
                    console.log(`Tipo de enlace no aceptado`);
                    ApolloError("Enlace de video no valido");
                }
            });
            primeraRespuesta.mensaje = mensaje;
            primeraRespuesta.archivo = primeraRespuesta.infoArchivo;
            primeraRespuesta.idAutor = credencialesUsuario.id;
            let infoAutor = {
                id: elUsuario._id,
                nombres: elUsuario.nombres,
                apellidos: elUsuario.apellidos,
                username: elUsuario.username,
            };
            primeraRespuesta.infoAutor = infoAutor;
            let nuevaConversacion = elForo.conversaciones.create({
                titulo,
                idCreador: credencialesUsuario.id,
                acceso: "publico",
                cantidadRespuestas: 1,
                infoUltimaRespuesta: {
                    idAutor: credencialesUsuario.id,
                    fecha: Date.now()
                }
            });
            let idConversacion = nuevaConversacion._id;
            try {
                await elForo.conversaciones.push(nuevaConversacion);
                let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
                let laRespuesta = new Respuesta(primeraRespuesta);
                await laRespuesta.save();
                await elForo.save();
            }
            catch (error) {
                console.log(`Error guardando el foro con la nueva conversacion. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            //Crear notificacion para los miembros del parent.
            console.log(`Creando notificacion para los miembros del ${parent.tipo} ${parent.nombre}`);
            try {
                if (parent.tipo == "nodoConocimiento") {
                    var elParent = await NodoConocimiento.findById(parent.id, "_id expertos").exec();
                    var idsMiembros = elParent.expertos;
                }
                else if (parent.tipo == "libro") {
                    var elParent = await Libro.findById(parent.id, "_id idsEditores").exec();
                    var idsMiembros = elParent.idsEditores;
                }
                else if (parent.tipo == "forosGenerales") {
                    var idsMiembros = [];
                }
                else {
                    console.log(`Error: tipo de parent ${parent.tipo} no reconocido`);
                }
            }
            catch (error) {
                console.log(`Error recopilando la lista de miembros. E: ${error}`);
            }
            if (idsMiembros) {
                console.log(`notificando a ${idsMiembros.length} usuarios: ${idsMiembros}`);
                let indexU = idsMiembros.indexOf(credencialesUsuario.id);
                if (indexU > -1) {
                    idsMiembros.splice(indexU, 1);
                }
                for (let idMiembro of idsMiembros) {
                    try {
                        let elNotificado = await Usuario.findById(idMiembro).exec();
                        if (!elNotificado)
                            throw "Notificado " + idMiembro + " no encontrado";
                        var indexNotificacion = elNotificado.notificacionesActividadForos.findIndex(n => n.tipoParent == parent.tipo && n.idParent == parent.id);
                        if (indexNotificacion > -1) {
                            console.log(`Ya existía notificacion (${indexNotificacion}) de actividad en este elemento con cantidad ${elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas}`);
                            elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas++;
                        }
                        else {
                            elNotificado.notificacionesActividadForos.push({
                                idParent: parent.id,
                                tipoParent: parent.tipo,
                                nombreParent: parent.nombre,
                                numeroRespuestasNuevas: 1,
                            });
                        }
                        await elNotificado.save();
                    }
                    catch (error) {
                        console.log(`Error buscando el notificado: E: ${error}`);
                    }
                }
            }
            console.log(`Nueva conversacion creada`);
            return nuevaConversacion;
        },
        async eliminarRespuesta(_, { idRespuesta, idConversacion }, contexto) {
            console.log(`|||||||||||||||||`);
            console.log(`Solicitud de eliminar una respuesta con id ${idRespuesta}`);
            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            try {
                var laRespuesta = await Respuesta.findById(idRespuesta).exec();
                if (!laRespuesta) {
                    throw "Respuesta no encontrada";
                }
            }
            catch (error) {
                console.log(`Error buscando la respuesta. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            let credencialesUsuario = contexto.usuario;
            if (credencialesUsuario.id != laRespuesta.idAutor && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autorización`);
                AuthenticationError("No autorizado");
            }
            try {
                await Respuesta.findByIdAndDelete(idRespuesta).exec();
            }
            catch (error) {
                console.log(`Error eliminando respuesta. E: ${error}`);
            }
            const cantRespuestas = await Respuesta.countDocuments().exec();
            if (cantRespuestas < 1) {
                console.log(`La conversación quedó vacía. Eliminando`);
                try {
                    let elForo = await Foro.findOne({ "conversaciones._id": idConversacion }).exec();
                    if (!elForo) {
                        console.log(`Foro no encontrado`);
                        throw "Foro no encontrado";
                    }
                    elForo.conversaciones.id(idConversacion).remove();
                    await elForo.save();
                }
                catch (error) {
                    console.log(`Error buscando y guardando el foro para eliminar la conversación`);
                }
                console.log(`Conversación eliminada del foro`);
                mongoose.connection.db.dropCollection("respuestasDeConversacion" + idConversacion, function (err, result) {
                    if (err) {
                        console.log(`Error eliminando la coleccion. E: ${err}`);
                    }
                    console.log("Collection droped");
                });
            }
            else {
                //Actualizar el número de respuestas en esta conversación
                console.log(`Setting cant respuestas en ${cantRespuestas}`);
                try {
                    let elForo = await Foro.findOne({ "conversaciones._id": idConversacion }).exec();
                    if (!elForo) {
                        console.log(`Foro no encontrado`);
                        throw "Foro no encontrado";
                    }
                    elForo.conversaciones.id(idConversacion).cantidadRespuestas = cantRespuestas;
                    await elForo.save();
                }
                catch (error) {
                    console.log(`Error actualizando la cantidad de respuestas en esta conversación`);
                    ApolloError("Error conectando con la base de datos");
                }
            }
            console.log(`Respuesta eliminada`);
            return true;
        },
        async postRespuestaConversacion(_, { idConversacion, nuevaRespuesta, parent }, contexto) {
            console.log(`||||||||||||||||||||||||||||||||`);
            console.log(`Peticion de post respuesta en la conversación con id ${idConversacion}`);
            console.log(`La respuesta será: ${JSON.stringify(nuevaRespuesta)}`);
            try {
                var elForo = await Foro.findOne({ "conversaciones._id": idConversacion }).exec();
                if (!elForo) {
                    throw "Foro no existía";
                }
            }
            catch (error) {
                console.log(`Error buscando el foro de la conversación. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            let credencialesUsuario = contexto.usuario;
            try {
                var elUsuario = await Usuario.findById(credencialesUsuario.id).exec();
            }
            catch (error) {
                console.log(`Error buscando al usuario en la base de datos. E:${error}`);
                AuthenticationError("No autorizado");
            }
            let laConversacion = elForo.conversaciones.id(idConversacion);
            if (!laConversacion) {
                console.log(`La conversación no existía`);
                ApolloError("Error conectando con la base de datos");
            }
            if (laConversacion.acceso == "privado") {
                if (!elForo.miembros.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                    console.log(`Error de autenticacion para crear conversacio en el foro`);
                    AuthenticationError("No autorizado");
                }
            }
            let mensaje = nuevaRespuesta.mensaje;
            var todosMensajes = mensaje;
            nuevaRespuesta.interpolaciones.forEach(interpolacion => {
                if (interpolacion.mensaje) {
                    todosMensajes += interpolacion.mensaje;
                }
            });
            if (charProhibidosMensajeRespuesta.test(todosMensajes)) {
                console.log(`El mensaje contenia caracteres ilegales`);
                ApolloError("Mensaje ilegal");
            }
            nuevaRespuesta.interpolaciones.forEach((interpolacion) => {
                if (interpolacion.tipo == "video" && interpolacion.enlaceIframe.substr(0, 24) != "https://www.youtube.com/") {
                    console.log(`Tipo de enlace no aceptado`);
                    ApolloError("Enlace de video no valido");
                }
            });
            nuevaRespuesta.mensaje = mensaje;
            nuevaRespuesta.archivo = nuevaRespuesta.infoArchivo;
            nuevaRespuesta.idAutor = credencialesUsuario.id;
            let infoAutor = {
                id: elUsuario._id,
                nombres: elUsuario.nombres,
                apellidos: elUsuario.apellidos,
                username: elUsuario.username,
            };
            nuevaRespuesta.infoAutor = infoAutor;
            console.log(`En la conversación ${laConversacion.titulo}`);
            let Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            try {
                var ultimaRespuesta = await Respuesta.findOne({}).sort({ fecha: -1 }).limit(1).exec();
                if (!ultimaRespuesta)
                    throw "Ultima respuesta no encontrada";
                var ultimoRespondedor = ultimaRespuesta.idAutor;
            }
            catch (error) {
                console.log(`Error buscando la ultima respuesta. E: ${error}`);
            }
            const laRespuesta = new Respuesta(nuevaRespuesta);
            try {
                await laRespuesta.save();
            }
            catch (error) {
                console.log(`Error guardando la respuesta. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            let cantRespuestas = await Respuesta.countDocuments().exec();
            console.log(`Cant respuestas después: ${cantRespuestas}`);
            try {
                laConversacion.cantidadRespuestas = cantRespuestas;
                laConversacion.infoUltimaRespuesta = {
                    idAutor: credencialesUsuario.id,
                    fecha: Date.now()
                };
                await elForo.save();
            }
            catch (error) {
                console.log(`Error guardando cant respuestas y info ultima respuesta. E: ${error}`);
            }
            //Crear notificacion para los miembros del parent.
            console.log(`Creando notificacion para los miembros del ${parent.tipo} ${parent.nombre}`);
            try {
                if (parent.tipo == "nodoConocimiento") {
                    var elParent = await NodoConocimiento.findById(parent.id, "_id expertos").exec();
                    var idsMiembros = elParent.expertos;
                }
                else if (parent.tipo == "libro") {
                    var elParent = await Libro.findById(parent.id, "_id idsEditores").exec();
                    var idsMiembros = elParent.idsEditores;
                }
                else {
                    console.log(`Error: tipo de parent no reconocido`);
                }
            }
            catch (error) {
                console.log(`Error recopilando la lista de miembros. E: ${error}`);
            }
            if (idsMiembros && !idsMiembros.includes(ultimoRespondedor)) {
                idsMiembros.push(ultimoRespondedor);
            }
            if (idsMiembros) {
                console.log(`notificando a ${idsMiembros.length} usuarios: ${idsMiembros}`);
                let indexU = idsMiembros.indexOf(credencialesUsuario.id);
                if (indexU > -1) {
                    idsMiembros.splice(indexU, 1);
                }
                for (let idMiembro of idsMiembros) {
                    try {
                        let elNotificado = await Usuario.findById(idMiembro).exec();
                        if (!elNotificado)
                            throw "Notificado " + idMiembro + " no encontrado";
                        var indexNotificacion = elNotificado.notificacionesActividadForos.findIndex(n => n.tipoParent == parent.tipo && n.idParent == parent.id);
                        if (indexNotificacion > -1) {
                            console.log(`Ya existía notificacion (${indexNotificacion}) de actividad en este elemento con cantidad ${elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas}`);
                            elNotificado.notificacionesActividadForos[indexNotificacion].numeroRespuestasNuevas++;
                        }
                        else {
                            elNotificado.notificacionesActividadForos.push({
                                idParent: parent.id,
                                tipoParent: parent.tipo,
                                nombreParent: parent.nombre,
                                numeroRespuestasNuevas: 1,
                            });
                        }
                        await elNotificado.save();
                    }
                    catch (error) {
                        console.log(`Error buscando el notificado: E: ${error}`);
                    }
                }
            }
            console.log(`Respuesta posted`);
            return laRespuesta;
        },
        async setCantidadRespuestasConversacionLeidasPorUsuario(_, { idUsuario, idForo, idConversacion, cantidadRespuestasLeidas }, contexto) {
            console.log(`///////////////////`);
            console.log(`Setting respuestas leidas en conversacion ${idConversacion} en foro con id ${idForo}`);
            const credencialesUsuario = contexto.usuario;
            if (idUsuario != credencialesUsuario.id) {
                AuthenticationError("No autorizado");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).select("foros").exec();
                if (!elUsuario)
                    throw "Usuario no encontrado en la base de datos";
            }
            catch (error) {
                console.log(`Error buscando el usuario. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            var infoForo = elUsuario.foros.find(f => f.idForo == idForo);
            if (!infoForo) {
                var nuevoInfoForo = {
                    idForo,
                    conversaciones: []
                };
                elUsuario.foros.push(nuevoInfoForo);
                infoForo = elUsuario.foros.find(f => f.idForo == idForo);
            }
            var infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
            if (!infoConversacion) {
                var nuevoInfoConversacion = {
                    idConversacion,
                    respuestasLeidas: 0,
                };
                infoForo.conversaciones.push(nuevoInfoConversacion);
                infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
            }
            infoConversacion.respuestasLeidas = cantidadRespuestasLeidas;
            try {
                await elUsuario.save();
            }
            catch (error) {
                console.log(`Error guardando nuevos datos del usuario. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async setTodasRespuestasConversacionLeidasPorUsuario(_, { idUsuario, idForo, idConversacion }, contexto) {
            console.log(`///////////////////`);
            console.log(`Setting todas respuestas leidas en conversacion ${idConversacion} en foro con id ${idForo}`);
            const credencialesUsuario = contexto.usuario;
            if (idUsuario != credencialesUsuario.id) {
                AuthenticationError("No autorizado");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).select("foros").exec();
                if (!elUsuario)
                    throw "Usuario no encontrado en la base de datos";
            }
            catch (error) {
                console.log(`Error buscando el usuario. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            var infoForo = elUsuario.foros.find(f => f.idForo == idForo);
            if (!infoForo) {
                var nuevoInfoForo = {
                    idForo,
                    conversaciones: []
                };
                elUsuario.foros.push(nuevoInfoForo);
                infoForo = elUsuario.foros.find(f => f.idForo == idForo);
            }
            var infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
            if (!infoConversacion) {
                var nuevoInfoConversacion = {
                    idConversacion,
                    respuestasLeidas: 0,
                };
                infoForo.conversaciones.push(nuevoInfoConversacion);
                infoConversacion = infoForo.conversaciones.find(c => c.idConversacion == idConversacion);
            }
            const Respuesta = mongoose.model("respuestasDeConversacion" + idConversacion, esquemaRespuestaConversacion, "respuestasDeConversacion" + idConversacion);
            try {
                var cantRespuestas = await Respuesta.countDocuments().exec();
            }
            catch (error) {
                console.log(`Error contando las respuestas. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            infoConversacion.respuestasLeidas = cantRespuestas;
            try {
                await elUsuario.save();
            }
            catch (error) {
                console.log(`Error guardando nuevos datos del usuario. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return cantRespuestas;
        }
    },
    Conversacion: {
        creador: async function (parent, _, __) {
            if (!parent.idCreador) {
                return [];
            }
            let idCreador = parent.idCreador;
            try {
                var usuarioCreador = await Usuario.findById(idCreador).exec();
                if (!usuarioCreador) {
                    console.log(`El usuario no existe en la base de datos enviando un dummy`);
                    return {
                        id: "-1",
                        username: "?",
                        nombres: "?",
                        apellidos: "?",
                        email: "?",
                        numeroTel: "?",
                        lugarResidencia: "?",
                        edad: 0,
                        idGrupoEstudiantil: "?",
                        nombreGrupoEstudiantil: "?",
                    };
                }
            }
            catch (error) {
                console.log(`error buscando al creador de la conversación. E: ${error}`);
                return [];
            }
            return usuarioCreador;
        },
    },
    RespuestaConversacionForo: {
        autor: async function (parent, _, __) {
            if (!parent.idAutor) {
                return [];
            }
            let idAutor = parent.idAutor;
            try {
                var usuarioAutor = await Usuario.findById(idAutor).exec();
                if (!usuarioAutor) {
                    console.log(`El usuario no existe en la base de datos enviando un dummy`);
                    return {
                        id: "-1",
                        username: "?",
                        nombres: "?",
                        apellidos: "?",
                        email: "?",
                        numeroTel: "?",
                        lugarResidencia: "?",
                        edad: 0,
                        idGrupoEstudiantil: "?",
                        nombreGrupoEstudiantil: "?",
                    };
                }
            }
            catch (error) {
                console.log(`error buscando al autor de la respuesta. E: ${error}`);
                return [];
            }
            return usuarioAutor;
        },
    },
    InfoUltimaRespuesta: {
        autor: async function (parent, _, __) {
            if (!parent.idAutor) {
                return [];
            }
            let idAutor = parent.idAutor;
            try {
                var usuarioAutor = await Usuario.findById(idAutor).exec();
                if (!usuarioAutor) {
                    console.log(`El usuario no existe en la base de datos enviando un dummy`);
                    return {
                        id: "-1",
                        username: "?",
                        nombres: "?",
                        apellidos: "?",
                        email: "?",
                        numeroTel: "?",
                        lugarResidencia: "?",
                        edad: 0,
                        idGrupoEstudiantil: "?",
                        nombreGrupoEstudiantil: "?",
                    };
                }
            }
            catch (error) {
                console.log(`error buscando al autor de la respuesta. E: ${error}`);
                return [];
            }
            return usuarioAutor;
        },
    }
};
