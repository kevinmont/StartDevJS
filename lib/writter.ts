import * as servlet from './http-startdev';
import * as fspath from 'fs-path';
import * as fs from 'fs';
export async function buildProject(data: any){
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
    let ModulesPath:string[] = [];
    let PATH:string='';
    let properties:any[]=[];
    let modulesName:any=Object.keys(response['modules']); //Se obtienen los metadatos de los modulos a generar
    let npmDep:string[]=[];
    for(let i=0;i<modulesName.length;i++){ // por cada modulo se procede a realizar las siguientes operaciones
        PATH=`../src/${data['name']}/${response['pattern']['Libs']}/${modulesName[i]}Module.ts`; //Creando el path de escritura de los modulos solicitados a generar
        ModulesPath.push(PATH); //Se guardan los directorios de los modulos generados
        
        let content=await fs.readFileSync(`../s3/${modulesName[i]}Module.ts`);// Se leén los modulos desde s3 para obtener el codigo fuente de los modulos
        console.log(content.toString('utf-8')); // El buffer se cambia a string para poder leér el codigo fuente
        await fspath.writeFileSync(PATH,content.toString('utf-8')); // Se escribe el modulo en el directorio antes generado
        properties.push(await readProperties(content.toString('utf-8'))); // Se obtienen las propiedades del codigo fuente para generar el config.json global
        let npmDepRes=await readNpmDependencies(await content.toString('utf-8')); // Se obtienen las dependencias de NPM solicitadas en el codigo fuente
        if(npmDepRes!=""){ // Si hay dependencias a descargar de NPM 
        npmDep.push(npmDepRes); // Se agregan dichas dependencias a un array
        }    
    }
    installNPMDependencies(npmDep,data['name']); // El arreglos con las dependencias de NPM y el nombre del proyecto se mandan al metodo InstallNPMDepdencies
    buildConfigJSON(properties,data['name']);// Se mandan las propiedades de todos los modulo y el nombre del proyecto para generar el archivo de configuración
    return "Proyecto construido"; //Proyecto construido
}else{
    return "Ocurrio un error"; //Ocurrio un error con el response o BAD REQUEST
}
    
}


async function readProperties(ModulesCode: any){
    let configProperties:string[]=[];
    let property:string='';
    let lastIndex=ModulesCode.lastIndexOf('}');
    if(ModulesCode.indexOf('this.config')!=-1){
    for(let i=ModulesCode.indexOf('this.config.');i<lastIndex;i++){
        
        if(ModulesCode[i]==',' || ModulesCode[i]=='\r' || ModulesCode[i]=='\n' || ModulesCode[i]==';'){
            configProperties.push(property);
            ModulesCode=ModulesCode.slice(i,lastIndex);
            i=ModulesCode.indexOf('this.config.');
            property='';
            if(i==-1){
                i=lastIndex;
            }else{
                property= property+ModulesCode[i];  
            }
        }else if(i!=lastIndex){
            property= property+ModulesCode[i];
        }
    }
}

return configProperties;
}


async function buildConfigJSON(Properties: any,pathConfig:string){
let configObject:any=[];
console.log(configObject);

    console.log(configObject);
    console.log("Properties:  ........"+Properties);
(()=>Properties.forEach((element:any)=>{
    console.log("Element1:    >>>>>>"+element);
    element.forEach((element2:any)  =>{
        console.log(">>>>>>>>>>><"+element2)
    let prop=element2.split('.');
    console.log(prop);
    
            console.log("OBJECTOS:  >>>------ "+JSON.stringify(propertiesRecursive(prop[2],prop)))    ;
        configObject.push(propertiesRecursive(prop[2],prop));
    
    
    });
}))();
console.log("Undefined:v ->>>>",mergeProperties(configObject));

await fspath.writeFileSync(`../src/${pathConfig}/config/config.json`,JSON.stringify(mergeProperties(configObject),null,2));
}

async function readNpmDependencies(ModulesCode: any){
    let NPMTypesDepencencies:string[]=[];
    let NPMDepencencies: string[]=[];
    let property:string='';
    if(ModulesCode.indexOf('import')!=-1){
    for(let i=ModulesCode.indexOf('import');i<ModulesCode.lastIndexOf('}');i++){
        
        if(ModulesCode[i]==';' || ModulesCode[i]=='\r' || ModulesCode[i]=='\n'){
            console.log("Propiedad :"+property);
            NPMTypesDepencencies.push(property);
            ModulesCode=ModulesCode.slice(i,ModulesCode.lastIndexOf('}'));
            i=ModulesCode.indexOf('import');
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
}

    if(ModulesCode.indexOf('require')!=-1){
        for(let i=ModulesCode.indexOf('require');i<ModulesCode.lastIndexOf('}');i++){
            
            if(ModulesCode[i]==';' || ModulesCode[i]=='\r' || ModulesCode[i]=='\n'){
                NPMDepencencies.push(property);
                ModulesCode=ModulesCode.slice(i,ModulesCode.lastIndexOf('}'));
                i=ModulesCode.indexOf('require');
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
    
}

for(let i=0;i<NPMDepencencies.length;i++){
    NPMDepencencies[i]=NPMDepencencies[i].slice(NPMDepencencies[i].indexOf("\'"),NPMDepencencies[i].length);
    NPMDepencencies[i]=NPMDepencencies[i].slice(1,NPMDepencencies[i].lastIndexOf("'"));
}

for(let i=0;i<NPMTypesDepencencies.length;i++){
    NPMTypesDepencencies[i]=NPMTypesDepencencies[i].slice(NPMTypesDepencencies[i].indexOf("\'"),NPMTypesDepencencies[i].length);
    NPMTypesDepencencies[i]=NPMTypesDepencencies[i].slice(1,NPMTypesDepencencies[i].lastIndexOf("'"));
    NPMTypesDepencencies[i]=NPMTypesDepencencies[i]+" @types/"+NPMTypesDepencencies[i];
}
console.log(NPMDepencencies, NPMTypesDepencencies);

let command='';


    for(let i=0;i<NPMDepencencies.length;i++){
        
    command=command+`call npm i ${NPMDepencencies[i]} \n`;
    
    }
    for(let i=0;i<NPMTypesDepencencies.length;i++){
        command=command+`call npm i ${NPMTypesDepencencies[i]} \n`;
    }

    
    console.log(command);
    return command;

}


async function installNPMDependencies(NPMDepencencies: string[],proyectName: string){
    let command='';
    command="call npm init -y \n";
console.log(NPMDepencencies,proyectName);
for(let i=0;i<NPMDepencencies.length;i++){
command=command+NPMDepencencies[i];
}
fspath.writeFileSync(`../src/${proyectName}/install.bat`,command);
}

 function propertiesRecursive(name: string, properties: string[]){
    let object: any={};
    
    
    if(properties.indexOf(name)+1!=properties.length){
        object[name]=propertiesRecursive(properties[properties.indexOf(name)+1],properties);
    return object;
    }else{
        object[name]='';
        return object;
    }
    
}

function mergeProperties(properties: Object[]){
    let primaryObject: any={};
    if(properties.length==0){ // Si no hay objetos de propiedades para los modulos de codigo
        return {};//retorna un objeto vacio
    }else if(properties.length==1){
        return properties[0];
    }else{
    
for(let i=0;i<properties.length;i++){
    console.log("CONFIG STREAM -> "+JSON.stringify(primaryObject));
    primaryObject=merge(primaryObject,properties[i]);

        }
    }
    return primaryObject;
}

function merge(object1: any, object2: any){
    if(object1 != undefined || object1!=null && object2!=undefined || object2!=null){
        console.log("objectos1 <<<<<<<< "+JSON.stringify(object1),"Objecto2 "+JSON.stringify(object2));
    let object1keys:any=Object.keys(object1);
    let object2keys:any=Object.keys(object2);
    let noestan:any=[];
    let estan:any=[];
        noestan=object2keys.filter( (x:any) => !object1keys.includes(x)); // propiedades que no estan en el objeto 1
        console.log("NO ESTAN " + noestan);
        estan=object2keys.filter((x:any)=>!noestan.includes(x));  // propiedades que estan en el objeto uno filtrando por los que no estan en el objeto 1
        console.log("ESTAN "+estan);
        for(let i=0;i<noestan.length;i++){
            console.log("SE AGREGA PROPIEDAD "+noestan[i]);
           object1[noestan[i]]={};
           object1[noestan[i]]=object2[noestan[i]];
           console.log("Se agrego..."+JSON.stringify(object1[noestan[i]]));
        }
        for(let i=0;i<estan.length;i++){
            object1[estan[i]]=merge(object1[estan[i]],object2[estan[i]]);
        }
        console.log("Objeto final...-> "+JSON.stringify(object1));
        return object1;
    }else{
        return '';
    }
}
