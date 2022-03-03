import baseEditForm from 'formiojs/components/_classes/component/Component.form';

import DateTimeEditData from 'formiojs/components/datetime/editForm/DateTime.edit.data';
import DateTimeEditDate from 'formiojs/components/datetime/editForm/DateTime.edit.date';
import DateTimeEditDisplay from './editForm/ClickFillDatetime.edit.display';
import DateTimeEditTime from 'formiojs/components/datetime/editForm/DateTime.edit.time';

export default function(...extend) {
    return baseEditForm([
        {
            key: 'display',
            components: DateTimeEditDisplay
        },
        {
            label: 'Date',
            key: 'date',
            weight: 1,
            components: DateTimeEditDate
        },
        {
            label: 'Time',
            key: 'time',
            weight: 2,
            components: DateTimeEditTime
        },
        {
            key: 'data',
            components: DateTimeEditData
        }
    ], ...extend);
}
