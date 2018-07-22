import { SenecaClient } from './SenecaClient';

export class CommandableSenecaClient extends SenecaClient {
    private _role: string;

    public constructor(role: string) {
        super();
        this._role = role;
    }

    public callCommand(cmd: string, correlationId: string, params: any, callback: (err: any, result: any) => void): void {
        let timing = this.instrument(correlationId, this._role + '.' + cmd);

        this.call(this._role, cmd, correlationId, params, (err, result) => {
            timing.endTiming();

            if (callback) callback(err, result);
        });
    }
}