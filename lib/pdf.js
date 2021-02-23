'use strict';

const fs = require('fs');
const Parser = require('@liqd-js/parser');
const Template = require('@liqd-js/template');
const PDFParser = new Parser( __dirname + '/pdf.syntax' );
const Style = require('./style');

const Load = filename => fs.readFileSync( filename, 'utf8' );
const Compile = ( template, source ) => template.compile( `if( true ){ with( $props.data ){ <>${source}</>}}` );

const HEADER_RE = /<header(\s[^>]+)?>[\s\S]+<\/header>/;
const FOOTER_RE = /<footer(\s[^>]+)?>[\s\S]+<\/footer>/;
const MAIN_RE = /<main(\s[^>]+)?>[\s\S]+<\/main>/;

class Document
{
    #document;

    constructor( pdf )
    {
        this.#document = new ( require('pdfkit') )({ size: 'A4', bufferPages: true });

        //this.#text( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nDonec eget diam mauris. Cras pellentesque suscipit luctus. Cras velit augue, blandit id massa a, eleifend bibendum enim. Nulla facilisi. Aliquam consectetur libero fermentum, aliquam ante sed, volutpat magna. Nam et augue ornare, pulvinar dui sed, sollicitudin magna. Nulla tempus feugiat augue. Vestibulum ornare odio id erat mollis pulvinar at a lorem. Proin sollicitudin, est vitae blandit porta, ligula turpis pulvinar justo, dignissim ultricies mi augue ac libero. Vivamus eu enim eu felis consequat semper. Aenean volutpat vestibulum orci ut ornare. Sed ut tellus in sapien accumsan porttitor. Maecenas felis magna, blandit sed turpis a, placerat feugiat ipsum.' );
        //this.#text( 'Donec eget venenatis ligula, vel iaculis eros. Ut eget congue turpis. Mauris convallis at sem convallis lacinia. Nunc id pretium nibh, sed malesuada lorem. Nulla blandit blandit magna, in laoreet nulla aliquet eu. Aliquam leo nunc, tempus dapibus hendrerit id, vulputate blandit lacus. Nam ornare aliquet nisl in posuere. Aenean tincidunt turpis ac condimentum maximus. Curabitur et venenatis metus, ac pulvinar justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent malesuada sodales magna sollicitudin porttitor. Curabitur a nunc a ligula blandit auctor vitae eu lacus. Praesent auctor porta eleifend. Interdum et malesuada fames ac ante ipsum primis in faucibus.' );

        //console.log( pdf );

        for( let node of pdf.main.nodes[0].tag.nodes )
        {
            if( node.text )
            {
                this.#text( node.text )
            }
        }

        this.#block({ x: 10, y: 10, width: 300, height: 300 }, new Style('border-left-style: solid; border-left-width: 20px; border-left-color: orange; border-right-style: solid; border-right-width: 20px; border-right-color: red; border-top-style: solid; border-top-width: 5px; border-top-color: green; border-bottom-style: solid; border-bottom-width: 10px; border-bottom-color: blue; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px; '));
    }

    #block( rect, style )
    {
        //.dash(5, {space: 10})

        let contentRect = { ...rect };

        if( style.borderLeftWidth && parseFloat( style.borderLeftWidth ))
        {
            this.#document.lineWidth( parseFloat( style.borderLeftWidth )).strokeColor( style.borderLeftColor ).lineCap('butt').moveTo( rect.x + parseFloat( style.borderLeftWidth ) / 2, rect.y ).lineTo( rect.x + parseFloat( style.borderLeftWidth ) / 2, rect.y + rect.height ).stroke();

            contentRect.x += parseFloat( style.borderLeftWidth );
            contentRect.width -= parseFloat( style.borderLeftWidth );
        }

        if( style.borderRightWidth && parseFloat( style.borderRightWidth ))
        {
            this.#document.lineWidth( parseFloat( style.borderRightWidth )).strokeColor( style.borderRightColor ).lineCap('butt').moveTo( rect.x + rect.width - parseFloat( style.borderRightWidth ) / 2, rect.y ).lineTo( rect.x + rect.width - parseFloat( style.borderRightWidth ) / 2, rect.y + rect.height ).stroke();

            contentRect.width -= parseFloat( style.borderRightWidth );
        }

        if( style.borderTopWidth && parseFloat( style.borderTopWidth ))
        {
            this.#document.lineWidth( parseFloat( style.borderTopWidth )).strokeColor( style.borderTopColor ).lineCap('butt').moveTo( rect.x, rect.y + parseFloat( style.borderTopWidth ) / 2 ).lineTo( rect.x  + rect.width, rect.y + parseFloat( style.borderTopWidth ) / 2 ).stroke();

            contentRect.y += parseFloat( style.borderTopWidth );
            contentRect.height -= parseFloat( style.borderTopWidth );
        }

        if( style.borderBottomWidth && parseFloat( style.borderBottomWidth ))
        {
            this.#document.lineWidth( parseFloat( style.borderBottomWidth )).strokeColor( style.borderBottomColor ).lineCap('butt').moveTo( rect.x, rect.y + rect.height - parseFloat( style.borderBottomWidth ) / 2 ).lineTo( rect.x + rect.width, rect.y + rect.height - parseFloat( style.borderBottomWidth ) / 2 ).stroke();

            contentRect.height -= parseFloat( style.borderBottomWidth );
        }

        this.#document.fillColor('silver').lineCap('butt').rect( contentRect.x, contentRect.y, contentRect.width, contentRect.height ).fill();

        contentRect.x += parseFloat( style.paddingLeft );
        contentRect.width -= parseFloat( style.paddingLeft );
        contentRect.width -= parseFloat( style.paddingRight );

        contentRect.y += parseFloat( style.paddingTop );
        contentRect.height -= parseFloat( style.paddingTop );
        contentRect.height -= parseFloat( style.paddingBottom );

        console.log( rect, contentRect );

        //this.#document.lineWidth(10).strokeColor('blue').lineCap('butt').rect(150, 175, 50, 50).stroke();
    }

    #text( text, options )
    {
        this.#document.fontSize( 10 );
        this.#document.text( text, { indent: 0, width: 300, align: 'justify', lineGap: 0, size: 32, paragraphGap: 0, link: 'https://hk-green.sk', underline: false });

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
    #template; #main; #header; #footer;



    constructor( template, options )
    {
        this.#template = new Template({ directories: [] });

        this.#main = MAIN_RE.test( template ) ? Compile( this.#template, template.match( MAIN_RE )[0] ) : null;
        this.#header = HEADER_RE.test( template ) ? Compile( this.#template, template.match( HEADER_RE )[0] ) : null;
        this.#footer = FOOTER_RE.test( template ) ? Compile( this.#template, template.match( FOOTER_RE )[0] ) : null;

        console.log( this.#main, this.#header, this.#footer );
        //this.#templates.content = this.#template.compile( content );
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

    render( data, options = {})
    {
        let main = PDFParser.parse( this.#template.render( this.#main, { ...options, props: { ...( options.props || {}), data }}));
        let header = this.#header ? (  ) => PDFParser.parse( this.#template.render( this.#main, { ...options, props: { ...( options.props || {}), data }})) : null;
        let footer = this.#footer ? (  ) => PDFParser.parse( this.#template.render( this.#main, { ...options, props: { ...( options.props || {}), data }})) : null;

        let document = new Document({ main, header, footer });

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