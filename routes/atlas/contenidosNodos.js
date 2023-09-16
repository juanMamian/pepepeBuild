import express from "express";
let router = express.Router();
import fs from "fs";
import { promisify } from "util";
import { ModeloCarpetaArchivos as CarpetasArchivos } from "../../model/CarpetaArchivos";
import { ModeloNodo as Nodo } from "../../model/atlas/Nodo";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const access = promisify(fs.access);
router.get("/:idNodo/:idSeccion/:nombreArchivo", async function (req, res) {
    const idNodo = req.params.idNodo;
    const idSeccion = req.params.idSeccion;
    const nombreArchivo = req.params.nombreArchivo;
    console.log(`(1)Acceso al archivo ${req.params.nombreArchivo} de contenido de sección con id ${idSeccion} de nodo`);
    let pathDefault = path.join(__dirname, '../../assetsAtlas/contenidosNodos/', "default", "index.html");
    try {
        var elNodo = await Nodo.findById(idNodo, "nombre secciones").exec();
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
        var laCarpeta = await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
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
router.get("/:idNodo/:idSeccion", async function (req, res) {
    console.log('\x1b[35m%s\x1b[0m', `(2)Acceso a un archivo primario de contenido de sección ${req.params.idSeccion} de nodo`);
    const idNodo = req.params.idNodo;
    const idSeccion = req.params.idSeccion;
    const nombreArchivo = req.params.nombreArchivo;
    let pathDefault = path.join(__dirname, '../../assetsAtlas/contenidosNodos/', "default", "index.html");
    try {
        var elNodo = await Nodo.findById(idNodo, "nombre secciones").exec();
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
    console.log(`idCarpeta: ${laSeccion.idCarpeta}`);
    try {
        var laCarpeta = await CarpetasArchivos.findById(laSeccion.idCarpeta).exec();
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
export default router;
