"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
const pip_services_commons_node_5 = require("pip-services-commons-node");
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_components_node_2 = require("pip-services-components-node");
const pip_services_components_node_3 = require("pip-services-components-node");
class SenecaService {
    constructor() {
        this._opened = false;
        this._dependencyResolver = new pip_services_commons_node_5.DependencyResolver(SenecaService._defaultConfig);
        this._connectionResolver = new pip_services_components_node_1.ConnectionResolver();
        this._logger = new pip_services_components_node_2.CompositeLogger();
        this._counters = new pip_services_components_node_3.CompositeCounters();
    }
    configure(config) {
        config = config.setDefaults(SenecaService._defaultConfig);
        this._connectionResolver.configure(config);
        this._dependencyResolver.configure(config);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._dependencyResolver.setReferences(references);
        let senecaInstance = this._dependencyResolver.getOneRequired('seneca');
        senecaInstance.setReferences(references);
        this._seneca = senecaInstance.getInstance();
        this.register();
    }
    instrument(correlationId, name) {
        this._logger.trace(correlationId, "Executing %s method", name);
        return this._counters.beginTiming(name + ".exec_time");
    }
    isOpened() {
        return this._opened;
    }
    getConnection(correlationId, callback) {
        this._connectionResolver.resolve(correlationId, (err, connection) => {
            if (err) {
                callback(err, null);
                return;
            }
            // Check for connection
            if (connection == null) {
                err = new pip_services_commons_node_3.ConfigException(correlationId, "NO_CONNECTION", "Connection for Seneca service is not defined");
            }
            else {
                // Check for type
                let protocol = connection.getProtocol("none");
                if (protocol == 'none') {
                    // Skip futher checks
                    // } else if (protocol != 'http' && protocol != 'https' && protocol != 'web') {
                    //     err = new ConfigException(
                    //         correlationId, "WRONG_PROTOCOL", "Protocol is not supported by Seneca connection")
                    //         .withDetails("protocol", protocol);
                    //     // Check for host
                }
                else if (connection.getHost() == null) {
                    err = new pip_services_commons_node_3.ConfigException(correlationId, "NO_HOST", "No host is configured in REST connection");
                    // Check for port
                }
                else if (connection.getPort() == 0) {
                    err = new pip_services_commons_node_3.ConfigException(correlationId, "NO_PORT", "No port is configured in REST connection");
                }
            }
            callback(err, connection);
        });
    }
    open(correlationId, callback) {
        if (this.isOpened()) {
            if (callback)
                callback(null);
            return;
        }
        this.getConnection(correlationId, (err, connection) => {
            if (err) {
                if (callback)
                    callback(err);
                return;
            }
            this._seneca.ready((err) => {
                if (err) {
                    if (callback)
                        callback(err);
                    return;
                }
                if (connection.getProtocol('none') == 'none') {
                    this._opened = true;
                    this._logger.debug(correlationId, "Seneca service started locally");
                }
                else {
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
                        this._seneca.listen(transport);
                        this._opened = true;
                        this._logger.debug(correlationId, "Seneca service started listening at %s", connection.getUri());
                    }
                    catch (ex) {
                        err = ex;
                    }
                }
                // This line causes seneca plugins to hang
                //if (callback) callback(err);
            });
        });
        if (callback)
            callback(null);
    }
    close(correlationId, callback) {
        // Todo: close listening?
        this._opened = false;
        if (callback)
            callback();
    }
    registerAction(role, cmd, schema, action) {
        if (role == '')
            throw new pip_services_commons_node_2.UnknownException(null, 'NO_ROLE', 'Missing Seneca pattern role');
        if (cmd == '')
            throw new pip_services_commons_node_2.UnknownException(null, 'NO_COMMAND', 'Missing Seneca pattern cmd');
        if (action == null)
            throw new pip_services_commons_node_2.UnknownException(null, 'NO_ACTION', 'Missing Seneca action');
        if (!_.isFunction(action))
            throw new pip_services_commons_node_2.UnknownException(null, 'ACTION_NOT_FUNCTION', 'Seneca action is not a function');
        // Define command pattern
        let pattern = {
            role: role,
            cmd: cmd,
            correlation_id: { type$: 'string' }
        };
        // Remember verification schema
        let validationSchema = null;
        if (schema instanceof pip_services_commons_node_4.Schema)
            validationSchema = schema;
        else if (_.isObject(schema))
            pattern = _.defaults(pattern, schema);
        // Hack!!! Wrapping action to preserve prototyping context
        let actionCurl = (params, callback) => {
            // Perform validation
            if (validationSchema != null) {
                let correlationId = params.correlaton_id;
                let err = validationSchema.validateAndReturnException(correlationId, params, false);
                if (err != null) {
                    callback(err, null);
                    return;
                }
            }
            // Todo: perform verification?
            action.call(this, params, callback);
        };
        this._seneca.add(pattern, actionCurl);
    }
}
SenecaService._defaultConfig = pip_services_commons_node_1.ConfigParams.fromTuples("dependencies.seneca", "pip-services-seneca:seneca:instance:*:*", "connection.protocol", "none", "connection.host", "0.0.0.0", "connection.port", 3000, "options.connect_timeout", 30000);
exports.SenecaService = SenecaService;
//# sourceMappingURL=SenecaService.js.map