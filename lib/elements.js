const Load = filename => require('fs').readFileSync( filename, 'utf8' );

const Element = module.exports.Element = class Element
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
        //console.log( 'RESIZE', this.constructor.name, width, height );

        this.#width = ( this.style.compute( 'width' ) || width ) - this.style.compute( 'marginLeft', 'marginRight' );

        if( height !== undefined )
        {
            this.#height = height - this.style.compute( 'marginTop', 'marginBottom' );
        }
        else
        {
            this.#height = this.contentHeight + this.style.compute( 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom' ); // TODO verify
        }


        /*this.#height = this.style.compute( 'height' ) || height;

        // TODO tuto

        if( !this.#height )
        {
            this.#height = this.contentHeight + this.style.compute( 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom' );
        }*/
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

    constructor( document, style, width, height, strings )
    {
        super( document, style, width, height );

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
                let cap = fontSize * ( font.ascender - ( font.capHeight || font.ascender )) / 1000;
                let baseline = fontSize * font.ascender / 1000;
                let underline = false;

                // lineheight
                {
                    let lineHeight = string.style.lineHeight ? string.style.compute('lineHeight') : height;

                    baseline += ( lineHeight - height ) / 2;
                    cap += ( lineHeight - height ) / 2;
                    height = lineHeight;
                }
                    underline = ( string.style?.textDecoration === 'underline' );

                
                for( let text of string.text.split(/(\s+|\r*\n\r*)/) )
                {
                    if( text )
                    {
                        typeset.push({ text, width: this.document.widthOfString( text ), height, cap, baseline, underline });
                    }
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
                            this.#lines.push( line = { height: 0, width: 0, cap: unit.cap, baseline: unit.baseline, units: []});
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
                        //if( line.units[i].text.trim() ){ break }

                        //line.units.splice( i--, 1 );
                    }
                }

                for( let i = line.units.length - 1; i >= 0; --i )
                {
                    if( line.units[i].text )
                    {
                       // if( line.units[i].text.trim() ){ break }

                        //line.units.splice( i, 1 );
                    }
                }

                line.width = line.units.reduce(( w, u ) => w += u.width || 0, 0 );
            }
        }

        //console.log( 'LINES', require('util').inspect( this.#lines, { colors: true, depth: Infinity }));

        return this.#lines;
    }

    get contentHeight()
    {
        return this.#typeset().reduce(( h, l ) => h += l.height, 0 );
    }

    #apply_style( style )
    {
        let font;

        switch ( style.fontWeight + ( style.fontStyle ? '_'+style.fontStyle : '' ) )
        {
            case '100'                  : 
            case 'ultralight'           : font = __dirname + '/../test/fonts/HelveticaNeue-UltraLight.ttf'; break;
            
            case '100_italic'           : 
            case 'ultralight_italic'    : font = __dirname + '/../test/fonts/HelveticaNeue-UltraLightItalic.ttf'; break;


            case '200'                  :
            case 'thin'                 : font = __dirname + '/../test/fonts/HelveticaNeue-Light.ttf'; break;
            
            case '200_italic'           :
            case 'thin_italic'          : font = __dirname + '/../test/fonts/HelveticaNeue-LightItalic.ttf'; break;


            case '300'                  :
            case 'light'                : font = __dirname + '/../test/fonts/HelveticaNeue-Light.ttf'; break;

            case '300_italic'           :
            case 'light_italic'         : font = __dirname + '/../test/fonts/HelveticaNeue-LightItalic.ttf'; break;


            case '500'                  :
            case 'medium'               : font = __dirname + '/../test/fonts/HelveticaNeue-Medium.ttf'; break;

            case '500_italic'           :
            case 'medium_italic'        : font = __dirname + '/../test/fonts/HelveticaNeue-MediumItalic.ttf'; break;


            case '600'                  :
            case '700'                  :
            case '800'                  :
            case '900'                  :
            case 'bold'                 : font = __dirname + '/../test/fonts/HelveticaNeue-Bold.ttf'; break;

            case '600_italic'           :
            case '700_italic'           :
            case '800_italic'           :
            case '900_italic'           :
            case 'bold_italic'          : font = __dirname + '/../test/fonts/HelveticaNeue-BoldItalic.ttf'; break;


            case '400_italic'           :
            case 'normal_italic'        : 
            case 'regular_italic'       : 
            case 'italic'               : font = __dirname + '/../test/fonts/HelveticaNeue-Italic.ttf';

            case '400'                  :
            case 'normal'               : 
            case 'regular'              :
            default                     : font = __dirname + '/../test/fonts/HelveticaNeue.ttf';
        }

        //font = 'Courier';

        //this.document.font( style.fontWeight === 'bold' ? '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf' : '/System/Library/Fonts/Supplemental/Tahoma.ttf' )
        //this.document.font( style.fontWeight === 'bold' ? '/System/Library/Fonts/Supplemental/Tahoma Bold.ttf' : '/System/Library/Fonts/HelveticaNeue.ttcHelveticaNeue-Thin' )
        //this.document.font( '/System/Library/Fonts/HelveticaNeue.ttc', style.fontWeight === 'bold' ? 'HelveticaNeue-Bold' : 'HelveticaNeue-Light' )

        this.document.font( font )
        //this.document.font( style.fontWeight === 'bold' ? 'F1' : 'F1' )
            .fontSize( style.compute( 'fontSize' ))
            .fillColor( style.color, 1 )
    }

    render( x, y )
    {
        super.render( x, y );

        const innerWidth = this.innerWidth, innerHeight = this.innerHeight, style = this.style, innerX = this.innerX( x ), innerY = this.innerY( y );
        let caretX, caretY = 0;

        const lines = this.#typeset();
        for( let i = 0; i < lines.length; ++i ) 
        {
            const line = lines[i];

            if( innerHeight < caretY + line.height - 0.0001 ){ break; } // TODO elipsis na predchadzajuci riadok

            const isLastLine = ( i === lines.length - 1 && style.textAlign === 'justify' );
            isLastLine && ( style.textAlign = 'left' );

            let spacing = style.textAlign === 'justify' ? ( innerWidth - line.width ) / ( line.units.filter( u => u.text ).length - 1 ) : 0;
            caretX = style.textAlign === 'right' ? innerWidth - line.width : ( style.textAlign === 'center' ? ( innerWidth - line.width ) / 2 : 0 );
            
            for( let unit of line.units )
            {
                const textOptions = { lineBreak: false, baseline: 'top' };
                if( unit.text )
                {
                    if( unit.underline )
                    {
                        textOptions['lineBreak'] = true;
                        textOptions['underline'] = unit.underline;
                    }
                    this.document.text( unit.text, innerX + caretX, innerY + caretY + line.baseline - unit.baseline, textOptions );
                    
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

const HorizontalRule = module.exports.HorizontalRule = class HorizontalRule extends Element
{
    constructor( document, style, width, height )
    {
        super( document, style, width, height );
    }

    get contentHeight()
    {
        return 1;
    }

    async render( x, y )
    {
        super.render( x, y );

        this.document.moveTo( x, y )
            .lineWidth( 0.5 )
            .lineTo( x + this.width, y )
            .stroke(); 
    }
}

const Image = module.exports.Image = class Image extends Element
{
    #src

    constructor( document, style, width, height, src )
    {
        super( document, style, width, height );

        this.#src = src;

        /*

        this.#elements = elements.map( n => 
        {
            if( n.type === 'block' )
            {
                if( n.tag === 'img' )
                {
                    console.log( 'IMAGE' );
                }

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
        });*/
    }

    get contentHeight()
    {
        if( this.#src.includes( 'qr.svg' ))
        {
            return this.innerWidth;
        }

        return 30.600000000765 - 2 * 1.275;
    }

    render( x, y )
    {
        super.render( x, y );

        //let svg =  Load( __dirname + '/../test/' + this.#src );

        if( this.#src.endsWith('.svg') )
        {
            let svg =  Load( this.#src );

            let { width, height } = svg.match( /viewbox="-?[0-9.]+\s+-?[0-9.]+\s+(?<width>-?[0-9.]+)\s+(?<height>-?[0-9.]+)"/i ).groups;

            //console.log( 'IMG', svg, this.innerX(x), this.innerY(y), width, height, this.innerHeight * parseFloat( width ) / parseFloat( height ), this.innerHeight );

            //this.document.rect( this.innerX(x), this.innerY(y), this.innerHeight * parseFloat( width ) / parseFloat( height ), this.innerHeight ).fill( 'red' );

            this.document.addSVG( svg, this.innerX(x), this.innerY(y), { width: this.innerHeight * parseFloat( width ) / parseFloat( height ), height: this.innerHeight });

            // TODO mozno tiez fit
        }
        else if( this.#src.endsWith('.jpg') || this.#src.endsWith('.png') )
        {
            this.document.image( this.#src, this.innerX(x), this.innerY(y), { fit: [ this.innerHeight, this.innerHeight ]});
        }
        else if( this.#src.startsWith('data:') )
        {
            this.document.image( this.#src, this.innerX(x), this.innerY(y), { width:  this.innerWidth, height:  this.innerHeight });
        }

        /*x = this.innerX( x );
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
        }*/
    }
}

const Block = module.exports.Block = class Block extends Element
{
    #elements;

    constructor( document, style, width, height, elements, options )
    {
        super( document, style, width, height );

        this.#elements = elements.map( n => 
        {
            if( n.type === 'block' )
            {
                if( n.tag === 'img' )
                {
                    return new Image( document, n.style, this.innerWidth, undefined, n.attributes.src );
                }
                else if( n.tag === 'hr' )
                {
                    return new HorizontalRule( document, n.style, this.innerWidth, undefined );
                }
                else if( options.elements[ n.tag ] )
                {
                    const CustomElement = options.elements[ n.tag ];

                    return new CustomElement( document, n.style, this.innerWidth, undefined, n );
                }

                return new Block( document, n.style, n.style.width && n.style.width.endsWith('%') ? this.innerWidth * parseFloat( n.style.width ) / 100 : this.innerWidth, undefined, n.elements, options );
            }
            else if( n.type === 'grid' )
            {
                return new Grid( document, n.style, n.style.width && n.style.width.endsWith('%') ? this.innerWidth * parseFloat( n.style.width ) / 100 : this.innerWidth, undefined, n.elements, options );
            }
            else if( n.type === 'text' )
            {
                return new Text( document, n.style, this.innerWidth, undefined, n.strings );
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
    #grid = []; #options = {};

    constructor( document, style, width, height, elements, options )
    {
        super( document, style, width, height );

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
        this.#options = options;
        this.#reflow();

        //console.log( require('util').inspect( this.#grid, { color: true, depth: 3 }));

        //process.exit();
    }

    #push( block, row, rows, columns )
    {
        //console.log({ row, rows, columns });

        while( row >= this.#grid.length )
        {
            this.#grid.push({ height: 0, cells: []});
        }

        let column;

        for( let i = 0; i < this.#grid[row].cells.length; ++i )
        {
            //console.log( 'Hladame ' + row + ' ' + i );

            if( this.#grid[row].cells[i] === undefined ) // TODO validita ci je dost columns dostupnych
            {
                //console.log( 'Nasli sme ' + i );

                column = i; break;
            }
        }

        if( column === undefined )
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
                    let block = row.cells[i].block, width = this.innerWidth / columns * row.cells[i].columns;

                    if( block.style.width && block.style.width.endsWith('%'))
                    {
                        width = this.innerWidth * parseFloat( block.style.width ) / 100;
                    }

                    row.cells[i].block = ( block = new Block( this.document, block.style, width, undefined, block.elements, this.#options ));

                    if( row.cells[i].rows === 1 ) // TODO lepsie
                    {
                        row.height = Math.max( block.outerHeight, row.height );
                    }
                }
            }

            // TODO rowspan

            //console.log( 'ROW reflow', row );

            //row.cells.forEach( c => c.block && c.block.outerHeight !== row.height && c.block.resize( this.innerWidth / columns * c.columns, row.height ));

            row.cells.forEach( c => c.block && c.block.resize( c.block.outerWidth, row.height ));
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

        let caretX, caretY = 0;

        let width = this.innerWidth, columns = Math.max( ...this.#grid.map( r => r.cells.length ));

        for( let row of this.#grid )
        {
            caretX = 0;

            for( let i = 0; i < row.cells.length; ++i )
            {
                if( row.cells[i]?.block )
                {
                    row.cells[i].block.render( x + caretX, y + caretY ); // TODO

                    caretX += row.cells[i].block.outerWidth;
                }
                else if( row.cells[i]?.column === i )
                {
                    //console.log('ZDE', i, row.cells[i], this.#grid[row.cells[i].row].cells[row.cells[i].column]);

                    caretX += this.#grid[row.cells[i].row].cells[row.cells[i].column].block.outerWidth;
                }
            }

            caretY += row.height;
        }
    }
}