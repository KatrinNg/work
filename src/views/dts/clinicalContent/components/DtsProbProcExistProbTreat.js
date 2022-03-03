import React , { Component } from 'react';
import {Table, TableBody, TableCell,TableHead, TableRow, withStyles, Typography, Tooltip} from '@material-ui/core';
import { makeStyles, Theme, createStyles, ThemeProvider, createMuiTheme  } from '@material-ui/core/styles';
//import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import { connect } from 'react-redux';
import moment from 'moment';
import MaterialTable from 'material-table';
import _ from 'lodash';
import {resetSelectedVal} from '../../../../store/actions/dts/clinicalContent/problemProcedureAction';

const styles = {

  tableCell:{
          //borderStyle: 'none',
          //borderBottom: '1px solid rgba(224, 224, 224, 1)',
          //padding:'0px 8px',
          maxWidth:'200px'

      },
  qualifierCell:{
      'overflow': 'hidden',
      'text-overflow': 'ellipsis',
      'display': '-webkit-box',
      '-webkit-line-clamp': 3,
      '-webkit-box-orient': 'vertical',
      'white-space': 'initial',
      'border-left': 'none',
      'border-top': 'none',
      'margin-bottom': '-1px',
      'padding': '12px 10px 5px 10px',
      'height' : 40//,
      //'margin-top' : '10px'
      //padding: '1px 20px 1px 10px'
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
  tableRow:{
    'height' : 20
  },
  customToolTip: {
      maxWidth: 200,
      fontSize: 15
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
  }
  //,
  // {
  //   id: "plan",
  //   label: "Tx Plan",
  //   minWidth: 60,
  //   align: "left"
  // }

 //{
 //   id: 'status',
 //   label: 'Status',
  //  minWidth: 10,
  //  align: 'center'
  //}
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

class DtsProbProcExistProbTreat extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      qualifierList: null,
      selectedRow: null
      //currentNoteInfo: props.currentNoteInfo,
      //currentEditFlag: 'N',
      //initFlag: true,
      //addANote: false

    };
  }




   getProblemQualifierItem(idx, problemList, problemQualifierList, classes){
        return (
            <TableRow key={idx} className={classes.tableRow}>
                 <Tooltip classes={{ tooltip: classes.customToolTip }} title={<span style={{ whiteSpace: 'pre-line' }}>{this.getCurrProblemDetail(problemList)}</span>} placement="bottom-start">
                  <TableCell  align="left" >
                      {moment(problemList.updateDtm).format('DD-MM-YYYY')}
                  </TableCell>
                </Tooltip>

                <Tooltip classes={{ tooltip: classes.customToolTip }} title={problemList.conceptDesc} placement="bottom-start">
                  <TableCell align="left" >
                          {problemList.conceptDesc}
                  </TableCell>
                </Tooltip>
                <Tooltip classes={{ tooltip: classes.customToolTip }} title={<div style={{ whiteSpace: 'pre-line' }}>{this.getGroupedQualiferToolTip(problemList, problemQualifierList)}</div>} placement="bottom-end">
                   <TableCell  style={{width:'600px'}} align="left">
                      <div className={classes.qualifierDisplay}>
                        {this.getGroupedQualifer(problemList, problemQualifierList)}
                      </div>
                  </TableCell>
                </Tooltip>
                <TableCell align="left" style={{display: 'none'}}>

                  </TableCell>
           </TableRow>
        );
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
      let groupTooth = '';
      if (typeof problemList.groupMem != 'undefined'){
        console.log('Dicky Group', problemList);
        for(let i = 0; i<problemList.groupMem.length; i++){
          groupTooth += problemList.groupMem[i].tooth[0].valDesc;
          for(let j = 0; j<problemList.groupMem[i].toothSurface.length; j++){
            groupTooth += problemList.groupMem[i].toothSurface[j].valDesc;
          }
          groupTooth += '; ';
        }
        
        
        qualifier1 = groupTooth;
        qualifier2 = '';
        for(let j = 0; j<problemList.codQlfValDto2.length; j++){
          if(problemList.codQlfValDto2.length > 0){
              if(problemList.codQlfValDto2[j].qlfCod != 'TOOTH' && problemList.codQlfValDto2[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier2 += problemList.codQlfValDto2[j].valDesc + '; ';
              }
          }
        }
      } else{
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
    let groupTooth='';

    if (typeof problemList.groupMem != 'undefined'){
      console.log('Dicky Group', problemList);
      for(let i = 0; i<problemList.groupMem.length; i++){
        groupTooth += problemList.groupMem[i].tooth[0].valDesc;
        for(let j = 0; j<problemList.groupMem[i].toothSurface.length; j++){
          groupTooth += problemList.groupMem[i].toothSurface[j].valDesc;
        }
        groupTooth += '; ';
      }
      
      
      qualifier1 = groupTooth;
      qualifier2 = '';
      for(let j = 0; j<problemList.codQlfValDto2.length; j++){
        if(problemList.codQlfValDto2.length > 0){
            if(problemList.codQlfValDto2[j].qlfCod != 'TOOTH' && problemList.codQlfValDto2[j].qlfCod != 'TOOTH_SURFACE'){
              qualifier2 += problemList.codQlfValDto2[j].valDesc + '; ';
            }
        }
      }
    }  else{
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

  getCurrProblemDetail = (problem, problemQlifier) => {

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

  produceGroupforProblem(problemQualifier){
    console.log('problemQualifier1', problemQualifier);
    let groupId = 0;
    let memberId = 0;
    let groups = Object.create(null);
    let grouped = [];
    problemQualifier.forEach((item, index, array) => {
        
     //item.id = memberId;
     
     //const addedGroup = _.cloneDeep(item);
     //memberId++;  
     //addedGroup.id = memberId;
     //array.push(addedGroup);

     //item.parentId = memberId;
     let key = moment(item.updateDtm).format('DD-MM-YYYY') + item.codeTermId + (typeof item.remarks != 'undefined'?item.remarks:'') + item.dtsIsHistory
              + this.generateQualifierKey(item.codQlfValDto1) + this.generateQualifierKey(item.codQlfValDto2) + this.generateQualifierKey(item.codQlfValDto3)
              + this.generateQualifierKey(item.codQlfValDto4) + this.generateQualifierKey(item.codQlfValDto5) + this.generateQualifierKey(item.codQlfValDto6);
     if (!groups[key]) {
      memberId++; 
      groupId = memberId;
      groups[key] = [];
      grouped.push({ key: key, codeTermId: item.codeTermId, conceptDesc: item.conceptDesc, objId: memberId, 
                    sspecId: item.sspecId, rmId: item.rmId, siteId: item.siteId, codQlfValDto1: item.codQlfValDto1, codQlfValDto2: item.codQlfValDto2,
                    codQlfValDto3: item.codQlfValDto3, codQlfValDto4: item.codQlfValDto4, codQlfValDto5: item.codQlfValDto5, codQlfValDto6: item.codQlfValDto6,
                    diagnosisStatusCd: item.diagnosisStatusCd, dtsIsHistory: item.dtsIsHistory, updateDtm: item.updateDtm,
                    encounterId: item.encounterId, patientKey: item.patientKey, remarks: item.remarks, groupMem: groups[key]});
      
      }
      if (item.codQlfValDto1 && item.codQlfValDto1.length > 0 && item.codQlfValDto1[0].qlfCod == 'TOOTH' 
          && item.codQlfValDto2 && item.codQlfValDto2.length > 0 && item.codQlfValDto2[0].qlfCod == 'TOOTH_SURFACE'){
          groups[key].push({tooth: item.codQlfValDto1, toothSurface: item.codQlfValDto2});
      } else if (item.codQlfValDto1 && item.codQlfValDto1.length > 0 && item.codQlfValDto1[0].qlfCod == 'TOOTH') {
          groups[key].push({tooth: item.codQlfValDto1, toothSurface: []});
      }
      item.parentId = groupId;
      memberId++; 
      item.objId = memberId;

    });

    const pushedGrouped =  _.cloneDeep(grouped).filter(i => i.groupMem.length > 1);
    const returnProblemQualifier = _.cloneDeep(problemQualifier);
    returnProblemQualifier.push(...pushedGrouped);
    return returnProblemQualifier;
  }

  generateQualifierKey(codQlfValDtoList){
    let returStr = '';
    for(let i = 0; i < codQlfValDtoList.length; i++){
      if (codQlfValDtoList[i].qlfCod == 'TOOTH' || codQlfValDtoList[i].qlfCod == 'TOOTH_SURFACE'){
        return '';
      }
      returStr = returStr + codQlfValDtoList[i];
    }
    return returStr;

  }
  handleRowClick=(e,rowData)=>{
  }
  render () {
      // console.log('ExistingProblemTreatment.render.readOnly ==> ' + this.props.readOnly)
      // eslint-disable-next-line
      const { classes, readOnly, currentEncounter, problemQualifier, handlePxPrMenuOnChange, handleCmnTermChange, setQualifierValue, encounterSdt, resetSelectedVal, ...rest } = this.props;//NOSONAR

      console.log('currentEncounter: ' + JSON.stringify(currentEncounter));

      return (
        <MaterialTable 
            columns={[
              { field: 'updateDtm', title: 'Last updated', 
                headerStyle: {
                  width: 100,
                  minWidth: 100,
                  maxWidth: 100
                },
                render: rowData => {
                  return (<Tooltip classes={{ tooltip: classes.customToolTip }} title={<span style={{ whiteSpace: 'pre-line' }}>{this.getCurrProblemDetail(rowData)}</span>} placement="bottom-start">
                            <div>
                            {moment(rowData.updateDtm).format('DD-MM-YYYY')}
                            </div>
                          </Tooltip>);
                }
              },
              { field: 'conceptDesc', title: 'Problem', 
                headerStyle: {
                  width: 140,
                  minWidth: 140,
                  maxWidth: 140
                },
                render: rowData => {
                  return (<Tooltip classes={{ tooltip: classes.customToolTip }} title={rowData.conceptDesc} placement="bottom-start">
                            <div className={classes.qualifierDisplay}>
                            {rowData.conceptDesc}
                            </div>
                          </Tooltip>);
                }
              },
              { field: 'codQlfValDtoList', title: 'Qualifier', 
                headerStyle: {
                  width: 410,
                  minWidth: 410,
                  maxWidth: 410
                },
                render: rowData => {
                  return (<Tooltip classes={{ tooltip: classes.customToolTip }} title={<div style={{ whiteSpace: 'pre-line' }}>{this.getGroupedQualiferToolTip(rowData, rowData.codQlfValDtoList)}</div>} placement="bottom-end">
                            <div className={classes.qualifierDisplay}>
                            {this.getGroupedQualifer(rowData, rowData.codQlfValDtoList)}
                            </div>
                          </Tooltip>);
                }
              } 
            ]}
            data={this.produceGroupforProblem(problemQualifier.filter(i => i.diagnosisStatusCd == 'A' && i.dtsIsHistory != 1))}
            parentChildData={(row, rows) => {
              let toExpanded = false;
              rows.forEach((item, index, array) => {
                if (item.parentId && item.parentId == row.objId){
                  if (this.state.selectedRow && this.state.selectedRow.tableData.id== item.tableData.id){
                    toExpanded = true;
                  }
                }
              });
              row.tableData.isTreeExpanded = toExpanded;
              
              return rows.find(a => a.objId === row.parentId);}
            }
            options={{
              //selection: true,
              toolbar: false,
              pageSize: 10,
              pagination: false,
              paging: false,
              // paginationType:'stepped',
              sorting: false,
              headerStyle: {
                  backgroundColor: 'rgb(123, 193, 217)',
                  color: 'white'
              },
              rowStyle: rowData => {
                let selected =
                  this.state.selectedRow &&
                  this.state.selectedRow.tableData.id === rowData.tableData.id;
                return {
                  backgroundColor: selected ? "#EEE" : "#FFF",
                  color: selected ? "#e0dd1f !important" : "#000",
                  height: 20
                };
              }
          }}
            onRowClick={(evt, selectedRow) => {this.setState({ selectedRow });resetSelectedVal();handlePxPrMenuOnChange(null, selectedRow.conceptDesc, selectedRow.codeTermId, "1");handleCmnTermChange(-1, selectedRow.termCncptId, selectedRow.codeTermId, encounterSdt);setQualifierValue(selectedRow);}}
        />
          
    );
    }
}
const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);

    return {
      allSpecialties: state.dtsPreloadData.allSpecialties,
      roomList: state.common.rooms,
      clinicList: state.common.clinicList,
      problemQualifier: state.clinicalContentEncounter.problemQualifierList

    };
};

const mapDispatchToProps = {
  resetSelectedVal
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsProbProcExistProbTreat));
