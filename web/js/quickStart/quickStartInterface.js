import { Manager } from "../manager.js";
import { QuickStartCore } from "./quickStartCore.js";
import {
    LabelPanel,
    TopPanel,
    ActionPanel,
    ViewPanel,
    Canvas,
} from "../panels/index.js";

import { GeneralPopManager } from "../util/generalPopManager.js";
import { AnnotationPage } from "../pages/index.js";
import { NavigationBarQuickStart } from "./panels/navigationBarQuickStart.js";
import { LoadingPopManager } from "../util/loadingPopManager.js";
import { navigateTo } from "../util/navigate.js";

export class QuickStartInterface {
    constructor() {
        this.core = null;
        this.annotationPage = null;
        this.navigationBar = null;

        this.imageInput = document.getElementById("image-input");
    }

    getAnnotationPage() {
        return this.annotationPage;
    }

    getNavigationBar() {
        return this.navigationBar;
    }

    getCore() {
        return this.core;
    }

    init() {
        const manager = new Manager();

        const quickStartCore = new QuickStartCore();
        manager.setCore(quickStartCore);
        manager.setToolInterface(this);

        const annotationPageDom = document.getElementById("annotationPage");
        this.annotationPage = new AnnotationPage(annotationPageDom);

        const canvasDom = document.getElementById("canvas");
        const canvas = new Canvas(canvasDom);
        canvas.init();
        this.annotationPage.setCanvas(canvas);

        const labelPanelDom = document.getElementById("label-panel");
        const labelPanel = new LabelPanel(labelPanelDom);
        labelPanel.init();
        this.annotationPage.setLabelPanel(labelPanel);

        const topPanelDom = document.getElementById("top-panel");
        const topPanel = new TopPanel(topPanelDom);
        topPanel.init();
        this.annotationPage.setTopPanel(topPanel);

        const actionPanelDom = document.getElementById("action-panel");
        const actionContainerDom = document.getElementById(
            "actionContainer-bar"
        );
        const actionPanel = new ActionPanel(actionPanelDom, actionContainerDom);
        actionPanel.init();
        this.annotationPage.setActionPanel(actionPanel);

        const viewPanelDom = document.getElementById("view-panel");
        const viewPanel = new ViewPanel(viewPanelDom);
        viewPanel.init();
        this.annotationPage.setViewPanel(viewPanel);

        const navigationBarDom = document.getElementById("navigation-bar");
        this.navigationBar = new NavigationBarQuickStart(navigationBarDom);
        this.navigationBar.init();

        this.navigationBar.addPage(
            NavigationBarQuickStart.ANNOTATION_PAGE,
            this.annotationPage,
            annotationPageDom
        );

        this.imageInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const loadingPopManager = new LoadingPopManager();
                    loadingPopManager.clear();
                    loadingPopManager.updateLargeText(
                        LoadingPopManager.DEFAULT_TITLE
                    );
                    loadingPopManager.updateText(
                        "Generating image embedding ..."
                    );
                    loadingPopManager.show();

                    const dataUrl = e.target.result;
                    const fileName = file.name;

                    const core = manager.getCore();
                    core.quickStart(
                        dataUrl,
                        fileName,
                        () => {
                            // Do nothing
                        },
                        (error) => {
                            loadingPopManager.hide();
                            core.popUpError(error);
                        }
                    );
                };
                reader.readAsDataURL(file);
            }
        });
    }

    getImageInput() {
        return this.imageInput;
    }
}

function main() {
    const quickStartInterface = new QuickStartInterface();
    quickStartInterface.init();

    const generalPopManager = new GeneralPopManager();
    generalPopManager.clear();
    generalPopManager.updateText("Please select an image to start.");
    generalPopManager.addButton("back-button", "Back", () => {
        navigateTo("main_page.html");
    });
    generalPopManager.addButton("select-image-button", "Select Image", () => {
        generalPopManager.hide();
        quickStartInterface.getImageInput().click();
    });
    generalPopManager.show();

    window.onbeforeunload = function (event) {
        return true;
    };
}

document.addEventListener("DOMContentLoaded", main, { once: true });
