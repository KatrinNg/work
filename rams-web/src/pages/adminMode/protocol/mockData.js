export const protocolList = [
    {
        "protocol_name": "General Medical Rehab",
        "protocol_id": "TPHPROT00001",
        "protocol_status": "ACTIVE",
        "protocol_treatment_list": [
            {
                "treatment_sort": "3", 
                "treatment_category": "Mobilization and strengthening", 
                "treatment_name": "Cycle",
                "treatment_doc": "Limb Mobilization and Strengthening",
                "position": "Stand",
                "side": "Left",
                "region": "Upper Limb",
                "set": "1",
                "repetition": "As tolerated",
                "resistance": "As tolerated",
                "resistance_unit": "lb",
                "walking_aids": "Stick Left",
                "assistive_device_1": "AFO",
                "assistive_device_2": "AFO",
                "weight_bearing_status_1": "FWB",
                "weight_bearing_status_2": "",
                "assistance_device_2": "2 Assistant",
                "distance": "4",
                "duration": "5 mins",
                "remark":"",
                "befor_bp": "Y",
                "befor_spo2": "Y",
                "after_bp": "Y",
                "after_spo2": "Y",
                "handheld_remark": "Y"
            },
            {
                "treatment_sort": "2", 
                "treatment_category": "Adaptive coping strengthening", 
                "treatment_name": "Coordinated Breathing",
                "treatment_doc": "Limb Mobilization and Strengthening",
                "position": "Stand",
                "side": "Left",
                "region": "Upper Limb",
                "set": "1",
                "repetition": "As tolerated",
                "resistance": "As tolerated",
                "resistance_unit": "lb",
                "walking_aids": "Stick Left",
                "assistive_device_1": "AFO",
                "assistive_device_2": "AFO",
                "weight_bearing_status_1": "FWB",
                "weight_bearing_status_2": "",
                "assistance_device_2": "2 Assistant",
                "distance": "",
                "duration": "5 mins",
                "remark":"",
                "befor_bp": "Y",
                "befor_spo2": "Y",
                "after_bp": "Y",
                "after_spo2": "Y",
                "handheld_remark": "Y"
            },
            {
                "treatment_sort": "1", 
                "treatment_category": "ADL/ Self care assessment and training", 
                "treatment_name": "Miscellaneous (ADL)",
                "treatment_doc": "Limb Mobilization and Strengthening",
                "position": "Stand",
                "side": "Left",
                "region": "Upper Limb",
                "set": "1",
                "repetition": "As tolerated",
                "resistance": "As tolerated",
                "resistance_unit": "lb",
                "walking_aids": "Stick Left",
                "assistive_device_1": "AFO",
                "assistive_device_2": "AFO",
                "weight_bearing_status_1": "FWB",
                "weight_bearing_status_2": "",
                "assistance_device_2": "2 Assistant",
                "distance": "",
                "duration": "5 mins",
                "remark":"",
                "befor_bp": "Y",
                "befor_spo2": "Y",
                "after_bp": "Y",
                "after_spo2": "Y",
                "handheld_remark": "Y"
            },
            {
                "treatment_sort": "4", 
                "treatment_category": "Caregiver training", 
                "treatment_name": "Caregiver Traiining - Coordinated Breathing",
                "treatment_doc": "Limb Mobilization and Strengthening",
                "position": "Stand",
                "side": "Left",
                "region": "Upper Limb",
                "set": "1",
                "repetition": "As tolerated",
                "resistance": "As tolerated",
                "resistance_unit": "lb",
                "walking_aids": "Stick Left",
                "assistive_device_1": "AFO",
                "assistive_device_2": "AFO",
                "weight_bearing_status_1": "FWB",
                "weight_bearing_status_2": "",
                "assistance_device_2": "2 Assistant",
                "distance": "",
                "duration": "5 mins",
                "remark":"",
                "befor_bp": "Y",
                "befor_spo2": "Y",
                "after_bp": "Y",
                "after_spo2": "Y",
                "handheld_remark": "Y"
            },
        ]
    },
    {
        "protocol_name": "Med New case protocol",
        "protocol_id": "TPHPROT00002",
        "protocol_status": "ACTIVE",
        "protocol_treatment_list": [
            { "treatment_sort": "1", "treatment_category": "Mobilization and strengthening2", "treatment_name": "Cycle" },
            { "treatment_sort": "2", "treatment_category": "Adaptive coping strengthening2", "treatment_name": "Coordinated Breathing" },
            { "treatment_sort": "3", "treatment_category": "ADL/ Self care assessment and training2", "treatment_name": "Miscellaneous (ADL)" },
            { "treatment_sort": "4", "treatment_category": "Caregiver training2", "treatment_name": "Caregiver Traiining - Coordinated Breathing" },
        ]
    },
    {
        "protocol_name": "Limbs Mobilisation Ex.(Ward)",
        "protocol_id":3,
        "protocol_status": "INACTIVE",
        "protocol_treatment_list": [
            { "treatment_sort": "1", "treatment_category": "Mobilization and strengthening", "treatment_name": "Cycle" },
            { "treatment_sort": "2", "treatment_category": "Adaptive coping strengthening", "treatment_name": "Coordinated Breathing" },
            { "treatment_sort": "3", "treatment_category": "ADL/ Self care assessment and training", "treatment_name": "Miscellaneous (ADL)" },
            { "treatment_sort": "4", "treatment_category": "Caregiver training", "treatment_name": "Caregiver Traiining - Coordinated Breathing" },
        ]
    }
]


export const categoryList = [
    { name: "Mobilization and strengthening", value: "Mobilization and strengthening" },
    { name: "Adaptive coping strengthening", value: "Adaptive coping strengthening" },
    { name: "ADL/ Self care assessment and training", value: "ADL/ Self care assessment and training" },
    { name: "Caregiver training", value: "Caregiver training" }
]

export const treatmentList = [
    {name: "Cycle", value:"Cycle"},
    {name: "Coordinated Breathing", value: "Coordinated Breathing"},
    {name: "Miscellaneous (ADL)", value: "Miscellaneous (ADL)"},
    {name: "Caregiver Traiining - Coordinated Breathing", value: "Caregiver Traiining - Coordinated Breathing"}

]

export const positionList = [
    {name: "Plinth", value: "Plinth"},
    {name: "stand", value: "Stand"}
]

export const sideList = [
    { name: "Left", value: "Left",active:false },
    { name: "Right", value: "Right",active:true },
    { name: "Forward-backward", value: "Forward-backward",active:true },
]

export const regionList = [
    {
        name: 'Upper Limb',
        value: 'Upper Limb'
    },
    {
        name: 'Shoulder',
        value: 'Shoulder'
    },
    {
        name: 'Upper Arm',
        value: 'Upper Arm'
    },
    {
        name: 'Elbow',
        value: 'Elbow'
    },
    {
        name: 'Forearm',
        value: 'Forearm'
    },
    {
        name: 'Wrist',
        value: 'Wrist'
    },
    {
        name: 'Hand',
        value: 'Hand'
    },
    {
        name: 'Lower Limb',
        value: 'Lower Limb'
    },
    {
        name: 'Hip',
        value: 'Hip'
    },
]

export const setList = [
    {
        name: 'As tolerated',
        value: 'As tolerated'
    },
    {
        name: '1',
        value: '1'
    },
    {
        name: '2',
        value: '2'
    },
    {
        name: '3',
        value: '3'
    },
    {
        name: '4',
        value: '4'
    },
    {
        name: '5',
        value: '5'
    },
    {
        name: '6',
        value: '6'
    },
    {
        name: '7',
        value: '7'
    },
    {
        name: '8',
        value: '8'
    },
    {
        name: '9',
        value: '9'
    },
    {
        name: '10',
        value: '10'
    },
]

export const repetitionList = [
    {
        name: 'As tolerated',
        value: 'As tolerated'
    },
    {
        name: '5',
        value: '5'
    },
    {
        name: '10',
        value: '10'
    },
    {
        name: '15',
        value: '15'
    },
    {
        name: '20',
        value: '20'
    },
    {
        name: '25',
        value: '25'
    },
    {
        name: '30',
        value: '30'
    },
    {
        name: '35',
        value: '35'
    },
    {
        name: '40',
        value: '40'
    },
    {
        name: '45',
        value: '45'
    },
    {
        name: '50',
        value: '50'
    },
]

export const resistanceList = [
    {
        name: 'As tolerated',
        value: 'As tolerated'
    },
    {
        name: 'Free Active',
        value: 'Free Active'
    },
   
]

export const resistanceUnitList = [
    {
        name: 'lb',
        value: 'lb'
    },
    {
        name: 'kg',
        value: 'kg'
    },
]


export const walkingAidsList = [
    {
        name: 'Elbow Crutch Left',
        value: 'Elbow Crutch Left'
    },
    {
        name: 'Elbow Crutch Right',
        value: 'Elbow Crutch Right'
    },
    {
        name: 'Elbow Crutches Bilateral',
        value: 'Elbow Crutches Bilateral'
    },
    {
        name: 'Frame',
        value: 'Frame'
    },
    {
        name: 'Gutter Crutch Left',
        value: 'Gutter Crutch Left'
    },
    {
        name: 'Gutter Crutch Right',
        value: 'Gutter Crutch Right'
    },
    {
        name: 'Gutter Crutches Bilateral',
        value: 'Gutter Crutches Bilateral'
    },
    {
        name: 'Gutter Frame Left',
        value: 'Gutter Frame Left'
    },
    {
        name: 'Gutter Frame Right',
        value: 'Gutter Frame Right'
    },
    {
        name: 'Gutter Frame Bilateral',
        value: 'Gutter Frame Bilateral'
    },
    {
        name: 'Gutter Rollator Left',
        value: 'Gutter Rollator Left'
    },
    {
        name: 'Gutter Rollator Right',
        value: 'Gutter Rollator Right'
    },
    {
        name: 'Gutter Rollator Bilateral',
        value: 'Gutter Rollator Bilateral'
    },
    {
        name: 'Quadripod Large Left',
        value: 'Quadripod Large Left'
    },
    {
        name: 'Quadripod Large Right',
        value: 'Quadripod Large Right'
    },
    {
        name: 'Quadripod Small Left',
        value: 'Quadripod Small Left'
    },
    {
        name: 'Quadripod Small Right',
        value: 'Quadripod Small Right'
    },
    {
        name: 'Rollator',
        value: 'Rollator'
    },
    {
        name: 'Stick Left',
        value: 'Stick Left'
    },
    {
        name: 'Stick Right',
        value: 'Stick Right'
    },
    {
        name: 'Unaided',
        value: 'Unaided'
    },
]

export const assistiveDeviceList = [
    
    {
        name: 'AFO',
        value: 'AFO'
    },
    {
        name: 'Air Splint',
        value: 'Air Splint'
    },
    {
        name: 'Anti Foot Drop Sling',
        value: 'Anti Foot Drop Sling'
    },
    {
        name: 'Arm Trough',
        value: 'Arm Trough'
    },
    {
        name: 'Back Cushion',
        value: 'Back Cushion'
    },
    {
        name: 'Chest Belt',
        value: 'Chest Belt'
    },
    {
        name: 'Elbow Brace',
        value: 'Elbow Brace'
    },
    {
        name: 'Foot Splint',
        value: 'Foot Splint'
    },
    {
        name: 'Gaiter',
        value: 'Gaiter'
    },
    {
        name: 'Hand Span',
        value: 'Hand Span'
    },
    {
        name: 'Hand Splint',
        value: 'Hand Splint'
    },
    {
        name: 'Hearing Aid',
        value: 'Hearing Aid'
    },
    {
        name: 'Helmet',
        value: 'Helmet'
    },
    {
        name: 'Hi-low Cushion',
        value: 'Hi-low Cushion'
    },
    {
        name: 'Knee Brace',
        value: 'Knee Brace'
    },
    {
        name: 'Lumbar Corset',
        value: 'Lumbar Corset'
    },
    {
        name: 'Neck Collar',
        value: 'Neck Collar'
    },
    {
        name: 'Pressure Garment',
        value: 'Pressure Garment'
    },
    {
        name: 'Prosthesis',
        value: 'Prosthesis'
    },
    {
        name: 'Seat Cushion',
        value: 'Seat Cushion'
    },
    {
        name: 'Shoulder Sling',
        value: 'Shoulder Sling'
    },
    {
        name: 'Special Shoe',
        value: 'Special Shoe'
    },
    {
        name: 'Table Top',
        value: 'Table Top'
    },
    {
        name: 'TLSO',
        value: 'TLSO'
    },
    {
        name: 'Wrist Splint',
        value: 'Wrist Splint'
    },
]

export const weightBearingStatusList = [
    
    {
        name: 'FWB',
        value: 'FWB'
    },
    {
        name: 'Heel-walking Left',
        value: 'Heel-walking Left'
    },
    {
        name: 'Heel-walking Right',
        value: 'Heel-walking Right'
    },
    {
        name: 'Heel-walking Bilatera',
        value: 'Heel-walking Bilatera'
    },
    {
        name: 'NWB Left',
        value: 'NWB Left'
    },
    {
        name: 'NWB Right',
        value: 'NWB Right'
    },
    {
        name: 'NWB Bilateral',
        value: 'NWB Bilateral'
    },
    {
        name: 'PWB Left',
        value: 'PWB Left'
    },
    {
        name: 'PWB Right',
        value: 'PWB Right'
    },
    {
        name: 'PWB Bilateral',
        value: 'PWB Bilateral'
    },
    {
        name: 'TDW Left',
        value: 'TDW Left'
    },
    {
        name: 'TDW Right',
        value: 'TDW Right'
    },
    {
        name: 'TDW Bilateral',
        value: 'TDW Bilateral'
    },
    {
        name: 'WBAT Left',
        value: 'WBAT Left'
    },
    {
        name: 'WBAT Right',
        value: 'WBAT Right'
    },
    {
        name: 'WBAT Bilateral',
        value: 'WBAT Bilateral'
    },
    
]

export const assistanceList = [
    {
        name: 'PT Only',
        value: 'PT Only'
    },
    {
        name: 'PCA',
        value: 'PCA'
    },
    {
        name: 'PT+ PCA',
        value: 'PT+ PCA'
    },
    {
        name: '2 Assistant',
        value: '2 Assistant'
    },
]

export const  durationList = [
    {
        name: '5 mins',
        value: '5'
    },
    {
        name: '10 mins',
        value: '10'
    },
    {
        name: '15 mins',
        value: '15'
    },
    {
        name: '20 mins',
        value: '20'
    },
    {
        name: '25 mins',
        value: '25'
    },
    {
        name: '30 mins',
        value: '30'
    },
    {
        name: '45 mins',
        value: '45'
    },
    {
        name: '60 mins',
        value: '60'
    },
]