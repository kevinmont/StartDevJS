import * as writter from './writter';
import * as fs from 'fs';
let Lang:any = fs.readFileSync('../utils/languagesDef.json');
const Languages=JSON.parse(Lang);
let isValid: boolean= false;
export async function readStartDevFile(PATH: string) {
    let data: any = fs.readFileSync(PATH);
    data = JSON.parse(data);
    
if(Object.keys(Languages).indexOf(data['language'])!=-1){
   isValid=true;
if(Object.keys(data).indexOf('name')==-1){
   console.log("Falta definir un nombre para el proyecto, Propiedad: 'name' "); 
   isValid=false;
}else if(Object.keys(data).indexOf('model')==-1){
    console.log("Falta definir el patron de diseño de la tecnologia para el proyecto, Propiedad: 'model' "); 
    isValid=false;
 }else if(Object.keys(data).indexOf('version')==-1){
    console.log("Falta definir la version de la tecnologia para el proyecto, Propiedad: 'version' "); 
    isValid=false;
 }else if(Object.keys(data).indexOf('language')==-1){
    console.log("Falta definir un lenguaje para el proyecto, Propiedad: 'language' "); 
    isValid=false;
 }else if(Object.keys(data).indexOf('modules')==-1){
    console.log("Falta definir los modulos para el proyecto, Propiedad: 'modules' "); 
    isValid=false;
 }else if(Object.keys(data).indexOf('utils')==-1){
    console.log("Falta definir las utilerias de la tecnologia para el proyecto, Propiedad: 'utils' "); 
    isValid=false;
 }
 if(Object.keys(data).indexOf('schema')!=-1){
    console.log("Se detecto uso de modelos de BD para el proyecto, Propiedad: 'schema' "); 
 }
 if(Object.keys(data).indexOf('extra')!=-1){
    console.log("Se detectaron modulos extras para el proyecto ", data.extra["rest-consumer"].modules); 
 }
 
 if(isValid){
     console.log("Patrón de diseño: " + data['model'] );
    console.log("languaje: "+Languages[data['language']]['name']);
    Object.keys(data['modules']).forEach(element =>{
        console.log(`Module detected:  ${element}`);
    });
    
    console.log("StartDevFile Valido");
   console.log(await writter.buildProject(data));
}else{
    console.log("StartDevFile no valido");
}

}else{
    console.log("Lenguaje no valido");

    }
    
}

