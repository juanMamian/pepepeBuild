const multer = require("multer");
const upload = multer({ limits: { fileSize: 7000000 } });
const router = require("express").Router();
const path = require("path");
import { drive, jwToken } from "./utilidades";
import streamifier from "streamifier";
import sharp from "sharp";
import { ModeloUsuario as Usuario } from "../model/Usuario";
router.post("/adjuntarArchivoParaRespuesta", upload.single("archivoAdjunto"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, async function (req, res) {
    if (!("user" in req)) {
        console.log(`No habia info del bearer`);
        return;
    }
    if (!("id" in req.user)) {
        console.log(`no había id del usuario`);
        return;
    }
    let idUsuario = req.user.id;
    console.log(`Recibida peticion de subir archivo por el usuario ${req.user.username}`);
    try {
        var elUsuario = await Usuario.findById(idUsuario).exec();
        if (!elUsuario)
            throw "Usuario no encontrado";
        var nombreApellido = elUsuario.nombres + " " + elUsuario.apellidos;
    }
    catch (error) {
        console.log('Error buscando el usuario . E: ' + error);
        return res.status(400).send("Error identificando usuario");
    }
    var extensionDeArchivo = "";
    if ("file" in req) {
        console.log(`Participacion con archivo adjunto`);
        console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);
        if (req.file.mimetype == "application/pdf") {
            extensionDeArchivo = "pdf";
        }
        else if (req.file.mimetype == "image/png") {
            extensionDeArchivo = "png";
        }
        else if (req.file.mimetype == "image/jpg") {
            extensionDeArchivo = "jpg";
        }
        else if (req.file.mimetype == "image/jpeg") {
            extensionDeArchivo = "jpg";
        }
        else if (req.file.mimetype == "audio/aac") {
            extensionDeArchivo = "aac";
        }
        else if (req.file.mimetype == "audio/x-wav") {
            extensionDeArchivo = "wav";
        }
        else if (req.file.mimetype == "audio/webm") {
            extensionDeArchivo = "weba";
        }
        else if (req.file.mimetype == "audio/mpeg") {
            extensionDeArchivo = "mpga";
        }
        else if (req.file.mimetype == "audio/mp4") {
            extensionDeArchivo = "mp4a";
        }
        else if (req.file.mimetype == "audio/ogg") {
            extensionDeArchivo = "oga";
        }
        else if (req.file.mimetype == "video/ogg") {
            extensionDeArchivo = "ogg";
        }
        else if (req.file.mimetype == "audio/amr") {
            extensionDeArchivo = "amr";
        }
        else if (req.file.mimetype == "video/3gpp") {
            extensionDeArchivo = "3gpp";
        }
        else if (req.file.mimetype == "video/x-m4a") {
            extensionDeArchivo = "m4a";
        }
        else if (req.file.mimetype == "audio/x-m4a") {
            extensionDeArchivo = "m4a";
        }
        else if (req.file.mimetype == "application/vnd.oasis.opendocument.text") {
            extensionDeArchivo = "odt";
        }
        else if (req.file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            extensionDeArchivo = "docx";
        }
        else {
            console.log(`No habia extensión para el tipo de archivo ${req.file.mimetype}`);
            return res.status(400).send({ msjUsuario: "El mimetype " + req.file.mimetype + " no está soportado" });
        }
        //resize
        let archivoFinal = req.file.buffer;
        if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg") {
            try {
                let imgOriginal = await sharp(await sharp(req.file.buffer).rotate().toBuffer());
                let metadata = await imgOriginal.metadata();
                let anchoOriginal = metadata.width;
                //let altoOriginal=await imgOriginal.metadata().height;                
                var imgFinal = imgOriginal;
                console.log(`Ancho: ${anchoOriginal}`);
                if (anchoOriginal > 800) {
                    console.log(`Empequeñeciendo a 800 width. Tenía ${anchoOriginal}`);
                    imgFinal = await imgOriginal.resize({ width: 800 }).toBuffer();
                }
                else {
                    imgFinal = await imgOriginal.toBuffer();
                }
                archivoFinal = imgFinal;
            }
            catch (error) {
                console.log(`Error resizing image. E: ${error}`);
                return res.status(500).send("Error guardando el archivo");
            }
        }
        let idCarpetaAdjuntosForos = "1K6bOuHBuJe0FHlzqYA398A_AlxOXqLtZ";
        try {
            await jwToken.authorize();
        }
        catch (error) {
            console.log(`Error autorizando token. E: ${error}`);
            return res.status(500).send("Error conectando con el servidor de google drive");
        }
        var fileMetadata = {
            'name': 'adjunto de ' + nombreApellido + '.' + extensionDeArchivo,
            parents: [idCarpetaAdjuntosForos],
        };
        var media = {
            mimeType: req.file.mimetype,
            body: streamifier.createReadStream(archivoFinal)
        };
        var infoArchivo = {};
        try {
            let respuesta = await drive.files.create({
                auth: jwToken,
                resource: fileMetadata,
                media: media,
                fields: 'id, webContentLink'
            });
            infoArchivo.idGoogleDrive = respuesta.data.id;
            infoArchivo.googleDriveDirectLink = respuesta.data.webContentLink;
            infoArchivo.nombre = fileMetadata.name;
            infoArchivo.extension = extensionDeArchivo;
        }
        catch (error) {
            console.log(`Error creando archivo: E: ${error}`);
            return res.status(500).send("Error conectando con el servidor de google drive");
        }
    }
    else {
        res.status(400).send("No se adjuntó archivo");
    }
    console.log(`Archivo subido`);
    res.send({ infoArchivo });
});
module.exports = router;
