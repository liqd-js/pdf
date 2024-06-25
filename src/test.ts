import * as fs from 'fs';
import PDF from './pdf';

//PDF.render( fs.readFileSync( __dirname + '/../test/test.html', 'utf8' ), {} );
PDF.render( fs.readFileSync( __dirname + '/../test/ts/blank.html', 'utf8' ), {} );