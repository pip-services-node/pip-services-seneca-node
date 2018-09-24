"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module build */
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_commons_node_1 = require("pip-services-commons-node");
const SenecaEndpoint_1 = require("../services/SenecaEndpoint");
/**
 * Creates Seneca components by their descriptors.
 *
 * @see [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/build.factory.html Factory]]
 * @see [[SenecaEndpoint]]
 */
class DefaultSenecaFactory extends pip_services_components_node_1.Factory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.registerAsType(DefaultSenecaFactory.SenecaEndpointDescriptor, SenecaEndpoint_1.SenecaEndpoint);
    }
}
DefaultSenecaFactory.Descriptor = new pip_services_commons_node_1.Descriptor("pip-services", "factory", "seneca", "default", "1.0");
DefaultSenecaFactory.SenecaEndpointDescriptor = new pip_services_commons_node_1.Descriptor("pip-services", "endpoint", "seneca", "*", "1.0");
exports.DefaultSenecaFactory = DefaultSenecaFactory;
//# sourceMappingURL=DefaultSenecaFactory.js.map