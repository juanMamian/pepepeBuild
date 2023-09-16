import { charProhibidosNombreCosa, charProhibidosTexto } from "../model/config";
import { ModeloEspacio as Espacio } from "../model/Espacio";
import { ModeloEventoPublico as EventoPublico } from "../model/Evento";
import { permisosEspecialesDefault } from "./Schema";
import { ApolloError, AuthenticationError, UserInputError } from "./misc";
export const typeDefs = `#graphql

    type IteracionSemanalEspacio{
        id: ID,
        millisInicio: Int,
        millisFinal:Int,
        idsParticipantesConstantes: [ID],
        diaSemana:Int,
        nombreEspacio:String,
        idAdministradorEspacio:String,
        idEspacio:ID,
        paraChiquis:Boolean,
    }

    type Espacio{
        id:ID,
        nombre:String,
        descripcion:String,
        idAdministrador:ID,
        iteracionesSemanales:[IteracionSemanalEspacio],
        paraChiquis:Boolean,
    }

    input InputCrearEspacio{
        nombre:String,
        descripcion:String,
        idAdministrador:String,
    }

    extend type Query{
        espacio(idEspacio:ID!):Espacio,
        todosEspacios:[Espacio],
        espaciosControladosUsuario:[Espacio],
        espaciosByUsuariosAdmin(idsUsuarios: [ID]!):[Espacio],
        iteracionesSemanalesEspaciosByAdministradores(idsAdministradores: [ID]!): [IteracionSemanalEspacio],
        bloquesHorarioUsuarioAsiste:[IteracionSemanalEspacio]
        
    }

    extend type Mutation{
        crearEspacio(info:InputCrearEspacio):Espacio,
        eliminarEspacio(idEspacio:ID!):Boolean,
        editarNombreEspacio(idEspacio:ID!, nuevoNombre: String!):Espacio,
        editarDescripcionEspacio(idEspacio:ID!, nuevoDescripcion: String!):Espacio,
        setEspacioParaChiquis(idEspacio: ID!, nuevoEstado: Boolean!): Espacio,
        
        crearBloqueHorario(idEspacio: ID!, diaSemana: Int!, millisInicio: Int!, millisFinal: Int): IteracionSemanalEspacio,
        setTiemposIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!, millisInicio: Int!, millisFinal: Int!):IteracionSemanalEspacio,
        eliminarIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!):Boolean,
        addAsistenteIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!, idAsistente: ID!):IteracionSemanalEspacio,
        removeAsistenteIteracionSemanalEspacio(idEspacio: ID!, idIteracion: ID!, idAsistente: ID!):IteracionSemanalEspacio,
    }
`;
export const resolvers = {
    Query: {
        async espacio(_, { idEspacio }, contexto) {
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
            }
            catch (error) {
                console.log(`Error buscando espacio: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elEspacio;
        },
        async todosEspacios(_, __, contexto) {
            try {
                var losEspacios = await Espacio.find({}).exec();
            }
            catch (error) {
                console.log(`Error buscando espacios: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return losEspacios;
        },
        async espaciosByUsuariosAdmin(_, { idsUsuarios }, contexto) {
            try {
                var losEspacios = await Espacio.find({ idAdministrador: idsUsuarios }).exec();
            }
            catch (error) {
                console.log(`Error getting espacios : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            return losEspacios;
        },
        async iteracionesSemanalesEspaciosByAdministradores(_, { idsAdministradores }, contexto) {
            console.log(`Getting iteraciones semanales para espacios administrados por ${idsAdministradores}`);
            try {
                var losEspacios = await Espacio.find({ idAdministrador: { $in: idsAdministradores } }).exec();
            }
            catch (error) {
                console.log(`Error getting espacios de los administradores : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            console.log(`Encontrados ${losEspacios.length} espacios`);
            var lasIteraciones = losEspacios.reduce((acc, espacio) => acc.concat(espacio.iteracionesSemanales), []);
            console.log(`Encontradas ${lasIteraciones.length} iteraciones`);
            return lasIteraciones;
        },
        async bloquesHorarioUsuarioAsiste(_, __, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var losEspacios = await Espacio.find({ "iteracionesSemanales.idsParticipantesConstantes": credencialesUsuario.id }).exec();
            }
            catch (error) {
                console.log(`Error getting espacios : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            var losBloques = [];
            for (const espacio of losEspacios) {
                let bloquesUsuarioAsiste = espacio.iteracionesSemanales.filter(it => it.idsParticipantesConstantes.includes(credencialesUsuario.id));
                losBloques.push(...bloquesUsuarioAsiste);
            }
            return losBloques;
        },
        async espaciosControladosUsuario(_, {}, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            var queryOpts = {
                idAdministrador: credencialesUsuario.id
            };
            if (credencialesUsuario.permisos.includes("superadministrador")) {
                queryOpts = {};
            }
            try {
                var losEspacios = await Espacio.find(queryOpts).exec();
            }
            catch (error) {
                console.log(`Error getting espacios : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            if (credencialesUsuario.permisos.includes("superadministrador")) {
                losEspacios.sort((a, b) => {
                    var res = 0;
                    if (a.idAdministrador === credencialesUsuario.id) {
                        res++;
                    }
                    if (b.idAdministrador === credencialesUsuario.id) {
                        res--;
                    }
                    return -res;
                });
            }
            return losEspacios;
        },
    },
    Mutation: {
        async crearEspacio(_, { info }, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            var nuevoEspacio = new Espacio({
                ...info
            });
            try {
                await nuevoEspacio.save();
            }
            catch (error) {
                console.log(`Error creando el nuevo espacio: ${error}`);
                ApolloError("Error guardando");
            }
            return nuevoEspacio;
        },
        async eliminarEspacio(_, { idEspacio }, contexto) {
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                AuthenticationError("Login requerido");
            }
            console.log(`Query de eliminar espaciocon id ${idEspacio}`);
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
            }
            catch (error) {
                console.log(`Error buscando el espacio: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando espacio`);
                AuthenticationError("No autorizado");
            }
            try {
                var losEventosAsociados = await EventoPublico.find({ "idParent": elEspacio.id }).exec();
            }
            catch (error) {
                console.log(`Error buscando eventos asociados al espacio que se eliminará: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Había ${losEventosAsociados.length} eventos publicos asociados a este espacio. Se eliminarán`);
            console.log(`${losEventosAsociados.map(e => e.horarioInicio)}`);
            const listaIds = losEventosAsociados.map(e => e._id);
            try {
                await EventoPublico.deleteMany({ _id: { $in: listaIds } });
                await Espacio.findByIdAndRemove(idEspacio).exec();
            }
            catch (error) {
                console.log(`Error removiendo el espacio: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Espacio eliminado`);
            return true;
        },
        async editarNombreEspacio(_, { idEspacio, nuevoNombre }, contexto) {
            console.log(`Query de cambiar el nombre del espacio con id ${idEspacio}`);
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
                var elEspacio = await Espacio.findById(idEspacio).exec();
                if (!elEspacio) {
                    throw "espacio no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el espacio a cambiar nombre en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando nombre de espacio`);
                AuthenticationError("No autorizado");
            }
            elEspacio.nombre = nuevoNombre;
            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log("Error guardando el espacio con nuevo nombre. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nombre cambiado`);
            return elEspacio;
        },
        async editarDescripcionEspacio(_, { idEspacio, nuevoDescripcion }, contexto) {
            console.log(`Query de cambiar la descripcion del espacio con id ${idEspacio}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Sin credenciales de usuario`);
                AuthenticationError("Login requerido");
            }
            if (charProhibidosTexto.test(nuevoDescripcion)) {
                ApolloError("Descripcion ilegal");
            }
            nuevoDescripcion = nuevoDescripcion.trim();
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
                if (!elEspacio) {
                    throw "espacio no encontrado";
                }
            }
            catch (error) {
                console.log("Error buscando el espacio a cambiar descripción en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador"];
            const credencialesUsuario = contexto.usuario;
            if (elEspacio.idAdministrador != credencialesUsuario.id && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            elEspacio.descripcion = nuevoDescripcion;
            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log("Error guardando el espacio con nueva descripción. E: " + error);
                ApolloError("Error de conexión con la base de datos");
            }
            console.log(`Descripcion cambiado`);
            //Dar esta descripcion a los eventos públicos de este espacio que no la tengan.
            try {
                await EventoPublico.updateMany({ idParent: elEspacio.id, descripcion: null }, { $set: { descripcion: elEspacio.descripcion } });
            }
            catch (error) {
                console.log(`Error updating los eventos publicos children.`);
            }
            return elEspacio;
        },
        async setEspacioParaChiquis(_, { idEspacio, nuevoEstado }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Mutación de set estado en ${nuevoEstado} para el espacio ${idEspacio}`);
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
                if (!elEspacio)
                    throw 'Espacio no encontrado';
            }
            catch (error) {
                ApolloError('Error conectando con la base de datos');
            }
            //Authorization
            const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
            const tienePermisosEspeciales = permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
            if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                AuthenticationError('No autorizado');
            }
            elEspacio.paraChiquis = nuevoEstado;
            try {
                await elEspacio.save();
            }
            catch (error) {
                ApolloError('Error guardando espacio después de set paraChiquis');
            }
            console.log(`Estado para chiquis guardado`);
            return elEspacio;
        },
        async crearBloqueHorario(_, { idEspacio, millisInicio, millisFinal, diaSemana }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Query de crear iteración semanal de espacio ${idEspacio} con inicio ${millisInicio} y final ${millisFinal} en dia ${diaSemana} de la semana`);
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
                if (!elEspacio)
                    throw 'Espacio no encontrado';
            }
            catch (error) {
                console.log('Error descargando el espacio de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            //Authorization
            const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
            const tienePermisosEspeciales = permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
            if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                AuthenticationError("No autorizado");
            }
            var nuevoBloque = elEspacio.iteracionesSemanales.create({ millisInicio, millisFinal, diaSemana });
            elEspacio.iteracionesSemanales.push(nuevoBloque);
            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log(`Error guardando espacio con nuevo bloque de horario : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            console.log("Iteración Semanal creada");
            return nuevoBloque;
        },
        async setTiemposIteracionSemanalEspacio(_, { idEspacio, idIteracion, millisInicio, millisFinal }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Query de set tiempos de iteración semanal de espacio ${idEspacio} con id de iteración ${idIteracion} en inicio ${Math.round(millisInicio / 60000)}minutos y final ${Math.round(millisFinal / 60000)}minutos`);
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
                if (!elEspacio)
                    throw "Espacio no encontrado";
            }
            catch (error) {
                console.log(`Error getting espacio : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            //Authorization
            const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
            const tienePermisosEspeciales = permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
            if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                AuthenticationError("No autorizado");
            }
            var laIteracion = elEspacio.iteracionesSemanales.id(idIteracion);
            if (!laIteracion) {
                UserInputError("Iteración no encontrada");
            }
            laIteracion.millisInicio = millisInicio;
            laIteracion.millisFinal = millisFinal;
            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log(`Error guardando espacio después de set tiempos de iteración : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            console.log(`Tiempos set`);
            return laIteracion;
        },
        async eliminarIteracionSemanalEspacio(_, { idEspacio, idIteracion }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Query de eliminar iteración semanal de espacio ${idEspacio} con id de iteración ${idIteracion}`);
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
                if (!elEspacio)
                    throw "Espacio no encontrado";
            }
            catch (error) {
                console.log(`Error getting espacio : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
            const tienePermisosEspeciales = permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
            if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                AuthenticationError("No autorizado");
            }
            const laIteracion = elEspacio.iteracionesSemanales.find(iteracion => iteracion.id === idIteracion);
            if (!laIteracion) {
                UserInputError("Iteración no encontrada");
            }
            laIteracion.remove();
            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log(`Error saving espacio tras eliminación de iteración : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            console.log("Eliminada");
            return true;
        },
        async addAsistenteIteracionSemanalEspacio(_, { idEspacio, idIteracion, idAsistente }, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
                if (!elEspacio)
                    throw 'Espacio no encontrado';
            }
            catch (error) {
                console.log('Error descargando el Espacio de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            var laIteracion = elEspacio.iteracionesSemanales.id(idIteracion);
            if (!laIteracion) {
                UserInputError("Iteración no encontrada");
            }
            // auth
            const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
            const tienePermisosEspeciales = permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
            if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                AuthenticationError('No autorizado');
            }
            const indexA = laIteracion.idsParticipantesConstantes.indexOf(idAsistente);
            if (indexA > -1) {
                console.log("El asistente ya estaba incluido");
                UserInputError("Asistente ya estaba registrado");
            }
            laIteracion.idsParticipantesConstantes.push(idAsistente);
            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log(`Error guardando el espacio con nuevo asistente en iteración semanal : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            console.log(`Asistente added`);
            return laIteracion;
        },
        async removeAsistenteIteracionSemanalEspacio(_, { idEspacio, idIteracion, idAsistente }, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var elEspacio = await Espacio.findById(idEspacio).exec();
                if (!elEspacio)
                    throw 'Espacio no encontrado';
            }
            catch (error) {
                console.log('Error descargando el Espacio de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            var laIteracion = elEspacio.iteracionesSemanales.id(idIteracion);
            if (!laIteracion) {
                UserInputError("Iteración no encontrada");
            }
            // auth
            const esAdministradorEspacio = elEspacio.idAdministrador === credencialesUsuario.id;
            const tienePermisosEspeciales = permisosEspecialesDefault.some(p => credencialesUsuario.permisos.includes(p));
            if (!esAdministradorEspacio && !tienePermisosEspeciales) {
                AuthenticationError('No autorizado');
            }
            const indexA = laIteracion.idsParticipantesConstantes.indexOf(idAsistente);
            if (indexA === -1) {
                console.log("El asistente no estaba incluido");
                UserInputError("Asistente no estaba registrado");
            }
            laIteracion.idsParticipantesConstantes.splice(indexA, 1);
            try {
                await elEspacio.save();
            }
            catch (error) {
                console.log(`Error guardando el espacio con asistente removido de iteración semanal : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            console.log(`Asistente removed`);
            return laIteracion;
        }
    },
};
