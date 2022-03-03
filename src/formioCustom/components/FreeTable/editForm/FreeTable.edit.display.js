export default [
  {
    key: 'labelPosition',
    ignore: true
  },
  {
    key: 'placeholder',
    ignore: true
  },
  {
    key: 'description',
    ignore: true
  },
  {
    key: 'hideLabel',
    ignore: true
  },
  {
    key: 'autofocus',
    ignore: true
  },
  {
    key: 'tooltip',
    ignore: true
  },
  {
    key: 'tabindex',
    ignore: true
  },
  {
    key: 'disabled',
    ignore: true
  },
  {
    type: 'number',
    label: 'Number of Rows',
    key: 'numRows',
    input: true,
    weight: 1,
    placeholder: 'Number of Rows',
    tooltip: 'Enter the number or rows that should be displayed by this table.'
  },
  {
    type: 'number',
    label: 'Number of Columns',
    key: 'numCols',
    input: true,
    weight: 2,
    placeholder: 'Number of Columns',
    tooltip: 'Enter the number or columns that should be displayed by this table.'
  },
  {
    type: 'checkbox',
    label: 'Clone Row Components',
    key: 'cloneRows',
    input: true,
    weight: 3,
    tooltip: 'Check this if you would like to "clone" the first row of components to all additional empty rows of the table.'
  },
  {
    type: 'datagrid',
    input: true,
    label: 'Attributes',
    key: 'attrs',
    tooltip: 'The attributes for this HTML element (please DO NOT include style). Only safe attributes are allowed, such as src, href, and title.',
    weight: 11,
    components: [
      {
        label: 'Attribute',
        key: 'attr',
        input: true,
        type: 'textfield'
      },
      {
        label: 'Value',
        key: 'value',
        input: true,
        type: 'textfield'
      }
    ]
  },
  {
    type: 'datagrid',
    input: true,
    label: 'Styles',
    key: 'styles',
    tooltip: 'The styles for this HTML element.',
    weight: 12,
    components: [
      {
        label: 'Attribute',
        key: 'attr',
        input: true,
        type: 'textfield'
      },
      {
        label: 'Value',
        key: 'value',
        input: true,
        type: 'textfield'
      }
    ]
  },
  {
    type: 'datagrid',
    input: true,
    label: 'Columns Width',
    key: 'colWidths',
    tooltip: 'Each columns width.',
    weight: 16,
    disableAddingRemovingRows: true,
    components: [
      {
        label: 'Column',
        key: 'index',
        input: true,
        type: 'textfield',
        disabled: true
      },
      {
        label: 'Width',
        key: 'value',
        input: true,
        type: 'textfield'
      }
    ]
  },
  {
    type: 'datagrid',
    input: true,
    label: 'Rows Height',
    key: 'rowHeights',
    tooltip: 'Each rows height.',
    weight: 17,
    disableAddingRemovingRows: true,
    components: [
      {
        label: 'Row',
        key: 'index',
        input: true,
        type: 'textfield',
        disabled: true
      },
      {
        label: 'Height',
        key: 'value',
        input: true,
        type: 'textfield'
      }
    ]
  },
  {
    type: 'select',
    label: 'Cell Alignment',
    key: 'cellAlignment',
    input: true,
    tooltip: 'Horizontal alignment for cells of the table.',
    dataSrc: 'values',
    data: {
      values: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' }
      ]
    },
    defaultValue: 'left',
    weight: 23
  },
  {
    type: 'checkbox',
    label: 'Striped',
    key: 'striped',
    tooltip: 'This will stripe the table if checked.',
    input: true,
    weight: 701
  },
  {
    type: 'checkbox',
    label: 'Bordered',
    key: 'bordered',
    input: true,
    tooltip: 'This will border the table if checked.',
    weight: 702
  },
  {
    type: 'checkbox',
    label: 'Hover',
    key: 'hover',
    input: true,
    tooltip: 'Highlight a row on hover.',
    weight: 703
  },
  {
    type: 'checkbox',
    label: 'Condensed',
    key: 'condensed',
    input: true,
    tooltip: 'Condense the size of the table.',
    weight: 704
  },
  {
    type: 'checkbox',
    label: 'Padding',
    key: 'padding',
    input: true,
    tooltip: 'Add padding to table cell.',
    weight: 705
  }
];
