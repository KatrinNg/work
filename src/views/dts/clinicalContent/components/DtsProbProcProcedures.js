import React , { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles,withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
//import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faUserMd, faClinicMedical, faTeeth, faTooth, faPills, faFileMedical, faMehBlank } from '@fortawesome/free-solid-svg-icons';
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
    'height' : 40
  },
  customToolTip: {
      maxWidth: 200,
      fontSize: 15
    }




};

const procedureColumnsHeader = [
  // { id: "discipline", label: "Discip.", minWidth: 20 },
  { id: 'procedureDesc',
    label: 'Procedure',
    minWidth: 50
  },
  {
    id: 'qualifierDesc',
    label: 'Qualifier',
    minWidth: 60,
    align: 'left'
  }

];

class DtsProbProcProcedures extends React.Component {
  constructor (props) {
    super(props);

    this.state = {


    };
  }

  getProceduresQualifiersItem(idx, item, classes){
        return (
            <TableRow key={idx} className={classes.tableRow}>

                <Tooltip classes={{ tooltip: classes.customToolTip }} title={item.procedureText} placement="bottom-start">
                  <TableCell align="left">
                          {item.procedureText}
                  </TableCell>
                </Tooltip>
                {/* <Tooltip classes={{ tooltip: classes.customToolTip }} title={<div style={{ whiteSpace: 'pre-line' }}>{this.getGroupedQualiferToolTip(item,item.codQlfValDtoList)}</div>} placement="bottom-end"> */}
                 <Tooltip classes={{ tooltip: classes.customToolTip }} title={<div style={{ whiteSpace: 'pre-line' }}>{this.getGroupedQualiferToolTip(item)}</div>} placement="bottom-end">
                  <TableCell  style={{width:'600px'}} align="left">
                    <div className={classes.qualifierDisplay}>
                       {this.getGroupedQualifer(item)}
                    </div>

                  </TableCell>
                </Tooltip>
                <TableCell align="left" style={{display: 'none'}}>

                  </TableCell>
           </TableRow>
        );
    }

    getGroupedQualifer = (procedureList) => {


    let groupedQualifiers = '';
    let qualifier1='';
    let qualifier2='';
    let qualifier3='';
    let qualifier4='';
    let qualifier5='';
    let qualifier6='';

        for(let j = 0; j<procedureList.codQlfValDto1.length; j++){
          if(procedureList.codQlfValDto1.length > 0){
            qualifier1 += procedureList.codQlfValDto1[j].valDesc;
          }
        }

        for(let j = 0; j<procedureList.codQlfValDto2.length; j++){
          if(procedureList.codQlfValDto2.length > 0){
            qualifier2 += procedureList.codQlfValDto2[j].valDesc;
          }
        }

        groupedQualifiers = qualifier1 + qualifier2 + '; ';

        for(let j = 0; j<procedureList.codQlfValDto3.length; j++){
          if(procedureList.codQlfValDto3.length > 0){
            qualifier3 += procedureList.codQlfValDto3[j].valDesc;
          }
        }

        if(qualifier3!= ''){
            groupedQualifiers += qualifier3 + '; ';
        }


        for(let j = 0; j<procedureList.codQlfValDto4.length; j++){
            if(procedureList.codQlfValDto4.length > 0){
              qualifier4 += procedureList.codQlfValDto4[j].valDesc + '; ';
            }
        }

         if(qualifier4!= ''){
            groupedQualifiers += qualifier4 ;
        }

        groupedQualifiers += qualifier4;
          for(let j = 0; j<procedureList.codQlfValDto5.length; j++){
            if(procedureList.codQlfValDto5.length > 0){
              qualifier5 += procedureList.codQlfValDto5[j].valDesc + '; ' ;
             }
          }

        if(qualifier5!= ''){
            groupedQualifiers += qualifier5;
        }

        for(let j = 0; j<procedureList.codQlfValDto6.length; j++){
          if(procedureList.codQlfValDto6.length > 0){
              qualifier6 += procedureList.codQlfValDto6[j].valDesc + '; ';
          }

        }
        if(qualifier6!= ''){
         groupedQualifiers += qualifier6;
        }

        if(procedureList.remarks){
          groupedQualifiers += procedureList.remarks;

         }


      groupedQualifiers = groupedQualifiers.trim();
      if(groupedQualifiers.endsWith(';')){

        groupedQualifiers = groupedQualifiers.slice(0, -1) + '';

      }



    return groupedQualifiers;

  }

  getGroupedQualiferToolTip = (procedureList) => {

    let groupedQualifiers = '';
    let qualifier1='';
    let qualifier2='';
    let qualifier3='';
    let qualifier4='';
    let qualifier5='';
    let qualifier6='';

        for(let j = 0; j<procedureList.codQlfValDto1.length; j++){
          if(procedureList.codQlfValDto1.length > 0){
            qualifier1 += procedureList.codQlfValDto1[j].valDesc;
          }
        }

        for(let j = 0; j<procedureList.codQlfValDto2.length; j++){
          if(procedureList.codQlfValDto2.length > 0){
            qualifier2 += procedureList.codQlfValDto2[j].valDesc;
          }
        }

        groupedQualifiers = qualifier1 + qualifier2 + '; ';

        for(let j = 0; j<procedureList.codQlfValDto3.length; j++){
          if(procedureList.codQlfValDto3.length > 0){
            qualifier3 += procedureList.codQlfValDto3[j].valDesc;
          }
        }

        if(qualifier3!= ''){
            groupedQualifiers += qualifier3 + '; ';
        }


        for(let j = 0; j<procedureList.codQlfValDto4.length; j++){
            if(procedureList.codQlfValDto4.length > 0){
              qualifier4 += procedureList.codQlfValDto4[j].valDesc + '; ';
            }
        }

         if(qualifier4!= ''){
            groupedQualifiers += qualifier4 ;
        }

        groupedQualifiers += qualifier4;
          for(let j = 0; j<procedureList.codQlfValDto5.length; j++){
            if(procedureList.codQlfValDto5.length > 0){
              qualifier5 += procedureList.codQlfValDto5[j].valDesc + '; ' ;
             }
          }

        if(qualifier5!= ''){
            groupedQualifiers += qualifier5;
        }

        for(let j = 0; j<procedureList.codQlfValDto6.length; j++){
          if(procedureList.codQlfValDto6.length > 0){
              qualifier6 += procedureList.codQlfValDto6[j].valDesc + '; ';
          }

        }
        if(qualifier6!= ''){
         groupedQualifiers += qualifier6;
        }

      if(procedureList.remarks){
        groupedQualifiers += '\n\nDescription: \n' +  procedureList.remarks;
      }


      groupedQualifiers = groupedQualifiers.trim();
      if(groupedQualifiers.endsWith(';')){

        groupedQualifiers = groupedQualifiers.slice(0, -1) + '';

      }

       return groupedQualifiers;

  }



    render () {

        const { classes, readOnly, proceduresQualifiersList, handlePxPrMenuOnChange, handleCmnTermChange, setQualifierValue, encounterSdt, resetSelectedVal, ...rest } = this.props;//NOSONAR
      /*
        return (
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                        {procedureColumnsHeader.map(column => (
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
                    proceduresQualifiersList.map(
                      (row, idx) => {return this.getProceduresQualifiersItem(idx, row, classes);}
                    )
                  }
              </TableBody>
                </Table>
        );
        */
        return (
          <MaterialTable 
              columns={[
                { field: 'procedureText', title: 'Procedure', 
                  headerStyle: {
                    width: 200,
                    minWidth: 200,
                    maxWidth: 200
                  },
                  render: rowData => {
                    return (<Tooltip classes={{ tooltip: classes.customToolTip }} title={rowData.procedureText} placement="bottom-start">
                              <div className={classes.qualifierDisplay}>
                              {rowData.procedureText}
                              </div>
                            </Tooltip>);
                  }
                },
                { field: 'codQlfValDtoList', title: 'Qualifier', 
                  headerStyle: {
                    width: 60,
                    minWidth: 60,
                    maxWidth: 60
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
              data={proceduresQualifiersList}
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
              onRowClick={(evt, selectedRow) => {this.setState({ selectedRow });resetSelectedVal();handlePxPrMenuOnChange(null, selectedRow.conceptDesc, selectedRow.codeTermId, "2");handleCmnTermChange(-1, selectedRow.termCncptId, selectedRow.codeTermId, encounterSdt);setQualifierValue(selectedRow);}}
          />
            
      );
    }
}

const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);

    return {
      proceduresQualifiersList: state.clinicalContentEncounter.proceduresQualifiersList
    };
};

const mapDispatchToProps = {
  resetSelectedVal
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsProbProcProcedures));