import * as fs from 'fs';
export async function processData (request: any){
let pattern:any = fs.readFileSync(`../s3/${(request['model']).toUpperCase()}.json`);
let modules: any = {};
Object.keys(request['modules']).forEach( (element) =>{
    modules[element]={"url": `../s3/${element}Module.ts`};
}); 
let response: any = {};
response['code']=200;
response['pattern'] = JSON.parse(pattern);
response['modules']= modules;
return response;
}