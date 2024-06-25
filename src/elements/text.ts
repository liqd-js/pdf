import Element, { ElementProps } from './abstract';

type Line =
{
    words       : string[],
    wordSpacing : number
}

export default class Text extends Element
{
    //private lines: Line;

    constructor({ element, parent, renderer }: ElementProps )
    {
        super({ element, parent, renderer });

        //console.log( element.children );

        const text = element.children![0] as string;

        let y = 120, words = text.trim().split(/[\s\n]+/);
        let space_width = renderer.textWidth( ' ' );

        const WIDTH = 500;

        for( let i = 0; i < words.length; )
        {
            let width = 0, line = '';

            do
            {
                let word_width = renderer.textWidth( words[i] );

                if( width + word_width + ( line ? space_width : 0 ) < WIDTH )
                {
                    line += ( line ? ' ' : '' ) + words[i];
                    width += word_width + ( line ? space_width : 0 );
                }
                else{ break }
            }
            while( ++i < words.length );

            //console.log( width );

            const line_words = line.split(' ');
            const space = ( WIDTH - width ) / ( line_words.length - 1 );
            let offset = 0;

            for( let j = 0; j < line_words.length; ++j )
            {
                renderer.text( line_words[j] + ' ', { x: 50 + offset, y });
                offset += renderer.textWidth( line_words[j] ) + space_width + space;
            }

            y += 15;

            if( y > 700 )
            {
                y = 120;

                renderer.addPageTMP();
            }
        }

        //console.log( renderer.textWidth( element.children![0] as string ) );
    }

    /*

    public reflow( width: number )
    {
        const text = element.children![0] as string;

        for( let i = 0; i < words.length; )
        {
            let width = 0, line = '';

            do
            {
                let word_width = renderer.textWidth( words[i] );

                if( width + word_width + ( line ? space_width : 0 ) < WIDTH )
                {
                    line += ( line ? ' ' : '' ) + words[i];
                    width += word_width + ( line ? space_width : 0 );
                }
                else{ break }
            }
            while( ++i < words.length );

            console.log( width );

            const line_words = line.split(' ');
            const space = ( WIDTH - width ) / ( line_words.length - 1 );
            let offset = 0;

            for( let j = 0; j < line_words.length; ++j )
            {
                renderer.text( line_words[j] + ' ', { x: 50 + offset, y });
                offset += renderer.textWidth( line_words[j] ) + space_width + space;
            }

            y += 15;

            if( y > 700 )
            {
                y = 50;

                renderer.document.addPage();
            }
        }
    }
    */

    public compose()
    {
        
    }
}