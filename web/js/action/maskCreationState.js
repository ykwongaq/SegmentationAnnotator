import { MaskCreator } from "../label/maskCreator.js";
import { ActionState } from "./actionState.js";
import { Prompt } from "../label/maskCreator.js";

export class MaskCreationState extends ActionState {
    constructor(context) {
        super(context);

        this.maskCreator = new MaskCreator();
    }

    leftClickPixel(imageX, imageY) {
        this.maskCreator.addPrompt(imageX, imageY, Prompt.POSITIVE);
    }

    rightClickPixel(imageX, imageY) {
        this.maskCreator.addPrompt(imageX, imageY, Prompt.NEGATIVE);
    }
}
