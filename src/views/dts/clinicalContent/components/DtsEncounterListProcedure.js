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
import {List, ListItem, ListItemText, ListItemIcon, ListItemAvatar} from '@material-ui/core';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faUserMd, faClinicMedical, faTeeth, faTooth, faPills, faFileMedical, faMehBlank } from '@fortawesome/free-solid-svg-icons';


const styles = {

  tableCell:{
          //borderStyle: 'none',
          //borderBottom: '1px solid rgba(224, 224, 224, 1)',
          padding:'0px 8px',
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
      'padding': '12px 10px 1px 10px',
      'height' : 40,
      'margin-top' : '10px'
      //padding: '1px 20px 1px 10px'
  },
  tableRow:{
    'height' : 40
  },
  customToolTip: {
      maxWidth: 200,
      fontSize: 15
    },
    primaryText:{
        fontWeight: 'bold'
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

class DtsEncounterListProcedure extends React.Component {
  constructor (props) {
    super(props);

    this.state = {


    };
  }

  getGroupedQualifer = (procedureList) => {


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

        for(let j = 0; j<procedureList.codQlfValDto1.length; j++){
         if(procedureList.codQlfValDto1.length > 0){

            if(procedureList.codQlfValDto1[j].qlfCod == 'TOOTH'){
              tooth = procedureList.codQlfValDto1[j].valDesc;
            }

            if(procedureList.codQlfValDto1[j].qlfCod == 'TOOTH_SURFACE'){
              surface += procedureList.codQlfValDto1[j].valDesc;
            }

            if(procedureList.codQlfValDto1[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto1[j].qlfCod != 'TOOTH_SURFACE'){
              qualifier1 += procedureList.codQlfValDto1[j].valDesc+ '; ';
            }
          }
        }

        for(let j = 0; j<procedureList.codQlfValDto2.length; j++){
          if(procedureList.codQlfValDto2.length > 0){
              if(procedureList.codQlfValDto2[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto2[j].valDesc;
              }

              if(procedureList.codQlfValDto2[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto2[j].valDesc;
              }

              if(procedureList.codQlfValDto2[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto2[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier2 += procedureList.codQlfValDto2[j].valDesc + '; ';
              }
          }
        }
         //groupedQualifiers += qualifier2;
        for(let j = 0; j<procedureList.codQlfValDto3.length; j++){
          if(procedureList.codQlfValDto3.length > 0){
             if(procedureList.codQlfValDto3[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto3[j].valDesc;
              }

              if(procedureList.codQlfValDto3[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto3[j].valDesc;
              }

              if(procedureList.codQlfValDto3[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto3[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier3 += procedureList.codQlfValDto3[j].valDesc + '; ';
              }

          }
        }

        for(let j = 0; j<procedureList.codQlfValDto4.length; j++){
            if(procedureList.codQlfValDto4.length > 0){
             if(procedureList.codQlfValDto4[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto4[j].valDesc;
              }

              if(procedureList.codQlfValDto4[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto4[j].valDesc;
              }

              if(procedureList.codQlfValDto4[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto4[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier4 += procedureList.codQlfValDto4[j].valDesc + '; ';
              }
          }
        }

        for(let j = 0; j<procedureList.codQlfValDto5.length; j++){
            if(procedureList.codQlfValDto5.length > 0){
              if(procedureList.codQlfValDto5[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto5[j].valDesc;
              }

              if(procedureList.codQlfValDto5[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto5[j].valDesc;
              }

              if(procedureList.codQlfValDto5[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto5[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier5 += procedureList.codQlfValDto5[j].valDesc + '; ';
              }
          }
        }


        for(let j = 0; j<procedureList.codQlfValDto6.length; j++){
          if(procedureList.codQlfValDto6.length > 0){
              if(procedureList.codQlfValDto6[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto6[j].valDesc;
              }

              if(procedureList.codQlfValDto6[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto6[j].valDesc + '; ';
              }

              if(procedureList.codQlfValDto6[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto6[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier6 += procedureList.codQlfValDto6[j].valDesc + '; ';
              }
          }
        }

        if(procedureList.remarks){
          remarks = procedureList.remarks;
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

  getGroupedQualiferToolTip = (procedureList) => {

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

        for(let j = 0; j<procedureList.codQlfValDto1.length; j++){
         if(procedureList.codQlfValDto1.length > 0){

            if(procedureList.codQlfValDto1[j].qlfCod == 'TOOTH'){
              tooth = procedureList.codQlfValDto1[j].valDesc;
            }

            if(procedureList.codQlfValDto1[j].qlfCod == 'TOOTH_SURFACE'){
              surface += procedureList.codQlfValDto1[j].valDesc;
            }

            if(procedureList.codQlfValDto1[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto1[j].qlfCod != 'TOOTH_SURFACE'){
              qualifier1 += procedureList.codQlfValDto1[j].valDesc+ '; ';
            }
          }
        }

        for(let j = 0; j<procedureList.codQlfValDto2.length; j++){
          if(procedureList.codQlfValDto2.length > 0){
              if(procedureList.codQlfValDto2[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto2[j].valDesc;
              }

              if(procedureList.codQlfValDto2[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto2[j].valDesc;
              }

              if(procedureList.codQlfValDto2[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto2[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier2 += procedureList.codQlfValDto2[j].valDesc + '; ';
              }
          }
        }
         //groupedQualifiers += qualifier2;
        for(let j = 0; j<procedureList.codQlfValDto3.length; j++){
          if(procedureList.codQlfValDto3.length > 0){
             if(procedureList.codQlfValDto3[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto3[j].valDesc;
              }

              if(procedureList.codQlfValDto3[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto3[j].valDesc;
              }

              if(procedureList.codQlfValDto3[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto3[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier3 += procedureList.codQlfValDto3[j].valDesc + '; ';
              }

          }
        }

        for(let j = 0; j<procedureList.codQlfValDto4.length; j++){
            if(procedureList.codQlfValDto4.length > 0){
             if(procedureList.codQlfValDto4[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto4[j].valDesc;
              }

              if(procedureList.codQlfValDto4[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto4[j].valDesc;
              }

              if(procedureList.codQlfValDto4[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto4[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier4 += procedureList.codQlfValDto4[j].valDesc + '; ';
              }
          }
        }

        for(let j = 0; j<procedureList.codQlfValDto5.length; j++){
            if(procedureList.codQlfValDto5.length > 0){
              if(procedureList.codQlfValDto5[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto5[j].valDesc;
              }

              if(procedureList.codQlfValDto5[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto5[j].valDesc;
              }

              if(procedureList.codQlfValDto5[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto5[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier5 += procedureList.codQlfValDto5[j].valDesc + '; ';
              }
          }
        }


        for(let j = 0; j<procedureList.codQlfValDto6.length; j++){
          if(procedureList.codQlfValDto6.length > 0){
              if(procedureList.codQlfValDto6[j].qlfCod == 'TOOTH'){
                tooth = procedureList.codQlfValDto6[j].valDesc;
              }

              if(procedureList.codQlfValDto6[j].qlfCod == 'TOOTH_SURFACE'){
                surface += procedureList.codQlfValDto6[j].valDesc + '; ';
              }

              if(procedureList.codQlfValDto6[j].qlfCod != 'TOOTH' && procedureList.codQlfValDto6[j].qlfCod != 'TOOTH_SURFACE'){
                qualifier6 += procedureList.codQlfValDto6[j].valDesc + '; ';
              }
          }
        }


      if(procedureList.remarks){
        remarks = '\n\nDescription: \n' +  procedureList.remarks;
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

    render () {

        const { classes, readOnly, proceduresQualifiersList,...rest } = this.props;//NOSONAR

        return (

            <List disablePadding dense>
              {/* {proceduresQualifiersList.map((row,index) => (
                  <ListItem
                      key
                      button
                      className={classes.nested}
                      dense
                  >
                    <ListItemText
                        classes={{ primary: classes.list_text }}
                        primary={<span className={classes.primaryText}>{row.procedureText}</span>}
                        secondary={
                            <React.Fragment>
                            <Tooltip classes={{ tooltip: classes.customToolTip }} title={<div style={{ whiteSpace: 'pre-line' }}>{this.getGroupedQualiferToolTip(row)}</div>} placement="bottom-end">
                                <div style={{overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90%'}}>
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            color="textPrimary"

                                        >
                                                {this.getGroupedQualifer(row)}
                                        </Typography>
                                    </div>
                                </Tooltip>
                            </React.Fragment>
                        }
                    />
                  </ListItem>
              ))} */}
              </List>


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

};

export default connect(mapStateToProps)(withStyles(styles)(DtsEncounterListProcedure));