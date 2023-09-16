import multer from "multer";
const upload = multer({ limits: { fileSize: 10000000 } });
import express from "express";
let router = express.Router();
import { ModeloUsuario as Usuario } from "../../model/Usuario";
import { ModeloNodo as Nodo } from "../../model/atlas/Nodo";
import { ModeloCarpetaArchivos as CarpetasArchivos } from "../../model/CarpetaArchivos";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
router.post("/updateIcono", upload.single("nuevoIcono"), async function (req, res) {
    try {
        var elNodo = await Nodo.findById(req.body.idNodo, "nombre icono");
    }
    catch (error) {
        console.log(`error buscando el nodo para cambio de icono. e: ` + error);
        return res.status(400).send('');
    }
    console.log(`updating icono del nodo ${elNodo.nombre} con id ${req.body.idNodo}`);
    // console.log(`info en la request: files: ${req.files}, otros: ${req.body}`);
    elNodo.icono = req.file.buffer;
    try {
        await elNodo.save();
    }
    catch (error) {
        console.log(`error guardando el nodo después de subir imagen. e: ` + error);
        return res.status(400).send('');
    }
    res.send({ resultado: "ok" });
});
router.get("/iconos/:id", async function (req, res) {
    const idNodo = req.params.id;
    if (idNodo == "null" || idNodo == "undefined" || idNodo == "-1" || !idNodo) {
        return res.sendFile(path.join(__dirname, '../../public/media/iconos/nodoConocimientoDefault.png'));
    }
    try {
        var elNodo = await Nodo.findById(idNodo, "icono");
    }
    catch (error) {
        console.log(`error buscando el nodo con icono. e: ` + error);
        return res.status(400).send('Nodo no encontrado');
    }
    if (!elNodo.icono) {
        return res.sendFile(path.join(__dirname, '../../public/media/iconos/nodoConocimientoDefault.png'));
    }
    res.set('Content-Type', 'image/png');
    return res.send(elNodo.icono);
});
router.post("/subirArchivoContenidoSeccionNodo", upload.single("nuevoArchivo"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, async function (req, res) {
    console.log(`Recibiendo un archivo [${req.file.mimetype}] para una carpeta de contenidos de seccion de nodo de conocimiento`);
    try {
        var elNodo = await Nodo.findById(req.body.idNodo, "nombre expertos secciones");
    }
    catch (error) {
        console.log(`error buscando el nodo para cambio de icono. e: ` + error);
        return res.status(400).send('');
    }
    if (!("user" in req)) {
        console.log(`No habia info del bearer`);
        return res.status(401).send('');
    }
    if (!("id" in req.auth)) {
        console.log(`no había id del usuario`);
        return res.status(401).send('');
    }
    let idUsuario = req.auth.id;
    console.log(`Recibida peticion de subir archivo por el usuario ${req.auth.username}`);
    try {
        var elUsuario = await Usuario.findById(idUsuario, "permisos").exec();
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
            var laCarpeta = await CarpetasArchivos.findById(idCarpeta).exec();
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
            laCarpeta = await new CarpetasArchivos({});
            idCarpeta = laCarpeta._id;
            laSeccion.idCarpeta = idCarpeta;
            await elNodo.save();
            console.log(`Carpeta creada y referenciada en la seccion del nodo`);
        }
        catch (error) {
            console.log(`Error creando carpeta. E: ${error}`);
        }
    }
    //Purgar
    //Subir arhivo a la carpeta.
    var nuevoArchivo = laCarpeta.archivos.create({
        nombre: req.file.originalname,
        payload: req.file.buffer,
        mimetype: req.file.mimetype,
    });
    if (!laCarpeta.archivos || laCarpeta.archivos.length < 1) {
        nuevoArchivo.primario = true;
    }
    try {
        laCarpeta.archivos.push(nuevoArchivo);
        // console.log(`Guardando archivos de la carpeta así: ${laCarpeta.archivos}`);
        await laCarpeta.save();
    }
    catch (error) {
        console.log(`Error guardando el archivo en la carpet mongo. E: ${error}`);
        return res.status(400).send("Error guardando archivo");
    }
    res.send({ resultado: "ok", infoArchivo: { nombre: req.file.originalname, primario: nuevoArchivo.primario, __typename: "InfoArchivoContenidoNodo" } });
});
export default router;
