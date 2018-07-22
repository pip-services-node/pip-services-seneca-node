import { IReferences } from 'pip-services-commons-node';
export declare class SenecaPlugin {
    private _name;
    private _seneca;
    private _references;
    private _logger;
    constructor(name: string, seneca: any, references: IReferences);
    readonly name: string;
    private build;
    private open;
    private close;
}
