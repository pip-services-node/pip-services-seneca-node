import { SenecaService } from './SenecaService';
export declare abstract class CommandableSenecaService extends SenecaService {
    private _role;
    private _commandSet;
    constructor(role: string);
    register(): void;
}
