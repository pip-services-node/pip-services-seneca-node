import { ICommandable } from 'pip-services-commons-node';
import { CommandSet } from 'pip-services-commons-node';
import { Parameters } from 'pip-services-commons-node';

import { SenecaService } from './SenecaService';

export abstract class CommandableSenecaService extends SenecaService {
    private _role: string;
    private _commandSet: CommandSet;

    public constructor(role: string) {
        super();
        this._role = role;
        this._dependencyResolver.put('controller', 'none');
    }

    public register(): void {
        let controller: ICommandable = this._dependencyResolver.getOneRequired<ICommandable>('controller');
        this._commandSet = controller.getCommandSet();

        let commands = this._commandSet.getCommands();
        for (let index = 0; index < commands.length; index++) {
            let command = commands[index];

            this.registerAction(this._role, command.getName(), null, (params, callback) => {
                let correlationId = params.correlation_id;
                let args = Parameters.fromValue(params);
                let timing = this.instrument(correlationId, this._role + '.' + command.getName());

                command.execute(correlationId, args, (err, result) => {
                    timing.endTiming();
                    callback(err, result);
                })
            });
        }
    }
}