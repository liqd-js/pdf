'use strict';

const Template = require('@liqd-js/template');

module.exports = class PDF
{
    #template; #templates = {};

    constructor( content, options )
    {
        this.#template = new Template({ directories: [] });
        this.#templates.content = this.#template.compile( content );
    }

    #text( text, style )
    {
        
    }

    render( data )
    {
        let document = new ( require('pdfkit') )({ size: 'A4', bufferPages: true });

        document.text( 'Hello world', 0, 0 );

        document.pipe( require('fs').createWriteStream( __dirname + '/../test/test.pdf'));
        document.end();

        /*return await PDF(
        {
            template: parser.parse(invoice),
            header: parser.parse(header),
            footer: parser.parse(footer),
            margin: {top: 72, left: 72, right: 72, bottom: 72}
        }, data.id, eshopID );

        return this.#template.render( this.#templates.content, { props: data });*/
    }
}