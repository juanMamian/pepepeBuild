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
const upload = multer({ limits: { fileSize: 7000000 } });
const router = require("express").Router();
const path = require("path");
const Libro_1 = require("../model/cuentos/Libro");
const sharp_1 = __importDefault(require("sharp"));
router.get("/imagenCuento/:idLibro/:idPagina/:idCuadroImagen", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { idLibro, idPagina, idCuadroImagen } = req.params;
        try {
            var elLibro = yield Libro_1.ModeloLibro.findById(idLibro);
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
});
router.get("/audioTexto/:idLibro/:idPagina/:idCuadroTexto", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { idLibro, idPagina, idCuadroTexto } = req.params;
        try {
            var elLibro = yield Libro_1.ModeloLibro.findById(idLibro);
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
});
router.get("/audioImagen/:idLibro/:idPagina/:idCuadroImagen", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { idLibro, idPagina, idCuadroImagen } = req.params;
        try {
            var elLibro = yield Libro_1.ModeloLibro.findById(idLibro);
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
});
router.post("/subirArchivoCuadroImagen", upload.single("imagen"), function (err, req, res, next) {
    console.log(`Errores: <<${err.message}>>`);
    let mensaje = "Archivo no permitido";
    if (err.message == "File too large")
        mensaje = "Archivo demasiado grande";
    return res.status(400).send({ msjUsuario: mensaje });
}, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
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
            console.log(`Participacion con archivo adjunto`);
            console.log(`El archivo uploaded pesaba ${req.file.size} de tipo ${req.file.mimetype}`);
            //resize
            let archivoFinal = req.file.buffer;
            if (req.file.mimetype == "image/png" || req.file.mimetype == "image/jpg" || req.file.mimetype == "image/jpeg") {
                try {
                    let imgOriginal = yield sharp_1.default(yield sharp_1.default(req.file.buffer).rotate().toBuffer());
                    let metadata = yield imgOriginal.metadata();
                    let anchoOriginal = metadata.width;
                    //let altoOriginal=await imgOriginal.metadata().height;                
                    var imgFinal = imgOriginal;
                    console.log(`Ancho: ${anchoOriginal}`);
                    if (anchoOriginal > 800) {
                        console.log(`Empequeñeciendo a 800 width. Tenía ${anchoOriginal}`);
                        imgFinal = yield imgOriginal.resize({ width: 800 }).toBuffer();
                    }
                    else {
                        imgFinal = yield imgOriginal.toBuffer();
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
                var elLibro = yield Libro_1.ModeloLibro.findById(idLibro).exec();
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
                yield elLibro.save();
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
});
module.exports = router;
