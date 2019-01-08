import * as fs from 'fs';
export class Initializer{

async constructInitializer(Modules: string[],ModulesRoute: string[],nameProject: string){
    let initializer: any[]=[];
    for(let i=0;i<ModulesRoute.length;i++){
        ModulesRoute[i]=ModulesRoute[i].slice(0,ModulesRoute[i].length-3);
        ModulesRoute[i]='.'+(ModulesRoute[i].slice(ModulesRoute[i].indexOf(nameProject),ModulesRoute[i].length)).slice(nameProject.length,(ModulesRoute[i].length));
    }
initializer.push([`../src/${nameProject}/Initializer.ts`,await this.constructClass(Modules,await this.generateImports(Modules,ModulesRoute))]);
initializer.push(await this.runner(nameProject));
initializer.push(await this.tsconfig(nameProject));
return initializer;
}


async generateImports(Modules: string[],ModulesRoute: string[]){
let codeImports="";
for(let i=0;i<Modules.length;i++){
codeImports=codeImports+`import { ${Modules[i][0].toUpperCase()+Modules[i].slice(1,Modules[i].length)} } from '${ModulesRoute[i]}'; \n`;
}
codeImports=codeImports+"import * as fs from 'fs'; \n";
return codeImports;
}

async constructClass(Modules: string[], Code: string){
let classCode=Code+"class Initializer{ \npublic config: any; \n";
let constructorCode="constructor(){ \n this.config= JSON.parse(fs.readFileSync('./config/config.json','utf8')); \n";
for(let i=0;i<Modules.length;i++){
    classCode=classCode+`public ${Modules[i][0].toLowerCase()+Modules[i].slice(1,Modules[i].length)}: ${Modules[i][0].toUpperCase()+Modules[i].slice(1,Modules[i].length)}; \n`;
    constructorCode=constructorCode+`this.${Modules[i][0].toLowerCase()+Modules[i].slice(1,Modules[i].length)} = new ${Modules[i][0].toUpperCase()+Modules[i].slice(1,Modules[i].length)}(this.config); \n`;
}
constructorCode=constructorCode+"}\n";
classCode=classCode+constructorCode;
let codeGets=await this.generateGets(Modules);
classCode=classCode+codeGets;
classCode=classCode+"} \nexport default new Initializer();\n";
return classCode;
}
async generateGets(Modules: string[]){
let codeGets="";
for(let i=0;i<Modules.length;i++){
    codeGets=codeGets+`public get${Modules[i][0].toUpperCase()+Modules[i].slice(1,Modules[i].length)}Module(){ \n return this.${Modules[i][0].toLowerCase()+Modules[i].slice(1,Modules[i].length)}; \n }\n`;
}

return codeGets;
}


async runner(nameProject:string){
    let codeConfig="";
    codeConfig=codeConfig+"import Initializer from './Initializer';\n console.log(Initializer);";
    return [`../src/${nameProject}/App.ts`,codeConfig];
}

async tsconfig(nameProject: string){
let codetsconfig:any;
codetsconfig=await fs.readFileSync('../tsconfig.json','utf8');
return [`../src/${nameProject}/tsconfig.json`,codetsconfig];
}

}