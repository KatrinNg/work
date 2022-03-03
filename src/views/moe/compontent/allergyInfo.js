import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Typography,
    Grid,
    Tooltip
} from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import infoIcon from '../../../images/moe/icon-info.gif';
import moment from 'moment';
import * as moeUtilities from '../../../utilities/moe/moeUtilities';
// import SimpleDialog from '../compontent/dialog/simpleDialog';
import {
    addNoKnownAllergy,
    reconfirmAllergy
} from '../../../store/actions/moe/moeAction';
import { DRUG_DISPLAY_NAME } from '../../../enums/moe/moeEnums';
import Enum from '../../../enums/enum';
import { MOE_MSG_CODE } from '../../../constants/message/moe/commonRespMsgCodeMapping';
import {
    openCommonMessage
} from '../../../store/actions/message/messageAction';

const alertHeight = 78;

const styles = theme => ({
    root: {
        /*border: '1px red solid',*/
        width: '100%',
        display: 'flex',
        margin: 0,
        padding: 0,
        position: 'relative',
        height: alertHeight + 'px'
    },
    alert: {
        color: '#fff',
        height: '100%',
        width: '60px'
    },
    info: {
        textAlign: 'left',
        paddingLeft: 20,
        width: 'calc(100% - 80px - 340px)'
    },
    buttonPosition: {
        width: '340px',
        display: 'flex',
        justifyContent: 'center',
        alignItem: 'center'
    },
    btn: {
        color: 'red'
    },
    alertButton: {
        color: '#fd0000',
        border: '1px solid #fd0000',
        '&:hover': {
            backgroundColor: '#fd0000',
            border: '1px solid #ffffff',
            color: '#ffffff'
        }
    },
    oneRow: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    tooltipPlacementBottom: {
        transformOrigin: 'center top',
        margin: '12px 0',
        [theme.breakpoints.up('sm')]: {
            margin: '2px 0'
        }
    },
    freeText: {
        color: 'red'
    },
    importAllergy: {
        color: 'green'
    }
});

class AllergyInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // showNoAllergyReminder: true,
            // showReconfirmDialog: false
        };
    }

    handleMouseEnterAlert = (e) => {
        let tmpEle = null;
        if (e.target !== moeUtilities.getParentsByAttr(e.target, 'alertid', 'outMostDiv'))
            tmpEle = e.target;
        else
            tmpEle = e.target.firstChild;

        tmpEle = moeUtilities.getParentsByAttr(tmpEle, 'alertid', 'secOutDiv');

        let beforeInfoHeight = tmpEle.querySelector('[alertid="alertInfo"]').clientHeight;

        let tmpEles = tmpEle.querySelectorAll('[alertid="oneRow"]');
        for (let i = 0; i < tmpEles.length; i++) {
            tmpEles[i].style.whiteSpace = 'normal';
            tmpEles[i].style.overflow = 'visible';
            tmpEles[i].style.textOverflow = 'inherit';
        }
        // tmpEles = tmpEle.querySelectorAll('div');
        // for (let i = 0; i < tmpEles.length; i++) {
        //     // tmpEles[i].style.float = 'left';
        // }

        let afterInfoHeight = tmpEle.querySelector('[alertid="alertInfo"]').clientHeight;

        tmpEle.style.cssText =
            'height: auto; ' +
            'max-height: 500px; ' +
            'min-height: ' + alertHeight + 'px; ' +
            'position: absolute; ' +
            'border: ' + (this.needSetGray() ? '1px rgba(128,128,128) solid;' : '1px red solid;') +
            'background-color: rgba(255,255,255); ' +
            'z-index: 99; ' +
            'overflow: hidden; ' +
            'transition:max-height 1.5s; ' +
            '-moz-transition:max-height 1.5s; ' + /* Firefox 4 */
            '-webkit-transition:max-height 1.5s; ' + /* Safari and Chrome */
            '-o-transition:max-height 1.5s; '; /* Opera */

        if (beforeInfoHeight !== afterInfoHeight) {
            this.adjustAlertTittleHeight(tmpEle, tmpEle.querySelector('[alertid="alertInfo"]'));
        }
        else {
            this.adjustAlertTittleHeight(tmpEle, tmpEle);
        }

    }

    adjustAlertTittleHeight(tmpEle, targetHeight) {
        tmpEle.querySelector('[alertid="alertTitle"]').style.height = targetHeight.clientHeight + 'px';
    }

    isNKDA() {
        return (
            this.props.patientAllergyList
            && this.props.patientAllergyList.length === 1
            && this.props.patientAllergyList.find((item) => { return item.allergenType === 'N'; })
        );
    }

    needSetGray() {
        return (
            (!this.props.patientAllergyConnectedFlag)
            || (!this.props.isEnableSaam)
            || (this.isNKDA()
                && this.props.patientAdrsList.length === 0
                && this.props.patientAlertList.length === 0)
            || (this.props.patientAllergyList.length === 0
                && this.props.patientAdrsList.length === 0
                && this.props.patientAlertList.length === 0)
        );
    }

    handleMouseLeaveAlert = (e) => {
        let tmpEle = null;
        if (e.target !== moeUtilities.getParentsByAttr(e.target, 'alertid', 'outMostDiv'))
            tmpEle = e.target;
        else
            tmpEle = e.target.firstChild;

        tmpEle = moeUtilities.getParentsByAttr(tmpEle, 'alertid', 'secOutDiv');

        let tmpEles = tmpEle.querySelectorAll('[alertid="oneRow"]');
        for (let i = 0; i < tmpEles.length; i++) {
            tmpEles[i].style.whiteSpace = 'nowrap';
            tmpEles[i].style.overflow = 'hidden';
            tmpEles[i].style.textOverflow = 'ellipsis';
        }
        // tmpEles = tmpEle.querySelectorAll('div');
        // for (let i = 0; i < tmpEles.length; i++) {
        //     tmpEles[i].style.float = 'none';
        // }

        tmpEle.style.cssText =
            'height: ' + alertHeight + 'px; ' +
            'max-height: ' + alertHeight + 'px; ' +
            'position: inherit; ' +
            'border: ' + (this.needSetGray() ? '1px rgba(128,128,128) solid;' : '1px red solid;') +
            'overflow: inherit; ';

        this.adjustAlertTittleHeight(tmpEle, tmpEle);
    }

    updateInfoEle(item) {
        // const dateFormat = 'DD-MMM-YYYY';
        const dateFormat = Enum.DATE_FORMAT_EDMY_VALUE;
        return (
            <Typography component={'div'}>
                {`Last Update at ${moment(item.updateDtm).format(dateFormat)} by ${'' !== item.updateUser ? item.updateUser : item.updateBy}`}
            </Typography>
        );
    }

    multiIngredientEle(qTip) {
        return (
            <Typography component={'div'}>
                {qTip}
            </Typography>
        );
    }

    getMultiVtmHtmlItem(index, item, displayStr, qTip, childId) {
        const { classes, id } = this.props;
        return (
            <Typography component={'div'} key={id + childId + index} style={{ display: 'inline' }}>
                <Tooltip title={this.updateInfoEle(item)} classes={{ tooltipPlacementBottom: classes.tooltipPlacementBottom }}>
                    <font>
                        {displayStr}
                    </font>
                </Tooltip>
                <Tooltip title={this.multiIngredientEle(qTip)} classes={{ tooltipPlacementBottom: classes.tooltipPlacementBottom }}><img width={16} height={16} src={infoIcon} /></Tooltip>
                <font> </font>
            </Typography>
        );
    }

    getVtmHtmlItem(index, item, displayStr, childId, className) {
        const { classes, id } = this.props;
        return (
            <Typography component={'div'} key={id + childId + index} style={{ display: 'inline' }}>
                <Tooltip title={this.updateInfoEle(item)} classes={{ tooltipPlacementBottom: classes.tooltipPlacementBottom }} className={className}>
                    <font>
                        {displayStr}
                    </font>
                </Tooltip>
                <font> </font>
            </Typography>
        );
    }

    // getReminderContent() {
    //     return (
    //         <Grid container spacing={1}>
    //             <Grid item>
    //                 <img width={32} height={32} src={infoIcon} />
    //             </Grid>
    //             <Grid item style={{ width: '420px' }}>
    //                 <font>There is no allergy record for this patient. Please specify patient's allergy status.</font>
    //             </Grid>
    //         </Grid>
    //     );
    // }

    addNoKnownAllergy = () => {
        this.props.addNoKnownAllergy();
        // this.setState({ showNoAllergyReminder: false });
    }

    showReconfirmDialog = () => {
        // this.setState({ showReconfirmDialog: true });
        let payload = this.getReconfirmContent();
        payload.btnActions = {
            btn1Click: () => {
                this.reconfirmAllergy();
            }
        };
        this.props.openCommonMessage(payload);
    }

    getReconfirmContent = () => {
        // const dateFormat = 'DD-MMM-YYYY';
        const dateFormat = Enum.DATE_FORMAT_EDMY_VALUE;
        if (this.isNKDA())
            // return (
            //     <Grid container spacing={1}>
            //         <Grid item container>
            //             Reaffirm that this patient has No Known Drug Allergy?
            //         </Grid>
            //         <Grid item container style={{ color: 'rgba(5,121,200)' }}>
            //             Allergy status previously updated on {moment(this.props.patientAllergyList[0].updateDtm).format(dateFormat)}
            //         </Grid>
            //     </Grid>
            // );
            return {
                msgCode: MOE_MSG_CODE.ALLERGY_RE_CONFIRM_NKDA,
                params: [
                    {
                        name: 'UPDATE_DTM',
                        value: moment(this.props.patientAllergyList[0].updateDtm).format(dateFormat)
                    }
                ]
            };
        else {
            // return (
            //     <Grid container spacing={1}>
            //         <Grid item container style={{ width: '500px' }}>
            //             Reaffirm patient's allergy record(s)?
            //         </Grid>
            //     </Grid>
            // );
            return {
                msgCode: MOE_MSG_CODE.ALLERGY_RE_CONFIRM
            };
        }
    }

    reconfirmAllergy = () => {
        /*let tmpPatientAllergyDtoList = [];
        for (let i = 0; i < this.props.patientAllergyList.length; i++) {
            let item = {
                allergySeqNo: this.props.patientAllergyList[i].allergySeqNo,
                displayName: this.props.patientAllergyList[i].displayName,
                allergenType: this.props.patientAllergyList[i].allergenType,
                allergenDto: this.props.patientAllergyList[i].allergen,
                allergenCode: this.props.patientAllergyList[i].allergenCode,
                certainty: this.props.patientAllergyList[i].certainty,
                additionInfo: this.props.patientAllergyList[i].additionInfo,
                deleteReason: this.props.patientAllergyList[i].deleteReason,
                version: this.props.patientAllergyList[i].version,
                allergyReactionDtoList: this.props.patientAllergyList[i].allergyReactions
            };
            tmpPatientAllergyDtoList.push(item);
        }

        let params = tmpPatientAllergyDtoList;*/
        this.props.reconfirmAllergy(/*params*/);
        // this.setState({ showReconfirmDialog: false });
    }

    render() {
        const { classes, id } = this.props;

        const DISPLAY_NAME_TYPE_BAN = DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_BAN;
        const DISPLAY_NAME_TYPE_VTM = DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_VTM;
        const DISPLAY_NAME_TYPE_TRADENAME = DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_TRADENAME;
        const DISPLAY_NAME_TYPE_ABB = DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_ABB;
        const DISPLAY_NAME_TYPE_OTHER = DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_OTHER;
        const DISPLAY_NAME_TYPE_ALLERGENGROUP = DRUG_DISPLAY_NAME.DISPLAY_NAME_TYPE_ALLERGENGROUP;
        const TYPE_NO_KNOWN_DRUG_ALLERGY = DRUG_DISPLAY_NAME.TYPE_NO_KNOWN_DRUG_ALLERGY;
        const ALLERGEN_TYPE_FREE_TEXT_DRUG = DRUG_DISPLAY_NAME.ALLERGEN_TYPE_FREE_TEXT_DRUG;
        const ALLERGEN_TYPE_FREE_TEXT_NON_DRUG = DRUG_DISPLAY_NAME.ALLERGEN_TYPE_FREE_TEXT_NON_DRUG;
        const ALLERGEN_TYPE_FREE_TEXT_IMPORT = DRUG_DISPLAY_NAME.ALLERGEN_TYPE_FREE_TEXT_IMPORT;
        const ALLERGEN_TYPE_STRUCTURE_IMPORT = DRUG_DISPLAY_NAME.ALLERGEN_TYPE_STRUCTURE_IMPORT;

        if (this.props.patientAllergyConnectedFlag
            && this.props.isEnableSaam
            && this.props.patientAllergyList.length === 0
            && this.props.patientAdrsList.length === 0
            && this.props.patientAlertList.length === 0
        )
            this.props.openCommonMessage({
                msgCode: MOE_MSG_CODE.NO_ALLERGY_REMINDER,
                btnActions: {
                    btn1Click: () => {
                        this.addNoKnownAllergy();
                    }
                }
            });

        return (
            <Typography id={id} component={'div'} className={classes.root}>
                <Typography component={'div'} className={classes.root} onMouseEnter={this.handleMouseEnterAlert} onMouseLeave={this.handleMouseLeaveAlert} alertid={'outMostDiv'}>
                    <Grid
                        container direction={'row'}
                        style={{
                            border: this.needSetGray() ? '1px rgba(128,128,128) solid' : '1px red solid',
                            maxHeight: alertHeight + 'px',
                            transition: 'max-height 0.5s',
                            MozTransition: ':max-height 0.5s', /* Firefox 4 */
                            WebkitTransition: 'max-height 0.5s', /* Safari and Chrome */
                            OTransition: 'max-height 0.5s' /* Opera */
                        }}
                        alignItems={'center'}
                        alignContent={'center'}
                        alertid={'secOutDiv'}
                    >
                        <Grid item container className={classes.alert} style={{ backgroundColor: this.needSetGray() ? 'rgba(128,128,128)' : 'red' }} alignItems={'center'} justify={'center'} alertid={'alertTitle'}>
                            <Typography align={'center'} style={{ color: '#fff' }}>Alert</Typography>
                        </Grid>
                        <Grid className={classes.info} alertid={'alertInfo'}>
                            <Typography component={'div'} style={{ display: (this.props.patientAllergyConnectedFlag) && (this.props.isEnableSaam) && (this.props.patientAllergyList.length === 0 && this.props.patientAdrsList.length === 0 && this.props.patientAlertList.length === 0) ? 'block' : 'none' }}>
                                <font>No Allergy Record.</font>
                            </Typography>
                            <Typography component={'div'} style={{ display: this.props.isEnableSaam ? 'none' : 'block' }}>
                                <font>Structured Alert Module is disabled.</font>
                            </Typography>
                            <Typography component={'div'} style={{ display: this.props.patientAllergyConnectedFlag ? 'none' : 'block' }}>
                                <font style={{ color: 'red' }}>Fail to retrieve data from Structured Alert Module.</font>
                            </Typography>
                            {this.props.isEnableSaam && this.props.patientAllergyConnectedFlag &&
                                <Typography component={'div'} alertid={'oneRow'} className={classes.oneRow} style={{ display: this.props.patientAllergyList.length > 0 ? 'block' : 'none' }}>
                                    <div style={{ fontWeight: 'bold', display: 'inline' }}><font>Allergy - </font></div>{this.props.patientAllergyList.map((item, index) => {
                                        const dto = item.allergen;
                                        const orderNum = this.props.patientAllergyList.length > 1 ? '(' + (index + 1) + ') ' : '';
                                        //Muti
                                        if (
                                            dto
                                            && dto.vtm
                                            && (moeUtilities.isMultipleIngredient(dto.vtm) || DISPLAY_NAME_TYPE_BAN === dto.displayNameType)
                                        ) {
                                            let qTip = dto.displayName;
                                            if (
                                                (
                                                    !dto.multiIngredient
                                                    && DISPLAY_NAME_TYPE_BAN === dto.displayNameType
                                                ) ||
                                                (
                                                    DISPLAY_NAME_TYPE_BAN === dto.displayNameType && '' === dto.tradeName
                                                )
                                            ) {
                                                qTip = 'INN' + ' = ' + dto.vtm;
                                            }

                                            if (DISPLAY_NAME_TYPE_VTM === dto.displayNameType) {
                                                if (dto.multiIngredient && dto.tradeName) {
                                                    return (
                                                        this.getMultiVtmHtmlItem(index, item, orderNum + dto.tradeName + ' ', qTip, 'allergy')
                                                    );
                                                }
                                                else {
                                                    return (
                                                        this.getVtmHtmlItem(index, item, orderNum + dto.displayName, 'allergy')
                                                    );
                                                }
                                            }
                                            else if (DISPLAY_NAME_TYPE_TRADENAME === dto.displayNameType) {
                                                return (
                                                    this.getMultiVtmHtmlItem(index, item, orderNum + dto.tradeName + ' ', qTip, 'allergy')
                                                );
                                            }
                                            else if (DISPLAY_NAME_TYPE_BAN === dto.displayNameType) {
                                                if (dto.tradeName && dto.multiIngredient) {
                                                    return (
                                                        this.getMultiVtmHtmlItem(index, item, orderNum + dto.tradeName + ' ', qTip, 'allergy')
                                                    );
                                                }
                                                else {
                                                    return (
                                                        this.getMultiVtmHtmlItem(index, item, orderNum + dto.ban + ' ', qTip, 'allergy')
                                                    );
                                                }
                                            }
                                            else if (DISPLAY_NAME_TYPE_ABB === dto.displayNameType) {
                                                return (
                                                    this.getMultiVtmHtmlItem(index, item, orderNum + dto.abbreviation + ' ', qTip, 'allergy')
                                                );
                                            }
                                            else if (DISPLAY_NAME_TYPE_OTHER === dto.displayNameType) {
                                                return (
                                                    this.getMultiVtmHtmlItem(index, item, orderNum + dto.otherName + ' ', qTip, 'allergy')
                                                );
                                            }
                                            else if (DISPLAY_NAME_TYPE_ALLERGENGROUP === dto.displayNameType) {
                                                return (
                                                    this.getVtmHtmlItem(index, item, orderNum + dto.displayName, 'allergy')
                                                );
                                            }
                                        }

                                        if (
                                            DISPLAY_NAME_TYPE_ALLERGENGROUP === item.allergenType
                                            && item.displayName
                                            && item.displayName.startsWith('NSAIDs (')
                                        ) {
                                            return (
                                                this.getMultiVtmHtmlItem(index, item, orderNum + item.displayName.substring(0, 6) + ' ', item.displayName, 'allergy')
                                            );
                                        }

                                        if (TYPE_NO_KNOWN_DRUG_ALLERGY === item.allergenType) {
                                            return (
                                                this.getVtmHtmlItem(index, item, orderNum + item.displayName, 'allergy')
                                            );
                                        }

                                        if (ALLERGEN_TYPE_FREE_TEXT_DRUG === item.allergenType || ALLERGEN_TYPE_FREE_TEXT_NON_DRUG === item.allergenType) {
                                            return (
                                                this.getVtmHtmlItem(index, item, orderNum + item.displayName, 'allergy', classes.freeText)
                                            );
                                        }
                                        else if (ALLERGEN_TYPE_FREE_TEXT_IMPORT === item.allergenType || ALLERGEN_TYPE_STRUCTURE_IMPORT === item.allergenType) {
                                            return (
                                                this.getVtmHtmlItem(index, item, orderNum + item.displayName, 'allergy', classes.importAllergy)
                                            );
                                        }
                                        else {
                                            return (
                                                this.getVtmHtmlItem(index, item, orderNum + item.displayName, 'allergy')
                                            );
                                        }
                                    })}
                                </Typography>
                                /* <Typography component={'div'} alertid={'oneRow'} className={classes.oneRow} style={{ display: this.props.patientAllergyList.length > 0 || (this.props.patientAllergyList.length === 0 && this.props.patientAdrsList.length === 0 && this.props.patientAlertList.length === 0) ? 'none' : 'block' }}>
                                    <Typography component={'div'} style={{ display: 'inline' }}>
                                        <font style={{ fontWeight: 'bold' }}>Allergy - </font><font>No Known Drug Allergy</font>
                                    </Typography>
                                </Typography> */
                            }
                            {this.props.isEnableSaam && this.props.patientAllergyConnectedFlag &&
                                <Typography component={'div'} alertid={'oneRow'} className={classes.oneRow} style={{ display: this.props.patientAdrsList.length > 0 ? 'block' : 'none' }}>
                                    <div style={{ fontWeight: 'bold', display: 'inline' }}><font>ADR - </font></div>{this.props.patientAdrsList.map((item, index) => {
                                        const dto = item.allergen;
                                        const orderNum = this.props.patientAdrsList.length > 1 ? '(' + (index + 1) + ') ' : '';
                                        //Muti
                                        if (
                                            dto
                                            && dto.vtm
                                            && (moeUtilities.isMultipleIngredient(dto.vtm) || DISPLAY_NAME_TYPE_BAN === dto.displayNameType)
                                        ) {
                                            let qTip = dto.displayName;
                                            if (
                                                (
                                                    !dto.multiIngredient
                                                    && DISPLAY_NAME_TYPE_BAN === dto.displayNameType
                                                )
                                                ||
                                                (
                                                    DISPLAY_NAME_TYPE_BAN === dto.displayNameType
                                                    && '' === dto.tradeName
                                                )
                                            ) {
                                                qTip = 'INN' + ' = ' + dto.vtm;
                                            }

                                            if (DISPLAY_NAME_TYPE_VTM === dto.displayNameType) {
                                                if (dto.multiIngredient && dto.tradeName) {
                                                    return (
                                                        this.getMultiVtmHtmlItem(index, item, orderNum + dto.tradeName + ' ', qTip, 'ads')
                                                    );
                                                }
                                                else {
                                                    return (
                                                        this.getMultiVtmHtmlItem(index, item, orderNum + dto.displayName, qTip, 'ads')
                                                    );
                                                }
                                            }
                                            else if (DISPLAY_NAME_TYPE_TRADENAME === dto.displayNameType) {
                                                return (
                                                    this.getMultiVtmHtmlItem(index, item, orderNum + dto.tradeName + ' ', qTip, 'ads')
                                                );
                                            }
                                            else if (DISPLAY_NAME_TYPE_BAN === dto.displayNameType) {
                                                if (dto.tradeName && dto.multiIngredient) {
                                                    return (
                                                        this.getMultiVtmHtmlItem(index, item, orderNum + dto.tradeName + ' ', qTip, 'ads')
                                                    );
                                                }
                                                else {
                                                    return (
                                                        this.getMultiVtmHtmlItem(index, item, orderNum + dto.ban + ' ', qTip, 'ads')
                                                    );
                                                }
                                            }
                                            else if (DISPLAY_NAME_TYPE_ABB === dto.displayNameType) {
                                                return (
                                                    this.getMultiVtmHtmlItem(index, item, orderNum + dto.abbreviation + ' ', qTip, 'ads')
                                                );
                                            }
                                            else if (DISPLAY_NAME_TYPE_OTHER === dto.displayNameType) {
                                                return (
                                                    this.getMultiVtmHtmlItem(index, item, orderNum + dto.otherName + ' ', qTip, 'ads')
                                                );
                                            }
                                            else if (DISPLAY_NAME_TYPE_ALLERGENGROUP === dto.displayNameType) {
                                                return (
                                                    this.getVtmHtmlItem(index, item, orderNum + dto.displayName, 'ads')
                                                );
                                            }
                                        }

                                        if (item.adrType) {
                                            if (item.freeText) {
                                                return (
                                                    this.getVtmHtmlItem(index, item, orderNum + item.drugDesc, 'ads', classes.freeText)
                                                );
                                            }
                                            else {
                                                return (
                                                    this.getVtmHtmlItem(index, item, orderNum + item.drugDesc, 'ads')
                                                );
                                            }
                                        }
                                        else {
                                            return (
                                                this.getVtmHtmlItem(index, item, orderNum + item.drugDesc, 'ads', classes.importAllergy)
                                            );
                                        }
                                    })}
                                </Typography>
                            }
                            {this.props.isEnableSaam && this.props.patientAllergyConnectedFlag &&
                                <Typography component={'div'} alertid={'oneRow'} className={classes.oneRow} style={{ display: this.props.patientAlertList.length > 0 ? 'block' : 'none' }}>
                                    <div style={{ fontWeight: 'bold', display: 'inline' }}><font>Alert - </font></div>{this.props.patientAlertList.map((item, index) => {
                                        const orderNum = this.props.patientAlertList.length > 1 ? '(' + (index + 1) + ') ' : '';
                                        if (item.alertType === null) {
                                            if (item.alertCode === null) {
                                                return (
                                                    this.getVtmHtmlItem(index, item, orderNum + item.alertDesc, 'alert', classes.freeText)
                                                );
                                            }
                                            else {
                                                return (
                                                    this.getVtmHtmlItem(index, item, orderNum + item.alertDesc, 'alert')
                                                );
                                            }
                                        }
                                        else {
                                            return (
                                                this.getVtmHtmlItem(index, item, orderNum + item.alertDesc, 'alert', classes.importAllergy)
                                            );
                                        }
                                    })}
                                </Typography>
                            }
                        </Grid>
                        {this.props.showButton && (this.props.isEnableSaam && this.props.patientAllergyConnectedFlag) && (this.props.patientAllergyList.length > 0 || this.props.patientAdrsList.length > 0 || this.props.patientAlertList.length > 0) ?
                            <Grid className={classes.buttonPosition}>
                                <CIMSButton
                                    id={id + '_reConfirm_CIMSButton'}
                                    style={{
                                        visibility: !this.props.patientAllergyConnectedFlag
                                            || !this.props.isEnableSaam
                                            || this.props.patientAllergyList.length === 0 ? 'hidden' : 'visible'
                                    }}
                                    className={classes.alertButton}
                                    onClick={this.showReconfirmDialog}
                                >Re-Confirm allergy record</CIMSButton>
                                <CIMSButton id={id + '_update_CIMSButton'} className={classes.alertButton}>Update</CIMSButton>
                            </Grid>
                            : null
                        }

                    </Grid>
                </Typography>
                {/* {this.state.showReconfirmDialog &&
                    <SimpleDialog
                        id={id + '_Reconfirm'}
                        open={this.state.showReconfirmDialog}
                        title={'Question'}
                        content={this.getReconfirmContent}
                        firstBtnContent={'Yes'}
                        secondBtnContent={'No'}
                        firstBtnAction={this.reconfirmAllergy}
                        secondBtnAction={() => { this.setState({ showReconfirmDialog: false }); }}
                    />
                } */}
                {/* {this.props.patientAllergyConnectedFlag
                    && this.props.isEnableSaam
                    && this.props.patientAllergyList.length === 0
                    && this.props.patientAdrsList.length === 0
                    && this.props.patientAlertList.length === 0
                    &&
                    // <SimpleDialog
                    //     id={id + '_NoAllergyReminder'}
                    //     open={this.state.showNoAllergyReminder}
                    //     title={'Information/Attention'}
                    //     content={this.getReminderContent}
                    //     firstBtnContent={'Add \'No Known Drug Allergy\''}
                    //     secondBtnContent={'Add Allergy Record'}
                    //     firstBtnAction={this.addNoKnownAllergy}
                    //     secondBtnAction={() => { this.setState({ showNoAllergyReminder: false }); }}
                    // />
                    this.props.openCommonMessage({
                        msgCode: MOE_MSG_CODE.NO_ALLERGY_REMINDER,
                        btnActions: {
                            btn1Click: () => {
                                this.addNoKnownAllergy();
                            }
                        }
                    })
                } */}
            </Typography>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientAllergyList: state.moe.patientAllergyList,
        patientAlertList: state.moe.patientAlertList,
        patientAdrsList: state.moe.patientAdrsList,
        patientAllergyConnectedFlag: state.moe.patientAllergyConnectedFlag
    };
};

const mapDispatchToProps = {
    addNoKnownAllergy,
    reconfirmAllergy,
    openCommonMessage
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AllergyInfo));
