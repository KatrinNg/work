import React, { Component } from 'react';
import { connect } from 'react-redux';
// import moment from 'moment';
import { withStyles } from '@material-ui/core/styles';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import TimeRangePanel from './component/timeRangePanel';
import RecurrencePattern from './component/recurrencePatternPanel';
import RangeOfRecurrencePanel from './component/rangeOfRecurrencePanel';
import BasicInforPanel from './component/basicInforPanel';

class ComplexGeneration extends Component {
    constructor(props) {
        super(props);
        this.state = { expanded: 'panel1', activeStep: 0 };
    }

    handleChange = expanded => {
        this.setState({ expanded });
    };

    render() {
        const { id, classes, fieldsValidator, fieldsErrorMessage, enCounterCodeList, open, close } = this.props;
        // let filterEnCounterCodeList = enCounterCodeList.find(item => item.encounterTypeCd === this.props.encounterTypeCd);
        // const subEnCounterList = filterEnCounterCodeList ? filterEnCounterCodeList.subEncounterTypeList : [];
        return (
            <CIMSPromptDialog
                id={id}
                dialogTitle={'Slot Generate'}
                open={open}
                dialogContentText={
                        <ValidatorForm ref={'updateForm'} onSubmit={() => { }}
                            onError={() => { }}
                            style={{ backgroundColor: '#ffffff', width: 900 }}
                        >
                                <BasicInforPanel
                                    id={id + 'BasicInforPanel'}
                                    classes={classes}
                                    fieldsValidator={fieldsValidator}
                                    fieldsErrorMessage={fieldsErrorMessage}
                                    enCounterCodeList={enCounterCodeList}
                                />
                                <TimeRangePanel
                                    id={id + 'TimeRangePanel'}
                                    classes={classes}
                                    expanded={this.state.expanded}
                                    expandedOnChange={this.handleChange}
                                    value={'panel1'}
                                />
                                <RecurrencePattern
                                    id={id + 'RecurrencePattern'}
                                    classes={classes}
                                    expanded={this.state.expanded}
                                    expandedOnChange={this.handleChange}
                                    value={'panel2'}
                                />
                                <RangeOfRecurrencePanel
                                    id={id + 'RangeOfRecurrencePanel'}
                                    classes={classes}
                                    expanded={this.state.expanded}
                                    expandedOnChange={this.handleChange}
                                    value={'panel3'}
                                />

                        </ ValidatorForm>
                }
                buttonConfig={
                    [
                        {
                            id: id + 'SaveButton',
                            name: 'Save',
                            onClick: () => { console.log('OK'); }
                        },
                        {
                            id: id + 'SaveAndGenerateButton',
                            name: 'Save & Generate',
                            onClick: () => { console.log('OK'); }
                        },
                        {
                            id: id + 'CancelButton',
                            name: 'Cancel',
                            onClick: close
                        },
                        {
                            id: id + 'RemoveRecurrenceButton',
                            name: 'Remove Recurrence',
                            onClick: () => { console.log('RemoveRecurrence'); }
                        }
                    ]
                }
            />
        );
    }
}

const styles = () => ({
    radioBtn: {
        height: 26,
        paddingTop: 0,
        paddingBottom: 0,
        '&$radioBtnChecked': {
            height: 26,
            paddingTop: 0,
            paddingBottom: 0
        }
    },
    radioBtnChecked: {},
    close_icon: {
        padding: 0,
        marginRight: 10,
        borderRadius: '0%'
    },
    stepperGrid: {
        padding: '0 100px'
    },
    stepper: {
        padding: 10
    }
});

const mapStateToProps = (state) => {
    return {
        status: state.timeslotTemplate.status,
        enCounterCodeList: state.timeslotTemplate.enCounterCodeList,
        //subEnCounterCodeList: state.timeslotTemplate.subEnCounterCodeList,
        searchDTO: state.timeslotTemplate.searchDTO,
        ...state.timeslotTemplate.timeslotTemplateDTO
    };
};

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ComplexGeneration));