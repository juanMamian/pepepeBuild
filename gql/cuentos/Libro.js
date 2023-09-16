import { ModeloLibro as Libro } from "../../model/cuentos/Libro";
import { ApolloError, AuthenticationError } from "../misc";
export const typeDefs = `#graphql

    type AudioEmbedded{
        tipoReproduccion:String,
    },

    type CuadroImagenCuento{
        id:ID,
        sinArchivo:Boolean
        tipoActivacionSecundario:String,
        posicion:Coords,
        posicionZeta:Int,
        size:Coords,
        originalSize:Coords,
        audio: AudioEmbedded,
    },

    type FormatoTexto{
        alineacion:String,
        fontSize:Int,
        colorLetra:String,
        tipoLetra:String,
    }

    type CuadroTextoCuento{
        id:ID,
        texto:String,
        posicion:Coords,
        posicionZeta:Int,
        size:Coords,
        formato:FormatoTexto,
        audio:AudioEmbedded,
    }

    type PaginaCuento{
        id:ID,
        numPag:Int,
        cuadrosTexto:[CuadroTextoCuento],
        cuadrosImagen:[CuadroImagenCuento],
        color:String,
    }

    type Libro{
        id:ID,
        paginas: [PaginaCuento],
        idsEditores: [String],
        titulo:String,
        idForo:String,
        publico:Boolean,
    }

    extend type Query{
        libro(idLibro:ID!):Libro,
        misLibros:[Libro],
        todosLibros:[Libro],
        librosPublicos:[Libro],
    }

    extend type Mutation{
        crearNuevoLibro:Libro,
        eliminarPaginaDeLibro(idLibro:ID!, idPagina:ID!):Boolean,
        editarTituloLibro(idLibro:ID!, nuevoTitulo:String):Libro,
        eliminarLibro(idLibro:ID!):Boolean,
        setLibroPublico(idLibro:ID!, nuevoEstado:Boolean!):Boolean,

        crearNuevaPaginaLibro(idLibro:ID!):PaginaCuento,
        setNuevoColorPaginaLibro(idLibro:ID!, idPagina:ID!, nuevoColor:String!):PaginaCuento,
        
        crearCuadroTextoPaginaLibro(idLibro:ID!, idPagina:ID!, datosPosicion:CoordsInput!, datosSize: CoordsInput!):CuadroTextoCuento,
    
        updateTextoCuadroTextoCuento(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!, nuevoTexto:String!):CuadroTextoCuento,
        updateSizeCuadroTexto(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!, nuevoSize:CoordsInput!):CuadroTextoCuento,
        updatePosicionCuadroTexto(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!, nuevoPosicion:CoordsInput!):CuadroTextoCuento,
        setPosicionZCuadroTexto(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!, nuevoPosicionZ:Int!):CuadroTextoCuento,
        eliminarCuadroTextoLibro(idLibro:ID!, idPagina:ID!, idCuadroTexto:ID!):Boolean,

        crearCuadroImagenPaginaLibro(idLibro:ID!, idPagina:ID!, datosPosicion:CoordsInput!, datosSize: CoordsInput!):CuadroImagenCuento,
        updatePosicionCuadroImagen(idLibro:ID!, idPagina:ID!, idCuadroImagen:ID!, nuevoPosicion:CoordsInput!):CuadroImagenCuento,
        updateSizeCuadroImagen(idLibro:ID!, idPagina:ID!, idCuadroImagen:ID!, nuevoSize:CoordsInput!):CuadroImagenCuento,
        setPosicionZCuadroImagen(idLibro:ID!, idPagina:ID!, idCuadroImagen:ID!, nuevoPosicionZ:Int!):CuadroImagenCuento,
        eliminarCuadroImagenLibro(idLibro:ID!, idPagina:ID!, idCuadroImagen:ID!):Boolean,

    }

`;
export const resolvers = {
    Query: {
        libro: async function (_, { idLibro }, context) {
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro)
                    throw "libro no encontrado";
            }
            catch (error) {
                console.log(`Error buscando libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`enviando libro ${elLibro.id}`);
            return elLibro;
        },
        misLibros: async function (_, __, context) {
            console.log(`Peticion mis libros de: `);
            const usuario = context.usuario;
            try {
                var losLibros = await Libro.find({ idsEditores: usuario.id }).exec();
            }
            catch (error) {
                console.log(`Error buscando misLibros. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losLibros.length} libros`);
            return losLibros;
        },
        todosLibros: async function (_, __, context) {
            console.log(`Peticion mis libros de: `);
            console.log(`Credenciales usuario: ${JSON.stringify(context)}`);
            const credencialesUsuario = context.usuario;
            let permisosEspeciales = ["superadministrador"];
            if (!credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion pidiendo todosLibros`);
                AuthenticationError("No autorizado");
            }
            try {
                var losLibros = await Libro.find({}).exec();
            }
            catch (error) {
                console.log(`Error buscando misLibros. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losLibros.length} libros`);
            return losLibros;
        },
        librosPublicos: async function (_, __, context) {
            console.log(`Peticion de libros publicos`);
            const credencialesUsuario = context.usuario;
            if (!credencialesUsuario.id || credencialesUsuario.id.length < 1) {
                console.log(`Error de autenticacion pidiendo libros publicos`);
                AuthenticationError("No autorizado");
            }
            try {
                var losLibros = await Libro.find({ publico: true }).exec();
            }
            catch (error) {
                console.log(`Error buscando misLibros. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            console.log(`Enviando ${losLibros.length} libros publicos`);
            return losLibros;
        }
    },
    Mutation: {
        async eliminarPaginaDeLibro(_, { idLibro, idPagina }, contexto) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando titulo de libro`);
                AuthenticationError("No autorizado");
            }
            try {
                elLibro.paginas.pull(idPagina);
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error eliminando la página ${idPagina} del libro`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async setNuevoColorPaginaLibro(_, { idLibro, idPagina, nuevoColor }, contexto) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando color de página de libro`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            laPagina.color = nuevoColor;
            try {
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error cambiando color de la página ${idPagina} del libro`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async crearNuevoLibro(_, __, contexto) {
            console.log(`Peticion de crear un nuevo libro`);
            const usuario = contexto.usuario;
            if (usuario.id.length == 0) {
                AuthenticationError("No logeado");
            }
            try {
                var nuevoLibro = new Libro({
                    idsEditores: [usuario.id],
                });
                await nuevoLibro.save();
            }
            catch (error) {
                console.log(`Error creando el nuevo libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos.");
            }
            return nuevoLibro;
        },
        editarTituloLibro: async function (_, { idLibro, nuevoTitulo }, contexto) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando titulo de libro`);
                AuthenticationError("No autorizado");
            }
            const charProhibidosTituloLibro = /[^ a-zA-ZÀ-ž0-9_():.,-¿?¡!]/;
            nuevoTitulo = nuevoTitulo.replace(/\s\s+/g, " ");
            if (charProhibidosTituloLibro.test(nuevoTitulo)) {
                ApolloError("Titulo ilegal");
            }
            nuevoTitulo = nuevoTitulo.trim();
            try {
                console.log(`guardando nuevo titulo ${elLibro.titulo} en la base de datos`);
                var resLibro = await Libro.findByIdAndUpdate(idLibro, { titulo: nuevoTitulo }, { new: true }).exec();
            }
            catch (error) {
                console.log(`error guardando el libro con coordenadas manuales: ${error}`);
            }
            console.log(`Titulo guardado`);
            return resLibro;
        },
        async eliminarLibro(_, { idLibro }, contexto) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando libro`);
                AuthenticationError("No autorizado");
            }
            try {
                await Libro.findByIdAndDelete(idLibro).exec();
            }
            catch (error) {
                console.log(`Error eliminando el libro`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async setLibroPublico(_, { idLibro, nuevoEstado }, contexto) {
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando libro`);
                AuthenticationError("No autorizado");
            }
            elLibro.publico = nuevoEstado;
            try {
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro con nuevo estado publico ${nuevoEstado}. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async crearNuevaPaginaLibro(_, { idLibro }, contexto) {
            console.log(`Petición de crear una nueva página en el libro con id ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion editando titulo de libro`);
                AuthenticationError("No autorizado");
            }
            var nuevaPagina = elLibro.paginas.create({});
            try {
                elLibro.paginas.push(nuevaPagina);
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro con la nueva página`);
                ApolloError("Error conectando con la base de datos");
            }
            return nuevaPagina;
        },
        async crearCuadroTextoPaginaLibro(_, { idLibro, idPagina, datosPosicion, datosSize }, contexto) {
            console.log(`Solicitud de crear un cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion insertando cuadro de texto`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var nuevoCuadroTexto = laPagina.cuadrosTexto.create({
                posicion: datosPosicion,
                size: datosSize,
            });
            try {
                laPagina.cuadrosTexto.push(nuevoCuadroTexto);
                await elLibro.save();
            }
            catch (error) {
                console.log(`Erro guardando el libro con el nuevo cuadro texto`);
                ApolloError("Error conectando con la base de datos");
            }
            return nuevoCuadroTexto;
        },
        async updateTextoCuadroTextoCuento(_, { idLibro, idPagina, idCuadroTexto, nuevoTexto }, contexto) {
            console.log(`Solicitud de update texto en un cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion updating texto de cuadro de texto`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
            if (!elCuadroTexto) {
                console.log(`CuadroTexto no encontrado`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                elCuadroTexto.texto = nuevoTexto;
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elCuadroTexto;
        },
        async updateSizeCuadroTexto(_, { idLibro, idPagina, idCuadroTexto, nuevoSize }, contexto) {
            console.log(`Solicitud de update size de cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion updating size de cuadro de texto`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
            if (!elCuadroTexto) {
                console.log(`CuadroTexto no encontrado`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                elCuadroTexto.size = nuevoSize;
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elCuadroTexto;
        },
        async updatePosicionCuadroTexto(_, { idLibro, idPagina, idCuadroTexto, nuevoPosicion }, contexto) {
            console.log(`Solicitud de update posicion de cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion updating posicion de cuadro de texto`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
            if (!elCuadroTexto) {
                console.log(`CuadroTexto no encontrado`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                elCuadroTexto.posicion = nuevoPosicion;
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elCuadroTexto;
        },
        async setPosicionZCuadroTexto(_, { idLibro, idPagina, idCuadroTexto, nuevoPosicionZ }, contexto) {
            console.log(`Solicitud de update posicionZ de cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion updating posicionZ de cuadro de texto`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var elCuadroTexto = laPagina.cuadrosTexto.id(idCuadroTexto);
            if (!elCuadroTexto) {
                console.log(`CuadroTexto no encontrado`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                elCuadroTexto.posicionZeta = nuevoPosicionZ;
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elCuadroTexto;
        },
        async eliminarCuadroTextoLibro(_, { idLibro, idPagina, idCuadroTexto }, contexto) {
            console.log(`Solicitud de eliminar cuadro texto en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando cuadro de texto`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                laPagina.cuadrosTexto.pull(idCuadroTexto);
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
        async crearCuadroImagenPaginaLibro(_, { idLibro, idPagina, datosPosicion, datosSize }, contexto) {
            console.log(`Solicitud de crear un cuadro imágen en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion insertando cuadro de imágen`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var nuevoCuadroImagen = laPagina.cuadrosImagen.create({
                posicion: datosPosicion,
                size: datosSize,
            });
            try {
                laPagina.cuadrosImagen.push(nuevoCuadroImagen);
                await elLibro.save();
            }
            catch (error) {
                console.log(`Erro guardando el libro con el nuevo cuadro texto`);
                ApolloError("Error conectando con la base de datos");
            }
            return nuevoCuadroImagen;
        },
        async updateSizeCuadroImagen(_, { idLibro, idPagina, idCuadroImagen, nuevoSize }, contexto) {
            console.log(`Solicitud de update size de cuadro imágen en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion updating size de cuadro de imágen`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var elCuadroImagen = laPagina.cuadrosImagen.id(idCuadroImagen);
            if (!elCuadroImagen) {
                console.log(`CuadroImagen no encontrado`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                elCuadroImagen.size = nuevoSize;
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elCuadroImagen;
        },
        async setPosicionZCuadroImagen(_, { idLibro, idPagina, idCuadroImagen, nuevoPosicionZ }, contexto) {
            console.log(`Solicitud de update posicionZ de cuadro imágen en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion updating posicionZ de cuadro de imágen`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var elCuadroImagen = laPagina.cuadrosImagen.id(idCuadroImagen);
            if (!elCuadroImagen) {
                console.log(`CuadroImagen no encontrado`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                elCuadroImagen.posicionZeta = nuevoPosicionZ;
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elCuadroImagen;
        },
        async updatePosicionCuadroImagen(_, { idLibro, idPagina, idCuadroImagen, nuevoPosicion }, contexto) {
            console.log(`Solicitud de update posicion de cuadro imágen en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion updating posicion de cuadro de imágen`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            var elCuadroImagen = laPagina.cuadrosImagen.id(idCuadroImagen);
            if (!elCuadroImagen) {
                console.log(`CuadroImagen no encontrado`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                elCuadroImagen.posicion = nuevoPosicion;
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return elCuadroImagen;
        },
        async eliminarCuadroImagenLibro(_, { idLibro, idPagina, idCuadroImagen }, contexto) {
            console.log(`Solicitud de eliminar cuadro imagen en la pagina ${idPagina} del libro ${idLibro}`);
            let credencialesUsuario = contexto.usuario;
            try {
                var elLibro = await Libro.findById(idLibro).exec();
                if (!elLibro) {
                    throw "libro no encontrado";
                }
            }
            catch (error) {
                console.log(`error buscando el libro. E: ` + error);
            }
            //Authorización
            let permisosEspeciales = ["superadministrador"];
            if (!elLibro.idsEditores.includes(credencialesUsuario.id) && !credencialesUsuario.permisos.some(p => permisosEspeciales.includes(p))) {
                console.log(`Error de autenticacion eliminando cuadro de imagen`);
                AuthenticationError("No autorizado");
            }
            var laPagina = elLibro.paginas.id(idPagina);
            if (!laPagina) {
                console.log(`Pagina no encontrada`);
                ApolloError("Error conectando con la base de datos");
            }
            try {
                laPagina.cuadrosImagen.pull(idCuadroImagen);
                await elLibro.save();
            }
            catch (error) {
                console.log(`Error guardando el libro. E: ${error}`);
                ApolloError("Error conectando con la base de datos");
            }
            return true;
        },
    }
};
