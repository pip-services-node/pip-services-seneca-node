"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const SenecaService_1 = require("./SenecaService");
/**
 * Abstract service that receives remove calls via Seneca protocol
 * to operations automatically generated for commands defined in ICommandable components.
 * Each command is exposed as a Seneca action with the same name.
 *
 * Commandable services require only 3 lines of code to implement a robust external
 * SenecaHTTP-based remote interface.
 *
 * ### Configuration parameters ###
 *
 * dependencies:
 *   endpoint:              override for HTTP Endpoint dependency
 *   controller:            override for Controller dependency
 * connection(s):
 *   discovery_key:         (optional) a key to retrieve the connection from IDiscovery
 *   protocol:              connection protocol: http or https
 *   host:                  host name or IP address
 *   port:                  port number
 *   uri:                   resource URI or connection string with all parameters in it
 *
 * ### References ###
 *
 * - *:logger:*:*:1.0               (optional) ILogger components to pass log messages
 * - *:counters:*:*:1.0             (optional) ICounters components to pass collected measurements
 * - *:discovery:*:*:1.0            (optional) IDiscovery services to resolve connection
 * - *:endpoint:seneca:*:1.0        (optional) [[SenecaEndpoint]] reference
 *
 * @see [[CommandableSenecaClient]]
 * @see [[RestService]]
 *
 * ### Example ###
 *
 * class MyCommandableSenecaService extends CommandableSenecaService {
 *    public constructor() {
 *       base("mydata");
 *       this._dependencyResolver.put(
 *           "controller",
 *           new Descriptor("mygroup","controller","*","*","1.0")
 *       );
 *    }
 * }
 *
 * let service = new MyCommandableSenecaService();
 * service.configure(ConfigParams.fromTuples(
 *     "connection.protocol", "http",
 *     "connection.host", "localhost",
 *     "connection.port", 8080
 * ));
 * service.setReferences(References.fromTuples(
 *    new Descriptor("mygroup","controller","default","default","1.0"), controller
 * ));
 *
 * service.open("123", (err) => {
 *    console.log("The REST service is running on port 8080");
 * });
 */
class CommandableSenecaService extends SenecaService_1.SenecaService {
    /**
     * Creates a new instance of this service.
     *
     * @param role      a service role (name).
     */
    constructor(role) {
        super();
        this._role = role;
        this._dependencyResolver.put('controller', 'none');
    }
    /**
     * Registers all service actions.
     */
    register() {
        let controller = this._dependencyResolver.getOneRequired('controller');
        this._commandSet = controller.getCommandSet();
        let commands = this._commandSet.getCommands();
        for (let index = 0; index < commands.length; index++) {
            let command = commands[index];
            this.registerAction(this._role, command.getName(), null, (params, callback) => {
                let correlationId = params.correlation_id;
                let args = pip_services_commons_node_1.Parameters.fromValue(params);
                let timing = this.instrument(correlationId, this._role + '.' + command.getName());
                command.execute(correlationId, args, (err, result) => {
                    timing.endTiming();
                    callback(err, result);
                });
            });
        }
    }
}
exports.CommandableSenecaService = CommandableSenecaService;
//# sourceMappingURL=CommandableSenecaService.js.map