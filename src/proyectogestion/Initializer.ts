import { Mysql } from './Libs/mysqlModule'; 
import * as fs from 'fs'; 
class Initializer{ 
public config: any; 
public mysql: Mysql; 
constructor(){ 
 this.config= JSON.parse(fs.readFileSync('./config/config.json','utf8')); 
this.mysql = new Mysql(this.config); 
}
public getMysqlModule(){ 
 return this.mysql; 
 }
} 
export default new Initializer();
