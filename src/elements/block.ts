import { LiqdPDFDocument } from "../pdf";
import Style from "../style";
import { Element, Grid, HorizontalRule, List, Image, Text } from ".";

export class Block extends Element
{
    private readonly elements;

    constructor( document: LiqdPDFDocument, style: Style, width: number, height?: number, elements, options?: object )
    {
        super( document, style, width, height );

        this.elements = elements.map( n =>
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
                else if( ['ul', 'ol' ].includes( n.tag ) )
                {
                    return new List( document, n.style, this.innerWidth, undefined, n, options );
                }
                else if( options?.elements?.[ n.tag ] )
                {
                    const CustomElement = options.elements[ n.tag ];

                    return new CustomElement( document, n.style, this.innerWidth, undefined, n, options );
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
        return this.elements.reduce(( h: number, e ) => h += e.height, 0 );
    }

    render( x: number, y: number )
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


        for( let element of this.elements )
        {
            element.render( x, y );
            y += element.outerHeight;
        }
    }
}