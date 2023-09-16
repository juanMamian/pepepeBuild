import mongoose from "mongoose";
export const esquemaArchivo = new mongoose.Schema({
    nombre: {
        type: String,
        minlength: 3,
        maxlength: 30,
        required: true,
    },
    payload: {
        type: Buffer,
    }
});
