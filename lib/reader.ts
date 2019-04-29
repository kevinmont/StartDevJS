import * as writter from './writter';
import * as fs from 'fs';
import { Writter } from './writter';
import * as rq from 'request-promise';
import StartDevHttpsRequest from './http-startdev';
const startDevHttpsRequest = new StartDevHttpsRequest();
class Reader{
public builder: Writter;
public lang:any;
public languages: any;
public isValid: boolean;
constructor (){
   this.isValid=false;
   this.builder=new Writter();
}
 async  readStartDevFile(PATH: string){
    this.languages = JSON.parse(await startDevHttpsRequest.getLangs());
    let data: any = fs.readFileSync(PATH);
    data = JSON.parse(data);
    
if(Object.keys(this.languages).indexOf(data['language'])!=-1){
   this.isValid=true;
if(Object.keys(data).indexOf('name')==-1){
   console.log("Falta definir un nombre para el proyecto, Propiedad: 'name' "); 
   this.isValid=false;
}else if(Object.keys(data).indexOf('model')==-1){
    console.log("Falta definir el patron de diseño de la tecnologia para el proyecto, Propiedad: 'model' "); 
    this.isValid=false;
 }else if(Object.keys(data).indexOf('version')==-1){
    console.log("Falta definir la version de la tecnologia para el proyecto, Propiedad: 'version' "); 
    this.isValid=false;
 }else if(Object.keys(data).indexOf('language')==-1){
    console.log("Falta definir un lenguaje para el proyecto, Propiedad: 'language' "); 
    this.isValid=false;
 }else if(Object.keys(data).indexOf('modules')==-1){
    console.log("Falta definir los modulos para el proyecto, Propiedad: 'modules' "); 
    this.isValid=false;
 }else if(Object.keys(data).indexOf('utils')==-1){
    console.log("Falta definir las utilerias de la tecnologia para el proyecto, Propiedad: 'utils' "); 
    this.isValid=false;
 }
 if(Object.keys(data).indexOf('schema')!=-1){
    console.log("Se detecto uso de modelos de BD para el proyecto, Propiedad: 'schema' "); 
 }
 if(Object.keys(data).indexOf('extra')!=-1){
    console.log("Se detectaron modulos extras para el proyecto ", data.extra["rest-consumer"].modules); 
 }
 
 if(this.isValid){
     console.log("Patrón de diseño: " + data['model'] );
    console.log("languaje: "+this.languages[data['language']]['name']);
    Object.keys(data['modules']).forEach(element =>{
        console.log(`Module detected:  ${element}`);
    });
    
    console.log("StartDevFile Valido");
    console.log(await this.builder.buildProject(data));
    return;
}else{
    console.log("StartDevFile no valido");
}

}else{
    console.log("Lenguaje no valido");

    }

    return ;
}

}

export default new Reader();