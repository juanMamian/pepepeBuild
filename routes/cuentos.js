import multer from "multer";
const upload = multer({ limits: { fileSize: 7000000 } });
import express from "express";
let router = express.Router();
import { ModeloLibro as Libro } from "../model/cuentos/Libro";
import sharp from "sharp";
router.get("/imagenCuento/:idLibro/:idPagina/:idCuadroImagen", async function (req, res) {
    const { idLibro, idPagina, idCuadroImagen } = req.params;
    try {
        var elLibro = await Libro.findById(idLibro);
        if (!elLibro)
            throw "Libro no encontrado";
    }
    catch (error) {
        console.log(`error buscando el libro. e: ` + error);
        return res.status(404);
    }
    const laPagina = elLibro.paginas.id(idPagina);
    if (!laPagina) {
        return res.status(404);
    }
    const elCuadroImagen = laPagina.cuadrosImagen.id(idCuadroImagen);
    if (!elCuadroImagen) {
        return res.status(404);
    }
    res.set('Content-Type', 'image/png');
    res.send(elCuadroImagen.archivo);
    return;
});
router.get("/audioTexto/:idLibro/:idPagina/:idCuadroTexto", async function (req, res) {
    const { idLibro, idPagina, idCuadroTexto } = req.params;
    try {
        var elLibro = await Libro.findById(idLibro);
        if (!elLibro)
            throw "Libro no encontrado";
    }
    catch (error) {
        console.log(`error buscando el libro. e: ` + error);
        return res.status(404);
    }
    const laPagina = elLibro.paginas.id(idPagina);
    if (!laPagina) {
        return res.status(404);
    }
    const elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
    if (!elCuadroTexto) {
        return res.status(404);
    }
    if (!elCuadroTexto.audio || !elCuadroTexto.audio.archivo) {
        return res.status(404);
    }
    res.set('Content-Type', 'image/png');
    res.send(elCuadroTexto.audio.archivo);
    return;
});
router.get("/audioImagen/:idLibro/:idPagina/:idCuadroImagen", async function (req, res) {
    const { idLibro, idPagina, idCuadroImagen } = req.params;
    try {
        var elLibro = await Libro.findById(idLibro);
        if (!elLibro)
            throw "Libro no encontrado";
    }
    catch (error) {
        console.log(`error buscando el libro. e: ` + error);
        return res.status(404);
    }
    const laPagina = elLibro.paginas.id(idPagina);
    if (!laPagina) {
        return res.status(404);
    }
    const elCuadroImagen = laPagina.cuadrosImagen.id(idCuadroImagen);
    if (!elCuadroImagen) {
        return res.status(404);
    }
    if (!elCuadroImagen.audio || !elCuadroImagen.audio.archivo) {
        return res.status(404);
    }
    res.set('Content-Type', 'image/png');
    res.send(elCuadroImagen.audio.archivo);
    return;
});
router.post("/subirArchivoCuadroImagen", upload.single("imagen"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    var mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, async function (req, res) {
    console.log(`Uploading archivo para cuadroImagen de un cuento con id ${req.body.idLibro}`);
    var success = false;
    if (!("user" in req)) {
        console.log(`No habia info del bearer`);
        return;
    }
    if (!("id" in req.user)) {
        console.log(`no había id del usuario`);
        return;
    }
    let idUsuario = req.user.id;
    console.log(`Recibida peticion de subir imagen de cuadroImagen por el usuario ${req.user.username}`);
    var extensionDeArchivo = "";
    if ("file" in req) {
        console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);
        //resize
        let archivoFinal = req.file.buffer;
        if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg") {
            try {
                let imgOriginal = await sharp(await sharp(req.file.buffer).rotate().toBuffer());
                let metadata = await imgOriginal.metadata();
                let anchoOriginal = metadata.width || 0;
                //let altoOriginal=await imgOriginal.metadata().height;                
                var imgFinal = imgOriginal;
                console.log(`Ancho: ${anchoOriginal}`);
                if (anchoOriginal > 800) {
                    console.log(`Empequeñeciendo a 800 width. Tenía ${anchoOriginal}`);
                    imgFinal = await sharp(await imgOriginal.resize({ width: 800 }).toBuffer());
                }
                else {
                    imgFinal = await sharp(await imgOriginal.toBuffer());
                }
                archivoFinal = imgFinal;
            }
            catch (error) {
                console.log(`Error resizing image. E: ${error}`);
                return res.status(500).send("Error guardando el archivo");
            }
        }
        else {
            console.log(`Archivo de tipo ${req.file.mimetype} no soportado`);
            return res.status(400).send({ msjUsuario: 'Tipo de archivo no soportado' });
        }
        //Guardar la imagen en la base de datos
        const { idLibro, idPagina, idCuadroImagen } = req.body;
        try {
            var elLibro = await Libro.findById(idLibro).exec();
            if (!elLibro)
                throw "Libro no encontrado";
        }
        catch (error) {
            console.log(`Error buscandoe el libro en la base de datos. E: ${error}`);
            return res.status(400).send("Libro no encontrado");
        }
        var laPagina = elLibro.paginas.id(idPagina);
        if (!laPagina) {
            return res.status(400).send("Pagina no encontrada");
        }
        var elCuadroImagen = laPagina.cuadrosImagen.id(idCuadroImagen);
        if (!elCuadroImagen) {
            return res.status(400).send("Cuadro imágen no encontrado");
        }
        elCuadroImagen.archivo = archivoFinal;
        elCuadroImagen.sinArchivo = false;
        try {
            await elLibro.save();
        }
        catch (error) {
            console.log(`Error guardando el libro. E: ${error}`);
            return res.status(500).send("Error conectando con la base de datos");
        }
        console.log(`Archivo subido`);
        success = true;
    }
    else {
        console.log(`No se encontró archivo adjunto`);
        return res.status(400).send("No se adjuntó archivo");
    }
    console.log(`Resultado: ${success}`);
    res.send(success);
});
router.post("/subirArchivoAudioCuadroTexto", upload.single("audio"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    var mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, async function (req, res) {
    console.log(`Uploading archivo de audio para cuadroTexto de un cuento con id ${req.body.idLibro}`);
    var success = false;
    if (!("user" in req)) {
        console.log(`No habia info del bearer`);
        return;
    }
    if (!("id" in req.user)) {
        console.log(`no había id del usuario`);
        return;
    }
    let idUsuario = req.user.id;
    console.log(`Recibida peticion de subir audio de cuadroTexto por el usuario ${req.user.username}`);
    var extensionDeArchivo = "";
    if ("file" in req) {
        console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);
        if (req.file.mimetype != "audio/ogg" && req.file.mimetype != "video/ogg") {
            return res.status(400).send({ msjUsuario: "Formato de archivo no soportado" });
        }
        // //resize
        // let archivoFinal = req.file.buffer;
        // if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg") {
        //     try {
        //         let imgOriginal = await sharp(await sharp(req.file.buffer).rotate().toBuffer());
        //         let metadata = await imgOriginal.metadata();
        //         let anchoOriginal = metadata.width;
        //         //let altoOriginal=await imgOriginal.metadata().height;                
        //         var imgFinal = imgOriginal;
        //         console.log(`Ancho: ${anchoOriginal}`);
        //         if (anchoOriginal > 800) {
        //             console.log(`Empequeñeciendo a 800 width. Tenía ${anchoOriginal}`);
        //             imgFinal = await imgOriginal.resize({ width: 800 }).toBuffer();
        //         } else {
        //             imgFinal = await imgOriginal.toBuffer();
        //         }
        //         archivoFinal = imgFinal;
        //     } catch (error) {
        //         console.log(`Error resizing image. E: ${error}`);
        //         return res.status(500).send("Error guardando el archivo");
        //     }
        // }
        // else {
        //     console.log(`Archivo de tipo ${req.file.mimetype} no soportado`);
        //     return res.status(400).send({ msjUsuario: 'Tipo de archivo no soportado' })
        // }
        //Guardar la imagen en la base de datos
        const { idLibro, idPagina, idCuadroTexto } = req.body;
        try {
            var elLibro = await Libro.findById(idLibro).exec();
            if (!elLibro)
                throw "Libro no encontrado";
        }
        catch (error) {
            console.log(`Error buscandoe el libro en la base de datos. E: ${error}`);
            return res.status(400).send("Libro no encontrado");
        }
        var laPagina = elLibro.paginas.id(idPagina);
        if (!laPagina) {
            return res.status(400).send("Pagina no encontrada");
        }
        var elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
        if (!elCuadroTexto) {
            return res.status(400).send("Cuadro texto no encontrado");
        }
        if (!elCuadroTexto.audio) {
            elCuadroTexto.audio = {};
        }
        elCuadroTexto.audio.archivo = req.file.buffer;
        try {
            await elLibro.save();
        }
        catch (error) {
            console.log(`Error guardando el libro. E: ${error}`);
            return res.status(500).send("Error conectando con la base de datos");
        }
        console.log(`Archivo subido`);
        success = true;
    }
    else {
        console.log(`No se encontró archivo adjunto`);
        return res.status(400).send("No se adjuntó archivo");
    }
    console.log(`Resultado: ${success}`);
    res.send(success);
});
router.post("/subirArchivoAudioCuadroImagen", upload.single("audio"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    var mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, async function (req, res) {
    console.log(`Uploading archivo de audio para cuadroImagen de un cuento con id ${req.body.idLibro}`);
    var success = false;
    if (!("user" in req)) {
        console.log(`No habia info del bearer`);
        return;
    }
    if (!("id" in req.user)) {
        console.log(`no había id del usuario`);
        return;
    }
    let idUsuario = req.user.id;
    console.log(`Recibida peticion de subir audio de cuadroImagen por el usuario ${req.user.username}`);
    var extensionDeArchivo = "";
    if ("file" in req) {
        console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);
        if (req.file.mimetype != "audio/ogg" && req.file.mimetype != "video/ogg") {
            return res.status(400).send({ msjUsuario: "Formato de archivo no soportado" });
        }
        // //resize
        // let archivoFinal = req.file.buffer;
        // if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg") {
        //     try {
        //         let imgOriginal = await sharp(await sharp(req.file.buffer).rotate().toBuffer());
        //         let metadata = await imgOriginal.metadata();
        //         let anchoOriginal = metadata.width;
        //         //let altoOriginal=await imgOriginal.metadata().height;                
        //         var imgFinal = imgOriginal;
        //         console.log(`Ancho: ${anchoOriginal}`);
        //         if (anchoOriginal > 800) {
        //             console.log(`Empequeñeciendo a 800 width. Tenía ${anchoOriginal}`);
        //             imgFinal = await imgOriginal.resize({ width: 800 }).toBuffer();
        //         } else {
        //             imgFinal = await imgOriginal.toBuffer();
        //         }
        //         archivoFinal = imgFinal;
        //     } catch (error) {
        //         console.log(`Error resizing image. E: ${error}`);
        //         return res.status(500).send("Error guardando el archivo");
        //     }
        // }
        // else {
        //     console.log(`Archivo de tipo ${req.file.mimetype} no soportado`);
        //     return res.status(400).send({ msjUsuario: 'Tipo de archivo no soportado' })
        // }
        //Guardar la imagen en la base de datos
        const { idLibro, idPagina, idCuadroImagen } = req.body;
        try {
            var elLibro = await Libro.findById(idLibro).exec();
            if (!elLibro)
                throw "Libro no encontrado";
        }
        catch (error) {
            console.log(`Error buscandoe el libro en la base de datos. E: ${error}`);
            return res.status(400).send("Libro no encontrado");
        }
        var laPagina = elLibro.paginas.id(idPagina);
        if (!laPagina) {
            return res.status(400).send("Pagina no encontrada");
        }
        var elCuadroImagen = laPagina.cuadrosImagen.id(idCuadroImagen);
        if (!elCuadroImagen) {
            return res.status(400).send("Cuadro Imagen no encontrado");
        }
        if (!elCuadroImagen.audio) {
            elCuadroImagen.audio = {};
        }
        elCuadroImagen.audio.archivo = req.file.buffer;
        try {
            await elLibro.save();
        }
        catch (error) {
            console.log(`Error guardando el libro. E: ${error}`);
            return res.status(500).send("Error conectando con la base de datos");
        }
        console.log(`Archivo subido`);
        success = true;
    }
    else {
        console.log(`No se encontró archivo adjunto`);
        return res.status(400).send("No se adjuntó archivo");
    }
    console.log(`Resultado: ${success}`);
    res.send(success);
});
export default router;
