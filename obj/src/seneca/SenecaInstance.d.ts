import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
export declare class SenecaInstance implements IReferenceable {
    private _logger;
    private _instance;
    constructor(instance?: any);
    setReferences(references: IReferences): void;
    getInstance(): any;
    setInstance(seneca: any): void;
}
