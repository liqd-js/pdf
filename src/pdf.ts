import PDFRenderer from "./core/renderer";

export default class PDF
{
    static async render( template: string, scope: object )
    {
        const renderer = new PDFRenderer( template, scope );
    }
}