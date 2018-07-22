import { Descriptor } from 'pip-services-commons-node';
import { CommandableSenecaService } from '../../src/seneca/CommandableSenecaService';

export class DummyCommandableSenecaService extends CommandableSenecaService {
    public constructor() {
        super('dummy');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-dummies', 'controller', 'default', '*', '*'));
    }
}