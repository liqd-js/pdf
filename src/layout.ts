//@ts-nocheck

import { Block, Element } from './elements';
import { LiqdPDFDocument } from "./pdf";
import Style from "./style";
import { ObjectHash } from './helpers/base';
import { Node, NodeTag, NodeText, StyleSheet } from "./document";
import { getMatchingStyle } from "./helpers/style-resolver";

export type NodePath = Array<{ tag: string, ids?: string[], classes?: string[] }>

const INLINE_TAGS = [ 'a', 'b', 'u', 'strong', 'cite', 'code', 'em', 'i', 'q', 'small', 'span', 'sub', 'sup', 'br' ];
const Equals = ( objA?: object, objB?: object ) =>  objA === objB || ( objA && objB && typeof objA === 'object' && typeof objB === 'object' && ObjectHash( objA ) === ObjectHash( objB ));

export type InlineElement = {
    text: string;
    style?: Style;
    options?: Record<string, any>;
}

export default class Layout
{
    private readonly elements: Element[] = [];

    constructor(
        private document: LiqdPDFDocument,
        private style: Style,
        nodes: Node[], options,
        private stylesheet?: StyleSheet,
    )
    {
        let width = this.document.page.width; // TODO this.document.width;

        const x = this.compile( nodes, style, [] );

        this.elements = this.compile( nodes, style, [{tag: 'pdf'}] ).map( n =>
        {
            if( n.type === 'block' )
            {
                return new Block( document, n.style, width, undefined, n.elements, options );
            }
        });

        console.log( require('util').inspect( this.elements, { colors: true, depth: Infinity }));
    }

    get outerHeight()
    {
        return this.elements.reduce(( h, e ) => h += e.outerHeight, 0 ); // TODO margin padding
    }

    render( x: number, y: number )
    {
        for( let element of this.elements )
        {
            element.render( x, y );
            y += y.outerHeight;
        }
    }

    private compile_inline( inline: InlineElement[], nodes: Node[], style: Style, options, i = 0, path: NodePath = [] )
    {
        for( ; i < nodes.length; ++i )
        {
            if( 'tag' in nodes[i] )
            {
                const node = nodes[i] as NodeTag;
                if( !INLINE_TAGS.includes( node.tag.name )){ return i - 1 }

                if( node.tag.name === 'br' )
                {
                    inline.push({ text: '\n', style, ...options });
                }
                else
                {
                    const localPath = node.tag ? [ ...path, this.nextPathPart( node ) ] : path;
                    const ssss = getMatchingStyle( localPath, this.stylesheet );
                    let node_style = style.inherit()
                        .apply( style.default( node.tag.name ))
                        .apply(  node.tag.attributes.style )
                        .apply( ssss );

                    let node_options = { ...options };

                    ( node.tag.name === 'a' ) && ( node_options.link = node.tag.attributes.href );

                    this.compile_inline( inline, node.tag.nodes, node_style, node_options );
                }
            }
            else if ( 'ws' in nodes[i] )
            {
                inline.push({ text: ' ', style, ...options })
            }
            else if( 'text' in nodes[i] )
            {
                inline.push({ text: (nodes[i] as NodeText).text, style, ...options });
            }
            else
            {
                throw new Error( `Unknown node type: ${JSON.stringify( nodes[i] )}` );
            }
        }

        //console.log( inline );

        return i;
    }

    private compress_inline( inline: InlineElement[] )
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

    private compile_table( rows, style: Style, path: NodePath = [] )
    {
        let compiled = [], rowNo = 0;

        for( let row of rows )
        {
            if( row.tag )
            {
                const localPath = [ ...path, this.nextPathPart( row ) ];
                const ssss = getMatchingStyle( localPath, this.stylesheet );
                let row_style = style.inherit()
                    .apply( style.default( row.tag.name ))
                    .apply( row.tag.attributes.style )
                    .apply( ssss );

                for( let cell of row.tag.nodes )
                {
                    if( cell.tag )
                    {
                        const localPath = [ ...path, this.nextPathPart( cell ) ];

                        const ssss = getMatchingStyle( localPath, this.stylesheet );
                        let cell_style = row_style.inherit()
                            .apply( style.default( row.tag.name ))
                            // TODO: apply <style> for correct path
                            .apply( cell.tag.attributes.style )
                            .apply( ssss );

                        compiled.push(
                        {
                            type    : 'block',
                            tag     : cell.tag.name,
                            style   : cell_style,
                            row     : rowNo,
                            rows    : parseInt( cell.tag.attributes['rowspan'] || 1 ),
                            columns : parseInt( cell.tag.attributes['colspan'] || 1 ),
                            elements: this.compile( cell.tag.nodes, cell_style.inherit(), localPath )
                        });
                    }
                }

                ++rowNo;
            }
        }

        return compiled;
    }

    private compile( nodes: Node[], style: Style, path: NodePath = [] )
    {
        let compiled = [];

        if( nodes )
        {
            for( let i = 0; i < nodes.length; ++i )
            {
                const localPath = nodes[i].tag ? [ ...path, this.nextPathPart( nodes[i] ) ] : path;

                if( nodes[i].tag && !INLINE_TAGS.includes( nodes[i].tag.name ))
                {
                    const ssss = getMatchingStyle( localPath, this.stylesheet );
                    let node_style = style.inherit()
                        .apply( style.default( nodes[i].tag.name ))
                        .apply( nodes[i].tag.attributes.style )
                        .apply( ssss );

                    if( nodes[i].tag.name === 'table' )
                    {
                        compiled.push(
                        {
                            type        : 'grid',
                            tag         : nodes[i].tag.name,
                            style       : node_style,
                            elements    : this.compile_table( nodes[i].tag.nodes, node_style.inherit(), [...path, this.nextPathPart( nodes[i] )] ),
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
                            elements    : this.compile( nodes[i].tag.nodes, node_style.inherit(), localPath ),
                            attributes  : nodes[i].tag.attributes
                        });
                    }
                }
                else
                {
                    let inline: InlineElement[] = [];

                    i = this.compile_inline( inline, nodes, style, {}, i, localPath );

                    if( true ) //this.compress_inline( inline ).length )
                    {
                        compiled.push({ type: 'text', style, strings: inline });
                    }
                }
            }

            //console.log( compiled );
        }

        return compiled;
    }

    private nextPathPart( node: Node )
    {
        if( 'tag' in node )
        {
            const res = { tag: node.tag.name, ids: node.tag.attributes.id?.split(' '), classes: node.tag.attributes.class?.split(' ') };
            return res;
        }
    }
}