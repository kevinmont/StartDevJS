import { CodeTSJS } from './CodeTSJS';
import * as fs from 'fs';
import * as fspath from 'fs-path';
import * as rq from 'request-promise';
export class Linker{
        public tsjs: CodeTSJS;
    async Build(data:any,response:any,language:string){
        this.tsjs=new CodeTSJS();
        let ModulesPath:string[] = [];
        let initClass:any[]=[];
        let PATH:string='';
        let results:any[]=[];
        let properties:any[]=[];
        let modulesName:any=Object.keys(response['modules']); //Se obtienen los metadatos de los modulos a generar
        let npmDep:string[]=[];
        let CoreModules=await this.tsjs.getCoreModulesNode();
        for(let i=0;i<modulesName.length;i++){ // por cada modulo se procede a realizar las siguientes operaciones
            PATH=`../src/${data['name']}/${response['pattern']['Libs']}/${modulesName[i]}Module.ts`; //Creando el path de escritura de los modulos solicitados a generar
            ModulesPath.push(PATH); //Se guardan los directorios de los modulos generados
            let content= ""; 
            await rq({
                method: 'POST',
                uri: 'http://localhost:4000/startdev/code/provider',
                body: {
                    lang: language,
                    module: modulesName[i]
                },
                json: true
             }).then(response=> content = response['code']);// Se leén los modulos desde s3 para obtener el codigo fuente de los modulos
            console.log(content); // El buffer se cambia a string para poder leér el codigo fuente
            await fspath.writeFileSync(PATH,content); // Se escribe el modulo en el directorio antes generado
            properties.push(await this.tsjs.readProperties(content)); // Se obtienen las propiedades del codigo fuente para generar el config.json global
            let npmDepRes=await this.tsjs.readNpmDependencies(await content,CoreModules); // Se obtienen las dependencias de NPM solicitadas en el codigo fuente
            if(npmDepRes!=""){ // Si hay dependencias a descargar de NPM 
            npmDep.push(npmDepRes); // Se agregan dichas dependencias a un array
        }    
    }
            initClass= await this.tsjs.constructInitializer(modulesName,ModulesPath,data['name']);
            for(let i=0;i<initClass.length;i++){
                results.push(initClass[i]);
            }
            results.push(await this.tsjs.installNPMDependencies(npmDep,data['name'])); // El arreglos con las dependencias de NPM y el nombre del proyecto se mandan al metodo InstallNPMDepdencies
            results.push(await this.tsjs.buildConfigJSON(properties,data['name']));// Se mandan las propiedades de todos los modulo y el nombre del proyecto para generar el archivo de configuración
            results.push(await this.tsjs.buildController(data['name'],response));
            results.push(await this.tsjs.buildRouteClass(data['name'],response));
            results.push(await this.tsjs.buildServerClass(data['name']));
            return results;
        

    }
}