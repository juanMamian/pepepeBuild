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
const router = require("express").Router();
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const CarpetaArchivos_1 = require("../../model/CarpetaArchivos");
const Nodo_1 = require("../../model/atlas/Nodo");
const access = util_1.promisify(fs_1.default.access);
router.get("/:idNodo/:idSeccion/:nombreArchivo", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const idNodo = req.params.idNodo;
        const idSeccion = req.params.idSeccion;
        const nombreArchivo = req.params.nombreArchivo;
        console.log(`(1)Acceso al archivo ${req.params.nombreArchivo} de contenido de sección con id ${idSeccion} de nodo`);
        let pathDefault = path_1.default.join(__dirname, '../../assetsAtlas/contenidosNodos/', "default", "index.html");
        try {
            var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "nombre secciones").exec();
            if (!elNodo)
                throw "Nodo no encontrado";
        }
        catch (error) {
            console.log(`Error buscando el nodo en la base de datos`);
            return res.sendFile(pathDefault);
        }
        const laSeccion = elNodo.secciones.id(idSeccion);
        if (!laSeccion) {
            console.log(`Seccion no encontrada`);
            return res.sendFile(pathDefault);
        }
        if (!laSeccion.idCarpeta) {
            console.log(`Carpeta no existente`);
            return res.sendFile(pathDefault);
        }
        try {
            var laCarpeta = yield CarpetaArchivos_1.ModeloCarpetaArchivos.findById(laSeccion.idCarpeta).exec();
            if (!laCarpeta)
                throw "Carpeta no encontrada";
            if (nombreArchivo) {
                var elArchivo = laCarpeta.archivos.find(a => a.nombre == nombreArchivo);
                if (!elArchivo)
                    throw "Archivo no existente";
            }
            else {
                var elArchivo = laCarpeta.archivos.find(a => a.primario == true);
                if (!elArchivo)
                    throw "Archivo primario no existente";
            }
        }
        catch (error) {
            console.log(`Error buscando el archivo. E: ${error}`);
            return res.sendFile(pathDefault);
        }
        console.log(`Archivo encontrado. Enviando`);
        res.set('Content-Type', elArchivo.mimetype);
        return res.send(elArchivo.payload);
    });
});
router.get("/:idNodo/:idSeccion", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`(2)Acceso a un archivo primario de contenido de sección ${req.params.idSeccion} de nodo`);
        const idNodo = req.params.idNodo;
        const idSeccion = req.params.idSeccion;
        const nombreArchivo = req.params.nombreArchivo;
        let pathDefault = path_1.default.join(__dirname, '../../assetsAtlas/contenidosNodos/', "default", "index.html");
        try {
            var elNodo = yield Nodo_1.ModeloNodo.findById(idNodo, "nombre secciones").exec();
            if (!elNodo)
                throw "Nodo no encontrado";
        }
        catch (error) {
            console.log(`Error buscando el nodo en la base de datos`);
            return res.sendFile(pathDefault);
        }
        const laSeccion = elNodo.secciones.id(idSeccion);
        if (!laSeccion) {
            console.log(`Seccion no encontrada`);
            return res.sendFile(pathDefault);
        }
        if (!laSeccion.idCarpeta) {
            console.log(`Carpeta no existente`);
            return res.sendFile(pathDefault);
        }
        try {
            var laCarpeta = yield CarpetaArchivos_1.ModeloCarpetaArchivos.findById(laSeccion.idCarpeta).exec();
            if (!laCarpeta)
                throw "Carpeta no encontrada";
            if (nombreArchivo) {
                var elArchivo = laCarpeta.archivos.find(a => a.nombre == nombreArchivo);
                if (!elArchivo)
                    throw "Archivo no existente";
            }
            else {
                var elArchivo = laCarpeta.archivos.find(a => a.primario == true);
                if (!elArchivo)
                    throw "Archivo primario no existente";
                console.log(`encontrado ${elArchivo.nombre}`);
            }
        }
        catch (error) {
            console.log(`Error buscando el archivo. E: ${error}`);
            return res.sendFile(pathDefault);
        }
        console.log(`Archivo encontrado. Enviando`);
        res.set('Content-Type', elArchivo.mimetype);
        return res.send(elArchivo.payload);
    });
});
module.exports = router;
