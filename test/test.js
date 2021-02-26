'use strict';

/**/
const PDF = require('../lib/pdf');
//<page> </page>
const Invoice = new PDF( require('fs').readFileSync( __dirname + '/pdf.html', 'utf8' ));

Invoice.render(
{
    no: '200012341',
    items: 
    [
        { quantity: 1, name: 'Prvy item', price: 3.34 },
        { quantity: 5, name: 'Druhy item', price: 19.28 }
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