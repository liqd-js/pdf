import { Block, LiqdPDFDocument } from "../pdf";
import Style from "../style";
import { Element, Text } from ".";

export class List extends Element
{
    #elements; #type; #attributes;
    #space = 0; #gap = 0;
    #fonts = []; #startIndex = 1;
    constructor( document: LiqdPDFDocument, style: Style, width: number, height: number | undefined, element, options )
    {
        super( document, style, width, height );
        const { elements, tag, attributes } = element;

        this.#attributes = attributes;
        this.#type = tag;

        this.#gap = this.document.widthOfString( ' ' );
        this.#space = this.#gap * 8;

        if( this.#type === 'ol' )
        {
            this.#startIndex = parseInt( this.#attributes?.start || 1 );
        }

        this.#elements = elements.map( n =>
        {
            this.#fonts.push( n.elements?.[0]?.style ?? null );
            return new Block( document, n.style, ( n.style.width && n.style.width.endsWith('%') ? this.innerWidth * parseFloat( n.style.width ) / 100 : this.innerWidth ) - this.#space + this.#gap, undefined, n.elements, options );
        });
    }

    get contentHeight()
    {
        return this.#elements.reduce(( h: number, e: number ) => h += e.height, 0 );
    }

    render( x: number, y: number )
    {
        super.render( x, y );

        x = this.innerX( x );
        y = this.innerY( y );

        const sizeCircle = 2.5;
        for( const [ index, element ] of this.#elements.entries() )
        {
            element.render( x + this.#space + this.#gap, y );

            if( this.#type === 'ul' )
            {
                const baseline = this.document.heightOfString( 'T' );
                const gapCircleY = baseline / 2;

                const cX = x + this.#space - ( sizeCircle * 2 );
                const cY = y + gapCircleY;

                this.document.circle( cX, cY, sizeCircle ).fill( 'black' );
            }
            else
            {
                const style = this.#fonts[index];
                style.fontWeight = '500';
                style.textAlign = 'right';

                const label = this.#startIndex + index;//+ ( label >= 0 ? 1 : 0 )
                const strings = [ { text: `${ label  }. `, style: style } ]
                const text = new Text( this.document, style, this.#space, undefined, strings );
                text.render( x, y );
            }

            y += element.outerHeight;
        }

    }
}