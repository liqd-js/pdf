'use strict';

/**/
const PDF = require('../lib/pdf');
//<page> </page>
const Invoice = new PDF( require('fs').readFileSync( __dirname + '/pdf.html', 'utf8' ));

Invoice.render(
{
    foo: 'jozo',
    items: 
    [
        { name: 'A', value: 3.34 },
        { name: 'B', value: 19.28 }
    ]
});

/**/

/** /
const Style = require('../lib/style');

let style = new Style({ fontWeight: 'bold', background: 'red' });

console.log( style );
console.log( style.inherit() );

style.apply( 'border: 1px solid silver; font-size: 10px' );
/**/