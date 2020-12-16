class Line {
    public lexic:Array<any>;

    constructor() {
        this.lexic = new Array();
    }

    public async read(regex: RegExp, callback:Function):Promise<void> {
        this.lexic.push({
            rule: regex,
            func: callback
        });
    }
}

export default new Line();