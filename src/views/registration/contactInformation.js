import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Remove, Add } from '@material-ui/icons';
import {
  Grid,
  FormControlLabel,
  IconButton,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  RadioGroup,
  Radio,
  FormControl
} from '@material-ui/core';
import _ from 'lodash';
import moment from 'moment';
import { patientAddressBasic } from '../../constants/registration/registrationConstants';
import { updateState, updatePatientEhsDto } from '../../store/actions/registration/registrationAction';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';
import OutlinedRadioValidator from '../../components/FormValidator/OutlinedRadioValidator';
// import OutlinedCheckBoxValidator from '../../components/FormValidator/OutlinedCheckBoxValidator';
import CommonMessage from '../../constants/commonMessage';
import RegFieldName from '../../enums/registration/regFieldName';
import Enum, { SERVICE_CODE } from '../../enums/enum';
import ValidatorEnum from '../../enums/validatorEnum';
import ContactPhones from './component/phones/contactPhones';
import memoize from 'memoize-one';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import CIMSCheckBox from '../../components/CheckBox/CIMSCheckBox';
import { openADISearchDialog } from '../../utilities/registrationUtilities';
import CIMSButton from '../../components/Buttons/CIMSButton';
import {
  openCommonCircularDialog,
  closeCommonCircularDialog
} from '../../store/actions/common/commonAction';
import ContactInformationEnum from '../../enums/registration/contactInformationEnum';
import StructuredAddressPanel from './component/contactInformation/structuredAddressPanel';
import FreeTextAddressPanel from './component/contactInformation/freeTextAddressPanel';
import PostalBoxAddressPanel from './component/contactInformation/postalBoxAddressPanel';
import * as commonUtilities from '../../utilities/commonUtilities';
import * as RegUtil from '../../utilities/registrationUtilities';
import CommunicationMeans from './component/contactInformation/communicationMeans';
import {auditAction} from '../../store/actions/als/logAction';
import { hasEhsPhn } from '../../utilities/patientUtilities';


const fieldLabel = {
  CONTACT_EMAIL: 'Email',
  CONTACT_ROOM: 'Room/Flat',
  CONTACT_FLOOR: 'Floor',
  CONTACT_BLOCK: 'Block',
  CONTACT_BUILDING: 'Building',
  CONTACT_ESTATELOT: 'Estate/Village',
  CONTACT_STREET_NO: 'Street No.',
  CONTACT_STREET: 'Street/Road',
  CONTACT_POSTOFFICE_BOXNO: 'Post Office Box No.',
  CONTACT_POSTOFFICE_NAME: 'Post Office Name',
  CONTACT_POSTOFFICE_REGION: 'Region',
  CONTACT_CORRESPONDENCE_REGION: 'Region',
  CONTACT_CORRESPONDENCE_DISTRICT: 'District',
  CONTACT_CORRESPONDENCE_SUB_DISTRICT: 'Sub District',
  CONTACT_RESIDENTIAL_REGION: 'Region',
  CONTACT_RESIDENTIAL_DISTRICT: 'District',
  CONTACT_RESIDENTIAL_SUB_DISTRICT: 'Sub District'
};

const initState = {
    // expanded: '',
    corADI: {
        lang: 'en_US',
        unit: '',
        floor: '',
        block: '',
        building: '',
        estate: '',
        streetNo: '',
        streetName: '',
        subDistrict: '',
        district: '',
        region: '',
        callbackURL: `${window.location.origin}/#/adiCallback`
    },
    resADI: {
        lang: 'en_US',
        unit: '',
        floor: '',
        block: '',
        building: '',
        estate: '',
        streetNo: '',
        streetName: '',
        subDistrict: '',
        district: '',
        region: '',
        callbackURL: `${window.location.origin}/#/adiCallback`
    },
    corADIResult: null,
    resADIResult: null,
    tempResAddress: null,
    expanded: 'panel1',
    corAddressType: ContactInformationEnum.ADDRESS_TYPE.STRUCTURED,
    resAddressType: ContactInformationEnum.ADDRESS_TYPE.STRUCTURED,
    corAddressPanelIsExpanded: true,
    resAddressPanelIsExpanded: true
};

class ContactInformation extends Component {
  constructor(props) {
    super(props);
    this.state = initState;
  }

  componentDidMount() {
    // read URL from DB
    /*let where = {
      serviceCd: null,
      clinicCd: null
    };
    let adiURLobj = commonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.ADI_URL, this.props.clinicConfig, where);
    if (adiURLobj != null) {
      this.adiURL = adiURLobj.configValue;
    }*/

    // read from hostname
    let hostname = window.location.origin.replace('frontend', 'adi');
    this.adiURL = hostname + '/ADIWebClient/ADIWebClient.view';
  }

  componentDidUpdate(prevProps){
      // Update resADI & corADI lang when not match with addressList addressTypeCd (Edit patient info)

      const { addressList } = this.props;

      if (prevProps.addressList !== addressList) {
          const patientResAddressObj = addressList.find(
              (item) => item.addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE
          );

          const patientCorAddressObj = addressList.find(
              (item) => item.addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE
          );

          const resAdiLang =
              this.state.resADI.lang === 'en_US'
                  ? Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE
                  : Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE;

          const corAdiLang =
              this.state.corADI.lang === 'en_US'
                  ? Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE
                  : Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE;

          if (resAdiLang !== patientResAddressObj.addressLanguageCd)
              // eslint-disable-next-line react/no-did-update-set-state
              this.setState({
                  resADI: {
                      ...this.state.resADI,
                      lang:
                          patientResAddressObj.addressLanguageCd === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE
                              ? 'en_US'
                              : 'zh_HK'
                  }
              });

          if (corAdiLang !== patientCorAddressObj.addressLanguageCd)
              // eslint-disable-next-line react/no-did-update-set-state
              this.setState({
                  corADI: {
                      ...this.state.corADI,
                      lang:
                          patientCorAddressObj.addressLanguageCd === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE
                              ? 'en_US'
                              : 'zh_HK'
                  }
              });
      }
  }

  resetState = () => this.setState({ ...initState });

  corAddressFilter = memoize((list) => list && list.find(item => item.addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE));

  resAddressFilter = memoize((list) => list && list.find(item => item.addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE));

  postOfficeValidFilter = memoize((communicationMeansCd) => {
    let validator = [];
    let errorMsg = [];
    if (communicationMeansCd.indexOf(Enum.CONTACT_MEAN_POSTALMAIL) > -1) {
      validator.push(ValidatorEnum.required);
      errorMsg.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
    }
    return { validator, errorMsg };
  });

  filterPhones = memoize(list => (list && list.filter(item => item.phonePriority !== 1)) || []);

  filterDistrict = memoize((districtCd, addressType) => {
    let districtList = _.cloneDeep(this.props.registerCodeList.district);
    let curDistrict = districtList.find(item => item.code === districtCd);
    let newDistrictList = [];
    if (curDistrict) {
      newDistrictList = districtList.filter(item => item.superCode === curDistrict.superCode);
    }
    // return newDistrictList?newDistrictList:[];
    if (addressType === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      this.props.updateState({ corDistrictList: newDistrictList });
    }
    else {
      this.props.updateState({ resDistrictList: newDistrictList });
    }
    // this.props.updateState({ districtList: newDistrictList });
  });

  filterSubDistrict = memoize((subDistrictcd, addressType) => {
    let subDistrictList = _.cloneDeep(this.props.registerCodeList.sub_district);
    let curSubDistrict = subDistrictList.find(item => item.code === subDistrictcd);
    let newSubDistrictList = [];
    if (curSubDistrict) {
      newSubDistrictList = subDistrictList.filter(item => item.superCode === curSubDistrict.superCode);
    }
    if (addressType === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      this.props.updateState({ corSubDistrictList: newSubDistrictList });
    }
    else {
      this.props.updateState({ resSubDistrictList: newSubDistrictList });
    }
    // this.props.updateState({ subDistrictList: newSubDistrictList });
  })


  handleChangeInfo = (value, name) => {
    let patientContactInfo = _.cloneDeep(this.props.patientContactInfo);
    // if(name==='commLangCd'){
    //   patientContactInfo.pmiPatientCommMeanList&&patientContactInfo.pmiPatientCommMeanList.forEach(mean=>{
    //     mean.commLangCd=value;
    //   });
    // }
    if(name==='pmiPatientCommMeanList'){
      const checkedMeans=value.filter(item=>item.status==='A' && item.commMeanCd !== 'M');
      if(checkedMeans.length===0){
        // if(patientContactInfo.commLangCd===''){
        //   patientContactInfo.commLangCd=Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE;
        // }
        patientContactInfo.commLangCd='';
      }
    }
    if(name==='dtsElctrncCommCnsntSts'){
      // if(value==='N'){
      //   patientContactInfo.dtsElctrncCommCnsntUpdDtm='';
      // }
      // else{
        // if(patientContactInfo.dtsElctrncCommCnsntUpdDtm===''){
          patientContactInfo.dtsElctrncCommCnsntUpdDtm=moment().format(Enum.DATE_FORMAT_EDMY_VALUE);
        // }
      // }
    }
    patientContactInfo[name] = value;
    this.props.updateState({ patientContactInfo: patientContactInfo });
    if (name === 'communicationMeansCd' && value.indexOf(Enum.CONTACT_MEAN_POSTALMAIL) > -1) {
      this.setState({ expanded: 'panel3' });
    }
  }

  // handleChangeOtherPhones = (otherPhones, selectSMSMobile) => {
  //   let phoneList = _.cloneDeep(this.props.phoneList);
  //   let mPhone = phoneList.find(item => item.phonePriority === 1);
  //   let _phoneList = _.cloneDeep(otherPhones);
  //   let patientContactInfo = _.cloneDeep(this.props.patientContactInfo);
  //   let _communicationMeans = patientContactInfo.communicationMeansCd;
  //   _phoneList.unshift(mPhone);
  //   if (selectSMSMobile) {
  //     if (_communicationMeans.indexOf(Enum.CONTACT_MEAN_SMS) === -1) {
  //       _communicationMeans += Enum.CONTACT_MEAN_SMS;
  //       patientContactInfo.communicationMeansCd = _communicationMeans;
  //       this.props.updateState({ patientContactInfo: patientContactInfo });
  //     }
  //   }
  //   this.props.updateState({ phoneList: _phoneList });
  // }

  handleChangeContactInfoPhones = (phoneList) => {
    // let patientContactInfo = _.cloneDeep(this.props.patientContactInfo);
    // let _communicationMeans = patientContactInfo.communicationMeansCd;
    // if (selectSMSMobile) {
    //   if (_communicationMeans.indexOf(Enum.CONTACT_MEAN_SMS) === -1) {
    //     _communicationMeans += Enum.CONTACT_MEAN_SMS;
    //   }
    // }
    // else {
    //   if (_communicationMeans.indexOf(Enum.CONTACT_MEAN_SMS) > -1) {
    //     _communicationMeans = _communicationMeans.replace(Enum.CONTACT_MEAN_SMS, '');
    //   }
    // }
    // patientContactInfo.communicationMeansCd = _communicationMeans;
    // let _phoneList = RegUtil.initPreferPhone(phoneList);
    // this.props.updateState({ phoneList, patientContactInfo: patientContactInfo });
    let _phoneList=_.cloneDeep(phoneList);
    this.props.updateState({phoneList:_phoneList});
  }

  setAddressState = (value, type, name) => {
    if (type === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      this.setState(prevState => ({
        corADI: {
          ...prevState.corADI,
          [name]: value
        }
      }));
    } else {
      this.setState(prevState => ({
        resADI: {
          ...prevState.resADI,
          [name]: value
        }
      }));
    }
  }

  handleChangeAddress = (value, type, name, code) => {
    let addressList = _.cloneDeep(this.props.addressList);
    let patientAddressObj = addressList.find(item => item.addressTypeCd === type);
    let filterSet;
    if (type === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      filterSet = _.cloneDeep(this.props.filterSet_c);
    } else {
      filterSet = _.cloneDeep(this.props.filterSet_r);
    }
    if (name === 'addressLanguageCd') {
      this.props.resetValidators();
      if (!value.target.checked) {
        value = Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE;
        if (type === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
          this.setState(prevState => ({
            corADI: { // object that we want to update
              ...prevState.corADI, // keep all other key-value pairs
              lang: 'en_US' // update the value of specific key
            }
          }));
        } else {
          this.setState(prevState => ({
            resADI: {
              ...prevState.resADI,
              lang: 'en_US'
            }
          }));
        }
      } else {
        value = value.target.value;
        if (type === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
          this.setState(prevState => ({
            corADI: {
              ...prevState.corADI,
              lang: 'zh_HK'
            }
          }));
        } else {
          this.setState(prevState => ({
            resADI: {
              ...prevState.resADI,
              lang: 'zh_HK'
            }
          }));
        }
      }
      const addressObj = RegUtil.converAddressLanguage({
        isChi: value === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE,
        addressDto: _.cloneDeep(patientAddressObj),
        regionList: ContactInformationEnum.REGION,
        districtList: this.props.registerCodeList.district,
        subDistrictList: this.props.registerCodeList.sub_district
      });
      patientAddressObj.region = addressObj.region;
      patientAddressObj.regionCode = addressObj.regionCode;
      patientAddressObj.districtCd = addressObj.districtCd;
      patientAddressObj.districtCode = addressObj.districtCode;
      patientAddressObj.subDistrictCd = addressObj.subDistrictCd;
      patientAddressObj.subDistrictCode = addressObj.subDistrictCode;
    } else if (name === 'room') {
      this.setAddressState(value, type, 'unit');
    } else {
      this.setAddressState(value, type, name);
    }

    if(name === 'region' || name === 'districtCd' || name === 'subDistrictCd') {
      const addressObj = RegUtil.getDistrictRelationship({
        name: name,
        code: code,
        value: value,
        regionList: ContactInformationEnum.REGION,
        districtList: this.props.registerCodeList.district,
        subDistrictList: this.props.registerCodeList.sub_district,
        isChi: patientAddressObj.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE,
        addressDto: _.cloneDeep(patientAddressObj)
      });
      patientAddressObj.region = addressObj.region;
      patientAddressObj.regionCode = addressObj.regionCode;
      patientAddressObj.districtCd = addressObj.districtCd;
      patientAddressObj.districtCode = addressObj.districtCode;
      patientAddressObj.subDistrictCd = addressObj.subDistrictCd;
      patientAddressObj.subDistrictCode = addressObj.subDistrictCode;

      if (name === RegFieldName.CONTACT_REGION) {
        if (value === '') {
          filterSet[RegFieldName.CONTACT_REGION] = 0;
          filterSet[RegFieldName.CONTACT_DISTRICT] = 0;
        } else {
          filterSet[RegFieldName.CONTACT_REGION] = 1;
          filterSet[RegFieldName.CONTACT_DISTRICT] = 0;
        }
      }

      if (name === RegFieldName.CONTACT_DISTRICT) {
        if (value === '') {
          filterSet[RegFieldName.CONTACT_DISTRICT] = 0;
          filterSet[RegFieldName.CONTACT_REGION] = 1;
        } else {
          filterSet[RegFieldName.CONTACT_DISTRICT] = 1;
          filterSet[RegFieldName.CONTACT_REGION] = 1;
        }
      }

      if (name === RegFieldName.CONTACT_SUB_DISTRICT) {
        filterSet[RegFieldName.CONTACT_DISTRICT] = 1;
        filterSet[RegFieldName.CONTACT_REGION] = 1;
      }
    }

    if (patientAddressObj) {
      patientAddressObj[name] = value;
      if (!patientAddressObj.addressFormat) {
        patientAddressObj.addressFormat = ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
      }
      let notEmptyFieldArr = [];
      // for (let fieldName in patientAddressObj) {
      //   if (fieldName !== 'addressId' && fieldName !== 'addressTypeCd' && fieldName !== 'addressLanguageCd' && fieldName !== 'serviceCd' && fieldName !== 'addressFormat' && fieldName !== 'isDirty') {
      //     if (patientAddressObj[fieldName] !== '') {
      //       // delete patientAddressObj[name];
      //       notEmptyFieldArr.push(patientAddressObj[fieldName]);
      //     }
      //   }
      // }
      for(let name in patientAddressBasic){
        if(patientAddressObj[name]&&name!=='addressId'&&name!=='addressTypeCd'&&name!=='addressLanguageCd'&&name!=='addressFormat'&&name!=='isDirty'){
          notEmptyFieldArr.push(patientAddressObj[name]);
        }
      }
      if (notEmptyFieldArr.length > 0) {
        patientAddressObj.isDirty = true;
      }
      else {
        patientAddressObj.isDirty = false;
      }
      // if(Object.keys(patientAddressObj).length)
    } else {
      let pab = _.cloneDeep(patientAddressBasic);
      pab.addressTypeCd = type;
      pab[name] = value;
      addressList.push(pab);
    }
    if (name === 'addressFormat' && value != patientAddressObj.addressFormat) {
      patientAddressObj.isDirty = false;
    }
    if (type === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE && this.props.contactInfoSaveAbove) {
      let patientResAddressObj = addressList.find(item => item.addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE);
      let newResAddress = _.cloneDeep(patientAddressObj);
      let newAddressList = [];
      newResAddress.addressId = patientResAddressObj.addressId;
      newResAddress.addressTypeCd = patientResAddressObj.addressTypeCd;
      // resAddress=_.cloneDeep(corAddress);
      patientResAddressObj = newResAddress;
      newAddressList.push(patientAddressObj);
      newAddressList.push(patientResAddressObj);
      addressList = newAddressList;
      // patientResAddressObj=
    }
    if (type === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      this.props.updateState({ addressList: addressList, filterSet_c: filterSet });
    } else {
      this.props.updateState({ addressList: addressList, filterSet_r: filterSet });
    }
  }

  handleSameAsAboveCheckChange = (e, checked) => {
    this.props.updateState({ contactInfoSaveAbove: checked });
    this.props.resetValidators();
    this.copyAddressFromCorToRes(checked);


  }
  copyAddressFromCorToRes = (checked) => {
    let newResAddress = [];
    let addressList = _.cloneDeep(this.props.addressList);
    let corAddress = addressList.find(item => item.addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE);
    let resAddress = addressList.find(item => item.addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE);
    let newAddressList = [];
    newAddressList.push(corAddress);
    if (checked) {
      this.setState({ tempResAddress: resAddress });
      newResAddress = _.cloneDeep(corAddress);
      newResAddress.addressId = resAddress ? resAddress.addressId : 0;
      newResAddress.addressTypeCd = resAddress ? resAddress.addressTypeCd : Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE;
      // resAddress=_.cloneDeep(corAddress);
      // resAddress = newResAddress;
    } else {
      if (this.state.tempResAddress) {
          newResAddress = this.state.tempResAddress;
      } else {
          newResAddress = _.cloneDeep(patientAddressBasic);
          // newResAddress.isDirty = true;
          newResAddress.addressId = resAddress ? resAddress.addressId : 0;
          newResAddress.addressTypeCd = resAddress ? resAddress.addressTypeCd : Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE;
          newResAddress.addressFormat = resAddress
              ? resAddress.addressFormat
              : ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
      }

      let notEmptyFieldArr = [];
      // for (let name in newResAddress) {
      //   if (name !== 'addressId' && name !== 'addressTypeCd' && name !== 'addressLanguageCd' && name !== 'serviceCd' && name !== 'addressFormat' && name !== 'isDirty') {
      //     if (newResAddress[name] !== '') {
      //       // delete patientAddressObj[name];
      //       notEmptyFieldArr.push(newResAddress[name]);
      //     }
      //   }
      // }
      for(let name in patientAddressBasic){
        if(newResAddress[name]&&name!=='addressId'&&name!=='addressTypeCd'&&name!=='addressLanguageCd'&&name!=='addressFormat'&&name!=='isDirty'){
          notEmptyFieldArr.push(newResAddress[name]);
        }
      }
      if (notEmptyFieldArr.length > 0) {
        newResAddress.isDirty = true;
      }
      else {
        newResAddress.isDirty = false;
      }
      // resAddress = newResAddress;
    }
    newAddressList.push(newResAddress);
    this.props.updateState({ addressList: newAddressList });
    // return newResAddress;
  }

  handleExpanChange = (e, isExpanded, panelName) => {
    let fieldName = '';
    if (panelName === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      fieldName = 'corAddressPanelIsExpanded';
    }
    else {
      fieldName = 'resAddressPanelIsExpanded';
    }
    this.setState({
      [fieldName]: isExpanded ? isExpanded : false
    });
  }

  focusADIRoom = (addressTypeCd) => {
    if(addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      document.getElementById('registration_contactInformation_cor_room').focus();
    } else {
      document.getElementById('registration_contactInformation_res_room').focus();
    }
  }

  onClickSearchBtn = (addressTypeCd, districtCdList) => {
    let addressList = _.cloneDeep(this.props.addressList);
    let corAddress = addressList.find(item => item.addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE);
    let resAddress = addressList.find(item => item.addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE);
    let adiString = '';
    if (addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      adiString = JSON.stringify(this.state.corADI);
    } else if (addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE) {
      adiString = JSON.stringify(this.state.resADI);
    }
    openADISearchDialog(`/#/adi/${encodeURIComponent(this.adiURL)}/${encodeURIComponent(adiString)}`,
      (result) => {
        this.props.closeCommonCircularDialog();
        if (result.status === 'success') {
          if (addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
            this.setState({
              corADIResult: result
            });
            corAddress.room = result.unit;
            corAddress.floor = result.floor;
            corAddress.block = result.block;
            corAddress.building = result.building;
            corAddress.estate = result.estate;
            corAddress.streetNo = result.streetNo;
            corAddress.streetName = result.streetName;
            /*if (districtCdList && districtCdList.district) {
              if (this.state.corADI.lang === 'en_US' && districtCdList.district.find(item => item.engDesc.toUpperCase() === result.district.toUpperCase())) {
                corAddress.districtCd = districtCdList.district.find(item => item.engDesc.toUpperCase() === result.district.toUpperCase()).code;
              } else if (this.state.corADI.lang === 'zh_HK' && districtCdList.district.find(item => item.chiDesc === result.district)) {
                corAddress.districtCd = districtCdList.district.find(item => item.chiDesc === result.district).code;
              }
            }
            if (districtCdList && districtCdList.sub_district) {
              if (this.state.corADI.lang === 'en_US' && districtCdList.sub_district.find(item => item.engDesc.toUpperCase() === result.subDistrict.toUpperCase())) {
                corAddress.subDistrictCd = districtCdList.sub_district.find(item => item.engDesc.toUpperCase() === result.subDistrict.toUpperCase()).code;
              } else if (this.state.corADI.lang === 'zh_HK' && districtCdList.sub_district.find(item => item.chiDesc === result.subDistrict)) {
                corAddress.subDistrictCd = districtCdList.sub_district.find(item => item.chiDesc === result.subDistrict).code;
              }
            }*/
            if (this.state.corADI.lang === 'zh_HK') {
              corAddress.region = result.region;
            } else if (this.state.corADI.lang === 'en_US') {
              let adiRegion = ContactInformationEnum.REGION.find(item => item.code === result.region);
              if (adiRegion && adiRegion.engDesc) {
                corAddress.region = adiRegion.engDesc;
              }
            }
            corAddress.districtCd = result.district;
            corAddress.subDistrictCd = result.subDistrict;
            corAddress.buildingCsuId = result.buildingCsuId;
            corAddress.isDirty = true;
            corAddress.addressFormat = ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
          } else if (addressTypeCd === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE) {
            this.setState({
              resADIResult: result
            });
            resAddress.room = result.unit;
            resAddress.floor = result.floor;
            resAddress.block = result.block;
            resAddress.building = result.building;
            resAddress.estate = result.estate;
            resAddress.streetNo = result.streetNo;
            resAddress.streetName = result.streetName;
            /*if (districtCdList && districtCdList.district) {
              if (this.state.resADI.lang === 'en_US' && districtCdList.district.find(item => item.engDesc.toUpperCase() === result.district.toUpperCase())) {
                resAddress.districtCd = districtCdList.district.find(item => item.engDesc.toUpperCase() === result.district.toUpperCase()).code;
              } else if (this.state.resADI.lang === 'zh_HK' && districtCdList.district.find(item => item.chiDesc === result.district)) {
                resAddress.districtCd = districtCdList.district.find(item => item.chiDesc === result.district).code;
              }
            }
            if (districtCdList && districtCdList.sub_district) {
              if (this.state.resADI.lang === 'en_US' && districtCdList.sub_district.find(item => item.engDesc.toUpperCase() === result.subDistrict.toUpperCase())) {
                resAddress.subDistrictCd = districtCdList.sub_district.find(item => item.engDesc.toUpperCase() === result.subDistrict.toUpperCase()).code;
              } else if (this.state.resADI.lang === 'zh_HK' && districtCdList.sub_district.find(item => item.chiDesc === result.subDistrict)) {
                resAddress.subDistrictCd = districtCdList.sub_district.find(item => item.chiDesc === result.subDistrict).code;
              }
            }*/
            if (this.state.corADI.lang === 'zh_HK') {
              resAddress.region = result.region;
            } else if (this.state.corADI.lang === 'en_US') {
              let adiRegion = ContactInformationEnum.REGION.find(item => item.code === result.region);
              if (adiRegion && adiRegion.engDesc) {
                resAddress.region = adiRegion.engDesc;
              }
            }
            resAddress.districtCd = result.district;
            resAddress.subDistrictCd = result.subDistrict;
            resAddress.buildingCsuId = result.buildingCsuId;
            resAddress.isDirty = true;
            resAddress.addressFormat = ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
          }
          this.props.updateState({
            addressList: addressList
          });
          if (this.props.contactInfoSaveAbove) {
            this.copyAddressFromCorToRes(this.props.contactInfoSaveAbove);
          }
        }
      },
      () => {
        this.props.closeCommonCircularDialog();
        this.focusADIRoom(addressTypeCd);
      }
    );
  }

  handleChangeAddressFormat = (panelType, e) => {
    let curAddressFormat;
    const value = e.target.value;
    if (panelType === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      this.setState({ corAddressType: value });

    }
    else if (panelType === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE) {
      this.setState({ resAddressType: value });
    }

    switch (value) {
      case ContactInformationEnum.ADDRESS_TYPE.STRUCTURED: {
        curAddressFormat = ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
        break;
      }
      case ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT: {
        curAddressFormat = ContactInformationEnum.ADDRESS_FORMAT.FREE_TEXT_ADDRESS;
        break;
      }
      case ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX: {
        curAddressFormat = ContactInformationEnum.ADDRESS_FORMAT.POSTAL_BOX_ADDRESS;
        break;
      }
      default: {
        curAddressFormat = ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
        break;
      }
    }


    this.handleChangeAddress(curAddressFormat, panelType, 'addressFormat');
  }

  genAddressInputPanel = (panelType, id, curAddressType) => {
    const { patientContactInfo, registerCodeList, comDisabled, addressList, contactInfoSaveAbove, filterSet_c, filterSet_r } = this.props;
    const _regionList = ContactInformationEnum.REGION;
    let checkedSameAsAbove = false;
    // let curAddressType = '';
    if (panelType === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE) {
      id = `${id}_cor`;
    }
    else if (panelType === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE) {
      // curAddressType = this.state.resAddressType;
      id = `${id}_res`;
      checkedSameAsAbove = contactInfoSaveAbove;
    }

    switch (curAddressType) {
      case ContactInformationEnum.ADDRESS_TYPE.STRUCTURED: {
        return (
            <StructuredAddressPanel
                id={id}
                registerCodeList={registerCodeList}
                isDisabled={
                    comDisabled
                        ? true
                        : this.state.corADIResult &&
                          panelType === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE &&
                          !checkedSameAsAbove
                        ? false
                        : this.state.resADIResult &&
                          panelType === Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE &&
                          !checkedSameAsAbove
                        ? false
                        : true
                }
                addressList={addressList}
                addressType={panelType}
                handleChangeAddress={this.handleChangeAddress}
                regionList={_regionList}
                filterSet={panelType === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE ? filterSet_c : filterSet_r}
            />
        );
      }
      case ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT: {
        return (
          <FreeTextAddressPanel
              id={id}
              isDisabled={comDisabled ? true : checkedSameAsAbove}
              addressType={panelType}
              handleChangeAddress={this.handleChangeAddress}
              addressList={addressList}
          />
        );
      }
      case ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX: {
        return (
          <PostalBoxAddressPanel
              id={id}
            // fieldLabel={fieldLabel}
              patientContactInfo={patientContactInfo}
              isDisabled={comDisabled ? true : checkedSameAsAbove}
              postOfficeValidFilter={this.postOfficeValidFilter}
            // handleChangeInfo={this.handleChangeInfo}
              handleChangeAddress={this.handleChangeAddress}
              addressList={addressList}
              addressType={panelType}
          />
        );
      }
      default: {
        return null;
      }
    }
  }

  genAddressFormat = (addressFormat) => {
    switch (addressFormat) {
      case ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS: {
        return ContactInformationEnum.ADDRESS_TYPE.STRUCTURED;
      }
      case ContactInformationEnum.ADDRESS_FORMAT.FREE_TEXT_ADDRESS: {
        return ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT;
      }
      case ContactInformationEnum.ADDRESS_FORMAT.POSTAL_BOX_ADDRESS: {
        return ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX;
      }
      default: {
        return ContactInformationEnum.ADDRESS_TYPE.STRUCTURED;
      }
    }
  }

  filterPhoneList = memoize(phoneList => {
    return phoneList && phoneList.filter(item => item.phonePriority !== 1);
  });

  handleClearConsent=()=>{
    let contactInfo=_.cloneDeep(this.props.patientContactInfo);
    contactInfo.dtsElctrncCommCnsntUpdDtm='';
    contactInfo.dtsElctrncCommCnsntSts='';
    this.props.updateState({patientContactInfo:contactInfo});
  }




  render() {
    const {
      classes, patientContactInfo, comDisabled,
      isLackHKMobile, addressList, phoneList, viewPatDetails,
      countryList, contactInfoSaveAbove, registerCodeList, service, auditAction,
      patientById, clinic, loginForm, patientOperationStatus, openEhsContactTelDialog, updatePatientEhsDto, patientBaseInfo
    } = this.props;
    const cor_address = this.corAddressFilter(addressList);
    const res_address = this.resAddressFilter(addressList);

    const corChiAddress = cor_address ? cor_address.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE : false;
    const resChiAddress = res_address ? res_address.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE : false;

    const cor_addressFormat = this.genAddressFormat(cor_address ? cor_address.addressFormat : ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS);
    const res_addressFormat = this.genAddressFormat(res_address ? res_address.addressFormat : ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS);

    const checkedMeans=patientContactInfo.pmiPatientCommMeanList.filter(item=>item.status==='A' && item.commMeanCd !== 'M');

    let checkedSameAsAbove = contactInfoSaveAbove;

    // const otherPhones = this.filterPhoneList(phoneList);
    const id = 'registration_contactInformation';
    return (
      <Grid container className={classes.root}>
        <Grid container className={classes.grid}>
          <Grid item xs={6}>
          <ContactPhones
              id={id + '_otherPhones'}
              isNeedSMSMobile
              isLackHKMobile={isLackHKMobile}
              comDisabled={comDisabled}
              maxPhoneLength={5}
              phoneCountryList={countryList}
              phoneList={phoneList}
              onChange={this.handleChangeContactInfoPhones}
              showAddRemoveBtn={false}
              showExtPhoneNo
          />

          </Grid>
          <Grid item xs={4}>
            <Grid item container className={classes.paddingRightGrid}>
              <FastTextFieldValidator
                  id={id + '_email'}
                  disabled={comDisabled}
                  inputProps={{ maxLength: 80 }}
                  value={patientContactInfo.emailAddress}
                  onBlur={e => this.handleChangeInfo(e.target.value, 'emailAddress')}
                  // label={<>{fieldLabel.CONTACT_EMAIL}{patientContactInfo.communicationMeansCd.indexOf(Enum.CONTACT_MEAN_EMAIL) > -1 ? <RequiredIcon /> : null}</>}
                  label={<>{fieldLabel.CONTACT_EMAIL}{(checkedMeans.findIndex(item=>item.commMeanCd===Enum.CONTACT_MEAN_EMAIL))>-1?<RequiredIcon />:null}</>}
                  variant="outlined"
                  type="email"
                  // validators={patientContactInfo.communicationMeansCd.indexOf(Enum.CONTACT_MEAN_EMAIL) > -1 ? [ValidatorEnum.required, ValidatorEnum.isEmail] : [ValidatorEnum.isEmail]}
                  // errorMessages={patientContactInfo.communicationMeansCd.indexOf(Enum.CONTACT_MEAN_EMAIL) > -1 ? [CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_EMAILFIELD()] : [CommonMessage.VALIDATION_NOTE_EMAILFIELD()]}
                  validators={(checkedMeans.findIndex(item=>item.commMeanCd===Enum.CONTACT_MEAN_EMAIL))>-1? [ValidatorEnum.required, ValidatorEnum.isEmail] : [ValidatorEnum.isEmail]}
                  errorMessages={(checkedMeans.findIndex(item=>item.commMeanCd===Enum.CONTACT_MEAN_EMAIL))>-1?[CommonMessage.VALIDATION_NOTE_REQUIRED(), CommonMessage.VALIDATION_NOTE_EMAILFIELD()] : [CommonMessage.VALIDATION_NOTE_EMAILFIELD()]}
                  ref="email"
              />
            </Grid>
            <Grid item container className={classes.paddingRightGrid}>
              {/* <Grid item container xs={12}> */}
                {/* <OutlinedCheckBoxValidator
                    id={id + '_contactMean'}
                    labelText="Communication Means"
                    value={patientContactInfo.communicationMeansCd}
                    onChange={(e, cbList) => {
                    let means = '';
                    for (let i = 0; i < cbList.length; i++) {
                      if (cbList[i].checked) {
                        means += cbList[i].value;
                      }
                    }
                    this.handleChangeInfo(means, 'communicationMeansCd');
                  }}
                    list={Enum.CONTACT_MEAN_LIST.map(item => ({ label: item.engDesc, value: item.code, spec: item.spec }))}
                  // FormGroupProps={{ className: classes.radioGroup }}
                    disabled={comDisabled}
                /> */}
                <CommunicationMeans
                    id={id + '_contactMean'}
                    // meansValue={patientContactInfo.pmiPatientCommMeanList}
                    // dtsElctrncCommCnsntSts={patientContactInfo.dtsElctrncCommCnsntSts}
                    meansList={Enum.CONTACT_MEAN_LIST.map(item => ({ label: item.engDesc, value: item.code, spec: item.spec }))}
                    cnsntList={Enum.DTS_CNSNT_STS.map(item=>({label: item.label, value: item.code}))}
                    patientContactInfo={patientContactInfo}
                    // commLangCd={patientContactInfo.commLangCd}
                    // dtsElctrncCommCnsntUpdDtm={patientContactInfo.dtsElctrncCommCnsntUpdDtm}
                    loginSvc={service.svcCd}
                    disabled={comDisabled}
                    handleMeansOnChange={(means)=>this.handleChangeInfo(means, 'pmiPatientCommMeanList')}
                    handleConsetChange={e => this.handleChangeInfo(e.target.value, 'dtsElctrncCommCnsntSts')}
                    clearConsent={this.handleClearConsent}
                    viewPatDetails={viewPatDetails}
                    patientById={patientById}
                    siteId={clinic.siteId}
                    loginForm={loginForm}
                    patientOperationStatus={patientOperationStatus}
                />
              {/* </Grid> */}
            </Grid>
            <Grid item container className={classes.paddingRightGrid}>
              <Grid item container xs={4}>
                <OutlinedRadioValidator
                    id={id + '_languagePreferred'}
                    ref="outlinedRaiodRef"
                    name="languagePreferred"
                    labelText="Communication Language"
                    isRequired={checkedMeans.length>0}
                    value={patientContactInfo.commLangCd}
                    onChange={e => this.handleChangeInfo(e.target.value, 'commLangCd')}
                    list={Enum.LANGUAGE_LIST.map(item => ({ label: item.engDesc, value: item.code }))}
                    validators={checkedMeans.length>0?[ValidatorEnum.required]:[]}
                    errorMessages={checkedMeans.length>0?[CommonMessage.VALIDATION_NOTE_REQUIRED()]:[]}
                  // RadioGroupProps={{ className: classes.radioGroup }}
                    disabled={comDisabled?true:checkedMeans.length===0}
                />
              </Grid>
            </Grid>
             {this.props.service?.svcCd === SERVICE_CODE.EHS && (hasEhsPhn(1) || hasEhsPhn(2) || hasEhsPhn(3) || hasEhsPhn(4)) && (
                        <Grid item xs={12} className={classes.paddingRightGrid}>
                            <CIMSButton
                                style={{ margin: 0, float: 'right' }}
                                onClick={() => openEhsContactTelDialog()}
                                disabled={comDisabled || (!hasEhsPhn(1) && !hasEhsPhn(2) && !hasEhsPhn(3) && !hasEhsPhn(4))}
                            >
                                EHS Contact Tel.
                            </CIMSButton>
                        </Grid>
                    )}
          </Grid>
        </Grid>
        <Grid container className={classes.grid}>
          <Grid item xs={10}>
            <ExpansionPanel
                square
                expanded={this.state.corAddressPanelIsExpanded}
                onChange={(...args) => this.handleExpanChange(...args, Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE)}
            >
              <ExpansionPanelSummary
                  aria-controls="panel1d-content"
                  id={id + 'panel1d-header'}
              >
                <IconButton
                    id={id + '_correspondenceAddress_btn'}
                    className={classes.close_icon}
                    color={'primary'}
                    fontSize="small"
                >
                  {this.state.corAddressPanelIsExpanded ? <Remove /> : <Add />}
                  <b>Correspondence Address</b>
                </IconButton>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <Grid item >
                      <FormControlLabel
                          id={id + '_chineseAddress_radioLabel1'}
                          style={{ textAlign: 'center' }}
                          checked={corChiAddress}
                          onChange={e => this.handleChangeAddress(e, Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, 'addressLanguageCd')}
                          label="Chinese Address"
                          disabled={comDisabled}
                          value={Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE}
                          control={
                          <CIMSCheckBox
                              color="primary"
                              id={id + '_chineseAddress_radio1'}
                              classes={{ root: classes.radioBtn }}
                          />
                        }
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid item style={{ display: cor_addressFormat === ContactInformationEnum.ADDRESS_TYPE.STRUCTURED ? '' : 'none' }}>
                      <CIMSButton
                          id={`${id}_cor_address_lookup_button`}
                          children={'Address Lookup'}
                          style={{ display: viewPatDetails ? 'none' : '' }}
                          classes={{ root: classes.addressLookUpButton }}
                          disabled={comDisabled}
                          onClick={() => {
                            auditAction('Open ADI Dialog in the contact information section', null, null, false, 'patient');
                          this.props.openCommonCircularDialog();
                          this.onClickSearchBtn(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, registerCodeList);
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      {/* <FormLabel component="legend" className={classes.formLabel}>Calendar View</FormLabel> */}
                      <RadioGroup
                          id={`${id}_cor_address_type_radio_group`}
                          aria-label={'Address Type'}
                          name={'addressType'}
                          row
                          value={cor_addressFormat}
                          onChange={(e) => this.handleChangeAddressFormat(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, e)}

                      >
                        <FormControlLabel
                            id={`${id}_cor_${ContactInformationEnum.ADDRESS_TYPE.STRUCTURED.toUpperCase()}_radio`}
                            className={classes.addressTypeLabel}
                            value={ContactInformationEnum.ADDRESS_TYPE.STRUCTURED}
                            control={<Radio style={{ padding: 4 }} color={'primary'} />}
                            label={ContactInformationEnum.ADDRESS_TYPE.STRUCTURED}
                            disabled={comDisabled}
                        />
                        <FormControlLabel
                            id={`${id}_cor_${ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT.replace(' ', '_').toUpperCase()}_radio`}
                            className={classes.addressTypeLabel}
                            value={ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT}
                            control={<Radio style={{ padding: 4 }} color={'primary'} />}
                            label={ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT}
                            disabled={comDisabled}
                        />
                        <FormControlLabel
                            id={`${id}_cor_${ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX.replace(' ', '_').toUpperCase()}_radio`}
                            className={classes.addressTypeLabel}
                            value={ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX}
                            control={<Radio style={{ padding: 4 }} color={'primary'} />}
                            label={ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX}
                            disabled={comDisabled}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  {
                    this.genAddressInputPanel(Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, id, cor_addressFormat)
                  }
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel
                square
                expanded={this.state.resAddressPanelIsExpanded}
                onChange={(...args) => this.handleExpanChange(...args, Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE)}
            >
              <ExpansionPanelSummary
                  aria-controls="panel2d-content"
                  id={id + 'panel2d-header'}
              >
                <IconButton
                    id={id + '_residentialAddress_btn'}
                    className={classes.close_icon}
                    color={'primary'}
                    fontSize="small"
                >
                  {this.state.resAddressPanelIsExpanded ? <Remove /> : <Add />}
                  <b>Residential Address</b>
                </IconButton>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails className={classes.expansionPanelDetails}>
                <Grid container spacing={1}>
                  <Grid container item xs={4}>

                    <Grid item xs={6}>
                      <FormControlLabel
                          id={id + '_chineseAddress_radioLabel2'}
                          disabled={comDisabled ? true : checkedSameAsAbove}
                          label="Chinese Address"
                          checked={resChiAddress}
                          value={Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE}
                          onChange={e => this.handleChangeAddress(e, Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE, 'addressLanguageCd')}
                          control={
                          <CIMSCheckBox color="primary"
                              id={id + '_chineseAddress_radio2'}
                              classes={{ root: classes.radioBtn }}
                          />
                        }
                      />
                    </Grid>
                    <Grid item xs={6} >
                      <FormControlLabel
                          id={id + '_sameAsAbove_radioLabel'}
                          disabled={comDisabled}
                          label="Same As Above"
                          checked={this.props.contactInfoSaveAbove}
                          onChange={(...arg) => this.handleSameAsAboveCheckChange(...arg)}
                          control={
                          <CIMSCheckBox
                              color="primary"
                              id={id + '_saveAsAbove_radio'}
                              classes={{ root: classes.radioBtn }}
                          />
                        }
                      />
                    </Grid>

                  </Grid>
                  <Grid item xs={4} container spacing={1}>
                    <Grid item style={{ display: res_addressFormat === ContactInformationEnum.ADDRESS_TYPE.STRUCTURED ? '' : 'none' }} xs>
                      <CIMSButton
                          id={`${id}_res_address_lookup_button`}
                          children={'Address Lookup'}
                          style={{ display: viewPatDetails ? 'none' : '' }}
                          classes={{ root: classes.addressLookUpButton }}
                          disabled={comDisabled ? true : checkedSameAsAbove}
                          onClick={() => {
                          this.props.openCommonCircularDialog();
                          this.onClickSearchBtn(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE, registerCodeList);
                        }}
                      />
                    </Grid>
                    {this.props.service?.svcCd === SERVICE_CODE.EHS && (
                      <Grid item xs>
                        <FormControlLabel
                            id={id + '_isNearEhc_checkboxLabel'}
                            style={{ textAlign: 'center' }}
                            onChange={(e) => {
                                console.log('isNearEhc: ', e.target.checked);
                                updatePatientEhsDto({ isNearEhc: e.target.checked ? Enum.COMMON_YES : Enum.COMMON_NO });
                            }}
                            label="Near EHC?"
                            disabled={comDisabled || patientBaseInfo.isApplyEhs}
                            checked={this.props.patientEhsDto?.isNearEhc === 1}
                            control={<CIMSCheckBox color="primary" id={id + '_isNearEhc_checkbox'} classes={{ root: classes.radioBtn }} />}
                        />
                      </Grid>
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      {/* <FormLabel component="legend" className={classes.formLabel}>Calendar View</FormLabel> */}
                      <RadioGroup
                          id={`${id}_res_address_type_radio_group`}
                          aria-label={'Address Type'}
                          name={'addressType'}
                          row
                          value={res_addressFormat}
                          onChange={(e) => this.handleChangeAddressFormat(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE, e)}
                      >
                        <FormControlLabel
                            id={`${id}_res_${ContactInformationEnum.ADDRESS_TYPE.STRUCTURED.toUpperCase()}_radio`}
                            className={classes.addressTypeLabel}
                            value={ContactInformationEnum.ADDRESS_TYPE.STRUCTURED}
                            control={<Radio style={{ padding: 4 }} color={'primary'} />}
                            label={ContactInformationEnum.ADDRESS_TYPE.STRUCTURED}
                            disabled={comDisabled ? true : checkedSameAsAbove}
                        />
                        <FormControlLabel
                            id={`${id}_res_${ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT.replace(' ', '_').toUpperCase()}_radio`}
                            className={classes.addressTypeLabel}
                            value={ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT}
                            control={<Radio style={{ padding: 4 }} color={'primary'} />}
                            label={ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT}
                            disabled={comDisabled ? true : checkedSameAsAbove}
                        />
                        <FormControlLabel
                            id={`${id}_res_${ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX.replace(' ', '_').toUpperCase()}_radio`}
                            className={classes.addressTypeLabel}
                            value={ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX}
                            control={<Radio style={{ padding: 4 }} color={'primary'} />}
                            label={ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX}
                            disabled={comDisabled ? true : checkedSameAsAbove}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  {
                    this.genAddressInputPanel(Enum.PATIENT_RESIDENTIAL_ADDRESS_TYPE, id, res_addressFormat)
                  }
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>

          </Grid>
        </Grid >
      </Grid >
    );
  }
}

const style = () => ({
  root: {
    paddingTop: 10
  },
  grid: {
    justifyContent: 'center'
  },
  paddingRightGrid: {
    paddingBottom: 10
  },
  close_icon: {
    padding: 0,
    marginRight: 10,
    borderRadius: '0%'
  },
  add_icon: {
    verticalAlign: 'bottom'
  },
  expansionPanel: {
    width: '100%'
  },
  expansionPanelDetails: {
    padding: '0px 8px 8px'
  },
  radioGroup: {
    justifyContent: 'flex-end'
  },
  addressTypeLabel: {
    marginRight: 50
  },
  addressLookUpButton: {
    margin: 0,
    width: 190
  }
});
function mapStateToProps(state) {
  return {
    registerCodeList: state.registration.codeList,
    contactInfoSaveAbove: state.registration.contactInfoSaveAbove,
    patientById: state.registration.patientById,
    phoneList: state.registration.phoneList,
    addressList: state.registration.addressList,
    patientContactInfo: state.registration.patientContactInfo,
    countryList: state.patient.countryList || [],
    corDistrictList: state.registration.corDistrictList,
    corSubDistrictList: state.registration.corSubDistrictList,
    resDistrictList: state.registration.resDistrictList,
    resSubDistrictList: state.registration.resSubDistrictList,
    filterSet: state.registration.filterSet,
    clinicConfig: state.common.clinicConfig,
    filterSet_c: state.registration.filterSet_c,
    filterSet_r: state.registration.filterSet_r,
    service:state.login.service,
    viewPatDetails: state.registration.viewPatDetails,
    patientEhsDto: state.registration.patientBaseInfo.patientEhsDto,
    clinic: state.login.clinic,
    loginForm: state.login.loginForm,
    patientOperationStatus: state.registration.patientOperationStatus,
    patientBaseInfo: state.registration.patientBaseInfo
  };
}
const dispatchProps = {
  updateState,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  auditAction,
  updatePatientEhsDto
};
export default connect(mapStateToProps, dispatchProps)(withStyles(style)(ContactInformation));
