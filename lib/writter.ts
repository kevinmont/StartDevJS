import * as servlet from './http-startdev';
import * as fspath from 'fs-path';
import * as fs from 'fs';
export async function buildProject(data: any){
    let response = await servlet.processData(data);
    console.log(response);
    if(response['code']==200){
    await fspath.mkdir(`../src/${data['name']}`,()=>{
        console.log("Directorio de proyecto construido");
        fspath.mkdir(`../src/${data['name']}/${response['pattern']['Libs']}`,()=>{
        console.log("Directorio de librerias construido");
        fspath.mkdir(`../src/${data['name']}/${response['pattern']['Models']}`,()=>{
        console.log("Directorio de Modelos de BD construido");
        fspath.mkdir(`../src/${data['name']}/${response['pattern']['Controller']}`,()=>{
        console.log("Directorio del Controlador principal construido");
        fspath.mkdir(`../src/${data['name']}/${response['pattern']['Utils']}`,()=>{
        console.log("Directorio de utilerias construido");    
        fspath.mkdir(`../src/${data['name']}/${response['pattern']['ServerApp']}`,()=>{
        console.log("Directorio de aplicacion de servidor construido");
        });
        });    
        });
        });
        });
    });
    
    Object.keys(response['modules']).forEach( (element: any)=>{
        
        fs.readFile(`../s3/${element}Module.ts`,(err:any,code:any)=>{
            fspath.writeFile(`../src/${data['name']}/Libs/${element}Module.ts`,code.toString('utf8'),()=>{
                console.log("Se construyo el modulo "+ element);
            });
        });
        
    });
    
    return "Proyecto construido";
}else{
    return "Ocurrio un error";
}
    
}
