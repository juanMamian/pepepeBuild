import mongoose from "mongoose";
export var dbConectada = false;
export const iniciarMongoose = async () => {
    if (!process.env.DB_CONNECT) {
        throw "ENV DE CONEXION A DB NO CONFIGURADO";
    }
    try {
        await mongoose.connect(process.env.DB_CONNECT);
    }
    catch (error) {
        console.log(`Error conectando con la base de datos: E:${error}`);
    }
};
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log(`¡Base de datos conectada!`);
    dbConectada = true;
    // funcionesInicioRutaGrado();
});
