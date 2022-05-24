class Weapon {
    name;
    fireMode;
    ammunitionType;
    bulletsPerBurst;
    burstRpm;
    rpm;
    get averageFireRate() {
        return (this.rpm + this.burstRpm) / this.bulletsPerBurst;
    }
    static rpmsToMs(rpm) {
        return (1 / (rpm / 60)) * 1000;
    }
}
class InventorySlot {
    displayName;
    type;
    constructor(type, displayName) {
        this.type = type;
        this.displayName = displayName;
    }
}
class WeaponInventorySlot extends InventorySlot {
    constructor(name = "empty") {
        super("weapon", name);
    }
}
class ItemInventorySlot extends InventorySlot {
    constructor(name = "empty") {
        super("item", name);
    }
}
