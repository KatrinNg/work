import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Box, Card, CardActions, CardMedia, Button, Grid, Typography } from '@material-ui/core';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';



const procedureSet = [
    {
        existingFilling: [
                {
                    qualifierName: 'qualifier1',
                    type: 'toggle',
                    label: 'Supernumerary',
                    supernumeraryFlag: 1
                },
                {
                    qualifierName: 'qualifier2',
                    type: 'select',
                    isMultiple: false,
                    label: 'Surface Involved ',
                    required: true,
                    options: [
                        {
                            label: 'Crown Surface',
                            value: 10
                        },
                        {
                            label: 'Root Surface',
                            value: 20
                        },
                        {
                            label: 'Both crown and root surface',
                            value: 30
                        }
                    ]
                },
                {
                    qualifierName: 'qualifier3',
                    type: 'select',
                    isMultiple: false,
                    label: 'Reason for Restoration ',
                    required: false,
                    options: [
                        {
                            label: 'Due to previous carious experience',
                            value: 10
                        },
                        {
                            label: 'NOT due to caries',
                            value: 20
                        },
                        {
                            label: 'Others (Please specify in the "Details" box)' ,
                            value: 30
                        }
                    ]
                },
                {
                    qualifierName: 'qualifier4',
                    type: 'select',
                    isMultiple: false,
                    label: 'Restoration Materials ',
                    required: true,
                    options: [
                        {
                            label: 'Amalgam/GIC with metal additives (e.g. Miracle Mix)',
                            value: 10
                        },
                        {
                            label: 'Composite resin/GIC/Compomer',
                            value: 20
                        },
                        {
                            label: 'Cast metal',
                            value: 30
                        },
                        {
                            label: 'Ceramic/Ceramo-metal (VMK)',
                            value: 40
                        },
                        {
                            label: 'Temporary filling material',
                            value: 50
                        }
                    ]
                }
            ]
    },
    {
        scaling: [
            {
                type: 'toogle',
                label: 'Supernumerary'
            },
            {
                qualifierName: 'qualifier2',
                type: 'select',
                isMultiple: true,
                label: 'Dental Arches ',
                required: true,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Upper dental arch ',
                        value: 20
                    },
                    {
                        label: 'Lower dental arch ',
                        value: 30
                    }
                ]
            },
            {
                qualifierName: 'qualifier3',
                type: 'select',
                isMultiple: true,
                label: 'Local Anaesthetic / Medication ',
                required: true,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Infiltration - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 20
                    },
                    {
                        label: 'Infiltration - Mepivacaine hydrochloride 3%',
                        value: 30
                    },
                    {
                        label: 'ID Block - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 40
                    },
                    {
                        label: 'Intraligamental - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 50
                    },
                    {
                        label: 'Intraligamental - Mepivacaine hydrochloride 3%',
                        value: 60
                    },
                    {
                        label: 'Ethyl chloride',
                        value: 70
                    },
                    {
                        label: 'Other medication (Please specify in the "Details" box)',
                        value: 80
                    }
                ]
            },
            {
                qualifierName: 'qualifier3',
                type: 'select',
                isMultiple: true,
                label: 'Scalling Site ',
                required: false,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Supragingival only ',
                        value: 20
                    },
                    {
                        label: 'Subgingival (subgingival curettage) ',
                        value: 30
                    }
                ]
            },
            {
                qualifierName: 'qualifier4',
                type: 'select',
                isMultiple: true,
                label: 'Local Anaesthetic / Medication ',
                required: true,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Infiltration - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 20
                    },
                    {
                        label: 'Infiltration - Mepivacaine hydrochloride 3%',
                        value: 30
                    },
                    {
                        label: 'ID Block - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 40
                    },
                    {
                        label: 'Intraligamental - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)',
                        value: 50
                    },
                    {
                        label: 'Intraligamental - Mepivacaine hydrochloride 3%',
                        value: 60
                    },
                    {
                        label: 'Ethyl chloride',
                        value: 70
                    },
                    {
                        label: 'Other medication (Please specify in the "Details" box)',
                        value: 80
                    }
                ]
            },
            {
                qualifierName: 'qualifier5',
                type: 'select',
                isMultiple: true,
                label: 'Dental Quadrants ',
                required: false,
                options: [
                    {
                        label: 'All',
                        value: 10
                    },
                    {
                        label: 'Q1 - upper right quadrant of dental arch',
                        value: 20
                    },
                    {
                        label: 'Q2 - upper left quadrant of dental arch',
                        value: 30
                    },
                    {
                        label: 'Q3 - lower left quadrant of dental arch',
                        value: 40
                    },
                    {
                        label: 'Q4 - lower right quadrant of dental arch',
                        value: 50
                    }
                ]
            }
        ]
    }
];


const styles = (theme) => ({
  root: {
    flexGrow: 1
  }
});

const cnoteTextHTML = '';


class DtsProcedureSetMenu extends Component {
  constructor(props){
        super(props);
        this.state = {


        };

  }

    componentDidMount() {

    }

    componentDidUpdate(prevProps) {


    }

    render(){
        const { classes, ...rest } = this.props;

        return(


                <section id="clinicalNote">
                  <Typography variant="h6">
                    <u>Procedure Sets</u>
                    {/*}<IconButton aria-label="Show Abbreviation" onClick={() => showCNoteAbbreviation((prev) => !prev)} edge="start">
                    <InfoIcon />
                    </IconButton> */}
                  </Typography>


                </section>
           );

    }

}

const mapStateToProps = (state) => {
    // console.log('pageStatus 1: ' + JSON.stringify(state.dtsAppointmentBooking.pageStatus));
    return {
        bookingPageStatus: state.dtsAppointmentBooking.pageStatus,
        switchingFlag: state.dtsAppointmentBooking.switchingFlag,
        patient: state.patient.patientInfo,
        tabs: state.mainFrame.tabs,
        subTabs: state.mainFrame.subTabs,
        accessRights: state.login.accessRights,
        userRoleType: state.login.loginInfo && state.login.loginInfo.userRoleType,
        defaultClinic: state.login.clinic
    };
};

const mapDispatchToProps = {

};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsProcedureSetMenu));