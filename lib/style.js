'use strict';

const INHERITED_PROPERTIES = [ 'font', 'text', 'line', 'color', 'word' ];
const DEFAULT_PROPERTIES = { backgroundColor: 'transparent', backgroundPosition: 'center center', fontWeight: 'normal', color: 'black', textAlign: 'left' };
const isInherited = ( property ) => Boolean( INHERITED_PROPERTIES.find( p => property.startsWith( p )));
const normalizeProperty = ( property ) => property.replace(/-(.)/g, ( _, c ) => c.toUpperCase() );

const PT_to_MM = 0.3527764217;
const PT_to_PX = 1.3333333333;

const DEFAULT_STYLES = 
{
    a       : 'color: blue; text-decoration: underline;',
    b       : 'font-weight: bold;',
    u       : 'text-decoration: underline',
    strong  : 'font-weight: bold;',
    cite    : 'text-decoration: underline;',
    code    : 'font-family: Courier; background: silver;',
    em      : 'font-style: italic;',
    i       : 'font-style: italic;', 
    q       : 'font-style: italic;', 
    small   : 'font-size: 0.75em;',
    sub     : 'font-size: 0.75em;', // todo offset dole
    sup     : 'font-size: 0.75em;', // todo offset hore
}

function parseDefinition( definition )
{
    // TODO zatial jednoduchy parsing - casom mozno doplnit data:url

    let properties = definition.split(/;/).map( v => v.trim() ).filter( Boolean ).map( v => v.match(/(?<name>[a-z-]+)\s*:\s*(?<value>.*)/ ).groups );

    definition = {};

    for( let property of properties )
    {
        definition[ normalizeProperty( property.name )] = property.value;
    }

    return definition;
}

module.exports = class Style
{
    static default( tag )
    {
        return DEFAULT_STYLES[ tag ] || '';
    }

    default( tag ){ return Style.default( tag )}

    constructor( definition )
    {
        this.apply( definition );
    }

    clone()
    {
        return new Style( this );
    }
    
    apply( definition )
    {
        if( definition )
        {
            if( typeof definition === 'string' )
            {
                definition = parseDefinition( definition );
            }

            Object.assign( this, definition );
        }

        return this;
    }

    inherit()
    {
        let inherited_style = { ...DEFAULT_PROPERTIES };

        for( let property in this )
        {
            isInherited( property ) && ( inherited_style[ property ] = this[ property ]);
        }

        return new Style( inherited_style );
    }

    compute( ...properties )
    {
        return properties.reduce(( s, p ) =>
        {
            let value = 0

            if( this.hasOwnProperty( p ))
            {
                try
                {
                    let { number, unit } = this[p].match(/^(?<number>-?[0-9,.]+)(?<unit>.*)$/).groups;

                    number = parseFloat( number );

                    switch( unit )
                    {
                        case '%'    : value = 0; break;
                        case 'pt'   : value = number; break;
                        case 'px'   : value = number / PT_to_PX; break;
                        case 'mm'   : value = number / PT_to_MM; break;
                        case 'cm'   : value = 10 * number / PT_to_MM; break;
                        case 'em'   : value = number * this.compute( 'fontSize' ); break; // TODO pozor na nesting em
                        default     : value = number; break;
                    }
                }
                catch(e){}
            }

            return s += value;
        }, 0 );
    }
}

console.log( normalizeProperty('border-top-radius') );