import fs from "fs";
import fontkit from "fontkit";
import path from "node:path";
import * as os from "node:os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export type FontInfo = {
    path: string;
    familyName: string;
    postscriptName: string;
    fullName: string;
    weight: number;
    italic: boolean;
}
export type RequiredFont = { family: string, italic?: boolean };

export default class Font
{
    static fonts: FontInfo[] = [];

    /**
     * Load fonts from specified paths. Generates variable fonts if needed.
     * @param paths - paths to directories or font files
     * @param requiredFonts - if italic is undefined, both italic and non-italic will be loaded
     */
    static async setupFonts( paths: string[], requiredFonts: RequiredFont[] ): Promise<FontInfo[] >
    {
        const files = Font.collectFiles( paths );
        const promises: Promise<any>[] = [];

        for ( const file of files )
        {
            if ( !file.toLowerCase().endsWith('.ttf') && !file.toLowerCase().endsWith('.otf') )
            {
                continue;
            }

            const font: any = fontkit.openSync( file );

            if ( Font.isVariableFont( font ) && font.variationAxes.wght )
            {
                const weight = font.variationAxes.wght;

                for ( let i = weight.min; i <= weight.max; i += 100 )
                {
                    const italic = !!font.fullName.match(/(italic|oblique)/i);
                    if ( Font.isRegistered( font.familyName, i, italic ) || !Font.isNeeded( requiredFonts, font.familyName, italic ) )
                    {
                        continue;
                    }

                    const fontPath = path.join( os.tmpdir(), `${this.clearFontName(font.fullName).replaceAll(/\s+/g, '-')}-${i}.ttf` );
                    Font.fonts.push({
                        path: fontPath,
                        familyName: this.clearFontName(font.familyName),
                        postscriptName: font.postscriptName,
                        fullName: font.fullName,
                        weight: i,
                        italic,
                    });
                    if ( fs.existsSync( fontPath ) )
                    {
                        continue;
                    }

                    // TODO: handle errors - remove from fonts array if generating fails
                    promises.push(execAsync(`fonttools varLib.mutator ${file} wght=${i} -o ${fontPath}`));
                }
                console.log(`Generated ${promises.length} fonts for ${file}`);
            }
            else
            {
                const weight = font['OS/2'].usWeightClass || 400;
                const italic = !!font.fullName.match(/(italic|oblique)/i);
                if ( Font.isRegistered( font.familyName, weight, italic ) || !Font.isNeeded( requiredFonts, font.familyName, italic ) )
                {
                    continue;
                }

                Font.fonts.push({
                    path: file,
                    familyName: this.clearFontName(font.familyName),
                    postscriptName: font.postscriptName,
                    fullName: font.fullName,
                    weight,
                    italic,
                })
            }
        }

        await Promise.all( promises );

        return Font.fonts;
    }

    /**
     * Get the best matching font for the specified family, weight and italic.
     * @param family - comma or semicolon separated list of font family names (priority order)
     * @param weight
     * @param italic
     */
    static getFont( family: string, weight: number | string, italic: boolean ): FontInfo | null
    {
        weight = typeof weight === "string" ? Font.weightNameToNumber( weight ) : weight;

        if ( !Font.fonts.length )
        {
            throw new Error( "Font list is not initialized." );
        }

        const alternatives = Font.parseFontFamily( family );

        for ( const alt of alternatives )
        {
            let candidates = Font.fonts.filter( f => f.familyName === alt );

            if ( !candidates.length )
            {
                continue;
            }

            let exact = candidates.filter( f => f.italic === italic );
            if ( exact.length )
            {
                candidates = exact;
            }

            candidates.sort(
                ( a, b ) =>
                    Math.abs( a.weight - Number( weight ) ) - Math.abs( b.weight - Number( weight ) )
            );

            return candidates[0];
        }

        return null;
    }

    /**
     * Parse font family string into array of family names.
     * @param family
     */
    static parseFontFamily( family: string ): string[]
    {
        return family.split( ',' ).map( f => f.trim().replace( /^['"]|['"]$/g, '' ));
    }

    private static isRegistered( fontFamily: string, weight: number, italic: boolean ): boolean
    {
        return Font.fonts.some( f => Font.clearFontName(f.familyName).toLowerCase() === Font.clearFontName(fontFamily).toLowerCase() && f.weight === weight && f.italic === italic );
    }

    private static isNeeded( requiredFonts: RequiredFont[], fontFamily: string, italic: boolean ): boolean
    {
        return requiredFonts.some( f => Font.clearFontName(f.family).toLowerCase() === Font.clearFontName(fontFamily).toLowerCase() && (f.italic === undefined || f.italic === italic) );
    }

    private static weightNameToNumber( weight: string ): number
    {
        switch ( weight.toLowerCase() )
        {
            case "thin": return 100;
            case "extralight":
            case "ultralight": return 200;
            case "light": return 300;
            case "normal":
            case "regular": return 400;
            case "medium": return 500;
            case "semibold":
            case "demibold": return 600;
            case "bold": return 700;
            case "extrabold":
            case "ultrabold": return 800;
            case "black":
            case "heavy": return 900;
            default: return 400;
        }
    }

    private static collectFiles( paths: string[] ): string[]
    {
        const files: string[] = [];

        for ( const p of paths )
        {
            const stats = fs.statSync( p );

            if ( stats.isFile() && (p.toLowerCase().endsWith( ".ttf" ) || p.toLowerCase().endsWith( ".otf" )) )
            {
                files.push( p );
            }
            else if ( stats.isDirectory() )
            {
                const dirFiles = fs.readdirSync( p );
                for ( const file of dirFiles )
                {
                    if ( !file.toLowerCase().endsWith( ".ttf" ) && !file.toLowerCase().endsWith( ".otf" ) ) { continue; }
                    files.push( path.join( p, file ) );
                }
            }
        }

        return files;
    }

    private static clearFontName(name: string) {
        return name
            .replaceAll(/(regular|bold|light|medium|semibold|thin|black|condensed)/gi, '')
            .replaceAll(/\s+/g, ' ')
            .trim();
    }

    private static isVariableFont( font: any ): boolean
    {
        return font.variationAxes && Object.keys(font.variationAxes).length > 0;
    }
}