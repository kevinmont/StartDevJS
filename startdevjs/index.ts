#!/usr/bin/env node
import * as program from "commander";
import Reader from '../lib/reader';
program
    .version('1.0.0')
    .description('Sistema para generacion de bootstrap´s automaticos');

program
    .command('read-file <path>')
    .alias('rf')
    .description(' --> Lectura del fichero StartDevJs File')
    .action( async(path) => await Reader.readStartDevFile(path) );

program.parse(process.argv);