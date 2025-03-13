import { navigateTo } from "../util/navigate.js";

export class MainInterface {
    constructor() {
        if (MainInterface.instance) {
            return MainInterface.instance;
        }
        MainInterface.instance = this;

        this.createProjectButton = document.getElementById(
            "create-project-button"
        );
        this.loadProjectButton = document.getElementById("load-project-button");
    }

    init() {
        this.createProjectButton.addEventListener("click", () => {
            navigateTo("preprocess.html");
        });

        this.loadProjectButton.addEventListener("click", () => {
            navigateTo("label.html?askLoadProject=true");
        });
    }
}

function main() {
    const mainPage = new MainInterface();
    mainPage.init();
}

main();
