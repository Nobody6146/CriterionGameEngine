type AmmunitionType = "bullet" | "buckshot";
type FireMode = "semi" | "burst" | "automatic" | "pump" | "bolt";

class Weapon {
    name:string;
    fireMode:FireMode;
    ammunitionType:AmmunitionType;
    bulletsPerBurst:number;
    burstRpm:number;
    rpm:number;

    get averageFireRate() {
        return (this.rpm + this.burstRpm) / this.bulletsPerBurst;
    }

    static rpmsToMs(rpm:number):number {
        return (1 / (rpm / 60)) * 1000
    }
}

type InventorySlotType = "weapon" | "item";

class InventorySlot {
    displayName:string;
    type:InventorySlotType;

    constructor(type:InventorySlotType, displayName:string) {
        this.type = type;
        this.displayName = displayName;
    }
}

class WeaponInventorySlot extends InventorySlot {
    constructor(name:string = "empty") {
        super("weapon", name);
    }
}

class ItemInventorySlot extends InventorySlot {
    constructor(name:string = "empty") {
        super("item", name);
    }
}