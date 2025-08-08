//@ts-nocheck

import { LiqdPDFDocument } from "../pdf";
import Style from "../style";
import { Block, Element } from ".";
import { NodeText } from "../document";

export type GridElement = {
    type: string,
    tag: string,
    style: Style,
    row: number,
    rows: number,
    columns: number,
    elements: [
        {
            type: 'text',
            style: Style,
            strings: NodeText[]     // todo: check
        },
        {
            type: 'block'
            tag: 'img'
            style: Style
            elements: GridElement[]
            attributes: {
                src: string
                style: string
            }
        },
        {
            type: 'grid',
            tag: 'td',
        },
        {
            type: 'text',
            style: Style,
            strings: NodeText[]
        }
    ]
}

export class Grid extends Element
{
    private readonly grid = [];
    private readonly options = {};

    constructor( document: LiqdPDFDocument, style: Style, width: number, height: number | undefined, elements, options )
    {
        super( document, style, width, height );

        elements.forEach( n =>
        {
            if( n.type === 'block' )
            {
                //let block = new Block( document, n.style, this.innerWidth, n.elements );

                this.push( n, n.row, n.rows, n.columns );
            }
            else
            {
                throw 'Invalid element';
            }
        });
        this.options = options;
        this.reflow();

        //console.log( require('util').inspect( this.grid, { color: true, depth: 3 }));

        //process.exit();
    }

    private push( block, row: number, rows: number, columns: number )
    {
        //console.log({ row, rows, columns });

        while( row >= this.grid.length )
        {
            this.grid.push({ height: 0, cells: []});
        }

        let column;

        for( let i = 0; i < this.grid[row].cells.length; ++i )
        {
            //console.log( 'Hladame ' + row + ' ' + i );

            if( this.grid[row].cells[i] === undefined ) // TODO validita ci je dost columns dostupnych
            {
                //console.log( 'Nasli sme ' + i );

                column = i; break;
            }
        }

        if( column === undefined )
        {
            column = this.grid[row].cells.length;
            this.grid[row].cells.push( undefined );
        }

        this.grid[row].cells[column] = { block, rows, columns };

        for( let c = 1; c < columns; ++c )
        {
            this.grid[row].cells[column + c] = { row, column };
        }

        for( let r = 1; r < rows; ++r )
        {
            if( !this.grid[row + r] )
            {
                this.grid[row + r] = { height: 0, cells: []};
            }

            for( let c = 0; c < columns; ++c )
            {
                this.grid[row + r].cells[column + c] = { row, column };
            }
        }
    }

    private reflow()
    {
        let rows = this.grid.length, columns = Math.max( ...this.grid.map( r => r.cells.length ));

        for( let row of this.grid )
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

                    row.cells[i].block = ( block = new Block( this.document, block.style, width, undefined, block.elements, this.options ));

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
        return this.grid.reduce(( h, r ) => h += r.height, 0 );
    }

    render( x: number, y: number )
    {
        super.render( x, y );

        x = this.innerX( x );
        y = this.innerY( y );

        let caretX, caretY = 0;

        let width = this.innerWidth, columns = Math.max( ...this.grid.map( r => r.cells.length ));

        for( let row of this.grid )
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
                    //console.log('ZDE', i, row.cells[i], this.grid[row.cells[i].row].cells[row.cells[i].column]);

                    caretX += this.grid[row.cells[i].row].cells[row.cells[i].column].block.outerWidth;
                }
            }

            caretY += row.height;
        }
    }
}