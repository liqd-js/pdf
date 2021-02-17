'use strict';

const PDF = require('../lib/pdf');

const Invoice = new PDF( '<table><td>{ $props.test }</td></table>' );

console.log( Invoice.render({ test: 'jozo' }) );