import baseEditForm from 'formiojs/components/_classes/component/Component.form';

import BarcodeEditDisplay from './editForm/Barcode.edit.display';
import BarcodeEditData from './editForm/Barcode.edit.data';

export default function(...extend) {
  return baseEditForm([
    {
      key: 'display',
      components: BarcodeEditDisplay
    },
    {
      key: 'data',
      components: BarcodeEditData
    }
    // {
    //   key: 'validation',
    //   ignore: true,
    // }
  ], ...extend);
}
