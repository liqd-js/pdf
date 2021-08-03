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

        let width = this.#document.page.width; // TODO this.#document.width;

        this.#elements = this.#compile( nodes, style ).map( n =>
        {
            if( n.type === 'block' )
            {
                return new Block( document, n.style, width, undefined, n.elements );
            }
        });
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

        //console.log( inline );

        return i;
    }

    #compress_inline( inline )
    {
        for( let i = 0; i < inline.length; ++i )
        {
            if( inline[i].text === '\n' )
            {
                if( i > 0 && inline[i-1].text === ' ' )
                {
                    inline.splice( i-- - 1, 1 );
                }

                continue;
            }

            if( inline[i].text === ' ' && ( i === 0 || inline[i-1].text.trim() === '' ))
            {
                inline.splice( i--, 1 );
            }
        }

        if( inline.length && inline[ inline.length - 1 ].text === ' ' )
        {
            inline.splice( inline.length - 1, 1 );
        }

        for( let i = 0; i < inline.length - 1; ++i )
        {
            if( Equals( inline[i].style, inline[i+1].style ) && Equals( inline[i].options, inline[i+1].options ))
            {
                inline[i].text += inline[i+1].text;
                inline.splice( i-- + 1, 1 );
            }
        }

        //console.log( '*** compress_inline ***', inline );

        // TODO odstanit medzery na zaciatku a konci riadku
        
        return inline;
    }

    #compile_table( rows, style )
    {
        let compiled = [], rowNo = 0;

        for( let row of rows )
        {
            if( row.tag )
            {
                let row_style = style.inherit().apply( style.default( row.tag.name )).apply( row.tag.attributes.style );

                for( let cell of row.tag.nodes )
                {
                    if( cell.tag )
                    {
                        let cell_style = row_style.inherit().apply( style.default( row.tag.name )).apply( cell.tag.attributes.style );

                        compiled.push(
                        {
                            type    : 'block',
                            tag     : cell.tag.name,
                            style   : cell_style,
                            row     : rowNo,
                            rows    : parseInt( cell.tag.attributes['rowspan'] || 1 ),
                            columns : parseInt( cell.tag.attributes['colspan'] || 1 ),
                            elements: this.#compile( cell.tag.nodes, cell_style.inherit() )
                        });
                    }
                }

                ++rowNo;
            }
        }

        return compiled;
    }

    #compile( nodes, style )
    {
        let compiled = [];

        if( nodes )
        {
            for( let i = 0; i < nodes.length; ++i )
            {
                if( nodes[i].tag && !INLINE_TAGS.includes( nodes[i].tag.name ))
                {
                    let node_style = style.inherit().apply( style.default( nodes[i].tag.name )).apply( nodes[i].tag.attributes.style );

                    if( nodes[i].tag.name === 'table' )
                    {
                        compiled.push(
                        {
                            type        : 'grid',
                            tag         : nodes[i].tag.name,
                            style       : node_style,
                            elements    : this.#compile_table( nodes[i].tag.nodes, node_style.inherit() ),
                            attributes  : nodes[i].tag.attributes
                        });
                    }
                    else
                    {
                        compiled.push(
                        {
                            type        : 'block',
                            tag         : nodes[i].tag.name,
                            style       : node_style,
                            elements    : this.#compile( nodes[i].tag.nodes, node_style.inherit() ),
                            attributes  : nodes[i].tag.attributes
                        });
                    }
                }
                else
                {
                    let inline = [];

                    i = this.#compile_inline( inline, nodes, style, {}, i );

                    if( this.#compress_inline( inline ).length )
                    {
                        compiled.push({ type: 'text', style, strings: inline });
                    }
                }
            }

            console.log( compiled );
        }

        return compiled;
    }

    render()
    {
        for( let element of this.#elements )
        {
            element.render( 0, 0 );
        }
    }
}