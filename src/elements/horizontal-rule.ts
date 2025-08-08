import { LiqdPDFDocument } from "../pdf";
import Style from "../style";
import { Element } from ".";

export class HorizontalRule extends Element
{
    constructor( document: LiqdPDFDocument, style: Style, width: number, height: number | undefined )
    {
        super( document, style, width, height );
    }

    get contentHeight()
    {
        return 1;
    }

    async render( x: number, y: number )
    {
        super.render( x, y );

        this.document.moveTo( x, y )
            .lineWidth( 0.5 )
            .lineTo( x + this.width, y )
            .stroke();
    }
}