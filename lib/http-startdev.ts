import * as fs from 'fs';
import * as rq from 'request-promise';

export default class StartDevHttpsRequest{

    async processData (requests: any){
        let pattern:any = await rq({
            method: 'POST',
            uri: "http://localhost:4000/startdev/pattern",
            body: {pattern: 'mvc'},
            json: true
        });

        let modules: any = {};
        Object.keys(requests['modules']).forEach( (element) =>{
            modules[element]={"url": `./src/s3/${element}Module.ts`};
        }); 
        let response: any = {};
        response['code']=200;
        response['pattern'] = pattern;
        response['modules']= modules;
        return response;
    }

    async getLangs(){
        return await rq({
            method: 'GET',
            uri: 'http://localhost:4000/startdev/langs'
         })
    }
}