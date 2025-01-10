import fs from 'fs';
import PDFDocument from 'pdfkit';

const Parser = require('@liqd-js/parser');
const Template = require('@liqd-js/template');
const PDFParser = new Parser( __dirname + '/../syntax/pdf.syntax' );

const template = new Template({ directories: [ __dirname + '/../syntax' ]});

export default class PDF
{
    static async render()
    {
        const resolved = ( await template.render( 'testik', { props: { title: 'Janko' }})).replaceAll(/[\s\n]*<style>(.|\n)*?(?=<\/style>)<\/style>[\s\n]*/g, ( _: any, style: string ) =>
        {
            return '';
        });

        console.log( resolved );

        const styles = resolved.replace

        const pdf = PDFParser.parse( resolved );

        console.log( pdf );

        const doc = new PDFDocument({ size: pdf.attributes.size, layout: pdf.attributes.layout, margin: 50 });

        doc.pipe( fs.createWriteStream( __dirname + '/../syntax/final.pdf' ));

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        doc.rect(0, 0, pageWidth, pageHeight).fill('red');

        doc.text( 'Hello world!', 100, 100 );

        doc.end();
    }
}

PDF.render()//.then( console.log ).catch( console.error );