import path from "path";
import fs from "fs";
import readline from "readline";

export default class ProjectScanner {
    public async getInstructionFiles(): Promise<Array<string>> {
        let jsFilePaths = await this._getFilePaths(path.join(process.cwd(), "./"), ".js", []);
    
        // Excluding this file.
        jsFilePaths = jsFilePaths.filter((fpath) => !fpath.includes(path.join(__dirname, "index.js")));
    
        let stratFiles = await this._filteringFilePathsUsingString(jsFilePaths, "Line.read");
        return stratFiles;
    };

    public async executeInstructionFiles(stratFiles:Array<string>): Promise<void> {
        stratFiles.forEach(async (stratFile) => {
            await require(stratFile);
        });
    };

    public async readStrategyFile(filePath:string) :Promise<{name:string, lines:Array<string>}> {
        const lines = [];
        const fileStream = fs.createReadStream(filePath);
        const rl:any = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
    
        for await (const line of rl)
            lines.push(line.trim());

        const name = lines.shift();

        return {
            name: name,
            lines: lines
        };
    };

    public async findStrategyFiles():Promise<Array<string>> {
        const cmd_args = process.argv.splice(3);
        let stratFiles;

        if (cmd_args.length > 0 && cmd_args[0].includes('.trade'))
            stratFiles = cmd_args.map((filepath) => {
                return path.join(process.cwd(), filepath);
            });
        else if (cmd_args.length === 1 && !cmd_args[0].includes('.trade'))
            stratFiles = await this._getFilePaths(path.join(process.cwd(), cmd_args[0]), ".trade", []);
        else
            stratFiles = await this._getFilePaths(path.join(process.cwd(), "./"), ".trade", []);

        return stratFiles;
    };

    private async _asyncFilter(arr:Array<any>, predicate:any) :Promise<Array<any>> {
        const results = await Promise.all(arr.map(predicate));
        return arr.filter((_v, index) => results[index]);
    };

    private async _getFilePaths(startPath:string, filter:string, filepaths:Array<string>):Promise<Array<string>> {
        if (!fs.existsSync(startPath)) return;

        const files = fs.readdirSync(startPath);
        let i = -1;

        while (++i < files.length) {
            const filepath = path.join(startPath, files[i]);
            const stat = fs.lstatSync(filepath);

            if (stat.isDirectory()) this._getFilePaths(filepath, filter, filepaths);
            else if (filepath.indexOf(filter) >= 0) filepaths.push(filepath);
        }

        return filepaths;
    };

    private async _checkFileForOccurence(filePath:string, string:string) :Promise<boolean> {
        const fileStream = fs.createReadStream(filePath);
    
        const rl:any= readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
    
        for await (const line of rl)
            if (line.includes(string))
                 return true;
        return false;
    };

    private async _filteringFilePathsUsingString(filePaths:Array<string>, string:string) :Promise<Array<string>> {
        const filter = async (filePath:string) => {
            const isFileContainingString = await this._checkFileForOccurence(filePath, string);
            return isFileContainingString;
        };
    
        const filtered = await this._asyncFilter(filePaths, filter);
    
        return filtered;
    };
}