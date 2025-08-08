import PDFKit from "pdfkit";
import fs from "fs";
import Style from "./style";
import PDFDocument = PDFKit.PDFDocument;
import Layout from "./layout";
import { LiqdPDFDocument } from "./pdf";


export type Node = NodeTag | NodeText | NodeWs; // TODO: check text type
export type NodeTag = {
    tag: {
        name: string
        attributes: Record<string, string>      // TODO: type napr. {style: '...'}
        nodes: Node[]
    }
}
export type NodeText = {
    text: string
    style?: Style
    link?: string
}
export type NodeWs = { ws: string }

type PDF = {
    main: { nodes: Node[] }
    header?: ( props: unknown ) => Promise<{ nodes: Node[] }>;
    footer?: ( props: unknown ) => Promise<{ nodes: Node[] }>;
}

export default class Document
{
    private pdf: PDF;
    private readonly document: LiqdPDFDocument;
    private readonly style: Style;
    private readonly options?: any;

    constructor( pdf: PDF, options?: any )
    {
        this.pdf = pdf;
        this.style = new Style( 'font-size: 10px; text-align: left; color: black; font-family: Helvetica;');


        this.document = new PDFKit({ size: 'A4', bufferPages: true, autoFirstPage: true, margin: 0 }) as LiqdPDFDocument;
        this.options = options;

        //this.document.registerFont( 'F1', '/System/Library/Fonts/HelveticaNeue.ttc', 'HelveticaNeue-Light');
        //this.document.registerFont( 'F1', __dirname + '/../test/fonts/HelveticaNeue-Bold.ttf');
        //this.document.registerFont( 'F2', '/System/Library/Fonts/HelveticaNeue.ttc', 'HelveticaNeue-Medium');

        //.font( '/System/Library/Fonts/HelveticaNeue.ttc', 'HelveticaNeue-Light' )

        //let nodes = this.compile( pdf.main.nodes, this.style );

        //console.log( JSON.stringify( nodes, null, '  ' ));

        //this.block({ nodes, style }, 400 );


        //await this.addPage();
        //await this.addPage();
        //await this.addPage();

        //this.text( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\nDonec eget diam mauris. Cras pellentesque suscipit luctus. Cras velit augue, blandit id massa a, eleifend bibendum enim. Nulla facilisi. Aliquam consectetur libero fermentum, aliquam ante sed, volutpat magna. Nam et augue ornare, pulvinar dui sed, sollicitudin magna. Nulla tempus feugiat augue. Vestibulum ornare odio id erat mollis pulvinar at a lorem. Proin sollicitudin, est vitae blandit porta, ligula turpis pulvinar justo, dignissim ultricies mi augue ac libero. Vivamus eu enim eu felis consequat semper. Aenean volutpat vestibulum orci ut ornare. Sed ut tellus in sapien accumsan porttitor. Maecenas felis magna, blandit sed turpis a, placerat feugiat ipsum.' );
        //this.text( 'Donec eget venenatis ligula, vel iaculis eros. Ut eget congue turpis. Mauris convallis at sem convallis lacinia. Nunc id pretium nibh, sed malesuada lorem. Nulla blandit blandit magna, in laoreet nulla aliquet eu. Aliquam leo nunc, tempus dapibus hendrerit id, vulputate blandit lacus. Nam ornare aliquet nisl in posuere. Aenean tincidunt turpis ac condimentum maximus. Curabitur et venenatis metus, ac pulvinar justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent malesuada sodales magna sollicitudin porttitor. Curabitur a nunc a ligula blandit auctor vitae eu lacus. Praesent auctor porta eleifend. Interdum et malesuada fames ac ante ipsum primis in faucibus.' );
    }

    async render()
    {
        //let main = this.compile( this.pdf.main.nodes, this.style );

        let headerHeight = 0;

        console.dir( this.pdf.main.nodes, { depth: null });


        if( this.pdf.header )
        {
            const header = new Layout( this.document, this.style, ( await this.pdf.header({ $page: 1 })).nodes, this.options );
            header.render( 0, 0 );
            headerHeight = header.outerHeight
        }

        const layout = new Layout( this.document, this.style, this.pdf.main.nodes, this.options );
        layout.render( 0, headerHeight );

        if( this.pdf.footer )
        {
            const footer = new Layout( this.document, this.style, ( await this.pdf.footer({ $page: 1 })).nodes, this.options );
            footer.render( 0, this.document.page.height - footer.outerHeight );
        }

        //console.log({ main: layout.outerHeight, header: header.outerHeight, footer: footer.outerHeight });

        //console.log( require('util').inspect( main, { depth: Infinity, colors: true }));

        //await this.addPage();
    }

    /*async #addPage()
    {
        this.document.addPage();

        //console.log( this.document.page );

        let $page = this.document._pageBuffer.findIndex( p => p === this.document.page ) + 1;

        let header = this.pdf.header && await this.pdf.header({ $page });
        let footer = this.pdf.footer && await this.pdf.footer({ $page });

        console.log( header, footer );

        if( header )
        {
            this.document.x = this.document.page.margins.left;
            this.document.y = this.document.page.margins.top;

            header && this.block({ nodes: this.compile( header.nodes, this.style ), style: this.style }, this.document.page.width - this.document.page.margins.left - this.document.page.margins.right );
        }

        if( footer )
        {
            this.document.x = this.document.page.margins.left;
            this.document.y = this.document.page.height - this.document.page.margins.bottom - 220;

            footer && this.block({ nodes: this.compile( footer.nodes, this.style ), style: this.style }, this.document.page.width - this.document.page.margins.left - this.document.page.margins.right );
        }

        this.document.x = this.document.page.margins.left;
        this.document.y = this.document.page.margins.top + 100;

        this.block({ nodes: this.compile( this.pdf.main.nodes, this.style ), style: this.style }, this.document.page.width - this.document.page.margins.left - this.document.page.margins.right );

        //console.log( header, nodes );

        //this.document.text( 'Hello world' );
    }*/

    async data()
    {
        const buffer: any[] = [];

        return new Promise(( resolve, reject ) =>
        {
            this.document.on( 'data', data => buffer.push( data ));
            this.document.on( 'end', data => resolve( Buffer.concat( buffer )));
            this.document.end();
        });
    }

    async save( filename: string )
    {
        return new Promise(( resolve, reject ) =>
        {
            this.document.pipe( require('fs').createWriteStream( filename || __dirname + '/../test/test.pdf')).on('finish', resolve);
            this.document.end();
        });
    }
}