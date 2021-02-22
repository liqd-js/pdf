'use strict';

const fs = require('fs');
const Parser = require('@liqd-js/parser');
const Template = require('@liqd-js/template');
const PDFParser = new Parser( __dirname + '/pdf.syntax' );

const Load = filename => fs.readFileSync( filename, 'utf8' );

class Document
{
    #document;

    constructor()
    {
        this.#document = new ( require('pdfkit') )({ size: 'A4', bufferPages: true });

        this.#text( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nDonec eget diam mauris. Cras pellentesque suscipit luctus. Cras velit augue, blandit id massa a, eleifend bibendum enim. Nulla facilisi. Aliquam consectetur libero fermentum, aliquam ante sed, volutpat magna. Nam et augue ornare, pulvinar dui sed, sollicitudin magna. Nulla tempus feugiat augue. Vestibulum ornare odio id erat mollis pulvinar at a lorem. Proin sollicitudin, est vitae blandit porta, ligula turpis pulvinar justo, dignissim ultricies mi augue ac libero. Vivamus eu enim eu felis consequat semper. Aenean volutpat vestibulum orci ut ornare. Sed ut tellus in sapien accumsan porttitor. Maecenas felis magna, blandit sed turpis a, placerat feugiat ipsum.' );
        this.#text( 'Donec eget venenatis ligula, vel iaculis eros. Ut eget congue turpis. Mauris convallis at sem convallis lacinia. Nunc id pretium nibh, sed malesuada lorem. Nulla blandit blandit magna, in laoreet nulla aliquet eu. Aliquam leo nunc, tempus dapibus hendrerit id, vulputate blandit lacus. Nam ornare aliquet nisl in posuere. Aenean tincidunt turpis ac condimentum maximus. Curabitur et venenatis metus, ac pulvinar justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent malesuada sodales magna sollicitudin porttitor. Curabitur a nunc a ligula blandit auctor vitae eu lacus. Praesent auctor porta eleifend. Interdum et malesuada fames ac ante ipsum primis in faucibus.' );
    }

    #text( text, options )
    {
        this.#document.fontSize( 10 );
        this.#document.text( text, { indent: 0, width: 300, align: 'justify', lineGap: 0, size: 32, paragraphGap: 0 });

        //this.#document.y += 10;

        console.log({ x: this.#document.x, y: this.#document.y, lineHeight: this.#document.currentLineHeight() });
    }

    save( filename )
    {
        this.#document.pipe( require('fs').createWriteStream( __dirname + '/../test/test.pdf'));
        this.#document.end();
    }
}

module.exports = class PDF
{
    #template; #templates = {};

    constructor( template, options )
    {
        console.log( template.match( /<header>([\s\S]*?)<\/header>/ ));

        this.#template = new Template({ directories: [] });
        this.#templates.content = this.#template.compile( content );
    }

    #offset( document )
    {
        return {  }
    }

    #text({ document, block, style, virtual }, text )
    {
        doc.fontSize(attributes.size || 10);
          attributes.font ? doc.font(__dirname + '/fonts/' + attributes.font + '.ttf') : doc.font(__dirname + '/fonts/arial.ttf')

          if (!measure)
          {
              doc.text(text, x + padding[3], y + padding[0], {
                  indent: 0,
                  width: width - padding[3] - padding[1],
                  align: attributes.align || 'left'
              }).fillColor('black');
          };
    }

    #parse( template )
    {

    }

    render( nodes )
    {
        let pdf = PDFParser.parse( require('fs').readFileSync( __dirname + '/../test/pdf.html', 'utf8' ));

        console.log( JSON.stringify( pdf, null, '  ' ));

        let document = new Document();

        document.save();
        
        /*let document = new ( require('pdfkit') )({ size: 'A4', bufferPages: true });

        console.log({ x: document.x, y: document.y, width: document.page.width, height: document.page.height, margin: document.page.margins });

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