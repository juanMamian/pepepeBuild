const enlaceComponent={
    
    props:{        
        texto:String,
        direccion:String,
    },
    computed:{        
    },
    template:'<div class="enlace-component"><div id="zonaCabecera"><img class="icono" src="https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/recursos/iconos/iconoEnlace.svg" /><div class="texto">{{texto}}</div></div><a :href="direccion" target="_blank"><div class="boton">Visitar</div></a></div>',    
}
