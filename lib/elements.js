const { triggerAsyncId } = require('async_hooks');

class Element
{
    #document; #style; #width; #height; #innerWidth; #innerHeight;

    constructor( document, style, width, height )
    {
        this.#document = document;

        this.#style = style;
        this.#width = ( this.style.compute( 'width' ) || width ) - this.style.compute( 'marginLeft', 'marginRight' );
        this.#height = this.style.compute( 'height' ) || height; // TODO ak mam napevno definovanu sirku tak inner pocitat bez marginov ??
    }

    get document(){ return this.#document; }
    get style(){ return this.#style; }

    get width(){ return this.#width }
    get height(){ if( !this.#height ){ this.resize( this.outerWidth, undefined )} return this.#height }

    get outerWidth(){ return this.width + this.style.compute( 'marginLeft', 'marginRight' )}
    get outerHeight(){ return this.height + this.style.compute( 'marginTop', 'marginBottom' )}
    
    get innerWidth(){ return this.width - this.style.compute( 'borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight' )}
    get innerHeight(){ return this.height - this.style.compute( 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom' )}

    outerX( x ){ return x + this.style.compute( 'marginLeft' )}
    outerY( y ){ return y + this.style.compute( 'marginTop' )}

    innerX( x ){ return x + this.style.compute( 'marginLeft', 'borderLeftWidth', 'paddingLeft' )}
    innerY( y ){ return y + this.style.compute( 'marginTop', 'borderTopWidth', 'paddingTop' )}

    resize( width, height )
    {
        this.#width = ( this.style.compute( 'width' ) || width ) - this.style.compute( 'marginLeft', 'marginRight' );
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
            this.document.rect( outerX - 0.05, outerY - 0.05, width + 0.1, style.compute( 'borderTopWidth' ) + 0.1 ).fill( style.borderTopColor || 'black' ); // TODO
        }

        if( style.compute( 'borderRightWidth' ))
        {
            this.document.rect( outerX - 0.05 + width - style.compute( 'borderRightWidth' ), outerY - 0.05, style.compute( 'borderRightWidth' ) + 0.1, height + 0.1 ).fill( style.borderRightColor || 'black' ); // TODO
        }

        if( style.compute( 'borderBottomWidth' ))
        {
            this.document.rect( outerX - 0.05, outerY - 0.05 + height - style.compute( 'borderBottomWidth' ), width + 0.1, style.compute( 'borderBottomWidth' ) + 0.1 ).fill( style.borderBottomColor || 'black' ); // TODO
        }

        if( style.compute( 'borderLeftWidth' ))
        {
            this.document.rect( outerX - 0.05, outerY - 0.05, style.compute( 'borderLeftWidth' ) + 0.1, height + 0.1 ).fill( style.borderLeftColor || 'black' ); // TODO
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

                // lineheight
                {
                    let lineHeight = string.style.lineHeight ? string.style.compute('lineHeight') : height;

                    baseline += ( lineHeight - height ) / 2;
                    cap += ( lineHeight - height ) / 2;
                    height = lineHeight;
                }
                
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
        let font;

        switch ( style.fontWeight )
        {
            case '100'          : 
            case 'ultralight'   : font = __dirname + '/../test/fonts/HelveticaNeue-UltraLight.ttf'; break;
            
            case '200'          :
            case 'thin'         : font = __dirname + '/../test/fonts/HelveticaNeue-Light.ttf'; break;

            case '300'          :
            case 'light'        : font = __dirname + '/../test/fonts/HelveticaNeue-Light.ttf'; break;

            case '500'          :
            case 'medium'       : font = __dirname + '/../test/fonts/HelveticaNeue-Medium.ttf'; break;

            case '600'          :
            case '700'          :
            case '800'          :
            case '900'          :
            case 'bold'         : font = __dirname + '/../test/fonts/HelveticaNeue-Bold.ttf'; break;
            
            case '400'          :
            case 'normal'       : 
            case 'regular'      : 
            default             : font = __dirname + '/../test/fonts/HelveticaNeue.ttf';
        }



        //this.document.font( style.fontWeight === 'bold' ? '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf' : '/System/Library/Fonts/Supplemental/Tahoma.ttf' )
        //this.document.font( style.fontWeight === 'bold' ? '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf' : '/System/Library/Fonts/HelveticaNeue.ttcHelveticaNeue-Thin' )
        //this.document.font( '/System/Library/Fonts/HelveticaNeue.ttc', style.fontWeight === 'bold' ? 'HelveticaNeue-Bold' : 'HelveticaNeue-Light' )
        this.document.font( font )
        //this.document.font( style.fontWeight === 'bold' ? 'F1' : 'F1' )
            .fontSize( this.style.compute( 'fontSize' ))
            .fillColor( style.color, 1 )
    }

    render( x, y )
    {
        super.render( x, y );

        const innerWidth = this.innerWidth, innerHeight = this.innerHeight, style = this.style, innerX = this.innerX( x ), innerY = this.innerY( y );
        let caretX, caretY = 0;

        for( let line of this.#typeset() )
        {
            if( innerHeight < caretY + line.height - 0.0001 ){ break; } // TODO elipsis na predchadzajuci riadok

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
                console.log( '** GRID **' );

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

        x = this.innerX( x );
        y = this.innerY( y );

        if( this.style.verticalAlign === 'middle' )
        {
            y += ( this.innerHeight - this.contentHeight ) / 2;
        }
        else if( this.style.verticalAlign === 'bottom' )
        {
            y += this.innerHeight - this.contentHeight;
        }


        for( let element of this.#elements )
        {
            element.render( x, y );
            y += element.outerHeight;
        }
    }
}

const Grid = module.exports.Grid = class Grid extends Element
{
    #grid = [];

    constructor( document, style, width, elements )
    {
        super( document, style, width );

        elements.forEach( n => 
        {
            if( n.type === 'block' )
            {
                //let block = new Block( document, n.style, this.innerWidth, n.elements );

                this.#push( n, n.row, n.rows, n.columns );
            }
            else
            {
                throw 'Invalid element';
            }
        });

        this.#reflow();

        console.log( require('util').inspect( this.#grid, { color: true, depth: 3 }));

        //process.exit();
    }

    #push( block, row, rows, columns )
    {
        while( row >= this.#grid.length )
        {
            this.#grid.push({ height: 0, cells: []});
        }

        let column;

        for( let i = 0; i < this.#grid[row].cells.length; ++i )
        {
            if( this.#grid[row].cells[i] === undefined ) // TODO validita ci je dost columns dostupnych
            {
                column = i; break;
            }
        }

        if( !column )
        {
            column = this.#grid[row].cells.length;
            this.#grid[row].cells.push( undefined );
        }

        this.#grid[row].cells[column] = { block, rows, columns };

        for( let c = 1; c < columns; ++c )
        {
            this.#grid[row].cells[column + c] = { row, column };
        }

        for( let r = 1; r < rows; ++r )
        {
            if( !this.#grid[row + r] )
            {
                this.#grid[row + r] = { height: 0, cells: []};
            }

            for( let c = 0; c < columns; ++c )
            {
                this.#grid[row + r].cells[column + c] = { row, column };
            }
        }
    }

    #reflow()
    {
        let rows = this.#grid.length, columns = Math.max( ...this.#grid.map( r => r.cells.length ));

        for( let row of this.#grid )
        {
            for( let i = 0; i < row.cells.length; ++i )
            {
                if( row.cells[i]?.block )
                {
                    let block = row.cells[i].block;

                    row.cells[i].block = ( block = new Block( this.document, block.style, this.innerWidth / columns * block.columns, block.elements ));

                    row.height = Math.max( block.outerHeight, row.height );
                }
            }

            // TODO rowspan

            row.cells.forEach( c => c.block && c.block.outerHeight !== row.height && c.block.resize( this.innerWidth / columns * c.columns, row.height ));
        }

        //console.log( rows, columns );
    }

    get contentHeight()
    {
        return this.#grid.reduce(( h, r ) => h += r.height, 0 );
    }

    render( x, y )
    {
        super.render( x, y );

        x = this.innerX( x );
        y = this.innerY( y );

        let width = this.innerWidth, columns = Math.max( ...this.#grid.map( r => r.cells.length ));

        for( let row of this.#grid )
        {
            for( let i = 0; i < row.cells.length; ++i )
            {
                if( row.cells[i]?.block )
                {
                    row.cells[i].block.render( x + i * width / columns, y ); // TODO
                }
            }

            y += row.height;
        }
    }
}