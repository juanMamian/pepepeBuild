import { typeDefs as tdNodos, resolvers as rNodos } from "./NodosConocimiento";
import { typeDefs as tdUsuarios, resolvers as rUsuarios } from "./Usuarios";
import { typeDefs as tdAtlases, resolvers as rAtlases } from "./Atlases";
import { typeDefs as tdEspacios, resolvers as rEspacios } from "./Espacios";
import { typeDefs as tdRutagrado, resolvers as rRutagrado } from "./RutaGrado";
// import { typeDefs as tdObjetivos, resolvers as rObjetivos } from "./Objetivos"
import { typeDefs as tdCuentos, resolvers as rCuentos } from "./cuentos/Libro";
import merge from "lodash/merge";
import jwt from "jsonwebtoken";
export const permisosEspecialesDefault = ["superadministrador"];
const globalTypeDefs = `#graphql
    type Query{
        fakeQuery:String,
    }
    type Mutation{
        fakeMutation:String
    }
    type Subscription{
        fakeSubscription:String
    }
    type Coords{
        x: Int,
        y: Int
    }
    type FuerzaPolar{
        fuerza: Int,
        direccion: Float,
    }
    input CoordsInput{
        x:Int,
        y:Int
    }


`;
export const typeDefs = [globalTypeDefs, tdNodos, tdUsuarios, tdCuentos, tdAtlases, tdEspacios, tdRutagrado];
export const resolvers = merge({}, rNodos, rUsuarios, rCuentos, rAtlases, rEspacios, rRutagrado);
export const context = ({ req, res, connection }) => {
    var usuario = null;
    if (connection) {
        return connection.context;
    }
    else {
        let headers = req.headers;
        if (!headers.authorization) {
            return usuario;
        }
        ;
        const token = headers.authorization.substr(7);
        try {
            usuario = jwt.verify(token, process.env.JWT_SECRET || "");
        }
        catch (error) {
            console.log(`error: ${error}`);
            usuario = {
                id: "",
                permisos: []
            };
        }
    }
    return { usuario: usuario };
};
