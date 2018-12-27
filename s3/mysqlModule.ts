import * as mysql from 'mysql';
export class connectMysql {
        public pool: mysql.Pool;
        public config: any;
        constructor(config) {
            this.config=config;
                
                this.pool = mysql.createPool( {
                        host: this.config.mysql.host,
                        user: this.config.mysql.user,
                        password: this.config.mysql.password,
                        database: this.config.mysql.database
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
