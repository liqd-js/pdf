'use strict';

// TODO cropbox na pdf nastavovat

const fs = require('fs');
const Parser = require('@liqd-js/parser');
const Template = require('@liqd-js/template');
const PDFParser = new Parser( __dirname + '/pdf.syntax' );
const Style = require('./style');
const Layout = require('./layout');
const PDFKit = require('pdfkit');
const SVGtoPDF = require('svg-to-pdfkit');

PDFKit.prototype.addSVG = function( svg, x, y, options )
{
    return SVGtoPDF(this, svg, x, y, options), this;
};

const Load = filename => fs.readFileSync( filename, 'utf8' );
const Compile = ( template, source ) => template.compile( `if( true ){ with( $props.data ){ <>${source}</>}}` );

const HEADER_RE = /<header(\s[^>]+)?>[\s\S]+<\/header>/;
const FOOTER_RE = /<footer(\s[^>]+)?>[\s\S]+<\/footer>/;
const MAIN_RE = /<main(\s[^>]+)?>[\s\S]+<\/main>/;

class Document
{
    #pdf; #document; #style;

    constructor( pdf )
    {
        this.#pdf = pdf;
        this.#style = new Style( 'font-size: 10px; text-align: left; color: black; font-family: Helvetica;');

        this.#document = new PDFKit({ size: 'A4', bufferPages: true, autoFirstPage: true, margin: 0 });

        //this.#document.registerFont( 'F1', '/System/Library/Fonts/HelveticaNeue.ttc', 'HelveticaNeue-Light');
        //this.#document.registerFont( 'F1', __dirname + '/../test/fonts/HelveticaNeue-Bold.ttf');
        //this.#document.registerFont( 'F2', '/System/Library/Fonts/HelveticaNeue.ttc', 'HelveticaNeue-Medium');

        //.font( '/System/Library/Fonts/HelveticaNeue.ttc', 'HelveticaNeue-Light' )

        //let nodes = this.#compile( pdf.main.nodes, this.#style );

        //console.log( JSON.stringify( nodes, null, '  ' ));

        //this.#block({ nodes, style }, 400 );

        
        //await this.#addPage();
        //await this.#addPage();
        //await this.#addPage();

        //this.#text( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nDonec eget diam mauris. Cras pellentesque suscipit luctus. Cras velit augue, blandit id massa a, eleifend bibendum enim. Nulla facilisi. Aliquam consectetur libero fermentum, aliquam ante sed, volutpat magna. Nam et augue ornare, pulvinar dui sed, sollicitudin magna. Nulla tempus feugiat augue. Vestibulum ornare odio id erat mollis pulvinar at a lorem. Proin sollicitudin, est vitae blandit porta, ligula turpis pulvinar justo, dignissim ultricies mi augue ac libero. Vivamus eu enim eu felis consequat semper. Aenean volutpat vestibulum orci ut ornare. Sed ut tellus in sapien accumsan porttitor. Maecenas felis magna, blandit sed turpis a, placerat feugiat ipsum.' );
        //this.#text( 'Donec eget venenatis ligula, vel iaculis eros. Ut eget congue turpis. Mauris convallis at sem convallis lacinia. Nunc id pretium nibh, sed malesuada lorem. Nulla blandit blandit magna, in laoreet nulla aliquet eu. Aliquam leo nunc, tempus dapibus hendrerit id, vulputate blandit lacus. Nam ornare aliquet nisl in posuere. Aenean tincidunt turpis ac condimentum maximus. Curabitur et venenatis metus, ac pulvinar justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent malesuada sodales magna sollicitudin porttitor. Curabitur a nunc a ligula blandit auctor vitae eu lacus. Praesent auctor porta eleifend. Interdum et malesuada fames ac ante ipsum primis in faucibus.' );
    }

    async render()
    {
        //let main = this.#compile( this.#pdf.main.nodes, this.#style );

        let layout = new Layout( this.#document, this.#style, this.#pdf.main.nodes );

        layout.render();

        //let header = new Layout( this.#document, this.#style, ( await this.#pdf.header({ $page: 1 })).nodes );

        //header.render();

        //let footer = new Layout( this.#document, this.#style, ( await this.#pdf.footer({ $page: 1 })).nodes );

        //footer.render();

        //console.log( require('util').inspect( main, { depth: Infinity, colors: true }));

        //await this.#addPage();
    }

    /*async #addPage()
    {
        this.#document.addPage();

        //console.log( this.#document.page );

        let $page = this.#document._pageBuffer.findIndex( p => p === this.#document.page ) + 1;

        let header = this.#pdf.header && await this.#pdf.header({ $page });
        let footer = this.#pdf.footer && await this.#pdf.footer({ $page });

        console.log( header, footer );

        if( header )
        {
            this.#document.x = this.#document.page.margins.left;
            this.#document.y = this.#document.page.margins.top;

            header && this.#block({ nodes: this.#compile( header.nodes, this.#style ), style: this.#style }, this.#document.page.width - this.#document.page.margins.left - this.#document.page.margins.right );
        }
        
        if( footer )
        {
            this.#document.x = this.#document.page.margins.left;
            this.#document.y = this.#document.page.height - this.#document.page.margins.bottom - 220;
            
            footer && this.#block({ nodes: this.#compile( footer.nodes, this.#style ), style: this.#style }, this.#document.page.width - this.#document.page.margins.left - this.#document.page.margins.right );
        }

        this.#document.x = this.#document.page.margins.left;
        this.#document.y = this.#document.page.margins.top + 100;

        this.#block({ nodes: this.#compile( this.#pdf.main.nodes, this.#style ), style: this.#style }, this.#document.page.width - this.#document.page.margins.left - this.#document.page.margins.right );        

        //console.log( header, nodes );

        //this.#document.text( 'Hello world' );
    }*/

    async data()
    {
        const buffer = [];

        return new Promise(( resolve, reject ) =>
        {
            this.#document.on( 'data', data => buffer.push( data ));
            this.#document.on( 'end', data => resolve( Buffer.concat( buffer )));
            this.#document.end();
        });
    }

    async save( filename )
    {
        return new Promise(( resolve, reject ) =>
        {
            this.#document.pipe( require('fs').createWriteStream( filename || __dirname + '/../test/test.pdf')).on('finish', resolve);
            this.#document.end();
        });
    }
}

module.exports = class PDF
{
    #template; #main; #header; #footer;

    constructor( template, options )
    {
        this.#template = new Template({ directories: [], ...options });

        this.#template.on( 'error', e => console.log( e ));

        this.#main = MAIN_RE.test( template ) ? Compile( this.#template, template.match( MAIN_RE )[0] ) : null;
        this.#header = HEADER_RE.test( template ) ? Compile( this.#template, template.match( HEADER_RE )[0] ) : null;
        this.#footer = FOOTER_RE.test( template ) ? Compile( this.#template, template.match( FOOTER_RE )[0] ) : null;

        console.log( this.#main, this.#header, this.#footer );
        //this.#templates.content = this.#template.compile( content );
    }

    async render( data, options = {}, filename )
    {
        let main = PDFParser.parse( await this.#template.render( this.#main, { ...options, props: { ...( options.props || {}), data }}));
        let header = this.#header ? async( props = {}) => PDFParser.parse( await this.#template.render( this.#header, { ...options, props: { ...( options.props || {}), data: { ...data, ...props }}})) : null;
        let footer = this.#footer ? async( props = {}) => PDFParser.parse( await this.#template.render( this.#footer, { ...options, props: { ...( options.props || {}), data: { ...data, ...props }}})) : null;

        let document = new Document({ main, header, footer });

        await document.render();

        if( filename )
        {
            await document.save( filename );
        }
        else
        {
            return await document.data();
        }
    }
}