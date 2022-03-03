import nestedComponentForm from 'formiojs/components/_classes/nested/NestedComponent.form';

import SpanTableEditDisplay from './editForm/SpanTable.edit.display';

export default function (...extend) {
    return nestedComponentForm([
        {
            key: 'display',
            components: SpanTableEditDisplay
        }
    ], ...extend);
}
