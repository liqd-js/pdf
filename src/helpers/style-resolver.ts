import { StyleSheet } from "../document";

type PathNode = {
    tag: string;
    ids?: string[];
    classes?: string[];
};

export function getMatchingStyle( paths: PathNode[], styles: StyleSheet ): string
{
    const matched: string[] = [];

    for ( const style of styles )
    {
        if ( matchesSelector( paths, style.selector ) )
        {
            matched.push( style.rules.trim() );
        }
    }

    return matched.join(' ');
}

function matchesSelector( paths: PathNode[], selector: string ): boolean
{
    const tokens = selector.trim().replace( /\s*>\s*/g, ' > ' ).split( /\s+/ );

    const parsed: { sel: string; comb: ' ' | '>' | null }[] = [];
    for ( let i = 0; i < tokens.length; i++ )
    {
        if ( tokens[i] === '>' ) continue;
        const sel = tokens[i];
        let comb: ' ' | '>' | null = null;
        if ( i + 1 < tokens.length ) comb = tokens[i + 1] === '>' ? '>' : ' ';
        parsed.push( { sel, comb } );
    }

    function matchFrom( startPathIdx: number, selIdx: number ): boolean
    {
        if ( selIdx >= parsed.length ) return true;
        const { sel, comb } = parsed[selIdx];

        for ( let pos = startPathIdx; pos < paths.length; pos++ )
        {
            if ( !matchSimple( paths[pos], sel ) ) continue;

            if ( comb === '>' )
            {
                if ( pos + 1 >= paths.length ) continue;
                if ( !matchSimple( paths[pos + 1], parsed[selIdx + 1].sel ) ) continue;
                if ( matchFrom( pos + 1, selIdx + 1 ) ) return true;
            } else if ( comb === ' ' )
            {
                if ( matchFrom( pos + 1, selIdx + 1 ) ) return true;
            } else if ( comb === null )
            {
                return true;
            }
        }

        return false;
    }

    return matchFrom( 0, 0 );
}

function matchSimple( node: PathNode | undefined, simpleSelector: string ): boolean
{
    if ( !node ) return false;

    const tagMatch = simpleSelector.match( /^[a-zA-Z][a-zA-Z0-9_-]*/ );
    const ids = [ ...simpleSelector.matchAll( /#([a-zA-Z0-9_-]+)/g ) ].map( m => m[1] );
    const classes = [ ...simpleSelector.matchAll( /\.([a-zA-Z0-9_-]+)/g ) ].map( m => m[1] );

    if ( tagMatch && tagMatch[0] !== node.tag ) return false;
    if ( ids.length && !ids.every( id => (node.ids ?? []).includes( id ) ) ) return false;
    if ( classes.length && !classes.every( c => (node.classes ?? []).includes( c ) ) ) return false;

    return true;
}