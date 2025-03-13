import { CategorySelector } from "../label/categorySelector.js";
import { MaskSelector } from "../label/maskSelector.js";
import { Canvas } from "../label/canvas.js";
import { Core } from "../label/core.js";
import { ActionManager } from "../action/actionManager.js";
import { LabelPanel } from "./labelPanel.js";
import { AddMaskPanel } from "./addMaskPanel.js";

export class ActionPanel {
    constructor(actionPanel, actionContainerDom) {
        if (ActionPanel.instance) {
            return ActionPanel.instance;
        }
        ActionPanel.instance = this;

        this.actionPanelDom = actionPanel;

        this.categorySelectorDom =
            this.actionPanelDom.querySelector("#category-selector");
        this.labelSmallButtonTemplate = this.actionPanelDom.querySelector(
            "#label-small-btn-template"
        );
        this.categorySelector = new CategorySelector(
            this.categorySelectorDom,
            this.labelSmallButtonTemplate
        );

        this.removeButton = this.actionPanelDom.querySelector("#remove-button");

        this.addMaskPanel = new AddMaskPanel(
            this.actionPanelDom,
            actionContainerDom
        );

        this.undoButton = this.actionPanelDom.querySelector("#undo-button");
        this.redoButton = this.actionPanelDom.querySelector("#redo-button");

        return this;
    }

    init() {
        this.initCategorySelector();
        this.initRemoveButton();
        this.addMaskPanel.init();
        this.initUndoButton();
        this.initRedoButton();
    }

    initCategorySelector() {
        const toggleButton = this.categorySelector.getToggleButton();

        this.categorySelector.addCategorySelectionCallback((category) => {
            // Assign category to the selected masks
            const maskSelector = new MaskSelector();
            const selectedMasks = maskSelector.getSelectedMasks();

            if (selectedMasks.size > 0) {
                // Save record
                const core = new Core();
                core.recordData();
            }

            for (const mask of selectedMasks) {
                mask.setCategory(category);
            }
            maskSelector.clearSelection();

            // Update canvas visualization
            const canvas = new Canvas();
            canvas.updateMasks();
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.DEFAULT_STATE,
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

    initRemoveButton() {
        this.removeButton.addEventListener("click", () => {
            // Get the selected masks
            const maskSelector = new MaskSelector();
            const selectedMasks = maskSelector.getSelectedMasks();

            if (selectedMasks.size > 0) {
                // Record the data
                const core = new Core();
                core.recordData();
            }

            // Remove the selected masks
            const core = new Core();
            const data = core.getData();
            for (const mask of selectedMasks) {
                data.removeMask(mask);
            }

            // Clear the selection
            maskSelector.clearSelection();

            // Visualize the updated results
            const canvas = new Canvas();
            canvas.updateMasks();
        });

        // Add shortcut the remove button
        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.DEFAULT_STATE,
            "r",
            (event) => {
                const labelPanel = new LabelPanel();
                this.removeButton.click();
            }
        );
        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "r") {
                actionManager.handleShortCut(key, event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    initUndoButton() {
        this.undoButton.addEventListener("click", () => {
            const core = new Core();
            core.undo();
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.DEFAULT_STATE,
            "control+z",
            (event) => {
                this.undoButton.click();
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

    initRedoButton() {
        this.redoButton.addEventListener("click", () => {
            const core = new Core();
            core.redo();
        });

        // Register the shortcut for the label toggle button.
        // We need ActionManager to handle the shortcut because
        // different state will have different short cut operation.
        const actionManager = new ActionManager();
        actionManager.registerShortCut(
            ActionManager.DEFAULT_STATE,
            "control+y",
            (event) => {
                this.redoButton.click();
            }
        );
        document.addEventListener("keydown", (event) => {
            if (actionManager.haveRegisteredDocumentEvent(event)) {
                return;
            }
            const key = event.key.toLowerCase();
            if (key === "y" && event.ctrlKey) {
                actionManager.handleShortCut("control+y", event);
                actionManager.addRegisteredDocumentEvent(event);
            }
        });
    }

    hide() {
        this.actionPanelDom.classList.add("hidden");
    }

    show() {
        this.actionPanelDom.classList.remove("hidden");
    }

    updateCategoryButtons() {
        this.categorySelector.updateCategoryButtons();
        this.addMaskPanel.updateCategoryButtons();
    }

    getCategorySelector() {
        return this.categorySelector;
    }

    getPromptCategorySelector() {
        return this.addMaskPanel.getPromptCategorySelector();
    }
}
