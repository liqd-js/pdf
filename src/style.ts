enum Unit {
    PT = 'pt',
    PX = 'px',
    MM = 'mm',
    CM = 'cm',
    EM = 'em',
    PERCENT = '%'
}

const INHERITED_PROPERTIES = [ 'font', 'text', 'line', 'color', 'word' ];
const DEFAULT_PROPERTIES: Record<string, string> = {
    backgroundColor: 'transparent',
    backgroundPosition: 'center center',
    fontWeight: 'normal',
    color: 'black',
    textAlign: 'left'
};

const PT_to_MM = 0.3527764217;
export const PT_to_PX = 1.3333333333;

const DEFAULT_STYLES: Record<string, string> = {
    a: 'color: blue; text-decoration: underline;',
    b: 'font-weight: bold;',
    u: 'text-decoration: underline;',
    strong: 'font-weight: bold;',
    cite: 'text-decoration: underline;',
    code: 'font-family: Courier; background: silver;',
    em: 'font-style: italic;',
    i: 'font-style: italic;',
    q: 'font-style: italic;',
    small: 'font-size: 0.75em;',
    sub: 'font-size: 0.75em;',
    sup: 'font-size: 0.75em;',
};

export default class Style
{
    [key: string]: any;

    static default( tag: string ): string
    {
        return DEFAULT_STYLES[tag] || '';
    }

    default( tag: string ): string
    {
        return Style.default( tag );
    }

    constructor( definition?: string | Record<string, any> )
    {
        this.apply( definition );
    }

    clone(): Style
    {
        return new Style( this );
    }

    apply( definition?: string | Record<string, any> ): this
    {
        if ( definition )
        {
            if ( typeof definition === 'string' )
            {
                definition = this.parseDefinition( definition );
            }

            Object.assign( this, definition );
        }

        return this;
    }

    inherit(): Style
    {
        const inheritedStyle: Record<string, string> = { ...DEFAULT_PROPERTIES };

        for ( const property in this )
        {
            this.isInherited( property ) && ( inheritedStyle[property] = this[property] );
        }

        return new Style( inheritedStyle );
    }

    get( property: string ): string | undefined
    {
        return this.hasOwnProperty( property ) ? this[property] : undefined;
    }

    compute( ...properties: string[] ): number
    {
        return properties.reduce( ( sum, property ) =>
        {
            let value = 0;

            if ( this.hasOwnProperty( property ) )
            {
                try
                {
                    const match = this[property].match( /^(?<number>-?[0-9,.]+)(?<unit>.*)$/ );
                    if ( match?.groups )
                    {
                        let { number, unit } = match.groups as { number: string, unit: Unit };

                        const numValue = parseFloat( number );

                        switch ( unit )
                        {
                            case Unit.PERCENT   : value = 0; break;
                            case Unit.PT        : value = numValue; break;
                            case Unit.PX        : value = numValue / PT_to_PX; break;
                            case Unit.MM        : value = numValue / PT_to_MM; break;
                            case Unit.CM        : value = (10 * numValue) / PT_to_MM; break;
                            case Unit.EM        : value = numValue * this.compute( 'fontSize' ); break;
                            default             : value = numValue; break;
                        }
                    }
                }
                catch ( e ) { console.error( `Error computing property ${property}:`, e ); }
            }

            return sum + value;
        }, 0 );
    }

    private isInherited( property: string ): boolean
    {
        return INHERITED_PROPERTIES.some( p => property.startsWith( p ) );
    }

    private parseDefinition( def: string ): Record<string, string>
    {
        const properties = def
            .split( /;/ )
            .map( v => v.trim() )
            .map( v => v.match( /(?<name>[a-z-]+)\s*:\s*(?<value>.*)/ )?.groups )
            .filter( p => !!p ) as Array<{ name: string, value: string }>;

        let definition: Record<string, string> = {};

        for ( const property of properties )
        {
            const normalizedName = this.normalizeProperty( property.name );
            const disassembled = this.disassembleStyles( normalizedName, property.value );
            if ( disassembled )
            {
                Object.assign( definition, disassembled );
            } else
            {
                definition[normalizedName] = property.value;
            }
        }

        return definition;
    }

    private normalizeProperty( property: string ): string
    {
        return property.replace( /-(.)/g, ( _, c ) => c.toUpperCase() );
    }

    private disassembleStyles( prop: string, value: string ): Record<string, any> | null
    {
        switch ( prop )
        {
            case 'borderTop':
            case 'borderLeft':
            case 'borderBottom':
            case 'borderRight':
                return this.borderDisassemble( prop, value );
            case 'border':
                return [ 'borderTop', 'borderLeft', 'borderBottom', 'borderRight' ].reduce( ( prev, curr ) =>
                {
                    return { ...prev, ...this.borderDisassemble( curr, value ) };
                }, {} );
            case 'padding':
            case 'margin':
                return this.spaceBetweenDisassemble( prop, value );
            default:
                return null;
        }
    }

    private borderDisassemble( prop: string, value: string ): Record<string, string>
    {
        const [ width, style, color ] = value.split( ' ' );
        return {
            [`${prop}Width`]: width,
            [`${prop}Style`]: style,
            [`${prop}Color`]: color,
        };
    }

    private spaceBetweenDisassemble( prop: string, value: string ): Record<string, string>
    {
        const [ top, right, bottom, left ] = value.split( ' ' );
        return {
            [`${prop}Top`]: top,
            [`${prop}Right`]: right ?? top,
            [`${prop}Bottom`]: bottom ?? top,
            [`${prop}Left`]: left ?? right ?? top,
        };
    }
}