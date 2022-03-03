import * as upmType from '../../../actions/administration/unavailablePeriodManagement/upmActionType';
import _ from 'lodash';

const INSTAL_STATE = {
    upmList: [],
    upmSiteId: '',
    dialogOpen: false,
    publicDialogOpen: false,
    dialogName: '',
    publicDialogName: '',
    currentSelectedId: '',
    currentSelectedIsWholeClinic: null,
    currentSelectedSvcCd: null,
    currentSelectedSiteId: null,
    isAssignRoom: false,
    autofocus: false,
    dialogInfo: {
        dialogSiteId: '',
        dialogIsWholeService: 0,
        dialogIsWholeClinic: 0,
        dialogIsWholeDay: 0,
        dialogAssginedRoomList: [],
        dialogStartDate: null,
        dialogEndDate: null,
        dialogStartTime: null,
        dialogEndTime: null,
        dialogReason: '',
        dialogRemark: '',
        status: '',
        version: ''
    },
    publicDialogInfo: {
        publicDialogDate: null,
        publicDialogRemark: '',
        publicDialogRemarkCN: '',
        status: '',
        version: ''
    },
    isFinishLoadUpmList: false,
    unavailableReasons: [],
    upmFromDate: null,
    upmToDate: null,
    dateRangeLimit:365
};

export default (state = INSTAL_STATE, action = {}) => {
    switch (action.type) {
        case upmType.RESET_ALL: {
            return { ...INSTAL_STATE };
        }
        case upmType.RESET_DIALOGINFO: {
            let dialogInfo = {
                dialogSiteId: '',
                dialogIsWholeService: 0,
                dialogIsWholeClinic: 0,
                dialogIsWholeDay: 0,
                dialogAssginedRoom: null,
                dialogStartDate: null,
                dialogEndDate: null,
                dialogStartTime: null,
                dialogEndTime: null,
                dialogReason: '',
                dialogRemark: ''
            };
            let publicDialogInfo = {
                serviceCd: null,
                publicDialogDate: null,
                publicDialogRemark: '',
                publicDialogRemarkCN: ''
            };
            return { ...state, dialogInfo: dialogInfo, publicDialogInfo: publicDialogInfo };
        }
        case upmType.UPDATE_STATE: {
            return { ...state, ...action.updateData };
        }
        case upmType.PUT_UPMLIST: {
            return { ...state, upmList: _.cloneDeep(action.data), isFinishLoadUpmList: true };
        }
        case upmType.PUT_UNAVAILABLEREASONS: {
            return { ...state, unavailableReasons: _.cloneDeep(action.data) };
        }
        default: return state;
    }
};