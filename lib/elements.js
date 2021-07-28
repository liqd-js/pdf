class Element
{
    #document; #style; #width; #height;

    constructor( document, style, width )
    {
        this.#document = document;

        this.#style = style;
        this.#width = width;
    }

    get document(){ return this.#document; }
    get style(){ return this.#style; }

    get width(){ return this.#width; }
    get innerWidth(){ return this.width - parseInt( this.#style?.marginLeft || 0 ) - parseInt( this.#style?.marginRight || 0 ) - parseInt( this.#style?.paddingLeft || 0 ) - parseInt( this.#style?.paddingRight || 0 )}

    get height(){ return this.#height !== undefined ? this.#height : ( this.#height = this.measureHeight())}
    get innerHeight(){ return this.height; }
}

const Text = module.exports.Text = class Text extends Element
{
    #strings; #lines; // TODO stringy zatial nemozu mat margin a padding

    constructor( document, style, width, strings )
    {
        super( document, style, width );

        this.#strings = strings;

        console.log( 'Text', { style, width, strings, height: this.measureHeight() });
    }

    #typeset()
    {
        let typeset = [];

        if( !this.#lines )
        {
            for( let string of this.#strings )
            {
                typeset.push({ style: string.style });

                this.#apply_style( string.style );

                let space_width = this.document.widthOfString( ' ' );

                for( let text of string.text.split(/(\s+|\n)/) )
                {
                    typeset.push({ text, width: this.document.widthOfString( text ), height: this.document.heightOfString( text )});
                }

                //console.log( space_width );
            }
        }

        this.#lines = [];

        if( typeset.length )
        {
            let line = { height: 0, width: 0, units: []};

            this.#lines.push( line );

            for( let unit of typeset )
            {
                if( unit.text )
                {
                    if( line.width + unit.width <= this.innerWidth )
                    {
                        line.width += unit.width;
                        line.height = Math.max( line.height, unit.height );
                        line.units.push( unit );
                    }
                    else if( unit.text.trim() )
                    {
                        this.#lines.push( line = { height: unit.height, width: unit.width, units: [ unit ]});
                    }
                }
                else{ line.units.push( unit )}
            }
        }
        
        console.log( this.#lines );

        let x = 50, y = 50, caret;

        for( let line of this.#lines )
        {
            caret = 0;

            while( line.units[ 0 ].text && !line.units[ 0 ].text.trim() )
            {
                line.units.shift();
            }
            while( line.units[ line.units.length - 1 ].text && !line.units[ line.units.length - 1 ].text.trim() )
            {
                line.units.pop();
            }

            let space = ( this.innerWidth - line.width ) / ( line.units.filter( u => u.text ).length - 1 );

            console.log( space );

            for( let unit of line.units )
            {
                if( unit.text )
                {
                    //this.document.rect( x + caret, y, unit.width, unit.height ).fill("#ddd");
                    //this.document.fill('black');

                    //this.document.text( unit.text, x + caret, y + line.height - unit.height, { underline:true, baseline: 'top' });
                    this.document.text( unit.text, x + caret, y + line.height - unit.height, { underline:true, baseline: 'top', height: unit.height });

                    console.log({ a: this.document.heightOfString( 'a', { baseline: 'top' }), b: this.document.heightOfString( 'a', { baseline: 'alphabetic' }) }); //return;
                    //this.document.text( 'LóRĚM', x + caret, y, { underline:true, baseline: 'top' });

                    caret += unit.width + space;

                    //return;
                }
                else if( unit.style )
                {
                    this.#apply_style( unit.style );
                }
            }

            y += line.height;
        }

        return this.#lines;
    }

    measureHeight()
    {
        this.#typeset();

        this.#apply_style( this.#strings[0].style );

        return this.document.heightOfString( this.#strings[0], { width: this.innerWidth });
    }

    #apply_style( style )
    {
        this.document.font( style.fontWeight === 'bold' ? '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf' : '/System/Library/Fonts/Supplemental/Tahoma.ttf' )
            .fontSize( parseFloat( style.fontSize ))
            .fillColor( style.color, 1 )
    }

    render( document, x, y )
    {

    }
}

const Block = module.exports.Block = class Block extends Element
{
    #nodes;

    constructor( document, style, width, nodes )
    {
        super( document, style, width );

        this.#nodes = nodes.map( n => 
        {
            if( n.type === 'block' )
            {
                return new Block( document, n.style, this.innerWidth, n.nodes );
            }
            else if( n.type === 'text' )
            {
                return new Text( document, n.style, this.innerWidth, n.strings );
            }
        });

        console.log( nodes );
    }
}

module.exports.Grid = class Grid extends Element
{
    #nodes;

    constructor( document, style, width, nodes )
    {
        super( document, style, width );

        this.#nodes = nodes;
    }
}