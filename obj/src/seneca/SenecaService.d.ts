import { IOpenable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { DependencyResolver } from 'pip-services-commons-node';
import { ConnectionParams } from 'pip-services-components-node';
import { ConnectionResolver } from 'pip-services-components-node';
import { CompositeLogger } from 'pip-services-components-node';
import { CompositeCounters } from 'pip-services-components-node';
import { Timing } from 'pip-services-components-node';
export declare abstract class SenecaService implements IOpenable, IConfigurable, IReferenceable {
    private static readonly _defaultConfig;
    protected _seneca: any;
    protected _opened: boolean;
    protected transport: any;
    protected _dependencyResolver: DependencyResolver;
    protected _connectionResolver: ConnectionResolver;
    protected _logger: CompositeLogger;
    protected _counters: CompositeCounters;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    protected instrument(correlationId: string, name: string): Timing;
    isOpened(): boolean;
    protected getConnection(correlationId: string, callback: (err: any, result: ConnectionParams) => void): void;
    open(correlationId: string, callback: (err?: any) => void): void;
    close(correlationId: string, callback?: (err?: any) => void): void;
    protected abstract register(): void;
    protected registerAction(role: string, cmd: string, schema: any, action: (params: any, callback: (err: any, result: any) => void) => void): void;
}
