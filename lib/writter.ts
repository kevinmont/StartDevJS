import * as servlet from './http-startdev';
import * as fspath from 'fs-path';
import * as nodeHelper from '../utils/node-helper';
import * as fs from 'fs';
import * as Initializer from '../utils/ControllerHelper';
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
    let CoreModules=await nodeHelper.getCoreModulesNode();
    for(let i=0;i<modulesName.length;i++){ // por cada modulo se procede a realizar las siguientes operaciones
        PATH=`../src/${data['name']}/${response['pattern']['Libs']}/${modulesName[i]}Module.ts`; //Creando el path de escritura de los modulos solicitados a generar
        ModulesPath.push(PATH); //Se guardan los directorios de los modulos generados
        
        let content=await fs.readFileSync(`../s3/${modulesName[i]}Module.ts`);// Se leén los modulos desde s3 para obtener el codigo fuente de los modulos
        console.log(content.toString('utf-8')); // El buffer se cambia a string para poder leér el codigo fuente
        await fspath.writeFileSync(PATH,content.toString('utf-8')); // Se escribe el modulo en el directorio antes generado
        properties.push(await readProperties(content.toString('utf-8'))); // Se obtienen las propiedades del codigo fuente para generar el config.json global
        let npmDepRes=await readNpmDependencies(await content.toString('utf-8'),CoreModules); // Se obtienen las dependencias de NPM solicitadas en el codigo fuente
        if(npmDepRes!=""){ // Si hay dependencias a descargar de NPM 
        npmDep.push(npmDepRes); // Se agregan dichas dependencias a un array
        }    
    }
    Initializer.constructInitializer(modulesName,ModulesPath,data['name']);
    installNPMDependencies(npmDep,data['name']); // El arreglos con las dependencias de NPM y el nombre del proyecto se mandan al metodo InstallNPMDepdencies
    buildConfigJSON(properties,data['name']);// Se mandan las propiedades de todos los modulo y el nombre del proyecto para generar el archivo de configuración
    return "Proyecto construido"; //Proyecto construido
}else{
    return "Ocurrio un error"; //Ocurrio un error con el response o BAD REQUEST
}
    
}


async function readProperties(ModulesCode: any){ // Metodo que obtiene las propiedades del config.json
    let configProperties:string[]=[]; // Se declara un array que contendra las propiedades del codigo funte
    let property:string=''; // Se obtendran las propiedes letra por letra, por lo cual se contanarán con una cadena vacia para obtenerla
    let lastIndex=ModulesCode.lastIndexOf('}'); // Se obtiene el indice del fin del archivo (codigo fuente), representado como el ultimo } que se usa.
    if(ModulesCode.indexOf('this.config')!=-1){ // Si no hay referencias hacia un this.config, no será necesario buscar propiedades, si no se cumple esta condicion retornará un array vacio
    for(let i=ModulesCode.indexOf('this.config.');i<lastIndex;i++){ // Se busca la primera referencia al archivo 'this.config.', asi se especifica que se lee una propiedad del config.json, ahí comienza el scaneo de propiedades
        
        if(ModulesCode[i]==',' || ModulesCode[i]=='\r' || ModulesCode[i]=='\n' || ModulesCode[i]==';'){ // Si detecta \r, \n , ; o una ',' significa que se termina de leer una propiedad del config.json
            configProperties.push(property); // Se agrega al array de propiedades la propiedad leída hasta el momento
            ModulesCode=ModulesCode.slice(i,lastIndex); // Se corta el codigo fuente, de donde se termino de leer la primera propiedad hasta el final del archivo, para leer la siguiente propiedad si es que existe alguna otra referencia al config.json
            i=ModulesCode.indexOf('this.config.'); // Se obtiene el indice de la siguiente referencia de acceso al objeto config.json
            property='';// Se reinicia la variable property para poder anexarle letra por letra otra propiedad
            if(i==-1){ // Si no se encuentra otra referencia de acceso al archivo config.json
                i=lastIndex; // el indice i se declara como el ultimo indice del codigo fuente del modulo para finalizar el bucle
            }else{ // Si se encontro una referencia de acceso al archivo config.json
                property= property+ModulesCode[i];  // Se le concatena el caracter encontrado a la variable property
            }
        }else if(i!=lastIndex){ // Si no se detecta un \r \n ; o una ',' se sigue concatenando los caracteres del codigo fuente.
            property= property+ModulesCode[i]; // Se le concatena el catacter encontrado a la variable property
        }
    }
}

return configProperties; // Se retorna el arreglo con todas las propiedades leídas en el codigo fuente.
}


async function buildConfigJSON(Properties: any,pathConfig:string){ // Metodo que recibe un arreglo de arreglo de las propiedades leídas de cada modulo codigos escritos, y el path de donde sera escrito el archivo de configuracion final
let configObject:any=[]; // Arreglo de objetos que se obtendran a partir de las propiedades que se reciben
let prop=[]; // Arreglo que contendra los elementos de una propiedad en especifico
let objectProperty:any;
let configJSON: Object;
    // Se uso una arrow function para mantener el contexto de la variable configObject
(()=>Properties.forEach((element:any)=>{  // se obtiene el primer arreglo de propiedades del primer modulo escrito
    element.forEach((element2:any)  =>{  // se obtiene la primera propiedad de este arreglo en este formato this.config.ejemplo.propiedad
    prop=element2.split('.'); // Se separa y genera un arreglo [this,config,ejemplo,propiedad]
        objectProperty=propertiesRecursive(prop[2],prop.slice(2,prop.length)); // Se genera un objeto a partir del arreglo de la propiedad generado mediante el metodo PropertiesRecursive y se guarda en la variable objectPorperty
        configObject.push(objectProperty); // Se pushea al array de objetos el objeto generado de la propiedad leída
    });
}))();
configJSON= mergeProperties(configObject); // Se genera el archivo de configuracion global en el metodo mergeProperties y se guarda en la variable configJSON

await fspath.writeFileSync(`../src/${pathConfig}/config/config.json`,JSON.stringify(configJSON,null,2)); //Se escribe el fichero config.json global con un formato de ajuste de linea
}

async function readNpmDependencies(ModulesCode: any,CoreModules:any){ // Metodo que leé todas las dependencias necesarias por parte del modulo y retorna un string con el comando para instalar cada una de las dependecias de NPM, con typado y normales
    let NPMTypesDepencencies:string[]=[]; // Se declara un arreglo de las dependencias de NPM con typado
    let NPMDepencencies: string[]=[]; // Se declara un arreglo de las dependencias de NPM normales sin typado
    let property:string=''; // Se declara una variable que almacenara la propiedad o dependencia de NPM
    let lastIndex=ModulesCode.lastIndexOf('}');
    if(ModulesCode.indexOf('import')!=-1){ // Se busca en el codigo fuente que recibe la palabra "import"
    for(let i=ModulesCode.indexOf('import');i<lastIndex;i++){ // Se inicia un bucle que empezará a scanear el archivo donde encuentre la palabra "import"
        if(ModulesCode[i]==';' || ModulesCode[i]=='\r' || ModulesCode[i]=='\n'){ // Si se encuentra un ; \r o un \n 
            console.log("Propiedad :"+property); 
            NPMTypesDepencencies.push(property); // Se pushea la propiedad de la dependencia al arreglo de dependencias con typado, ejemplo: "import * as mysql from 'mysql'"
            ModulesCode=ModulesCode.slice(i,lastIndex); // Se corta el codigo fuente desde el indice i hasta donde termina el archivo (lastIndex)
            i=ModulesCode.indexOf('import'); // Se establece i en el indice del siguiente "import" 
            property=''; // se reinicia la variable que guarda las propiedades de las dependecias
            if(i==-1){ // Si no se encontro otro "import" en el codigo
                i=lastIndex; // i se asigna en el indice final del archivo para que termine el bucle
            }else{ // Si se encontro otro import
                property= property+ModulesCode[i]; // se anexa el valor del indice de i a property  
            }
        }else if(i!=lastIndex){ // si no se encuentra ningun salto de linea o ;
            property= property+ModulesCode[i]; // se anexa el valor del indice de i a property
        }
    }
}
property=''; // se reinicia la variable property
    if(ModulesCode.indexOf('require')!=-1){ // Se busca en el codigo fuente que recibe la palabra "require"
        for(let i=ModulesCode.indexOf('require');i<lastIndex;i++){ // se asigna i en donde se encuentra la palabra "require"
            if(ModulesCode[i]==';' || ModulesCode[i]=='\r' || ModulesCode[i]=='\n'){ // Si se encuentra un salto de linea o un ;
                NPMDepencencies.push(property); // Se pushea a un arreglo de dependencias normales la propiedad de la dependencia leída
                ModulesCode=ModulesCode.slice(i,lastIndex); // Se corta el contenido del codigo fuente a partir del indice i hasta el indice final del archivo
                i=ModulesCode.indexOf('require'); // Se asigna i a el siguiente indice del archivo del siguiente "require"
                property=''; // Se reinicia la variable property
                if(i==-1){ // Si no se encuentra la palabra "require"
                    i=lastIndex; // i se asigna al ultimo indice del archivo para finalizar el bucle
                }else{ // Si se encuentra otro "require"
                    property= property+ModulesCode[i];  // Se concatena la propiedad el valor del indice i
                }
            }else if(i!=lastIndex){ // Si no se encuentra un ; o salto de linea
                property= property+ModulesCode[i]; // Se concatena la propiedad el valor del indice i
            }
        }
    
}
// Procedimiento de limpieza de las propiedades para obtener únicamente el nombre de la dependencia
for(let i=0;i<NPMDepencencies.length;i++){ // inicio de bucle para limpieza de dependencias normales de NPM
    // let variables = require('asdasd');  Se expresa asi en string --> let variables = require(\'asdasd'\);
    NPMDepencencies[i]=NPMDepencencies[i].slice(NPMDepencencies[i].indexOf("\'"),NPMDepencencies[i].length);  // Se corta el texto hasta donde se encuentre " \' "
    // 'asdasd'\);
    NPMDepencencies[i]=NPMDepencencies[i].slice(1,NPMDepencencies[i].lastIndexOf("'")); // Se corta el texto a partir del 1 er caracter " ' " hasta que se encuentra el siguiente " ' "
    // asdasd
}

for(let i=0;i<NPMTypesDepencencies.length;i++){ // inicio de bucle para limpieza de dependencias de NPM con typado
    // import * as fs from 'fs'; Se expresa asi en string --> import * as fs from \'fs'\;
    NPMTypesDepencencies[i]=NPMTypesDepencencies[i].slice(NPMTypesDepencencies[i].indexOf("\'"),NPMTypesDepencencies[i].length); // Se corta el texto a partir del indice donde se encuentre " \' "
    // 'fs'\;
    NPMTypesDepencencies[i]=NPMTypesDepencencies[i].slice(1,NPMTypesDepencencies[i].lastIndexOf("'")); // Se corta el texto a partir del 1 er caracter " ' " hasta que se encuentra el siguiente " ' "
    // fs
   
}
NPMDepencencies=NPMDepencencies.filter( (x:any) => !CoreModules.includes(x)); //Eliminamos las dependencias Core de Nodejs
NPMTypesDepencencies=NPMTypesDepencencies.filter((x:any)=> !CoreModules.includes(x));//Eliminamos las dependencias Core de Nodejs
console.log(NPMDepencencies, NPMTypesDepencencies);

let command=''; // Variable que contiene el comando principal para la instalacion de las dependencias de NPM


    for(let i=0;i<NPMDepencencies.length;i++){ // Por cada dependencia normal de NPM 
        
    command=command+`call npm i ${NPMDepencencies[i]} \n`; // se le concatena un call npm i <dependencia> y un salto de línea " \n "
    
    }
    for(let i=0;i<NPMTypesDepencencies.length;i++){ // Por cada dependencia normal de NPM
        command=command+`call npm i ${NPMTypesDepencencies[i]} @types/${NPMTypesDepencencies[i]} \n`; // se le concatena un call npm i <dependencia> y un salto de línea " \n "
    }
// command = 
                // npm i mysql
                // npm i fs @types/fs

    return command; // se retorna el comando

}


async function installNPMDependencies(NPMDepencencies: string[],proyectName: string){ // Función que recibe el arreglo de comandos para la instalacion de las dependencias por cada modulo
    let command=''; // Se declara una variable que guardará todos los comandos de todos modulos
    command="call npm init -y \n"; // Se ingresa el comando npm init -y para crear el package.json del proyecto al momento de ejecutar el archivo final
for(let i=0;i<NPMDepencencies.length;i++){ // Por cada secuencia de comandos de instalacion de npm por cada modulo
command=command+NPMDepencencies[i]; // Se concatenan los comandos de instalación
}
fspath.writeFileSync(`../src/${proyectName}/install.bat`,command); // Se escribe el archivo ejecutable para la instalación de las dependencias
}

 function propertiesRecursive(name: string, properties: string[]){ // Funcioón que recibe un arreglo de propiedades
    let object: any={}; // Se declara un objeto vacio para retornar
    if(properties.indexOf(name)+1!=properties.length){ // si aun no se llega al ultimo indice del arreglo
        object[name]=propertiesRecursive(properties[properties.indexOf(name)+1],properties.slice(properties.indexOf(name)+1,properties.length)); // Se asigna una propiedad del objeto con el valor que retorne la misma funcion al recibir la siguiente propiedad y el mismo arreglo de propiedades
    return object; // retorna el objeto construido
    }else{ // Si si llego a la ultima propiedad
        object[name]=''; // la ultima propiedad se declara como texto vacio ""
        return object; // retorna el objeto construido
    }
    
}

function mergeProperties(properties: Object[]){  // Función que retorna el objeto config.json en base al arreglo de objetos de las propiedades de los modulos
    let primaryObject: any={}; // Se declara el objeto principal
    if(properties.length==0){ // Si no hay objetos de propiedades para los modulos de codigo
        return {};//retorna un objeto vacio
    }else if(properties.length==1){ // Si el arreglo de objetos solo contiene un objeto
        return properties[0]; // Se retorna ese unico objeto
    }else{ // Si hay mas de un objeto en el arreglo
    
for(let i=0;i<properties.length;i++){ // Por cada objeto que hay en el arreglo
    console.log("CONFIG STREAM -> "+JSON.stringify(primaryObject));
    primaryObject=merge(primaryObject,properties[i]); // primaryObject  es igual a lo que retorne el metodo merge

        }
    }
    return primaryObject; // retorna el objeto config.json completo
}

function merge(object1: any, object2: any){ // Funcion que concatena las propiedades de los objetos
    if(object1 != undefined || object1!=null && object2!=undefined || object2!=null){ // no se reciben objetos indefinidos o nulos
        console.log("objectos1 <<<<<<<< "+JSON.stringify(object1),"Objecto2 "+JSON.stringify(object2));
    let object1keys:any=Object.keys(object1); // Obtengo los keys o nombre de propiedades de los objetos del objeto 1
    let object2keys:any=Object.keys(object2); // Obtengo los keys o nombre de propiedades de los objetos del objeto 2
    let exclude:any=[]; // Se declara un arreglo para almacenar las propiedades que no estan en el objeto 1 con repecto al objeto 2
    let includ:any=[];  // Se declara un arreglo para almacenar las propiedades que estan en el objeto 1 y en el objeto 2
    exclude=object2keys.filter( (x:any) => !object1keys.includes(x)); // propiedades que no estan en el objeto 1
        console.log("NO ESTAN " + exclude);
        includ=object2keys.filter((x:any)=>!exclude.includes(x));  // propiedades que estan en el objeto uno filtrando por los que no estan en el objeto 1
        console.log("ESTAN "+includ);
        for(let i=0;i<exclude.length;i++){  // Por las propiedades que no estan en el objeto 1
            console.log("SE AGREGA PROPIEDAD "+exclude[i]);
           // Se declara un objeto con el nombre de la propiedad que no estan en el objeto 1
           object1[exclude[i]]=object2[exclude[i]]; // Se asigna en la nueva propiedad del objeto 1 el valor que tiene esa propiedad en el objeto 2
           console.log("Se agrego..."+JSON.stringify(object1[exclude[i]]));
        }
        for(let i=0;i<includ.length;i++){ // Por las propiedades que estan tanto en los 2 objetos
            object1[includ[i]]=merge((object1[includ[i]]=='')?{}:object1[includ[i]],object2[includ[i]]); // El objeto 1 en la propiedad que apunta el indice i, es igual a lo que retorne el metodo merge al recibir
            // al recibir los objetos a los que apunta la propiedad en el indice i de ambos objetos
        }
        console.log("Objeto final...-> "+JSON.stringify(object1));
        return object1; // retorno del objeto 1
    }else{
        return ''; //Si los objetos son nulos o undefined se retorna una cadena vacia
    }
}
