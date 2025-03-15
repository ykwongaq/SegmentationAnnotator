import { ActionState } from "./actionState.js";
import { MaskSelector } from "./maskSelector.js";
import { Manager } from "../manager.js";

export class MaskSelectionState extends ActionState {
    constructor(context) {
        super(context);
    }

    /**
     * Do nothing
     * @param {number} imageX
     * @param {number} imageY
     */
    rightClickPixel(imageX, imageY) {}

    /**
     * Check is any mask is clicked.
     * If clicked, toggle the mask selection
     * @param {number} imageX
     * @param {number} imageY
     */
    leftClickPixel(imageX, imageY) {
        const manager = new Manager();
        const core = manager.getCore();
        const data = core.getData();
        const masks = data.getMasks();

        const maskSelector = new MaskSelector();
        for (const mask of masks) {
            if (mask.containPixel(imageX, imageY)) {
                if (maskSelector.isSelected(mask)) {
                    maskSelector.unselectMask(mask);
                } else {
                    maskSelector.selectMask(mask);
                }
            }
        }

        const canvas = manager
            .getToolInterface()
            .getAnnotationPage()
            .getCanvas();
        canvas.updateMasks();
    }
}
