let assert = require('chai').assert;
let async = require('async');

import {
    Descriptor,
    ConfigParams,
    References,
} from 'pip-services-commons-node';
import { ConsoleLogger } from 'pip-services-components-node';

import { Dummy } from '../Dummy';
import { DummyController } from '../DummyController';
import { IDummyClient } from '../IDummyClient';
import { DummySenecaClient } from './DummySenecaClient';
import { DummyClientFixture } from '../DummyClientFixture';
import { SenecaInstance } from '../../src/seneca/SenecaInstance';

let senecaConfig = ConfigParams.fromTuples(
    "connection.protocol", "none"
);

suite('DummySenecaPlugin', () => {
    let client: DummySenecaClient;
    let fixture: DummyClientFixture;

    suiteSetup((done) => {
        let ctrl = new DummyController();

        let seneca = new SenecaInstance();
        let logger = new ConsoleLogger();

        let references: References = References.fromTuples(
            new Descriptor('pip-services-commons', 'logger', 'console', 'default', '1.0'), logger,
            new Descriptor('pip-services-seneca', 'seneca', 'instance', 'default', '1.0'), seneca
        );
        seneca.setReferences(references);

        // Load Seneca plugin
        let plugin = require('./DummySenecaPlugin');
        seneca.getInstance().use(plugin, { test: '123' });

        client = new DummySenecaClient();
        client.setReferences(references);
        client.configure(senecaConfig);

        fixture = new DummyClientFixture(client);

        client.open(null, done);
    });

    suiteTeardown((done) => {
        client.close(null, done);
    });

    test('CRUD Operations', (done) => {
        fixture.testCrudOperations(done);
    });

});
