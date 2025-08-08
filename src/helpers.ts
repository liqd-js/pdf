export function ValueHash( value: any ): string
{
    if( value === undefined )
    {
        return '';
    }
    else if( value === null )
    {
        return 'null';
    }
    else if( Array.isArray( value ))
    {
        return '[' + value.map( ValueHash ).join(',') + ']';
    }
    else if( typeof  value === 'object' )
    {
        return ObjectHash( value );
    }
    else
    {
        return JSON.stringify( value );
    }
}

export function ObjectHash( obj: any, except: string[] = [])
{
    let hash = [];

    for( let key of Object.keys( obj ).sort())
    {
        if( obj[key] !== undefined && !except.includes( key ))
        {
            hash.push( JSON.stringify(key) + ':' + ValueHash( obj[key] ));
        }
    }
    
    return '{' + hash.join(',') + '}';
}