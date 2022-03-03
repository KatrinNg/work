import Input from 'formiojs/components/textarea/TextArea';
import { TEST_ITEM_MASTER_TEST_FLAG } from '../../../constants/IOE/serviceProfile/serviceProfileConstants';
import editForm from './ScaleText.form';

export default class ScaleText extends Input {
  static schema(...extend) {
    return Input.schema(
      {
        type: 'ScaleText',
        label: 'Scale Text',
        key: 'ScaleText',
        editor: '',
        autoExpand: true,
        rows: 1,
        // maxRows: 3,
        maxHeight: 100,
        fontSize: '16px',
        minFontSize: '6px',
        fixedSize: true,
        inputFormat: 'html',
        tableView: true,
        validate: {
          minWords: '',
          maxWords: ''
        }
      },
      ...extend
    );
  }

  static get builderInfo() {
    return {
      title: 'Scale Text',
      icon: 'font',
      group: 'custom',
      documentation: 'http://help.form.io/userguide/#textarea',
      weight: 20,
      schema: ScaleText.schema()
    };
  }

  static editForm = editForm;

  get defaultSchema() {
    return ScaleText.schema();
  }

  hasChanged(newValue, oldValue) {
    const selectorElement = document.getElementById(this.component.id);
    this.fetchScaleFont(selectorElement);
    // formio will try to trigger the custom validation first before the "hasChange" function
    // The result may be inaccurate if doing the custom validation before hasChange.
    // In order to fix this issue, we have to invoke "checkValidity()" to perform validation again
    // Becasue formio may take some time to update the component and css style, add 500ms delay.
    setTimeout(() => {
      this.checkValidity();
      }, 500
    );
    return super.hasChanged(newValue, oldValue);
  }

  attachElement(element, index) {
    setTimeout(() => {
      const selectorElement = document.getElementById(this.component.id);
      this.fetchScaleFont(selectorElement, true);
    }, 10);
    return super.attachElement(element, index);
  }

  fetchScaleFont(element, isInitalStyle) {
    if (element) {
      let textarea = null;
      if (this.component.disabled || this.options.readOnly) {
        textarea = element.querySelector('div[ref="input"]');
      } else {
        textarea = element.querySelector('.form-control');
      }
      if (textarea && isInitalStyle) {
        textarea.style.fontSize = this.component.fontSize;
        textarea.style.wordBreak = 'break-word';
        textarea.style.whiteSpace = 'pre-wrap';
        textarea.style.overflow = 'hidden';
        textarea.style.lineHeight = 'initial';
        textarea.style.maxHeight = this.component.maxHeight + 'px';
      }
      this.scaleFont(textarea);
    }
  }

  scaleFont(textarea) {
    if (textarea) {
      if (textarea.value) {
        const clientWidth = textarea.clientWidth;
        const clientHeight = textarea.clientHeight;
        let scrollWidth = textarea.scrollWidth;
        let scrollHeight = textarea.scrollHeight;

        if (this.component.maxHeight !== 'unset') {
          let fontSize = textarea.style.fontSize;
          fontSize = Number(fontSize.substring(0, fontSize.length - 2));
          let minFontSize = this.component.minFontSize;
          minFontSize = Number(minFontSize.substring(0, minFontSize.length - 2));
          let normalFontSize = this.component.fontSize;
          normalFontSize = Number(normalFontSize.substring(0, normalFontSize.length - 2));

          if (this.component.maxHeight < scrollHeight) {
            while (scrollWidth > clientWidth || scrollHeight > clientHeight) {
              fontSize -= 1;
              if (fontSize < minFontSize) {
                break;
              }
              textarea.style.fontSize = fontSize + 'px';
              scrollWidth = textarea.scrollWidth;
              scrollHeight = textarea.scrollHeight;
            }
          } else {
            while (fontSize < normalFontSize) {
              fontSize += 1;
              textarea.style.fontSize = fontSize + 'px';
              scrollWidth = textarea.scrollWidth;
              scrollHeight = textarea.scrollHeight;
              if (scrollHeight > this.component.maxHeight) {
                fontSize -= 1;
                textarea.style.fontSize = fontSize + 'px';
                break;
              }
            }
          }
        }
      } else {
        // textarea.style.fontSize = this.component.fontSize;
      }
    }
  }

  // getMaxRowsHeight(textarea) {
  //   if(textarea) {
  //     let spanDom = document.createElement("span");
  //     spanDom.className = textarea.className;
  //     spanDom.style.fontSize = textarea.style.fontSize;
  //     spanDom.style.height = 'auto';
  //     spanDom.style.opacity = '0';
  //     let str = '';
  //     for (let i = 0; i < this.component.maxRows; i++) {
  //       if (i == this.component.maxRows - 1) {
  //         str += "W";
  //       } else {
  //         str = str + "W" + '<br />';
  //       }
  //     }
  //     spanDom.innerHTML = str;
  //     document.body.append(spanDom);
  //     let _height = spanDom.offsetHeight;
  //     spanDom.remove();
  //     return _height;
  //   } else {
  //     return 'unset';
  //   }
  // }
}