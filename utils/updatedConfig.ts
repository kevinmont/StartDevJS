import * as fs from 'fs';
fs.writeFile('./node_modules/fs-path/lib/index.d.ts',"declare module 'fs-path'",(err)=>{
    if(err) throw new Error("Error: "+err);
    console.log("Modules configurated!!!");
});