import { LabelCore } from "./labelCore.js";
import { Manager } from "../manager.js";
import { GeneralPopManager } from "../util/index.js";

import { NavigationBarLabel } from "./panels/index.js";

import {
    LabelPanel,
    TopPanel,
    ActionPanel,
    ViewPanel,
    Canvas,
} from "../panels/index.js";

import { navigateTo } from "../util/navigate.js";
import { AnnotationPage, GalleryPage } from "../pages/index.js";

export class LabelInterface {
    constructor() {
        this.core = null;
        this.annotationPage = null;
        this.galleryPage = null;
        this.navigationBar = null;
    }

    getAnnotationPage() {
        return this.annotationPage;
    }

    getGalleryPage() {
        return this.galleryPage;
    }

    getNavigationBar() {
        return this.navigationBar;
    }

    init() {
        const manager = new Manager(labelCore);

        const labelCore = new LabelCore();
        manager.setCore(labelCore);
        manager.setInterface(this);

        // AnnotationPage
        const annotationPageDom = document.getElementById("annotationPage");
        this.annotationPage = new AnnotationPage(annotationPageDom);

        // Canvas
        const canvasDom = document.getElementById("canvas");
        const canvas = new Canvas(canvasDom);
        canvas.init();
        this.annotationPage.setCanvas(canvas);

        // Label Panel
        const labelPanelDom = document.getElementById("label-panel");
        const labelPanel = new LabelPanel(labelPanelDom);
        labelPanel.init();
        this.annotationPage.setLabelPanel(labelPanel);

        // Top Panel
        const topPanelDom = document.getElementById("top-panel");
        const topPanel = new TopPanel(topPanelDom);
        topPanel.init();
        this.annotationPage.setTopPanel(topPanel);

        // Action Panel
        const actionPanelDom = document.getElementById("action-panel");
        const actionContainerDom = document.getElementById(
            "actionContainer-bar"
        );
        const actionPanel = new ActionPanel(actionPanelDom, actionContainerDom);
        actionPanel.init();
        this.annotationPage.setActionPanel(actionPanel);

        // View Control Panel
        const viewPanelDom = document.getElementById("view-panel");
        const viewPanel = new ViewPanel(viewPanelDom);
        viewPanel.init();
        this.annotationPage.setViewPanel(viewPanel);

        // Navigation Bar
        const navigationBarDom = document.getElementById("navigation-bar");
        this.navigationBar = new NavigationBarLabel(navigationBarDom);
        this.navigationBar.init();

        // Gallery Page
        const galleryPageDom = document.getElementById(
            NavigationBar.GALLERY_PAGE
        );
        this.galleryPage = new GalleryPage(galleryPageDom);
        galleryPage.init();
    }
}

function main() {
    const labelPage = new LabelInterface();
    labelPage.init();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("askLoadProject") === "true") {
        const popUpWindow = new GeneralPopManager();
        popUpWindow.clearButtons();
        popUpWindow.updateText("Please select a created project.");
        popUpWindow.addButton("back-button", "Back", () => {
            navigateTo("main_page.html");
        });
        popUpWindow.addButton("load-project-button", "Load Project", () => {
            const core = new LabelCore();
            core.loadProject();
            popUpWindow.hide();
        });
        popUpWindow.show();
    } else {
        const projectPath = urlParams.get("project_path");
        if (projectPath !== null) {
            const generalPopManager = new GeneralPopManager();
            generalPopManager.clear();
            generalPopManager.updateLargeText("Hold Tight!");
            generalPopManager.updateText("Loading Project...");
            generalPopManager.show();
            const core = new LabelCore();
            core.loadProject(
                projectPath,
                () => {
                    generalPopManager.hide();
                },
                (error) => {
                    generalPopManager.hide();
                }
            );
        }
    }

    window.onbeforeunload = function (event) {
        // const message = "Are you sure you want to leave?";
        // event.returnValue = message;
        // return message;

        const core = new LabelCore();
        console.log(core.getData());
        return core.isDataModified();
    };
}

document.addEventListener("DOMContentLoaded", main);
