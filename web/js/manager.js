export class Manager {
    constructor() {
        if (Manager.instance) {
            return Manager.instance;
        }
        Manager.instance = this;

        this.core = null;
        this.interface = null;
    }

    setCore(core) {
        this.core = core;
    }

    getCore() {
        return this.core;
    }

    getInterface() {
        return this.interface;
    }

    setInterface(interface) {
        this.interface = interface;
    }
}
