let _ = require('lodash');

import { IOpenable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { Schema } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';
import { ConfigException } from 'pip-services-commons-node';
import { UnknownException } from 'pip-services-commons-node';
import { DependencyResolver } from 'pip-services-commons-node';
import { ConnectionResolver } from 'pip-services-components-node';
import { ConnectionParams } from 'pip-services-components-node';
import { CompositeLogger } from 'pip-services-components-node';
import { CompositeCounters } from 'pip-services-components-node';
import { Timing } from 'pip-services-components-node';

import { SenecaInstance } from './SenecaInstance';

export abstract class SenecaClient implements IOpenable, IConfigurable, IReferenceable {
    private static readonly _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        "dependencies.seneca", "pip-services-seneca:seneca:instance:*:*",
        "connection.protocol", "http",
        "connection.host", "0.0.0.0",
        "connection.port", 3000,
        "options.connect_timeout", 30000
    );

    protected _seneca: any;
    protected _opened: boolean = false;
    protected _schemas: { [id: string]: Schema } = {};

    protected _dependencyResolver: DependencyResolver = new DependencyResolver(SenecaClient._defaultConfig);
    protected _connectionResolver: ConnectionResolver = new ConnectionResolver();
    protected _logger: CompositeLogger = new CompositeLogger();
    protected _counters: CompositeCounters = new CompositeCounters();

    public configure(config: ConfigParams): void {
        config = config.setDefaults(SenecaClient._defaultConfig);
        this._connectionResolver.configure(config);
		this._dependencyResolver.configure(config);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._dependencyResolver.setReferences(references);

        let senecaInstance = this._dependencyResolver.getOneRequired<SenecaInstance>('seneca');
        senecaInstance.setReferences(references);
        this._seneca = senecaInstance.getInstance();
    }

    protected instrument(correlationId: string, name: string): Timing {
        this._logger.trace(correlationId, "Executing %s method", name);
        return this._counters.beginTiming(name + ".exec_time");
    }

    public isOpen(): boolean {
        return this._opened;
    }

    protected getConnection(correlationId: string, callback: (err: any, result: ConnectionParams) => void): void {
        this._connectionResolver.resolve(correlationId, (err: any, connection: ConnectionParams) => {
            if (err) {
                callback(err, null);
                return;
            }

            // Check for connection
            if (connection == null) {
                err = new ConfigException(
                    correlationId, "NO_CONNECTION", "Connection for Seneca service is not defined");
            } else {
                // Check for type
                let protocol: string = connection.getProtocol("none");
                if (protocol == 'none') {
                    // Skip futher checks
                // } else if (protocol != 'http' && protocol != 'https' && protocol != 'web') {
                //     err = new ConfigException(
                //         correlationId, "WRONG_PROTOCOL", "Protocol is not supported by Seneca connection")
                //         .withDetails("protocol", protocol);
                //     // Check for host
                } else if (connection.getHost() == null) {
                    err = new ConfigException(
                        correlationId, "NO_HOST", "No host is configured in REST connection");
                    // Check for port
                } else if (connection.getPort() == 0) {
                    err = new ConfigException(
                        correlationId, "NO_PORT", "No port is configured in REST connection");
                }
            }

            callback(err, connection);
        });
    }

    public open(correlationId: string, callback: (err?: any) => void): void {
        if (this.isOpen()) {
            if (callback) callback();
            return;
        }

        this.getConnection(correlationId, (err: any, connection: ConnectionParams) => {
            if (err) {
                if (callback) callback(err);
                return;
            }

            this._seneca.ready((err) => {
                if (err) {
                    if (callback) callback(err);
                    return;
                }

                if (connection.getProtocol('none') == 'none') {
                    this._opened = true;
                    this._logger.debug(correlationId, "Seneca client connected locally");
                } else {
                    try {
                        let protocol = connection.getProtocol('none');
                        let host = connection.getHost();
                        let port = connection.getPort();
                        let uri = connection.getUri() || protocol + "://" + host + ":" + port + "/";

                        let transport = {
                            type: protocol,
                            host: host,
                            port: port
                        };                    
                        this._seneca.client(transport);

                        this._opened = true;
                        this._logger.debug(correlationId, "Seneca client connected to %s", uri);
                    } catch (ex) {
                        err = ex;
                    }
                }

                // This line causes seneca plugins to hang
                //if (callback) callback(err);
            });
        });

        if (callback) callback(null);
    }

    public close(correlationId: string, callback?: (err?: any) => void): void {
        // Todo: close listening?
        this._opened = false;
        if (callback) callback();
    }

    protected call(role: string, cmd: string, correlationId: string, params: any = {}, 
        callback?: (err: any, result: any) => void): void {

        let err = null;
        if (role == '')
            err =  new UnknownException(null, 'NO_ROLE', 'Missing Seneca pattern role');
        if (cmd == '')
            err = new UnknownException(null, 'NO_COMMAND', 'Missing Seneca pattern cmd');
        if (err) {
            if (callback) callback(err, null);
            else this._logger.error(correlationId, err, 'Failed to call %s:%s', role, cmd);
            return;
        }

        params = _.clone(params);                    
        params.role = role;                                   
        params.cmd = cmd;
                        
        correlationId = correlationId || IdGenerator.nextShort();
        params.correlation_id = correlationId;

        this._seneca.act(params, callback);
    }    

}