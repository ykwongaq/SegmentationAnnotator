class NavigationBar {
    static GALLERY_PAGE = "galleryPage";
    static ANNOTATION_PAGE = "annotationPage";
    static STATISTIC_PAGE = "statisticPage";

    constructor(dom) {
        if (NavigationBar.instance) {
            return NavigationBar.instance;
        }
        NavigationBar.instance = this;
        this.dom = dom;

        this.galleryButton = this.dom.querySelector("#gallery-button");
        this.labelButton = this.dom.querySelector("#label-button");
        this.importJsonButton = this.dom.querySelector("#import-json-button");

        this.exportButton = this.dom.querySelector("#file-button");
        this.exportDropDownMenu = this.dom.querySelector("#file-dropdown-menu");
        this.exportImageButton = this.dom.querySelector("#export-image-button");
        this.exportAnnotatedImageButton = this.dom.querySelector(
            "#export-annotated-image-button"
        );
        this.exportCOCOButton = this.dom.querySelector("#export-coco-button");
        this.exportAllButton = this.dom.querySelector("#export-all-button");

        this.saveDropdownButton = this.dom.querySelector(
            "#save-drop-down-button"
        );
        this.saveButton = this.dom.querySelector("#save-button");
        this.saveToButton = this.dom.querySelector("#save-to-button");
        this.saveDropDownMenu = this.dom.querySelector(
            "#file-dropdown-menu-save"
        );

        this.pages = document.querySelectorAll(".page");
        this.currentPageId = null;
    }

    init() {
        this.initGalleryButton();
        this.initLabelButton();
        this.initExportButton();
        this.initImportJsonButton();
        this.initSave();
    }

    initGalleryButton() {
        this.galleryButton.addEventListener("click", () => {
            this.showPage(NavigationBar.GALLERY_PAGE);
        });
    }

    initLabelButton() {
        this.labelButton.addEventListener("click", () => {
            this.showPage(NavigationBar.ANNOTATION_PAGE);
            const canvas = new Canvas();
            canvas.resetViewpoint();
        });
    }

    initImportJsonButton() {
        this.importJsonButton.addEventListener("click", () => {
            const core = new Core();
            core.importJson();
        });
    }

    initExportButton() {
        this.exportButton.addEventListener("click", () => {
            this.exportDropDownMenu.style.display =
                this.exportDropDownMenu.style.display === "block"
                    ? "none"
                    : "block";
        });

        this.exportImageButton.addEventListener("click", () => {
            const core = new Core();
            core.save(() => {
                this.disable();
                core.selectFolder(null, (fileFolder) => {
                    if (fileFolder === null) {
                        console.log("No folder selected");
                        this.enable();
                        return;
                    }

                    const loadingPopManager = new LoadingPopManager();
                    loadingPopManager.clear();
                    loadingPopManager.updateLargeText("Exporting");
                    loadingPopManager.updateText(
                        "Exporting the images. Please wait."
                    );
                    loadingPopManager.show();

                    core.exportImages(
                        fileFolder,
                        () => {
                            loadingPopManager.hide();
                            this.enable();
                        },
                        (error) => {
                            console.error(error);
                            loadingPopManager.hide();
                            this.enable();
                        }
                    );
                });
            });
        });

        this.exportAnnotatedImageButton.addEventListener("click", () => {
            const core = new Core();
            core.save(() => {
                this.disable();
                core.selectFolder(null, (fileFolder) => {
                    if (fileFolder === null) {
                        this.enable();
                        return;
                    }

                    const loadingPopManager = new LoadingPopManager();
                    loadingPopManager.clear();
                    loadingPopManager.updateLargeText("Exporting");
                    loadingPopManager.updateText(
                        "Exporting the annotated images. Please wait."
                    );
                    loadingPopManager.addButton("quit-button", "Quit", () => {
                        loadingPopManager.updateLargeText("Terminating");
                        loadingPopManager.updateText(
                            "Terminating the process. Please wait."
                        );
                        loadingPopManager.addProperty("terminate", true);
                        this.enable();
                    });
                    loadingPopManager.show();

                    core.exportAnnotatedImages(
                        fileFolder,
                        () => {
                            loadingPopManager.hide();
                            this.enable();
                        },
                        (error) => {
                            console.error(error);
                            loadingPopManager.hide();
                            this.enable();
                        }
                    );
                });
            });
        });

        this.exportCOCOButton.addEventListener("click", () => {
            const core = new Core();
            core.save(() => {
                this.disable();

                const request = new FileDialogRequest();
                request.setTitle("Select the folder to save the coco json");
                request.addFileType("COCO JSON File", ["*.json"]);
                request.setDefaultExt(".json");

                core.selectSaveFile(request, (filePath) => {
                    if (filePath === null) {
                        this.enable();
                        return;
                    }

                    const loadingPopManager = new LoadingPopManager();
                    loadingPopManager.clear();
                    loadingPopManager.updateLargeText("Exporting");
                    loadingPopManager.updateText(
                        "Exporting the coco json. Please wait."
                    );
                    loadingPopManager.show();

                    core.exportCOCO(
                        filePath,
                        () => {
                            loadingPopManager.hide();
                            this.enable();
                        },
                        (error) => {
                            console.error(error);
                            loadingPopManager.hide();
                            this.enable();
                        }
                    );
                });
            });
        });

        this.exportAllButton.addEventListener("click", () => {
            const core = new Core();
            core.save(() => {
                this.disable();
                core.selectFolder(null, (fileFolder) => {
                    if (fileFolder === null) {
                        this.enable();
                        return;
                    }

                    const loadingPopManager = new LoadingPopManager();
                    loadingPopManager.clear();
                    loadingPopManager.updateLargeText("Exporting");
                    loadingPopManager.updateText(
                        "Exporting all the files. Please wait."
                    );
                    loadingPopManager.show();

                    core.exportImages(
                        fileFolder,
                        () => {
                            core.exportAnnotatedImages(
                                fileFolder,
                                () => {
                                    core.exportCOCO(
                                        fileFolder,
                                        () => {
                                            loadingPopManager.hide();
                                            this.enable();
                                        },
                                        (error) => {
                                            console.error(error);
                                            loadingPopManager.hide();
                                            this.enable();
                                        }
                                    );
                                },
                                (error) => {
                                    console.error(error);
                                    loadingPopManager.hide();
                                    this.enable();
                                }
                            );
                        },
                        (error) => {
                            console.error(error);
                            loadingPopManager.hide();
                            this.enable();
                        }
                    );
                });
            });
        });

        window.addEventListener("click", (event) => {
            if (!event.target.matches("#file-button")) {
                this.exportDropDownMenu.style.display = "none";
            }
        });
    }

    initSave() {
        this.saveDropdownButton.addEventListener("click", () => {
            // When the save button is clicked, show the save dropdown menu
            this.saveDropDownMenu.style.display =
                this.saveDropDownMenu.style.display === "block"
                    ? "none"
                    : "block";
        });

        this.saveButton.addEventListener("click", () => {
            this.disable();
            const loadingPopManager = new LoadingPopManager();
            loadingPopManager.clear();
            loadingPopManager.updateLargeText("Save");
            loadingPopManager.updateText(
                "Saving the current project. Please wait."
            );
            loadingPopManager.show();

            const core = new Core();
            // Save the current data first and then save the dataset
            core.save(
                () => {
                    core.saveDataset(
                        null,
                        () => {
                            loadingPopManager.hide();
                            this.enable();
                        },
                        (error) => {
                            console.error(error);
                            loadingPopManager.hide();
                            this.enable();
                        }
                    );
                },
                (error) => {
                    loadingPopManager.hide();
                    console.error(error);
                    this.enable();
                }
            );
        });

        this.saveToButton.addEventListener("click", () => {
            const core = new Core();
            core.save(() => {
                this.disable();
                const fileDialogRequest = new FileDialogRequest();
                fileDialogRequest.setTitle("Save SAT Project File");
                fileDialogRequest.addFileType("SAT Project File", "*.sat");
                fileDialogRequest.setDefaultExt(".sat");

                core.selectSaveFile(fileDialogRequest, (filePath) => {
                    if (filePath === null) {
                        this.enable();
                        return;
                    }

                    const loadingPopManager = new LoadingPopManager();
                    loadingPopManager.clear();
                    loadingPopManager.updateLargeText("Save");
                    loadingPopManager.updateText(
                        "Saving the current project. Please wait."
                    );
                    loadingPopManager.show();

                    core.saveDataset(
                        filePath,
                        () => {
                            loadingPopManager.hide();
                            this.enable();
                        },
                        (error) => {
                            console.error(error);
                            loadingPopManager.hide();
                            this.enable();
                        }
                    );
                });
            });
        });

        window.addEventListener("click", (event) => {
            if (!event.target.matches("#save-drop-down-button")) {
                this.saveDropDownMenu.style.display = "none";
            }
        });
    }

    showPage(pageId) {
        this.clearActiveState();
        switch (this.currentPageId) {
            case NavigationBar.GALLERY_PAGE:
                // TODO: Handle leaving the gallery page
                break;
            case NavigationBar.ANNOTATION_PAGE:
                // TODO: Handle leaving the annotation page
                break;
            case NavigationBar.STATISTIC_PAGE:
                // TODO: Handle leaving the annotation page
                break;
            default:
                break;
        }

        this.currentPageId = pageId;
        const page = document.getElementById(pageId);
        page.classList.add("active-page");
    }

    getCurrentPageId() {
        return this.currentPageId;
    }

    clearActiveState() {
        for (const page of this.pages) {
            page.classList.remove("active-page");
        }
    }

    disable() {
        this.galleryButton.disabled = true;
        this.labelButton.disabled = true;
        this.exportButton.disabled = true;
        this.importJsonButton.disabled = true;
        this.disableExport();
        this.disableSave();
    }

    enable() {
        this.galleryButton.disabled = false;
        this.labelButton.disabled = false;
        this.exportButton.disabled = false;
        this.importJsonButton.disabled = false;
        this.enableExport();
        this.enableSave();
    }

    disableExport() {
        this.exportImageButton.disabled = true;
        this.exportAnnotatedImageButton.disabled = true;
        this.exportCOCOButton.disabled = true;
        this.exportAllButton.disabled = true;
    }

    enableExport() {
        this.exportImageButton.disabled = false;
        this.exportAnnotatedImageButton.disabled = false;
        this.exportCOCOButton.disabled = false;
        this.exportAllButton.disabled = false;
    }

    disableSave() {
        this.saveButton.disabled = true;
        this.saveToButton.disabled = true;
    }

    enableSave() {
        this.saveButton.disabled = false;
        this.saveToButton.disabled = false;
    }
}
