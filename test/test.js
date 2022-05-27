'use strict';

/**/
const PDF = require('../lib/pdf');
//<page> </page>
const Invoice = new PDF( require('fs').readFileSync( __dirname + '/invoice.html', 'utf8' ));

const invoice = 
{
    "type": "invoice",
    "no": "12100000004",
    "issued": new Date(),
    "due": new Date(),
    "reference": "21000003",
    "price": 95.7,
    "currency": "EUR",
    "seller": {
        "name": "LUCULLUS s.r.o.",
        "address": "Pribinova 4",
        "zip": "811 09",
        "city": "Bratislava",
        "country": "SK",
        "crn": "50169971",
        "tax": "2120204361",
        "vat": "SK2120204361",
        "shipping": {
            "name": "LUCULLUS s.r.o.",
            "address": "Pribinova 4",
            "zip": "811 09",
            "city": "Bratislava",
            "country": "SK"
        },
        "banks": [{
            "country": "SK",
            "account": "4321454853/0200",
            "iban": "SK3502000000004321454853",
            "swift": "SUBASKBX"
        }]
    },
    "buyer": {
        "name": "Robert Hozza",
        "address": "Uherová 15",
        "zip": "05801",
        "city": "Poprad",
        "country": "SK",
        "shipping": {
            "name": "Robert Hozza",
            "address": "Uherová 15",
            "zip": "05801",
            "city": "Poprad",
            "country": "SK"
        }
    },
    "items": [{
        "uid": "3493",
        "name": "Umelý Ficus Retusa Bonsai 50 cm",    
        "physical": true,
        "quantity": 3,
        "price": 7.9,
        "discount": 0,
        "vat": 0.2
    }, {
        "uid": "3893",
        "name": "Umelá rastlina Marginata v kvetináči z prírodného materiálu",
        "physical": true,
        "quantity": 4,
        "price": 9.6,
        "discount": 0,
        "vat": 0.2
    }, {
        "uid": "4899",
        "name": "Umelá guľa z machu 16 cm",    
        "physical": true,
        "quantity": 3,
        "price": 11.2,
        "discount": 0,
        "vat": 0.2
    }],
    vat: true,
    account: { _id: 'SK1231231231', prefix: '0000', number: '231232131', suffix: '2312321' },
    qr: undefined,
    payment: { type: 'cod' },
    note: 'spolocnost zapisana',
    logo: __dirname + '/logo-3.png',
    _id: 1,
}

Invoice.render( invoice, { locale: 'sk' }, __dirname + '/invoice.pdf' );

/**/

/** /
const Style = require('../lib/style');

let style = new Style({ fontWeight: 'bold', background: 'red' });

console.log( style );
console.log( style.inherit() );

style.apply( 'border: 1px solid silver; font-size: 10px' );
/**/