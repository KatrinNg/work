import Input from 'formiojs/components/_classes/input/Input';
import { conformToMask } from 'vanilla-text-mask';
import * as FormioUtils from 'formiojs/utils/utils';
import editForm from './FreeTextField.form';

export default class TextFieldComponent extends Input {
    static schema(...extend) {
        return Input.schema({
            label: 'Free Text Field',
            key: 'freeTextField',
            type: 'freeTextField',
            mask: false,
            inputType: 'text',
            inputFormat: 'plain',
            inputMask: '',
            styles: [
                {attr: 'width', value: '100%'},
                {attr: 'top', value: 'auto'},
                {attr: 'left', value: 'auto'}
            ],
            customClass: 'customMovable errorOnSubmit',
            tableView: true,
            spellcheck: true,
            validate: {
                minLength: '',
                maxLength: '',
                pattern: ''
            }
        }, ...extend);
    }

    static get builderInfo() {
        return {
            title: 'Free Text Field',
            icon: 'terminal',
            group: 'custom',
            documentation: 'http://help.form.io/userguide/#textfield',
            weight: 0,
            schema: TextFieldComponent.schema()
        };
    }

    static editForm = editForm;

    get defaultSchema() {
        return TextFieldComponent.schema();
    }

    get inputInfo() {
        const info = super.inputInfo;
        info.type = 'input';

        if (Object.prototype.hasOwnProperty.call(this.component, "spellcheck")) {
            info.attr.spellcheck = this.component.spellcheck;
        }

        if (this.component.mask) {
            info.attr.type = 'password';
        } else {
            info.attr.type = (this.component.inputType === 'password') ? 'password' : 'text';
        }
        info.changeEvent = 'input';
        return info;
    }

    get emptyValue() {
        return '';
    }

    /**
     * Returns the mask value object.
     *
     * @param value
     * @param flags
     * @return {*}
     */
    maskValue(value, flags = {}) {
        // Convert it into the correct format.
        if (!value || (typeof value !== 'object')) {
            value = {
                value,
                maskName: this.component.inputMasks[0].label
            };
        }

        // If no value is provided, then set the defaultValue.
        if (!value.value) {
            const defaultValue = flags.noDefault ? this.emptyValue : this.defaultValue;
            value.value = Array.isArray(defaultValue) ? defaultValue[0] : defaultValue;
        }

        return value;
    }

    /**
     * Normalize the value set in the data object.
     *
     * @param value
     * @param flags
     * @return {*}
     */
    normalizeValue(value, flags = {}) {
        if (!this.isMultipleMasksField) {
            return super.normalizeValue(value);
        }
        if (Array.isArray(value)) {
            return super.normalizeValue(value.map((val) => this.maskValue(val, flags)));
        }
        return super.normalizeValue(this.maskValue(value, flags));
    }

    /**
     * Sets the value at this index.
     *
     * @param index
     * @param value
     * @param flags
     */
    setValueAt(index, value, flags = {}) {
        if (!this.isMultipleMasksField) {
            return super.setValueAt(index, value, flags);
        }
        value = this.maskValue(value, flags);
        const textValue = value.value || '';
        const textInput = this.refs.mask ? this.refs.mask[index] : null;
        const maskInput = this.refs.select ? this.refs.select[index] : null;
        const mask = this.getMaskPattern(value.maskName);
        if (textInput && maskInput && mask) {
            textInput.value = conformToMask(textValue, FormioUtils.getInputMask(mask)).conformedValue;
            maskInput.value = value.maskName;
        } else {
            return super.setValueAt(index, textValue, flags);
        }
    }

    /**
     * Returns the value at this index.
     *
     * @param index
     * @return {*}
     */
    getValueAt(index) {
        if (!this.isMultipleMasksField) {
            return super.getValueAt(index);
        }
        const textInput = this.refs.mask ? this.refs.mask[index] : null;
        const maskInput = this.refs.select ? this.refs.select[index] : null;
        return {
            value: textInput ? textInput.value : undefined,
            maskName: maskInput ? maskInput.value : undefined
        };
    }

    isEmpty(value = this.dataValue) {
        if (!this.isMultipleMasksField) {
            return super.isEmpty((value || '').toString().trim());
        }
        return super.isEmpty(value) || (this.component.multiple ? value.length === 0 : (!value.maskName || !value.value));
    }

    attachElement(element, index) {
        super.attachElement(element, index);

        // Add drag move events.
        const selectorElement = this.builderMode ? document.getElementById(this.component.id).parentElement : document.getElementById(this.component.id);

        if (this.builderMode) {
            this.addMovableEvents(selectorElement);
            this.addResizableEvents(selectorElement);
        }

        this.setElementPosition(selectorElement);
    }

    addMovableEvents(element) {
        const moveBtn = element.querySelector('.component-btn-group .component-settings-button-move');

        if (moveBtn) {
            this.addEventListener(moveBtn, 'mousedown', (event) => {
                event.preventDefault();

                const diffX = event.clientX - element.offsetLeft,
                    diffY = event.clientY - element.offsetTop;

                const moveAlong = (event) => {
                    event.preventDefault();

                    element.style.left = (event.clientX - diffX) + 'px';
                    element.style.top = (event.clientY - diffY) + 'px';
                };

                const stopDrag = (event) => {
                    event.preventDefault();

                    document.removeEventListener('mousemove', moveAlong, false);
                    document.removeEventListener('mouseup', stopDrag, false);

                    this.component.styles.find(x => x.attr === 'top').value = element.style.top;
                    this.component.styles.find(x => x.attr === 'left').value = element.style.left;
                };

                document.addEventListener('mouseup', stopDrag, false);
                document.addEventListener('mousemove', moveAlong, false);
            }, false);
        }
    }

    addResizableEvents(element) {
        let startX, startWidth;
        // let startY, startHeight;

        const initDrag = (event, element) => {
            startX = event.clientX;
            startWidth = parseInt(document.defaultView.getComputedStyle(element).width, 10);

            // startY = event.clientY;
            // startHeight = parseInt(document.defaultView.getComputedStyle(element).height, 10);

            const doDrag = (e) => {
                element.style.width = startWidth + e.clientX - startX + "px";
                // element.style.height = startHeight + e.clientY - startY + "px";
            };

            const stopDrag = () => {
                document.documentElement.removeEventListener("mousemove", doDrag, false);
                document.documentElement.removeEventListener("mouseup", stopDrag, false);

                this.component.styles.find(x => x.attr === 'width').value = element.style.width;
            };

            document.documentElement.addEventListener("mousemove", doDrag, false);
            document.documentElement.addEventListener("mouseup", stopDrag, false);
        };

        let right = document.createElement("div");
        right.className = "resizeRight";
        element.appendChild(right);
        right.addEventListener("mousedown", (event) => {
            initDrag(event, element);
        }, false);

        /*        let bottom = document.createElement("div");
                bottom.className = "resizeBottom";
                element.appendChild(bottom);
                bottom.addEventListener("mousedown", (event) => {
                    initDrag(event, element);
                }, false);

                let both = document.createElement("div");
                both.className = "resizeBoth";
                element.appendChild(both);
                both.addEventListener("mousedown", (event) => {
                    initDrag(event, element);
                }, false);*/
    }

    setElementPosition(element) {
        const top = this.component.styles.find(x => x.attr === 'top').value,
            left = this.component.styles.find(x => x.attr === 'left').value,
            width = this.component.styles.find(x => x.attr === 'width').value;

        setTimeout(() => {
            element.style.position = 'absolute';
            element.style.top = top;
            element.style.left = left;
            element.style.width = width;
        }, 50);
    }
}
