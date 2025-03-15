import { LabelCore } from "../label/labelCore.js";
import { ActionManager } from "../action/actionManager.js";
import { NavigationBarLabel } from "../label/panels/navigationBarLabel.js";
import { Manager } from "../manager.js";

export class TopPanel {
    constructor(dom) {
        this.dom = dom;

        this.prevImageButton = this.dom.querySelector("#prev-image-button");
        this.nextImageButton = this.dom.querySelector("#next-image-button");

        this.imageNameText = this.dom.querySelector("#progress-info-name");

        this.galleryButton = this.dom.querySelector("#back-to-gallery");
    }

    init() {
        this.initNextImageButton();
        this.initPrevImageButton();
        this.initGalleryButton();
    }

    initNextImageButton() {
        this.nextImageButton.addEventListener("click", () => {
            this.disableButtons();
            const manager = new Manager();
            const core = manager.getCore();
            core.nextData(() => {
                this.enableButtons();
            });
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.DEFAULT_STATE,
            "d",
            (event) => {
                this.nextImageButton.click();
            }
        );
        actionManager.registerShortCut(
            ActionManager.STATE_CREATE_MASK,
            "d",
            (event) => {
                this.nextImageButton.click();
            }
        );
        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "d") {
                actionManager.handleShortCut(key, event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    initPrevImageButton() {
        this.prevImageButton.addEventListener("click", () => {
            this.disableButtons();
            const manager = new Manager();
            const core = manager.getCore();
            core.prevData(() => {
                this.enableButtons();
            });
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.DEFAULT_STATE,
            "a",
            (event) => {
                this.prevImageButton.click();
            }
        );
        actionManager.registerShortCut(
            ActionManager.STATE_CREATE_MASK,
            "a",
            (event) => {
                this.prevImageButton.click();
            }
        );
        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "a") {
                actionManager.handleShortCut(key, event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    initGalleryButton() {
        this.galleryButton.addEventListener("click", () => {
            const manager = new Manager();
            const navigationBar = manager.getToolInterface().getNavigationBar();
            navigationBar.galleryButton.click();
        });
    }

    disableButtons() {
        this.nextImageButton.disabled = true;
        this.prevImageButton.disabled = true;
    }

    enableButtons() {
        this.nextImageButton.disabled = false;
        this.prevImageButton.disabled = false;
    }

    update() {
        const manager = new Manager();

        const core = manager.getCore();
        const data = core.getData();

        const imageName = data.getImageName();
        const imageIdx = data.getIdx();
        this.imageNameText.textContent = `${imageIdx + 1}. ${imageName}`;
    }
}
