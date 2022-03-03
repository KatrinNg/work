import React, { Component } from 'react';
import { withStyles, Dialog, Paper, DialogTitle, DialogContent, DialogActions, Grid, Typography, InputAdornment, OutlinedInput, IconButton } from '@material-ui/core';
import Draggable from 'react-draggable';
import { styles } from './PMIDialogStyle';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';
import { Clear } from '@material-ui/icons';
import { connect } from 'react-redux';
import { getAntenatalServiceId } from '../../../../../../store/actions/IOE/ixRequest/ixRequestAction';
import _ from 'lodash';

function PaperComponent(props) {
    return (
      <Draggable
          enableUserSelectHack={false}
          onStart={(e)=> e.target.getAttribute('customlogdrag') === 'allowed'}
      >
        <Paper {...props} />
      </Draggable>
    );
  }

class PMIDialog extends Component{
    constructor(props) {
        super(props);
        this.state = {
            PMIValue:'',
            ANTServiceID:null,
            okDisabled:true,
            errorFormatFlag:false
        };
    }

    handleChange = (e) => {
        let value = _.trim(e.target.value);
        this.validate10DigitInteger(value);
        this.setState({
            PMIValue:e.target.value,
            errorFormatFlag:this.validate10DigitInteger(value) && value !== '' ? false : true,
            okDisabled: true,
            ANTServiceID: null
        });
    }

    handleClear = () => {
        this.setState({
            PMIValue: '',
            errorFormatFlag: false,
            okDisabled: true,
            ANTServiceID: null
        });
    }

    onKeyUp = (e) => {
        if (e.keyCode === 13 && !this.state.errorFormatFlag && this.state.PMIValue.trim() !== '') {
            this.callGetAntenatalServiceIdAPI();
        }
    }

    onBlur = () => {
        if(!this.state.errorFormatFlag && this.state.PMIValue.trim() !== ''){
            this.callGetAntenatalServiceIdAPI();
        }
    }

    callGetAntenatalServiceIdAPI = () => {
        let { PMIValue } = this.state;
        let { updateState, updateStateWithoutStatus, basicInfo } = this.props;
        let params = {
            patientKey : PMIValue
        };
        this.props.getAntenatalServiceId({
            params,
            callback: data => {
                this.setState({
                    ANTServiceID: data.length > 0 ? data[0] : '',
                    okDisabled: data.length > 0 ? false : true
                });
                if(data.length > 0){
                    updateState && updateState({clinicRefOfVal:data[0] != null && data[0] !=='' ? `AN ${data[0]}` : ''});
                    basicInfo.tempClinicRefNo = data[0] != null && data[0] !=='' ? `AN ${data[0]}` : '';
                    updateStateWithoutStatus && updateStateWithoutStatus({basicInfo});
                }
            }
        });
    }

    validate10DigitInteger = (value) =>{
        let pattern = /^[0-9]*$/;
        return pattern.test(value);
    }

    handleOK = () => {
        let { handleAddOrderWithInfo, changeTabValue, clickAutoParams } = this.props;
        // let { ANTServiceID } = this.state;
        if(clickAutoParams.isAuto) {
            changeTabValue && changeTabValue(null,clickAutoParams.templateId);
        }else{
            handleAddOrderWithInfo && handleAddOrderWithInfo(false,false);
        }
        this.setState({
            PMIValue:'',
            ANTServiceID:null,
            okDisabled:true,
            errorFormatFlag:false
        });
    }

    handleCancel = ()=> {
        let { updateState } = this.props;
        updateState && updateState({PMIDialogIsOpen:false});
        this.setState({
            PMIValue:'',
            ANTServiceID:null,
            okDisabled:true,
            errorFormatFlag:false
        });
    }

    render(){
        let title = 'Retrieve AN Service ID by PMI';
        let { PMIValue, ANTServiceID, okDisabled, errorFormatFlag } = this.state;
        let { isOpen, classes } = this.props;
        return (
           <Dialog
               open={isOpen}
               PaperComponent={PaperComponent}
               classes={{paper: classes.paper}}
               fullWidth
           >
               <DialogTitle
                   className={classes.dialogTitle}
                   disableTypography
                   customlogdrag="allowed"
               >
                   {title}
               </DialogTitle>
               <DialogContent classes={{'root':classes.dialogContent}}>
                   <Typography component="div">
                        <Paper elevation={1}>
                            <Typography className={classes.divPadding} component="div">Please input PMI of the Antenatal client</Typography>
                            <Typography className={classes.divSecondPadding} component="div">
                                <span style={{fontWeight:'bold'}}>PMI</span>
                                <OutlinedInput
                                    value={PMIValue}
                                    onChange={this.handleChange}
                                    onKeyUp={this.onKeyUp}
                                    onBlur={this.onBlur}
                                    endAdornment={
                                    PMIValue.length > 0 ?(
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={this.handleClear}
                                            // onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                            style={{padding:6}}
                                        >
                                            <Clear />
                                        </IconButton>
                                    </InputAdornment>) : null
                                    }
                                    style={{width:170,marginLeft:5}}
                                />
                                {
                                    errorFormatFlag ? <span style={{marginLeft:50,color:'red'}}>Invalid Entry</span> :
                                    (ANTServiceID === '' ? <span style={{marginLeft:50,color:'red',fontWeight:'bold'}}>Record not found</span> : <span style={{marginLeft:50}}> {ANTServiceID} </span>)
                                }
                            </Typography>
                        </Paper>
                   </Typography>
               </DialogContent>
               <DialogActions className={classes.dialogActions}>
                    <Grid
                        container
                        direction="row"
                        justify="flex-end"
                        alignItems="center"
                    >
                        <Grid item xs>
                            <CIMSButton
                                id="btn_PMI_dialog_ok"
                                // onClick={this.handleOK}
                                onMouseDown={this.handleOK}
                                disabled={okDisabled}
                            >
                                OK
                            </CIMSButton>
                            <CIMSButton
                                id="btn_PMI_dialog_cancel"
                                onMouseDown={this.handleCancel}
                            >
                                Cancel
                            </CIMSButton>
                        </Grid>
                    </Grid>
              </DialogActions>
           </Dialog>
        );
    }
}

const mapStateToProps = state => ({

});

  const mapDispatchToProps = {
    getAntenatalServiceId
  };
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PMIDialog));