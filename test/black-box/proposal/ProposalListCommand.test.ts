// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import * as resources from 'resources';
import { GenerateProposalParams } from '../../../src/api/requests/params/GenerateProposalParams';
import { ProposalType } from '../../../src/api/enums/ProposalType';
// tslint:enable:max-line-length

describe('ProposalListCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const proposalCommand = Commands.PROPOSAL_ROOT.commandName;
    const proposalListCommand = Commands.PROPOSAL_LIST.commandName;
    const daemonCommand = Commands.DAEMON_ROOT.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let pastProposals: resources.Proposal[];
    let activeProposals: resources.Proposal[];

    let currentBlock: 0;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();
        log.debug('defaultProfile: ', defaultProfile);

        // fetch default market
        defaultMarket = await testUtil.getDefaultMarket();

        const generatePastProposalParams = new GenerateProposalParams([
            false,   // generateListingItemTemplate
            false,   // generateListingItem
            null,   // listingItemHash,
            true    // generatePastProposal
        ]).toParamsArray();

        // generate past proposals
        pastProposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,    // what to generate
            2,                  // how many to generate
            true,            // return model
            generatePastProposalParams      // what kind of data to generate
        ) as resources.Proposal[];

        const generateActiveProposalParams = new GenerateProposalParams([
            false,   // generateListingItemTemplate
            false,   // generateListingItem
            null,   // listingItemHash,
            false   // generatePastProposal
        ]).toParamsArray();

        // generate active proposals
        activeProposals = await testUtil.generateData(
            CreatableModel.PROPOSAL,        // what to generate
            1,                      // how many to generate
            true,               // return model
            generateActiveProposalParams    // what kind of data to generate
        ) as resources.Proposal[];

        const res: any = await rpc(daemonCommand, ['getblockcount']);
        currentBlock = res.getBody()['result'];
        log.debug('currentBlock:', currentBlock);

    });

    test('Should list all proposals', async () => {

        const res: any = await rpc(proposalCommand, [proposalListCommand, '*', '*']);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];

        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(3);
    });

    test('Should list past proposals', async () => {

        log.debug('search * -> ' + currentBlock);

        const res: any = await rpc(proposalCommand, [proposalListCommand, '*', currentBlock]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];

        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(2);
    });

    test('Should list active proposals', async () => {

        log.debug('search ' + currentBlock + ' -> *');

        const res: any = await rpc(proposalCommand, [proposalListCommand, currentBlock, '*']);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];

        log.debug('result:', JSON.stringify(result, null, 2));
        expect(result).toHaveLength(1);
    });

    test('Should list 3 proposals with type PUBLIC_VOTE', async () => {

        log.debug('search ' + currentBlock + ' -> *');

        // all generated ones are public at the moment
        const res: any = await rpc(proposalCommand, [proposalListCommand, '*', '*', ProposalType.PUBLIC_VOTE]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(3);
    });

    test('Should not list any proposals with type ITEM_VOTE', async () => {

        // all generated ones are public at the moment
        const res: any = await rpc(proposalCommand, [proposalListCommand, '*', '*', ProposalType.ITEM_VOTE]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(0);
    });


});