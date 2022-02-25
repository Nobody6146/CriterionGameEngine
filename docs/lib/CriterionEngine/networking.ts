class CriterionNetworker
{
    #numberType = 0;
    #booleanType = 1;
    #stringType = 2;
    
    #utf8Encoder: TextEncoder;
    #engine: CriterionEngine;
    #packetTypes: Function[];

    constructor(engine:CriterionEngine)
    {
        this.#engine = engine;
        this.#utf8Encoder = new TextEncoder();
        this.#packetTypes = [];
    }

    /** Registers a new packet type (class extending CirterionNetworkPacket) if it isn't already configured */
    register(func:Function): number
    {
        if(!(func instanceof CriterionNetworkPacket))
        {
            this.#engine.logger.error(new CriterionError(`Function does not extend type CriterionNetworkPacket: ${func}`));
            return undefined;
        }
        let id = this.#packetTypes.indexOf(func);
        if(id > 0)
        {
            let error = new CriterionError(`CriterionNetworkPacket is already registered as id ${id} for type ${func}`);
            this.#engine.logger.warn(error.stack);
            return id;
        }
        this.#packetTypes.push(func);
        return this.#packetTypes.length - 1;
    }
    sendPacket() {

    }
    write(packet:CriterionNetworkPacket): string
    {
        let id = this.#packetTypes.indexOf(packet.constructor);
        if(id < 0)
        {
            this.#engine.logger.error(new CriterionError(`Packet type is not a registered CriterionNetworkPacket: ${JSON.stringify(packet)}`));
            return null;
        }

        //Now we can write to buffere arrays
        const serializeResult = this.#serializePacket(packet);
        for(const key of Object.keys(packet))
        {

        }
    }
    #serializePacket(packet:CriterionNetworkPacket): {buffers: [ArrayBuffer], bytes: number} {
        let type = this.#packetTypes.indexOf(packet.constructor);
        if(type < 0)
        {
            this.#engine.logger.error(new CriterionError(`Packet type is not a registered CriterionNetworkPacket: ${JSON.stringify(packet)}`));
            return null;
        }

        //Write the type of packet
        let buffers: [ArrayBuffer] = [new Int8Array([type]).buffer];
        let bytes = 1;
        //Write each values
        for(const value in Object.values(packet))
        {
            let buffer = this.#serializeValue(value);
            buffers.push(buffer);
            bytes += buffer.byteLength;
        }
        return {
            buffers: buffers,
            bytes: bytes
        };
    }
    
    #serializeValue(data: number | string | boolean){
        switch(typeof data)
        {
            case "number":
                return new Int32Array([this.#numberType, data]).buffer;
            case "boolean":
                return new Int32Array([this.#booleanType, data === true ? 1 : 0]).buffer;
            case "string":
                let bytes = this.#utf8Encoder.encode(data);
                let reuslt = new Int32Array(2 + bytes.length);
                reuslt.set([this.#stringType, bytes.length]);
                reuslt.set([...bytes.values()], 2);
                return reuslt;
        }
    }
    parse(data:string){

    }
}

class CriterionNetworkPacket
{
    
}