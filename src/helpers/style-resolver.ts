import { StyleSheet } from "../document";

export type NodePath = {
    tag: string;
    ids?: string[];
    classes?: string[];
    index?: number;
    total?: number;
};

export function getMatchingStyle(
    paths: NodePath[],
    styles: StyleSheet
): string
{
    const matched: string[] = [];

    for ( const { selector, rules } of styles )
    {
        if ( matchesSelector( paths, selector ) )
        {
            matched.push( rules.trim() );
        }
    }

    return matched.join( ' ' );
}

function matchesSelector( paths: NodePath[], selector: string ): boolean
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
                return pos === paths.length - 1;
            }
        }

        return false;
    }

     const res = matchFrom( 0, 0 );

    return res;
}

function nthChildMatch( index: number | undefined, expr: string ): boolean
{
    if ( index === undefined ) return false;

    expr = expr.trim().toLowerCase();
    if ( expr === 'even' )
    {
        return index % 2 === 0;
    }
    if ( expr === 'odd' )
    {
        return index % 2 === 1;
    }

    const regex = /^([+-]?\d*)n([+-]\d+)?$/;
    const match = expr.match( regex );

    if ( match )
    {
        let a = match[1];
        let b = match[2];

        if ( a === '' || a === '+' ) a = '1';
        else if ( a === '-' ) a = '-1';

        const aNum = parseInt( a, 10 );
        const bNum = b ? parseInt( b, 10 ) : 0;

        if ( aNum === 0 )
        {
            return index === bNum;
        }

        const diff = index - bNum;
        if ( diff < 0 ) return false;
        return diff % aNum === 0;
    }

    const num = parseInt( expr, 10 );
    if ( !isNaN( num ) )
    {
        return index === num;
    }

    return false;
}

function matchSimple( node: NodePath | undefined, simpleSelector: string ): boolean
{
    if ( !node ) return false;

    const notMatches = [ ...simpleSelector.matchAll( /:not\(([^)]+)\)/g ) ].map( m => m[1] );
    simpleSelector = simpleSelector.replace( /:not\([^)]+\)/g, '' );

    if ( /:first-child/.test( simpleSelector ) )
    {
        if ( node.index !== 1 ) return false;
        simpleSelector = simpleSelector.replace( /:first-child/g, '' );
    }

    if ( /:last-child/.test( simpleSelector ) )
    {
        if ( node.index !== node.total ) return false;
        simpleSelector = simpleSelector.replace( /:last-child/g, '' );
    }

    const nthChildMatches = [ ...simpleSelector.matchAll( /:nth-child\(([^)]+)\)/g ) ].map( m => m[1] );
    simpleSelector = simpleSelector.replace( /:nth-child\([^)]+\)/g, '' );

    const tagMatch = simpleSelector.match( /^[a-zA-Z][a-zA-Z0-9_-]*/ );
    if ( tagMatch && tagMatch[0] !== node.tag ) return false;

    const ids = [ ...simpleSelector.matchAll( /#([a-zA-Z0-9_-]+)/g ) ].map( m => m[1] );
    if ( ids.length && !ids.every( id => (node.ids ?? []).includes( id ) ) ) return false;

    const classes = [ ...simpleSelector.matchAll( /\.([a-zA-Z0-9_-]+)/g ) ].map( m => m[1] );
    if ( classes.length && !classes.every( c => (node.classes ?? []).includes( c ) ) ) return false;

    for ( const expr of nthChildMatches )
    {
        if ( !nthChildMatch( node.index, expr ) ) return false;
    }

    for ( const notSel of notMatches )
    {
        if ( matchSimple( node, notSel ) )
        {
            return false;
        }
    }

    return true;
}
