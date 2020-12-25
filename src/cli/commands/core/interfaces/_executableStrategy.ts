export interface IExecutableStrategy {
    name:string,
    lines:Array<{func: Function, args: Array<string>}>
};