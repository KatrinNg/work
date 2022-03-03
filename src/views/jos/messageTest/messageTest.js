/*
 * Front-end UI for message module test page
 * Open selected message code dialog Action: [messageText.js] click button to open selected Message  -> hanldeBtnClick
 * -> [messageAction.js] openCommonMessage
 * -> [messageSaga.js] getMessageListByAppId
 * -> [messageReducer.js] commonMessageDetail
 * -> Backend API = /message/listMessageListByApplicationId
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography, withStyles } from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import { openCommonMessage,closeCommonMessage } from '../../../store/actions/message/messageAction';
import Message from '@ha/ha-cims-message-engine/lib/Message';
const styles = {  container: {
    marginBottom: '20px'
  },
  gridXs6: {
    textAlign: 'center',
    paddingTop: '10px'
  },
  result: {
    paddingTop: '10px'
  },
  detail: {
    width: '100%',
    height: '100%'
  }
};

const MESSAGE_TYPE = {
  TYPE_INFO: 'info',
  TYPE_QUESTION: 'ques',
  TYPE_WARNING_W: 'warnW',
  TYPE_WARNING_L: 'warnL',
  TYPE_APP_ERROR: 'appError',
  TYPE_NETWORK_ERROR: 'networkError',
  TYPE_DB_ERROR: 'dbError'
};

class MessageTest extends Component {
  constructor(props) {
    super(props);
    this.dispatch = this.props.dispatch;
    this.state = {
      infoCodeList: [],
      quetCodeList: [],
      warnWCodeList: [],
      warnLCodeList: [],
      appErrorCodeList: [],
      networkErrorCodeList: [],
      dbErrorCodeList: [],
      infoCode: '',
      quetCode: '',
      warnWCode: '',
      warnLCode: '',
      appErrorCode: '',
      networkErrorCode: '',
      dbErrorCode: '',
      result: '',
      messageTestList:[],
      testFlag:false
    };
  }

  componentDidMount() {
    this.props.ensureDidMount();
    let { commonMessageList } = this.props;
    let infoCodeList = [],
      quetCodeList = [],
      warnWCodeList = [],
      warnLCodeList = [],
      appErrorCodeList = [],
      networkErrorCodeList = [],
      dbErrorCodeList = [];

    commonMessageList.forEach(obj => {
      switch (obj.severityCode) {
        case 'I':   //The meaning is it that message type is information
          infoCodeList.push(obj);
          break;
        case 'Q':  //The meaning is it that message type is question
          quetCodeList.push(obj);
          break;
        case 'W':  //The meaning is it that message type is warming
          warnWCodeList.push(obj);
          break;
        case 'L':  //The meaning is it that message type is warming
          warnLCodeList.push(obj);
          break;
        case 'A':  //The meaning is it that message type is application error
          appErrorCodeList.push(obj);
          break;
        case 'N':  //The meaning is it that message type is newwork error
          networkErrorCodeList.push(obj);
          break;
        case 'D':  //The meaning is it that message type is database error
          dbErrorCodeList.push(obj);
          break;
        default:
          break;
      }
    });
    this.setState({
      infoCodeList,
      quetCodeList,
      warnWCodeList,
      warnLCodeList,
      appErrorCodeList,
      networkErrorCodeList,
      dbErrorCodeList,
      infoCode: infoCodeList.length>0?infoCodeList[0].messageCode:'',
      quetCode: quetCodeList.length>0?quetCodeList[0].messageCode:'',
      warnWCode: warnWCodeList.length>0?warnWCodeList[0].messageCode:'',
      warnLCode: warnLCodeList.length>0?warnLCodeList[0].messageCode:'',
      appErrorCode: appErrorCodeList.length>0?appErrorCodeList[0].messageCode:'',
      networkErrorCode: networkErrorCodeList.length>0?networkErrorCodeList[0].messageCode:'',
      dbErrorCode: dbErrorCodeList.length>0?dbErrorCodeList[0].messageCode:'',
      messageTestList:commonMessageList[2]
    });
  }

  handleCloseMessageBox = () => {
    this.props.closeCommonMessage();
  };


  handleMsgBtnClick = msgCode => {
    let payload = {
      msgCode,
      btnActions: {
        btn1Click: () => {
          this.setState({
            result: `${msgCode}_btn1`
          });
          // this.handleCloseMessageBox();
        },
        btn2Click: () => {
          this.setState({
            result: `${msgCode}_btn2`
          });
          // this.handleCloseMessageBox();
        },
        btn3Click: () => {
          this.setState({
            result: `${msgCode}_btn3`
          });
          // this.handleCloseMessageBox();
        }
      }
    };
    this.props.openCommonMessage(payload);
  };

  handleMessageBtnClick = () => {
    this.setState({
        testFlag:true
    });
  };

  handleMessageDialogClose = () => {
    this.setState({
        testFlag:false
    });
  };


  hanldeBtnClickSnackbar = type => {
    let msgCode = this.getSelectedCode(type);
    if (msgCode !== '') {
      let payload = {
        msgCode,
        variant: 'info',
        showSnackbar: true,
        btnActions: {
          btn1Click: () => {
            this.setState({
              result: `${msgCode}_btn1`
            });
            // this.handleCloseMessageBox();
          },
          btn2Click: () => {
            this.setState({
              result: `${msgCode}_btn2`
            });
            // this.handleCloseMessageBox();
          },
          btn3Click: () => {
            this.setState({
              result: `${msgCode}_btn3`
            });
            // this.handleCloseMessageBox();
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  };


  getSelectedCode = (type) => {
    let {
      infoCode,
      quetCode,
      warnWCode,
      warnLCode,
      appErrorCode,
      networkErrorCode,
      dbErrorCode
    } = this.state;
    let msgCode = '';
    switch (type) {
      case MESSAGE_TYPE.TYPE_INFO:
        msgCode = infoCode;
        break;
      case MESSAGE_TYPE.TYPE_QUESTION:
        msgCode = quetCode;
        break;
      case MESSAGE_TYPE.TYPE_WARNING_W:
        msgCode = warnWCode;
        break;
      case MESSAGE_TYPE.TYPE_WARNING_L:
        msgCode = warnLCode;
        break;
      case MESSAGE_TYPE.TYPE_APP_ERROR:
        msgCode = appErrorCode;
        break;
      case MESSAGE_TYPE.TYPE_NETWORK_ERROR:
        msgCode = networkErrorCode;
        break;
      case MESSAGE_TYPE.TYPE_DB_ERROR:
        msgCode = dbErrorCode;
        break;
      default:
        break;
    }
    return msgCode;
  }

  hanldeBtnClick = type => {
    let msgCode = this.getSelectedCode(type);
    if (msgCode !== '') {
      this.handleMsgBtnClick(msgCode);
    }
  };

  handleChange = type => event => {
    let code = event.target.value;
    switch (type) {
      case MESSAGE_TYPE.TYPE_INFO:
        this.setState({
          infoCode: code
        });
        break;
      case MESSAGE_TYPE.TYPE_QUESTION:
        this.setState({
          quetCode: code
        });
        break;
      case MESSAGE_TYPE.TYPE_WARNING_W:
        this.setState({
          warnWCode: code
        });
        break;
      case MESSAGE_TYPE.TYPE_WARNING_L:
        this.setState({
          warnLCode: code
        });
        break;
      case MESSAGE_TYPE.TYPE_APP_ERROR:
        this.setState({
          appErrorCode: code
        });
        break;
      case MESSAGE_TYPE.TYPE_NETWORK_ERROR:
        this.setState({
          networkErrorCode: code
        });
        break;
      case MESSAGE_TYPE.TYPE_DB_ERROR:
        this.setState({
          dbErrorCode: code
        });
        break;
      default:
        break;
    }
  };

  render() {
    let { classes } = this.props;
    let {
      result,
      infoCodeList,
      quetCodeList,
      warnWCodeList,
      warnLCodeList,
      appErrorCodeList,
      networkErrorCodeList,
      dbErrorCodeList,
      infoCode,
      quetCode,
      warnWCode,
      warnLCode,
      appErrorCode,
      networkErrorCode,
      dbErrorCode,
      messageTestList,
      testFlag
    } = this.state;
    messageTestList.btn1AutoClose=true;
    let messgaParameter={
        openMessageDialog:testFlag,
        commonMessageDetail:messageTestList,
        handleMessageDialogClose:this.handleMessageDialogClose
    };

    return (
      <div className={classes.detail}>
        <div style={{ width: '35%' }} className={'nephelp_content_body'}>
          <Grid
              container
              classes={{
              container: classes.container
            }}
          >
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography component="div">
                <label>Msg.Code: </label>
                <select
                    id="info_select"
                    value={infoCode}
                    style={{ width: '100px' }}
                    onChange={this.handleChange(MESSAGE_TYPE.TYPE_INFO)}
                >
                  {
                    infoCodeList.map(item=>{
                      return(
                        <option key={item.messageId} value={item.messageCode}>{item.messageCode}</option>
                      );
                    })
                  }
                </select>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <CIMSButton
                  id="btn_message_test_info"
                  style={{ width: '150px' }}
                  onClick={() => {
                  this.hanldeBtnClick(MESSAGE_TYPE.TYPE_INFO);
                }}
              >
                Information
              </CIMSButton>
            </Grid>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography component="div">
                <label>Msg.Code: </label>
                <select
                    id="quet_select"
                    value={quetCode}
                    style={{ width: '100px' }}
                    onChange={this.handleChange(MESSAGE_TYPE.TYPE_QUESTION)}
                >
                  {
                    quetCodeList.map(item=>{
                      return(
                        <option key={item.messageId} value={item.messageCode}>{item.messageCode}</option>
                      );
                    })
                  }
                </select>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <CIMSButton
                  id="btn_message_test_quet"
                  style={{ width: '150px' }}
                  onClick={() => {
                  this.hanldeBtnClick(MESSAGE_TYPE.TYPE_QUESTION);
                }}
              >
                Question
              </CIMSButton>
            </Grid>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography component="div">
                <label>Msg.Code: </label>
                <select
                    id="warn_w_select"
                    value={warnWCode}
                    style={{ width: '100px' }}
                    onChange={this.handleChange(MESSAGE_TYPE.TYPE_WARNING_W)}
                >
                  {
                    warnWCodeList.map(item=>{
                      return(
                        <option key={item.messageId} value={item.messageCode}>{item.messageCode}</option>
                      );
                    })
                  }
                </select>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <CIMSButton
                  id="btn_message_test_warn_w"
                  style={{ width: '150px' }}
                  onClick={() => {
                  this.hanldeBtnClick(MESSAGE_TYPE.TYPE_WARNING_W);
                }}
              >
                Warning (W)
              </CIMSButton>
            </Grid>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography component="div">
                <label>Msg.Code: </label>
                <select
                    id="warn_l_select"
                    value={warnLCode}
                    style={{ width: '100px' }}
                    onChange={this.handleChange(MESSAGE_TYPE.TYPE_WARNING_L)}
                >
                  {
                    warnLCodeList.map(item=>{
                      return(
                        <option key={item.messageId} value={item.messageCode}>{item.messageCode}</option>
                      );
                    })
                  }
                </select>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <CIMSButton
                  id="btn_message_test_warn_l"
                  style={{ width: '150px' }}
                  onClick={() => {
                  this.hanldeBtnClick(MESSAGE_TYPE.TYPE_WARNING_L);
                }}
              >
                Warning (L)
              </CIMSButton>
            </Grid>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography component="div">
                <label>Msg.Code: </label>
                <select
                    id="app_error_select"
                    value={appErrorCode}
                    style={{ width: '100px' }}
                    onChange={this.handleChange(MESSAGE_TYPE.TYPE_APP_ERROR)}
                >
                  {
                    appErrorCodeList.map(item=>{
                      return(
                        <option key={item.messageId} value={item.messageCode}>{item.messageCode}</option>
                      );
                    })
                  }
                </select>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <CIMSButton
                  id="btn_message_test_app_error"
                  style={{ width: '150px' }}
                  onClick={() => {
                  this.hanldeBtnClick(MESSAGE_TYPE.TYPE_APP_ERROR);
                }}
              >
                Application Error
              </CIMSButton>
            </Grid>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography component="div">
                <label>Msg.Code: </label>
                <select
                    id="network_error_select"
                    value={networkErrorCode}
                    style={{ width: '100px' }}
                    onChange={this.handleChange(MESSAGE_TYPE.TYPE_NETWORK_ERROR)}
                >
                  {
                    networkErrorCodeList.map(item=>{
                      return(
                        <option key={item.messageId} value={item.messageCode}>{item.messageCode}</option>
                      );
                    })
                  }
                </select>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <CIMSButton
                  id="btn_message_test_network_error"
                  style={{ width: '150px' }}
                  onClick={() => {
                  this.hanldeBtnClick(MESSAGE_TYPE.TYPE_NETWORK_ERROR);
                }}
              >
                Network Error
              </CIMSButton>
            </Grid>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography component="div">
                <label>Msg.Code: </label>
                <select
                    id="db_error_select"
                    value={dbErrorCode}
                    style={{ width: '100px' }}
                    onChange={this.handleChange(MESSAGE_TYPE.TYPE_DB_ERROR)}
                >
                  {
                    dbErrorCodeList.map(item=>{
                      return(
                        <option key={item.messageId} value={item.messageCode}>{item.messageCode}</option>
                      );
                    })
                  }
                </select>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <CIMSButton
                  id="btn_message_test_db_error"
                  style={{ width: '150px' }}
                  onClick={() => {
                  this.hanldeBtnClick(MESSAGE_TYPE.TYPE_DB_ERROR);
                }}
              >
                Database Error
              </CIMSButton>
            </Grid>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography component="div">
                <label>Msg.Code: </label>
                <select
                    id="info_select"
                    value={dbErrorCode}
                    style={{ width: '100px' }}
                    onChange={this.handleChange(MESSAGE_TYPE.TYPE_DB_ERROR)}
                >
                  {
                    dbErrorCodeList.map(item=>{
                      return(
                        <option key={item.messageId} value={item.messageCode}>{item.messageCode}</option>
                      );
                    })
                  }
                </select>
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <CIMSButton
                  id="btn_message_test_info"
                  style={{ width: '150px' }}
                  onClick={() => {
                  this.hanldeBtnClickSnackbar(MESSAGE_TYPE.TYPE_DB_ERROR);
                }}
              >
                Snackbar
              </CIMSButton>
            </Grid>
          </Grid>
          {/* Return */}
          <Grid container>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.gridXs6
              }}
            >
              <Typography variant="subtitle2" component="div">
                Return:
              </Typography>
            </Grid>
            <Grid
                item
                xs={6}
                classes={{
                'grid-xs-6': classes.result
              }}
            >
              <label id="result">{result}</label>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    commonMessageList: state.message.commonMessageList
  };
};

const mapDispatchToProps = {
  openCommonMessage,
  closeCommonMessage
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(MessageTest));
