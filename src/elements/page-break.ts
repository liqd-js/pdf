import { Element } from ".";

export class PageBreak extends Element
{
    private x = 0;
    private y = 0;

    constructor( document:any, style:any, width:any, height:any )
    {
        super( document, style, width, height );
    }

    get contentHeight()
    {
        return this.y * -1 + this.x;
    }

    async render( x:number, y:number )
    {
        this.document.addPage();
        this.x = x;
        this.y = y;
        super.render( x, x );
    }
}