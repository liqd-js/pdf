const Parser = require('@liqd-js/parser');
const Template = require('@liqd-js/template');
const PDFParser = new Parser( __dirname + '/../../syntax/pdf.syntax' );
const SVGtoPDF = require('svg-to-pdfkit');

import fs from 'fs';
import PDFDocument from 'pdfkit';

import Text from '../elements/text';

type Position = { x: number, y: number };

export default class PDFRenderer
{
    private helpers: any = [];
    private headers: any = [];
    private footers: any = [];
    private main: any;
    private pageNumber: number = 0;

    private document: typeof PDFDocument;

    constructor( template: string, scope: object )
    {
        const { attributes, blocks } = PDFParser.parse( template );

        this.document = new PDFDocument({ size: attributes.size || 'A4', autoFirstPage: false, margin: 0 });
        this.document.pipe( fs.createWriteStream( __dirname + '/../../test/ts.pdf' ));

        this.addPageTMP();
        
        for( let block of blocks )
        {
            switch( block.type )
            {
                case 'helper': this.helpers.push( block ); break;
                case 'header': this.headers.push( block ); break;
                case 'footer': this.footers.push( block ); break;
                case 'main': this.main = block; break;
            }
        }

        const text = new Text({ element: 
        {
            tag: 'text',
            attributes: {},
            children: [ this.main.template.replace(/[ \t\r]*\n[ \t\r]*/g, '\n') ]
            
        }, parent: undefined, renderer: this });

        //this.document.text( this.main.template, 50, 50 );

        //console.log( require('util').inspect( blocks, { depth: 8, colors: true }) );

        this.document.end();
    }
    
    private compose()
    {
        // prepare arangements
    }

    public render()
    {
        // render elements
    }

    public textWidth( text: string )
    {
        return this.document.widthOfString( text );
    }

    public text( text: string, { x, y }: Position )
    {
        //console.log({ x, y, text });

        // TODO wordSpacing the amount of space between each word in the text

        //this.document.text( text, x, y, { lineBreak: false, width: 200, align: 'justify' });
        this.document.text( text, x, y, { lineBreak: false, width: Infinity });
    }

    private dots( x: number, y: number, columns: number, rows: number, color: string )
    {
        for( let i = 0; i < columns; ++i )
        {
            for( let j = 0; j < rows / 2; ++j )
            {
                this.document.fill( color ).circle( x + i * 2.5, y + (( i % 2 ) * 2.5 ) + j * 5, 0.5 );
                //this.document.fill( color ).circle( x + i * 2.5, y + j * 2.5, 0.5 );
            }
        }
    }

    public addPageTMP()
    {
        ++this.pageNumber;

        console.log( 'temp' );
        
        this.document.addPage();

        const swo = fs.readFileSync( __dirname + '/../../test/swo.svg', 'utf8' ); //692.296 243.316
        const ramp = fs.readFileSync( __dirname + '/../../test/ramp.svg', 'utf8' ); //453.6 140.1

        const swoRatio = 692.296 / 243.316;
        const rampRatio = 453.6 / 140.1;

        if( this.pageNumber === 1 )
        {
            this.svg( ramp, 50, 50, { width: rampRatio * 50, height: 50 });
            this.svg( swo, this.document.page.width - 50 - swoRatio * 50, this.document.page.height - 50 - 50, { width: swoRatio * 50, height: 50 });

            this.document.rect( this.document.page.width / 2, 50, this.document.page.width / 2, 50 ).fill( '#3364f5' );

            this.dots( 1, 200, 11, 151, '#2f75b9' );

            this.dots( 250, 60, 80, 7, '#000000' );

            //47 117 185
        }
        else
        {
            this.svg( ramp, 50, 50, { width: rampRatio * 25, height: 25 });
            this.svg( swo, this.document.page.width - 50 - 69, this.document.page.height - 50 - 25 - 20, { width: swoRatio * 25, height: 25 });

            //this.document.rect( 50, 50, 500, 600, ).fill( 'blue' );
            this.document.rect( 0, this.document.page.height - 50, this.document.page.width, 50, ).fill( 'black' );
            this.document.fontSize( 12 ).fill( 'white' );
            
            this.text( 'ramp.global', { x: 50, y: this.document.page.height - 30 });

            //this.document.fontSize( 80 ).fill( 'white' ).text( 'RAMP', 70, 70 );
        }

        this.document.fontSize( 12 );

        

        console.log( this.document.page.width, this.document.page.height );



        this.document.fill( 'black' );
    }

    public svg( svg: string, x: number, y: number, options: any )
    {
        return SVGtoPDF( this.document, svg, x, y, options );
    }
}