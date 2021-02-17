'use strict';

const Template = require('@liqd-js/template');

module.exports = class PDF
{
    #template; #templates = {};

    constructor( content, options )
    {
        this.#template = new Template({ directories: [] });
        this.#templates.content = this.#template.compile( content );
    }

    render( data )
    {
        return this.#template.render( this.#templates.content, { props: data });
    }
}