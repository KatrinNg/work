import bwipjs from "bwip-js";
import Component from 'formiojs/components/_classes/component/Component';
import editForm from './Barcode.form';

export default class BarcodeComponent extends Component {
    static schema(...extend) {
        return Component.schema({
            label: 'Barcode',
            type: 'barcode',
            tag: 'img',
            customClass: 'no-margin',
            styles: [],
            barcodeType: 'code128',
            barcodeScale: 1,
            barcodeHeight: 10,
            barcodeFont: '12px Arial',
            barcodeValue: '',
            barcodeData: '',
            hideBarcodeText: false
        }, ...extend);
    }

    static get builderInfo() {
        return {
            title: 'Barcode',
            group: 'custom',
            icon: 'list fa-rotate-270',
            weight: 0,
            // documentation: 'http://help.form.io/userguide/#html-element-component',
            schema: BarcodeComponent.schema()
        };
    }

    static editForm = editForm;

    get defaultSchema() {
        return BarcodeComponent.schema();
    }

    renderContent() {
        // const submission = _.get(this.root, 'submission', {});
        return this.renderTemplate('barcode', {
            component: this.component,
            tag: this.component.tag,
            // attrs: (this.component.attrs || []).map((attr) => {
            //   return {
            //     attr: attr.attr,
            //     value: attr.value
            //   };
            // }),
            styles: (this.component.styles || []).map((style) => {
                return {
                    attr: style.attr,
                    value: style.value
                };
            }),
            barcodeData: this.component.barcodeData,
            barcodeFont: this.component.barcodeFont,
            barcodeValue: this.component.barcodeValue,
            hideBarcodeText: this.component.hideBarcodeText || this.component.barcodeType === 'qrcode',
            rootId: this.root.id
        });
    }

    attach(element) {
        this.loadRefs(element, {img: 'single', canvas: 'single'});
        // window.d[this.builderMode ? 'bb' : 'fb'] = this;
        this.canvasId = `canvas-${ this.root.id }-${ this.id }`;
        this.canvasElement = this.builderMode ? element.children[1].children[1] : element.children[1];
        this.component.barcodeData = this.generateBarcode(this.component.barcodeType, this.component.barcodeValue);
        setTimeout(() => {
            if (this.refs.img) {
                this.refs.img.src = this.component.barcodeData;
            }
        }, 0);
        return super.attach(element);
    }

    detach() {
        this.canvasElement = undefined;
        this.canvasId = undefined;
        // window.d[this.builderMode ? 'bb' : 'fb'] = undefined;
        super.detach();
    }

    generateBarcode = (type, text) => {
        let canvas = this.canvasElement;
        if (canvas) {
            if (text !== "") {
                try {
                    let options = {
                        bcid: type, // Barcode type
                        text: text, // Text to encode
                        scale: this.component.barcodeScale, // scaling factor
                        includetext: false, // Show human-readable text
                        textxalign: "center" // Always good to set this
                    };

                    if (type !== 'qrcode')
                        options.height = this.component.barcodeHeight; // Bar height, in millimeters

                    bwipjs.toCanvas(canvas, options);

                    // if (!this.component.hideBarcodeText && type !== 'qrcode') {
                    //   const ctx = canvas.getContext("2d");
                    //   ctx.font = this.component.barcodeFont;
                    //   const textWidth = ctx.measureText(text).width;
                    //   const textHeight = ctx.measureText("M").width;
                    //   const paddingX = 5;
                    //   const paddingY = 2;
                    //   // console.log(textWidth);
                    //   ctx.fillStyle = "#FFFFFF";
                    //   ctx.fillRect(
                    //     (canvas.width - textWidth) / 2 - paddingX,
                    //     canvas.height - textHeight - paddingY,
                    //     textWidth + paddingX * 2,
                    //     textHeight + paddingY
                    //   );
                    //   ctx.fillStyle = "#000000";
                    //   ctx.textAlign = "center";
                    //   ctx.fillText(text, canvas.width / 2, canvas.height);
                    // }

                    return canvas.toDataURL();
                } catch (err) {
                    // console.log(err);
                    const ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
            } else {
                // console.log(this.canvasId, "empty text");
            }
        } else {
            // console.log(this.canvasId, "empty canvas");
        }
        return '';
    }

    setValue(value) {
        // console.log('setValue', value);

        this.component.barcodeData = this.generateBarcode(this.component.barcodeType, this.component.barcodeValue);
        this.component.barcodeValue = value;

        this.triggerRedraw();
    }

    render() {
        super.dataValue = this.component.barcodeValue;
        return super.render(this.renderContent());
    }
}
