import React, { Component } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableRow,
  TableCell,
  TableBody,
  FormControl,
  FormControlLabel,
  withStyles,
  Checkbox
} from '@material-ui/core';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import { style } from './otherComplicationsStyle';
import Enum from '../../../../../enums/enum';
import { isEqual } from 'lodash';
import * as generalUtil from '../../utils/generalUtil';
import RadioField from '../../components/RadioField/RadioField';
import {MRAM_OTHERCOMPLICATIONS_PREFIX,MRAM_OTHERCOMPLICATIONS_ID,RADIO_OPTION_1 } from '../../../../../constants/MRAM/otherComplications/otherComplicationsConstant';
import TextareaField from '../../components/TextareaField/TextareaField';
import { MRAM_FEILD_MAX_LENGTH } from '../../../../../constants/MRAM/mramConstant';

class otherComplications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEncounterVal:'',
      genderCd:''
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { otherComplicationsFieldValMap } = props;
    if (!isEqual(otherComplicationsFieldValMap,state.otherComplicationsFieldValMap)) {
      return {
        otherComplicationsFieldValMap
      };
    }
    return null;
  }

  updateValMaps = (map) => {
    const { updateState } = this.props;
    updateState&&updateState({
      otherComplicationsFieldValMap:map
    });
  }

  handleRadiChanged = (val,mramId)=>{
    let {otherComplicationsFieldValMap} = this.state;
    let fieldValObj;
    if(mramId===MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE){
      fieldValObj = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE}`);
      fieldValObj.value = val;
      if(val!=='Yes'){
        let fieldValHaemorrhagicObj = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_HAEMORRHAGIC}`);
        fieldValHaemorrhagicObj.value = '';
        let fieldIschaemicValObj = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_ISCHAEMIC}`);
        fieldIschaemicValObj.value = '';
        let fieldUnknownTypeValObj = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_UNKNOWN_TYPE}`);
        fieldUnknownTypeValObj.value = '';
        generalUtil.handleOperationType(fieldValHaemorrhagicObj);
        generalUtil.handleOperationType(fieldIschaemicValObj);
        generalUtil.handleOperationType(fieldUnknownTypeValObj);
      }
    } else if(mramId===MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY){
      fieldValObj = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY}`);
      fieldValObj.value = val;
      if(val!=='Yes'){
        let fieldActiveValObj = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_ACTIVE}`);
        fieldActiveValObj.value = '';
        let fieldPalliativeValObj = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PALLIATIVE}`);
         fieldPalliativeValObj.value = '';
        let fieldPastHxValObj = otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PAST_HX}`);
        fieldPastHxValObj.value = '';
        generalUtil.handleOperationType(fieldActiveValObj);
        generalUtil.handleOperationType(fieldPalliativeValObj);
        generalUtil.handleOperationType(fieldPastHxValObj);
      }
    }
    generalUtil.handleOperationType(fieldValObj);
    this.updateValMaps(otherComplicationsFieldValMap);
    this.setState({
      otherComplicationsFieldValMap:otherComplicationsFieldValMap
    });
  }
  handleCheckBoxChanged = (prefix,mramId) => event => {
    let { otherComplicationsFieldValMap } = this.state;
    let fieldValObj = otherComplicationsFieldValMap.get(`${prefix}_${mramId}`);
    if (event.target.checked) {
      fieldValObj.value = event.target.value;
    }else {
      fieldValObj.value = '';
    }
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      otherComplicationsFieldValMap
    });
    this.updateValMaps(otherComplicationsFieldValMap);
  }

  render() {
    const { classes,selectedGenderCd,view=false} = this.props;
    const { otherComplicationsFieldValMap} = this.state;
    let hxOfStrokeDisabledFlag= otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE}`)?
      ((otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE}`).value==='Yes')?false:true):true;
    let malignancyDisabledFlag= otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY}`)?
      ((otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY}`).value==='Yes')?false:true):true;

    let haemorrhagic = otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_HAEMORRHAGIC}`)?
    ((otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_HAEMORRHAGIC}`).value==='')?false:true):false;
    let ischaemic = otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_ISCHAEMIC}`)?
    ((otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_ISCHAEMIC}`).value==='')?false:true):false;
    let unknownType = otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_UNKNOWN_TYPE}`)?
    ((otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_UNKNOWN_TYPE}`).value==='')?false:true):false;
    let active = otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_ACTIVE}`)?
    ((otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_ACTIVE}`).value==='')?false:true):false;
    let palliative = otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PALLIATIVE}`)?
    ((otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PALLIATIVE}`).value==='')?false:true):false;
    let pastHx =otherComplicationsFieldValMap.has(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PAST_HX}`)?
    ((otherComplicationsFieldValMap.get(`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PAST_HX}`).value==='')?false:true):false;

    return (
      <Card className={classes.card} style={{height: this.props.height}}>
        <CardContent className={classes.cardContent}>
          <Typography component="div">
            <ValidatorForm id="otherComplicationsForm" onSubmit={() => { }}>
              <Grid container>
                <Grid item xs={12}>
                  <Paper elevation={1}>
                    <Typography variant="h5" component="h3" className={classes.leftHeader}>Other Complication(s)</Typography>
                    <Typography component="div">
                      <FormControl component="fieldset" className={classes.form}>
                        <Table id="tableOtherComplications">
                          <TableBody>
                            <TableRow className={classes.tableRow}>
                              <TableCell rowSpan={1} className={classes.tableRowFieldCell} style={{ width: '30%' }}>Coronary Heart Disease<sup className={classes.sup}>R</sup></TableCell>
                              <TableCell rowSpan={1} style={{ width: '20%' }} className={classes.tableRowFieldCell}>
                                <RadioField
                                    id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.CORONARY_HEART_DISEASE}`}
                                    fieldValMap={otherComplicationsFieldValMap}
                                    prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                    mramId={MRAM_OTHERCOMPLICATIONS_ID.CORONARY_HEART_DISEASE}
                                    updateState={this.props.updateState}
                                    radioOptions={RADIO_OPTION_1}
                                    viewMode={view}
                                />
                              </TableCell>
                              <TableCell rowSpan={1} style={{ width: '50%' }} className={classNames(classes.tableRowFieldCell, classes.borderNone)}>Remarks</TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell rowSpan={1} className={classes.tableRowFieldCell}>Congestive Heart Failure</TableCell>
                              <TableCell rowSpan={1} className={classes.tableRowFieldCell}>
                                <RadioField
                                    id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.CONGESTIVE_HEART_FAILURE}`}
                                    fieldValMap={otherComplicationsFieldValMap}
                                    prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                    mramId={MRAM_OTHERCOMPLICATIONS_ID.CONGESTIVE_HEART_FAILURE}
                                    updateState={this.props.updateState}
                                    radioOptions={RADIO_OPTION_1}
                                    viewMode={view}
                                />
                              </TableCell>
                              <TableCell rowSpan={6} style={{ width: '50%' }} className={classNames(classes.tableRowFieldCell, classes.borderNone)}>
                                <TextareaField
                                    classes={{textBox:classes.textBox}}
                                    id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.REMARKS}`}
                                    fieldValMap={otherComplicationsFieldValMap}
                                    prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                    mramId={MRAM_OTHERCOMPLICATIONS_ID.REMARKS}
                                    updateState={this.props.updateState}
                                    viewMode={view}
                                    maxLength={MRAM_FEILD_MAX_LENGTH.remarks}
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell disabled className={selectedGenderCd===Enum.GENDER_FEMALE_VALUE?classes.disable:classes.tableRowFieldCell}>
                                Erectile Dysfunction
                              </TableCell>
                              <TableCell className={classes.tableRowFieldCell}>
                                 <RadioField
                                     disable={(view||selectedGenderCd==Enum.GENDER_FEMALE_VALUE)?true:false}
                                     id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.ERECTILE_DYSFUNCTION}`}
                                     fieldValMap={otherComplicationsFieldValMap}
                                     prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                     mramId={MRAM_OTHERCOMPLICATIONS_ID.ERECTILE_DYSFUNCTION}
                                     updateState={this.props.updateState}
                                     radioOptions={RADIO_OPTION_1}
                                     viewMode={(view||selectedGenderCd===Enum.GENDER_FEMALE_VALUE)?true:false}
                                 />
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classes.tableRowFieldCell}>History of Tuberculosis</TableCell>
                              <TableCell className={classes.tableRowFieldCell}>
                                 <RadioField
                                     id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_TUBERCULOSIS}`}
                                     fieldValMap={otherComplicationsFieldValMap}
                                     prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                     mramId={MRAM_OTHERCOMPLICATIONS_ID.HX_OF_TUBERCULOSIS}
                                     updateState={this.props.updateState}
                                     radioOptions={RADIO_OPTION_1}
                                     viewMode={view}
                                 />
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classes.tableRowFieldCell}>Dialysis</TableCell>
                              <TableCell className={classes.tableRowFieldCell}>
                                <RadioField
                                    id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.DIALYSIS}`}
                                    fieldValMap={otherComplicationsFieldValMap}
                                    prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                    mramId={MRAM_OTHERCOMPLICATIONS_ID.DIALYSIS}
                                    updateState={this.props.updateState}
                                    radioOptions={RADIO_OPTION_1}
                                    viewMode={view}
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classes.tableRowFieldCell}>Renal Transplant</TableCell>
                              <TableCell className={classes.tableRowFieldCell}>
                                <RadioField
                                    id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.RENAL_TRANSPLANT}`}
                                    fieldValMap={otherComplicationsFieldValMap}
                                    prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                    mramId={MRAM_OTHERCOMPLICATIONS_ID.RENAL_TRANSPLANT}
                                    updateState={this.props.updateState}
                                    radioOptions={RADIO_OPTION_1}
                                    viewMode={view}
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classes.tableRowFieldCell}>History of Stroke<sup className={classes.sup}>R</sup></TableCell>
                              <TableCell className={classes.tableRowFieldCell}>
                                <RadioField
                                    id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE}`}
                                    fieldValMap={otherComplicationsFieldValMap}
                                    prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                    mramId={MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE}
                                    updateState={this.props.updateState}
                                    sideEffect={this.handleRadiChanged}
                                    radioOptions={RADIO_OPTION_1}
                                    viewMode={view}
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classes.tableRowFieldCell}></TableCell>
                              <TableCell className={classes.tableRowFieldCell}>
                                <Grid item className={classes.checkboxGrid}>
                                  <FormControlLabel
                                      label="Haemorrhagic"
                                      classes={{ label: classes.controlLabel, disabled: classes.disabledLabel }}
                                      disabled={hxOfStrokeDisabledFlag||view}
                                      control={
                                      <Checkbox
                                          checked={haemorrhagic}
                                          id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_HAEMORRHAGIC}`}
                                          onChange={this.handleCheckBoxChanged(MRAM_OTHERCOMPLICATIONS_PREFIX,MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_HAEMORRHAGIC)}
                                          value="Haemorrhagic"
                                          color="primary"
                                          className={classes.checkPadding}
                                      />
                                    }
                                  />
                                  <br></br>
                                  <FormControlLabel
                                      disabled={hxOfStrokeDisabledFlag||view}
                                      classes={{ label: classes.controlLabel, disabled: classes.disabledLabel }}
                                      label="Ischaemic"
                                      control={
                                      <Checkbox
                                          checked={ischaemic}
                                          id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_ISCHAEMIC}`}
                                          onChange={this.handleCheckBoxChanged(MRAM_OTHERCOMPLICATIONS_PREFIX,MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_ISCHAEMIC)}
                                          value="Ischaemic"
                                          color="primary"
                                          className={classes.checkPadding}
                                      />
                                    }
                                  />
                                  <br></br>
                                  <FormControlLabel
                                      disabled={hxOfStrokeDisabledFlag||view}
                                      classes={{ label: classes.controlLabel, disabled: classes.disabledLabel }}
                                      label="Unknown type"
                                      control={
                                      <Checkbox
                                          checked={unknownType}
                                          id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_UNKNOWN_TYPE}`}
                                          onChange={this.handleCheckBoxChanged(MRAM_OTHERCOMPLICATIONS_PREFIX,MRAM_OTHERCOMPLICATIONS_ID.HX_OF_STROKE_UNKNOWN_TYPE)}
                                          value="Unknown type"
                                          color="primary"
                                          className={classes.checkPadding}
                                      />
                                    }
                                  />
                                </Grid>
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classes.tableRowFieldCell}>Malignancy</TableCell>
                              <TableCell className={classes.tableRowFieldCell}>
                                <RadioField
                                    id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY}`}
                                    fieldValMap={otherComplicationsFieldValMap}
                                    prefix={MRAM_OTHERCOMPLICATIONS_PREFIX}
                                    mramId={MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY}
                                    updateState={this.props.updateState}
                                    sideEffect={this.handleRadiChanged}
                                    radioOptions={RADIO_OPTION_1}
                                    viewMode={view}
                                />
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classes.tableRowFieldCell}></TableCell>
                              <TableCell className={classes.tableRowFieldCell}>
                                <Grid item className={classes.checkboxGrid}>
                                  <FormControlLabel
                                      disabled={malignancyDisabledFlag||view}
                                      classes={{ label: classes.controlLabel, disabled: classes.disabledLabel }}
                                      label="Active"
                                      control={
                                      <Checkbox
                                          checked={active||view}
                                          id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_ACTIVE}`}
                                          onChange={this.handleCheckBoxChanged(MRAM_OTHERCOMPLICATIONS_PREFIX,MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_ACTIVE)}
                                          value="Active"
                                          color="primary"
                                          className={classes.checkPadding}
                                      />
                                      }
                                  />
                                  <br></br>
                                  <FormControlLabel
                                      disabled={malignancyDisabledFlag||view}
                                      classes={{ label: classes.controlLabel, disabled: classes.disabledLabel }}
                                      label="Palliative"
                                      control={
                                      <Checkbox
                                          checked={palliative}
                                          id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PALLIATIVE}`}
                                          onChange={this.handleCheckBoxChanged(MRAM_OTHERCOMPLICATIONS_PREFIX,MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PALLIATIVE)}
                                          value="Palliative"
                                          color="primary"
                                          className={classes.checkPadding}
                                      />
                                      }
                                  />
                                  <br></br>
                                  <FormControlLabel
                                      disabled={malignancyDisabledFlag||view}
                                      classes={{ label: classes.controlLabel, disabled: classes.disabledLabel }}
                                      label="Past Hx"
                                      control={
                                      <Checkbox
                                          checked={pastHx}
                                          id={`${MRAM_OTHERCOMPLICATIONS_PREFIX}_${MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PAST_HX}`}
                                          onChange={this.handleCheckBoxChanged(MRAM_OTHERCOMPLICATIONS_PREFIX,MRAM_OTHERCOMPLICATIONS_ID.MALIGNANCY_PAST_HX)}
                                          value="Past Hx"
                                          color="primary"
                                          className={classes.checkPadding}
                                      />
                                      }
                                  />
                                </Grid>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </FormControl>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </ValidatorForm>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}
function mapStateToProps(state) {
  return {
    loginInfo: state.login.loginInfo,
    encounterList: state.assessment.tempEncounterList
  };
}
const mapDispatchToProps = {
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(otherComplications));

