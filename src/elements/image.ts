import { LiqdPDFDocument } from "../pdf";
import Style, { PT_to_PX } from "../style";
import { Element } from ".";
import sizeOf from "image-size";
import fs from "fs";

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
        const dimensions = sizeOf( fs.readFileSync( this.#src ) );
        const ratio = dimensions.width / dimensions.height;
        const h = this.style.compute('height');
        const w = this.style.compute('width');

        if ( !h && w ) { return w / ratio; }
        else if ( !w && h ) { return h; }

        return dimensions.height / PT_to_PX;
    }

    render( x: number, y: number )
    {
        super.render( x, y );

        //let svg =  Load( __dirname + '/../test/' + this.#src );

        if( this.#src.endsWith('.svg') )
        {
            let svg = Load( this.#src );

            let { width, height } = this.calculateDimensions();

            this.document.addSVG( svg, this.innerX(x), this.innerY(y), { width: this.innerHeight * width / height, height: this.innerHeight });

            // TODO mozno tiez fit
        }
        else if( this.#src.endsWith('.jpg') || this.#src.endsWith('.jpeg') || this.#src.endsWith('.png') )
        {
            let { width, height } = this.calculateDimensions();

            if ( this.style.get('objectFit') === 'cover' )
            {
                let align: any = undefined, valign: any = undefined;

                if ( this.style.get('objectPosition') === 'center' )
                {
                    align = 'center';
                    valign = 'center';
                }

                this.document.save()
                    .rect( this.innerX(x), this.innerY(y), width, height )
                    .clip()
                    .image( this.#src, this.innerX(x), this.innerY(y), { height, width, cover: [ width, height ], align, valign })
                    .restore();
            }
            else if ( this.style.get('objectFit') === 'contain' )
            {
                this.document.image( this.#src, this.innerX(x), this.innerY(y), { fit: [ width, height ] });
            }
            else
            {
                this.document.image( this.#src, this.innerX(x), this.innerY(y), { width, height });
            }
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

    calculateDimensions()
    {
        let height, width;
        const dimensions = sizeOf( fs.readFileSync( this.#src ) );
        const ratio = dimensions.width / dimensions.height;
        const h = this.style.compute('height');
        const w = this.style.compute('width');

        if ( !h && w ) { width = w; height = w / ratio; }
        else if ( !w && h ) { width = h * ratio; height = h; }
        else if ( h && w ) { width = w; height = h; }
        else { width = dimensions.width / PT_to_PX; height = dimensions.height / PT_to_PX; }

        return { height, width };
    }
}