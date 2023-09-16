import multer from "multer";
const upload = multer();
import express from "express";
let router = express.Router();
import { ModeloUsuario as Usuario, validarDatosUsuario } from "../model/Usuario";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import { errorApi } from "../errorHandling";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var charProhibidosUsername = /[^a-zA-ZñÑ0-9_]/g;
var charProhibidosPassword = /[^a-zA-Z0-9ñÑ*@_-]/g;
const minPassword = 6;
const minUsername = 4;
router.post("/registro", async (req, res) => {
    console.log("peticion de registro: " + JSON.stringify(req.body));
    let datosRegistro = req.body.usuario;
    let camposObligatorios = ["nombres", "apellidos", "username", "password"];
    let datosIntroducidos = new Object();
    for (let campo in datosRegistro) {
        if (!datosRegistro[campo]) {
            console.log(`campo ${campo} vacio`);
        }
        else {
            datosIntroducidos[campo] = datosRegistro[campo].trim();
        }
    }
    camposObligatorios.forEach((campoObligatorio) => {
        if (!datosIntroducidos[campoObligatorio]) {
            console.log(`Faltaba el campo ${campoObligatorio}`);
            return res.status(400).send({ msjUsuario: `El campo ${campoObligatorio} es necesario` });
        }
    });
    let erroresDatos = validarDatosUsuario(datosIntroducidos);
    if (erroresDatos.length > 0) {
        console.log(`Había errores en los datos: ${erroresDatos}`);
        return res.status(400).send({ msjUsuario: erroresDatos[0] });
    }
    try {
        var nuevoU = Object.assign({}, datosIntroducidos);
    }
    catch (e) {
        console.log(`error creando el nuevo Usuario. E: ${e}`);
        return res.status(400).send();
    }
    try {
        if (await Usuario.findOne({ username: nuevoU.username }).exec()) {
            console.log(`Error. El username ya existía`);
            return res.status(400).send({ msjUsuario: "El username ya existía" });
        }
    }
    catch (error) {
        console.log("Error conectandose con la base de datos para verificar si ya existía el nombre de usuario. E: " + error);
        let respuesta = errorApi(null, "Error database", "", "Error conectando con la base de datos");
        return res.status(503).send(respuesta);
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(nuevoU.password, salt);
    nuevoU.password = hashPassword;
    try {
        var nuevoUsuario = new Usuario({ ...nuevoU });
    }
    catch (error) {
        let respuesta = errorApi(error, "database", "Error creando el objeto mongoose antes de subirlo a la DB", null);
        return res.status(400).send(respuesta);
    }
    try {
        await nuevoUsuario.save();
    }
    catch (error) {
        let respuesta = errorApi(error, "database", "Error guardando el objeto en mongoDB", null);
        return res.status(400).send(respuesta);
    }
    console.log(`Registro exitoso de ${nuevoUsuario.username} con id ${nuevoUsuario._id}`);
    return res.status(200).send({ registro: true, msjUsuario: "Registro exitoso" });
});
router.post("/login", async (req, res) => {
    let datosLogin = {
        username: req.body.username,
        password: req.body.password,
    };
    console.log(`LOGIN`);
    let erroresDatos = validarDatosUsuario(datosLogin);
    if (erroresDatos.length > 0) {
        console.log(`Errores en datos de usuario: ${erroresDatos}`);
        return res.status(400).send({ msjUsuario: erroresDatos[0] });
    }
    const username = req.body.username;
    const pass = req.body.password;
    console.log("loging " + JSON.stringify(req.body));
    try {
        var elUsuario = await Usuario.findOne({ username }, "username password permisos").exec();
        if (!elUsuario) {
            console.log("usuario no encontrado");
            return res.status(400).send({ error: "badLogin", msjUsuario: "Datos incorrectos" });
        }
    }
    catch (error) {
        console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
    }
    const correctLogin = await bcrypt.compare(pass, elUsuario.password);
    if (correctLogin) {
        console.log(`login correcto de ${username}. Enviando JWT`);
        let datosToken = {
            id: elUsuario._id,
            permisos: elUsuario.permisos,
            username: elUsuario.username,
            version: 1,
        };
        if (!process.env.JWT_SECRET) {
            throw "ENV JWT SECRET no configurado";
        }
        let token = jwt.sign(datosToken, process.env.JWT_SECRET);
        let respuesta = {
            username: elUsuario.username,
            permisos: elUsuario.permisos,
            token
        };
        res.status(200).send(respuesta);
        return;
    }
    else {
        console.log(`Contraseña errada. Rechazando`);
        return res.status(400).send({ error: "badLogin", msjUsuario: "Datos incorrectos" });
    }
});
router.post("/updatePassword", async (req, res) => {
    if (!req.auth) {
        console.log(`No habia info del bearer`);
        return res.status(401).send('No autorizado');
    }
    if (!req.auth.id) {
        console.log(`no había id del usuario`);
        return res.status(401).send('No autorizado');
    }
    let idUsuario = req.auth.id;
    let datosUpdatePass = {
        viejoPassword: req.body.viejoPassword,
        nuevoPassword: req.body.nuevoPassword,
    };
    //Validación
    let erroresViejoPassword = validarDatosUsuario({ password: datosUpdatePass.viejoPassword });
    if (erroresViejoPassword.length > 0) {
        console.log(`Error en el viejoPassword: ${erroresViejoPassword}`);
        return res.status(400).send({ msjUsuario: erroresViejoPassword[0] });
    }
    let erroresNuevoPassword = validarDatosUsuario({ password: datosUpdatePass.nuevoPassword });
    if (erroresNuevoPassword.length > 0) {
        console.log(`Error en el nuevoPassword: ${erroresNuevoPassword}`);
        return res.status(400).send({ msjUsuario: erroresNuevoPassword[0] });
    }
    try {
        var elUsuario = await Usuario.findById(idUsuario, "password").exec();
        if (!elUsuario) {
            console.log("usuario no encontrado");
            return res.status(400).send({ error: "badLogin", msjUsuario: "Datos incorrectos" });
        }
    }
    catch (error) {
        console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
    }
    const correctPass = await bcrypt.compare(datosUpdatePass.viejoPassword, elUsuario.password);
    if (correctPass) {
        //Introducir nuevo password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(datosUpdatePass.nuevoPassword, salt);
        elUsuario.password = hashPassword;
        try {
            await elUsuario.save();
        }
        catch (error) {
            console.log(`Error guardando el usuario con el nuevo password. E: ${error}`);
            return res.status(500).send({ msjUsuario: "Error conectando con el servidor. Intenta de nuevo más tarde..." });
        }
        res.status(200).send({ resultado: "ok", msjUsuario: "Contraseña cambiada" });
        return;
    }
    else {
        console.log(`Contraseña errada. Rechazando`);
        return res.status(400).send({ error: "badLogin", msjUsuario: "Contraseña incorrecta" });
    }
});
router.post("/resetearPassUsuario", async (req, res) => {
    if (!req.auth) {
        console.log(`No habia info del bearer`);
        return res.status(401).send('No autorizado');
    }
    if (!req.auth.permisos) {
        console.log(`no había permisos del usuario`);
        return res.status(401).send('No autorizado');
    }
    let idUsuario = req.auth.id;
    let idReseteado = req.body.idUsuario;
    console.log(`Usario con id ${idUsuario} solicita reseteo de pass de usuario con id ${idReseteado}`);
    let permisosValidos = ["superadministrador"];
    if (!req.auth.permisos.some(p => permisosValidos.includes(p))) {
        console.log(`Permisos ${req.auth.permisos} insuficientes`);
        return res.status(401).send({ msjUsuario: "No autorizado" });
    }
    let passDefault = "123456";
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(passDefault, salt);
    try {
        var elUsuario = await Usuario.findByIdAndUpdate({ _id: idReseteado }, { password: hashPassword }).exec();
    }
    catch (error) {
        console.log(`Error buscando el usuario en la base de datos. E: ${error}`);
        res.status(500).send({ msjUsuario: "Error conectando con la base de datos" });
    }
    return res.send({ respuesta: "ok", msjUsuario: "Contraseña reseteada" });
});
router.post("/updateFoto", upload.single("nuevaFoto"), async function (req, res) {
    console.log(`Recibida peticion de subir foto por el usuario ${req.auth.username}`);
    if (!req.auth) {
        console.log(`No habia info del bearer`);
        return res.status(401).send('No autorizado');
    }
    if (!req.auth.id) {
        console.log(`no había id del usuario`);
        return res.status(401).send('No autorizado');
    }
    let idUsuario = req.auth.id;
    try {
        var elUsuario = await Usuario.findById(idUsuario, "username fotografia");
    }
    catch (error) {
        console.log(`error buscando el usuario para cambio de fotografia. e: ` + error);
        return res.status(400).send('');
    }
    try {
        const imagen = sharp(req.file.buffer);
        const imagenPeque = await imagen
            .resize({ width: 300, height: 300, fit: "outside" })
            .rotate()
            .toBuffer();
        elUsuario.fotografia = imagenPeque;
    }
    catch (error) {
        console.log(`Error resizing imagen. E: ${error}`);
    }
    try {
        await elUsuario.save();
    }
    catch (error) {
        console.log(`error guardando el usuario después de subir imagen. e: ` + error);
        return res.status(400).send('');
    }
    console.log(`update terminado`);
    res.send({ resultado: "ok" });
});
router.get("/fotografias/:id", async function (req, res) {
    const idUsuario = req.params.id;
    if (idUsuario == "null" || idUsuario == "undefined" || idUsuario == "-1" || !idUsuario) {
        return res.sendFile(path.join(__dirname, '../public/media/iconos/usuarioDefault.png'));
    }
    try {
        var elUsuario = await Usuario.findById(idUsuario, "fotografia").exec();
    }
    catch (error) {
        console.log(`error buscando el usuario con fotografia. e: ` + error);
        return res.status(400).send('');
    }
    if (!elUsuario || !elUsuario.fotografia) {
        res.sendFile(path.join(__dirname, '../public/media/iconos/usuarioDefault.png'));
    }
    else {
        res.set('Content-Type', 'image/png');
        res.send(elUsuario.fotografia);
    }
    return;
});
export default router;
