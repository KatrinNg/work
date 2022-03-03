import nestedComponentForm from 'formiojs/components/_classes/nested/NestedComponent.form';

import FreeTableEditDisplay from './editForm/FreeTable.edit.display';

export default function(...extend) {
  return nestedComponentForm([
    {
      key: 'display',
      components: FreeTableEditDisplay
    }
  ], ...extend);
}
