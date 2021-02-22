'use strict';

/**/
const PDF = require('../lib/pdf');
//<page> </page>
const Invoice = new PDF( '<pdf><header>Janko hrasko\n\ntest</header><table><td>{ $props.test }</td></table></pdf>' );

console.log( Invoice.render({ test: 'jozo' }) );

/**/

/** /
const Style = require('../lib/style');

let style = new Style({ fontWeight: 'bold', background: 'red' });

console.log( style );
console.log( style.inherit() );

style.apply( 'border: 1px solid silver; font-size: 10px' );
/**/