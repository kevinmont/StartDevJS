'use-strict';

var program = require('commander');
var reader = require('./lib/reader');

program
    .version('1.0.0')
    .option('-f, --file <url>', 'specifie a source file, a specific definition of startdev file', delegateReader)
    .option('-T, --no-trace', 'by default trace is activaded')
    .parse(process.argv);

if (!process.argv[2]) {
    console.log(program.outputHelp());
}

program.command('*|%')
    .description('Invalid command')
    .action(function () {
        console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    });

function delegateReader(path) {
    console.log('delegating service...');
    console.log('path: ' + path);
    var file = new reader(path);
}