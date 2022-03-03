import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, CardContent, Typography, Grid, Paper, Table, TableHead, TableRow, TableCell, TableBody, FormControl, withStyles, TextField } from '@material-ui/core';
import { styles } from './RiskProfileStyle';
import classNames from 'classnames';
import { MRAM_RISKPROFILE_RSPF_PREFIX,MRAM_RISKPROFILE_RSPF_EXAMINATION_ID,MRAM_RISKPROFILE_DISPLAY_ALBUMINURIA_MAP,MRAM_RISKPROFILE_DISPLAY_CKD_MAP,MRAM_RISKPROFILE_DISPLAY_FOOT_RISK_MAP } from '../../../../../constants/MRAM/riskProfile/riskProfileConstants';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import {isEmpty} from 'lodash';

class RiskProfile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      riskProfileFieldValMap:new Map()
    };
  }

  // static getDerivedStateFromProps(props, state) {
  //   let { riskProfileFieldValMap } = props;
  //   if (!isEqual(riskProfileFieldValMap,state.riskProfileFieldValMap)) {
  //     return {
  //       riskProfileFieldValMap
  //     };
  //   }
  //   return null;
  // }

  UNSAFE_componentWillUpdate(nextProps){
    if (nextProps.riskProfileFieldValMap !== this.props.riskProfileFieldValMap) {
      this.setState({
        riskProfileFieldValMap:nextProps.riskProfileFieldValMap
      });
    }
  }

  render() {
    const { classes } = this.props;
    const {riskProfileFieldValMap}= this.state;
    return (
      <Card className={classes.card} style={{height: this.props.height}}>
        <CardContent className={classes.cardContent}>
          <Typography component="div">
            <Paper elevation={1} className={classes.paper}>
              <Typography variant="h5" component="h3" className={classes.header}>
                Risk Profile
              </Typography>
              <Grid container>
                <Grid item xs={6}>
                  <ValidatorForm onSubmit={()=>{}}>
                    <FormControl component="fieldset" style={{marginInlineStart:1}} className={classes.form}>
                      <Table id="tableDerivedRight" className={classes.table}>
                        <TableHead>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableHeadFirstCell,classes.width50)}></TableCell>
                            <TableCell align="left" className={classes.tableHeadCell}>Derived</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} className={classes.tableRowFieldCell}>Macrovascular Complication(s)</TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Coronary Heart Disease</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input}
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CORONARY_HEART_DISEASE}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CORONARY_HEART_DISEASE}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CORONARY_HEART_DISEASE}`).value)
                                 :'Not known'}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Stroke</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.STROKE}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.STROKE}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.STROKE}`).value)
                                  :'Not known'}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Peripheral Arterial Disease</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MACROVASCULAR_PERIPHERAL_ARTERIAL_DISEASE}`)?
                               (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MACROVASCULAR_PERIPHERAL_ARTERIAL_DISEASE}`).value)?'Not known':
                               riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MACROVASCULAR_PERIPHERAL_ARTERIAL_DISEASE}`).value)
                               :'Not known'}
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} className={classes.tableRowFieldCell}>Microvascular Complication(s)</TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Hypertensive Retinopathy</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSENSIVE_RETINOPATHY}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSENSIVE_RETINOPATHY}`).value)?'Not known':

                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSENSIVE_RETINOPATHY}`).value)
                                 :'Not known'}

                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Diabetic Retinopathy</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETIC_RETINOPATHY}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETIC_RETINOPATHY}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETIC_RETINOPATHY}`).value)
                                 :'Not known'}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Albuminuria</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA}`)?
                                   (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA}`).value)?'Not known':
                                   MRAM_RISKPROFILE_DISPLAY_ALBUMINURIA_MAP.get(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.ALBUMINURIA}`).value))
                                  :'Not known'}
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Chronic Kidney Disease</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CHRONIC_KIDNEY_DISEASE}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CHRONIC_KIDNEY_DISEASE}`).value)?'Not known':
                                  MRAM_RISKPROFILE_DISPLAY_CKD_MAP.get(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CHRONIC_KIDNEY_DISEASE}`).value))
                                  :'Not known'}
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} className={classes.tableRowFieldCell}>Foot Risk Summary</TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Modified Foot Risk Category (ADA)</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MODIFIED_FOOT_RISK_CATEGORY}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MODIFIED_FOOT_RISK_CATEGORY}`).value)?'Not known':
                                  MRAM_RISKPROFILE_DISPLAY_FOOT_RISK_MAP.get(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MODIFIED_FOOT_RISK_CATEGORY}`).value))
                                  :'Not known'}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.secondLevelHeadCell)}>Foot Pathology</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.FOOT_PATHOLOGY}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.FOOT_PATHOLOGY}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.FOOT_PATHOLOGY}`).value)
                                 :'Not known'}

                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.secondLevelHeadCell)}>LOPS</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.LOPS}`)?
                               (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.LOPS}`).value)?'Not known':
                               riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.LOPS}`).value)
                              :'Not known'}
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.secondLevelHeadCell)}>Peripheral Arterial Disease</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MACROVASCULAR_PERIPHERAL_ARTERIAL_DISEASE}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MACROVASCULAR_PERIPHERAL_ARTERIAL_DISEASE}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.MACROVASCULAR_PERIPHERAL_ARTERIAL_DISEASE}`).value)
                                 :'Not known'}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.secondLevelHeadCell)}>History of Ulcer / Amputation</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HISTORY_OF_ULCER}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HISTORY_OF_ULCER}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HISTORY_OF_ULCER}`).value)
                                 :'Not known'}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </FormControl>
                  </ValidatorForm>
                </Grid>
                <Grid item xs={6}>
                  <ValidatorForm onSubmit={()=>{}}>
                    <FormControl component="fieldset" className={classes.form}>
                      <Table id="tableDerivedLeft"  className={classes.table}>
                        <TableHead>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableHeadFirstCell,classes.width50)}></TableCell>
                            <TableCell align="left" className={classes.tableHeadCell}>Derived</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} className={classes.tableRowFieldCell}>Other Risk Factor(s)</TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Smoking</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.SMOKING}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.SMOKING}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.SMOKING}`).value)
                                 :'Not known'}

                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Hypertension</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  id="mram_risk_profile_hypertension"
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSION}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSION}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.HYPERTENSION}`).value)
                                 :'Not known'}
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Diabetes Mellitus</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETES_MELLITUS}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETES_MELLITUS}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DIABETES_MELLITUS}`).value)
                                 :'Not known'}
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Obesity by BMI(Asian)</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.OBESITY_BY_MBI}`).value)
                                  :'Not known'}
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Central Obesity(Asian)</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CENTRAL_OBESITY}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CENTRAL_OBESITY}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.CENTRAL_OBESITY}`).value)
                                  :'Not known'}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Dyslipidaemia</TableCell>
                            <TableCell>
                              <TextField variant="outlined" className={classes.input} placeholder="Not known"
                                  InputProps={{
                                    classes: {input: classes.innerInput},
                                    style:{marginRight:6},
                                    readOnly: true
                                  }}
                                  value={riskProfileFieldValMap.has(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DYSLIPIDAEMIA}`)?
                                  (isEmpty(riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DYSLIPIDAEMIA}`).value)?'Not known':
                                  riskProfileFieldValMap.get(`${MRAM_RISKPROFILE_RSPF_PREFIX}_${MRAM_RISKPROFILE_RSPF_EXAMINATION_ID.DYSLIPIDAEMIA}`).value)
                                  :'Not known'}
                              />
                            </TableCell>
                          </TableRow>

                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} style={{ borderBottom: 0 }} className={classes.firstLevelHeadCell}></TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} style={{ borderTop: 0, borderBottom: 0 }} className={classes.firstLevelHeadCell}></TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} style={{ borderTop: 0 }} className={classes.firstLevelHeadCell}></TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} style={{ borderBottom: 0 }} className={classNames(classes.tableRowFieldCell, classes.width50)}>Note:</TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow} style={{ marginBottom: 23 }}>
                            <TableCell colSpan={2} style={{ borderTop: 0, borderBottom: 0 }} className={classes.borderNone}>
                              <Typography className={classes.riskText}>
                                This report is computer-generated according to a set of pre-determined criteria,
                                which is available upon request. It is intended for reference only. Physicians should
                                consider the patient's whole judgement in interpreting the result.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </FormControl>
                  </ValidatorForm>
                </Grid>
              </Grid>
            </Paper>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default connect()(withStyles(styles)(RiskProfile));
