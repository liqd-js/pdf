import PDFKit from "pdfkit";
import Style from "./style";
import Layout from "./layout";
import { LiqdPDFDocument } from "./pdf";
import Font from "./font";

export type Node = NodeTag | NodeText | NodeWs;
export type NodeTag = {
    tag: {
        name: string
        attributes: Record<string, string>
        nodes: Node[]
    }
}
export type NodeText = {
    text: string
    style?: Style
    link?: string
}
export type NodeWs = { ws: string }

export type StyleSheet = Array<{ selector: string, rules: string }>

export type DocumentPDF = {
    main: { nodes: Node[] }
    header?: ( props: any ) => Promise<{ nodes: Node[] }>;
    footer?: ( props: any ) => Promise<{ nodes: Node[] }>;
    stylesheet?: StyleSheet
}

export default class Document
{
    private pdf: DocumentPDF;
    private readonly document: LiqdPDFDocument;
    private readonly style: Style;
    private readonly stylesheet?: StyleSheet;
    private readonly options?: any;
    private readonly fontPaths: string[] = [];

    constructor( pdf: DocumentPDF, options?: any )
    {
        this.pdf = pdf;
        this.style = new Style( 'font-size: 10px; text-align: left; color: black; font-family: Comic Neue;');
        this.stylesheet = this.pdf.stylesheet || undefined;
        this.fontPaths = options?.fontPaths || [];

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

        const fonts = await this.collectFonts();
        const loadedFonts = await Font.setupFonts( this.fontPaths, fonts.map( f => ({ family: f })));

        if( this.pdf.header )
        {
            const header = new Layout( this.document, this.style, ( await this.pdf.header({ $page: 1 })).nodes, this.options, this.stylesheet );
            header.render( 0, 0 );
            headerHeight = header.outerHeight
        }

        const layout = new Layout( this.document, this.style, this.pdf.main.nodes, this.options, this.stylesheet );
        layout.render( 0, headerHeight );

        if( this.pdf.footer )
        {
            const footer = new Layout( this.document, this.style, ( await this.pdf.footer({ $page: 1 })).nodes, this.options, this.stylesheet );
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

    private async collectFonts(): Promise<string[]>
    {
        const fonts = new Set<string>();

        const headerNodes = this.pdf.header ? ( await this.pdf.header({ $page: 1 })).nodes : undefined;
        const footerNodes = this.pdf.footer ? ( await this.pdf.footer({ $page: 1 })).nodes : undefined;

        this.collectFontsRec( this.pdf.main.nodes, fonts );
        headerNodes && this.collectFontsRec( headerNodes, fonts );
        footerNodes && this.collectFontsRec( footerNodes, fonts );

        for ( const elem of this.stylesheet || [] )
        {
            const rules = new Style( elem.rules );
            if( rules.fontFamily )
            {
                const families = Font.parseFontFamily(rules.fontFamily);
                families.forEach( f => fonts.add( f ));
            }
        }

        if ( this.style.fontFamily )
        {
            const families = Font.parseFontFamily(this.style.fontFamily);
            families.forEach( f => fonts.add( f ));
        }

        return Array.from( fonts );
    }

    private collectFontsRec( nodes: Node[] | null, fonts: Set<string> = new Set() ): Set<string>
    {
        if ( !nodes )
        {
            return fonts;
        }

        for( let node of nodes )
        {
            if( 'tag' in node )
            {
                if( node.tag.name === 'img' )
                {
                    continue;
                }

                if( node.tag.attributes.style )
                {
                    let style = new Style( node.tag.attributes.style );
                    if( style.fontFamily )
                    {
                        const families = Font.parseFontFamily(style.fontFamily);
                        families.forEach( f => fonts.add( f ));
                    }
                }

                this.collectFontsRec( node.tag.nodes, fonts );
            }
            else if( 'style' in node && node.style )
            {
                if( node.style.fontFamily )
                {
                    const family = node.style.fontFamily;
                    fonts.add( family );
                }
            }
        }

        return fonts;
    }
}