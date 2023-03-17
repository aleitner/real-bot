class CooldownManager {
    constructor(cooldownSeconds = 10) {
        this.cooldownSeconds = cooldownSeconds;
        this.userCooldowns = new Map();
    }

    isOnCooldown(userId) {
        const now = Date.now();

        if (this.userCooldowns.has(userId) && this.userCooldowns.get(userId) > now) {
            return true;
        }

        return false;
    }

    remainingTime(userId) {
        if (this.userCooldowns.has(userId)) {
            const now = Date.now();
            return (this.userCooldowns.get(userId) - now) / 1000;
        }

        return 0;
    }

    setCooldown(userId) {
        const now = Date.now();
        this.userCooldowns.set(userId, now + this.cooldownSeconds * 1000);
    }
}

module.exports = CooldownManager;
