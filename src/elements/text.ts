// @ts-nocheck

import Style from "../style";
import { LiqdPDFDocument } from "../pdf";
import { Element } from ".";
import Font from "../font";

type TypeSet = {
    text: string;
    width: number;
    height: number;
    style?: Style;
    cap?: number;
    baseline?: number;
    underline?: boolean;
}
type TextElementString = {
    text: string;
    style?: Style;
}
type TextElementUnit = {
    text: string;
    width?: number;
    height?: number;
    style?: Style;
    cap?: number;
    baseline?: number;
    underline?: boolean;
}
type TextElementLine = { width: number, height: number, cap?: number, baseline?: number, units: TextElementUnit[]}
type TextElementTextOptions = {
    lineBreak?: boolean;
    baseline?: 'top' | 'middle' | 'bottom';
    underline?: boolean;
}


export class Text extends Element
{
    private readonly strings: TextElementString[];
    private lines: TextElementLine[] | undefined;

    constructor( document: LiqdPDFDocument, style: Style, width: number, height: number | undefined, strings: TextElementString[] )
    {
        super( document, style, width, height );

        this.strings = strings;
    }

    private typeset()
    {
        let typeset: TypeSet[] = [];

        if( !this.lines )
        {
            this.lines = [];

            for( let string of this.strings )
            {
                typeset.push({ style: string.style });

                this.apply_style( string.style );

                let font = this.document._font, fontSize = this.document._fontSize;

                let height = fontSize * ( font.ascender - font.descender) / 1000;
                let cap = fontSize * ( font.ascender - ( font.capHeight || font.ascender )) / 1000;
                let baseline = fontSize * font.ascender / 1000;
                let underline = false;

                // lineheight
                {
                    let lineHeight = string.style?.lineHeight ? string.style.compute('lineHeight') : height;
                    if ( lineHeight < height )
                    {
                        lineHeight = height;
                    }

                    // baseline += ( lineHeight - height ) / 2;
                    // cap += ( lineHeight - height ) / 2;
                    // height = lineHeight;
                }
                underline = ( string.style?.textDecoration === 'underline' );


                for( let text of string.text.split(/(\s+|\r*\n\r*)/) )
                {
                    if( text )
                    {
                        const width = this.document.widthOfString( text );
                        typeset.push({ text, width: width, height, cap, baseline, underline });
                    }
                }
            }

            if( typeset.length )
            {
                let line: TextElementLine = { width: 0, height: 0, cap: 0, baseline: 0, units: []};

                this.lines.push( line );

                for( let unit of typeset )
                {
                    if( unit.text )
                    {
                        if( unit.text === '\n' )
                        {
                            this.lines.push( line = { height: 0, width: 0, cap: unit.cap, baseline: unit.baseline, units: []});
                        }
                        else if( line.width + unit.width <= this.innerWidth )
                        {
                            line.width += unit.width;

                            if( unit.height > line.height )
                            {
                                line.height = unit.height;
                                line.cap = unit.cap;
                                line.baseline = unit.baseline;
                            }

                            line.units.push( unit );
                        }
                        else if( unit.text.trim() )
                        {
                            this.lines.push( line = { height: unit.height, width: unit.width, cap: unit.cap, baseline: unit.baseline, units: [ unit ]});
                        }
                    }
                    else{ line.units.push( unit )}
                }
            }

            for( let line of this.lines )
            {
                for( let i = 0; i < line.units.length; ++i )
                {
                    if( line.units[i].text )
                    {
                        //if( line.units[i].text.trim() ){ break }

                        //line.units.splice( i--, 1 );
                    }
                }

                for( let i = line.units.length - 1; i >= 0; --i )
                {
                    if( line.units[i].text )
                    {
                        // if( line.units[i].text.trim() ){ break }

                        //line.units.splice( i, 1 );
                    }
                }

                line.width = line.units.reduce(( w, u ) => w += u.width || 0, 0 );
            }
        }

        //console.log( 'LINES', require('util').inspect( this.lines, { colors: true, depth: Infinity }));

        return this.lines;
    }

    get contentHeight(): number
    {
        return this.typeset().reduce(( h, l ) => h += l.height, 0 );
    }

    private apply_style( style: Style )
    {
        const font = Font.getFont( style.fontFamily || 'Arial', style.fontWeight, style.fontStyle === 'italic' );

        if ( !font )
        {
            throw new Error( `Font not found: ${style.fontFamily} ${style.fontWeight} ${style.fontStyle}` );
        }

        this.document.font( font?.path )
            //this.document.font( style.fontWeight === 'bold' ? 'F1' : 'F1' )
            .fontSize( style.compute( 'fontSize' ) )
            .fillColor( style.color, 1 )
    }

    render( x: number, y: number )
    {
        super.render( x, y );

        const innerWidth = this.innerWidth, innerHeight = this.innerHeight, style = this.style, innerX = this.innerX( x ), innerY = this.innerY( y );
        let caretX, caretY = 0;

        const lines = this.typeset();
        for( let i = 0; i < lines.length; ++i )
        {
            const line = lines[i];

            if( innerHeight < caretY + line.height - 0.0001 ){ break; } // TODO elipsis na predchadzajuci riadok

            const isLastLine = ( i === lines.length - 1 && style.textAlign === 'justify' );
            isLastLine && ( style.textAlign = 'left' );

            let spacing = style.textAlign === 'justify' ? ( innerWidth - line.width ) / ( line.units.filter( u => u.text ).length - 1 ) : 0;
            caretX = style.textAlign === 'right' ? innerWidth - line.width : ( style.textAlign === 'center' ? ( innerWidth - line.width ) / 2 : 0 );

            for( let unit of line.units )
            {
                const textOptions: TextElementTextOptions = { lineBreak: false, baseline: 'top' };
                if( unit.text )
                {
                    if( unit.underline )
                    {
                        textOptions['lineBreak'] = true;
                        textOptions['underline'] = unit.underline;
                    }
                    this.document.text( unit.text, innerX + caretX, innerY + caretY + (line.baseline || 0) - (unit.baseline || 0), textOptions );
                    caretX += (unit.width || 0) + spacing;
                }
                else if( unit.style )
                {
                    this.apply_style( unit.style );
                }
            }

            caretY += line.height;
        }
    }
}
