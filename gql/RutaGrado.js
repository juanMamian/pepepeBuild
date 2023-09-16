import { laRutaNodosConocimiento, laRutaProyectoMediaTecnica, laRutaProyectoSocial, ModeloSubrutaGrado as Subruta } from "../model/rutaGrado/RutaGrado";
import { ApolloError, AuthenticationError } from "./misc";
export const typeDefs = `#graphql

    type NodoRutaGrado{
        id: ID,
        nombre: String,
        descripcion: String,        
    }

    type SubrutaGrado{
        id: ID,
        nombre: String,
        descripcion: String,
        nodos: [NodoRutaGrado],
        color: String,
    }
    
    extend type Query{
        subrutasGradoMaestraVida:[SubrutaGrado],
    },

    extend type Mutation{
        setColorSubrutaGrado(idSubruta: ID!, nuevoColor: String!):SubrutaGrado,
    }

   
`;
export const resolvers = {
    Query: {
        async subrutasGradoMaestraVida(_, {}, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            try {
                var lasSubrutas = await Subruta.find({}).exec();
            }
            catch (error) {
                ApolloError('Error conectando con la base de datos');
            }
            return lasSubrutas;
        },
    },
    Mutation: {
        async setColorSubrutaGrado(_, { idSubruta, nuevoColor }, contexto) {
            if (!contexto.usuario?.id) {
                AuthenticationError('loginRequerido');
            }
            const credencialesUsuario = contexto.usuario;
            if (!credencialesUsuario.permisos.includes("superadministrador")) {
                AuthenticationError("No autorizado");
            }
            try {
                var laSubruta = await Subruta.findById(idSubruta).exec();
                if (!laSubruta)
                    throw 'Subruta no encontrado';
            }
            catch (error) {
                ApolloError('Error conectando con la base de datos');
            }
            laSubruta.color = nuevoColor;
            try {
                await laSubruta.save();
            }
            catch (error) {
                ApolloError('Error guardando la subruta: ' + error);
            }
            return laSubruta;
        },
    }
};
export const funcionesInicioRutaGrado = async function () {
    console.log("Inicializando subrutas de grado");
    try {
        var lasSubrutas = await Subruta.find({}).exec();
    }
    catch (error) {
        ApolloError('Error conectando con la base de datos');
    }
    if (lasSubrutas.length > 0) {
        console.log("Inicialización innecesaria");
    }
    console.log("No había subrutas, creando");
    var rutaNodos = new Subruta(laRutaNodosConocimiento);
    var rutaProyectoSocial = new Subruta(laRutaProyectoSocial);
    var rutaProyectoMediaTecnica = new Subruta(laRutaProyectoMediaTecnica);
    try {
        await rutaNodos.save();
        await rutaProyectoSocial.save();
        await rutaProyectoMediaTecnica.save();
    }
    catch (error) {
        console.log("Error creando subrutas de grado: " + error);
    }
    console.log("Subrutas de grado inicializadas");
};
