import md5 from "crypto-js/md5";

interface ILexic {
    [index:string]: {rule:RegExp, func:Function}
}

class Line {
    public lexic:ILexic;
    public criteriaWordsOnly:RegExp;

    constructor() {
        this.lexic = {};
        this.criteriaWordsOnly = /(\w+)/g;
    }

    public async read(regex: RegExp, callback:Function):Promise<void> {
        const hash:string = this.buildLineHash(regex);

        this.lexic[hash] = {
            rule: regex,
            func: callback
        };
    }

    public buildLineHash(regex: RegExp): string {
        const str = regex.toString().match(this.criteriaWordsOnly).join(" ");
        return md5(str).toString();
    }
}

export default new Line();