export type ElementAttributeValue = string | number | boolean;

export type ParsedElement = 
{
    tag         : string
    attributes  : Record<string, ElementAttributeValue>
    style?      : string
    children?   : ( ParsedElement | string )[]
}

export type ElementProps =
{
    element     : ParsedElement
    parent?     : Element
    renderer?   : any
}

export default class Element
{
    public readonly ready: Promise<void>;

    constructor({ element, parent }: ElementProps )
    {
        this.ready = this.init();
    }

    async init(): Promise<void>{}

    //public get display(){ return 'block'; }

    public get width(): number{ return 0; }
    public get height(): number{ return 0; }

    public get innerWidth(): number{ return 0; }
    public get innerHeight(): number{ return 0; }

    public get outerWidth(): number{ return 0; }
    public get outerHeight(): number{ return 0; }
}