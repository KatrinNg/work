import React, { Component } from 'react';
import { connect } from 'react-redux';
import { cleanCommonMessageSnackbarDetail, closeCommonMessage } from '../../../store/actions/message/messageAction';
import Snackbar from '@ha/ha-cims-message-engine/lib/Snackbar';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const customTheme = (theme) =>{
    return createMuiTheme({
      ...theme,
      overrides: {
        MuiSnackbarContent:{
          root:{
            fontSize:'0.875rem'
          }
        }
      }
    });
  };
class MessageSnackbar extends Component {    render() {
        let{openSnackbar,commonMessageDetail,variant,closeCommonMessage,cleanCommonMessageSnackbarDetail}=this.props;
        let messageParameters={
            openSnackbar,
            commonMessageDetail,
            variant,
            closeCommonMessage:closeCommonMessage,
            cleanCommonMessageSnackbarDetail:cleanCommonMessageSnackbarDetail
        };
        return (
            <MuiThemeProvider theme={customTheme}>
                <Snackbar style={{fontSize:'0.875rem'}}{...messageParameters}/>
            </MuiThemeProvider>
            );
    }
}

const mapStateToProps = state => {
    return {
        openSnackbar: state.message.openSnackbar,
        commonMessageDetail: state.message.commonMessageSnackbarDetail,
        variant: state.message.variant
    };
};

const mapDispatchToProps = {
    cleanCommonMessageSnackbarDetail,
    closeCommonMessage
};


export default connect(mapStateToProps, mapDispatchToProps)(MessageSnackbar);