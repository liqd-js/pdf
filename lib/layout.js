const INLINE_TAGS = [ 'a', 'b', 'u', 'strong', 'cite', 'code', 'em', 'i', 'q', 'small', 'span', 'sub', 'sup', 'br' ];
const Equals = ( objA, objB ) => JSON.stringify( objA ) === JSON.stringify( objB ); //TODO sort keys

const { Text, Block, Grid } = require('./elements');


module.exports = class Layout
{
    #document; #style; #elements = [];

    constructor( document, style, nodes )
    {
        this.#document = document;
        this.#style = style;

        let width = 300; // TODO this.#document.width;

        this.#elements = this.#compile( nodes, style ).map( n =>
        {
            if( n.type === 'block' )
            {
                return new Block( document, style, width, n.nodes );
            }
        });




        //this.#elements = 

        //let text = new Text()
    }

    #compress_inline( inline )
    {
        if( inline[0].text === ' ' ){ inline.shift() }
        if( inline.length && inline[inline.length-1].text === ' ' ){ inline.splice(-1,1) }

        for( let i = 0; i < inline.length - 1; ++i )
        {
            if( Equals( inline[i].style, inline[i+1].style ) && Equals( inline[i].options, inline[i+1].options ))
            {
                if(!( inline[i].text.endsWith('\n') && inline[i+1].text === ' ' ))
                {
                    inline[i].text += inline[i+1].text;
                }
                inline.splice( i-- + 1, 1 );
            }
            else if( inline[i].text.endsWith('\n') )
            {
                inline[i].text += '\n'
            }
        }

        for( let i = 0; i < inline.length; ++i )
        {
            inline[i].text = inline[i].text.replace(/[ \t]+/g,' ').replace(/[ \t]+(?=\n)/g,'').replace(/(?<=\n)[ \t]+/g,'');

            if( i > 0 )
            {
                if( inline[i-1].text.endsWith('\n') && inline[i].text.startsWith(' '))
                {
                    inline[i].text = inline[i].text.replace(/^ /,'');
                }
                else if( inline[i].text.endsWith('\n') && inline[i-1].text.startsWith(' '))
                {
                    inline[i-1].text = inline[i].text.replace(/ $/,'');
                }
            }
        }

        // TODO odstanit medzery na zaciatku a konci riadku
        
        return inline;
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
                    let node_style = style.inherit().apply( style.default( nodes[i].tag.name )).apply(  nodes[i].tag.attributes.style ), node_options = { ...options };

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

    #compile( nodes, style )
    {
        let compiled = [];

        for( let i = 0; i < nodes.length; ++i )
        {
            if( nodes[i].tag && !INLINE_TAGS.includes( nodes[i].tag.name ))
            {
                let node_style = style.inherit().apply( style.default( nodes[i].tag.name )).apply( nodes[i].tag.attributes.style );

                compiled.push(
                {
                    type    : 'block',
                    tag     : nodes[i].tag.name,
                    style   : node_style,
                    nodes   : this.#compile( nodes[i].tag.nodes, node_style.inherit() )
                });
            }
            else
            {
                let inline = [];

                i = this.#compile_inline( inline, nodes, style, {}, i );

                if( this.#compress_inline( inline ).length )
                {
                    compiled.push({ type: 'text', strings: inline });
                }
            }
        }

        return compiled;
    }
}