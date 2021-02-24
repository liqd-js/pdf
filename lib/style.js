'use strict';

const INHERITED_PROPERTIES = [ 'font', 'text', 'line', 'color', 'word' ];
const DEFAULT_PROPERTIES = { backgroundColor: 'transparent', backgroundPosition: 'center center', fontWeight: 'normal', color: 'black', textAlign: 'left' };
const isInherited = ( property ) => Boolean( INHERITED_PROPERTIES.find( p => property.startsWith( p )));
const normalizeProperty = ( property ) => property.replace(/-(.)/g, ( _, c ) => c.toUpperCase() );

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
}

console.log( normalizeProperty('border-top-radius') );