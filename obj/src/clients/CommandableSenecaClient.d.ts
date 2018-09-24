import { SenecaClient } from './SenecaClient';
/**
 * Abstract client that calls commandable Seneca service.
 *
 * Commandable services are generated automatically for ICommandable objects.
 * Each command is exposed as Seneca action.
 *
 * ### Configuration parameters ###
 *
 * connection(s):
 *   discovery_key:         (optional) a key to retrieve the connection from [[IDiscovery]]
 *   protocol:              connection protocol: http or https
 *   host:                  host name or IP address
 *   port:                  port number
 *   uri:                   resource URI or connection string with all parameters in it
 * options:
 *   retries:               number of retries (default: 3)
 *   connect_timeout:       connection timeout in milliseconds (default: 10 sec)
 *   timeout:               invocation timeout in milliseconds (default: 10 sec)
 *
 * ### References ###
 *
 * - *:logger:*:*:1.0         (optional) [[ILogger]] components to pass log messages
 * - *:counters:*:*:1.0         (optional) [[ICounters]] components to pass collected measurements
 * - *:discovery:*:*:1.0        (optional) IDiscovery services to resolve connection
 *
 * ### Example ###
 *
 * class MyCommandableSenecaClient extends CommandableSenecaClient implements IMyClient {
 *    ...
 *
 *    public getData(correlationId: string, id: string,
 *        callback: (err: any, result: MyData) => void): void {
 *
 *        this.callCommand(
 *            "get_data",
 *            correlationId,
 *            { id: id },
 *            (err, result) => {
 *                callback(err, result);
 *            }
 *         );
 *    }
 *    ...
 * }
 *
 * let client = new MyCommandableSenecaClient();
 * client.configure(ConfigParams.fromTuples(
 *     "connection.protocol", "http",
 *     "connection.host", "localhost",
 *     "connection.port", 8080
 * ));
 *
 * client.getData("123", "1", (err, result) => {
 *   ...
 * });
 */
export declare class CommandableSenecaClient extends SenecaClient {
    private _role;
    /**
     * Creates a new instance of the client.
     *
     * @param role     a service role (name).
     */
    constructor(role: string);
    /**
     * Calls a remote method via Seneca commadable protocol.
     *
     * @param cmd               a name of the command to call.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param params            command parameters.
     * @param callback          callback function that receives result or error.
     */
    callCommand(cmd: string, correlationId: string, params: any, callback: (err: any, result: any) => void): void;
}