//@ts-nocheck

// TODO cropbox na pdf nastavovat

import fs from 'fs';
import Document, { StyleSheet } from './document';
import { Element, Block } from './elements';
import PDFKit from 'pdfkit';
import PDFDocument = PDFKit.PDFDocument;
const Parser = require('@liqd-js/parser');
const Template = require('@liqd-js/template');
const PDFParser = new Parser( __dirname + '/pdf.syntax' );
const SVGtoPDF = require('svg-to-pdfkit');

PDFKit.prototype.addSVG = function( svg: string, x: number, y: number, options )
{
    return SVGtoPDF(this, svg, x, y, options), this;
};
export type LiqdPDFDocument = PDFDocument & {
    addSVG: ( svg: string, x: number, y: number, options?: any ) => LiqdPDFDocument
    _fontSize: number
}

function parseStyle( style: string | null ): StyleSheet
{
    const parsed = [];

    for( let [ _, selector, rules ] of style?.matchAll(/([^{]+)\{([^{]+)\}/g) || [] )
    {
        const selectors = selector.replaceAll(/\s*\n\s*/g, ' ').trim().split(',').map( s => s.trim() );
        for ( const selector of selectors )
        {
            parsed.push({ selector, rules: ( rules.replaceAll(/\s*\n\s*/g, ' ') + ';' ).replaceAll(/(\s*;\s*)+/g, ';') });
        }
    }

    return parsed;
}

const Load = ( filename: string ) => fs.readFileSync( filename, 'utf8' );
const Compile = ( template: any, source: string ) => template.compile( `if( true ){ with( $props.data ){ <>${source}</>}}` );
// TODO: template: type?    ^^^

const HEADER_RE = /<header(\s[^>]+)?>[\s\S]+<\/header>/;
const FOOTER_RE = /<footer(\s[^>]+)?>[\s\S]+<\/footer>/;
const MAIN_RE = /<main(\s[^>]+)?>[\s\S]+<\/main>/;
const STYLE_RE = /<style>([\s\S]+)<\/style>/;

export type PDFOptions = { dictionaries?: object[], locale?: string }

export default class PDF
{
    private readonly template;
    private readonly main;
    private readonly header;
    private readonly footer;
    private readonly style;

    constructor( template: string, options: PDFOptions )
    {
        this.template = new Template({ directories: [], ...options });

        this.template.on( 'error', (e: any) => console.log( e ));

        this.main = MAIN_RE.test( template ) ? Compile( this.template, template.match( MAIN_RE )![0] ) : null;
        this.header = HEADER_RE.test( template ) ? Compile( this.template, template.match( HEADER_RE )![0] ) : null;
        this.footer = FOOTER_RE.test( template ) ? Compile( this.template, template.match( FOOTER_RE )![0] ) : null;
        this.style = STYLE_RE.test( template ) ? this.template.compile( template.match( STYLE_RE )![0] ) : null;

        //console.log( template, this.style ); process.exit( 0 );
        // this.style = STYLE_RE.test( template ) ?  : null;

        //console.log( this.main, this.header, this.footer );

        //this.templates.content = this.template.compile( content );
    }

    async render( data: object, options, filename: string, documentOptions )
    {
        let stylesheet = parseStyle( this.style ? ( await this.template.render( await this.style, {} )).match( STYLE_RE )![1] : '');

        let main = PDFParser.parse( await this.template.render( this.main, { ...options, props: { ...( options.props || {}), data }}));
        let header = this.header ? async( props = {}) => PDFParser.parse( await this.template.render( this.header, { ...options, props: { ...( options.props || {}), data: { ...data, ...props }}})) : undefined;
        let footer = this.footer ? async( props = {}) => PDFParser.parse( await this.template.render( this.footer, { ...options, props: { ...( options.props || {}), data: { ...data, ...props }}})) : undefined;

        let document = new Document({ main, header, footer, stylesheet }, documentOptions );

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

export { Element, Block } from './elements';