const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
export class Mongodb{
// Connection URL

public url:string;
public config: any;
 
// Database Name
public dbName:string;
constructor(config:any){
    this.config=config;
this.url=this.config.mongodb.url;
this.dbName=this.config.mongodb.dbName;
} 
 
// Use connect method to connect to the server
async connect(){
MongoClient.connect(this.url, function(err:any, client:any) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  const db = client.db(this.dbName);
 
  console.log(db);

});
}
}