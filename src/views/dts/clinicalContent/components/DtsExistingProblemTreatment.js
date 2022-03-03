import React , { Component } from 'react';
import {Table, TableBody, TableCell,TableHead, TableRow, withStyles, Typography, Tooltip, Text} from '@material-ui/core';
import { makeStyles, Theme, createStyles, ThemeProvider, createMuiTheme  } from '@material-ui/core/styles';
//import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import { connect } from 'react-redux';
import moment from 'moment';
import Enum from '../../../../enums/enum';
const styles = {

  tableCell:{
          //borderStyle: 'none',
          //borderBottom: '1px solid rgba(224, 224, 224, 1)',
          //padding:'0px 8px',
          maxWidth:'200px'

      },
  qualifierDisplay:{
      'overflow': 'hidden',
      'text-overflow': 'ellipsis',
      'display': '-webkit-box',
      '-webkit-line-clamp': 2,
      '-webkit-box-orient': 'vertical',
      'white-space': 'normal',
      'border-left': 'none',
      'border-right': 'none',
      'border-top': 'none',
      'padding': '0px',
      'margin-bottom': 1,
      'line-height': 'normal',
      fontSize:'15px'
  },
  qualifierCell:{

    width: 350
  },
  tableRow:{
    'height' : 20
  },
  customToolTip: {
      maxWidth: 200,
      fontSize: 15
    },
  multipleLine: {

  }


};


const prbTxColumns = [
  // { id: "discipline", label: "Discip.", minWidth: 20 },
  { id: 'planDate',
    label: 'Prob. Date',
    minWidth: 50,
    'white-space': 'nowrap'
  },
  {
    id: 'problem',
    label: 'Problem',
    minWidth: 60,
    align: 'left'
  },
  {
    id: 'qualifier',
    label: 'Qualifier',
    minWidth: 60,
    align: 'left'
  },
  // {
  //   id: "plan",
  //   label: "Tx Plan",
  //   minWidth: 60,
  //   align: "left"
  // },

  {
    id: 'status',
    label: 'Status',
    minWidth: 10,
    align: 'center'
  }
];

function createData(discipline, planDate, problem,qualifier, plan, status) {
  return { discipline, planDate, problem,qualifier, plan, status };
}

const rows = [
  createData('FD','08-09-2019', 'Dental Caries','15MO;deep caries, warned risk of irreversible pulpitis', 'Amal 15MO', 'R'),
  createData('FD', '10-09-2019', 'Dental Caries','21D; Coronal, Active; Recurrent (Secondary) cavitated', 'Comp 21D', 'A'),
  createData('GD', '08-09-2019', 'Local moderate periodontitis','34;35;36;37', 'DH (OHI reinface + Scal) RP', 'A'),
  createData('GD', '08-09-2019', 'Chronic apical periodontitis (Apical granuloma)','25', 'RCT 25, VMK Cr 25', 'A'),
  createData('GD', '08-09-2019', 'Defective filling / intracoronal restoration','25B', 'KIV', 'A'),
  createData('GD', '08-09-2019', 'Attrition of tooth (toothwear)','16O; 13I; 12I; 11I; 21I; 22I; 23I; 41I; 42I; 43I; 46O;', 'KIV', 'A')
];

class DtsExistingProblemTreatment extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      qualifierList: null
      //currentNoteInfo: props.currentNoteInfo,
      //currentEditFlag: 'N',
      //initFlag: true,
      //addANote: false

    };
  }




   getProblemQualifierItem(idx, problemList, classes){
     console.log('problemList: ' + JSON.stringify(problemList));
        return (
            <TableRow key={idx} className={classes.tableRow}>
                 {/* <Tooltip classes={{ tooltip: classes.customToolTip }} title={<span style={{ whiteSpace: 'pre-line' }}>{this.getCurrProblemDetail(problemList)}</span>} placement="bottom-start"> */}
                 <Tooltip classes={{ tooltip: classes.customToolTip }} title={<span style={{ whiteSpace: 'pre-line' }}>{this.getCurrProblemDetail(problemList)}</span>} placement="bottom-start">
                  <TableCell  align="left" style={{width:'50px'}}>
                    <Typography noWrap style={{fontSize:'15px'}}>
                      {/* {this.getProblemListUpdateDateValue(problemList)} */}
                       {moment(problemList.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE)}
                    </Typography>

                  </TableCell>
                </Tooltip>

                <Tooltip classes={{ tooltip: classes.customToolTip }} title={problemList.diagnosisText} placement="bottom-start">
                  <TableCell align="left" style={{maxWidth:'250px'}}>
                    <Typography noWrap style={{fontSize:'15px'}}>
                      {problemList.diagnosisText}
                          {/* {this.getProblemListConceptDescription(problemList)} */}
                    </Typography>
                  </TableCell>
                </Tooltip>
                {/* <Tooltip classes={{ tooltip: classes.customToolTip }} title={<div style={{ whiteSpace: 'pre-line' }}>{this.getGroupedQualiferToolTip(problemList)}</div>} placement="bottom-end"> */}
                <Tooltip classes={{ tooltip: classes.customToolTip }} title={<div style={{ whiteSpace: 'pre-line' }}>{this.getGroupedQualiferToolTip(problemList)}</div>} placement="bottom-end">
                  {/* <TableCell className={classes.qualifierCell} align="left"> */}
                  <TableCell  style={{width:'600px'}} align="left">
                    <div className={classes.qualifierDisplay}>
                      {this.getGroupedQualifer(problemList)}
                    </div>

                  </TableCell>
                </Tooltip>

                <TableCell  align="center" style={{width:'50px'}}>
                  <Typography noWrap style={{fontSize:'15px'}}>
                      {problemList.diagnosisStatusCd}
                  </Typography>
                </TableCell>
           </TableRow>
        );
    }

  getProblemListUpdateDateValue = (problemList) =>{

    let updateDate = '';

    for(let i = 0; i< problemList.length; i++){


      updateDate = problemList[i].updateDtm;

    }

    if(updateDate!= ''){

     updateDate = moment(updateDate).format('DD-MM-YYYY');
    }

    return updateDate;
  }

getProblemListConceptDescription =(problemList) =>{

  let conceptDesc = '';

    for(let i = 0; i< problemList.length; i++){


      conceptDesc = problemList[i].conceptDesc;

    }

    return conceptDesc;
  }
  getProblemListDiagnosisStatusCd =(problemList) =>{

  let diagnosisStatusCd = '';

    for(let i = 0; i< problemList.length; i++){


      diagnosisStatusCd = problemList[i].diagnosisStatusCd;

    }

    return diagnosisStatusCd;
  }


  getGroupedQualifer = (problemList) => {

    let groupedQualifiers = '';
    let qualifier1='';
    let qualifier2='';
    let qualifier3='';
    let qualifier4='';
    let qualifier5='';
    let qualifier6='';
    let tooth='';
    let surface='';
    let remarks = '';
    let toothSurface='';

        for(let j = 0; j<problemList.codQlfValDto1.length; j++){
         if(problemList.codQlfValDto1.length > 0){

            if(problemList.codQlfValDto1[j].qlfCod == 'TOOTH'){
              tooth = problemList.codQlfValDto1[j].valDesc;
            }

            if(problemList.codQlfValDto1[j].qlfCod == 'TOOTH_SURFACE'){
              surface += problemList.codQlfValDto1[j].valDesc;
            }

            if(problemList.codQlfValDto1[j].qlfCod != 'TOOTH' && problemList.codQlfValDto1[j].qlfCod != 'TOOTH_SURFACE'){
              qualifier1 += problemList.codQlfValDto1[j].valDesc+ '; ';
            }
          }
        }

        for(let j = 0; j<problemList.codQlfValDto2.length; j++){
          if(problemList.codQlfValDto2.length > 0){
              if(problemList.codQlfValDto2[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto2[j].valDesc;
              }

              if(problemList.codQlfValDto2[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto2[j].valDesc;
              }

              if(problemList.codQlfValDto2[j].qlfCod != 'TOOTH' && problemList.codQlfValDto2[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier2 += problemList.codQlfValDto2[j].valDesc + '; ';
              }
          }
        }
         //groupedQualifiers += qualifier2;
        for(let j = 0; j<problemList.codQlfValDto3.length; j++){
          if(problemList.codQlfValDto3.length > 0){
             if(problemList.codQlfValDto3[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto3[j].valDesc;
              }

              if(problemList.codQlfValDto3[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto3[j].valDesc;
              }

              if(problemList.codQlfValDto3[j].qlfCod != 'TOOTH' && problemList.codQlfValDto3[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier3 += problemList.codQlfValDto3[j].valDesc + '; ';
              }

          }
        }

        for(let j = 0; j<problemList.codQlfValDto4.length; j++){
            if(problemList.codQlfValDto4.length > 0){
             if(problemList.codQlfValDto4[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto4[j].valDesc;
              }

              if(problemList.codQlfValDto4[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto4[j].valDesc;
              }

              if(problemList.codQlfValDto4[j].qlfCod != 'TOOTH' && problemList.codQlfValDto4[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier4 += problemList.codQlfValDto4[j].valDesc + '; ';
              }
          }
        }

        for(let j = 0; j<problemList.codQlfValDto5.length; j++){
            if(problemList.codQlfValDto5.length > 0){
              if(problemList.codQlfValDto5[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto5[j].valDesc;
              }

              if(problemList.codQlfValDto5[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto5[j].valDesc;
              }

              if(problemList.codQlfValDto5[j].qlfCod != 'TOOTH' && problemList.codQlfValDto5[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier5 += problemList.codQlfValDto5[j].valDesc + '; ';
              }
          }
        }


        for(let j = 0; j<problemList.codQlfValDto6.length; j++){
          if(problemList.codQlfValDto6.length > 0){
              if(problemList.codQlfValDto6[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto6[j].valDesc;
              }

              if(problemList.codQlfValDto6[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto6[j].valDesc + '; ';
              }

              if(problemList.codQlfValDto6[j].qlfCod != 'TOOTH' && problemList.codQlfValDto6[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier6 += problemList.codQlfValDto6[j].valDesc + '; ';
              }
          }
        }

        if(problemList.remarks){
          remarks = problemList.remarks;
        }




        toothSurface = tooth + surface;

        if(toothSurface == ''){
          groupedQualifiers = qualifier1 + qualifier2 + qualifier3 + qualifier4 + qualifier5 + qualifier6 + remarks;
        }else{
          groupedQualifiers = toothSurface + '; ' + qualifier1 + qualifier2 + qualifier3 + qualifier4 + qualifier5 + qualifier6 + remarks;
        }




      groupedQualifiers = groupedQualifiers.trim();

      if(groupedQualifiers.endsWith(';')){

        groupedQualifiers = groupedQualifiers.slice(0, -1) + '';

      }



    return groupedQualifiers;

  }

  getGroupedQualiferToolTip = (problemList) => {


    let groupedQualifiers = '';
    let qualifier1='';
    let qualifier2='';
    let qualifier3='';
    let qualifier4='';
    let qualifier5='';
    let qualifier6='';
    let tooth='';
    let surface='';
    let remarks = '';
    let toothSurface='';

        for(let j = 0; j<problemList.codQlfValDto1.length; j++){
         if(problemList.codQlfValDto1.length > 0){

            if(problemList.codQlfValDto1[j].qlfCod == 'TOOTH'){
              tooth = problemList.codQlfValDto1[j].valDesc;
            }

            if(problemList.codQlfValDto1[j].qlfCod == 'TOOTH_SURFACE'){
              surface += problemList.codQlfValDto1[j].valDesc;
            }

            if(problemList.codQlfValDto1[j].qlfCod != 'TOOTH' && problemList.codQlfValDto1[j].qlfCod != 'TOOTH_SURFACE'){
              qualifier1 += problemList.codQlfValDto1[j].valDesc+ '; ';
            }
          }
        }

        for(let j = 0; j<problemList.codQlfValDto2.length; j++){
          if(problemList.codQlfValDto2.length > 0){
              if(problemList.codQlfValDto2[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto2[j].valDesc;
              }

              if(problemList.codQlfValDto2[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto2[j].valDesc;
              }

              if(problemList.codQlfValDto2[j].qlfCod != 'TOOTH' && problemList.codQlfValDto2[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier2 += problemList.codQlfValDto2[j].valDesc + '; ';
              }
          }
        }
         //groupedQualifiers += qualifier2;
        for(let j = 0; j<problemList.codQlfValDto3.length; j++){
          if(problemList.codQlfValDto3.length > 0){
             if(problemList.codQlfValDto3[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto3[j].valDesc;
              }

              if(problemList.codQlfValDto3[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto3[j].valDesc;
              }

              if(problemList.codQlfValDto3[j].qlfCod != 'TOOTH' && problemList.codQlfValDto3[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier3 += problemList.codQlfValDto3[j].valDesc + '; ';
              }

          }
        }

        for(let j = 0; j<problemList.codQlfValDto4.length; j++){
            if(problemList.codQlfValDto4.length > 0){
             if(problemList.codQlfValDto4[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto4[j].valDesc;
              }

              if(problemList.codQlfValDto4[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto4[j].valDesc;
              }

              if(problemList.codQlfValDto4[j].qlfCod != 'TOOTH' && problemList.codQlfValDto4[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier4 += problemList.codQlfValDto4[j].valDesc + '; ';
              }
          }
        }

        for(let j = 0; j<problemList.codQlfValDto5.length; j++){
            if(problemList.codQlfValDto5.length > 0){
              if(problemList.codQlfValDto5[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto5[j].valDesc;
              }

              if(problemList.codQlfValDto5[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto5[j].valDesc;
              }

              if(problemList.codQlfValDto5[j].qlfCod != 'TOOTH' && problemList.codQlfValDto5[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier5 += problemList.codQlfValDto5[j].valDesc + '; ';
              }
          }
        }


        for(let j = 0; j<problemList.codQlfValDto6.length; j++){
          if(problemList.codQlfValDto6.length > 0){
              if(problemList.codQlfValDto6[j].qlfCod == 'TOOTH'){
                tooth = problemList.codQlfValDto6[j].valDesc;
              }

              if(problemList.codQlfValDto6[j].qlfCod == 'TOOTH_SURFACE'){
                surface += problemList.codQlfValDto6[j].valDesc + '; ';
              }

              if(problemList.codQlfValDto6[j].qlfCod != 'TOOTH' && problemList.codQlfValDto6[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier6 += problemList.codQlfValDto6[j].valDesc + '; ';
              }
          }
        }


      if(problemList.remarks){
        remarks = '\n\nDescription: \n' +  problemList.remarks;
      }

        toothSurface = tooth + surface;

        if(toothSurface == ''){
          groupedQualifiers = qualifier1 + qualifier2 + qualifier3 + qualifier4 + qualifier5 + qualifier6 + remarks;
        }else{
          groupedQualifiers = toothSurface + '; ' + qualifier1 + qualifier2 + qualifier3 + qualifier4 + qualifier5 + qualifier6 + remarks;
        }


      groupedQualifiers = groupedQualifiers.trim();

      if(groupedQualifiers.endsWith(';')){
        groupedQualifiers = groupedQualifiers.slice(0, -1) + '';
      }
    return groupedQualifiers;

  }


  getCurrProblemDetail = (problem) => {

    const {allSpecialties, roomList, clinicList} = this.props;

    let sspecId = '';
    let roomId = '';
    let descpline = '';
    let room = '';
    let siteId = '';
    let clinic = '';
    let note = '';

    sspecId =  problem.sspecId;
    roomId = problem.rmId;
    siteId = problem.siteId;
    descpline = allSpecialties.find(specialty => specialty.sspecId == sspecId).sspecCd;
    room = roomList.find(item => item.rmId === roomId).rmCd;
    clinic = clinicList.find(item => item.siteId === siteId).siteCd;

    if(descpline != null || typeof descpline != 'undefined'){
      note = 'Descpline: ' + descpline +'\n';
    }

    if(room != null || typeof room != 'undefined'){
      note += 'Surgery Room: ' + room +'\n';
    }
      if(clinic != null || typeof clinic != 'undefined'){
      note += 'Clinic: ' + clinic;
    }
    return note;


  }



  render () {
      // console.log('ExistingProblemTreatment.render.readOnly ==> ' + this.props.readOnly)
      // eslint-disable-next-line
      const { classes, readOnly, currentEncounter, problemQualifierList,...rest } = this.props;//NOSONAR

      console.log('currentEncounter: ' + JSON.stringify(currentEncounter));

        return (
            <Table stickyHeader aria-label="sticky table" >
           {/* <TableContainer component={Paper}> */}
              <TableHead>
                <TableRow>
                  {prbTxColumns.map(column => (
                    <TableCell
                        key={column.id}
                        align={column.align}
                        style={{ minWidth: column.minWidth, 'white-space': 'nowrap', padding: '0px 5px 0px 5px'}}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                  {
                    problemQualifierList.filter(i => i.dtsIsHistory != 1).map(
                      (row, idx) => {return this.getProblemQualifierItem(idx,row, classes);}
                    )
                  }
              </TableBody>
            </Table>
        );
    }
}
const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);

    return {
      allSpecialties: state.dtsPreloadData.allSpecialties,
      roomList: state.common.rooms,
      clinicList: state.common.clinicList,
      problemQualifierList: state.clinicalContentEncounter.problemQualifierList

    };
};

const mapDispatchToProps = {

};

export default connect(mapStateToProps)(withStyles(styles)(DtsExistingProblemTreatment));
