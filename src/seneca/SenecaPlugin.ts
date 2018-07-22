import { IReferences } from 'pip-services-commons-node';
import { Descriptor } from 'pip-services-commons-node';
import { Referencer } from 'pip-services-commons-node';
import { Opener } from 'pip-services-commons-node';
import { Closer } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-components-node';

import { SenecaInstance } from './SenecaInstance';

export class SenecaPlugin {
    private _name: string;
    private _seneca: any;
    private _references: IReferences;
    private _logger: CompositeLogger;

    public constructor(name: string, seneca: any, references: IReferences) {
        if (name == null)
            throw new Error('Plugin name cannot be null');
        if (seneca == null)
            throw new Error('Seneca reference cannot be null');
        if (references == null)
            throw new Error('References cannot be null');

        this._name = name;
        this._seneca = seneca;
        this._references = references;

        this._logger = new CompositeLogger(this._references);

        this.build();
    }

    public get name(): string {
        return this._name;
    }

    private build(): void {
        // Initialize seneca instance
        let senecaDescriptor = new Descriptor('pip-services-seneca', 'seneca', 'instance', '*', '*');
        let senecaInstance = this._references.getOneOptional<SenecaInstance>(senecaDescriptor);

        if (senecaInstance !=  null) {
            senecaInstance.setInstance(this._seneca);
        } else {
            senecaInstance = new SenecaInstance(this._seneca);
            this._references.put(senecaDescriptor, senecaInstance);
        }

        // Open plugin on seneca init
        this._seneca.add(
            { init: this._name }, 
            (args, done) => { 
                this.open((err) => {
                    if (err) {
                        this._logger.fatal(this._name, err, 'Failed to open seneca plugin %s', this._name);
                        process.exit(1);
                    }
                    done();
                });
            }
        );
        
        // Close plugin on seneca close
        this._seneca.on('close', () => { 
            this.close(); 
        });
    }

    private open(callback?: (err: any) => void) {
        let components = this._references.getAll();

        try {
            Referencer.setReferences(this._references, components);
            Opener.open(this._name, components, callback);
        } catch (err) {
            if (callback) callback(err);
        }
    }

    private close(callback?: (err: any) => void) {
        let components = this._references.getAll();
        Closer.close(this._name, components, callback);
    }

}