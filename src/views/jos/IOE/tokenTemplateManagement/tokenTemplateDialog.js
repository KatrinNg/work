
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {style} from './tokenTemplateManagementCss/tokenTemplateDialogCss';
import { withStyles } from '@material-ui/core/styles';
import {Grid, Typography,TextField,Divider,FormGroup,FormControlLabel,Checkbox,IconButton} from '@material-ui/core';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import { getReminderTmplById,getReminderInsturctsByName,saveReminderTemplate,getCodeIoeFormItems} from '../../../../store/actions/IOE/tokenTemplateManagement/tokenTemplateManagementAction';
import  EditTemplateDialog from '../../../administration/editTemplate/components/EditTemplateDialog';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import TokenTemplateDialogSearchInput from './components/TokenTemplateDialogSearchInput';
import {Edit} from '@material-ui/icons';
import { TOKEN_TEMPLATE_MANAGEMENT_CODE } from '../../../../constants/message/IOECode/tokenTemplateManagementCode';
import _ from 'lodash';
import * as commonConstants from '../../../../constants/common/commonConstants';

class tokenTemplateDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      serviceCd:JSON.parse(sessionStorage.getItem('service')).serviceCd,//
      // serviceEngDesc:JSON.parse(sessionStorage.getItem('loginInfo')).service.engDesc,//暂时无法提供此字段，先写死（by wentao）
      serviceEngDesc: JSON.parse(sessionStorage.getItem('service')).serviceName,
      templateList: [],
      getSelectRow: null,
      pageNum: null,
      selectRow: null,
      tipsListSize: null,
      templateName:'',
      tokenTemplatefollowUpLocation:'',
      templateDetailList:[],
      tokenTemplateList:[],
      searchRecordList:[],
      searchRecordTotalNums:0,
      isActive:1,
      ioeReminderInstructionId: props.ioeReminderInstructionId,
      instructionName:'',
      instructionNameResult:'',
      isNew: true,
      saveFlag:true,
      changed:false,
      tokenTemplateListFlag:false,
      templateNameValidation:false,
      templateNameMessage:''
  };
}
componentDidMount(){
  this.initData(this.props.isNew,this.props.ioeTokenTemplateId);
  this.setState({
    isNew:this.props.isNew,
    ioeTokenTemplateId:this.props.ioeTokenTemplateId
  });
}

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.open) {
      if (nextProps.isNew !== this.props.isNew || !nextProps.isNew) {
        this.setState({
          isNew: nextProps.isNew,
          ioeTokenTemplateId: nextProps.ioeTokenTemplateId
        });
        if (!nextProps.templateDialogRefesh) {
          this.initData(nextProps.isNew, nextProps.ioeTokenTemplateId);
        } else {
          this.props.getReminderInsturctsByName({
            params: { instructDesc: '' },
            callback: (data) => {
              let instruction = data.data.find(item => item.ioeReminderInstructionId === this.state.ioeReminderInstructionId);
              if (instruction === undefined || instruction === null) {
                this.setState({
                  searchRecordList: data.data
                });
              }else{
                this.setState({
                    searchRecordList: data.data,
                    instructionName: instruction.instructDesc
                  });
              }
            }
          });
        }
      } else if (nextProps.isNew === this.props.isNew || nextProps.isNew) {
        this.setState({
          isNew: nextProps.isNew,
          ioeTokenTemplateId: nextProps.ioeTokenTemplateId
        });
        this.props.getReminderInsturctsByName({
          params: { instructDesc: '' },
          callback: (data) => {
            let instruction = data.data.find(item => item.ioeReminderInstructionId === this.state.ioeReminderInstructionId);
            if (instruction === undefined || instruction === null) {
              this.setState({
                searchRecordList: data.data
              });
            } else {
              this.setState({
                searchRecordList: data.data,
                instructionName: instruction.instructDesc
              });
            }
          }
        });
      }
    }
  }

  initData = (isNew,ioeTokenTemplateId) => {
      if(!isNew){
        this.props.getReminderTmplById({
          params:{ioeReminderTemplateId:ioeTokenTemplateId},
          callback:(data)=>{
            const {updateState}= this.props;
            updateState&&updateState({ioeReminderInstructionId:data.data.ioeReminderInstructionId});
            this.setState({
              tokenTemplateList:data.data,
              templateDetailList:data.data.codeIoeFormItems,
              templateName:data.data.templateName,
              tokenTemplatefollowUpLocation:data.data.followUpLocation,
              isActive:data.data.isActive,
              ioeReminderInstructionId:data.data.ioeReminderInstructionId,
              instructionName:data.data.instructionName===null?'':data.data.instructionName,
              instructionNameResult:data.data.instructionName===null?'':data.data.instructionName
            });
          }
        });
      }
      //is new
      else{
          this.setState({
            tokenTemplateList: {},
            templateDetailList: [],
            templateName: '',
            tokenTemplatefollowUpLocation: '',
            ioeReminderInstructionId: null,
            instructionName: '',
            instructionNameResult: ''
            //saveFlag:false
          });
        this.props.getCodeIoeFormItems({
          params:{},
          callback:(data)=>{
            this.setState({
              templateDetailList:data.data
            });
          }
        });
      }
      this.props.getReminderInsturctsByName({
        params:{instructDesc:''},
        callback:(data)=>{
          this.setState({
            searchRecordList:data.data
          });
        }
      });

  };

  handleClose = () =>{
    let {templateDetailList}=this.state;
    templateDetailList.map(obj=>obj.isSelect='N');
    this.setState({
        templateName:'',
        tokenTemplatefollowUpLocation:'',
        instructionName:'',
        instructionNameResult:'',
        isActive:1,
        templateDetailList:templateDetailList,
        changed:false,
        saveFlag:true,
        tokenTemplateListFlag:false,
        tokenTemplateList: {},
        ioeReminderInstructionId: null,
        templateNameValidation:false,
        templateNameMessage:''
      });
  }

  handleCloseDialog=()=>{
    const {handleCloseDialog,insertReminderTemplateLog}= this.props;
    let {templateDetailList,changed}=this.state;
    if(changed){
      let payload = {
        msgCode: TOKEN_TEMPLATE_MANAGEMENT_CODE.CANCEL_TOKEN_TEMPLATE_CHANGE,
        btnActions: {
          // Yes
          btn1Click: () => {
            templateDetailList.map(obj=>obj.isSelect='N');
            this.setState({
              templateName:'',
              tokenTemplatefollowUpLocation:'',
              instructionName:'',
              instructionNameResult:'',
              isActive:1,
              templateDetailList:templateDetailList,
              changed:false,
              saveFlag:true,
              tokenTemplateListFlag:false,
              tokenTemplateList: {},
              ioeReminderInstructionId: null
            });
            insertReminderTemplateLog&&insertReminderTemplateLog('[Reminder Template Maintenance Dialog] Action: Click \'Cancel\' button', '');
            handleCloseDialog&&handleCloseDialog();
          }
        }
      };
      this.props.openCommonMessage(payload);
    }else{
      this.setState({
        saveFlag:true,
        tokenTemplateListFlag:false
      });
      insertReminderTemplateLog&&insertReminderTemplateLog('[Reminder Template Maintenance Dialog] Action: Click \'Cancel\' button', '');
      handleCloseDialog&&handleCloseDialog();
    }
  }

  handleCheckBoxChange=index=>event=>{
    let templateDetailList=this.state.templateDetailList;
    let tokenTemplateList=this.state.tokenTemplateList;
    if (event.target.checked) {
      templateDetailList[index].isSelect='Y';
      this.setState({tokenTemplateListFlag:false});
    }
    else{
      templateDetailList[index].isSelect='N';
    }
    this.setState({
      templateDetailList:templateDetailList,
      tokenTemplateList:tokenTemplateList,
      //saveFlag:false,
      changed:true
      // tokenTemplateListFlag:false,
    });
    for(let i=0;i<templateDetailList.length;i++){
      if(templateDetailList[i].isSelect==='Y'){
        this.setState({tokenTemplateListFlag:false});
        break;
      }else{
        this.setState({tokenTemplateListFlag:true});
      }
    }
	  tokenTemplateList.codeIoeFormItems=templateDetailList;

}

  handleFuzzySearch = (textVal) => {
    //update instructionName
    let tokenTemplateList = this.state.tokenTemplateList;
    if(textVal.trim()===''){
        this.setState({
            ioeReminderInstructionId: null,
            tokenTemplateList: tokenTemplateList,
            instructionNameResult:'',
            instructionName:''
          });
    }else{
        this.setState({
            ioeReminderInstructionId: null,
            tokenTemplateList: tokenTemplateList
          });
    }
    this.props.getReminderInsturctsByName({
      params: { instructDesc: textVal },
      callback: (data) => {
        this.setState({
          searchRecordList: data.data
        });
      }
    });
  }

  handleInputOnchange = (event) => {
    this.setState({
      instructionNameResult: event,
      instructionName:event
    });
  }

  handleIsActiveCheckBox = (event) => {
    if (event.target.checked) {
      this.setState({
        isActive: 1,
        changed: true
      });
    }
    else {
      this.setState({
        isActive: 0,
        changed: true
      });
    }
  }

  handleSelectItem = (item) => {
    let tokenTemplateList=this.state.tokenTemplateList;
    tokenTemplateList.ioeReminderInstructionId=item.ioeReminderInstructionId;
    this.setState({
      ioeReminderInstructionId:item.ioeReminderInstructionId,
      tokenTemplateList:tokenTemplateList,
      changed:true
    });
  }

  handleClickSave = () => {
    const { insertReminderTemplateLog, commonMessageList } = this.props;
    let isNew = this.state.isNew ? 'Y' : 'N';
    let tokenTemplateList = this.state.tokenTemplateList;
    let templateDetailList = this.state.templateDetailList;
    let tokenTemplateListFlag = this.state.tokenTemplateListFlag;
    let TokenTemplateDialogSearchInput = document.getElementById('search_input_base_TokenTemplateDialogSearchInput').value;
    for (let i = 0; i < templateDetailList.length; i++) {
      if (templateDetailList[i].isSelect === 'Y') {
        tokenTemplateListFlag = false;
        this.setState({ tokenTemplateListFlag: false });
        break;
      } else {
        tokenTemplateListFlag = true;
        this.setState({ tokenTemplateListFlag: true });
      }
    }
    if (this.state.templateNameValidation || this.state.templateName.trim() === '' || this.state.tokenTemplatefollowUpLocation.trim() === '' || tokenTemplateListFlag || TokenTemplateDialogSearchInput === '') {
      this.setState({ saveFlag: false });
      //judge item true
    } else {
      this.props.saveReminderTemplate({
        params: {
          ioeReminderTemplateId: tokenTemplateList.ioeReminderTemplateId,
          codeIoeFormId: tokenTemplateList.codeIoeFormId === undefined ? '100060' : tokenTemplateList.codeIoeFormId,
          serviceCd: tokenTemplateList.serviceCd === undefined ? JSON.parse(sessionStorage.getItem('service')).serviceCd : tokenTemplateList.serviceCd,
          clinicCd: tokenTemplateList.clinicCd === undefined ? JSON.parse(sessionStorage.getItem('clinic')).clinicCd : tokenTemplateList.clinicCd,
          templateName: this.state.templateName.trim(),
          ioeReminderInstructionId: tokenTemplateList.ioeReminderInstructionId, //this.state.ioeReminderInstructionId,
          //ioeReminderInstructionId:this.state.ioeReminderInstructionId,
          followUpLocation: this.state.tokenTemplatefollowUpLocation,
          seq: tokenTemplateList.seq,
          isActive: this.state.isActive,
          version: tokenTemplateList.version,
          createdBy: tokenTemplateList.createdBy,
          createdDtm: tokenTemplateList.createdDtm,
          updatedBy: tokenTemplateList.updatedBy,
          updatedDtm: tokenTemplateList.updatedDtm,
          instructionName: tokenTemplateList.instructionName,
          codeIoeFormItems: tokenTemplateList.codeIoeFormItems,
          reminderTemplateItems: tokenTemplateList.reminderTemplateItems,
          updatedByName: tokenTemplateList.updatedByName,
          isNew: isNew
        },
        callback: (data) => {
          if (data.respCode === 0) {
            this.refreshPageData(templateDetailList);
            let payload = {
              msgCode: data.msgCode,
              showSnackbar: true
            };
            this.props.openCommonMessage(payload);
          }else if(data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            let payload = {
              msgCode: data.msgCode,
              btnActions:
              {
                btn1Click: () => {
                  this.refreshPageData(templateDetailList);
                },
                btn2Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            };
            this.props.openCommonMessage(payload);
          } else {
            let message = commonMessageList.find(item => item.messageCode === data.msgCode);
            if (!!message) {
              let msgDescription = message.description;
              this.setState({
                templateNameValidation: true,
                templateNameMessage: msgDescription,
                saveFlag: false
              });
            }
          }
        }
      });
      this.setState({ saveFlag: true });
      insertReminderTemplateLog && insertReminderTemplateLog('[Reminder Template Maintenance Dialog] Action: Click \'Save\' button', 'ioe/saveReminderTemplate');
    }
  }

  refreshPageData = (templateDetailList) => {
    let { handleCloseDialog, refreshData } = this.props;
    templateDetailList.map(obj => obj.isSelect = 'N');
    this.setState({
      templateName: '',
      tokenTemplatefollowUpLocation: '',
      isActive: 1,
      templateDetailList: templateDetailList,
      changed: false
    });
    handleCloseDialog && handleCloseDialog();
    refreshData && refreshData();

  }

  inputOnchange=(e)=>{
    let sum = 0;
    for (let i=0; i<_.trim(e.target.value).length; i++)
    {
        let c = _.trim(e.target.value).charCodeAt(i);
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f))
        {
        sum++;
        }
        else
        {
            sum+=3;
        }
    }
    if (sum <= 500) {
        if(e.target.name==='templateName'){
            this.setState({
                [e.target.name]:e.target.value,
                changed:true,
                templateNameValidation:false
              });
        }else{
            this.setState({
                [e.target.name]:e.target.value,
                changed:true
                //saveFlag:false
              });
        }
    }
    // if(!this.state.isNew){
    //   this.setState({
    //    changed:true
    //   });
    // }
  }

  openInstruction=()=>{
    let { openInstruction, insertReminderTemplateLog } = this.props;
    insertReminderTemplateLog && insertReminderTemplateLog('[Reminder Template Maintenance Dialog] Action: Click \'Edit Instruction\' button', '');
    openInstruction && openInstruction();
  }

  handleEscKeyDown = () =>{
    this.handleCloseDialog();
  }

  closeSearchData = () => {
    this.setState({
        searchRecordTotalNums:0,
        searchRecordList:[]
    });
  };


  render() {
    const {classes,open} = this.props;
    const {templateNameValidation,templateNameMessage}=this.state;

    let inputProps = {
      autoCapitalize:'off',
      variant:'outlined',
      type:'text',
      inputProps: {
        className:classes.inputProps
      }
    };
    return (
        <EditTemplateDialog
      // dialogContentProps={{ style: { minWidth: 1000} }}
            dialogTitle={'Reminder Template Maintenance'}
            open={open}
            handleEscKeyDown={this.handleEscKeyDown}
            onExit={this.handleClose}
        >
            <Typography
                component="div"
                style={{marginBottom: 15, marginLeft: 15, marginRight: 5, marginTop: 15 }}
            >
                <Grid container
                    spacing={8}
                >
                    <Grid item
                        xs={2}
                        style={{maxWidth:'17%',paddingTop:39}}
                    >
                <span className={classes.inputStyle}><span style={{ color: 'red' }}>*</span>Template Name</span>
                </Grid>
                <Grid item
                    xs={10}
                >
                <TextField
                    autoCapitalize="off"
                    className={classes.normal_input}
                    //error={this.state.templateName.trim()===''&&this.state.saveFlag?true:false}
                    id={'tokenTemplateDialog_TemplateName'}
                    name="templateName"
                    onChange={this.inputOnchange}
                    style={{width: '98%' }}
                    type="text"
                    value={this.state.templateName}
                    variant="outlined"
                    {...inputProps}
                />
            {!this.state.saveFlag ?
            (this.state.templateNameValidation)?
                (<span className={classes.validation} style={{ lineHeight: 2.5 }}
                    id="span_tokenTemplateDialog_templateName_validation"
                >{templateNameMessage}</span>
                ):
                    this.state.templateName.trim()===''?(<span className={classes.validation} style={{ lineHeight: 2.5 }}
                        id="span_tokenTemplateDialog_templateName_validation"
                                                         >This field is required.</span>):null
              : null}
                </Grid>
                </Grid>

                <Grid container
                    spacing={8}
                    style={{marginTop:15}}
                >
                    <Grid  item
                        xs={2}
                        style={{maxWidth:'17%',paddingTop:19}}
                    >
                <span className={classes.inputStyle}><span style={{ color: 'red' }}>*</span>Follow up Location</span>
                </Grid>
                <Grid item
                    xs={10}
                    style={{paddingTop:12}}
                >
                <TextField
                    autoCapitalize="off"
                    className={classes.normal_input}
                    //error={this.state.tokenTemplatefollowUpLocation.trim()===''&&this.state.saveFlag?true:false}
                    id={'tokenTemplateDialog_FollowUpLocation'}
                    name="tokenTemplatefollowUpLocation"
                    onChange={this.inputOnchange}
                    style={{width: '98%' }}
                    type="text"
                    value={this.state.tokenTemplatefollowUpLocation}
                    variant="outlined"
                    {...inputProps}
                />
                {this.state.tokenTemplatefollowUpLocation.trim()===''&&!this.state.saveFlag?(
                  <span className={classes.validation} style={{lineHeight:2.5}}
                      id="span_tokenTemplateDialog_followLocation_validation"
                  >This field is required.</span>
                  ):null}
                </Grid>
                </Grid>


                <Grid container
                    spacing={8}
                    style={{marginTop:15,marginBottom:-15}}
                >
                    <Grid item
                        xs={2}
                        style={{maxWidth:'17%',paddingTop:16}}
                    >
                <span className={classes.inputStyle}><span style={{ color: 'red' }}>*</span>Instruction</span>
                </Grid>
                <Grid
                    // className={classes.searchGrid}
                    item
                    // xs={3}
                    style={{marginTop:-23,paddingRight:6}}
                >
                  <TokenTemplateDialogSearchInput
                      containerStyle={{float: 'left'}}
                      dataList={this.state.searchRecordList}
                      displayField={['instructDesc']}
                      // handleSearchBoxLoadMoreRows={this.handleSearchBoxLoadMoreRows}
                      id="TokenTemplateDialogSearchInput"
                      inputPlaceHolder={'---Please Select---'}
                      limitValue={4}
                      onChange={this.handleFuzzySearch}
                      handleInputOnchange={this.handleInputOnchange}
                      onSelectItem={this.handleSelectItem.bind(this)}
                      pageSize={30}
                      totalNums={this.state.searchRecordTotalNums}
                      value={this.state.instructionName}
                      closeSearchData={this.closeSearchData}
                  />
                  {this.state.instructionNameResult.trim() === '' && !this.state.saveFlag ? (
                    <span
                        className={classes.validation}
                        style={{ lineHeight: 2.5 }}
                        id="span_tokenTemplateDialog_followLocation_InstructionName"
                    >
                      This field is required.
                    </span>
                  ) : null}
                  <IconButton
                      id="template_btn_edit"
                      onClick={this.openInstruction}
                      style={{ textTransform: 'none',marginTop:'-6px'}}
                  >
                    <Edit/>
                  </IconButton>
                </Grid>
                {/* <Grid item
                    style={{marginTop:-20,paddingLeft:0}}
                    xs={4}
                >
                  <IconButton id="template_btn_edit"
                      onClick={this.openInstruction}
                      style={{ textTransform: 'none',marginTop:'-6px'}}
                  >
              <Edit/>
              </IconButton>
              </Grid> */}
                </Grid>
                <Grid container
                    spacing={8}
                    style={{marginTop:15}}
                >
                <Grid
                    className={classes.checkBoxGrid}
                    item
                    key={Math.random()}
                    xs={4}
                    style={{paddingTop:4}}
                >
                        <FormControlLabel
                            classes={{
                            label: classes.normalFont
                          }}
                            control={
                            <Checkbox
                                checked={this.state.isActive===0?false:true}
                                color="primary"
                                id="isActiveCheckBox"
                                onChange={this.handleIsActiveCheckBox}
                                classes={{
                                  root:classes.checkBoxSty
                                }}
                            />
                          }
                            label={'Active'}
                        />
                      </Grid>
                </Grid>


                <Divider style={{marginTop:12,marginLeft:-4}}/>
                <Typography component="div"
                    style={{marginLeft:-4}}
                >
                  <span className={classes.templateDetailStyle}>Template Detail</span>
                  <Divider />
                <Typography  component="div" style={{paddingTop:'15px'}}>
                 {/* checkbox */}
            <Typography component="div"
                style={{ marginLeft:8}}
            >
              <Grid container>
                <FormGroup className={classes.fullWidth}
                    row
                    id="reminder_checkbox"
                >
                  {this.state.templateDetailList.map((item,index) => {
                    return (
                      <Grid
                          className={classes.checkBoxGrid}
                          item
                          key={Math.random()}
                          xs={4}
                      >
                        <FormControlLabel
                            classes={{
                            label: classes.normalFont
                          }}
                            control={
                            <Checkbox
                                checked={item.isSelect==='N'?false:true}
                                color="primary"
                                id={item.codeAssessmentCd}
                                onChange={this.handleCheckBoxChange(index)}
                                classes={{
                                  root:classes.checkBoxSty
                                }}
                            />
                          }
                            label={item.frmItemName}
                        />
                      </Grid>
                    );
                  })}

                </FormGroup>


              </Grid>
              {this.state.tokenTemplateListFlag?(
                     <div>
                  <span className={classes.templateDetailValidation}
                      id="span_tokenTemplateDialog_templateDetail_validation"
                  >This field is required.</span>
                  </div>
                  ):<div className={classes.templateDetailValidationFail}></div>}
            </Typography>

                </Typography>
                </Typography>

          </Typography>
          <Typography component="div">
            <Grid alignItems="center"
                container
                justify="flex-end"
            >
              <Typography component="div">
                <CIMSButton
                    classes={{
                      label:classes.fontLabel
                    }}
                    color="primary"
                    id="template_btn_save"
                    onClick={() =>this.handleClickSave()}
                    size="small"
                >
                    Save
                </CIMSButton>
              </Typography>
              <CIMSButton
                  classes={{
                    label:classes.fontLabel
                  }}
                  color="primary"
                  id="template_btn_reset"
                  onClick={() =>this.handleCloseDialog()}
                  size="small"
              >
              Cancel
              </CIMSButton>
            </Grid>

          </Typography>
          </EditTemplateDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    tokenTemplateList: state.tokenTemplateManagement.tokenTemplateList
  };
}
const mapDispatchToProps = {
  getReminderTmplById,
  getReminderInsturctsByName,
  saveReminderTemplate,
  getCodeIoeFormItems,
  openCommonMessage
  };
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(tokenTemplateDialog));
