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
