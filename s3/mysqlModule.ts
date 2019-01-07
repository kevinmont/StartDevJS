import * as mysql from 'fs';
let fs = require('fs');
export class Mysql {
        public pool: mysql.Pool;
        public config: any;
        constructor(config:any) {
            this.config=config
                this.pool = mysql.createPool( {
                        host: this.config.mysql.host,
                        user: this.config.mysql.user,
                        password: this.config.mysql.passwords,
                        database: this.config.mysql.databasse
                    } );
                this.pool.getConnection( ( err: any, c: any ) => {
                        if ( c ) {
                              console.log("Client MYSQL Conected!!!");  
                            }
                        if ( err ) {
                                
                            }
                    } );
        }

    async query(query: string) {    
            return new Promise((resolve, reject) => {
                    this.pool.query(query, (error: any, results: any) => {
                        if ( error ) {
                                    reject("Error en la consulta método query");
                                }
                            resolve(results);
                        
                        });
                });
        }
    }
