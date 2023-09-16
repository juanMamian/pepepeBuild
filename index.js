console.log("INICIANDO");
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import http from 'http';
import { fileURLToPath } from "url";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { iniciarMongoose } from "./mongoose";
import path from "path";
import { expressjwt as ejwt } from "express-jwt";
import usuariosRoutes from "./routes/usuarios";
import routesNodos from "./routes/atlas/nodos";
import routesContenidosNodos from "./routes/atlas/contenidosNodos";
import routesCuentos from "./routes/cuentos";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { context, resolvers, typeDefs } from "./gql/Schema";
const app = express();
app.use(express.json());
if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
    console.log("Usando cors");
    app.use(cors());
}
//Rutas caracol 
console.log(`Carpeta estatica en ${__dirname + '/caracol'}`);
app.use("/caracol", express.static(__dirname + '/clientes/caracol'));
app.use("/assetsAtlas/contenidosNodos/:idNodo/:nombreCategoria/default", express.static(__dirname + '/assetsAtlas/contenidosNodos/default/'));
app.get("/caracol", function (req, res) {
    res.sendFile(__dirname + "/clientes/caracol/index.html");
});
app.use("/caracol/*", express.static(__dirname + '/clientes/caracol'));
//rutas tallerCuentos
app.use("/tallerCuentos", express.static(__dirname + "/clientes/tallerCuentos"));
app.get("/tallerCuentos", function (req, res) {
    res.sendFile(__dirname + "/clientes/tallerCuentos/index.html");
});
//rutas libro
app.use("/libro", express.static(__dirname + "/clientes/libro"));
app.get("/libro", function (req, res) {
    res.sendFile(__dirname + "/clientes/libro/index.html");
});
//rutas observadores pájaros
app.use("/avesMaestrasPromocional", express.static(__dirname + "/clientes/observadoresPajaros"));
app.get("/avesMaestrasPromocional", function (req, res) {
    res.sendFile(__dirname + "/clientes/observadoresPajaros/index.html");
});
const httpServer = http.createServer(app);
const aServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
});
await aServer.start();
app.use("/graphql", expressMiddleware(aServer, { context }));
//Carpetas publicas
app.use("/assetsAtlas/contenidosNodos", routesContenidosNodos);
app.use("/assetsAtlas", express.static(__dirname + '/assetsAtlas'));
console.log("Dirname: " + __dirname);
app.use("/public", cors(), express.static(__dirname + '/public'));
const rutaFotografias = /api\/usuarios\/fotografias\/\S+/;
const rutaGuias = /api\/actividadesProfes\/guia\/\S+/;
const rutaEvidencias = /api\/actividadesProfes\/evidencia\/\S+/;
const rutaAdjuntos = /api\/foros\/adjuntos\/\S+/;
const rutaIconos = /api\/atlas\/iconos\/\S+/;
const rutaContenidosSeccion = /api\/atlas\/seccion\/\S+/;
const rutaArchivosCuadroImagen = /apiCuentos\/imagenCuento\/\S+/;
const rutaArchivosAudioImagen = /apiCuentos\/audioImagen\/\S+/;
const rutaArchivosAudioTexto = /apiCuentos\/audioTexto\/\S+/;
if (!process.env.JWT_SECRET) {
    console.log("Error, jwt secret no configurado");
    throw "Error, env no configurado";
}
//Routes
app.use(express.json());
app.use("/api/usuarios", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: ['/api/usuarios/login', '/api/usuarios/registro', rutaFotografias] }), usuariosRoutes);
app.use("/api/atlas", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaIconos, rutaContenidosSeccion] }), routesNodos);
app.use("/apiCuentos", cors(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaArchivosCuadroImagen, rutaArchivosAudioTexto, rutaArchivosAudioImagen] }), routesCuentos);
app.get("/", function (req, res) {
    return res.redirect("/caracol");
});
const port = process.env.PORT || 3000;
iniciarMongoose();
httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
});
//app.listen(port, () => { console.log(`servidor Up en ${port}. Path gql: ${aServer.graphqlPath}. Subscriptions en ${aServer.subscriptionsPath}`) });
