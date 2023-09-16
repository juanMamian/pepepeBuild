import { ModeloNodo as Nodo } from "../model/atlas/Nodo";
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { ModeloCarpetaArchivos as CarpetasArchivos } from "../model/CarpetaArchivos";
import { desplazarNodo, ejecutarPosicionamientoNodosConocimientoByFuerzas, setFuerzaCentroMasaNodo, setFuerzaColisionNodo } from "../controlAtlasConocimiento";
import { charProhibidosNombreCosa } from "../model/config";
import { purgarIdNodo } from "./Usuarios";
import { ApolloError, AuthenticationError, UserInputError } from "./misc";
export const idAtlasConocimiento = "61ea0b0f17a5d80da7e94320";
const permisosEspecialesAtlas = ["superadministrador", "atlasAdministrador"];
export const typeDefs = `#graphql
type Vinculo{
    id:ID!,
    tipo: String!,
    idRef: ID!,
    rol: String!,
    nodoContraparte:NodoConocimiento
}



type InfoArchivoContenidoNodo{
    
    nombre:String,
    primario:Boolean,
    mimetype:String,
}

type SeccionContenidoNodo{
    id:ID,
    nombre:String,
    archivos:[InfoArchivoContenidoNodo],
    tipoPrimario:String,
    modo:String,
    enlace:String
}

type ClaseNodoConocimiento{
    id: ID,
    nombre:String,
    idExperto: ID,
    interesados: [String],
    descripcion:String,
}

type NodoConocimiento{
    id: ID!
    nombre: String,
    clases: [ClaseNodoConocimiento],
    coordX: Int,
    coordY: Int,
    tipoNodo: String,
    vinculos: [Vinculo],
    porcentajeCompletado: Float,
    coordsManuales: Coords,
    coords:Coords,
    autoCoords:Coords,
    centroMasa:Coords,
    stuck:Boolean,
    puntaje:Int,
    resumen:String,
    descripcion:String,
    keywords:String,
    idForoPublico:ID,
    idForoExpertos:ID,
    expertos: [String],
    posiblesExpertos:[String],
    secciones:[SeccionContenidoNodo],
    nivel: Int,
    angulo:Float
    fuerzaCentroMasa:FuerzaPolar,
    fuerzaColision:FuerzaPolar
}

input NodoConocimientoInput{
    id: ID,
    nombre: String,
    coordsManuales:CoordsInput,
    coords:CoordsInput,
    autoCoords:CoordsInput,
}

type Error{
    tipo: String,
    mensaje: String
}

type infoNodosModificados{
    modificados: [NodoConocimiento]
}

extend type Query{
    todosNodos: [NodoConocimiento],
    ping: String,
    nodo(idNodo: ID!): NodoConocimiento,
    nodosConocimientoByIds(idsNodos: [ID!]!):[NodoConocimiento],
    busquedaAmplia(palabrasBuscadas:String!):[NodoConocimiento],
    nodosConocimientoAroundCentro(centro: CoordsInput!, radioX: Int!, radioY: Int!):[NodoConocimiento],

    idsMisNodosEstudiables:[String],

},

extend type Mutation{
    posicionarNodosConocimientoByFuerzas(ciclos:Int!):Boolean,

    setCoordsManuales(idNodo: ID!, coordsManuales:CoordsInput!):infoNodosModificados,
    crearVinculo(tipo:String!, idSource:ID!, idTarget:ID!):infoNodosModificados,
    eliminarVinculoFromTo(idSource:ID!, idTarget:ID!):infoNodosModificados,
    editarNombreNodo(idNodo: ID!, nuevoNombre: String!):infoNodosModificados,
    crearNodo(infoNodo:NodoConocimientoInput):NodoConocimiento
    crearNodoConocimientoUnderNodo(idNodoTarget: ID!):[NodoConocimiento]
    eliminarNodo(idNodo:ID!):[NodoConocimiento],
    editarDescripcionNodoConocimiento(idNodo:ID!, nuevoDescripcion:String!):NodoConocimiento,
    editarKeywordsNodoConocimiento(idNodo:ID!, nuevoKeywords:String!):NodoConocimiento,
    setTipoNodo(idNodo: ID!, nuevoTipoNodo: String!):NodoConocimiento,

    addExpertoNodo(idNodo:ID!, idUsuario:ID!):NodoConocimiento,
    addPosibleExpertoNodo(idNodo:ID!, idUsuario:ID!):NodoConocimiento,
    removeExpertoNodo(idNodo:ID!, idUsuario:ID!):NodoConocimiento,

    eliminarArchivoSeccionNodo(idNodo:ID!, idSeccion:ID!, nombreArchivo:String!):Boolean
    marcarPrimarioArchivoSeccionNodo(idNodo:ID!, idSeccion:ID!, nombreArchivo:String!):Boolean,

    crearNuevaSeccionNodoConocimiento(idNodo:ID!):SeccionContenidoNodo,
    eliminarSeccionNodoConocimiento(idNodo:ID!, idSeccion:ID!):Boolean,
    moverSeccionNodoConocimiento(idNodo:ID!, idSeccion: ID!, movimiento: Int!):NodoConocimiento,
    editarNombreSeccionNodoConocimiento(idNodo:ID!, idSeccion: ID!, nuevoNombre: String!):SeccionContenidoNodo,
    setNuevoEnlaceSeccionNodo(idNodo: ID!, idSeccion:ID!, nuevoEnlace:String!):SeccionContenidoNodo,

    crearClaseNodoConocimiento(idNodo:ID!, idExperto: ID!):ClaseNodoConocimiento,
    eliminarClaseNodoConocimiento(idNodo:ID!, idClase: ID!):Boolean,
    addUsuarioInteresadosClaseNodoConocimiento(idNodo:ID!, idClase: ID!, idUsuario: ID!):ClaseNodoConocimiento,
    eliminarUsuarioInteresadosClaseNodoConocimiento(idNodo:ID!, idClase: ID!, idUsuario: ID!):ClaseNodoConocimiento,

}
`;
export const NODOS_ATLAS_CONOCIMIENTO_POSICIONADOS = "nodos_de_atlas_conocimiento_posicionados";
export const resolvers = {
    Query: {
        busquedaAmplia: async function (_, { palabrasBuscadas }, __) {
            // console.log(`tipo de input: ${typeof (palabrasBuscadas)}`);
            // con
            console.log("Buscando " + palabrasBuscadas);
            if (palabrasBuscadas.length < 1) {
                console.log(`No habia palabras buscadas`);
            }
            let opciones = [];
            try {
                opciones = await Nodo.find({ $text: { $search: palabrasBuscadas } }, { score: { $meta: 'textScore' } }).select("nombre descripcion autoCoords").sort({ score: { $meta: 'textScore' } }).limit(10).exec();
            }
            catch (error) {
                console.log(". E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log("retornando " + opciones.length + " opciones");
            return opciones;
        },
        todosNodos: async function () {
            console.log(`enviando todos los nombres, vinculos y coordenadas`);
            let todosNodos = [];
            try {
                todosNodos = await Nodo.find({}).populate("vinculos.nodoContraparte", "nombre autoCoords").exec();
                console.log(`encontrados ${todosNodos.length} nodos`);
            }
            catch (error) {
                console.log(`error fetching todos los nodos. e: ` + error);
                return;
            }
            // console.log(`Primero enviado: ${JSON.stringify(todosNodos[0])}`);
            // console.log(`Enviando: ${todosNodos}`);
            console.log(`Enviando ${todosNodos.length}`);
            return todosNodos;
        },
        nodo: async function (_, { idNodo }) {
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).select("-icono").populate("vinculos.nodoContraparte", "nombre autoCoords").exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. e: ` + error);
                ApolloError("Error conectando con la base de datos");
            }
            if (!elNodo) {
                return UserInputError('Nodo no encontrado en la base de datos');
            }
            console.log("enviando con id " + elNodo.id);
            // console.log("Enviando " + JSON.stringify(elNodo));
            return elNodo;
        },
        async nodosConocimientoAroundCentro(_, { centro, radioX, radioY }, contexto) {
            console.log("petición de nodos around " + JSON.stringify(centro) + " con radioX " + radioX + " y radioY: " + radioY);
            let losNodos = [];
            try {
                losNodos = await Nodo.find({ "autoCoords.x": { $lt: centro.x + radioX, $gt: centro.x - radioX }, "autoCoords.y": { $lt: centro.y + radioY, $gt: centro.y - radioY } }).exec();
            }
            catch (error) {
                console.log("Error descargando los nodos by centro: " + error);
                return ApolloError("Error conectando con la base de datos");
            }
            console.log("retornando " + losNodos.length + "nodos");
            return losNodos;
        },
        async nodosConocimientoByIds(_, { idsNodos }, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            console.log("Getting nodos con ids " + idsNodos);
            let losNodos = [];
            try {
                losNodos = await Nodo.find({ "_id": { $in: idsNodos } }).exec();
            }
            catch (error) {
                console.log(`Error getting nodosConocimiento by ids : ` + error);
                ApolloError('Error conectando con la base de datos');
            }
            console.log(`Retornando ${losNodos.length} nodos`);
            return losNodos;
        },
        async idsMisNodosEstudiables(_, __, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            console.log("Getting ids de mis nodos estudiables");
            try {
                var elUsuario = await Usuario.findById(credencialesUsuario.id).exec();
                if (!elUsuario)
                    throw 'Usuario no encontrado';
            }
            catch (error) {
                ApolloError('Error conectando con la base de datos');
            }
            let datosAtlasConocimiento = elUsuario.atlas.datosNodos;
            let datosNodosEstudiados = datosAtlasConocimiento.filter((dato) => dato.estudiado);
            let datosNodosAprendidos = datosAtlasConocimiento.filter((dato) => dato.aprendido);
            datosNodosEstudiados = datosNodosEstudiados.filter((dato) => {
                let dateEstudiado = new Date(dato.estudiado);
                let millisLimite = dateEstudiado.getTime() + dato.periodoRepaso;
                if (millisLimite > new Date().getTime())
                    return true;
            });
            let todosNodosSabidos = [...datosNodosEstudiados, ...datosNodosAprendidos];
            let idsTodosNodosSabidos = todosNodosSabidos.map((dato) => dato.idNodo);
            console.log(`Retornando ${idsTodosNodosSabidos.length} ids de nodos sabidos`);
            let losNodosSabidos = [];
            try {
                losNodosSabidos = await Nodo.find({ "_id": { $in: idsTodosNodosSabidos } }).exec();
            }
            catch (error) {
                console.log('Error descargando nodos de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            console.log(`Retornando ${losNodosSabidos.length} nodos sabidos`);
            //Get  ids continuaciones. Ellos son los aprendibles
            let vinculosRelevantes = losNodosSabidos.map((nodo) => nodo.vinculos.filter((vinculo) => vinculo.tipo == "continuacion" && vinculo.rol === 'source')).flat();
            let idsNodosContinuacion = vinculosRelevantes.map((vinculo) => vinculo.idRef);
            let losNodosContinuacion = [];
            try {
                losNodosContinuacion = await Nodo.find({ "_id": { $in: idsNodosContinuacion } }).exec();
            }
            catch (error) {
                console.log('Error descargando nodos de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            let nodosAprendibles = losNodosContinuacion.filter((nodo) => {
                let idsDependencias = nodo.vinculos.filter((vinculo) => vinculo.tipo == "continuacion" && vinculo.rol === "target").map((vinculo) => vinculo.idRef);
                if (idsDependencias.every((id) => idsTodosNodosSabidos.includes(id)))
                    return true;
                return false;
            });
            let idsNodosAprendibles = nodosAprendibles.map((nodo) => nodo.id);
            return idsNodosAprendibles;
        }
    },
    Mutation: {
        async posicionarNodosConocimientoByFuerzas(_, { ciclos }, contexto) {
            console.log(`Peticion de ejecutar un posicionamiento de nodos de conocimiento by fuerzas de ${ciclos} ciclos`);
            ejecutarPosicionamientoNodosConocimientoByFuerzas(ciclos, Date.now(), true);
            console.log(`Terminado`);
            return true;
        },
        async eliminarNodo(_, { idNodo }, contexto) {
            console.log(`peticion de eliminar nodo con id ${idNodo}`);
            let credencialesUsuario = contexto.usuario;
            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
                if (!elNodo)
                    throw "Nodo a eliminar no encontrado";
            }
            catch (error) {
                console.log("Error buscando el nodo a eliminar: " + error);
                ApolloError("Error buscando el nodo a eliminar");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            let idsConectados = elNodo.vinculos.map(v => v.idRef);
            try {
                await Nodo.deleteOne({ _id: idNodo }).exec();
            }
            catch (error) {
                console.log(`error eliminando nodo`);
            }
            purgarIdNodo(idNodo); //Saca este idNodo de los registros que lleva cada usuario.
            console.log(`nodo ${idNodo} eliminado`);
            //Eliminar vinculos que lo tuvieran en idRef.
            let losNodosConectados = [];
            try {
                losNodosConectados = await Nodo.find({ "_id": { $in: idsConectados } }).exec();
            }
            catch (error) {
                console.log(`Error  : ` + error);
                return ApolloError('Error conectando con la base de datos');
            }
            for (let nodoC of losNodosConectados) {
                console.log("Eliminando vínculos de " + nodoC.nombre);
                let vinculosNodo = nodoC.vinculos;
                vinculosNodo.forEach(vinc => {
                    if (vinc.idRef === idNodo) {
                        vinculosNodo.pull(vinc.id);
                    }
                });
                try {
                    nodoC.save();
                }
                catch (error) {
                    console.log("Error guardando nodo " + nodoC.id + " después de purgarlo de vínculos con el nodo " + idNodo + " eliminado: " + error);
                }
            }
            console.log("Nodo eliminado");
            return losNodosConectados;
        },
        async crearNodo(_, { infoNodo }, contexto) {
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            ;
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion`);
                AuthenticationError("No autorizado");
            }
            console.log(`Creando nuevo nodo de conocimiento`);
            let nuevoNodo = new Nodo({
                ...infoNodo,
                expertos: [credencialesUsuario.id]
            });
            try {
                await nuevoNodo.save();
            }
            catch (error) {
                console.log(`error guardando el nuevo nodo en la base de datos. E: ${error}`);
                ApolloError("Error guardando en base de datos");
            }
            console.log(`nuevo nodo de conocimiento creado: ${nuevoNodo} `);
            return nuevoNodo;
        },
        async crearNodoConocimientoUnderNodo(_, { idNodoTarget }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Solicitud de crear un nuevo nodo under el nodo ${idNodoTarget}`);
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            let elNodoTarget = null;
            try {
                elNodoTarget = await Nodo.findById(idNodoTarget).exec();
            }
            catch (error) {
                console.log("Error getting nodo target: " + error);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!elNodoTarget) {
                console.log("Nodo target no encontrado");
                return UserInputError("Nodo no encontrado");
            }
            let nuevoNodo = new Nodo({
                autoCoords: elNodoTarget.autoCoords,
            });
            elNodoTarget.vinculos.push({
                idRef: nuevoNodo.id,
                rol: "target"
            });
            nuevoNodo.vinculos.push({
                idRef: elNodoTarget.id,
                rol: "source",
            });
            await movimientoAutomaticoNodo(nuevoNodo, 5);
            try {
                await elNodoTarget.save();
                await nuevoNodo.save();
            }
            catch (error) {
                console.log("Error guardando nodos: " + error);
                return ApolloError("Error realizando operación en la base de datos");
            }
            console.log("Nodo creado");
            let infoNodosModificados = [elNodoTarget, nuevoNodo];
            return infoNodosModificados;
        },
        setCoordsManuales: async function (_, { idNodo, coordsManuales }, contexto) {
            console.log(`peticion de movimiento de coords manuales`);
            let credencialesUsuario = contexto.usuario;
            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            let modificados = [];
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo, "nombre autoCoords").exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }
            if (!elNodo) {
                UserInputError("Nodo no encontrado");
                return;
            }
            elNodo.autoCoords = coordsManuales;
            try {
                console.log(`guardando coords de ${elNodo.nombre} en la base de datos`);
                await elNodo.save();
            }
            catch (error) {
                console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
            }
            modificados.push(elNodo);
            return { modificados };
        },
        crearVinculo: async function (_, { idSource, idTarget }, contexto) {
            let modificados = [];
            console.log(`recibida una peticion de vincular nodos  ${idSource} y ${idTarget}`);
            let credencialesUsuario = contexto.usuario;
            let permisosValidos = ["atlasAdministrador", "administrador", "superadministrador"];
            if (idSource == idTarget)
                UserInputError('No se puede vincular un nodo consigo mismo');
            if (!credencialesUsuario.permisos.some(p => permisosValidos.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            let nodoSource = null;
            let nodoTarget = null;
            try {
                nodoSource = await Nodo.findById(idSource, "vinculos nombre").exec();
                nodoTarget = await Nodo.findById(idTarget, "vinculos nombre").exec();
            }
            catch (error) {
                console.log(`error consiguiendo los nodos para crear el vínculo . e: ` + error);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!nodoSource) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            if (!nodoTarget) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            //Prevenir loop.
            let idsRedPrevia = await getIdsRedRequerimentosNodo(nodoSource);
            if (!idsRedPrevia) {
                return ApolloError("Error calculando red previa de nodo");
            }
            if (idsRedPrevia.includes(nodoTarget.id)) {
                UserInputError('Una vinculación entre estos nodos produce loop');
            }
            console.log(`Los ids previos de la red son: ${idsRedPrevia}`);
            //Buscar y eliminar vinculos previos entre estos dos nodos.
            nodoSource.vinculos = nodoSource.vinculos.filter(v => v.idRef != idTarget);
            nodoTarget.vinculos = nodoTarget.vinculos.filter(v => v.idRef != idSource);
            ;
            const vinculoSourceTarget = {
                idRef: idTarget,
                rol: "source"
            };
            const vinculoTargetSource = {
                idRef: idSource,
                rol: "target"
            };
            nodoSource.vinculos.push(vinculoSourceTarget);
            nodoTarget.vinculos.push(vinculoTargetSource);
            try {
                await nodoSource.save();
                await nodoTarget.save();
            }
            catch (error) {
                console.log(`error guardando los nodos despues de la creacion de vinculos. e: ` + error);
            }
            modificados.push(nodoSource);
            modificados.push(nodoTarget);
            console.log(`vinculo entre ${idSource} y ${idTarget} creado`);
            return { modificados };
        },
        eliminarVinculoFromTo: async function (_, args, contexto) {
            let modificados = [];
            console.log(`desvinculando ${args.idSource} de ${args.idTarget}`);
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            let elUno = null;
            let elOtro = null;
            try {
                elUno = await Nodo.findById(args.idSource, "nombre expertos vinculos").exec();
                elOtro = await Nodo.findById(args.idTarget, "nombre expertos vinculos").exec();
            }
            catch (error) {
                console.log(`error . e: ` + error);
            }
            if (!elUno) {
                console.log("Nodo uno no encontrado");
                return UserInputError('Nodo no encontrado en la base de datos');
            }
            if (!elOtro) {
                console.log("Nodo otro no encontrado");
                return UserInputError('Nodo no encontrado en la base de datos');
            }
            //Authorization
            const esExperto = elOtro.expertos.includes(credencialesUsuario.id);
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !esExperto) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                return AuthenticationError("No autorizado");
            }
            let vinculosUno = elUno.vinculos;
            vinculosUno.forEach((vinc) => {
                if (vinc.idRef === args.idTarget) {
                    vinculosUno.pull(vinc.id);
                }
            });
            let vinculosOtro = elOtro.vinculos;
            vinculosOtro.forEach((vinc) => {
                if (vinc.idRef === args.idSource) {
                    vinculosOtro.pull(vinc.id);
                }
            });
            try {
                await elUno.save();
                await elOtro.save();
            }
            catch (error) {
                console.log(`error . e: ` + error);
            }
            modificados.push(elUno);
            modificados.push(elOtro);
            console.log("desvinculados");
            return { modificados };
        },
        editarNombreNodo: async function (_, { idNodo, nuevoNombre }, contexto) {
            let modificados = [];
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo, "nombre expertos coordsManuales").exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            nuevoNombre = nuevoNombre.trim();
            const charProhibidosNombreNodo = /[^ a-zA-ZÀ-ž0-9_():.,-]/;
            if (charProhibidosNombreNodo.test(nuevoNombre)) {
                ApolloError("Nombre ilegal");
            }
            elNodo.nombre = nuevoNombre;
            try {
                console.log(`guardando nuevo nombre ${elNodo.nombre} en la base de datos`);
                await elNodo.save();
            }
            catch (error) {
                console.log(`error guardando el nodo con coordenadas manuales: ${error}`);
            }
            modificados.push(elNodo);
            return { modificados };
        },
        editarDescripcionNodoConocimiento: async function (_, { idNodo, nuevoDescripcion }, contexto) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set descripcion del nodo con id ${idNodo}`);
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                ApolloError("Error conectando con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            const charProhibidosDescripcionNodo = /[^\n\r a-zA-ZÀ-ž0-9_():;.,+¡!¿?"@=-]/;
            if (charProhibidosDescripcionNodo.test(nuevoDescripcion)) {
                ApolloError("Descripcion ilegal");
            }
            nuevoDescripcion = nuevoDescripcion.trim();
            let resNodo = null;
            try {
                console.log(`guardando nuevo descripcion ${nuevoDescripcion} en la base de datos`);
                resNodo = await Nodo.findByIdAndUpdate(idNodo, { descripcion: nuevoDescripcion }, { new: true }).exec();
            }
            catch (error) {
                console.log(`error guardando el nodo: ${error}`);
            }
            console.log(`Descripcion guardado`);
            return resNodo;
        },
        editarKeywordsNodoConocimiento: async function (_, { idNodo, nuevoKeywords }, contexto) {
            console.log(`|||||||||||||||||||`);
            console.log(`Solicitud de set keywords del nodo con id ${idNodo}`);
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                ApolloError("Error conectando con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "administrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                AuthenticationError("No autorizado");
            }
            const charProhibidosKeywordsNodo = /[^ a-zA-Z0-9]/;
            if (charProhibidosKeywordsNodo.test(nuevoKeywords)) {
                return ApolloError("Keywords ilegal");
            }
            nuevoKeywords = nuevoKeywords.trim();
            let resNodo = null;
            try {
                console.log(`guardando nuevo keywords ${nuevoKeywords} en la base de datos`);
                resNodo = await Nodo.findByIdAndUpdate(idNodo, { keywords: nuevoKeywords }, { new: true }).exec();
            }
            catch (error) {
                console.log(`error guardando el nodo: ${error}`);
            }
            console.log(`Keywords guardado`);
            return resNodo;
        },
        addExpertoNodo: async function (_, { idNodo, idUsuario }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Solicitud de add un usuario con id ${idUsuario} como experto a un nodo con id ${idNodo}`);
            if (!contexto.usuario) {
                AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                ApolloError("Error de conexión con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
            if (idUsuario != credencialesUsuario.id && !usuarioExperto && !permisosEspeciales.some(p => credencialesUsuario.permisos.includes(p)) && !elNodo.expertos.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion.`);
                AuthenticationError("No autorizado");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                return ApolloError("Error conectando con la base de datos");
            }
            if (elNodo.expertos.includes(idUsuario)) {
                console.log(`El usuario ya era experto de este nodo`);
                return ApolloError("El usuario ya estaba incluido");
            }
            let indexPosibleExperto = elNodo.posiblesExpertos.indexOf(idUsuario);
            //Entrar a expertos
            if (elNodo.expertos.length === 0 || (usuarioExperto && indexPosibleExperto > -1)) {
                elNodo.expertos.push(idUsuario);
                console.log(`Usuario añadido a la lista de expertos`);
                if (indexPosibleExperto > -1) {
                    console.log(`sacando al usuario ${idUsuario} de la lista de posibles expertos`);
                    elNodo.posiblesExpertos.splice(indexPosibleExperto, 1);
                }
            }
            else if (credencialesUsuario.id === idUsuario && indexPosibleExperto === -1) {
                elNodo.posiblesExpertos.push(idUsuario);
                console.log(`Usuario añadido a la lista de posibles expertos`);
            }
            else {
                UserInputError("El usuario no podía ser added to expertos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nodo guardado`);
            return elNodo;
        },
        addPosibleExpertoNodo: async function (_, { idNodo, idUsuario }, contexto) {
            console.log(`añadiendo usuario ${idUsuario} a la lista de posibles expertos del nodo ${idNodo}`);
            let credencialesUsuario = contexto.usuario;
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                ApolloError("Error de conexión con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            //Authorización
            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion añadiendo posible experto del nodo`);
                return AuthenticationError("No autorizado");
            }
            if (elNodo.posiblesExpertos.includes(idUsuario) || elNodo.expertos.includes(idUsuario)) {
                console.log(`el usuario ya estaba en la lista`);
                return ApolloError("El usuario ya estaba en la lista");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    return ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                return ApolloError("Error conectando con la base de datos");
            }
            try {
                elNodo.posiblesExpertos.push(idUsuario);
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                return ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nodo guardado`);
            return elNodo;
        },
        removeExpertoNodo: async function (_, { idNodo, idUsuario }, contexto) {
            console.log('\x1b[35m%s\x1b[0m', `Solicitud de remover un usuario con id ${idUsuario} de la lista de expertos de un nodo con id ${idNodo}`);
            if (!contexto.usuario || !contexto.usuario.id) {
                console.log(`Usuario no logeado`);
                return AuthenticationError("Login requerido");
            }
            const credencialesUsuario = contexto.usuario;
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log("Error buscando el nodo en la base de datos. E: " + error);
                ApolloError("Error de conexión con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            //Authorización
            if (idUsuario != credencialesUsuario.id && !credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador")) {
                console.log(`Error de autenticacion removiendo experto o posible experto de nodo`);
                AuthenticationError("No autorizado");
            }
            try {
                var elUsuario = await Usuario.findById(idUsuario).exec();
                if (!elUsuario) {
                    console.log(`No se pudo encontrar al usuario con id ${idUsuario} en la base de datos`);
                    ApolloError("Error buscando al usuario en la base de datos");
                }
            }
            catch (error) {
                console.log("Error buscando al usuario en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            let indexPosibleExperto = elNodo.posiblesExpertos.indexOf(idUsuario);
            if (indexPosibleExperto > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de posibles expertos`);
                elNodo.posiblesExpertos.splice(indexPosibleExperto, 1);
            }
            let indexExperto = elNodo.expertos.indexOf(idUsuario);
            if (indexExperto > -1) {
                console.log(`sacando al usuario ${idUsuario} de la lista de expertos`);
                elNodo.expertos.splice(indexExperto, 1);
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando datos en la base de datos. E: " + error);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Nodo guardado`);
            return elNodo;
        },
        setTipoNodo: async function (_, { idNodo, nuevoTipoNodo }, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log('Error descargando el nodo de la base de datos: ' + error);
                ApolloError('Error conectando con la base de datos');
            }
            ;
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            const esExperto = elNodo.expertos.includes(credencialesUsuario.id);
            const tienePermisosEspeciales = permisosEspecialesAtlas.some(p => credencialesUsuario.permisos.includes(p));
            if (!esExperto && !tienePermisosEspeciales) {
                AuthenticationError("No autorizado");
            }
            elNodo.tipoNodo = nuevoTipoNodo;
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando el nodo: ${error}`);
                ApolloError(`Error conectando con la base de datos`);
            }
            return elNodo;
        },
        eliminarArchivoSeccionNodo: async function (_, { idNodo, idSeccion, nombreArchivo }, contexto) {
            console.log(`Solicitud de eliminar archivo ${nombreArchivo}`);
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            let credencialesUsuario = contexto.usuario;
            let permisosEspeciales = ["atlasAdministrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                return AuthenticationError("No autorizado");
            }
            let seccionesNodo = elNodo.secciones;
            var laSeccion = seccionesNodo.id(idSeccion);
            if (!laSeccion) {
                console.log(`Sección no encontrada`);
                return UserInputError("Sección no encontrada");
            }
            if (!laSeccion.idCarpeta) {
                console.log(`Carpeta no especificada`);
                return ApolloError("Informacion de la seccion inesperada");
            }
            let laCarpeta = null;
            try {
                laCarpeta = await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
            }
            catch (error) {
                console.log(`Error buscando la carpeta de la seccion`);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!laCarpeta) {
                return UserInputError('Carpeta no encontrada en la base de datos');
            }
            laCarpeta.archivos.forEach(archivo => {
                console.log(`Nombre: ${archivo.nombre}`);
            });
            const indexA = laCarpeta.archivos.findIndex(a => a.nombre == nombreArchivo);
            if (indexA > -1) {
                laCarpeta.archivos.pull(laCarpeta.archivos[indexA]);
            }
            else {
                console.log(`Archivo no encontrado`);
                return ApolloError("Error conectando con la base de datos");
            }
            try {
                console.log(`guardando la carpeta: ${laCarpeta}`);
                await laCarpeta.save();
            }
            catch (error) {
                console.log(`Error guardando carpeta. E: ${error}`);
                return ApolloError("Error conectando con la base de datos");
            }
            console.log(`Archivo eliminado`);
            return true;
        },
        marcarPrimarioArchivoSeccionNodo: async function (_, { idNodo, idSeccion, nombreArchivo }, contexto) {
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log(`error buscando el nodo. E: ` + error);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!elNodo) {
                return UserInputError('Nodo no encontrado en la base de datos');
            }
            const credencialesUsuario = contexto.usuario;
            const permisosEspeciales = ["atlasAdministrador", "superadministrador"];
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`El usuario no tenia permisos para efectuar esta operación`);
                return AuthenticationError("No autorizado");
            }
            let seccionesNodo = elNodo.secciones;
            var laSeccion = seccionesNodo.id(idSeccion);
            if (!laSeccion) {
                console.log(`Sección no encontrada`);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!laSeccion.idCarpeta) {
                console.log(`Carpeta no especificada`);
                return ApolloError("Informacion de la seccion inesperada");
            }
            laSeccion.modo = "archivo";
            let laCarpeta = null;
            try {
                laCarpeta = await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
            }
            catch (error) {
                console.log(`Error buscando la carpeta de la seccion`);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!laCarpeta) {
                return UserInputError('Carpeta no encontrada en la base de datos');
            }
            var encontrado = false;
            laCarpeta.archivos.forEach(archivo => {
                if (archivo.nombre == nombreArchivo) {
                    console.log(`Marcando ${archivo.nombre} como primario`);
                    archivo.primario = true;
                    encontrado = true;
                }
                else {
                    console.log(`Marcando ${archivo.nombre} como secundario`);
                    archivo.primario = false;
                }
            });
            try {
                await laCarpeta.save();
            }
            catch (error) {
                console.log(`Error guardando carpeta. E: ${error}`);
                return ApolloError("Error conectando con la base de datos");
            }
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando nodo. E: ${error}`);
                return ApolloError("Error conectando con la base de datos");
            }
            console.log(`Archivo seteado`);
            return encontrado;
        },
        crearNuevaSeccionNodoConocimiento: async function (_, { idNodo }, contexto) {
            if (!contexto.usuario) {
                AuthenticationError("Login requerido");
            }
            let credencialesUsuario = contexto.usuario;
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                ApolloError("Error conectando con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador, atlasAdministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !elNodo.expertos.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador o un experto`);
                return AuthenticationError("No autorizado");
            }
            let seccionesNodo = elNodo.secciones;
            var nuevaSeccion = seccionesNodo.create({});
            elNodo.secciones.push(nuevaSeccion);
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error guardando el nodo`);
                return ApolloError("Error conectando con la base de datos");
            }
            return nuevaSeccion;
        },
        eliminarSeccionNodoConocimiento: async function (_, { idNodo, idSeccion }, contexto) {
            let credencialesUsuario = contexto.usuario;
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            //Authorización
            if (!credencialesUsuario.permisos.includes("superadministrador") && !credencialesUsuario.permisos.includes("atlasAdministrador") && !elNodo.expertos.includes(credencialesUsuario.id)) {
                console.log(`Error de autenticacion. Solo lo puede realizar un superadministrador o un atlasAdministrador`);
                return AuthenticationError("No autorizado");
            }
            let seccionesNodo = elNodo.secciones;
            let laSeccion = seccionesNodo.id(idSeccion);
            if (!laSeccion) {
                return ApolloError("Sección no encontrada");
            }
            const idCarpeta = laSeccion.idCarpeta;
            if (idCarpeta) {
                try {
                    await CarpetasArchivos.findByIdAndDelete(idCarpeta).exec();
                    console.log(`Carpeta eliminada`);
                }
                catch (error) {
                    console.log(`Error eliminando la carpeta con id: ${idCarpeta}. E: ${error}`);
                }
            }
            try {
                await Nodo.findByIdAndUpdate(idNodo, { $pull: { secciones: { _id: idSeccion } } });
            }
            catch (error) {
                console.log(`Error pulling la seccion`);
                return ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        moverSeccionNodoConocimiento: async function (_, { idNodo, idSeccion, movimiento }, contexto) {
            let credencialesUsuario = contexto.usuario;
            console.log(`Peticion de mover una sección ${movimiento}`);
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log(`Error buscando el nodo`);
                return ApolloError("Error conectando con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            const usuarioExperto = elNodo.expertos.includes(credencialesUsuario.id);
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p)) && !usuarioExperto) {
                console.log(`Error de autenticacion. Solo lo puede realizar un experto, superadministrador o un atlasAdministrador`);
                return AuthenticationError("No autorizado");
            }
            let seccionesNodo = elNodo.secciones;
            let laSeccion = seccionesNodo.id(idSeccion);
            if (!laSeccion) {
                return ApolloError("Sección no encontrada");
            }
            console.log(`Secciones estaba: ${seccionesNodo.map(s => s.nombre)}`);
            const indexS = seccionesNodo.findIndex(s => s.id == idSeccion);
            if (indexS > -1) {
                const nuevoIndexS = indexS + movimiento;
                if (nuevoIndexS < 0 || nuevoIndexS >= seccionesNodo.length) {
                    return ApolloError("Movimiento ilegal");
                }
                seccionesNodo.splice(nuevoIndexS, 0, seccionesNodo.splice(indexS, 1)[0]);
            }
            else {
                return ApolloError("Error buscando la sección en la base de datos");
            }
            console.log(`Secciones quedó: ${seccionesNodo.map(s => s.nombre)}`);
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log(`Error pulling la seccion`);
                return ApolloError("Error conectando con la base de datos");
            }
            return elNodo;
        },
        async editarNombreSeccionNodoConocimiento(_, { idNodo, idSeccion, nuevoNombre }, contexto) {
            console.log(`cambiando el nombre del seccion con id ${idSeccion} del nodoConocimiento con id ${idNodo}`);
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log("Error buscando el nodoConocimiento. E: " + error);
                return ApolloError("Error en la conexión con la base de datos");
            }
            if (!elNodo) {
                return UserInputError("Nodo no encontrado en la base de datos");
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            const credencialesUsuario = contexto.usuario;
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando artículo de seccion de nodoConocimiento`);
                return AuthenticationError("No autorizado");
            }
            nuevoNombre = nuevoNombre.replace(/\s\s+/g, " ");
            if (charProhibidosNombreCosa.test(nuevoNombre)) {
                return ApolloError("Nombre ilegal");
            }
            nuevoNombre = nuevoNombre.trim();
            nuevoNombre.replace(/  +/g, ' ');
            nuevoNombre = nuevoNombre.replace(/[\n\r]/g, "");
            let seccionesNodo = elNodo.secciones;
            var laSeccion = seccionesNodo.id(idSeccion);
            if (!laSeccion) {
                console.log(`Seccion no encontrado en el nodoConocimiento`);
                throw "No existía el seccion";
            }
            laSeccion.nombre = nuevoNombre;
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el seccion creado en el nodoConocimiento. E: " + error);
                return ApolloError("Error introduciendo el seccion en el nodoConocimiento");
            }
            console.log(`Nombre de sección cambiado`);
            return laSeccion;
        },
        async setNuevoEnlaceSeccionNodo(_, { idNodo, idSeccion, nuevoEnlace }, contexto) {
            console.log(`cambiando el enlace de seccion con id ${idSeccion} del nodoConocimiento con id ${idNodo}`);
            let elNodo = null;
            try {
                elNodo = await Nodo.findById(idNodo).exec();
            }
            catch (error) {
                console.log("Error buscando el nodoConocimiento. E: " + error);
                return ApolloError("Erro en la conexión con la base de datos");
            }
            if (!elNodo) {
                return UserInputError('Nodo no encontrado en la base de datos');
            }
            //Authorización
            const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
            const credencialesUsuario = contexto.usuario;
            if (!elNodo.expertos.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando artículo de seccion de nodoConocimiento`);
                return AuthenticationError("No autorizado");
            }
            let seccionesNodo = elNodo.secciones;
            let laSeccion = seccionesNodo.id(idSeccion);
            if (!laSeccion) {
                console.log(`Seccion no encontrado en el nodoConocimiento`);
                throw "No existía el seccion";
            }
            laSeccion.enlace = nuevoEnlace;
            laSeccion.modo = "enlace";
            try {
                await elNodo.save();
            }
            catch (error) {
                console.log("Error guardando el seccion creado en el nodoConocimiento. E: " + error);
                return ApolloError("Error introduciendo el seccion en el nodoConocimiento");
            }
            console.log(`Enlace cambiado`);
            return laSeccion;
        },
    },
    SeccionContenidoNodo: {
        async archivos(parent, _, __) {
            if (!parent.idCarpeta) {
                console.log(`No habia carpeta`);
                return [];
            }
            let laCarpeta = null;
            console.log("Buscando carpetaa " + parent.idCarpeta);
            try {
                laCarpeta = await CarpetasArchivos.findById(parent.idCarpeta, "archivos").exec();
            }
            catch (error) {
                console.log(`Error buscando carpeta en base de datos. E: ${error}`);
                return [];
            }
            if (!laCarpeta) {
                console.log("No encontrada.");
                return [];
            }
            const infoArchivos = laCarpeta.archivos.map(a => { return { nombre: a.nombre, primario: a.primario }; });
            return infoArchivos;
        },
        async tipoPrimario(parent, _, __) {
            if (!parent.idCarpeta) {
                console.log(`No habia carpeta`);
                return null;
            }
            let laCarpeta = null;
            try {
                laCarpeta = await CarpetasArchivos.findById(parent.idCarpeta, "archivos").exec();
            }
            catch (error) {
                console.log(`Error buscando carpeta y primario en base de datos. E: ${error}`);
                return null;
            }
            if (!laCarpeta) {
                return null;
            }
            var elPrimario = laCarpeta.archivos.find(a => a.primario == true);
            if (!elPrimario) {
                console.log("Archivo primario no encontrado");
                return null;
            }
            if (!elPrimario.mimetype) {
                console.log(`No habia mimetype`);
                return null;
            }
            return elPrimario.mimetype;
        }
    },
    NodoConocimiento: {
        async porcentajeCompletado(parent, {}, contexto) {
            if (!contexto.usuario?.id) {
                return AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            let elUsuario = null;
            try {
                elUsuario = await Usuario.findById(credencialesUsuario.id).exec();
            }
            catch (error) {
                return ApolloError('Error conectando con la base de datos');
            }
            if (!elUsuario) {
                return UserInputError('Usuario no encontrado en la base de datos');
            }
            let datosNodos = elUsuario.atlas.datosNodos;
            //Descargar progresivamente la red previa.
            let vinculos = parent.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target');
            let idsActuales = vinculos.map(v => v.idRef);
            let nodosActuales = [];
            let nodosRed = [parent];
            let guarda = 0;
            while (guarda < 100 && idsActuales.length > 0) {
                try {
                    nodosActuales = await Nodo.find({ "_id": { $in: idsActuales } }).exec();
                }
                catch (error) {
                    console.log(`Error getting nodos actuales : ` + error);
                    return ApolloError('Error conectando con la base de datos');
                }
                let nodosNuevos = nodosActuales.filter(n => !nodosRed.some(nr => nr.id === n.id));
                nodosRed.push(...nodosNuevos);
                idsActuales = nodosNuevos.reduce((acc, n) => {
                    let vinculosPrevios = n.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target');
                    let idsPrevios = vinculosPrevios.map(v => v.idRef);
                    let idsNuevos = idsPrevios.filter(id => !acc.includes(id));
                    return acc.concat(idsNuevos);
                }, []);
                guarda++;
            }
            let nodosRedAprendidos = nodosRed.filter(n => datosNodos.some(dn => dn.idNodo === n.id && dn.aprendido));
            let porcentajeCompletado = (100 / nodosRed.length) * nodosRedAprendidos.length;
            return porcentajeCompletado;
        },
    }
};
export async function getIdsRedRequerimentosNodo(nodo) {
    console.log(`Getting red previa de ${nodo.nombre}`);
    let idsActuales = nodo.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target').map(v => v.idRef);
    let todosIds = idsActuales;
    let guarda = 0;
    let losNodosAnteriores = [nodo];
    console.log(`Tiene ${idsActuales.length} nodos previos`);
    while (guarda < 200 && idsActuales.length > 0) {
        try {
            losNodosAnteriores = await Nodo.find({ "_id": { $in: idsActuales } }).exec();
        }
        catch (error) {
            console.log(`Error getting nodos anteriores : ` + error);
            return ApolloError('Error conectando con la base de datos');
        }
        console.log(`Anteriores: ${losNodosAnteriores.map(n => n.nombre)}`);
        let idsProx = losNodosAnteriores.reduce((acc, nod) => {
            let idsPrevios = nod.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target').map(v => v.idRef);
            return acc.concat(idsPrevios);
        }, []);
        let idsNuevos = idsProx.filter(id => !todosIds.includes(id));
        idsActuales = idsNuevos;
        todosIds.push(...idsNuevos);
        guarda++;
    }
    return todosIds;
}
export async function getNodosRedPreviaNodo(nodo) {
    let nodosActuales = [nodo];
    let todosNodos = [...nodosActuales];
    let guarda = 0;
    while (guarda < 300 && nodosActuales.length > 0) {
        guarda++;
        let idsSiguientes = nodosActuales.map(n => n.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'target').map(v => v.idRef)).flat();
        let nodosNext = [];
        try {
            nodosNext = await Nodo.find({ "_id": { $in: idsSiguientes } }).exec();
        }
        catch (error) {
            console.log("Error getting nodos siguientes :" + error);
        }
        let nodosNuevos = nodosNext.filter(n => !todosNodos.map(tn => tn.id).includes(n.id));
        todosNodos.push(...nodosNuevos);
        nodosActuales = nodosNuevos;
    }
    return todosNodos;
}
export async function getIdsRedContinuacionesNodo(nodo) {
    console.log(`Getting red posterior de ${nodo.nombre}`);
    let idsActuales = nodo.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'source').map(v => v.idRef);
    let todosIds = idsActuales;
    let guarda = 0;
    let losNodosPosteriores = [nodo];
    console.log(`Tiene ${idsActuales.length} nodos previos`);
    while (guarda < 200 && idsActuales.length > 0) {
        try {
            losNodosPosteriores = await Nodo.find({ "_id": { $in: idsActuales } }).exec();
        }
        catch (error) {
            console.log(`Error getting nodos posteriores : ` + error);
            return ApolloError('Error conectando con la base de datos');
        }
        console.log(`Anteriores: ${losNodosPosteriores.map(n => n.nombre)}`);
        idsActuales = losNodosPosteriores.reduce((acc, nod) => {
            let idsPrevios = nod.vinculos.filter(v => v.tipo === 'continuacion' && v.rol === 'source').map(v => v.idRef);
            return acc.concat(idsPrevios);
        }, []);
        todosIds.push(...idsActuales);
        guarda++;
    }
    return todosIds;
}
export async function movimientoAutomaticoNodo(nodo, ciclos = 1) {
    console.log("Realizando movimiento individual de nodo " + nodo.nombre);
    if (!nodo.autoCoords?.x || !nodo.autoCoords?.y) {
        return console.log("Error: Nodo no tenía autocoords");
    }
    let radioZona = 700;
    let nodosZona = [];
    try {
        nodosZona = await Nodo.find({ "_id": { $ne: nodo.id }, "autoCoords.x": { $lt: nodo.autoCoords.x + radioZona, $gt: nodo.autoCoords.x - radioZona }, "autoCoords.y": { $lt: nodo.autoCoords.y + radioZona, $gt: nodo.autoCoords.y - radioZona } }).exec();
    }
    catch (error) {
        console.log("Error getting nodos de zona: " + error);
        return;
    }
    console.log("hay " + nodosZona.length + " nodos en la zona");
    for (let i = 0; i < ciclos; i++) {
        console.log("Ciclo " + i);
        setFuerzaCentroMasaNodo(nodo, nodosZona);
        setFuerzaColisionNodo(nodo, nodosZona);
        desplazarNodo(nodo);
    }
    try {
        await nodo.save();
    }
    catch (error) {
        console.log("Error salvando nodo " + nodo.nombre + " después de movimiento individual: " + error);
        return;
    }
    console.log("El nodo fue ubicado automáticamente con " + ciclos + "ciclos");
}
