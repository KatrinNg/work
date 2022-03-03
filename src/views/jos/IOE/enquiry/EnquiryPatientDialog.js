
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {style} from './EnquiryDialogCss';
import { withStyles } from '@material-ui/core/styles';
import {Grid} from '@material-ui/core';
import CIMSButton from 'components/Buttons/CIMSButton';
import  EditTemplateDialog from './EditEnquiryDialog';
import { getMramFieldValueList,initMramFieldValueList} from 'store/actions/MRAM/mramAction';
import JOSList from './JOSList';

class EnquiryPatientDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
        pageNum:null,
        openTooltip: this.props.openTooltip,
        tableOptions: {
          rowsPerPage:5,
          bodyCellStyle:this.props.classes.bodyCellStyle,
          headRowStyle:this.props.classes.headRowStyle,
          headCellStyle:this.props.classes.headCellStyle
      },
        tableRows: [
          // {name:'mramAssessmentDtm', width: 300, label: 'Urgent', customBodyRender: (value) => {
          //     return value ? moment(value).format('DD-MMM-YYYY') : null;
          // }},
          {name:'Urgent', width: 57, label: 'Urgent'},
          {name:'Urgent', width: 80, label: 'Diagnosis'},
          {name:'Urgent', width: 115, label: 'Request Unit'},
          {name:'Urgent', width: 80, label: 'Report to'},
          {name:'Urgent', width: 'auto', label: 'Clinical Number'},
          {name:'Urgent', width: 50, label: 'Test'},
          {name:'Urgent', width: 80, label: 'Specimen'},
          {name:'Urgent', width: 95, label: 'Item Group'},
          {name:'Urgent', width: 62, label: 'Remark'},
          {name:'Urgent', width: 100, label: 'Instruction'}

      ]
  };
}

  handleDialogClose=()=>{
    let {handleClose}=this.props;
    handleClose&&handleClose();
  }

  handleRadio=(obj)=>{
    this.setState({report:obj.target.value});
  }

  render() {
    const {classes,openTooltip,details} = this.props;

    return (
        <EditTemplateDialog
            dialogTitle={'Ix Request Detail'}
            open={openTooltip}
            classes={{
                paper: classes.paper
            }}
            onEscapeKeyDown={() =>this.handleDialogClose()}
        >
          <JOSList details={details}/>
          <Grid className={classes.buttonGroup}>
                <CIMSButton
                    classes={{
                        label:classes.fontLabel
                    }}
                    color="primary"
                    id="btn_enquiryhint_reset"
                    onClick={() =>this.handleDialogClose()}
                    size="small"
                >
                    Close
                </CIMSButton>
                </Grid>
          </EditTemplateDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    templateList: state.diagnosisReducer.templateList
  };
}
const mapDispatchToProps = {

  getMramFieldValueList,
  initMramFieldValueList
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(EnquiryPatientDialog));
