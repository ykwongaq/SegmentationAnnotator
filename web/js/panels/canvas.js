import { ActionManager } from "../action/actionManager.js";
import { Mask, Data } from "../data/index.js";
import { Prompt } from "../action/maskCreator.js";

export class Canvas {
    constructor(dom) {
        this.canvas = dom;
        this.ctx = this.canvas.getContext("2d");

        /** @type {Data} */
        this.data = null;

        // Canvas for segmentation visualization
        this.maskCanvas = document.createElement("canvas");
        this.maskCtx = this.maskCanvas.getContext("2d", {
            willReadFrequently: true,
        });
        this.borderCanvas = document.createElement("canvas");
        this.borderCtx = this.borderCanvas.getContext("2d");
        this.textCanvas = document.createElement("canvas");
        this.textCtx = this.textCanvas.getContext("2d");
        /** @type {Set<Mask>}*/
        this.previousMasks = new Set();

        // Final imags that we draw from
        this.imageCache = new Image();
        this.maskCache = new Image();
        this.textCache = new Image();
        this.borderCache = new Image();
        this.promptingMaskCache = new Image();

        // View control
        this.scale = 1.0;
        this.origin = { x: 0, y: 0 };
        this.zoomIntensity = 0.2;
        this.zoomStep = 0.4;
        this.image_top_left = { x: 0, y: 0 };
        this.image_bottom_right = { x: 0, y: 0 };
        this.isDragging = false;
        this.lastRightMousePos = { x: 0, y: 0 };

        // Mask Display
        this.showMask = true;
        this.maskOpacity = 0.4;

        // Image
        this.imageWidth = 0;
        this.imageHeight = 0;

        // Prompting mask
        this.promtedMaskColor = `rgba (${30 / 255}, ${144 / 255}, ${
            255 / 255
        }, 0.6)`;
        this.promptedMask = null;
    }

    init() {
        this.enableZoom();
        this.enableDrag();
        this.enableWindowResize();
        this.enableMaskSelection();
    }

    enableZoom() {
        this.canvas.onwheel = (event) => {
            event.preventDefault();
            // Get mouse offset.
            const [mouseX, mouseY] = this.getMousePos(event);
            // Normalize mouse wheel movement to +1 or -1 to avoid unusual jumps.
            const wheel = event.deltaY < 0 ? 1 : -1;
            // Compute zoom factor.
            const zoom = Math.exp(wheel * this.zoomIntensity);
            this.origin.x -= mouseX / (this.scale * zoom) - mouseX / this.scale;
            this.origin.y -= mouseY / (this.scale * zoom) - mouseY / this.scale;
            this.scale *= zoom;
        };
    }

    enableDrag() {
        const rightMouseKey = 2;
        this.canvas.addEventListener("mousedown", (event) => {
            event.preventDefault();
            if (event.button === rightMouseKey) {
                this.isDragging = true;
                const [mouseX, mouseY] = this.getMousePos(event);
                this.lastRightMousePos = {
                    x: mouseX,
                    y: mouseY,
                };
            }
        });

        this.canvas.addEventListener("mousemove", (event) => {
            event.preventDefault();
            if (this.isDragging) {
                const [mouseX, mouseY] = this.getMousePos(event);
                const dx = (mouseX - this.lastRightMousePos.x) / this.scale;
                const dy = (mouseY - this.lastRightMousePos.y) / this.scale;
                this.origin.x -= dx;
                this.origin.y -= dy;
                this.lastRightMousePos = { x: mouseX, y: mouseY };
            }
        });

        this.canvas.addEventListener("mouseup", (event) => {
            event.preventDefault();
            if (event.button === rightMouseKey) {
                this.isDragging = false;
            }
        });

        this.canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
    }

    enableWindowResize() {
        window.addEventListener("resize", () => {
            this.resetViewpoint();
        });
    }

    enableMaskSelection() {
        this.canvas.addEventListener("click", (event) => {
            event.preventDefault();

            let [canvasX, canvasY] = this.getMousePos(event);
            canvasX = Math.floor(canvasX);
            canvasY = Math.floor(canvasY);

            let [imageX, imageY] = this.canvasPixelToImagePixel(
                canvasX,
                canvasY
            );

            const imageHeight = this.data.getImageHeight();
            const imageWidth = this.data.getImageWidth();

            if (
                imageX < 0 ||
                imageX >= imageWidth ||
                imageY < 0 ||
                imageY >= imageHeight
            ) {
                return;
            }

            const actionManager = new ActionManager();
            actionManager.leftClickPixel(imageX, imageY);
        });

        this.canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();

            let [canvasX, canvasY] = this.getMousePos(event);
            canvasX = Math.floor(canvasX);
            canvasY = Math.floor(canvasY);

            let [imageX, imageY] = this.canvasPixelToImagePixel(
                canvasX,
                canvasY
            );

            const imageHeight = this.data.getImageHeight();
            const imageWidth = this.data.getImageWidth();

            if (
                imageX < 0 ||
                imageX >= imageWidth ||
                imageY < 0 ||
                imageY >= imageHeight
            ) {
                return;
            }

            const actionManager = new ActionManager();
            actionManager.rightClickPixel(imageX, imageY);
        });
    }

    showData(data) {
        this.data = data;

        this.previousMasks.clear();
        const imagePath = this.data.getImagePath();
        if (!imagePath) {
            console.error("Image path is not valid: ", imagePath);
            return;
        }

        this.imageCache.src = imagePath;
        this.imageCache.onload = () => {
            this.imageWidth = this.data.getImageWidth();
            this.imageHeight = this.data.getImageHeight();

            this.maskCanvas.width = this.imageWidth;
            this.maskCanvas.height = this.imageHeight;

            this.borderCanvas.width = this.imageWidth;
            this.borderCanvas.height = this.imageHeight;

            this.textCanvas.width = this.imageWidth;
            this.textCanvas.height = this.imageHeight;

            this.resetViewpoint();
            this.updateMasks();
            this.draw();
        };
    }

    // Helper function to convert hex color to RGB
    hexToRGB(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    draw = () => {
        if (!this.data || !this.imageCache.src) {
            return;
        }

        this.ctx.clearRect(
            this.origin.x,
            this.origin.y,
            this.canvas.width / this.scale,
            this.canvas.height / this.scale
        );
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset the transform matrix
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.origin.x, -this.origin.y);

        this.resetImageBoundary();
        this.image_top_left = {
            x: Math.floor(-this.origin.x * this.scale),
            y: Math.floor(-this.origin.y * this.scale),
        };
        this.image_bottom_right = {
            x: Math.floor(
                -this.origin.x * this.scale + this.imageWidth * this.scale
            ),
            y: Math.floor(
                -this.origin.y * this.scale + this.imageHeight * this.scale
            ),
        };

        this.ctx.drawImage(this.imageCache, 0, 0);

        if (this.shouldShowMask()) {
            this.ctx.globalAlpha = this.maskOpacity;
            this.ctx.drawImage(this.maskCache, 0, 0);
            this.ctx.globalAlpha = 1.0;
            this.ctx.drawImage(this.borderCache, 0, 0);
            this.ctx.drawImage(this.textCache, 0, 0);
        }

        if (this.promptedMask !== null) {
            this.ctx.globalAlpha = 0.7;
            this.ctx.drawImage(this.promptingMaskCache, 0, 0);
            this.ctx.globalAlpha = 1.0;
        }

        window.requestAnimationFrame(this.draw);
    };

    /**
     * Update the visualization of segmentation masks. <br/>
     *
     * Visualization include the segmentation area, boundary, and text. <br/>
     *
     * To improve the efficiency, we only update the visualization of the modified masks. <br/>
     */
    updateMasks() {
        const incomingMasks = this.data.getMasks();

        // First, we remove the outdated masks
        const outdatedMasks = this.detectedOutdatedMasks();

        // We also remove the masks that should not be displayed
        for (const mask of incomingMasks) {
            if (!mask.shouldDisplay()) {
                outdatedMasks.add(mask);
            }
        }

        for (const mask of outdatedMasks) {
            this.removeMask(mask);
        }

        // Then, we update the modified masks
        const renderMasks = this.detectRenderMasks();
        for (const mask of renderMasks) {
            this.drawMask(mask);
        }

        this.maskCache.src = this.maskCanvas.toDataURL();
        this.borderCache.src = this.borderCanvas.toDataURL();
        this.textCache.src = this.textCanvas.toDataURL();

        // Finally, we reset the modificaiton status of the masks
        for (const mask of incomingMasks) {
            mask.setModified(false);
        }
        this.previousMasks.clear();
        for (const mask of incomingMasks) {
            this.previousMasks.add(mask);
        }
    }

    /**
     * Detect the outdated masks. <br/>
     * @returns {Set<Mask>} The list of outdated masks
     */
    detectedOutdatedMasks() {
        // There are three type of modification: add, delete, and update
        // Outdated masks is the masks that is updated, and deleted
        const outdatedMasks = new Set();

        // Detect updated masks
        for (const mask of this.previousMasks) {
            if (mask.isModified()) {
                outdatedMasks.add(mask);
            }
        }

        // Detect deleted masks
        // For deleted masks, we detect is there any mask that is not included in the incoming masks
        const incomingMasks = this.data.getMasks();
        for (const mask of this.previousMasks) {
            if (!incomingMasks.includes(mask)) {
                outdatedMasks.add(mask);
            }
        }

        return outdatedMasks;
    }

    detectRenderMasks() {
        // There are three type of modificaiton: add, delete, and update
        // Masks that need to render is the masks that is added, and updated.
        const modifiedMasks = new Set();
        const incomingMasks = this.data.getMasks();

        // Detect updated maks
        for (const mask of incomingMasks) {
            if (mask.isModified()) {
                modifiedMasks.add(mask);
            }
        }

        // Detect added masks
        for (const mask of incomingMasks) {
            if (!this.previousMasks.has(mask)) {
                modifiedMasks.add(mask);
            }
        }

        // For add masks, we detect is there any new mask that is not included in the
        return modifiedMasks;
    }

    /**
     * Example optimization for borders: Instead of a full double loop with neighbor checks for every pixel,
     * consider that we already have each mask’s data. We quickly detect boundary by scanning each mask’s array.
     */
    drawBorderes() {
        const borderCanvas = document.createElement("canvas");
        const borderCtx = borderCanvas.getContext("2d");
        borderCanvas.width = this.imageWidth;
        borderCanvas.height = this.imageHeight;

        const masks = this.data.getMasks();
        // We’ll use the native drawing on canvas, but reduce overhead by drawing small “dots” only at borders.
        const radius = Math.min(this.imageWidth, this.imageHeight) * 0.0015;

        for (const mask of masks) {
            if (!mask.shouldDisplay()) continue;

            const maskData = mask.getDecodedMask();
            const borderColor = mask.getCategory().getBorderColor();

            // We check neighbors only in four directions: left, right, up, down
            const width = this.imageWidth;
            for (let i = 0; i < maskData.length; i++) {
                if (maskData[i] === 1) {
                    // Compute x,y
                    const x = i % width;
                    const y = (i / width) | 0; // integer division

                    // Compare neighbors
                    if (
                        (x > 0 && maskData[i - 1] === 0) || // Left
                        (x < width - 1 && maskData[i + 1] === 0) || // Right
                        (y > 0 && maskData[i - width] === 0) || // Up
                        (y < this.imageHeight - 1 && maskData[i + width] === 0) // Down
                    ) {
                        this.drawDot(borderCtx, x, y, radius, borderColor);
                    }
                }
            }
        }

        this.borderCache = new Image();
        this.borderCache.src = borderCanvas.toDataURL();
    }

    /**
     * Simple helper for drawing a small circle (dot) on the border canvas.
     */
    drawDot(ctx, x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }

    removeDot(ctx, x, y, radius) {
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    removeMask(mask) {
        this.removeSegmentationArea(mask);
        this.removeBorder(mask);
        this.removeText(mask);
    }

    removeSegmentationArea(mask) {
        const width = this.imageWidth;
        const height = this.imageHeight;

        const maskData = mask.getDecodedMask();

        const imageData = this.maskCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const includedPixel = new Set();
        for (let i = 0; i < maskData.length; i++) {
            const maskValue = maskData[i];
            if (maskValue == 0) {
                continue;
            }

            includedPixel.add(i);

            const index = i * 4;
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 0; // fully transparent
        }
        this.maskCtx.putImageData(imageData, 0, 0);

        // Check is there any other mask that is affected by this removal
        const affectedMasks = new Set();
        for (const otherMask of this.data.getMasks()) {
            if (otherMask === mask) {
                continue;
            }
            for (const i of includedPixel) {
                if (otherMask.containPixel(i % width, (i / width) | 0)) {
                    affectedMasks.add(otherMask);
                }
            }
        }

        // When there are affected masks, we need to redraw the segmentation area
        for (const affectedMask of affectedMasks) {
            this.drawSegmentationArea(affectedMask);
        }
    }

    removeBorder(mask) {
        const width = this.imageWidth;
        const height = this.imageHeight;
        const maskData = mask.getDecodedMask(); // Uint8Array of 0/1
        const radius = Math.min(width, height) * 0.0015;

        const borderPixels = new Set();
        const affectedMasks = new Set();
        for (let i = 0; i < maskData.length; i++) {
            if (maskData[i] === 1) {
                const x = i % width;
                const y = (i / width) | 0;

                if (
                    (x > 0 && maskData[i - 1] === 0) ||
                    (x < width - 1 && maskData[i + 1] === 0) ||
                    (y > 0 && maskData[i - width] === 0) ||
                    (y < height - 1 && maskData[i + width] === 0)
                ) {
                    this.removeDot(this.borderCtx, x, y, radius * 1.3);
                    borderPixels.add(i);
                }
            }
        }

        // Check is there any other mask that is affected by this removal
        for (const otherMask of this.data.getMasks()) {
            if (otherMask === mask) {
                continue;
            }
            for (const i of borderPixels) {
                if (otherMask.containPixel(i % width, (i / width) | 0)) {
                    affectedMasks.add(otherMask);
                }
            }
        }

        // When there are affected masks, we need to redraw the border
        for (const affectedMask of affectedMasks) {
            this.drawBorder(affectedMask);
        }
    }

    removeText(mask) {
        const middle_pixel = mask.getMiddlePoint();
        const width = this.imageWidth;
        const height = this.imageHeight;

        const fontSize = Math.min(
            Math.floor(Math.min(width, height) * 0.04),
            40
        );
        const fontBgRadius = fontSize * 0.75;

        this.removeDot(
            this.textCtx,
            middle_pixel[0] + fontBgRadius / 2,
            middle_pixel[1] - fontBgRadius / 2,
            fontBgRadius * 1.3
        );

        const affectedMasks = new Set();
        for (const otherMask of this.data.getMasks()) {
            if (otherMask === mask) {
                continue;
            }

            const otherMiddlePixel = otherMask.getMiddlePoint();
            const dx = middle_pixel[0] + fontBgRadius / 2 - otherMiddlePixel[0];
            const dy = middle_pixel[1] - fontBgRadius / 2 - otherMiddlePixel[1];
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= fontBgRadius) {
                affectedMasks.add(otherMask);
            }
        }

        for (const affectedMask of affectedMasks) {
            this.drawText(affectedMask);
        }
    }

    drawMask(mask) {
        this.drawSegmentationArea(mask);
        this.drawBorder(mask);
        this.drawText(mask);
    }

    drawSegmentationArea(mask) {
        const width = this.imageWidth;
        const height = this.imageHeight;

        const maskData = mask.getDecodedMask();

        const maskColor = this.hexToRGB(mask.getMaskColor());

        const imageData = this.maskCtx.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let i = 0; i < maskData.length; i++) {
            const maskValue = maskData[i];
            if (maskValue == 0) {
                continue;
            }

            const index = i * 4;
            data[index] = maskColor[0];
            data[index + 1] = maskColor[1];
            data[index + 2] = maskColor[2];
            data[index + 3] = 255; // fully opaque
        }

        this.maskCtx.putImageData(imageData, 0, 0);
    }

    drawBorder(mask) {
        const width = this.imageWidth;
        const height = this.imageHeight;
        const maskData = mask.getDecodedMask(); // Uint8Array of 0/1
        const radius = Math.min(width, height) * 0.0015;

        for (let i = 0; i < maskData.length; i++) {
            if (maskData[i] === 1) {
                const x = i % width;
                const y = (i / width) | 0;

                if (
                    (x > 0 && maskData[i - 1] === 0) ||
                    (x < width - 1 && maskData[i + 1] === 0) ||
                    (y > 0 && maskData[i - width] === 0) ||
                    (y < height - 1 && maskData[i + width] === 0)
                ) {
                    this.drawDot(
                        this.borderCtx,
                        x,
                        y,
                        radius,
                        mask.getCategory().getBorderColor()
                    );
                }
            }
        }
    }

    drawText(mask) {
        const middle_pixel = mask.getMiddlePoint();
        const category = mask.getCategory();
        const label_id = category.getCategoryId();
        const color = category.getMaskColor();
        const fontColor = category.getTextColor();
        const width = this.imageWidth;
        const height = this.imageHeight;

        if (label_id === -1) {
            return;
        }

        const fontSize = Math.min(
            Math.floor(Math.min(width, height) * 0.04),
            40
        );
        const fontBgRadius = fontSize * 0.7;

        this.textCtx.beginPath();
        this.textCtx.arc(
            middle_pixel[0] + fontBgRadius / 2,
            middle_pixel[1] - fontBgRadius / 2,
            fontBgRadius,
            0,
            Math.PI * 2
        );
        this.textCtx.strokeStyle = "#fff";
        this.textCtx.lineWidth = 1;
        this.textCtx.fillStyle = color;
        this.textCtx.fill();
        this.textCtx.stroke();
        this.textCtx.closePath();

        const display_id = category.getIconName();
        this.textCtx.font = `${
            fontSize / Math.max(display_id.length, 1)
        }px Arial`;
        this.textCtx.fillStyle = fontColor;
        this.textCtx.fillText(display_id, middle_pixel[0], middle_pixel[1]);
    }

    resetViewpoint() {
        // Get the display size of the canvas
        const rect = this.canvas.getBoundingClientRect();
        const canvasDisplayWidth = rect.width;
        const canvasDisplayHeight = rect.height;

        // Set the canvas internal dimensions to match the display size
        this.canvas.width = canvasDisplayWidth;
        this.canvas.height = canvasDisplayHeight;

        // Compute the scale and origin
        const scaleX = this.canvas.width / this.imageWidth;
        const scaleY = this.canvas.height / this.imageHeight;
        this.scale = Math.min(scaleX, scaleY);

        const scaledImageWidth = this.imageWidth * this.scale;
        const scaledImageHeight = this.imageHeight * this.scale;

        const offsetX = (this.canvas.width - scaledImageWidth) / 2;
        const offsetY = (this.canvas.height - scaledImageHeight) / 2;

        this.origin.x = -offsetX / this.scale;
        this.origin.y = -offsetY / this.scale;
    }

    resetImageBoundary() {
        this.image_top_left = { x: 0, y: 0 };
        this.image_bottom_right = { x: this.imageWidth, y: this.imageHeight };
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return [
            (event.clientX - rect.left) * (this.canvas.width / rect.width),
            (event.clientY - rect.top) * (this.canvas.height / rect.height),
        ];
    }

    shouldShowMask() {
        return this.showMask;
    }

    setShouldShowMask(showMask) {
        this.showMask = showMask;
    }

    setMaskOpacity(opacity) {
        this.maskOpacity = opacity;
    }

    transition_pos(point, x, y) {
        point.x += x;
        point.y += y;

        return { x: point.x, y: point.y };
    }

    scale_pos(point, scale) {
        point.x *= scale;
        point.y *= scale;

        return { x: point.x, y: point.y };
    }

    zoomIn() {
        this.origin.x += this.zoomStep * this.scale * (1 / this.zoomStep);
        this.origin.y += this.zoomStep * this.scale * (1 / this.zoomStep);
        this.scale += this.zoomStep;
    }
    zoomOut() {
        this.origin.x -= this.zoomStep * this.scale * (1 / this.zoomStep);
        this.origin.y -= this.zoomStep * this.scale * (1 / this.zoomStep);
        this.scale -= this.zoomStep;
    }

    getOpacity() {
        return this.maskOpacity;
    }

    setOpacity(opacity) {
        this.maskOpacity = opacity;
    }

    canvasPixelToImagePixel(canvasX, canvasY) {
        const width = this.image_bottom_right.x - this.image_top_left.x;
        const height = this.image_bottom_right.y - this.image_top_left.y;

        const imageX = Math.floor(
            ((canvasX - this.image_top_left.x) / width) * this.imageWidth
        );
        const imageY = Math.floor(
            ((canvasY - this.image_top_left.y) / height) * this.imageHeight
        );
        return [imageX, imageY];
    }

    /**
     * Show the given promted mask.
     * If the given mask is null, then do not show anything.
     * @param {Mask} mask
     * @param {Prompt[]} prompts
     */
    showPromptedMask(mask, prompts) {
        this.promptedMask = mask;
        if (mask === null) {
            return;
        }

        // Draw masks
        const maskCanvas = document.createElement("canvas");
        const maskCtx = maskCanvas.getContext("2d");
        maskCanvas.width = this.imageWidth;
        maskCanvas.height = this.imageHeight;

        const imageData = maskCtx.getImageData(
            0,
            0,
            this.imageWidth,
            this.imageHeight
        );
        const data = imageData.data;

        const maskData = mask.getDecodedMask();
        const [r, g, b] = this.hexToRGB(mask.getMaskColor());

        for (let i = 0; i < maskData.length; i++) {
            if (maskData[i] === 1) {
                const x = i % this.imageWidth;
                const y = Math.floor(i / this.imageWidth);
                const index = (y * this.imageWidth + x) * 4;

                // Set pixel color with alpha transparency
                data[index] = r; // Red
                data[index + 1] = g; // Green
                data[index + 2] = b; // Blue
                data[index + 3] = 255; // Alpha
            }
        }
        maskCtx.putImageData(imageData, 0, 0);

        // Draw prompted points
        const pointRadius = Math.min(this.imageWidth, this.imageHeight) * 0.01;
        for (const prompt of prompts) {
            const imageX = prompt.getImageX();
            const imageY = prompt.getImageY();
            const color = prompt.getPointColor();

            maskCtx.beginPath();
            maskCtx.arc(imageX, imageY, pointRadius, 0, 2 * Math.PI);
            maskCtx.fillStyle = color;
            maskCtx.fill();
        }

        this.promptingMaskCache = new Image();
        this.promptingMaskCache.src = maskCanvas.toDataURL();
    }

    getEncodedImage() {
        return this.canvas.toDataURL("image/png");
    }

    getMaskOpacity() {
        return this.maskOpacity;
    }
}
