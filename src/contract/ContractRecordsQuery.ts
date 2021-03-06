import { QueryBuilder } from "../QueryBuilder";
import { BaseClient } from "../BaseClient";
import { QueryHeader } from "../generated/QueryHeader_pb";
import { Query } from "../generated/Query_pb";
import { grpc } from "@improbable-eng/grpc-web";
import { Response } from "../generated/Response_pb";
import { SmartContractService } from "../generated/SmartContractService_pb_service";
import { recordListToSdk, TransactionRecord } from "../TransactionRecord";
import { ContractId, ContractIdLike, contractIdToProto, contractIdToSdk } from "./ContractId";
import { ContractGetRecordsQuery } from "../generated/ContractGetRecords_pb";

export type ContractRecord = {
    contractId: ContractId;
    recordList: TransactionRecord[];
}

export class ContractRecordsQuery extends QueryBuilder<ContractRecord> {
    private readonly _builder: ContractGetRecordsQuery;
    public constructor(client: BaseClient) {
        const header = new QueryHeader();
        super(client, header);
        this._builder = new ContractGetRecordsQuery();
        this._builder.setHeader(header);
        this._inner.setContractgetrecords(this._builder);
    }

    public setContractId(contractIdLike: ContractIdLike): this {
        this._builder.setContractid(contractIdToProto(contractIdLike));
        return this;
    }

    protected _doValidate(errors: string[]): void {
        if (!this._builder.hasContractid()) {
            errors.push(".setContractId() required");
        }
    }

    protected get _method(): grpc.UnaryMethodDefinition<Query, Response> {
        return SmartContractService.getTxRecordByContractID;
    }

    protected _mapResponse(response: Response): ContractRecord {
        const contractResponse = response.getContractgetrecordsresponse()!;
        const contractId = contractIdToSdk(contractResponse.getContractid()!);
        const recordList = recordListToSdk(contractResponse.getRecordsList()!);

        return {
            contractId,
            recordList
        };
    }
}
