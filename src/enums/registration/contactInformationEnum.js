const ContactInformationEnum = {
    ADDRESS_TYPE: {
        STRUCTURED: 'Structured',
        FREE_TEXT: 'Free Text',
        POSTAL_BOX: 'Postal Box'
    },
    REGION: [
        {
          code: 'HK',
            engDesc: 'Hong Kong',
            chiDesc: '香港'
        },
        {
          code:'KLN',
            engDesc: 'Kowloon',
            chiDesc: '九龍'
        },
        {
            code: 'NT',
            engDesc: 'New Territories',
            chiDesc: '新界'
        }
    ],
    ADDRESS_FORMAT:{
        LOCAL_ADDRESS:'L',
        LOT_ADDRESS:'T',
        POSTAL_BOX_ADDRESS:'P',
        FREE_TEXT_ADDRESS:'F'
    },
    FIELD_ENG_LABEL: {
        CONTACT_ROOM: 'Room/Flat',
        CONTACT_FLOOR: 'Floor',
        CONTACT_BLOCK: 'Block',
        CONTACT_BUILDING: 'Building',
        CONTACT_ESTATELOT: 'Estate/Village',
        CONTACT_STREET_NO: 'Street No.',
        CONTACT_STREET: 'Street/Road',
        CONTACT_POSTOFFICE_BOXNO: 'Post Office Box No.',
        CONTACT_POSTOFFICE_NAME: 'Post Office Name',
        CONTACT_POSTOFFICE_REGION: 'Region',
        CONTACT_REGION: 'Region',
        CONTACT_DISTRICT: 'District',
        CONTACT_SUB_DISTRICT: 'Sub District'
    },
    FIELD_CHI_LABEL:{
        CONTACT_ROOM: '單位',
        CONTACT_FLOOR: '樓層',
        CONTACT_BLOCK: '大廈號碼',
        CONTACT_BUILDING: '大廈名稱',
        CONTACT_ESTATELOT: '屋邨 / 屋宛名稱',
        CONTACT_STREET_NO: '街道號碼',
        CONTACT_STREET: '街道名稱',
        CONTACT_POSTOFFICE_BOXNO: '郵政信箱號碼',
        CONTACT_POSTOFFICE_NAME: '郵局名稱',
        CONTACT_POSTOFFICE_REGION: '區域',
        CONTACT_REGION: '區域',
        CONTACT_DISTRICT: '地區',
        CONTACT_SUB_DISTRICT: '地區分區'
    }
};


export default ContactInformationEnum;