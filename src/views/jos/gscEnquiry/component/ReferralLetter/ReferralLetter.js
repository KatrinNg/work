import React, {Component} from 'react';
import {
    withStyles,
    Typography,
    Grid
} from '@material-ui/core';
import {connect} from 'react-redux';
import classNames from 'classnames';
import styles from './ReferralLetterStyle';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import {openCommonMessage, closeCommonMessage} from '../../../../../store/actions/message/messageAction';
import {openCommonCircularDialog, closeCommonCircularDialog,print} from '../../../../../store/actions/common/commonAction';
import {
    getGscReferralLetter, getScReferralLetterPrintData, saveGscReferralLetter
} from '../../../../../store/actions/gscEnquiry/gscEnquiryAction';
import CellSelect from './component/Cellselect/CellSelect';
import CellInput from './component/CellInput/CellInput';
import DatePicker from './component/DatePicker/DatePicker';
import logoImg from '../../../../../images/logo.png';
import isoImg from '../../../../../images/iso.png';
import {cloneDeep} from 'lodash/lang';
import {COMMON_CODE} from '../../../../../constants/message/common/commonCode';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../../utilities/josCommonUtilties';
import moment from 'moment';
import {JosCommonUtil} from '../../../../../utilities';
import {getPatientById} from '../../../../../utilities/dtsUtilities';
import {getGenderCd, getDobByDate} from '../../../../../utilities/josCommonUtilties';

class ReferralLetter extends Component {
    constructor(props) {
        super(props);
        this.wrapRef = React.createRef();
        this.state = {
            isEdit: false,
            formData: {
                docItemList: [],
                hospitalList: [],
                resultTable: [],
                motherId: '',
                ourRefNo: '',
                gestation: ''
            },
            historyData:{},
            patientData:{},
            normalReference: `(Normal reference: Cord blood TSH≤14.29mIU/L, Cord blood FT4 10.25-16.32pmol/L; 
                < 1 month: Serum TSH≤10.39mIU/L, Serum FT4 15.45-31.33pmol/L;
                >1 month: Serum TSH 0.34-5.6 mIU/L, Serum FT4 7.86-14.41pmol/L)`,
            isDisable: false
        };
    }

    componentDidMount() {
        this.initData(this.props);
        let  patientKey = this.props.referralLetterData.clinicalParams.cgsNeonatalDocDto.patientKey;
        console.log(patientKey);
        getPatientById(patientKey).then((res)=>{
            if (res.length){
                this.setState({
                    patientData: res[0]
                });
            }
        });
        this.insertReferralLetterLog('Action: Open Referral Letter', '');
    }

    // UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    //     console.log('nextProps-',nextProps,this.props);
    //     if (nextProps.open !== this.props.open) {
    //         this.initData(nextProps);
    //     }
    // }

    componentWillUnmount() {}

    initData = (props,callBack) => {
        console.log('init data nextProps',props);
        const {normalReference} = this.state;
        let resData = props.referralLetterData.resData;
        let referenceObj = resData.docItemList.find(i=>i.formItemId === 2097);
        let docItemList = resData.docItemList;
        let formData = cloneDeep(resData);
        // 设置 默认normal Reference
        if (referenceObj){
            docItemList = docItemList.map(item=>{
                if (item.formItemId === 2097 && item.itemVal === ''){
                    item.itemVal = normalReference;
                }
                return item;
            });
            formData.docItemList = docItemList;
        }else {
            formData.docItemList.push({
                formItemId: 2097,
                itemVal: normalReference,
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT
            });
        }
        // 判断 formItemId = 2099 itemVal = RC 设置为不可编辑，隐藏save按钮
        let rcItemObj = this.getRcStatus(formData.docItemList);
        let isRcStatus = false;
        if (rcItemObj &&  rcItemObj.itemVal === 'RC'){
            isRcStatus = true;
        }
        this.setState({
            historyData: resData,
            formData: formData,
            isEdit: false,
            isDisable: isRcStatus
        },()=>{
            callBack && callBack();
        });
    }

    getRcStatus(list){
        return list.find(i=>i.formItemId === 2113);
    }

    checkParams () {
        let flag = true;
        if(this.getFormItemId(2110) === 'Invalid date'){
            this.showCommonError('Date Invalid Date');
            flag = false;
        }
        return flag;
    }
    showCommonError(text){
        this.props.openCommonMessage({
            msgCode: COMMON_CODE.COMMON_ERROR,
            params: [
                {
                    name: 'MSG',
                    value: text
                }
            ]
        });
    }
    setItemOperationType(docItemList,historyDocItemList){
        return docItemList ? docItemList.map(item=>{
            let isEmpty = item.itemVal === '';
            // 不等于空字符串
            if (!isEmpty){
                // 是否存在历史数据,或者有 version
                if (this.hasItemId(historyDocItemList,item.formItemId) || item.version){
                    item.opType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
                }else {
                    item.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
                }
            }else {
                item.opType = commonConstants.COMMON_ACTION_TYPE.DELETE;
            }
            return item;
        }) : [];
    }
    getEditItems(docItemList,historyDocItemList){
        let list = [];
        if (docItemList && docItemList.length){
            docItemList.forEach(item=>{
                let isHas =  this.hasItemId(historyDocItemList,item.formItemId);
                let isEq =  this.isEqItemVal(historyDocItemList,item);
                // 存在 && 相等  || 不存在 不等于空
                console.log('编辑items-',item.formItemId,isHas,isEq);
                if ((isHas && !isEq) || (!isHas && item.itemVal !=='')){
                    list.push(item);
                }
            });
        }
        return list;
    }

    handleSave = (callBack) => {
        const {formData,historyData} = this.state;
        const {referralLetterData} = this.props;
        const {clinicalParams} = referralLetterData;
        const {cgsNeonatalDocDto} = clinicalParams;
        const {doc} = historyData;
        const docId = cgsNeonatalDocDto?.docId;
        const formId = cgsNeonatalDocDto?.formId;
        const version = doc?.version;
        let params = {
            patientKey:cgsNeonatalDocDto?.patientKey,
            docId,
            formId,
            version,
            opType: commonConstants.COMMON_ACTION_TYPE.UPDATE
        };
        params.docItems = this.setItemOperationType(formData.docItemList, historyData.docItemList);
        params.docItems = this.getEditItems(params.docItems,historyData.docItemList);
        let rcStatusObj = this.getRcStatus(params.docItems);
        if (!rcStatusObj){
            params.docItems.push({
                formItemId: 2113,
                itemVal: 'RC',
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT
            });
        }else if(rcStatusObj.itemVal !== 'RC') {
            params.docItems.map(item=>{
                if (item.formItemId === 2113){
                    item.itemVal = 'RC';
                }
                return item;
            });
        }
        let nameObj = params.docItems.find(i=>i.formItemId === 2099);
        if (nameObj){
            params.docItems.map(item=>{
                if (item.formItemId === 2099 && item.itemVal !== this.getFormItemId(2099)){
                    item.itemVal = this.getLoginName();
                    item.opType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
                }
                return item;
            });
        }else {
            params.docItems.push({
                formItemId:2099,
                itemVal:this.getLoginName(),
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT
            });
        }

        if (!this.checkParams()){
            return;
        }

        this.props.openCommonCircularDialog();
        this.props.saveGscReferralLetter({
            params: params,
            callback: (res)=>{
                if (res.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    let payload = {
                        msgCode: res.msgCode,
                        btnActions: {
                            btn1Click: () => {
                                let params = this.props.referralLetterData.clinicalParams;
                                this.props.showReferralLetterDialog(params,(referralLetterData)=>{
                                    let newProps = {...this.props,referralLetterData: referralLetterData};
                                    this.initData(newProps,()=>{
                                        this.props.closeCommonCircularDialog();
                                    });
                                });
                            },
                            btn2Click: () => {
                                this.props.closeCommonCircularDialog();
                            }
                        }
                    };
                    this.props.openCommonMessage(payload);
                    return;
                }
                if (res.respCode === 0) {
                    this.props.openCommonMessage({msgCode: res.msgCode, showSnackbar: true});
                }
                if (callBack){
                    callBack(res);
                }else {
                    this.props.closeCommonCircularDialog();
                }
            }
        });
        this.insertReferralLetterLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, '/cgs-consultation/gscReferralLetter/');
    }
    setIsEdit(flag = true){
        this.setState({
            isEdit: flag
        });
    }
    closeReferralLetter(){
        this.props.onCloseReferralLetter && this.props.onCloseReferralLetter();
        this.props.closeCommonCircularDialog();
    }

    handlePrint = (propsParams) => {
        const {referralLetterData} = propsParams ? propsParams : this.props;
        const {docId='',patientKey=''} = referralLetterData.clinicalParams.cgsNeonatalDocDto;
        const {isEdit} = this.state;
        if (isEdit){
            this.props.openCommonMessage({
                msgCode: COMMON_CODE.NO_SAVE_PRINT_WARING,
                btn1AutoClose: false,
                params: [
                    {
                        name: 'FUNC',
                        value: 'Referral Letter'
                    }
                ],
                btnActions: {
                    btn1Click: () => {
                        // Save
                        let params = this.props.referralLetterData.clinicalParams;
                        let propsData = this.props;
                        this.handleSave((res)=>{
                            if (res.respCode === 0){
                                this.props.showReferralLetterDialog(params,(referralLetterData)=>{
                                    let newProps = {...propsData,referralLetterData: referralLetterData};
                                    this.initData(newProps,()=>{
                                        this.handlePrint(newProps);
                                    });
                                });
                            }
                        });
                    },
                    btn2Click: () => {
                        let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'GSC Enquiry');
                        this.insertReferralLetterLog(name, '');
                    }
                }
            });
            return;
        }
        let printParams = {
            clcCgsNeonatalDocId: docId,
            // patientDto: commonUtils.reportGeneratePatientDto(patientInfo, caseNoInfo, common.commonCodeList.doc_type),
            patientKey
        };
        this.props.openCommonCircularDialog();
        this.props.getScReferralLetterPrintData(
        {
            params:printParams,
            callback:(res)=>{
                if (res.respCode === 0){
                    this.printFn(res.data.reportData);
                }else {
                    this.props.closeCommonCircularDialog();
                }
            }
        });
        this.insertReferralLetterLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Print' button`, '/cgs-consultation/gscReferralLetter/print');
    }

    printFn = (previewData,callBack) => {
        this.props.print({
            base64: previewData,
            callback: result => {
                if (result) {
                    let payload = {
                        msgCode: '101317',
                        showSnackbar: true,
                        params: [
                            {name: 'reportType', value: 'report'}
                        ]
                    };
                    this.props.openCommonMessage(payload);
                } else {
                    this.props.openCommonMessage({
                        msgCode: '110041'
                    });
                }
                this.props.closeCommonCircularDialog();
                callBack && callBack();
            }
        });
    };

    handleExit = () => {
        if (this.state.isEdit) {
            this.props.openCommonMessage({
                msgCode: COMMON_CODE.SAVE_WARING,
                params: [{ name: 'title', value: 'Referral Letter' }],
                btnActions: {
                    btn1Click: () => {
                        // Save
                        this.handleSave(()=>{
                            this.closeReferralLetter();
                        });
                    },
                    btn2Click: () => {
                        // Discard
                        let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'GSC Enquiry');
                        this.insertReferralLetterLog(name, '');
                        this.closeReferralLetter();
                    },
                    btn3Click: () => {
                        let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'GSC Enquiry');
                        this.insertReferralLetterLog(name, '');
                    }
                }
            });
        } else {
            this.closeReferralLetter();
        }
        this.insertReferralLetterLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Exit' button`, '');
    }
    handleChangeInput = (e, id) => {
        let val = e.target.value;
        let nodeName = e.target && e.target.nodeName;
        if (['INPUT','TEXTAREA'].indexOf(nodeName) !==-1){
            val = JosCommonUtil.cutOutString(val, 1000);
        }
        this.setFormItemId(id,val);
        this.setIsEdit();
    }
    handleChangeDate = (val,id) => {
        this.setFormItemId(id,val ? moment(val).format('DD-MM-YYYY') : '');
        this.setIsEdit();

    }
    hasItemId(items,id) {
        return !!(items && items.find(item => item.formItemId === id));
    }
    isEqItemVal(historyItems,item) {
        if (historyItems && historyItems.length){
            let itemObj = historyItems.find(i=>i.formItemId ===item.formItemId);
            return (itemObj && (itemObj.itemVal === item.itemVal));
        }
        return false;
    }
    getFormItemId(id){
        const {formData} = this.state;
        let isFormItemId = formData.docItemList && formData.docItemList.length;
        return isFormItemId ? formData.docItemList.find(i => i.formItemId === id)?.itemVal : '';
    }
    setFormItemId(id,val){
        let {formData}= this.state;
        let isHas = this.hasItemId(formData.docItemList,id);
        let items = cloneDeep(formData.docItemList);
        if (isHas){
            items = items.map(item=>{
                if (item.formItemId === id){
                    item.itemVal = val;
                }
                return item;
            });
        }else {
            items.push({
                formItemId: id,
                itemVal: val
            });
        }
        this.setState({
            formData: {...formData,docItemList:items}

        });
    }
    getPatientName (patientInfo) {
            if(patientInfo != null){
            return ( patientInfo.engSurname != null ? patientInfo.engSurname : '' ) + ' ' + ( patientInfo.engGivename != null ? patientInfo.engGivename : '' ) + ' ' + (patientInfo.nameChi != null ? patientInfo.nameChi : '');
        }
        return '';
    }
    getLoginName(){
        const {loginInfo} = this.props;
        if (loginInfo && loginInfo.userDto){
            return (loginInfo.userDto.salutation?`${loginInfo.userDto.salutation} ${loginInfo.userDto.engSurname || ''} ${loginInfo.userDto.engGivName || ''}`:`${loginInfo.userDto.engSurname || ''} ${loginInfo.userDto.engGivName || ''}`);
        }
        return '';
    }
    insertReferralLetterLog(doc,api=''){
        this.props.insertGscEnquiryLog(`[Referral Letter dialog] ${doc}`, api);
    }

    initRenderData(){
        const {neonatalScrn} = this.props;
        const {formData,isDisable} = this.state;

        let dateVal = this.getFormItemId(2110);
        let defDatePickerDateProps = {
            onlyType: 'date',
            openCommonMessage,
            value: dateVal ? moment(dateVal,[moment.ISO_8601,'DD-MM-YYYY']): '',
            disabled: isDisable,
            onChange: (val) => {
                this.handleChangeDate(val, 2110);
            }
        };
        let drProps = {
            disabled: isDisable,
            value: this.getFormItemId(2095),
            onChange: (e) => this.handleChangeInput(e, 2095)
        };
        let hospitalListProps = {
            value: this.getFormItemId( 2096),
            disabled: isDisable,
            options: formData.hospitalList,
            onChange: (e) => this.handleChangeInput(e,  2096)
        };
        let name = neonatalScrn?.babyName || '';
        let sex = getGenderCd(neonatalScrn.codSexIdBaby);
        let dob = getDobByDate({
            codExactDateIdBabyDob:neonatalScrn.codExactDateIdBabyDob,
            date: neonatalScrn.babyDob
        });
        let gestation = neonatalScrn?.gest ? `${neonatalScrn?.gest} wk`: '';
        let ourRefNo = formData?.ourRefNo;
        let resultTableData = formData.resultTable;
        let normalReferenceProps = {
            value: this.getFormItemId(2097),
            disabled: isDisable,
            onChange: (e) => this.handleChangeInput(e, 2097)
            // defaultValue: '(Normal reference: Cord blood TSH≤14.29mIU/L, Cord blood FT4 10.25-16.32pmol/L; \n' +
            //     '                < 1 month: Serum TSH≤10.39mIU/L, Serum FT4 15.45-31.33pmol/L;\n' +
            //     '                >1 month: Serum TSH 0.34-5.6 mIU/L, Serum FT4 7.86-14.41pmol/L)'
        };
        let pleaseNoteProps = {
            value: this.getFormItemId(2098),
            disabled: isDisable,
            onChange: (e) => this.handleChangeInput(e, 2098)
        };
        let hospitalNoProps = {
            value: this.getFormItemId(2127),
            disabled: isDisable,
            onChange: (e) => this.handleChangeInput(e, 2127)
        };
        let parentsTelNoProps = {
            value: this.getFormItemId(2128),
            disabled: isDisable,
            onChange: (e) => this.handleChangeInput(e, 2128)
        };
        let loginName = this.getFormItemId(2099) ? this.getFormItemId(2099) : this.getLoginName();
        return {
            defDatePickerDateProps,
            drProps,
            isDisable,
            hospitalListProps,
            name,
            sex,
            dob,
            ourRefNo,
            resultTableData,
            normalReferenceProps,
            pleaseNoteProps,
            loginName,
            hospitalNoProps,
            parentsTelNoProps,
            gestation
        };
    }

    render() {
        const {classes = false} = this.props;
        let viewData = this.initRenderData();
        return (
            <Grid container ref={this.wrapRef}>
                <Typography component="div" style={{backgroundColor: 'white', padding: 10, position: 'relative'}}>
                    <Grid container item xs={12} justify="space-between" alignItems="center"
                        style={{textAlign: 'center'}} className={classes.gridRow}
                    >
                        <Grid container item xs={5} sm={4} direction="column">
                            <Typography className={classes.fontBold} component="div">THE GOVERNMENT OF HONG KONG <br/>SPECIAL ADMINISTRATIVE REGION <br/>DEPARTMENT OF HEALTH <br/>CLINICAL GENETIC SERVICE</Typography>
                            <Typography className={classes.fontBold} component="div">香 港 特 別 行 政 區 政 府</Typography>
                            <Typography className={classes.fontBold} component="div">衞 生 署 醫 學 遺 傳 服 務</Typography>
                        </Grid>
                        <Grid item xs={2} sm={4}>
                            <Typography component="div">
                                <img src={logoImg}
                                    alt="THE GOVERNMENT OF HONG KONG SPECIAL ADMINISTRATIVE REGION DEPARTMENT OF HEALTH CLINICAL GENETIC SERVICE"
                                />
                            </Typography>
                        </Grid>
                        <Grid container item xs={5} sm={4} direction="column">
                            <Typography className={classes.fontBold} component="div">GENETIC COUNSELLING DIVISION &<br/>CYTOGENETIC LABORATORY</Typography>
                            <Typography component="div" style={{display:'flex',justifyContent: 'center'}}><span style={{paddingRight: '2rem'}}>Tel: 2725 3773</span><span>Fax: 2729 1440</span></Typography>
                            <Typography className={classes.fontBold} component="div">GENETIC SCREENING DIVISION</Typography>
                            <Typography component="div" style={{display:'flex',justifyContent: 'center'}}><span style={{paddingRight: '2rem'}}>Tel: 35136503</span><span>Fax: 2729 9620</span></Typography>
                            <Typography component="div">9/F Tower B, </Typography>
                            <Typography component="div">Hong Kong Children’s Hospital,</Typography>
                            <Typography component="div">1 Shing Cheong Road, Kowloon Bay, </Typography>
                            <Typography component="div">Kowloon, Hong Kong</Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justify="space-between" style={{paddingTop: '20px'}}
                        className={classes.gridRow}
                    >
                        <Grid container item xs={9} alignItems={'center'}>
                            <Typography component="div">Doctor i/c</Typography>
                        </Grid>
                        <Grid container alignItems="center" item xs={3}>
                            <Grid><span className={classes.labelRightPad}>Date.:</span></Grid>
                            <Grid style={{flex: 1}}>
                                <DatePicker {...viewData.defDatePickerDateProps}/>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justify="space-between" className={classes.gridRow}>
                        <Grid container alignItems="center" item xs={4}>
                            {/*<Grid><span>Dr.:</span></Grid>*/}
                            <Grid style={{flex: 1}}>
                                <CellInput
                                    rows={1}
                                    {...viewData.drProps}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={8}/>
                    </Grid>
                    <Grid container item xs={12} className={classes.gridRow}>
                        <Grid item xs={4}>
                            <Typography component="div">Department of Paediatrics,</Typography>
                        </Grid>
                        <Grid item xs={8}/>
                    </Grid>
                    <Grid container item xs={12} className={classes.gridRow}>
                        <Grid item xs={4}>
                            <Typography component="div">Hospital</Typography>
                        </Grid>
                        <Grid item xs={8}/>
                    </Grid>
                    <Grid container item xs={12} className={classes.gridRow}>
                        <Grid item xs={4}>
                            <CellSelect
                                {...viewData.hospitalListProps}
                            />
                        </Grid>
                        <Grid item xs={8}/>
                    </Grid>
                    <Grid container item xs={12} className={classes.gridRow} style={{padding: '10px 0'}}>
                        <Grid item xs={6}>
                            <Typography component="div" style={{textIndent: '1rem'}}>Dear Doctor i/c,</Typography>
                        </Grid>
                        <Grid item xs={6}/>
                    </Grid>
                    <Grid container item xs={12}>
                        <Grid item xs={12} style={{textAlign: 'center', padding: '10px 0'}} className={classes.gridRow}>
                            <Typography component="div" style={{fontWeight: 'bold', fontSize: 18,display: 'inline-block',textDecoration: 'underline'}}>Re: Referral of suspected congenital hypothyroidism</Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justify="space-around" style={{margin: '0 auto', paddingTop: '15px',borderBottom: '1px solid #333',padding: '3px 0'}} className={classes.gridRow}>
                        <Grid container item xs={4} alignItems="center">
                            <Grid item>
                                <Typography component="div" className={classNames(classes.fontBold,classes.labelRightPad)}>Name:</Typography>
                            </Grid>
                            <Grid container style={{flex: 1}}>
                                <Typography component="div" className={classNames(classes.fontBold)}>{viewData.name}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={4}>
                        </Grid>
                        <Grid container item alignItems="center" xs={4}>
                            <Grid><span className={classNames(classes.fontBold,classes.labelRightPad)}>Hospital no.:</span></Grid>
                            <Grid style={{flex: 1}} className={classNames(classes.fontBold)}>
                                <CellInput
                                    rows={1}
                                    {...viewData.hospitalNoProps}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justify="space-around" alignItems={'center'} style={{margin: '0 auto',height: '38px',borderBottom: '1px solid #333',padding: '3px 0'}} className={classes.gridRow}>
                        <Grid container item xs={4}>
                            <Grid item >
                                <Typography component="div" className={classNames(classes.fontBold,classes.labelRightPad)}>Sex:</Typography>
                            </Grid>
                            <Grid container item style={{flex: 1}}>
                                <Typography component="div" className={classNames(classes.fontBold)}>{viewData.sex}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={4}>
                            <Grid item >
                                <Typography component="div" className={classNames(classes.fontBold,classes.labelRightPad)}>DOB:</Typography>
                            </Grid>
                            <Grid container item style={{flex: 1}}>
                                <Typography component="div" className={classNames(classes.fontBold)}>{viewData.dob}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item xs={4}>
                            <Grid item>
                                <Typography component="div" className={classNames(classes.fontBold,classes.labelRightPad)}>Gestation:</Typography>
                            </Grid>
                            <Grid container item style={{flex: 1}}>
                                <Typography component="div" className={classNames(classes.fontBold)}>{viewData.gestation}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justify="space-around" style={{margin: '0 auto',borderBottom: '1px solid #333',padding: '3px 0'}} className={classes.gridRow}>
                        <Grid container item xs={4} alignItems={'center'}>
                            <Grid item>
                                <Typography component="div" className={classNames(classes.fontBold,classes.labelRightPad)}>Our Ref. no.:</Typography>
                            </Grid>
                            <Grid container item style={{flex: 1}}>
                                <Typography component="div" className={classNames(classes.fontBold)}>{viewData.ourRefNo}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container item alignItems="center" xs={4}>
                            <Grid><span className={classNames(classes.fontBold,classes.labelRightPad)}>Parents’ tel no.:</span></Grid>
                            <Grid style={{flex: 1}} className={classNames(classes.fontBold)}>
                                <CellInput
                                    rows={1}
                                    {...viewData.parentsTelNoProps}
                                />
                            </Grid>
                        </Grid>
                        <Grid container item xs={4}>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} style={{padding: '20px 0'}} className={classes.gridRow}>
                        <Typography component="div">The above-named baby is screen-positive for congenital hypothyroidism and referred for your further investigations and expert management. The abnormal screening results are as follow:</Typography>
                    </Grid>
                    <Grid container item xs={12} justify="center"
                        className={classNames(classes.gridRow, classes.listWrap)}
                    >
                        <Grid container item xs={12} className={classNames(classes.listHead, classes.listRow)}>
                            <Grid item xs={4} className={classes.rightBorder}>
                                <Typography component="div" className={classNames(classes.fontBold)}>Date</Typography>
                            </Grid>
                            <Grid item xs={4} className={classes.rightBorder}>
                                <Typography component="div" className={classNames(classes.fontBold)}>TSH (mIU/L)</Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Typography component="div" className={classNames(classes.fontBold)}>FT4 (pmol/L)</Typography>
                            </Grid>
                        </Grid>
                        {
                            viewData.resultTableData.length ? viewData.resultTableData.map((item, index) => {
                                let {clctDate='',TSH='',FT4=''} = item;
                                clctDate = moment(clctDate).isValid() ? moment(clctDate).format('DD-MM-YYYY') : '';
                                return (
                                    <Grid container item xs={12} key={index} className={classes.listRow}>
                                        <Grid item xs={4} className={classes.rightBorder}>
                                            <Typography component="div">{clctDate}</Typography>
                                        </Grid>
                                        <Grid item xs={4} className={classes.rightBorder}>
                                            <Typography component="div">{TSH}</Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography component="div">{FT4}</Typography>
                                        </Grid>
                                    </Grid>
                                );

                            }) : <Grid container item xs={12} justify="center" className={classes.listRow}>
                                <Typography component="div">There is no data.</Typography>
                            </Grid>
                        }
                    </Grid>
                    <Grid container item xs={12} className={classes.gridRow}>
                        <CellInput
                            rows={3}
                            {...viewData.normalReferenceProps}
                        />
                    </Grid>
                    <Grid container item xs={12} className={classes.gridRow} style={{paddingTop: '20px'}}>
                        <Typography component="div">We would like to recommend the following investigations:</Typography>
                    </Grid>
                    <Grid container item xs={12} direction="column" className={classes.gridRow}
                        style={{padding: '0 0 20px 0'}}
                    >
                        <Typography component="div">1)Thyroid imaging</Typography>
                        <Typography component="div">2)Baby thyroid function test (TSH, FT4)</Typography>
                    </Grid>
                    <Grid container item xs={12} className={classes.gridRow}>
                        <Typography component="div">Other investigations for you to consider include:</Typography>
                    </Grid>
                    <Grid container item xs={12} direction="column" className={classes.gridRow} style={{padding: '0 0 20px 0'}}>
                        <Typography component="div">1)X-ray for bone age</Typography>
                        <Typography component="div">2)Baby thyroid antibodies</Typography>
                        <Typography component="div">3)Mother thyroid antibodies</Typography>
                    </Grid>

                    <Grid container item xs={12} className={classes.gridRow}>
                        <Typography component="div" style={{fontWeight: 'bold'}}>Remarks:</Typography>
                    </Grid>
                    <Grid container item xs={12} direction="column" className={classes.gridRow} style={{padding: '0 0 20px 0'}}>
                        <Grid container>
                            <Grid style={{paddingRight:'6px'}}>(1)</Grid>
                            <Grid container style={{flex:1}}>
                                <Typography component="div">Baby’s mother/father has been notified by this Service about the referral. Verbal consent was obtained from the parent to allow our designated medical/ nursing staff to access and view the above-mentioned investigation results as well as your further expert management and treatment (if any). </Typography>
                            </Grid>
                        </Grid>
                        <Grid container>
                            <Grid style={{paddingRight:'6px'}}>(2)</Grid>
                            <Grid container style={{flex:1}}>
                                <Typography component="div">For further enquiry, please contact our Nursing Officer (NO) at telephone number <strong>35136503</strong>.</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    {/*<Grid container alignItems="center" item xs={12} className={classes.gridRow}>*/}
                    {/*    <Grid><span>Please Note:</span></Grid>*/}
                    {/*    <Grid style={{flex: 1}}>*/}
                    {/*        <CellInput*/}
                    {/*            rows={1}*/}
                    {/*            {...viewData.pleaseNoteProps}*/}
                    {/*        />*/}
                    {/*    </Grid>*/}
                    {/*</Grid>*/}
                    <Grid container item xs={12} className={classes.gridRow}>
                        <Grid item xs={5}>
                            <Typography component="div">Thank you for your urgent attention.</Typography>
                            <Typography component="div" style={{paddingTop: '20px'}}><strong>Signature</strong></Typography>
                            <Typography component="div"><strong><span className={classes.labelRightPad}>Name:</span>{viewData.loginName}</strong></Typography>
                            <Typography component="div" style={{paddingTop: '20px'}}>c.c.&nbsp;&nbsp;Consultant Clinical Geneticist</Typography>
                            <Typography component="div">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SM&HO, GSD</Typography>
                        </Grid>
                        <Grid container alignItems="center" justify={'flex-end'} item xs={7}>
                            {/*isoImg*/}
                            <Typography component="div" style={{paddingRight: '10%', paddingTop: '100px'}}>
                                <img width={160} src={isoImg} alt="iso.png"/>
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container item xs={12} justify="center" style={{textAlign: 'center',paddingTop: '20px'}}
                        className={classes.gridRow}
                    >
                        <Typography component="div" style={{color: '#666'}}>We build a healthy Hong Kong and <br/> aspire to be an internationally renowned public health authority</Typography>
                    </Grid>
                    {/*btn*/}
                    <Grid container item xs={12} className={classes.gridRow} justify="center">
                        <CIMSButton id="Save" style={{'display': viewData.isDisable ? 'none' : 'inline-block'}} onClick={() => {
                            this.handleSave(()=>{
                                let params = this.props.referralLetterData.clinicalParams;
                                this.props.showReferralLetterDialog(params,(referralLetterData)=>{
                                    let newProps = {...this.props,referralLetterData: referralLetterData};
                                    this.initData(newProps,()=>{
                                        this.props.closeCommonCircularDialog();
                                    });
                                });
                            });
                        }}
                        >Save</CIMSButton>
                        <CIMSButton id="Print" onClick={() => {
                            this.handlePrint();
                        }}
                        >Print</CIMSButton>
                        <CIMSButton id="Exit" onClick={() => {
                            this.handleExit();
                        }}
                        >Exit</CIMSButton>
                    </Grid>
                </Typography>
            </Grid>
        );
    }
}


const mapStateToProps = state => ({
    commonMessageDetail: state.message.commonMessageDetail,
    patientInfo: state.patient.patientInfo,
    common: state.common,
    accessRights: state.login.accessRights,
    loginInfo: state.login.loginInfo,
    caseNoInfo: state.patient.caseNoInfo
});

const mapDispatchToProps = {
    openCommonMessage,
    closeCommonMessage,
    openCommonCircularDialog,
    closeCommonCircularDialog,
    getGscReferralLetter,
    saveGscReferralLetter,
    getScReferralLetterPrintData,
    print
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ReferralLetter));