class Element
{
    #document; #style; #width; #height; #innerWidth; #innerHeight;

    constructor( document, style, width, height )
    {
        this.#document = document;

        this.#style = style;
        this.#width = this.style.compute( 'width' ) || width;
        this.#height = this.style.compute( 'height' ) || height; // TODO ak mam napevno definovanu sirku tak inner pocitat bez marginov ??
    }

    get document(){ return this.#document; }
    get style(){ return this.#style; }

    get width(){ return this.#width }
    get height(){ return this.#width }

    get outerWidth(){ return this.#width + this.style.compute( 'marginLeft', 'marginRight' )}
    get outerHeight(){ return this.#height + this.style.compute( 'marginTop', 'marginBottom' )}
    
    get innerWidth(){ return this.#width - this.style.compute( 'borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight' )}
    get innerHeight(){ return this.#height - this.style.compute( 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom' )}

    outerX( x ){ return x + this.style.compute( 'marginLeft' )}
    outerY( y ){ return y + this.style.compute( 'marginTop' )}

    innerX( x ){ return x + this.style.compute( 'marginLeft', 'borderLeftWidth', 'paddingLeft' )}
    innerY( y ){ return y + this.style.compute( 'marginTop', 'borderTopWidth', 'paddingTop' )}

    resize( width, height )
    {
        this.#width = this.style.compute( 'width' ) || width;
        this.#height = this.style.compute( 'height' ) || height;

        if( !this.#height )
        {
            this.#height = this.contentHeight + this.style.compute( 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom' );
        }
    }

    render( x, y )
    {
        //console.log( this.constructor.name, this.style.backgroundColor );

        const width = this.width, height = this.height, style = this.style, outerX = this.outerX( x ), outerY = this.outerY( y );

        if( style.backgroundColor && style.backgroundColor !== 'transparent' )
        {
            //this.document.fillColor( this.style.backgroundColor ).lineCap('butt').rect( this.outerX( x ), this.outerY( y ), this.innerWidth, this.innerHeight ).fill();
            this.document.rect( outerX - 0.025, outerY - 0.025, width + 0.05, height + 0.05 ).fill( style.backgroundColor );
        }

        if( style.compute( 'borderTopWidth' ))
        {
            this.document.rect( outerX - 0.05, outerY - 0.05, width + 0.1, style.compute( 'borderTopWidth' ) + 0.1 ).fill( 'black' ); // TODO
        }

        if( style.compute( 'borderRightWidth' ))
        {
            this.document.rect( outerX - 0.05 + width - style.compute( 'borderRightWidth' ), outerY - 0.05, style.compute( 'borderRightWidth' ) + 0.1, height + 0.1 ).fill( 'black' ); // TODO
        }

        if( style.compute( 'borderBottomWidth' ))
        {
            this.document.rect( outerX - 0.05, outerY - 0.05 + height - style.compute( 'borderBottomWidth' ), width + 0.1, style.compute( 'borderBottomWidth' ) + 0.1 ).fill( 'black' ); // TODO
        }

        if( style.compute( 'borderLeftWidth' ))
        {
            this.document.rect( outerX - 0.05, outerY - 0.05, style.compute( 'borderLeftWidth' ) + 0.1, height + 0.1 ).fill( 'black' ); // TODO
        }
    }
}

const Text = module.exports.Text = class Text extends Element
{
    #strings; #lines;

    constructor( document, style, width, strings )
    {
        super( document, style, width );

        this.#strings = strings;
    }

    #typeset()
    {
        let typeset = [];

        if( !this.#lines )
        {
            this.#lines = [];

            for( let string of this.#strings )
            {
                typeset.push({ style: string.style });

                this.#apply_style( string.style );

                let font = this.document._font, fontSize = this.document._fontSize;

                let height = fontSize * ( font.ascender - font.descender) / 1000;
                let cap = fontSize * ( font.ascender - font.capHeight ) / 1000;
                let baseline = fontSize * font.ascender / 1000;
                
                for( let text of string.text.split(/(\s+|\n)/) )
                {
                    typeset.push({ text, width: this.document.widthOfString( text ), height, cap, baseline });
                }
            }

            if( typeset.length )
            {
                let line = { width: 0, height: 0, cap: 0, baseline: 0, units: []};

                this.#lines.push( line );

                for( let unit of typeset )
                {
                    if( unit.text )
                    {
                        if( unit.text === '\n' )
                        {
                            this.#lines.push( line = { height: unit.height, width: 0, cap: unit.cap, baseline: unit.baseline, units: []});
                        }
                        else if( line.width + unit.width <= this.innerWidth )
                        {
                            line.width += unit.width;

                            if( unit.height > line.height )
                            {
                                line.height = unit.height;
                                line.cap = unit.cap;
                                line.baseline = unit.baseline;
                            }
                            
                            line.units.push( unit );
                        }
                        else if( unit.text.trim() )
                        {
                            this.#lines.push( line = { height: unit.height, width: unit.width, cap: unit.cap, baseline: unit.baseline, units: [ unit ]});
                        }
                    }
                    else{ line.units.push( unit )}
                }
            }

            for( let line of this.#lines )
            {
                for( let i = 0; i < line.units.length; ++i )
                {
                    if( line.units[i].text )
                    {
                        if( line.units[i].text.trim() ){ break }

                        line.units.splice( i--, 1 );
                    }
                }

                for( let i = line.units.length - 1; i >= 0; --i )
                {
                    if( line.units[i].text )
                    {
                        if( line.units[i].text.trim() ){ break }

                        line.units.splice( i, 1 );
                    }
                }

                line.width = line.units.reduce(( w, u ) => w += u.width || 0, 0 );
            }
        }

        return this.#lines;
    }

    get contentHeight()
    {
        return this.#typeset().reduce(( h, l ) => h += l.height, 0 );
    }

    #apply_style( style )
    {
        this.document.font( style.fontWeight === 'bold' ? '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf' : '/System/Library/Fonts/Supplemental/Tahoma.ttf' )
            .fontSize( this.style.compute( 'fontSize' ))
            .fillColor( style.color, 1 )
    }

    render( x, y )
    {
        super.render( x, y );

        const innerWidth = this.innerWidth, innerHeight = this.innerHeight, style = this.style, innerX = this.outerX( x ), innerY = this.outerY( y );
        let caretX, caretY = 0;

        for( let line of this.#typeset() )
        {
            if( innerHeight > caretY + line.height ){ break; } // TODO elipsis na predchadzajuci riadok

            let spacing = style.textAlign === 'justify' ? ( innerWidth - line.width ) / ( line.units.filter( u => u.text ).length - 1 ) : 0;
            caretX = style.textAlign === 'right' ? innerWidth - line.width : ( style.textAlign === 'center' ? ( innerWidth - line.width ) / 2 : 0 );

            for( let unit of line.units )
            {
                if( unit.text )
                {
                    this.document.text( unit.text, innerX + caretX, innerY + caretY + line.baseline - unit.baseline, { lineBreak: false, baseline: 'top' });
                    
                    caretX += unit.width + spacing;
                }
                else if( unit.style )
                {
                    this.#apply_style( unit.style );
                }
            }

            caretY += line.height;
        }
    }
}

const Block = module.exports.Block = class Block extends Element
{
    #elements;

    constructor( document, style, width, elements )
    {
        super( document, style, width );

        this.#elements = elements.map( n => 
        {
            if( n.type === 'block' )
            {
                return new Block( document, n.style, this.innerWidth, n.elements );
            }
            else if( n.type === 'grid' )
            {
                return new Grid( document, n.style, this.innerWidth, n.elements );
            }
            else if( n.type === 'text' )
            {
                return new Text( document, n.style, this.innerWidth, n.strings );
            }
        });
    }

    get contentHeight()
    {
        return this.#elements.reduce(( h, e ) => h += e.height, 0 );
    }

    render( x, y )
    {
        super.render( x, y );

        console.log( 'rendering block', this.#elements );

        x = this.innerX( x );
        y = this.innerY( y );

        for( let element of this.#elements )
        {
            element.render( x, y );
            y += element.height;
        }
    }
}

const Grid = module.exports.Grid = class Grid extends Element
{
    #blocks; #grid = [];

    constructor( document, style, width, elements )
    {
        super( document, style, width );

        this.#blocks = elements.map( n => 
        {
            if( n.type === 'block' )
            {
                //let block = new Block( document, n.style, this.innerWidth, n.elements );

                let block = new Block( document, n.style, this.innerWidth / 3 * n.columns, n.elements ); // TODO

                this.#push( block, n.row, n.rows, n.columns );

                return block;
            }
            else
            {
                throw 'Invalid element';
            }
        });
    }

    #push( block, row, rows, columns )
    {
        console.log({ row, rows, columns });

        while( row >= this.#grid.length )
        {
            this.#grid.push([]);
        }

        let column;

        for( let i = 0; i < this.#grid[row].length; ++i )
        {
            if( this.#grid[row][i] === undefined ) // TODO validita ci je dost columns dostupnych
            {
                column = i; break;
            }
        }

        if( !column )
        {
            column = this.#grid[row].length;
            this.#grid[row].push( undefined );
        }

        this.#grid[row][column] = { block, rows, columns };

        for( let c = 1; c < columns; ++c )
        {
            this.#grid[row][column + c] = { row, column };
        }

        for( let r = 1; r < rows; ++r )
        {
            if( !this.#grid[row + r] )
            {
                this.#grid[row + r] = [];
            }

            for( let c = 0; c < columns; ++c )
            {
                this.#grid[row + r][column + c] = { row, column };
            }
        }
    }

    get contentHeight()
    {
        return Math.max( ...this.#blocks.map( e => e.height )) + 50; // TODO
    }

    render( x, y )
    {
        super.render( x, y );

        console.log( 'rendering grid', this.#blocks );

        x = this.innerX( x );
        y = this.innerY( y );

        let width = this.innerWidth, columns = Math.max( ...this.#grid.map( r => r.length ));

        for( let row of this.#grid )
        {
            let height = Math.max( ...row.map( c => c?.block?.height || 0 ));

            for( let i = 0; i < row.length; ++i )
            {
                if( row[i].block )
                {
                    row[i].block.render( i * width / columns, y );
                }
            }

            y += height;
        }
    }
}