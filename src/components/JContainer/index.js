import React,{Component} from 'react';
import {Grid} from '@material-ui/core';
import Button from 'components/JButton';
import {withStyles} from '@material-ui/core/styles';
import {COMMON_CODE} from 'constants/message/common/commonCode';
import { connect } from 'react-redux';
import accessRightEnum from '../../enums/accessRightEnum';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from './theme';
import { getState } from '../../store/util';
import * as commonUtils from '../../utilities/josCommonUtilties';

const { color } = getState(state => state.cimsStyle) || {};

const containerStyles={
  root:(props)=>{
    const {buttonBar}=props;
    const buttonBarHeight=buttonBar?buttonBar.height||'44px':'0px';
    const paddingBottom=buttonBar?buttonBar.position=='fixed'&&buttonBarHeight:'0px';
    return {
      // display:'flex',
      // flexDirection:'column',
      // width:'100%',
      height:'100%',
      overflow:'hidden',
      '& .content':{
        flex:'auto',
        boxSizing:'border-box',
        height:`calc(100% - ${buttonBarHeight})`,
        paddingBottom:`${paddingBottom}!important`,
        overflowY:'auto',
        overflowX:'hidden',
        width:'100%'
      }
    };
  },
  topDiv: {
    width: '100%',
    // position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    // height: 60,
    overflowY: 'hidden',
    overflowX: 'auto'
  },
  wrapperDiv: {
    height: 'inherit'
  }
};


const buttonBarStyles={
  root:(props)=>{
    const {height='44px',position}=props;
    let styles={
      backgroundColor: color.cimsBackgroundColor,
      color: color.cimsTextColor,
      display:'flex',
      alignItems:'center',
      justifyContent:'flex-end',
      flex:'0 0 auto',
      borderTop:'1px solid #e6e6e6',
      boxSizing:'border-box',
      padding:'0 12px',
      height:height,
      '& button':{
        marginRight:'12px'
      },
      '& button:last-child':{
        marginRight:'0'
      }
    };

    if(position=='fixed'){
      styles={
        ...styles,
        position:'fixed',
        zIndex:100,
        left:0,
        right:0,
        bottom:0
      };
    }
    return styles;
  }
};


export const ButtonBar=withStyles(buttonBarStyles)(({buttons=[],render,buttonContainerStyle=null,classes, handleCancelLog, logSaveApi, ...resProps})=>{
  return (
    <div className={classes.root} {...resProps}>
      {render&&render()}
      {buttons.length&&
        <div style={buttonContainerStyle}>
          {
            buttons.map((button,index)=>{
              const {title,key=index,...btnResProps}=button;
              return <Button style={{fontSize:'1rem'}} {...btnResProps} key={key}>{title}</Button>;
            })
          }
        </div>
      }
    </div>
  );
});

const WithDefaultCancel=(WrappedComponent) => {
  return class extends Component {
    // componentWillReceiveProps(nextProps,states){
    //   const {mainFrame,dispatch}=this.props;
    //   const {subTabsActiveKey,tabsActiveKey}=mainFrame;
    //   const currentTab=tabsActiveKey==accessRightEnum.patientSpec?subTabsActiveKey:tabsActiveKey;
    //   dispatch({type:'MAIN_FRAME_CHANGE_EDIT_MODE',params:{
    //     name:currentTab,
    //     isEdit:true,
    //     doCloseFunc:null,
    //     canCloseTab:true
    //   }});
    // }
    componentDidMount(){
      this.changeEditMode(this.props);
    }
    componentWillReceiveProps(nextProps){
      if(nextProps.isEdit!==this.props.isEdit){
        this.changeEditMode(nextProps);
      }
    }

    changeEditMode=(props)=>{
      const {mainFrame,dispatch,isEdit}=props;
      const {subTabsActiveKey,tabsActiveKey}=mainFrame;
      const currentTab=tabsActiveKey==accessRightEnum.patientSpec?subTabsActiveKey:tabsActiveKey;
      dispatch({type:'MAIN_FRAME_CHANGE_EDIT_MODE',params:{
          name:currentTab,
          isEdit:isEdit,
          doCloseFunc:null,
          canCloseTab:true
      }});
    }
    handleClick=()=>{
      let {isEdit,handleCancelLog}=this.props;
      if(typeof isEdit== 'function'){
        isEdit=isEdit();
      }
      if(isEdit){
        this.saveConfirm();
      }else{
        this.handleCancel();
        handleCancelLog && handleCancelLog('Action: Click \'Cancel\' button');
      }
    }
    handleCancel=()=>{
      const {mainFrame,dispatch}=this.props;
      const {subTabsActiveKey,tabsActiveKey}=mainFrame;
      if (tabsActiveKey == accessRightEnum.patientSpec){
        dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:subTabsActiveKey});
      }else{
        dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
      }
    }

    saveConfirm=()=>{
      const {dispatch,title,saveFuntion,autoCloseBtn1,handleCancelLog,logSaveApi}=this.props;
      dispatch({type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',payload:{
        msgCode:COMMON_CODE.SAVE_WARING,
        btn1AutoClose:autoCloseBtn1,
        btnActions:{
          btn1Click: () => {
            setInterval(saveFuntion(this.handleCancel), 3000);
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', title);
            handleCancelLog && handleCancelLog(name, logSaveApi);
          }, btn2Click: () => {
            this.handleCancel();
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', title);
            handleCancelLog && handleCancelLog(name);
          }, btn3Click: () => {
            let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', title);
            handleCancelLog && handleCancelLog(name);
          }
        },
        params: [
            {
                name: 'title',
                value: title||'this'
            }
        ]
      }});
    }
    cancelButton={
      title:'Cancel',
      key:'default_cancel_button',
      id:'default_cancel_button',
      onClick:this.handleClick
    }
    render() {
        const {defaultCancel=true,...resProps}=this.props;
        let {buttons=[]}=resProps;
        delete resProps.mainFrame;
        delete resProps.dispatch;
        delete resProps.isEdit;
        delete resProps.autoCloseBtn1;
        delete resProps.saveFuntion;
        if(defaultCancel){
          resProps.buttons=[...buttons,this.cancelButton];
        }
        return (
            <WrappedComponent {...resProps} />
        );
    }
  };
};

export const ButtonBarWithCancelButton=connect(({mainFrame})=>({mainFrame}))(WithDefaultCancel(ButtonBar));

const JContainer=withStyles(containerStyles)(({children,classes,buttonBar,topDivHeight,...res})=>{
  const renderButtonBar=()=>{
    if(buttonBar.$$typeof){
      return buttonBar;
    }else{
      const {defaultCancel=true}=buttonBar;
      let {isEdit} =buttonBar;
      if(defaultCancel){
        buttonBar.isEdit=isEdit;
        return <ButtonBarWithCancelButton {...buttonBar} />;
      }else{
        return <ButtonBar {...buttonBar} />;
      }
    }
  };
  return (
    <Grid item container xs direction={'column'} justify={'space-between'} alignItems={'stretch'} className={classes.root}>
      <MuiThemeProvider theme={theme}>
          <Grid className={'content'} {...res}>{children}</Grid>
          <div className={classes.topDiv} style={{height:topDivHeight||undefined,position:buttonBar.isPosition?'unset':'fixed'}}>
            <div className={classes.wrapperDiv}>
              {buttonBar&&renderButtonBar()}
            </div>
          </div>
      </MuiThemeProvider>
    </Grid>
  );
});

export default JContainer;
