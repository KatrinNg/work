import moment from 'moment';
import Enum from '../../enums/enum';

export const initUserData = {
  chiFullName: '',
  contactPhone: '',
  email: '',
  engGivenName: '',
  engSurname: '',
  genderCd: '',
  loginName: '',
  password: '',
  position: '',
  salutation: '',
  status: Enum.COMMON_STATUS_PENDING,
  supervisor: '',
  userExpiryDate: moment().add(10, 'years'),
  efftDate: moment(),
  userId: 0,
  ehruId: '',
  ecsUserId: '',
  doctorCd: '',
  isAdmin: 0,
  passCode:'',
  rePassCode:'',
  isPassCodeShow: true,
  sha256Passcode:'',
  version: ''
};

export const initService = {
  svcCd: '',
  isAdmin: 0,
  createBy: '',
  createDtm: '',
  updateBy: '',
  updateDtm: ''
};

export const initSite = {
  siteId: '',
  isAdmin: 0,
  efftDate: null,
  expyDate: null,
  isPri: 0,
  createBy: '',
  createDtm: '',
  updateBy: '',
  updateDtm: ''
};

export const initEnctType = {
  encntrTypeId: 0,
  encntrTypeCd: '',
  encntrTypeDesc: '',
  apptInterval: 0,
  apptIntervalUnit: '',
  ttlAppt: 0,
  minInterval: 0,
  minIntervalUnit: '',
  maxTmslt: 0,
  drtn: 0,
  isCharge: 0,
  isInternet: 0,
  efftDate: null,
  expyDate: null,
  status: '',
  version: null,
  isEhr: 0,
  isEhrClc: 0,
  apptRmndDay: 0,
  svcCd: '',
  siteId: 0,
  createBy: '',
  createDtm: null,
  updateBy: '',
  updateDtm: null,
  existCode: ''
};

export const initRoom = {
  encntrTypeList: [],
  isExactMatchTmsltSrch: null,
  isPhys: null,
  isRfr: null,
  phn: null,
  phnExt: null,
  remark: null,
  rmCd: '',
  rmDesc: '',
  rmDescVds: null,
  rmId: 0,
  rmType: null,
  siteEngName: '',
  siteId: 0,
  sspecId: null,
  status: 'A',
  version: '',
  efftDate:moment(),
  expyDate:null
};