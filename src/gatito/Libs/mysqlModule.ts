import * as mysql from 'mysql';
import * as riak  from 'basho-riak-client';
import * as angular from 'angular';
let fs = require('fs');
export class connectMysql {
        public pool: mysql.Pool;
        public config: any;
        constructor(config) {
            this.config=config;
            this.config= this.config.netsuite.item.pass;
            this.config=this.config.netsuite.item.name;
            this.config=this.config.pool.mysql;
                this.config= this.config.dev.pass;
                this.config=this.config.dev.username.name.clave;
                this.config=this.config.dev.username.names.claves;
                this.config= this.config.dev.username.names.clave1.hola.server.gg.html;
                this.config=this.config.dev.username.names.clave1.hola2.server.ss;
                this.pool = mysql.createPool( {
                        host: this.config.mysql.host,
                        user: this.config.mysql.user,
                        password: this.config.mysql.passwords,
                        database: this.config.mysql.databasse
                    } );
                this.pool.getConnection( ( err: any, c: any ) => {
                        if ( c ) {
                                
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
