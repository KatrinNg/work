import React, { Component } from 'react';
import { withStyles, Grid } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import StrengthenTextField from './component/StrengthenTextField/StrengthenTextField';
import InvestigationResultTable from './component/InvestigationResultTable/InvestigationResultTable';
import Enum from '../../../../../../../../../src/enums/enum';
import { styles } from './InvestigationResultStyle';
import { getState } from '../../../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};
import moment from 'moment';
import DateBox from './component/DateBox/DateBox';
import * as commonConstants from '../../../../../../../../constants/common/commonConstants';

class InvestigationResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            boneAgeDateErrorFlag: false,
            treatmentDateErrorFlag: false,
            thyroidScanDateErrorFlag: false
        };
    }
    getData = (valMap) => {
        const antiThyroglobulinObj = valMap.get(2000) ? valMap.get(2000) : {};
        const AABObj = valMap.get(2001) ? valMap.get(2001) : {};
        const boneAgeObj = valMap.get(2003) ? valMap.get(2003) : {};
        const thyroidScanObj = valMap.get(2005) ? valMap.get(2005) : {};
        const ageCommencementObj = valMap.get(2007) ? valMap.get(2007) : {};
        const DDACOTObj = valMap.get(2008) ? valMap.get(2008) : {};
        const followUpAtObj = valMap.get(2009) ? valMap.get(2009) : {};
        const remarkObj = valMap.get(2010) ? valMap.get(2010) : {};
        return {
            antiThyroglobulinObj,
            AABObj,
            boneAgeObj,
            thyroidScanObj,
            ageCommencementObj,
            DDACOTObj,
            followUpAtObj,
            remarkObj
        };
    }


    resultDataString = (itemId) => {
        let { valMap } = this.props;
        let dataVal = null;
        if (valMap.size > 0 && valMap.has(itemId)) {
            let obj = valMap.get(itemId);
            dataVal = obj.itemVal ? moment(obj.itemVal).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
        }
        return dataVal;
    }
    handleDateAccept = (value, formItemId, attrName) => {
        let { valMap, updateState, neonatalDocId, dataCommon, changeEditFlag } = this.props;
        let validateFlag = moment(value).isValid();
        let errorFlag = value === null ? false : (validateFlag ? false : !validateFlag);
        let dataValue = value ? moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
        if (valMap.size > 0 && valMap.has(formItemId)) {
            let tempObj = valMap.get(formItemId);
            if (tempObj.version) {
                tempObj.opType = dataValue == null ? commonConstants.COMMON_ACTION_TYPE.DELETE : commonConstants.COMMON_ACTION_TYPE.UPDATE;
                tempObj.itemVal = dataValue;
                tempObj.itemValErrorFlag = errorFlag;
            } else if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT && dataValue == null) {
                valMap.delete(formItemId);
            } else {
                tempObj.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
                tempObj.itemVal = dataValue;
                tempObj.itemValErrorFlag = errorFlag;
            }
        } else {
            let obj = {
                docId: neonatalDocId,
                patientKey: dataCommon.patientKey,
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                itemVal: dataValue,
                docItemId: Math.random(),
                formItemId: formItemId,
                createDtm: '',
                dbUpdateDtm: '',
                createBy: '',
                updateBy: '',
                updateDtm: '',
                version: '',
                itemValErrorFlag: false
            };
            valMap.set(obj.formItemId, obj);
        }
        this.setState({ [`${attrName}ErrorFlag`]: errorFlag });
        updateState && updateState({ valMap });
        changeEditFlag && changeEditFlag();
    }
    render() {
        let { boneAgeDateErrorFlag, treatmentDateErrorFlag, thyroidScanDateErrorFlag } = this.state;
        const { classes, valMap, updateState, patientKey, investigationResult, roleActionType, neonatalDocId, changeEditFlag } = this.props;
        let pagesDisableState = roleActionType == 'N' ? false: true;
        let {
            antiThyroglobulinObj,
            AABObj,
            boneAgeObj,
            thyroidScanObj,
            ageCommencementObj,
            DDACOTObj,
            followUpAtObj,
            remarkObj
        } = this.getData(valMap);
        let commonProps = {
            roleActionType,
            neonatalDocId,
            valMap,
            updateState,
            patientKey,
            changeEditFlag
        };
        const antiThyroglobulinProps = {
            errorFlag: false,
            val: antiThyroglobulinObj.itemVal ? antiThyroglobulinObj.itemVal : '',
            label: 'Antithyroglobulin: ',
            ...commonProps,
            itemId: 2000,
            attrName: 'itemVal',
            containerStyle: {
                width: '50%',
                boxSizing: 'border-box'
            },
            labelStyle: {
                paddingLeft: 0
            },
            TextFieldStyle: {
                flex: 1
            },
            more: {
                multiline: false,
                disabled: pagesDisableState
            }
        };
        const antimicrosomalAntiBodyProps = {
            errorFlag: false,
            val: AABObj.itemVal ? AABObj.itemVal : '',
            label: 'Antimicrosomal Antibody: ',
            ...commonProps,
            itemId: 2001,
            attrName: 'itemVal',
            containerStyle: {
                width: '50%',
                paddingLeft: 20,
                boxSizing: 'border-box'
            },
            labelStyle: {
                paddingLeft: 0
            },
            TextFieldStyle: {
                flex: 1
            },
            more: {
                multiline: false,
                disabled: pagesDisableState
            }
        };
        const boneAgeProps = {
            val: boneAgeObj.itemVal ? boneAgeObj.itemVal : '',
            label: '',
            ...commonProps,
            itemId: 2003,
            attrName: 'itemVal',
            containerStyle: {
            },
            labelStyle: {},
            TextFieldStyle: {
                flex: 1
            },
            multiline: true,
            more: {
                rowsMax: 3,
                rows: 3,
                disabled: pagesDisableState
            }
        };
        const thyroidScanProps = {
            val: thyroidScanObj.itemVal ? thyroidScanObj.itemVal : '',
            label: '',
            ...commonProps,
            itemId: 2005,
            attrName: 'itemVal',
            containerStyle: {
            },
            labelStyle: {},
            TextFieldStyle: {
                flex: 1
            },
            multiline: true,
            more: {
                rowsMax: 3,
                rows: 3,
                disabled: pagesDisableState
            }
        };
        const ageCommencementProps = {
            val: ageCommencementObj.itemVal ? ageCommencementObj.itemVal : '',
            label: 'Age Commencement:',
            ...commonProps,
            itemId: 2007,
            attrName: 'itemVal',
            containerStyle: {
            },
            labelStyle: {
                paddingLeft: 0
            },
            TextFieldStyle: {
                flex: 1
            },
            multiline: false,
            more: {
                disabled: pagesDisableState
            }
        };
        const DrugdosageTreatmentProps = {
            val: DDACOTObj.itemVal ? DDACOTObj.itemVal : '',
            label: 'Drug & dosage at commencement of treatment:',
            ...commonProps,
            itemId: 2008,
            attrName: 'itemVal',
            containerStyle: {
            },
            labelStyle: {
                paddingLeft: 0
            },
            TextFieldStyle: {
                flex: 1
            },
            multiline: false,
            more: {
                disabled: pagesDisableState
            }
        };
        const followUpAtProps = {
            val: followUpAtObj.itemVal ? followUpAtObj.itemVal : '',
            label: 'Follow up at:',
            ...commonProps,
            itemId: 2009,
            attrName: 'itemVal',
            containerStyle: {
            },
            labelStyle: {
                paddingLeft: 0
            },
            TextFieldStyle: {
                flex: 1
            },
            multiline: false,
            more: {
                disabled: pagesDisableState
            }
        };
        const remarkProps = {
            val: remarkObj.itemVal ? remarkObj.itemVal : '',
            label: 'Remark:',
            ...commonProps,
            itemId: 2010,
            attrName: 'itemVal',
            // containerStyle: {
            // },
            labelStyle: {
                paddingLeft: 0
            },
            TextFieldStyle: {
                flex: 1
            },
            multiline: true,
            more: {
                rowsMax: 3,
                rows: 3,
                disabled: pagesDisableState
            }
        };
        const InvestigationResultTableProps = { investigationResult };
        return (
            <div>
                <Grid className={classes.container} >
                    <Grid className={classes.antiTM}>
                        <StrengthenTextField {...antiThyroglobulinProps} />
                        <StrengthenTextField {...antimicrosomalAntiBodyProps} />
                    </Grid>
                    <Grid className={classes.boneAgeContainer}>
                        <Grid className={classes.boneAge}>
                            <Grid className={classes.boneAgeTitle}>Bone Age:</Grid>
                            <Grid className={classes.boneAgeDate}>
                                <DateBox
                                    itemId="boneAgeDate"
                                    attrName="boneAgeDate"
                                    format={Enum.DATE_FORMAT_EDMY_VALUE}
                                    value={this.resultDataString(2002)}
                                    errorFlag={boneAgeDateErrorFlag}
                                    formItemId={2002}
                                    onChange={this.handleDateAccept}
                                    onAccept={(d) => { this.handleDateAccept(d, 2002, 'boneAgeDate'); }}
                                    editMode={pagesDisableState}
                                />
                            </Grid>
                        </Grid>
                        <Grid>
                            <StrengthenTextField {...boneAgeProps} />
                        </Grid>
                    </Grid>
                    <Grid className={classes.boneAgeContainer}>
                        <Grid className={classes.boneAge}>
                            <Grid className={classes.boneAgeTitle}>Thyroid Scan:</Grid>
                            <Grid className={classes.boneAgeDate}>
                                <DateBox
                                    itemId="thyroidScanDate"
                                    attrName="thyroidScanDate"
                                    format={Enum.DATE_FORMAT_EDMY_VALUE}
                                    value={this.resultDataString(2004)}
                                    errorFlag={thyroidScanDateErrorFlag}
                                    formItemId={2004}
                                    onChange={this.handleDateAccept}
                                    onAccept={(d) => { this.handleDateAccept(d, 2004, 'thyroidScanDate'); }}
                                    editMode={pagesDisableState}
                                />
                            </Grid>
                        </Grid>
                        <Grid>
                            <StrengthenTextField {...thyroidScanProps} />
                        </Grid>
                    </Grid>
                    <div style={{ marginTop: 15 }} ><InvestigationResultTable {...InvestigationResultTableProps} /></div>
                    <Grid style={{ marginTop: 15 }}>
                        <Grid style={{ marginTop: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Grid style={{ display: 'flex', alignItems: 'center' }}>
                                <span>Date of commencement of treatment：</span>
                                <Grid style={{flex:1}}>
                                    <DateBox
                                        itemId="treatmentDate"
                                        attrName="treatmentDate"
                                        format={Enum.DATE_FORMAT_EDMY_VALUE}
                                        value={this.resultDataString(2006)}
                                        errorFlag={treatmentDateErrorFlag}
                                        formItemId={2006}
                                        onChange={this.handleDateAccept}
                                        onAccept={(d) => { this.handleDateAccept(d, 2006, 'treatmentDate'); }}
                                        editMode={pagesDisableState}
                                    />
                                </Grid>
                            </Grid>
                            <Grid>
                                <StrengthenTextField {...ageCommencementProps} />
                            </Grid>
                        </Grid>
                        <Grid style={{ marginTop: 15 }}>
                            <StrengthenTextField {...DrugdosageTreatmentProps} />
                        </Grid>
                        <Grid style={{ marginTop: 15 }}>
                            <StrengthenTextField {...followUpAtProps} />
                        </Grid>
                        <Grid style={{ marginTop: 15 }}>
                            <StrengthenTextField {...remarkProps} />
                        </Grid>
                    </Grid>
                </Grid >
            </div >
        );
    }
}

export default withStyles(styles)(InvestigationResult);