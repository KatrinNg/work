import baseEditForm from 'formiojs/components/_classes/component/Component.form';

import ScaleTextEditDisplay from './editForm/ScaleText.edit.display';
import ScaleTextEditValidation from './editForm/ScaleText.edit.validation';

export default function(...extend) {
  return baseEditForm([
    {
      key: 'display',
      components: ScaleTextEditDisplay
    },
    {
      key: 'validation',
      components: ScaleTextEditValidation
    }
  ], ...extend);
}
