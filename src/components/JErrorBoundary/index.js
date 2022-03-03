/*
* @Author: vento
* @Date:   2019-12-24 11:09:35
* @Last Modified by:   toutouli
* @Last Modified time: 2019-12-24 17:00:54
*/

import React,{Component} from 'react';
import { connect } from 'react-redux';
import accessRightEnum from '../../enums/accessRightEnum';

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { error: false };
//   }
//   componentDidCatch(error, info) {
//     const {dispatch}=this.props;
//     if(error.toString().indexOf('encounter')>0){
//       dispatch({type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',payload:{
//         msgCode:'100105',
//         btnActions:{
//           btn1Click: () => {
//             this.handleCancel();
//           }
//         }
//       }});
//     }else{
//       dispatch({type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',payload:{
//         msgCode:'100106',
//         // msgObj:{
//         //   header:'Unexpected Error',
//         //   description:error.toString(),
//         //   btn1Caption:'OK'
//         // },
//         btnActions:{
//           btn1Click: () => {
//             this.handleCancel();
//           }
//         }
//       }});
//     }
//
//     this.setState({ error, info });
//   }
//
//   handleCancel=()=>{
//     const {mainFrame,dispatch}=this.props;
//     const {subTabsActiveKey,tabsActiveKey}=mainFrame;
//     if(tabsActiveKey==accessRightEnum.patientSpec){
//       dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:subTabsActiveKey});
//     }else{
//       dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
//     }
//     dispatch({type:'COMMON_CLOSE_COMMON_CIRCULAR_DIALOG'});
//   }
//   render() {
//       if(this.state.error){
//         return null;
//       }else{
//         return this.props.children;
//       }
//   }
// }
const functionList={
  F104:'General Assessment',
  F102:'Clinical Note',
  'F111-1':'Clinical Note',
  F111:'Diagnosis/Procedure',
  F114:'MRAM',
  F115:'Speciman Collection',
  // F200:'Precription',
  // F117:'Ix Enquiry',
  F121:'Ix Request',
  // F120:'Immunisation',
  F122:'Clinical Summary Report',
  [accessRightEnum.attendanceCert]: 'Attendance Cert',
  [accessRightEnum.sickLeaveCertificate]: 'SickLeave Cert',
  [accessRightEnum.referralLetter]: 'Referral Letter',
  [accessRightEnum.yellowFeverLetter]: 'YellowFever Letter',
  [accessRightEnum.vaccineFeverCert]: 'Vaccination Cert',
  [accessRightEnum.maternityCertificate]: 'Maternity Cert',
  [accessRightEnum.certificateEform]: 'Certificate E-Form'
};

const ErrorBoundary=(WrappedComponent)=> {

  class HOC extends Component {
    constructor(props) {
      super(props);
      this.state = { error: false };
    }
    componentDidMount(){
      const {dispatch,patient={},login,mainFrame}=this.props;
      const {subTabsActiveKey,tabsActiveKey}=mainFrame;
      const activeKey = tabsActiveKey === accessRightEnum.patientSpec?subTabsActiveKey:tabsActiveKey;
      const {accessRights=[]}=login;
      const {encounterInfo={}}=patient;
      const currentItem=accessRights.find(item=>item.name===activeKey);
      const isNeedPatient=currentItem&&currentItem.isPatRequired=='Y';
      const inFunctionList=!!functionList[activeKey];
      if((!encounterInfo.encounterId)&&isNeedPatient&&inFunctionList){
        dispatch({type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',payload:{
          msgCode:'100105',
          btnActions:{
            btn1Click: () => {
              this.handleCancel();
            }
          }
        }});
        this.setState({ error:true });
      }
    }
    shouldComponentUpdate(nextProps){
      if(JSON.stringify(nextProps)!==JSON.stringify(this.props)){
        return true;
      }
      return false;
    }
    componentDidCatch(error, info) {
      const {dispatch}=this.props;
      dispatch({type:'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',payload:{
        msgCode:'100106',
        // msgObj:{
        //   header:'Unexpected Error',
        //   description:error.toString(),
        //   btn1Caption:'OK'
        // },
        btnActions:{
          btn1Click: () => {
            this.handleCancel();
          }
        }
      }});
      this.setState({ error, info });
    }

    handleCancel=()=>{
      const {mainFrame,dispatch}=this.props;
      const {subTabsActiveKey,tabsActiveKey}=mainFrame;
      if (tabsActiveKey == accessRightEnum.patientSpec){
        dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:subTabsActiveKey});
      }else{
        dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
      }
      dispatch({type:'COMMON_CLOSE_COMMON_CIRCULAR_DIALOG'});
    }
    render() {
      const {mainFrame,...resProps}=this.props;

      const {patient={},login}=this.props;
      const {subTabsActiveKey,tabsActiveKey}=mainFrame;
      const activeKey=tabsActiveKey==='patientSpecFunction'?subTabsActiveKey:tabsActiveKey;
      const {accessRights=[]}=login;
      const {encounterInfo={}}=patient;
      const currentItem=accessRights.find(item=>item.name===activeKey);
      const isNeedPatient=currentItem&&currentItem.isPatRequired=='Y';
      const inFunctionList=!!functionList[activeKey];
      let encounterInfoError = false;
      if((!encounterInfo.encounterId)&&isNeedPatient&&inFunctionList){
        encounterInfoError = true;
      }

      if(this.state.error||encounterInfoError){
        return null;
      }else{
        return <WrappedComponent {...resProps} />;
      }
    }
  }

  return connect(({mainFrame,patient,login})=>({mainFrame,patient,login}))(HOC);
};

export default ErrorBoundary;
