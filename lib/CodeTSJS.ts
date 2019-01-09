import * as fs from 'fs';
import * as http from 'https';
import * as path from 'path';
export class CodeTSJS{
    async readProperties(ModulesCode: any){ // Metodo que obtiene las propiedades del config.json
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

    async  readNpmDependencies(ModulesCode: any,CoreModules:any){ // Metodo que leé todas las dependencias necesarias por parte del modulo y retorna un string con el comando para instalar cada una de las dependecias de NPM, con typado y normales
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
    
    async  installNPMDependencies(NPMDepencencies: string[],proyectName: string){ // Función que recibe el arreglo de comandos para la instalacion de las dependencias por cada modulo
        let command=''; // Se declara una variable que guardará todos los comandos de todos modulos
        command="call npm init -y \n"; // Se ingresa el comando npm init -y para crear el package.json del proyecto al momento de ejecutar el archivo final
    for(let i=0;i<NPMDepencencies.length;i++){ // Por cada secuencia de comandos de instalacion de npm por cada modulo
    command=command+NPMDepencencies[i]; // Se concatenan los comandos de instalación
    }
    return [`../src/${proyectName}/install.bat`,command]; // Se escribe el archivo ejecutable para la instalación de las dependencias
    }
    
      propertiesRecursive(name: string, properties: string[]){ // Funcioón que recibe un arreglo de propiedades
        let object: any={}; // Se declara un objeto vacio para retornar
        if(properties.indexOf(name)+1!=properties.length){ // si aun no se llega al ultimo indice del arreglo
            object[name]=this.propertiesRecursive(properties[properties.indexOf(name)+1],properties.slice(properties.indexOf(name)+1,properties.length)); // Se asigna una propiedad del objeto con el valor que retorne la misma funcion al recibir la siguiente propiedad y el mismo arreglo de propiedades
        return object; // retorna el objeto construido
        }else{ // Si si llego a la ultima propiedad
            object[name]=''; // la ultima propiedad se declara como texto vacio ""
            return object; // retorna el objeto construido
        }
        
    }
    
     mergeProperties(properties: Object[]){  // Función que retorna el objeto config.json en base al arreglo de objetos de las propiedades de los modulos
        let primaryObject: any={}; // Se declara el objeto principal
        if(properties.length==0){ // Si no hay objetos de propiedades para los modulos de codigo
            return {};//retorna un objeto vacio
        }else if(properties.length==1){ // Si el arreglo de objetos solo contiene un objeto
            return properties[0]; // Se retorna ese unico objeto
        }else{ // Si hay mas de un objeto en el arreglo
        
    for(let i=0;i<properties.length;i++){ // Por cada objeto que hay en el arreglo
        console.log("CONFIG STREAM -> "+JSON.stringify(primaryObject));
        primaryObject=this.merge(primaryObject,properties[i]); // primaryObject  es igual a lo que retorne el metodo merge
    
            }
        }
        return primaryObject; // retorna el objeto config.json completo
    }
    
     merge(object1: any, object2: any){ // Funcion que concatena las propiedades de los objetos
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
                object1[includ[i]]=this.merge((object1[includ[i]]=='')?{}:object1[includ[i]],object2[includ[i]]); // El objeto 1 en la propiedad que apunta el indice i, es igual a lo que retorne el metodo merge al recibir
                // al recibir los objetos a los que apunta la propiedad en el indice i de ambos objetos
            }
            console.log("Objeto final...-> "+JSON.stringify(object1));
            return object1; // retorno del objeto 1
        }else{
            return ''; //Si los objetos son nulos o undefined se retorna una cadena vacia
        }
    }

    async  buildConfigJSON(Properties: any,pathConfig:string){ // Metodo que recibe un arreglo de arreglo de las propiedades leídas de cada modulo codigos escritos, y el path de donde sera escrito el archivo de configuracion final
        let configObject:any=[]; // Arreglo de objetos que se obtendran a partir de las propiedades que se reciben
        let prop=[]; // Arreglo que contendra los elementos de una propiedad en especifico
        let objectProperty:any;
        let configJSON: Object;
            // Se uso una arrow function para mantener el contexto de la variable configObject
        (()=>Properties.forEach((element:any)=>{  // se obtiene el primer arreglo de propiedades del primer modulo escrito
            element.forEach((element2:any)  =>{  // se obtiene la primera propiedad de este arreglo en este formato this.config.ejemplo.propiedad
            prop=element2.split('.'); // Se separa y genera un arreglo [this,config,ejemplo,propiedad]
                objectProperty=this.propertiesRecursive(prop[2],prop.slice(2,prop.length)); // Se genera un objeto a partir del arreglo de la propiedad generado mediante el metodo PropertiesRecursive y se guarda en la variable objectPorperty
                configObject.push(objectProperty); // Se pushea al array de objetos el objeto generado de la propiedad leída
            });
        }))();
        configJSON= this.mergeProperties(configObject); // Se genera el archivo de configuracion global en el metodo mergeProperties y se guarda en la variable configJSON
        
        return [`../src/${pathConfig}/config/config.json`,JSON.stringify(configJSON,null,2)]; //Se escribe el fichero config.json global con un formato de ajuste de linea
        }
        
        async constructInitializer(Modules: string[],ModulesRoute: string[],nameProject: string){ // Metodo encargado de retornar el codigo inicializador de los modulos escritos en el proyecto
            let initializer: any[]=[];// aqui se guardan los PATH y codigos de los archivos  a escribir
            for(let i=0;i<ModulesRoute.length;i++){ // Por cada uno de las rutas de los modulos recibidas
                ModulesRoute[i]=ModulesRoute[i].slice(0,ModulesRoute[i].length-3);//Se eliminará la extencion .ts
                ModulesRoute[i]='.'+(ModulesRoute[i].slice(ModulesRoute[i].indexOf(nameProject),ModulesRoute[i].length)).slice(nameProject.length,(ModulesRoute[i].length));// Se eliminará la ruta padre para matener la ruta relativa instacta
            }
        initializer.push([`../src/${nameProject}/Initializer.ts`,await this.constructClass(Modules,await this.generateImports(Modules,ModulesRoute))]); // Se agrega al array de codigos , el PATH de la clase Intializer y el contenido de dicha clase
        initializer.push(await this.runner(nameProject)); // Se agrega el PATH del ejecutor de la aplicacion APP o Runner
        initializer.push(await this.tsconfig(nameProject)); // Se agrega el PATH del tsconfig generado para el proyecto
        return initializer;  // Se retornan los codigos
        }
        
        
        async generateImports(Modules: string[],ModulesRoute: string[]){ // Metodo que escribe los import necesarios segun los modulos escritos
        let codeImports=""; // Variable que guardará el codigo generado de los imports
        for(let i=0;i<Modules.length;i++){ // Por cada Modulo
        codeImports=codeImports+`import { ${Modules[i][0].toUpperCase()+Modules[i].slice(1,Modules[i].length)} } from '${ModulesRoute[i]}'; \n`; // Se crea su import correspondiente
        }
        codeImports=codeImports+"import * as fs from 'fs'; \n"; // Se agrega a los import el fs para el initializer, ya que es necesario para leer el archivo config.json global
        return codeImports; // Se retorna el codigo de los imports
        }
        
        async constructClass(Modules: string[], Code: string){ // Metodo que genera constructor de la clase Initilizer
        let classCode=Code+"class Initializer{ \npublic config: any; \n"; // Se coloca el codigo inicial de la clase asi como la propiedad del archivo config.json global
        let constructorCode="constructor(){ \n this.config= JSON.parse(fs.readFileSync('./config/config.json','utf8')); \n"; // Se genera el codigo para asignar a la propiedad config el contenido de nuestro archivo config.json
        for(let i=0;i<Modules.length;i++){ // Por cada modulo a escribir
            classCode=classCode+`public ${Modules[i][0].toLowerCase()+Modules[i].slice(1,Modules[i].length)}: ${Modules[i][0].toUpperCase()+Modules[i].slice(1,Modules[i].length)}; \n`; // Se genera una variable del tipo de la clase que exporta el modulo a escribir
            constructorCode=constructorCode+`this.${Modules[i][0].toLowerCase()+Modules[i].slice(1,Modules[i].length)} = new ${Modules[i][0].toUpperCase()+Modules[i].slice(1,Modules[i].length)}(this.config); \n`; // Se inicializa en el constructor cada variable del tipo de clase a la que hace referencia inyectandole el objeto config
        }
        constructorCode=constructorCode+"}\n"; // Se agrega un salto de linea al codigo del constructor
        classCode=classCode+constructorCode; // Se agrega al codigo global de la clase el codigo del constructor
        let codeGets=await this.generateGets(Modules); // Se generan los codigos de los getters de los modulos para retornas instancias de los modulos
        classCode=classCode+codeGets; // Se agregan los getters a la clase global de la clase Initializer
        classCode=classCode+"} \nexport default new Initializer();\n"; // Se agrega un salto de línea y se exporta la clase como una nueva instancia al código de la clase Initializer y se finaliza 
        return classCode; // Se retorna el codigo de la clase Intializer
        }
        async generateGets(Modules: string[]){
        let codeGets=""; // Se crea la variable que contendra el código de los getters
        for(let i=0;i<Modules.length;i++){ // Por cada modulo a escribir
            codeGets=codeGets+`public get${Modules[i][0].toUpperCase()+Modules[i].slice(1,Modules[i].length)}Module(){ \n return this.${Modules[i][0].toLowerCase()+Modules[i].slice(1,Modules[i].length)}; \n }\n`; // Se escribe una funcion getter del Modulo
        }
        
        return codeGets; // Se retorna el codigo de los getters
        }
        
        
        async runner(nameProject:string){ // Este metodo crea la clase App o Runner que ejectura el programa principal del proyecto
            let codeAppRunner=""; // Se inicializa la variable que contendra el codigo de 
            codeAppRunner=codeAppRunner+"import Initializer from './Initializer';\n console.log(Initializer);"; // Se escribe el codigo de la clase App o Runner
            return [`../src/${nameProject}/App.ts`,codeAppRunner]; // Se retorna el PATH a escribir el Modulo APP o Runner y el codigo fuente de la clase
        }
        
        async tsconfig(nameProject: string){ // Metodo que escribe el archivo tsconfig.json del proyecto
        let codetsconfig:any; // Se crea la variable que contendra el codigo del archivo
        codetsconfig=await fs.readFileSync('../tsconfig.json','utf8'); // Se leé el contenido del archivo del proyecto STARTDEVJS
        return [`../src/${nameProject}/tsconfig.json`,codetsconfig]; // Se retorna el PATH de escritura y el codigo del archivo tsconfig.json
        }


        async  nodeRequest(){ // Metodo que retorna las dependencias Core de Nodejs
            let options = {
              hostname: 'api.github.com',
              path: '/repos/nodejs/node/contents/lib',
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 
                         'user-agent': 'nodejs/node' 
              }
            }
            return new Promise((resolve:any,reject)=>{ // Retorno de una nueva promesa
              let req=http.request(options, (res:any) => { // Se crea la variable que contendra la peticion
                res.setEncoding('utf8') // el response se adapta a la codificacion utf8
                var body:any = ""; // Se crea la variable body que contendra el cuerpo de la respuesta a la petición http
                res.on('data', (data:any) => { body += data }) // Se asigna el valor data del reponse a la variable body
                res.on('end', () => { // cuando termine la solicitud
                  var list:any = [] // Se crea una lista de dependencias
                  body = JSON.parse(body) // Se parsea el body a JSON para obtener sus propiedades
                  body.forEach( (f:any) => { // Por cada propiedad del body
                    if (f.type === 'file' && f.name[0]!=='_' && f.name[0]!=='.') { // Se filtran los que son archivos 
                      list.push(path.basename(f.name,'.js'))// Se agrega a la lista de depdencias el nombre de la depedencia
                    }
                  })
                  resolve(list); // Se resuelve la promesa retornando la lista de los modulos Core de node js
                })
               
              })
              req.end(); // Se finaliza la solicitud request
            })
          }
          async getCoreModulesNode(){ // Metodo que obtiene los modulos Core de node js
          return await  this.nodeRequest(); // Se retorna la respuesta del metodo asincrono nodeRequets
          }
}