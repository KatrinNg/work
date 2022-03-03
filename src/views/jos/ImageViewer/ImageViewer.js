import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withStyles, Grid } from '@material-ui/core';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import TextInputBox from './components/TextInputBox/TextInputBox';
import CheckBox from './components/CheckBox/CheckBox';
import { getRadEaxamData, getRadorderByModalityTypes, saveRadExamData } from '../../../store/actions/imageViewer/imageViewerAction';
import _ from 'lodash';
import { Base64 } from 'js-base64';
import accessRightEnum from '../../../enums/accessRightEnum';
import styles from './ImageViewerStyle';

const theme = createMuiTheme({
    overrides: {
        MuiCheckbox: {
            colorPrimary: {
                '&$disabled': {
                    color: 'white'
                }
            }
        },
        MuiFormControlLabel: {
            label: {
                '&$disabled': {
                    color: 'white',
                    marginLeft:5
                }
            }
        }
    }
});
class ImageViewer extends React.Component {
    constructor(props) {
        super(props);
        this.navRef = React.createRef();
        this.state = {
            checkedState: true,
            valMap: [],
            type: 'ImageViewer',
            ImageViewerUrl: '',
            patientInfo: {},
            loginInfo: {},
            contentHeight: 0,
            params:null
        };
    }
    UNSAFE_componentWillMount(){
        this.loadingData();
    }
    componentDidMount() {
        this.resetHeight();
        window.addEventListener('resize', this.resetHeight);
    }
    componentWillUnmount() {
        window.sessionStorage.removeItem('patientInfo');
        window.removeEventListener('resize', this.resetHeight);
    }
    resetHeight = _.debounce(() => {
        let screenHeight = document.documentElement.clientHeight;
        if (screenHeight > 0 && this.navRef && this.navRef.clientHeight) {
            let contentHeight = screenHeight - this.navRef.clientHeight-20;
            this.setState({ contentHeight });
        }
    }, 500)

    loadingData = () => {
        let { type } = this.state;
        let valMap = new Map();
        let data = new Map();
        data.set(20211102, { ToeHRSS: true, textField: '' });
        valMap.set(type, data);
        let userStr = window.sessionStorage.getItem('userInfo');
        let loginStr = window.sessionStorage.getItem('userLoginInfo');
        let userRes = _.trim(userStr.split('JOS')[0], '\"');//这步很关键，因为如果这步没有做就好无法解码，JOS字符串分割真正的编码与假编码（jos后的都是假编码）
        let loginRes = _.trim(loginStr.split('JOS')[0], '\"');//这步很关键，因为如果这步没有做就好无法解码，JOS字符串分割真正的编码与假编码（jos后的都是假编码）
        userRes = Base64.decode(userRes);
        loginRes = Base64.decode(loginRes);
        let user = userRes && JSON.parse(userRes);
        let login = loginRes && JSON.parse(loginRes);
        this.setState({ valMap,params:user[1],patientInfo: user ? user[0] : '', loginInfo: login.accessRights ? login : '' });
        this.props.getRadorderByModalityTypes({
            params: user[1],
            callback: (data) => {
                this.setState({ ImageViewerUrl: data });
            }
        });
    }
    handleChangeChecked = (event) => {
        this.setState({ [event.target.name]: event.target.checked });
    };
    updateState = obj => {
        this.setState({
            ...obj
        });
    }
    changeEditFlag = () => {
        this.setState({ isEdit: true });
    }
    validateValMap=()=>{
        let { valMap } = this.state;
        let flag = true;
        let tempDocItemsMap = valMap;
        if (tempDocItemsMap.size > 0) {
            for (let valObj of tempDocItemsMap.values()) {
                if (valObj.itemValErrorFlag) {
                    flag = false;
                    break;
                }
            }
        }
        if (flag) {
            this.setState({ valMap });
        }
        return flag;
    }
    handleSave = () => {
        let { type, valMap } = this.state;
        if (valMap.get(type) && valMap.get(type).has(20211102) && this.validateValMap()) {
            // let res = valMap.get(type).get(20211102);
            let res={
                accessionNumber: 'string',
                clinicCd: 'string',
                createBy: 'string',
                createDtm: {
                  date: 0,
                  day: 0,
                  hours: 0,
                  minutes: 0,
                  month: 0,
                  nanos: 0,
                  seconds: 0,
                  time: 0,
                  timezoneOffset: 0,
                  year: 0
                },
                encntrId: 0,
                examDtm: {
                  date: 0,
                  day: 0,
                  hours: 0,
                  minutes: 0,
                  month: 0,
                  nanos: 0,
                  seconds: 0,
                  time: 0,
                  timezoneOffset: 0,
                  year: 0
                },
                examId: 0,
                examName: 'string',
                modalityCode: 'string',
                patientKey: 0,
                performingSiteCd: 'string',
                performingStaffChiName: 'string',
                performingStaffEngName: 'string',
                performingStaffTypeCd: 'string',
                referringNumber: 'string',
                remarks: 'string',
                reportByChi: 'string',
                reportByEng: 'string',
                reportDate: 'string',
                reportPdfPath: 'string',
                reportText: 'string',
                reportTitle: 'string',
                requestHciId: 'string',
                requestHciIdLongName: 'string',
                requestHciLocalName: 'string',
                seriesCount: 0,
                statusInd: 0,
                studyStatusInd: 0,
                studyUid: 'string',
                svcCd: 'string',
                toEhrssInd: 0,
                updateBy: 'string',
                updateDtm: {
                  date: 0,
                  day: 0,
                  hours: 0,
                  minutes: 0,
                  month: 0,
                  nanos: 0,
                  seconds: 0,
                  time: 0,
                  timezoneOffset: 0,
                  year: 0
                },
                version: {
                  date: 0,
                  day: 0,
                  hours: 0,
                  minutes: 0,
                  month: 0,
                  nanos: 0,
                  seconds: 0,
                  time: 0,
                  timezoneOffset: 0,
                  year: 0
                }
            };
            this.props.saveRadExamData({
                params:res,
                callback:(data)=>{
                    this.setState({valMap:[]});
                }
            });
        };
    }
    render() {
        let { valMap, type, ImageViewerUrl, patientInfo, loginInfo, contentHeight, params } = this.state;
        let { classes } = this.props;
        let item = valMap.size > 0 ? valMap.get(type).get(20211102) : {};
        let flag = loginInfo.accessRights && loginInfo.accessRights.find(item => item.name === accessRightEnum.imageViewerAllowEdit) ? true : false;
        let isDTS=loginInfo.service?(loginInfo.service.serviceCd==='DTS'&&params.studyUids.length<1?true:false):false;//==DTS show but disabled
        let allowEdit = flag&&isDTS ? false : true;
        let commonProps = {
            itemId: 20211102,
            updateState: this.updateState,
            valMap,
            type,
            changeEditFlag: this.changeEditFlag,
            encounterExistFlag: this.encounterExistFlag
        };
        let checkBoxProps = {
            val: item.ToeHRSS,
            attrName: 'ToeHRSS',
            disabledFlag: allowEdit ? true : false,
            options: [{ label: '  To eHRSS', value: 'Y' }],
            formControlLabelStyle: {
                color: '#fff'
            },
            ...commonProps
        };
        let textFieldProps = {
            val: item.textField,
            attrName: 'textField',
            maxLength: 100,
            disabledFlag: allowEdit ? true : false,
            ...commonProps
        };
        return (
            <div>
                <Grid container>
                    <Grid
                        ref={(ref) => { this.navRef = ref; }}
                        item
                        xs={12}
                        container
                        className={classes.josColor}
                        style={{ margin: 0, display: 'flex', alignItems: 'center' }}
                    >
                        <Grid className={classes.josNavLeft} item xs >
                            <Grid style={{ display: 'flex', alignItems: 'center' }} className={classes.josName}>
                                <Grid>Name:&nbsp;</Grid><span className={classes.textProcessing}>{patientInfo.engSurname ? `${patientInfo.engSurname},${patientInfo.engGivename}` : ''}</span>
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center' }} className={classes.josHKIC}>
                                <Grid>HKIC:&nbsp;</Grid><span className={classes.textProcessing}>{patientInfo.primaryDocNo ? patientInfo.primaryDocNo : ''}</span>
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center' }} className={classes.josDOB}>
                                <Grid>DOB:&nbsp;</Grid><span className={classes.textProcessing}>{patientInfo.dob ? patientInfo.dob : ''}</span>
                            </Grid>
                            <Grid style={{ display: 'flex', alignItems: 'center' }} className={classes.josAge}>
                                <Grid>Age:&nbsp;</Grid><span className={classes.textProcessing}>{patientInfo.age && patientInfo.ageUnit ? (`${patientInfo.age}${patientInfo.ageUnit[0]}`) : ''}</span>
                            </Grid >
                            <Grid style={{ display: 'flex', alignItems: 'center' }} className={classes.josSex}>
                                <Grid>Sex:&nbsp;</Grid><span className={classes.textProcessing}>{patientInfo.genderCd ? patientInfo.genderCd : ''}</span>
                            </Grid>
                        </Grid>
                        <Grid
                            item
                            xs
                            className={classes.josNavRight}
                            style={{ flex: 1 }}
                        >
                            <Grid style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Grid>
                                    <MuiThemeProvider theme={theme}>
                                        <CheckBox {...checkBoxProps} />
                                    </MuiThemeProvider>
                                </Grid>
                                <Grid className={classes.josRemarksView} style={{ display: 'flex', alignItems: 'center' }}>
                                    <Grid>Remarks/View(s):&nbsp;</Grid>
                                    <TextInputBox {...textFieldProps} />
                                </Grid>
                            </Grid>
                            <Grid className={classes.saveBtn}>
                                <CIMSButton
                                    id="saveButton"
                                    onClick={this.handleSave}
                                    disabled={allowEdit ? true : false}
                                >
                                    Save
                                </CIMSButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        className={classes.outlinIframe}
                    >
                        <iframe
                            className={classes.iframe}
                            style={{ height: contentHeight ? contentHeight : 865 }}
                            src={ImageViewerUrl.url}
                            name="imageViewer"
                            frameBorder="0"
                            scrolling="auto"
                        ></iframe>
                    </Grid>
                </Grid>
            </div>
        );
    }
}
const mapStateToProps = (state) => ({
    // ant: state.ant,
    // globalEventDistributor: state.common.globalEventDistributor,
    // login: state.common.globalEventDistributor.parentStore.getState().login,
    // patient: state.common.globalEventDistributor.parentStore.getState().patient,
    patientInfo: state
    // encounterInfo: state.common.globalEventDistributor.parentStore.getState().patient.encounterInfo,
    // service: state.common.globalEventDistributor.parentStore.getState().login.service,
    // clinic: state.common.globalEventDistributor.parentStore.getState().login.clinic
    // serviceCd: state.login.service.serviceCd,
});

const mapDispatchToProps = {
    getRadEaxamData,
    getRadorderByModalityTypes,
    saveRadExamData
    // openCommonCircularDialog,
    // closeCommonCircularDialog
};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ImageViewer)));