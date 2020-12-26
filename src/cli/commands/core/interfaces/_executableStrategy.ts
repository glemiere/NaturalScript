export interface IStrategyLine {
    func: Function,
    hash: string,
    args: Array<string>
}

export interface IExecutableStrategy {
    name:string,
    hash:string,
    lines:Array<IStrategyLine>
};