class CategoryManager {
    static FOCUS_COLOR = "#0000FF"; // blue
    static REMOVE_COLOR = "#00FF00"; // green
    static DEFAULT_COLOR = "#FF0000"; // red
    static PROMPT_COLOR = "#1491ff";
    static DEFAULT_TEXT_COLOR = "#fff"; // white

    static STATUS_UNDEFINED = -1;

    static BLEACHED_BORDER_COLOR = "#D3D3D3";
    static DEAD_BORDER_COLOR = "#000000";

    static COLOR_LIST = [
        "#F6C3CB",
        // "#EB361C",
        "#FFA500",
        "#225437",
        "#F7D941",
        "#73FBFE",
        "#9EFCD6",
        "#2B00F7",
        "#F2AA34",
        "#EF7C76",
        "#BADFE5",
        "#BED966",
        "#CCE1FD",
        "#F188E9",
        "#6CFB45",
        "#7FCBAC",
        "#C9BFB6",
        "#163263",
        "#751608",
        "#54AFAA",
        "#5F0F63",
    ];

    static TEXT_COLOR = [
        "#fff",
        "#000",
        "#fff",
        "#fff",
        "#000",
        "#000",
        "#000",
        "#fff",
        "#000",
        "#000",
        "#000",
        "#000",
        "#000",
        "#000",
        "#000",
        "#000",
        "#000",
        "#fff",
        "#fff",
        "#fff",
        "#fff",
    ];

    constructor() {
        if (CategoryManager.instance) {
            return CategoryManager.instance;
        }

        CategoryManager.instance = this;

        /**
         * Category data is used to store the category information
         * Key: category id
         * Value: Dictionary containing category information
         */
        this.categoryDict = {};

        return this;
    }

    static getColorByCategoryId(categoryId) {
        if (categoryId == Category.UNDEFINED_ID) {
            return CategoryManager.DEFAULT_COLOR;
        } else if (categoryId == Category.PROMPT_ID) {
            return CategoryManager.PROMPT_COLOR;
        }
        return CategoryManager.COLOR_LIST[
            categoryId % CategoryManager.COLOR_LIST.length
        ];
    }

    static getBorderColorByCategoryId(categoryId) {
        return CategoryManager.getColorByCategoryId(categoryId);
    }

    static getTextColorByCategoryId(categoryId) {
        if (categoryId == Category.UNDEFINED_ID) {
            return CategoryManager.DEFAULT_TEXT_COLOR;
        }

        return CategoryManager.TEXT_COLOR[
            categoryId % CategoryManager.COLOR_LIST.length
        ];
    }

    getCategoryList() {
        const categoryList = [];
        for (const category of Object.values(this.categoryDict)) {
            categoryList.push(new Category(category["id"]));
        }
        return categoryList;
    }

    getCategoryNameByCategoryId(categoryId) {
        return this.categoryDict[categoryId]["name"];
    }

    getSuperCategoryNameByCategoryId(categoryId) {
        return this.categoryDict[categoryId]["supercategory"];
    }

    /**
     * Update the category list
     *
     * The input is the list of category dictionary following the coco format with additional entries:
     * 1. id
     * 2. name
     */
    updateCategoryList(categoryInfoList) {
        this.categoryDict = {};
        for (const categoryInfo of categoryInfoList) {
            const categoryId = categoryInfo["id"];
            this.categoryDict[categoryId] = categoryInfo;
        }
    }

    toJson() {
        const categoryInfo = [];
        for (const category of Object.values(this.categoryDict)) {
            categoryInfo.push(structuredClone(category));
        }
        return categoryInfo;
    }

    /**
     * Add new category. <br>
     * The manager will automatically find the
     * unused category id and super category id.
     *
     * @param {string} categoryName
     * @param {number} categoryId - If null, the manager will find the available category id
     * @returns {boolean} True if the category is successfully added
     */
    addCategory(categoryName, categoryId = null) {
        if (this.containsCategoryName(categoryName)) {
            return false;
        }

        const core = new Core();
        core.recordData();

        let newCategoryId = categoryId;
        if (newCategoryId === null) {
            newCategoryId = this.findAvailableCategoryId();
        }

        const categoryInfo = {};
        categoryInfo["id"] = newCategoryId;
        categoryInfo["name"] = categoryName;
        categoryInfo["supercategory"] = categoryName;

        this.categoryDict[newCategoryId] = categoryInfo;
        return true;
    }

    /**
     * Find the available category id
     * @returns {number} Available category id
     */
    findAvailableCategoryId() {
        let categoryId = 0;
        for (let i = 0; i <= Object.keys(this.categoryDict).length; i++) {
            if (!(categoryId.toString() in this.categoryDict)) {
                break;
            }
            categoryId++;
        }
        return categoryId;
    }

    /**
     * Check if the category name is already in the category list
     * @param {string} categoryName
     * @returns {boolean} True if the category name is already in the category list
     */
    containsCategoryName(categoryName) {
        for (const category of Object.values(this.categoryDict)) {
            if (category["name"] === categoryName) {
                return true;
            }
        }
        return false;
    }

    /**
     * Remove the category from the category list and the super category list.
     * If you have a list of category, please use removeCategories instead,
     * because it may affect the history manager.
     * @param {Category} category
     */
    removeCategory(category) {
        const categoryId = category.getCategoryId();
        // Remove the category from the category list
        delete this.categoryDict[categoryId];
    }

    /**
     * Rename the target category into the new category name. <br>
     *
     * It is assumed that if the given category is a coral, then it
     * should be at healthy status. <br>
     *
     * If the category is a coral, then rename the bleached category as well.
     * @param {Category} category - The category to be renamed
     * @param {string} newCategoryName - The new category name
     */
    renameCategory(category, newCategoryName) {
        // Rename the category
        this.renameCategory_(category, newCategoryName);
    }

    renameCategory_(category, newCategoryName) {
        const categoryId = category.getCategoryId();
        // Update the category name
        this.categoryDict[categoryId]["name"] = newCategoryName;
        this.categoryDict[categoryId]["supercategory"] = newCategoryName;
    }
}

class Category {
    static UNDEFINED_ID = -1;
    static PROMPT_ID = -2;

    constructor(categoryId) {
        this.categoryId = categoryId;
    }

    /**
     * Get category id of the category.
     *
     * If the coral category is a bleached category,
     * there will be a "Bleaced " prefix in the category name.
     * @returns {number} Category id
     */
    getCategoryId() {
        return this.categoryId;
    }

    /**
     * Get the category name
     * @returns {string} Category name
     */
    getCategoryName() {
        const categoryManager = new CategoryManager();
        return categoryManager.getCategoryNameByCategoryId(this.categoryId);
    }

    getSuperCategoryName() {
        const categoryManager = new CategoryManager();
        return categoryManager.getSuperCategoryNameByCategoryId(
            this.categoryId
        );
    }

    /**
     * Icon name show the category id (e.g. 1).
     *
     * If the category is a bleached category,
     * the icon name will be "1B" with a 'B' at the back.
     * @returns {string} Icon name
     */
    getIconName() {
        let categoryId = this.getCategoryId();
        return `${categoryId}`;
    }

    /**
     * Get the mask color (e.g. "#F6C3CB")
     * @returns {string} Mask color
     */
    getMaskColor() {
        return CategoryManager.getColorByCategoryId(this.getCategoryId());
    }

    /**
     * Get the text color (e.g. "#fff")
     * @returns {string} Text color
     */
    getTextColor() {
        return CategoryManager.getTextColorByCategoryId(this.getCategoryId());
    }

    /**
     * Get the border color (e.g. "#D3D3D3")
     * @returns {string} Border color
     */
    getBorderColor() {
        return CategoryManager.getBorderColorByCategoryId(this.getCategoryId());
    }
}

class Mask {
    constructor(annotation) {
        this.annotation = annotation;
        this.maskId = annotation["id"];

        const categoryId = annotation["category_id"];
        this.category = new Category(categoryId);

        this.decodeMask = null;
        this.shouldDisplay_ = true;

        this.area = annotation["area"];
        this.width = annotation["segmentation"]["size"][1];
        this.height = annotation["segmentation"]["size"][0];
    }

    getId() {
        return this.maskId;
    }

    setId(maskId) {
        this.maskId = maskId;
        this.annotation["id"] = maskId;
    }

    getCategory() {
        return this.category;
    }

    setCategory(category) {
        this.category = category;
        this.annotation["category_id"] = category.getCategoryId();
    }

    getArea() {
        return this.area;
    }

    getWidth() {
        return this.width;
    }

    getHeight() {
        return this.height;
    }

    shouldDisplay() {
        return this.shouldDisplay_;
    }

    setShouldDisplay(shouldDisplay) {
        this.shouldDisplay_ = shouldDisplay;
    }

    getDecodedMask() {
        if (this.decodeMask === null) {
            this.decodeMask = this.decodeRleMask(this.annotation["rle"]);
        }
        return this.decodeMask;
    }

    decodeRleMask(rle_mask) {
        const totalLength = rle_mask.reduce((sum, len) => sum + len, 0);
        const mask = new Uint8Array(totalLength); // Use Uint8Array for better performance

        let index = 0;
        let value = 0;

        for (let i = 0; i < rle_mask.length; i++) {
            const length = rle_mask[i];
            mask.fill(value, index, index + length);
            index += length;
            value = 1 - value; // Toggle between 0 and 1
        }

        return mask;
    }

    getMiddlePoint() {
        const mask = this.getDecodedMask();
        let x_sum = 0;
        let y_sum = 0;
        let count = 0;

        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === 1) {
                const x = i % this.width;
                const y = Math.floor(i / this.width);
                x_sum += x;
                y_sum += y;
                count++;
            }
        }

        if (count === 0) return null; // Handle the case where no points are found

        const middle_x = Math.floor(x_sum / count);
        const middle_y = Math.floor(y_sum / count);
        return [middle_x, middle_y];
    }

    getMaskColor() {
        if (this.isSelected()) {
            return CategoryManager.FOCUS_COLOR;
        }
        return this.category.getMaskColor();
    }

    isSelected() {
        const maskSelector = new MaskSelector();
        return maskSelector.isSelected(this);
    }

    /**
     * Check if the mask contains the pixel
     * @param {number} x
     * @param {number} y
     * @returns {boolean} True if the mask contains the pixel
     */
    containPixel(x, y) {
        const mask = this.getDecodedMask();
        return mask[y * this.width + x] === 1;
    }

    getImageId() {
        return this.annotation["image_id"];
    }

    toJson() {
        return {
            id: this.getId(),
            image_id: this.getImageId(),
            category_id: this.category.getCategoryId(),
            segmentation: structuredClone(this.annotation["segmentation"]),
            area: this.getArea(),
            bbox: this.annotation["bbox"],
            iscrowd: this.annotation["iscrowd"],
            predicted_iou: this.annotation["predicted_iou"],
        };
    }

    deepCopy() {
        const annotation = JSON.parse(JSON.stringify(this.annotation));
        return new Mask(annotation);
    }
}

class Data {
    constructor() {
        this.imageName = null;
        this.imagePath = null;
        this.idx = null;
        this.masks = [];
        this.imageWidth = null;
        this.imageHeight = null;
    }

    /**
     * Parse server response into data object
     * @param {Object} response
     * @returns {Data} Created data object
     */
    static parseResponse(response) {
        const data = new Data();
        data.setImageName(response["image_name"]);
        data.setImagePath(response["image_path"]);
        data.setIdx(response["idx"]);
        data.setImageWidth(response["segmentation"]["images"][0]["width"]);
        data.setImageHeight(response["segmentation"]["images"][0]["height"]);

        const masks = [];
        for (const annotation of response["segmentation"]["annotations"]) {
            masks.push(new Mask(annotation));
        }
        data.setMasks(masks);

        return data;
    }

    setImageName(imageName) {
        this.imageName = imageName;
    }

    setImagePath(imagePath) {
        this.imagePath = imagePath;
    }

    setIdx(idx) {
        this.idx = idx;
    }

    getImageName() {
        return this.imageName;
    }

    getImagePath() {
        return encodeURIComponent(this.imagePath);
    }

    getIdx() {
        return this.idx;
    }

    setImageWidth(width) {
        this.imageWidth = width;
    }

    setImageHeight(height) {
        this.imageHeight = height;
    }

    getImageWidth() {
        return this.imageWidth;
    }

    getImageHeight() {
        return this.imageHeight;
    }

    setMasks(masks) {
        this.masks = masks;
    }

    getMasks() {
        return this.masks;
    }

    toJson() {
        const masks = [];
        for (const mask of this.masks) {
            masks.push(mask.toJson());
        }

        const images = [];
        const image = {
            id: this.idx,
            file_name: this.imageName,
            width: this.imageWidth,
            height: this.imageHeight,
        };
        images.push(image);

        return {
            images: images,
            annotations: masks,
        };
    }

    removeMask(mask) {
        this.masks = this.masks.filter((m) => m !== mask);
    }

    /**
     * Add the given mask into this data.
     *
     * The mask id will be automatically assigned.
     *
     * The category of the mask will be updated if the
     * category is -2 (prompting mask)
     *
     * @param {Mask} mask
     */
    addMask(mask) {
        // Update mask id
        const maskId = this.findAvailableMaskId();
        mask.setId(maskId);

        // Update mask category
        if (mask.getCategory().getCategoryId() === Category.PROMPT_ID) {
            const newCategory = new Category(Category.UNDEFINED_ID);
            mask.setCategory(newCategory);
        }

        this.masks.push(mask);

        // Verify that all mask ids are unique
        const maskIds = new Set();
        for (const mask of this.masks) {
            maskIds.add(mask.getId());
        }
        if (maskIds.size !== this.masks.length) {
            console.error("Mask ids are not unique");
        }
    }

    findAvailableMaskId() {
        const existingMaskIds = new Set();
        for (const mask of this.masks) {
            existingMaskIds.add(mask.getId());
        }

        let maskId = 0;
        for (let i = 0; i <= existingMaskIds.size; i++) {
            if (!existingMaskIds.has(maskId)) {
                break;
            }
            maskId++;
        }

        return maskId;
    }

    deepCopy() {
        const data = new Data();
        data.setImageName(this.imageName);
        data.setImagePath(this.imagePath);
        data.setIdx(this.idx);
        data.setImageWidth(this.imageWidth);
        data.setImageHeight(this.imageHeight);

        const masks = [];
        for (const mask of this.masks) {
            masks.push(mask.deepCopy());
        }
        data.setMasks(masks);

        return data;
    }
}
