'use strict';

/** /
const PDF = require('../lib/pdf');

const Invoice = new PDF( '<table><td>{ $props.test }</td></table>' );

console.log( Invoice.render({ test: 'jozo' }) );

/**/

const Style = require('../lib/style');

let style = new Style({ fontWeight: 'bold', background: 'red' });

console.log( style );
console.log( style.inherit() );

style.apply( 'border: 1px solid silver; font-size: 10px' );