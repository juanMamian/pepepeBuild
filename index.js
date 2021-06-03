"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const dotenv = require("dotenv");
dotenv.config();
const usuariosRoutes = require("./routes/usuarios");
const routesNodos = require("./routes/atlas/nodos");
const routesActividadesProfes = require("./routes/actividadesProfes");
const routesForos = require("./routes/foros");
const routesContenidosNodos = require("./routes/atlas/contenidosNodos");
const routesCuentos = require("./routes/cuentos");
const mongoose_1 = require("./mongoose");
const ejwt = require("express-jwt");
const cors_1 = __importDefault(require("cors"));
const Schema_1 = require("./gql/Schema");
//Rutas pepepe
console.log(`Carpeta estatica en ${__dirname + '/pepepe'}`);
app.use("/assetsAtlas/contenidosNodos/:idNodo/:nombreCategoria/default", express_1.default.static(__dirname + '/assetsAtlas/contenidosNodos/default/'));
app.use("/pepepe", express_1.default.static(__dirname + '/clientes/pepepe'));
app.get("/pepepe", function (req, res) {
    res.sendFile(__dirname + "/clientes/pepepe/index.html");
});
//rutas tallerCuentos
app.use("/tallerCuentos", express_1.default.static(__dirname + "/clientes/tallerCuentos"));
app.get("/tallerCuentos", function (req, res) {
    res.sendFile(__dirname + "/clientes/tallerCuentos/index.html");
});
//rutas libro
app.use("/libro", express_1.default.static(__dirname + "/clientes/libro"));
app.get("/libro", function (req, res) {
    res.sendFile(__dirname + "/clientes/libro/index.html");
});
Schema_1.aServer.applyMiddleware({ app });
//Carpetas publicas
app.use("/assetsAtlas/contenidosNodos", routesContenidosNodos);
app.use("/assetsAtlas", express_1.default.static(__dirname + '/assetsAtlas'));
const rutaFotografias = /api\/usuarios\/fotografias\/\S+/;
const rutaGuias = /api\/actividadesProfes\/guia\/\S+/;
const rutaEvidencias = /api\/actividadesProfes\/evidencia\/\S+/;
const rutaAdjuntos = /api\/foros\/adjuntos\/\S+/;
const rutaIconos = /api\/atlas\/iconos\/\S+/;
const rutaContenidosSeccion = /api\/atlas\/seccion\/\S+/;
const rutaArchivosCuadroImagen = /apiCuentos\/imagenCuento\/\S+/;
const rutaArchivosAudioImagen = /apiCuentos\/audioImagen\/\S+/;
const rutaArchivosAudioTexto = /apiCuentos\/audioTexto\/\S+/;
//Routes
app.use(express_1.default.json());
app.use("/api/usuarios", cors_1.default(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: ['/api/usuarios/login', '/api/usuarios/registro', rutaFotografias] }), usuariosRoutes);
app.use("/api/atlas", cors_1.default(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaIconos, rutaContenidosSeccion] }), routesNodos);
app.use("/api/actividadesProfes", cors_1.default(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaGuias, rutaEvidencias] }), routesActividadesProfes);
app.use("/api/foros", cors_1.default(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaAdjuntos] }), routesForos);
app.use("/apiCuentos", cors_1.default(), ejwt({ secret: process.env.JWT_SECRET, algorithms: ['HS256'] }).unless({ path: [rutaArchivosCuadroImagen, rutaArchivosAudioTexto, rutaArchivosAudioImagen] }), routesCuentos);
app.get("/", function (req, res) {
    return res.redirect("/pepepe");
});
const port = process.env.PORT || 3000;
const httpServer = http_1.default.createServer(app);
Schema_1.aServer.installSubscriptionHandlers(httpServer);
mongoose_1.iniciarMongoose();
httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${Schema_1.aServer.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${port}${Schema_1.aServer.subscriptionsPath}`);
});
//app.listen(port, () => { console.log(`servidor Up en ${port}. Path gql: ${aServer.graphqlPath}. Subscriptions en ${aServer.subscriptionsPath}`) });
