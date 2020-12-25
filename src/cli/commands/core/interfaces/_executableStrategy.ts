export interface IStrategyLine {
    func: Function,
    args: Array<string>
}

export interface IExecutableStrategy {
    name:string,
    lines:Array<IStrategyLine>
};