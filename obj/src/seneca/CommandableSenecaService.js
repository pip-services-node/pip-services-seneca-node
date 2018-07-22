"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const SenecaService_1 = require("./SenecaService");
class CommandableSenecaService extends SenecaService_1.SenecaService {
    constructor(role) {
        super();
        this._role = role;
        this._dependencyResolver.put('controller', 'none');
    }
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