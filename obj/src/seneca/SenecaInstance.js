"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_components_node_1 = require("pip-services-components-node");
class SenecaInstance {
    constructor(instance) {
        this._logger = new pip_services_components_node_1.CompositeLogger();
        this._instance = instance;
    }
    setReferences(references) {
        this._logger.setReferences(references);
    }
    getInstance() {
        // Initialize seneca instance
        if (this._instance == null) {
            this._instance = require('seneca')({ strict: { result: false } });
            this._instance.error((err) => {
                if (err)
                    this._logger.error(null, err, err.message);
            });
        }
        return this._instance;
    }
    setInstance(seneca) {
        this._instance = seneca;
    }
}
exports.SenecaInstance = SenecaInstance;
//# sourceMappingURL=SenecaInstance.js.map