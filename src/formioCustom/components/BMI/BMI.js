// import { conformToMask } from 'vanilla-text-mask';
// import * as FormioUtils from 'formiojs/utils/utils';
import editForm from './BMI.form';
import Component from 'formiojs/components/_classes/component/Component';

export default class BmiComponent extends Component {
    static schema(...extend) {
        return Component.schema({
            label: 'Barcode',
            type: 'barcode',
            tag: 'img',
            customClass: 'no-margin',
            styles: [],
            bmiElement: [],
            bmiValue: {
                weight: 0,
                height: 0,
                bmi: 0
            }
        }, ...extend);
    }

    static get builderInfo() {
        return {
            title: 'BMI',
            icon: 'list fa-rotate-270',
            group: 'custom',
            // documentation: 'http://help.form.io/userguide/#textfield',
            weight: 0,
            schema: BmiComponent.schema()
        };
    }

    static editForm = editForm;

    get defaultSchema() {
        return BmiComponent.schema();
    }

    get inputInfo() {
        let infos = [];

        const bmiInputInfo = {
            weight: {
                attr: 'weight',
                suffix: 'kg'
            },
            height: {
                attr: 'height',
                suffix: 'cm'
            },
            bmi: {
                attr: 'bmi',
                suffix: 'kg/m²'
            }
        };

        for (const prop in bmiInputInfo) {
            const data = bmiInputInfo[prop];

            infos.push({
                "id": data.attr,
                "type": "input",
                "changeEvent": "input",
                "content": "",
                "attr": {
                    "name": "data[" + data.attr + "]",
                    "type": "text",
                    "class": "form-control",
                    "lang": "en",
                    "spellcheck": true,
                    "value": this.component.bmiValue[data.attr]
                },
                "ref": "input-" + data.attr,
                "component": {
                    "suffix": data.suffix
                }
            });
        }

        return infos;
    }

    renderContent(value, index) {
        // console.log('kl_renderContent', this.component.bmiData);

        return this.renderTemplate('bmi', {
            inputInfo: this.inputInfo
        });
    }

    attach(element) {
        // console.log('kl_attach', element);

        this.component.bmiElement = [];

        const refs = ["weight", "height", "bmi"];

        refs.forEach((value) => {
            const singleElement = element.querySelector('input[name="data[' + value + ']"]');

            this.component.bmiElement.push(singleElement);

            this.addEventListener(singleElement, 'input', () => this.updateValue());
        });

        // Allow basic component functionality to attach like field logic and tooltips.
        return super.attach(element);
    }

    getValue() {
        let {
            bmiValue,
            bmiElement
        } = this.component;

        const bmiCalc = (weight, height) => {
            return (weight / Math.pow(height / 100, 2)).toFixed(1);
        };

        bmiElement.forEach((value) => {
            const key = value.name.replace('data[', '').replace(']', '');

            bmiValue[key] = value.value;

            if (key === 'bmi') {
                value.value = bmiValue.weight > 0 && bmiValue.height > 0 ? bmiCalc(bmiValue.weight, bmiValue.height) : '';
            } else {
                value.value = bmiValue[key] > 0 ? bmiValue[key] : '';
            }
        });

        return {'weight': bmiValue.weight, 'height': bmiValue.height, 'bmi': bmiCalc(bmiValue.weight, bmiValue.height)};
    }

    setValue(value) {
        // console.log('kl_setValue', value);

        if (value) {
            this.component.bmiValue = value;

            this.triggerRedraw();
        }
    }

    render() {
        super.dataValue = this.component.bmiValue;
        return super.render(this.renderContent());
    }
}
