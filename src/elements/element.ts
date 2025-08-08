import { LiqdPDFDocument } from "../pdf";
import Style from "../style";

export abstract class Element
{
    readonly #document: LiqdPDFDocument;
    readonly #style: Style;
    #width: number;
    #height: number;

    constructor( document: LiqdPDFDocument, style: Style, width: number, height?: number )
    {
        this.#document = document;
        this.#style = new Style( style );
        this.#width = ( this.#style.compute( 'width' ) || width ) - this.style.compute( 'marginLeft', 'marginRight' );
        this.#height = this.#style.compute( 'height' ) || height || 0; // TODO ak mam napevno definovanu sirku tak inner pocitat bez marginov ??
    }

    get document(){ return this.#document; }
    get style(){ return this.#style; }

    get width(){ return this.#width }
    get height(){ if( !this.#height ){ this.resize( this.outerWidth, undefined )} return this.#height }

    get outerWidth(){ return this.width + this.style.compute( 'marginLeft', 'marginRight' )}
    get outerHeight(){ return this.height + this.style.compute( 'marginTop', 'marginBottom' )}

    get innerWidth(){ return this.width - this.style.compute( 'borderLeftWidth', 'borderRightWidth', 'paddingLeft', 'paddingRight' )}
    get innerHeight(){ return this.height - this.style.compute( 'borderTopWidth', 'borderBottomWidth', 'paddingTop', 'paddingBottom' )}

    outerX( x: number ){ return x + this.style.compute( 'marginLeft' )}
    outerY( y: number ){ return y + this.style.compute( 'marginTop' )}

    innerX( x: number ){ return x + this.style.compute( 'marginLeft', 'borderLeftWidth', 'paddingLeft' )}
    innerY( y: number ){ return y + this.style.compute( 'marginTop', 'borderTopWidth', 'paddingTop' )}

    resize( width: number, height?: number )
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


    abstract get contentHeight(): number;

    render( x: number, y: number )
    {
        console.log( this.constructor.name, { x, y });

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
