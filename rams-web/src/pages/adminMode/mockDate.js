const mockDate = [
    {
        type:'PT',
        response:[
            {
                title:'General',
                content:{
                    cName:'general',
                    date:[
                        {cname:'general',name:'vitalSignType',text:'Vital Sign Type'},
                        {name:'hotListActivities',text:'Hot List Treatments'}
                    ],
                }
            },
            {
                title:'Treatment',
                content:{
                    cName:'treatment',
                    date:[
                        {name:'category',text:'Category'},
                        {name:'treatment',text:'Treatment'},
                        {name:'side',text:'Side'},
                        {name:'position',text:'Position'},
                        {name:'assistance',text:'Assistance'},
                        {name:'walkingAids',text:'Walking Aids'},
                        {name:'assistiveDevice1',text:'Assistive Device (1)'},
                        {name:'assistiveDevice2',text:'Assistive Device (2)'},
                        {name:'weightBearingStatus1',text:'Weight Bearing Status (1)'},
                        {name:'weightBearingStatus2',text:'Weight Bearing Status (2)'},
                    ],
                }
            },
            {
                title:'Protocol',
                content:{
                    cName:'protocol',
                    date:[
                        {name:'protocol',text:'Protocol'}
                    ],
                }
            },
            {
                title:'Therapeutic Group',
                content:{
                    cName:'therapeuticGroup',
                    date:[
                        {name:'gCategory',text:'Category'},
                        {name:'group',text:'Group'},
                        {name:'reportByCategory',text:'Report by Category'},
                        {name:'reportByGroup',text:'Report by Group'},
                        {name:'yearlyReport',text:'Yearly report'},
                    ]
                }
            },
        ]
    },
    {
        type:'OT',
        response:[
            {
                title:'General',
                content:{
                    cName:'general',
                    date:[
                        {cname:'general',name:'vitalSignType',text:'Vital Sign Type'},
                        {name:'hotListActivities',text:'Hot List Activities'}
                    ],
                }
            },
            {
                title:'Activity',
                content:{
                    cName:'activity',
                    date:[
                        {name:'category',text:'Category'},
                        {name:'treatment',text:'Activity'},
                        {name:'side',text:'Side'},
                        {name:'position',text:'Position'},
                        {name:'assistance',text:'Assistance'},
                        {name:'walkingAids',text:'Walking Aids'},
                        {name:'assistiveDevice1',text:'Assistive Device (1)'},
                        {name:'assistiveDevice2',text:'Assistive Device (2)'},
                        {name:'weightBearingStatus1',text:'Weight Bearing Status (1)'},
                        {name:'weightBearingStatus2',text:'Weight Bearing Status (2)'},
                    ],
                }
            },
            {
                title:'Protocol',
                content:{
                    cName:'protocol',
                    date:[
                        {name:'protocol',text:'Protocol'}
                    ],
                }
            },
            {
                title:'Therapeutic Group',
                content:{
                    cName:'therapeuticGroup',
                    date:[
                        {name:'category',text:'Category'},
                        {name:'group',text:'Group'},
                        // {name:'reportByCategory',text:'Report by Category'},
                        // {name:'reportByGroup',text:'Report by Group'},
                        // {name:'yearlyReport',text:'Yearly report'},
                    ]
                }
            },
        ]
    },
]

export {mockDate}