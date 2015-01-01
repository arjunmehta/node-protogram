var program = require('minimarg');

program.option('--generic', '-g', 'Use a generic flag to do anything', function(value) {
    console.log('Your generic value is', value);
});

program.option('--help', '-h', 'Display usage information', function(value) {

    var programOptions = this.program.options;

    console.log('Welcome to the Minimarg sample program!');
    console.log('Usage:');

    for (var option in programOptions) {
        console.log(option, programOptions[option].shortcut, programOptions[description].shortcut);
    }
});

program.parse(process.argv.slice(2));
