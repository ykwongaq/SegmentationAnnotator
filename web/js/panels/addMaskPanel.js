import { ActionPanel } from "./actionPanel.js";
import { ActionManager } from "../action/actionManager.js";
import { MaskCreator } from "../action/maskCreator.js";
import { MaskSelector } from "../action/maskSelector.js";
import { CategorySelector } from "./categorySelector.js";
import { Category } from "../data/index.js";
import { Canvas } from "./canvas.js";
import { Manager } from "../manager.js";

export class AddMaskPanel {
    constructor(actionPanelDom, actionContainerDom) {
        this.actionPanelDom = actionPanelDom;
        this.actionContainerDom = actionContainerDom;

        this.addMaskButton =
            this.actionPanelDom.querySelector("#add-mask-button");
        this.confirmPromptButton =
            this.actionContainerDom.querySelector("#confirm-button");
        this.undoPromptButton =
            this.actionContainerDom.querySelector("#undo-button");
        this.resetPromptButton =
            this.actionContainerDom.querySelector("#reset-button");
        this.exitAddMaskButton = this.actionContainerDom.querySelector(
            "#back-to-edit-mode-btn"
        );

        this.promptCategorySelectorDom = this.actionContainerDom.querySelector(
            "#category-selector-prompt"
        );
        this.labelSmallButtonTemplate = this.actionPanelDom.querySelector(
            "#label-small-btn-template"
        );
        this.promptCategorySelector = new CategorySelector(
            this.promptCategorySelectorDom,
            this.labelSmallButtonTemplate
        );
    }

    init() {
        this.initAddMaskButton();
        this.initUndoPromptButton();
        this.initResetPromptButton();
        this.initConfirmPromptButton();
        this.initExitAddMaskButton();
        this.initPromptCategorySelector();
    }

    initAddMaskButton() {
        this.addMaskButton.addEventListener("click", () => {
            this.show();

            const actionManager = new ActionManager();
            actionManager.setState(ActionManager.STATE_CREATE_MASK);

            const maskSelector = new MaskSelector();
            maskSelector.clearSelection();

            const manager = new Manager();
            const canvas = manager
                .getToolInterface()
                .getAnnotationPage()
                .getCanvas();
            canvas.updateMasks();

            const actionPanel = manager
                .getToolInterface()
                .getAnnotationPage()
                .getActionPanel();
            actionPanel.hide();
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(ActionManager.DEFAULT_STATE, "w", () => {
            this.addMaskButton.click();
        });

        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "w") {
                actionManager.handleShortCut("e", event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    initUndoPromptButton() {
        this.undoPromptButton.addEventListener("click", () => {
            const maskCreator = new MaskCreator();
            maskCreator.undoPrompt();
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.STATE_CREATE_MASK,
            "control+z",
            (event) => {
                this.undoPromptButton.click();
            }
        );

        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "z" && event.ctrlKey) {
                actionManager.handleShortCut("control+z", event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    initResetPromptButton() {
        this.resetPromptButton.addEventListener("click", () => {
            const maskCreator = new MaskCreator();
            maskCreator.clearPrompts();
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.STATE_CREATE_MASK,
            "r",
            (event) => {
                this.resetPromptButton.click();
            }
        );

        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "r") {
                actionManager.handleShortCut("r", event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    initConfirmPromptButton() {
        this.confirmPromptButton.addEventListener("click", () => {
            const maskCreator = new MaskCreator();
            maskCreator.confirmPrompt();
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.STATE_CREATE_MASK,
            " ",
            (event) => {
                this.confirmPromptButton.click();
            }
        );

        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === " ") {
                actionManager.handleShortCut(" ", event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    initExitAddMaskButton() {
        this.exitAddMaskButton.addEventListener("click", () => {
            this.hide();

            // Clear the mask creation prompts
            const maskCreator = new MaskCreator();
            maskCreator.clearPrompts();

            const actionManager = new ActionManager();
            actionManager.setState(ActionManager.STATE_SELECT_MASK);

            const maskSelector = new MaskSelector();
            maskSelector.clearSelection();

            const manager = new Manager();
            const canvas = manager
                .getToolInterface()
                .getAnnotationPage()
                .getCanvas();
            canvas.updateMasks();

            const actionPanel = manager
                .getToolInterface()
                .getAnnotationPage()
                .getActionPanel();
            actionPanel.show();
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.STATE_CREATE_MASK,
            "w",
            () => {
                this.exitAddMaskButton.click();
            }
        );

        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "w") {
                actionManager.handleShortCut("w", event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    initPromptCategorySelector() {
        const toggleButton = this.promptCategorySelector.getToggleButton();

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.STATE_CREATE_MASK,
            "c",
            (event) => {
                toggleButton.click();
            }
        );
        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "c") {
                actionManager.handleShortCut(key, event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    show() {
        this.undoPromptButton.classList.remove("hidden");
        this.resetPromptButton.classList.remove("hidden");
        this.confirmPromptButton.classList.remove("hidden");
    }

    hide() {
        this.undoPromptButton.classList.add("hidden");
        this.resetPromptButton.classList.add("hidden");
        this.confirmPromptButton.classList.add("hidden");
    }

    getPromptCategorySelector() {
        return this.promptCategorySelector;
    }

    updateCategoryButtons() {
        this.promptCategorySelector.updateCategoryButtons([new Category(-1)]);
    }
}
