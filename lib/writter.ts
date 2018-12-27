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
    let ModulesPath:string[] = [];
    let PATH:string='';
    let properties:any[]=[];
    let modulesName:any=Object.keys(response['modules']);
    for(let i=0;i<modulesName.length;i++){
        PATH=`../src/${data['name']}/Libs/${modulesName[i]}Module.ts`;
        ModulesPath.push(PATH);
        
        let content=await fs.readFileSync(`../s3/${modulesName[i]}Module.ts`);
        await fspath.writeFileSync(PATH,content.toString('utf8'));
        properties.push(await readProperties(content.toString('utf-8')));
    }
    buildConfigJSON(properties,modulesName,data['name']);
    return "Proyecto construido";
}else{
    return "Ocurrio un error";
}
    
}


async function readProperties(ModulesCode: any){
    let configProperties:string[]=[];
    let property:string='';
    for(let i=ModulesCode.indexOf('this.config.');i<ModulesCode.lastIndexOf('}');i++){
        
        if(ModulesCode[i]==',' || ModulesCode[i]=='\r' || ModulesCode[i]=='\n' || ModulesCode[i]==';'){
            configProperties.push(property);
            ModulesCode=ModulesCode.slice(i,ModulesCode.lastIndexOf('}'));
            i=ModulesCode.indexOf('this.config.');
            property='';
            if(i==-1){
                i=ModulesCode.lastIndexOf('}');
            }else{
                property= property+ModulesCode[i];  
            }
        }else if(i!=ModulesCode.lastIndexOf('}')){
            property= property+ModulesCode[i];
        }
    }
return configProperties;
}


async function buildConfigJSON(Properties: any,ModulesName: string[],pathConfig:string){
let configObject:any={};
for(let i=0;i<ModulesName.length;i++){
    configObject[ModulesName[i]]={};
}
    console.log(configObject);
    
Properties.forEach((element:any)=>{
    element.forEach((element2:any)  =>{
    let prop=element2.split('.');
    for(let i=3;i<prop.length;i++){
        
        configObject[prop[2]][prop[i]]='';
    }
    
    });
});
console.log(configObject);
await fspath.writeFileSync(`../src/${pathConfig}/config/config.json`,JSON.stringify(configObject,null,2));
}