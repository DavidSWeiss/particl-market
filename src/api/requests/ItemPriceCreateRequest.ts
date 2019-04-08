// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum, IsPositive } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import {ShippingPriceCreateRequest} from './ShippingPriceCreateRequest';
import {CryptocurrencyAddressCreateRequest} from './CryptocurrencyAddressCreateRequest';

// tslint:disable:variable-name
export class ItemPriceCreateRequest extends RequestBody {

    @IsNotEmpty()
    public payment_information_id: number;
    public cryptocurrency_address_id: number;

    @IsEnum(Cryptocurrency)
    @IsNotEmpty()
    public currency: Cryptocurrency;

    @IsNotEmpty()
    @IsPositive()
    public basePrice: number;

    public shippingPrice: ShippingPriceCreateRequest;

    public cryptocurrencyAddress: CryptocurrencyAddressCreateRequest;
}
// tslint:enable:variable-name
