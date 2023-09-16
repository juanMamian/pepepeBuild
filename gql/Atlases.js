import { ModeloConfiguracionAtlas as ConfiguracionAtlas } from "../model/ConfiguracionAtlas";
import { ModeloUsuario as Usuario } from "../model/Usuario";
import { calcularProgresoUsuarioNodos, getNodosRedByOriginalIds } from "./Usuarios";
import { ApolloError, AuthenticationError } from "./misc";
let millisDia = 86400000;
export const typeDefs = `#graphql

    type ConfiguracionAtlas{
        id:ID,
        posicionando:Boolean
    }

    extend type Query{
        configuracionAtlas(nombreAtlas: String!):ConfiguracionAtlas
    }
    extend type Mutation{
    togglePosicionamientoAutomaticoAtlas(nombreAtlas:String!):ConfiguracionAtlas,
}    
`;
export const resolvers = {
    Query: {
        async configuracionAtlas(_, { nombreAtlas }, contexto) {
            console.log(`Query de configuracion del atlas de ${nombreAtlas}`);
            try {
                var configuracion = await ConfiguracionAtlas.findOne({ nombre: nombreAtlas }).exec();
            }
            catch (error) {
                console.log(`Error buscando la configuración del atlas: ${error}`);
            }
            return configuracion;
        }
    },
    Mutation: {
        async togglePosicionamientoAutomaticoAtlas(_, { nombreAtlas }, contexto) {
            console.log(`Toggling posicionamiento automatico del atlas ${nombreAtlas}`);
            const credencialesUsuario = contexto.usuario;
            //Authorización
            if (!credencialesUsuario.permisos.includes("superadministrador")) {
                console.log(`Error de autenticacion toggling posicionamiento automático`);
                AuthenticationError("No autorizado");
            }
            try {
                var configuracion = await ConfiguracionAtlas.findOne({ nombre: nombreAtlas }).exec();
            }
            catch (error) {
                console.log(`error buscando configuración del atlas: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`De ${configuracion.posicionando}`);
            configuracion.posicionando = !configuracion.posicionando;
            console.log(`A ${configuracion.posicionando}`);
            try {
                await configuracion.save();
            }
            catch (error) {
                console.log(`Error guardando la nueva configuración del atlas: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return configuracion;
        },
    }
};
ensureAtlas();
async function ensureAtlas() {
    let atlasConocimiento = null;
    try {
        atlasConocimiento = await ConfiguracionAtlas.findOne({ nombre: "conocimiento" }).exec();
    }
    catch (error) {
        console.log("Error descargando configuarción de atlas: " + error);
        return;
    }
    if (!atlasConocimiento) {
        console.log("No había atlas conocimiento. Creando");
        let atlasConocimiento = new ConfiguracionAtlas({
            nombre: "conocimiento"
        });
        try {
            await atlasConocimiento.save();
        }
        catch (error) {
            console.log("Error guardando el atlas recién creado: " + error);
            return;
        }
    }
}
trySnapshots();
async function trySnapshots() {
    let atlasConocimiento = null;
    try {
        atlasConocimiento = await ConfiguracionAtlas.findOne({ nombre: "conocimiento" }).exec();
    }
    catch (error) {
        console.log("Error getting configuración de atlas " + error);
        return;
    }
    if (!atlasConocimiento) {
        console.log("Error: Atlas de conocimiento no encontrado");
        return;
    }
    if (!atlasConocimiento.lastGeneralSnapshot || atlasConocimiento.lastGeneralSnapshot.getTime() < Date.now() - millisDia * 7) {
        console.log("Es hora de un snapshot de avances en colecciones");
        await snapshotGeneral();
        atlasConocimiento.lastGeneralSnapshot = new Date();
        try {
            await atlasConocimiento.save();
        }
        catch (error) {
            console.log("Error guardando configuración de atlas después de last snapshot: " + error);
        }
    }
}
async function snapshotGeneral() {
    console.log("Realizando snapshot general");
    let losUsuarios = [];
    try {
        losUsuarios = await Usuario.find({ "atlas.colecciones": { $exists: true, $type: "array", $ne: [] } }).exec();
    }
    catch (error) {
        console.log("Error getting usuarios: " + error);
        return;
    }
    for (let usuario of losUsuarios) {
        for (let coleccion of usuario.atlas.colecciones) {
            let nodosRed = await getNodosRedByOriginalIds(coleccion.idsNodos);
            let nuevoSnapshot = coleccion.snapshotsProgreso.create({
                progreso: await calcularProgresoUsuarioNodos(usuario, nodosRed),
                dateRegistro: new Date(),
            });
            coleccion.snapshotsProgreso.push(nuevoSnapshot);
        }
        try {
            await usuario.save();
        }
        catch (error) {
            console.log("Error guardando usuario con snapshots de colecciones: " + error);
        }
    }
    console.log("Hecho");
}
