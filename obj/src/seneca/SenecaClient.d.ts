import { IOpenable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { Schema } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { DependencyResolver } from 'pip-services-commons-node';
import { ConnectionResolver } from 'pip-services-components-node';
import { ConnectionParams } from 'pip-services-components-node';
import { CompositeLogger } from 'pip-services-components-node';
import { CompositeCounters } from 'pip-services-components-node';
import { Timing } from 'pip-services-components-node';
export declare abstract class SenecaClient implements IOpenable, IConfigurable, IReferenceable {
    private static readonly _defaultConfig;
    protected _seneca: any;
    protected _opened: boolean;
    protected _schemas: {
        [id: string]: Schema;
    };
    protected _dependencyResolver: DependencyResolver;
    protected _connectionResolver: ConnectionResolver;
    protected _logger: CompositeLogger;
    protected _counters: CompositeCounters;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    protected instrument(correlationId: string, name: string): Timing;
    isOpen(): boolean;
    protected getConnection(correlationId: string, callback: (err: any, result: ConnectionParams) => void): void;
    open(correlationId: string, callback: (err?: any) => void): void;
    close(correlationId: string, callback?: (err?: any) => void): void;
    protected call(role: string, cmd: string, correlationId: string, params?: any, callback?: (err: any, result: any) => void): void;
}
