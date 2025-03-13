import { navigateTo } from "../util/navigate.js";

export class MainPage {
    constructor() {
        if (MainPage.instance) {
            return MainPage.instance;
        }
        MainPage.instance = this;

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
    const mainPage = new MainPage();
    mainPage.init();
}

main();
