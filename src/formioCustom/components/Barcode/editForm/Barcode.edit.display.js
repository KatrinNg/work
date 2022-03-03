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
      key: 'tooltip',
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
      key: 'disabled',
      ignore: true
    },
    {
      key: 'tabindex',
      ignore: true
    },
    {
      key: 'tag',
      ignore: true
    },
    {
      type: 'textfield',
      input: true,
      key: 'className',
      weight: 60,
      label: 'CSS Class',
      placeholder: 'CSS Class',
      tooltip: 'The CSS class for this HTML element.'
    },
    {
      type: 'select',
      input: true,
      key: 'barcodeType',
      weight: 65,
      label: 'Barcode Type',
      dataSrc: 'values',
      tooltip: 'The type for this Barcode element.',
      data: {
        values: [
          { label: 'Code 128', value: 'code128' },
          { label: 'Code 39', value: 'code39' },
          { label: 'Code 39 Extended', value: 'code39ext' },
          // { label: 'EAN-13', value: 'ean13' },
          // { label: 'EAN-8', value: 'ean8' },
          { label: 'QR Code', value: 'qrcode' }
          // { label: 'UPC-A', value: 'upca' },
          // { label: 'UPC-E', value: 'upce' },
        ]
      }
    },
    {
      type: 'number',
      label: 'Barcode Scale',
      key: 'barcodeScale',
      input: true,
      weight: 66,
      placeholder: 'Barcode Scale',
      tooltip: 'Enter the scale of barcode that should be displayed.'
    },
    {
      type: 'number',
      label: 'Barcode Height',
      key: 'barcodeHeight',
      input: true,
      weight: 67,
      placeholder: 'Barcode Height',
      tooltip: 'Enter the height of barcode that should be displayed.'
    },
    {
      type: 'textfield',
      input: true,
      key: 'barcodeFont',
      weight: 68,
      label: 'Barcode Font',
      placeholder: 'Barcode Font',
      tooltip: 'The font style for this barcode.'
    },
    {
      weight: 69,
      type: 'checkbox',
      label: 'Hide Barcode Text',
      tooltip: 'Hide the barcode text of this component.',
      key: 'hideBarcodeText',
      input: true
    },
    {
      type: 'datagrid',
      input: true,
      label: 'Attributes',
      key: 'attrs',
      ignore: true,
      tooltip: 'The attributes for this HTML element. Only safe attributes are allowed, such as src, href, and title.',
      weight: 70,
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
      weight: 75,
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
      weight: 90,
      type: 'checkbox',
      label: 'Refresh On Change',
      tooltip: 'Rerender the field whenever a value on the form changes.',
      key: 'refreshOnChange',
      input: true
    }
  ];
