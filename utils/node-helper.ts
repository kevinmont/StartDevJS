import * as http from 'https';
import * as path from 'path';
export class NodeHelper{

async  nodeRequest(){
  let options = {
    hostname: 'api.github.com',
    path: '/repos/nodejs/node/contents/lib',
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 
               'user-agent': 'nodejs/node' 
    }
  }
  return new Promise((resolve:any,reject)=>{
    let req=http.request(options, (res:any) => {
      res.setEncoding('utf8')
      var body:any = "";
      res.on('data', (data:any) => { body += data })
      res.on('end', () => {
        var list:any = []
        body = JSON.parse(body)
        body.forEach( (f:any) => {
          if (f.type === 'file' && f.name[0]!=='_' && f.name[0]!=='.') {
            list.push(path.basename(f.name,'.js'))
          }
        })
        resolve(list);
      })
     
    })
    req.end();
  })
}
async getCoreModulesNode(){
return await  this.nodeRequest();
}
}