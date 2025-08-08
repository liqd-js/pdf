import { LiqdPDFDocument } from "../pdf";
import Style from "../style";
import { Element } from ".";

const Load = ( filename: string ) => require('fs').readFileSync( filename, 'utf8' );

export class Image extends Element
{
    #src

    constructor( document: LiqdPDFDocument, style: Style, width: number, height: number | undefined, src: string )
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

    render( x: number, y: number )
    {
        super.render( x, y );

        //let svg =  Load( __dirname + '/../test/' + this.#src );

        if( this.#src.endsWith('.svg') )
        {
            let svg = Load( this.#src );

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