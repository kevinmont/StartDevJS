import  StartDevHttpsRequest from './http-startdev';
import * as fspath from 'fs-path';
import { Linker } from './Linker';
const servlet = new StartDevHttpsRequest();
export class Writter{
    public linker: Linker;
    constructor(){
        this.linker=new Linker();
    }
 async  buildProject(data: any){
    let response = await servlet.processData(data);
    console.log(response);
    if(response['code']==200){
        //Construyendo el directorio proyecto
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
    let projectMetadata: any[];
    projectMetadata=await this.linker.Build(data,response,data['language']);
    for(let i=0;i<projectMetadata.length;i++){
        console.log(projectMetadata[i][0]);
        await fspath.writeFileSync(projectMetadata[i][0],projectMetadata[i][1]);
    }
    return "Proyecto construido"; //Proyecto construido
}else{
    return "Ocurrio un error"; //Ocurrio un error con el response o BAD REQUEST
}
    
}

}