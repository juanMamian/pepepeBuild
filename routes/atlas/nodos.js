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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require("multer");
const upload = multer({ limits: { fileSize: 10000000 } });
const router = require("express").Router();
const Usuario_1 = require("../../model/Usuario");
const Nodo_1 = require("../../model/atlas/Nodo");
const CarpetaArchivos_1 = require("../../model/CarpetaArchivos");
const path_1 = __importDefault(require("path"));
router.post("/updateIcono", upload.single("nuevoIcono"), function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var elNodo = yield Nodo_1.ModeloNodo.findById(req.body.idNodo, "nombre icono");
        }
        catch (error) {
            console.log(`error buscando el nodo para cambio de icono. e: ` + error);
            return res.status(400).send('');
        }
        console.log(`updating icono del nodo ${elNodo.nombre} con id ${req.body.idNodo}`);
        // console.log(`info en la request: files: ${req.files}, otros: ${req.body}`);
        elNodo.icono = req.file.buffer;
        try {
            yield elNodo.save();
        }
        catch (error) {
            console.log(`error guardando el nodo después de subir imagen. e: ` + error);
            return res.status(400).send('');
        }
        res.send({ resultado: "ok" });
    });
});
router.get("/iconos/:id", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idNodo = req.params.id;
        if (idNodo == "null" || idNodo == "undefined" || idNodo == "-1" || !idNodo) {
            return res.sendFile(path_1.default.join(__dirname, '../../public/media/iconos/nodoConocimientoDefault.png'));
        }
        try {
            var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "icono");
        }
        catch (error) {
            console.log(`error buscando el nodo con icono. e: ` + error);
            return res.status(400).send('Nodo no encontrado');
        }
        if (!elNodo.icono) {
            return res.sendFile(path_1.default.join(__dirname, '../../public/media/iconos/nodoConocimientoDefault.png'));
        }
        res.set('Content-Type', 'image/png');
        return res.send(elNodo.icono);
    });
});
router.post("/subirArchivoContenidoSeccionNodo", upload.single("nuevoArchivo"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Recibiendo un archivo [${req.file.mimetype}] para una carpeta de contenidos de seccion de nodo de conocimiento`);
        try {
            var elNodo = yield Nodo_1.ModeloNodo.findById(req.body.idNodo, "nombre expertos secciones");
        }
        catch (error) {
            console.log(`error buscando el nodo para cambio de icono. e: ` + error);
            return res.status(400).send('');
        }
        if (!("user" in req)) {
            console.log(`No habia info del bearer`);
            return res.status(401).send('');
        }
        if (!("id" in req.user)) {
            console.log(`no había id del usuario`);
            return res.status(401).send('');
        }
        let idUsuario = req.user.id;
        console.log(`Recibida peticion de subir archivo por el usuario ${req.user.username}`);
        try {
            var elUsuario = yield Usuario_1.ModeloUsuario.findById(idUsuario, "permisos").exec();
            if (!elUsuario)
                throw "Usuario no encontrado";
        }
        catch (error) {
            console.log('Error buscando el usuario . E: ' + error);
            return res.status(400).send("Error identificando usuario");
        }
        const permisosEspeciales = ["superadministrador", "atlasAdministrador"];
        if (!elNodo.expertos.includes(idUsuario) && !elUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
            console.log(`Usuario no autorizado. Tenía ${elUsuario.permisos}`);
            return res.status(401).send("No autorizado");
        }
        const idSeccion = req.body.idSeccion;
        console.log(`Subiendo archivo para la sección ${idSeccion} del nodo ${elNodo.nombre}`);
        var laSeccion = elNodo.secciones.id(idSeccion);
        if (!laSeccion) {
            console.log(`La sección no existía en este nodo`);
            return res.status(400).send("Seccion no existía");
        }
        var carpetaExiste = false;
        var idCarpeta = laSeccion.idCarpeta;
        if (idCarpeta) {
            try {
                var laCarpeta = yield CarpetaArchivos_1.ModeloCarpetaArchivos.findById(idCarpeta).exec();
                if (laCarpeta)
                    carpetaExiste = true;
            }
            catch (error) {
                console.log(`Error buscando carpeta. E: ${error}`);
            }
        }
        if (!carpetaExiste) {
            console.log(`Carpeta no existía. Creando`);
            try {
                laCarpeta = yield new CarpetaArchivos_1.ModeloCarpetaArchivos({});
                idCarpeta = laCarpeta._id;
                laSeccion.idCarpeta = idCarpeta;
                yield elNodo.save();
                console.log(`Carpeta creada y referenciada en la seccion del nodo`);
            }
            catch (error) {
                console.log(`Error creando carpeta. E: ${error}`);
            }
        }
        //Purgar
        //Subir arhivo a la carpeta.
        const nuevoArchivo = laCarpeta.archivos.create({
            nombre: req.file.originalname,
            payload: req.file.buffer,
            mimetype: req.file.mimetype,
        });
        try {
            laCarpeta.archivos.push(nuevoArchivo);
            // console.log(`Guardando archivos de la carpeta así: ${laCarpeta.archivos}`);
            yield laCarpeta.save();
        }
        catch (error) {
            console.log(`Error guardando el archivo en la carpet mongo. E: ${error}`);
            return res.status(400).send("Error guardando archivo");
        }
        res.send({ resultado: "ok", infoArchivo: { nombre: req.file.originalname, primario: nuevoArchivo.primario, __typename: "InfoArchivoContenidoNodo" } });
    });
});
module.exports = router;
