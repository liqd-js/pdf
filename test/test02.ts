//@ts-nocheck

'use strict';

//<page> </page>
import PDF from "../src/pdf";

// const Invoice = new PDF( require('fs').readFileSync( __dirname + '/test-style-inline.html', 'utf8' ), { dictionaries:
const TestPDF = new PDF( require('fs').readFileSync( __dirname + '/test02.html', 'utf8' ), {});
TestPDF.render( {}, {}, __dirname + '/test02.pdf' );

/**/

/** /
const Style = require('../lib/style');

let style = new Style({ fontWeight: 'bold', background: 'red' });

console.log( style );
console.log( style.inherit() );

style.apply( 'border: 1px solid silver; font-size: 10px' );
/**/