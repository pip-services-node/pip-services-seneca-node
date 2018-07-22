"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SenecaClient_1 = require("./SenecaClient");
class CommandableSenecaClient extends SenecaClient_1.SenecaClient {
    constructor(role) {
        super();
        this._role = role;
    }
    callCommand(cmd, correlationId, params, callback) {
        let timing = this.instrument(correlationId, this._role + '.' + cmd);
        this.call(this._role, cmd, correlationId, params, (err, result) => {
            timing.endTiming();
            if (callback)
                callback(err, result);
        });
    }
}
exports.CommandableSenecaClient = CommandableSenecaClient;
//# sourceMappingURL=CommandableSenecaClient.js.map