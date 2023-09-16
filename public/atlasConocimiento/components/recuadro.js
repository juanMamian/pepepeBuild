const recuadroComponent={
    
    props:{
        tipo:String,        
    },
    computed:{
        datoPrevio(){
            return this.tipo==='datoPrevio'
        },
        datoNuevo(){
            return this.tipo==='datoNuevo'
        },
        descubrimiento(){
            return this.tipo==='descubrimiento'
        },
                instruccion(){
            return this.tipo==='instruccion'
        },
        instruccionPointer(){
            return this.tipo==='instruccionPointer'
        },
        instruccionTeclado(){
            return this.tipo==='instruccionTeclado'
        },
        srcIcono(){
            if(this.descubrimiento){
                return "https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/iconos/iconoDescubrimiento.png";
            }
            else if(this.instruccionPointer){
                return "https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/iconos/handPointer.svg";
            }
            else if(this.instruccionTeclado){
                return "https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/iconos/iconoInstruccionTeclado.svg";
            }
            return "https://pe-pe-pe.herokuapp.com/public/atlasConocimiento/iconos/bombillo.png";

        }
    },
    template:'<div class="recuadro" :class="{datoPrevio, datoNuevo, descubrimiento, instruccion, instruccionPointer, instruccionTeclado}"> <img class="iconoRecuadro" :src="srcIcono" /> <div class="textoRecuadro"> <slot></slot> </div> </div>',    
}
