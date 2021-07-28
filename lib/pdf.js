'use strict';

const fs = require('fs');
const Parser = require('@liqd-js/parser');
const Template = require('@liqd-js/template');
const PDFParser = new Parser( __dirname + '/pdf.syntax' );
const Style = require('./style');
const Layout = require('./layout');

const Load = filename => fs.readFileSync( filename, 'utf8' );
const Compile = ( template, source ) => template.compile( `if( true ){ with( $props.data ){ <>${source}</>}}` );
const Equals = ( objA, objB ) => JSON.stringify( objA ) === JSON.stringify( objB );
const Size = ( value, max ) => value ? ( value.endsWith( '%' ) ? parseFloat( value ) * max / 100: parseFloat( value )) : 0;

const INLINE_TAGS = [ 'a', 'b', 'u', 'strong', 'cite', 'code', 'em', 'i', 'q', 'small', 'span', 'sub', 'sup', 'br' ];

const HEADER_RE = /<header(\s[^>]+)?>[\s\S]+<\/header>/;
const FOOTER_RE = /<footer(\s[^>]+)?>[\s\S]+<\/footer>/;
const MAIN_RE = /<main(\s[^>]+)?>[\s\S]+<\/main>/;

class Document
{
    #pdf; #document; #style;

    constructor( pdf )
    {
        const PDFKit = require('pdfkit');

        this.#pdf = pdf;
        this.#style = new Style( 'font-size: 10px; text-align: left; color: black; font-family: Helvetica;');

        this.#document = new PDFKit({ size: 'A4', bufferPages: true, autoFirstPage: true, margin: 30 });
        
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

        new Layout( this.#document, this.#style, this.#pdf.main.nodes )

        //console.log( require('util').inspect( main, { depth: Infinity, colors: true }));

        //await this.#addPage();
    }

    async #addPage()
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
    }

    #compile_inline( inline, nodes, style, options, i = 0 )
    {
        for( ; i < nodes.length; ++i )
        {
            if( nodes[i].tag )
            {
                if( !INLINE_TAGS.includes( nodes[i].tag.name )){ return i - 1 }

                if( nodes[i].tag.name === 'br' )
                {
                    inline.push({ text: '\n', style, ...options });
                }
                else
                {
                    let node_style = style.inherit().apply( Style.default(  nodes[i].tag.name )).apply(  nodes[i].tag.attributes.style ), node_options = { ...options };

                    ( nodes[i].tag.name === 'a' ) && ( node_options.link = nodes[i].tag.attributes.href );

                    this.#compile_inline( inline, nodes[i].tag.nodes, node_style, node_options );
                }
            }
            else
            {
                //inline.push({ text: nodes[i].ws ? ( nodes[i].ws.includes('\n') ? ' ' : nodes[i].ws.replace() ) : nodes[i].text, style, ...options });
                inline.push({ text: nodes[i].ws ? ' ' : nodes[i].text.replace( /\s+/g, ' ' ), style, ...options });
            }
        }

        return i;
    }

    #compile( nodes, style = new Style())
    {
        let compiled = [];

        for( let i = 0; i < nodes.length; ++i )
        {
            if( nodes[i].tag && !INLINE_TAGS.includes( nodes[i].tag.name ))
            {
                let node_style = style.inherit().apply( Style.default( nodes[i].tag.name )).apply( nodes[i].tag.attributes.style );

                compiled.push({ type: 'block', style: node_style, nodes: this.#compile( nodes[i].tag.nodes, node_style.inherit() )});
            }
            else
            {
                let inline = [];

                i = this.#compile_inline( inline, nodes, style, {}, i );

                if( compress_inline( inline ).length )
                {
                    compiled.push({ type: 'inline', nodes: inline });
                }
            }
        }

        return compiled;
    }

    /*#swap_virtual( copy_position = true )
    {
        copy_position && ( this.#virtual_document.x = this.#document.x, this.#virtual_document.y = this.#document.y );

        [ this.#document, this.#virtual_document ] = [ this.#virtual_document, this.#document ];
    }*/

    /*#block( rect, style )
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

        this.#document.fillColor( style.backgroundColor ).lineCap('butt').rect( contentRect.x, contentRect.y, contentRect.width, contentRect.height ).fill();

        contentRect.x += parseFloat( style.paddingLeft );
        contentRect.width -= parseFloat( style.paddingLeft );
        contentRect.width -= parseFloat( style.paddingRight );

        contentRect.y += parseFloat( style.paddingTop );
        contentRect.height -= parseFloat( style.paddingTop );
        contentRect.height -= parseFloat( style.paddingBottom );

        console.log( rect, contentRect );

        //this.#document.lineWidth(10).strokeColor('blue').lineCap('butt').rect(150, 175, 50, 50).stroke();
    }*/

    #text( node, width, continued )
    {
        this.#document
            //.font( node.style.fontFamily + ( node.style.fontWeight === 'bold' ? '-Bold' : '' ))
            //.font( '/System/Library/Fonts/Tahoma.ttf', 'HelveticaNeue-Medium' )
            .font( node.style.fontWeight === 'bold' ? '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf' : '/System/Library/Fonts/Supplemental/Tahoma.ttf' )
            //.font( '/System/Library/Fonts/HelveticaNeue.ttc' )
            //.font('/System/Library/Fonts/PingFang.ttc', 'PingFangSC-Regular')
            //.font('/System/Library/Fonts/PingFang.ttc', 'PingFangSC-Regular')
            //.font( '/System/Library/Fonts/Apple Braille.ttf' )
            .fontSize( parseFloat( node.style.fontSize ))
            .fillColor( node.style.color, 1 )
            .text( node.text,
            {
                width, 
                baseline    : 'baseline',
                indent      : 0,
                align       : node.style.textAlign,
                lineGap     : 0,
                paragraphGap: 0,
                underline   : node.style.textDecoration === 'underline',
                link        : node.link || null,
                continued   : continued === true 
            });
    }

    #inline( inline, width, virtual = false )
    {
        /*let y = this.#document.y; virtual && this.#swap_virtual();

        for( let i = 0; i < inline.nodes.length; ++i )
        {
            //console.log( this.#document.x, inline.nodes[i] );

            this.#text( inline.nodes[i], width, i < inline.nodes.length - 1 );
        }

        y = this.#document.y - y;

        return ( virtual && this.#swap_virtual( false ), y );*/
    }

    #measure_block( block, width )
    {
        let startY = this.#document.y, y = startY, startX = this.#document.x, x = startX;

        y += Size( block.style.marginTop ) + Size( block.style.borderTopWidth ) + Size( block.style.paddingTop );


        y += Size( block.style.marginBottom ) + Size( block.style.borderBottomWidth ) + Size( block.style.paddingBottom );

        return y - startY;
    }

    #measure( block, width )
    {
        let startY = this.#document.y, y = startY, startX = this.#document.x, x = startX;
    }

    #block( block, width )
    {
        console.log( block.style );

        this.#document.y += Size( block.style.marginTop ) + Size( block.style.borderTopWidth );
        this.#document.x += Size( block.style.marginLeft ) + Size( block.style.borderLeftWidth );
        width -= Size( block.style.marginLeft ) + Size( block.style.borderLeftWidth ) + Size( block.style.marginRight ) + Size( block.style.borderRightWidth );

        let y = this.#document.y, x = this.#document.x;

        this.#document.y += Size( block.style.paddingTop );
        this.#document.x += Size( block.style.paddingLeft );
        width -= Size( block.style.paddingLeft ) + Size( block.style.paddingRight );

        let contentY = this.#document.y, contentX = this.#document.x;

        /*if( nodes[i].style.backgroundColor )
        {
            this.#document.fillColor( nodes[i].style.backgroundColor ).lineCap('butt').rect( 0, 0, 50, 50 ).fill();
        }*/

        for( let i = 0; i < block.nodes.length; ++i )
        {
            if( block.nodes[i].type === 'block' )
            {
                this.#block( block.nodes[i], width );
            }
            else if( block.nodes[i].type === 'inline' )
            {
                this.#document.x = contentX;

                this.#inline( block.nodes[i], width );
            }
        }

        this.#document.y += Size( block.style.paddingBottom );

        block.style.backgroundColor && block.style.backgroundColor !== 'transparent' && this.#document.fillColor( block.style.backgroundColor, 0.1 ).rect( x, y, width, this.#document.y - y ).fill();

        this.#document.y += Size( block.style.marginBottom ) + Size( block.style.borderBottomWidth );

        y = this.#document.y - y;
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

    async render( data, options = {})
    {
        let main = PDFParser.parse( await this.#template.render( this.#main, { ...options, props: { ...( options.props || {}), data }}));
        let header = this.#header ? async( props = {}) => PDFParser.parse( await this.#template.render( this.#header, { ...options, props: { ...( options.props || {}), data: { ...data, ...props }}})) : null;
        let footer = this.#footer ? async( props = {}) => PDFParser.parse( await this.#template.render( this.#footer, { ...options, props: { ...( options.props || {}), data: { ...data, ...props }}})) : null;

        let document = new Document({ main, header, footer });

        await document.render();

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