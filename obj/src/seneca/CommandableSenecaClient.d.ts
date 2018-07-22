import { SenecaClient } from './SenecaClient';
export declare class CommandableSenecaClient extends SenecaClient {
    private _role;
    constructor(role: string);
    callCommand(cmd: string, correlationId: string, params: any, callback: (err: any, result: any) => void): void;
}
