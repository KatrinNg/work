import React, { Component, useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import {
    IconButton,
    Grid,
    Typography,
    FormControl,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    FormControlLabel,
    RadioGroup,
    Radio
} from '@material-ui/core';
import { ExpandMore, RemoveCircle, AddCircle } from '@material-ui/icons';
import CIMSButton from '../../components/Buttons/CIMSButton';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import ContactPhones from './component/phones/contactPhones';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import RegFieldName from '../../enums/registration/regFieldName';
import Enum, { SERVICE_CODE } from '../../enums/enum';
import { contactPersonBasic as contactPersonListBasic } from '../../constants/registration/registrationConstants';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';
import { openCommonCircular, closeCommonCircular,   openCommonCircularDialog,
    closeCommonCircularDialog } from '../../store/actions/common/commonAction';
import { updateState } from '../../store/actions/registration/registrationAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import StructuredAddressPanel from './component/contactInformation/structuredAddressPanel';
import FreeTextAddressPanel from './component/contactInformation/freeTextAddressPanel';
import PostalBoxAddressPanel from './component/contactInformation/postalBoxAddressPanel';
import ContactInformationEnum from '../../enums/registration/contactInformationEnum';
import CIMSCheckBox from '../../components/CheckBox/CIMSCheckBox';
import * as RegUtil from '../../utilities/registrationUtilities';
import { openADISearchDialog } from '../../utilities/registrationUtilities';
import * as commonUtilities from '../../utilities/commonUtilities';
import { hasEhsPhn } from '../../utilities/patientUtilities';

//eslint-disable-next-line
const useStyle3 = makeStyles(theme => ({
    form_input: {
        width: '100%'
    }
}));

function genAddressInputPanel(id, curAddressFormat, comDisabled, patientContactInfo, props) {
    const regionList = ContactInformationEnum.REGION;
    const handleChangeAddress = (value, name, code) => {
        let contactInfo = _.cloneDeep(props.contact);
        let filterSet = _.cloneDeep(props.filterSet);

        contactInfo[RegFieldName.CHANGE_ADDRESS_FORMAT] = false;

        if (name === 'region' || name === 'districtCd' || name === 'subDistrictCd') {
            const addressObj = RegUtil.getDistrictRelationship({
                name: name,
                code: code,
                value: value,
                regionList: ContactInformationEnum.REGION,
                districtList: props.registerCodeList.district,
                subDistrictList: props.registerCodeList.sub_district,
                isChi: contactInfo.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE,
                addressDto: _.cloneDeep(contactInfo)
            });
            contactInfo.region = addressObj.region;
            contactInfo.regionCode = addressObj.regionCode;
            contactInfo.districtCd = addressObj.districtCd;
            contactInfo.districtCode = addressObj.districtCode;
            contactInfo.subDistrictCd = addressObj.subDistrictCd;
            contactInfo.subDistrictCode = addressObj.subDistrictCode;

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

        contactInfo[name] = value;
        if (!contactInfo.addressFormat) {
            contactInfo.addressFormat = ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
        }
        let contactPers = _.cloneDeep(props.contactPersonList);
        contactPers[props.index] = contactInfo;
        props.updateState({ contactPersonList: contactPers, filterSet: filterSet });
    };

    switch (curAddressFormat) {
        case ContactInformationEnum.ADDRESS_TYPE.STRUCTURED: {
            return (
                <StructuredAddressPanel
                    id={id}
                    registerCodeList={props.registerCodeList}
                    isDisabled={comDisabled || !props.contactAddress[props.index]}
                    addressList={props.contact}
                    addressType={Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE}
                    handleChangeAddress={handleChangeAddress}
                    regionList={regionList}
                    filterSet={props.filterSet}
                />
            );
        }
        case ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT: {
            return (
                <FreeTextAddressPanel
                    id={id}
                    isDisabled={comDisabled}
                    addressType={Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE}
                    handleChangeAddress={handleChangeAddress}
                    addressList={props.contact}
                />
            );
        }
        case ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX: {
            return (
                <PostalBoxAddressPanel
                    id={id}
                    isDisabled={comDisabled}
                    handleChangeAddress={handleChangeAddress}
                    addressList={props.contact}
                    addressType={Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE}
                />
            );
        }
        default: {
            return null;
        }
    }
}


function ContactPersonItem(props) {
    const classes = useStyle3();
    const {
        contact,
        comDisabled,
        registerCodeList,
        id,
        countryList,
        patientContactInfo,
        openAdi,
        viewPatDetails,
        openEhsContactTelDialog,
        service
    } = props;
    const isDirty = RegUtil.isContactPersonDirty(contact);

    const initContactPerPhone = () => {
        let phoneList = [];
        phoneList.push(RegUtil.addPatientPhone(Enum.PHONE_TYPE_MOBILE_PHONE));
        return phoneList;
    };

    useEffect(() => {
        //component did mount
        let contactPers = _.cloneDeep(props.contactPersonList);
        let _contact = contactPers[props.index];
        let { contactPhoneList } = _contact;
        if (!contactPhoneList) contactPhoneList = [];
        if (contactPhoneList.length <= 0) {
            let phoneList = initContactPerPhone();
            contactPhoneList.push(...phoneList);
            props.updateState({ contactPersonList: contactPers });
        }
        return () => {
            //component unmount
        };
        //eslint-disable-next-line
    }, []);

    const handleOnChange = (value, name) => {
        props.change(props.index, value, name);
    };

    const handleOnChangePhone = (phoneList) => {
        let contactPers = _.cloneDeep(props.contactPersonList);
        let _contact = contactPers[props.index];
        _contact.contactPhoneList = _.cloneDeep(phoneList);
        props.updateState({ contactPersonList: contactPers });
    };

    const updateLastAddressFormat = (_addressFormat) => {
        props.updateLastAddressFormat(_addressFormat);
    };
    const genAddressType = (addressFomrat) => {
        switch (addressFomrat) {
            case ContactInformationEnum.ADDRESS_TYPE.STRUCTURED: {
                return ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
            }
            case ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT: {
                return ContactInformationEnum.ADDRESS_FORMAT.FREE_TEXT_ADDRESS;
            }
            case ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX: {
                return ContactInformationEnum.ADDRESS_FORMAT.POSTAL_BOX_ADDRESS;
            }
            default: {
                return ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
            }
        }
    };
    const handleChangeAddressFormat = (e, lastAddressFormat) => {
        let value = e.target.value;
        let curLastAddressFormat = '';
        let curAddressFormat = genAddressType(value);
        curLastAddressFormat = genAddressType(lastAddressFormat);

        updateLastAddressFormat(curLastAddressFormat);

        handleOnChange(curAddressFormat, RegFieldName.CONTACT_PERSON_ADDRESS_FORMAT);
    };

    const genAddressFormat = (_addressFormat) => {
        switch (_addressFormat) {
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
    };

    const handleAddressLanguageChange = (e, name) => {
        let value;
        // props.resetValidators();
        if (!e.target.checked) {
            value = Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE;
        } else {
            value = e.target.value;
        }

        handleOnChange(value, name);
    };

    const addressFormat = genAddressFormat(contact.addressFormat ? contact.addressFormat : ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS);
    const chiAddress = contact.addressLanguageCd ? contact.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE : false;

    return (
        <Grid container alignItems="baseline">
            <Grid item container xs={4} spacing={1}>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <FastTextFieldValidator
                            id={id + '_surName'}
                            upperCase
                            onlyOneSpace
                            label={<>Surname{isDirty ? <RequiredIcon /> : null}</>}
                            variant="outlined"
                            /* eslint-disable */
                            InputProps={{ className: classes.form_input }}
                            disabled={comDisabled}
                            inputProps={{ maxLength: 40 }}
                            /* eslint-enable */
                            value={contact.engSurname}
                            onBlur={e => handleOnChange(e.target.value, RegFieldName.CONTACT_PERSON_ENGLISH_SURNAME)}
                            name={RegFieldName.CONTACT_PERSON_ENGLISH_SURNAME}
                            validators={isDirty ?
                                [
                                    ValidatorEnum.required,
                                    ValidatorEnum.isSpecialEnglish
                                ]
                                :
                                [
                                    ValidatorEnum.isSpecialEnglish
                                ]
                            }
                            errorMessages={isDirty ? [
                                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()
                            ] : [
                                    CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()
                                ]
                            }
                            warning={[
                                ValidatorEnum.isEnglishWarningChar
                            ]}
                            warningMessages={[
                                CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()
                            ]}
                            trim={'all'}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <FastTextFieldValidator
                            id={id + '_givenName'}
                            upperCase
                            onlyOneSpace
                            label={<>Given Name</>}
                            variant="outlined"
                            /* eslint-disable */
                            InputProps={{ className: classes.form_input }}
                            disabled={comDisabled}
                            inputProps={{ maxLength: 40 }}
                            /* eslint-enable */
                            value={contact.engGivename}
                            onBlur={e => handleOnChange(e.target.value, RegFieldName.CONTACT_PERSON_ENGLISH_GIVENNAME)}
                            name={RegFieldName.CONTACT_PERSON_ENGLISH_GIVENNAME}
                            validators={[ValidatorEnum.isSpecialEnglish]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()]}
                            warning={[ValidatorEnum.isEnglishWarningChar]}
                            warningMessages={[CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                            trim={'all'}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <FastTextFieldValidator
                            id={id + '_chineseName'}
                            label={<>中文姓名</>}
                            variant="outlined"
                            /* eslint-disable */
                            InputProps={{ className: classes.form_input }}
                            disabled={comDisabled}
                            inputProps={{ maxLength: 20 }}
                            /* eslint-enable */
                            value={contact.nameChi}
                            onBlur={e => handleOnChange(e.target.value, RegFieldName.CONTACT_PERSON_CHINESE_NAME)}
                            name={RegFieldName.CONTACT_PERSON_CHINESE_NAME}
                            //validators={[ValidatorEnum.isChinese]}
                            //errorMessages={[CommonMessage.VALIDATION_NOTE_CHINESEFIELD()]}
                            trim={'all'}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <FormControl fullWidth>
                        <FastTextFieldValidator
                            id={id + '_otherName'}
                            label={<>Other Name</>}
                            variant="outlined"
                            /* eslint-disable */
                            InputProps={{ className: classes.form_input }}
                            disabled={comDisabled}
                            inputProps={{ maxLength: 20 }}
                            /* eslint-enable */
                            value={contact.otherName}
                            onBlur={e => handleOnChange(e.target.value, 'otherName')}
                            validators={[ValidatorEnum.isSpecialEnglish]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_SPECIAL_ENGLISH()]}
                            warning={[ValidatorEnum.isEnglishWarningChar]}
                            warningMessages={[CommonMessage.WARNING_NOTE_SPECIAL_ENGLISH()]}
                            trim={'all'}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <SelectFieldValidator
                            id={id + '_relationship'}
                            options={registerCodeList &&
                                registerCodeList.relationship &&
                                registerCodeList.relationship.map((item) => (
                                    { value: item.code, label: item.engDesc }))}
                            value={contact.relationshipCd}
                            onChange={(e) => handleOnChange(e.value, RegFieldName.CONTACT_PERSON_RELATIONSHIP)}
                            isDisabled={comDisabled}
                            TextFieldProps={{
                                className: classes.form_input,
                                variant: 'outlined',
                                label: <>Relationship</>
                            }}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <FastTextFieldValidator
                            id={id + '_email'}
                            label={<>Email</>}
                            variant="outlined"
                            /* eslint-disable */
                            InputProps={{ className: classes.form_input }}
                            disabled={comDisabled}
                            inputProps={{ maxLength: 80 }}
                            /* eslint-enable */
                            value={contact.emailAddress}
                            onBlur={e => handleOnChange(e.target.value, RegFieldName.CONTACT_PERSON_EMAIL)}
                            type="email"
                            name={RegFieldName.CONTACT_PERSON_EMAIL}
                            validators={[ValidatorEnum.isEmail]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_EMAILFIELD()]}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FastTextFieldValidator
                        id={id + '_remark'}
                        label="Remark"
                        variant="outlined"
                        calActualLength
                        inputProps={{ maxLength: 500 }}
                        disabled={comDisabled}
                        value={contact.remark}
                        onBlur={e => handleOnChange(e.target.value, 'remark')}
                    />
                </Grid>
            </Grid>
            <Grid item container xs={8} style={{ paddingLeft: 20 }}>
                <ContactPhones
                    id={id + '_phoneField'}
                    atLeastOne={isDirty}
                    maxPhoneLength={4}
                    comDisabled={comDisabled}
                    phoneCountryList={countryList}
                    phoneList={contact.contactPhoneList}
                    onChange={handleOnChangePhone}
                    showAddRemoveBtn
                    showExtPhoneNo
                />
                {service?.svcCd === SERVICE_CODE.EHS && (hasEhsPhn(1) || hasEhsPhn(2) || hasEhsPhn(3) || hasEhsPhn(4)) && (
                    <Grid item xs={12}>
                        <CIMSButton
                            style={{ margin: 0, float: 'right' }}
                            onClick={() => openEhsContactTelDialog(props.index)}
                            disabled={comDisabled || (!hasEhsPhn(1) && !hasEhsPhn(2) && !hasEhsPhn(3) && !hasEhsPhn(4))}
                        >
                            EHS Contact Tel.
                        </CIMSButton>
                    </Grid>
                )}
            </Grid>
            <Grid container className={classes.grid}>
                <Grid item xs={12} >
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            <IconButton
                                id={id + '_correspondenceAddress_btn'}
                                className={classes.close_icon}
                                color={'primary'}
                                fontSize="small"
                            >
                                <b>Correspondence Address</b>
                            </IconButton>
                        </Grid>
                        <Grid item xs={4}>
                            <Grid item >
                                <FormControlLabel
                                    id={id + '_chineseAddress_radioLabel1'}
                                    style={{ textAlign: 'center' }}
                                    checked={chiAddress}
                                    // onChange={e => this.handleChangeAddress(e, Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE, 'addressLanguageCd')}
                                    onChange={e => handleAddressLanguageChange(e, RegFieldName.CONTACT_PERSON_LANGUAGE_CD)}
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
                            <Grid item style={{ display: addressFormat === ContactInformationEnum.ADDRESS_TYPE.STRUCTURED ? '' : 'none' }}>
                                <CIMSButton
                                    id={`${id}_address_lookup_button`}
                                    children={'Address Lookup'}
                                    style={{ display: viewPatDetails ? 'none' : '' }}
                                    classes={{ root: classes.addressLookUpButton }}
                                    disabled={comDisabled}
                                    onClick={(e) => {openAdi();}}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={4}>
                            <FormControl fullWidth>
                                {/* <FormLabel component="legend" className={classes.formLabel}>Calendar View</FormLabel> */}
                                <RadioGroup
                                    id={`${id}_address_type_radio_group`}
                                    aria-label={'Address Type'}
                                    name={'addressType'}
                                    row
                                    value={addressFormat}
                                    onChange={(e) => handleChangeAddressFormat(e, addressFormat)}
                                // disabled={comDisabled}
                                >
                                    <FormControlLabel
                                        id={`${id}_${ContactInformationEnum.ADDRESS_TYPE.STRUCTURED.toUpperCase()}_radio`}
                                        className={classes.addressTypeLabel}
                                        value={ContactInformationEnum.ADDRESS_TYPE.STRUCTURED}
                                        control={<Radio style={{ padding: 4 }} color={'primary'} />}
                                        label={ContactInformationEnum.ADDRESS_TYPE.STRUCTURED}
                                        disabled={comDisabled}
                                    />
                                    <FormControlLabel
                                        id={`${id}_${ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT.replace(' ', '_').toUpperCase()}_radio`}
                                        className={classes.addressTypeLabel}
                                        value={ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT}
                                        control={<Radio style={{ padding: 4 }} color={'primary'} />}
                                        label={ContactInformationEnum.ADDRESS_TYPE.FREE_TEXT}
                                        disabled={comDisabled}
                                    />
                                    <FormControlLabel
                                        id={`${id}_${ContactInformationEnum.ADDRESS_TYPE.POSTAL_BOX.replace(' ', '_').toUpperCase()}_radio`}
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
                            genAddressInputPanel(id, addressFormat, comDisabled, patientContactInfo, props)
                        }

                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
}



//eslint-disable-next-line
const styles = theme => ({
    root: {
        marginTop: 10
    },
    add_icon: {
        verticalAlign: 'bottom'
    },
    remove_icon: {
        verticalAlign: 'bottom'
    },
    button: {
        borderRadius: '0%',
        width: '80%',
        padding: 0
    },
    expandButton: {
        padding: 0
    },
    expandDetail: {
        padding: '1px 16px 24px'
    },
    grid: {
        justifyContent: 'center'
    },
    iconButton: {
        padding: 0,
        borderRadius: '15%',
        width: 40,
        paddingBottom: 10
    }
});

const StyledExpansionPanel = withStyles({
    root: {
        // width: '80%',
        width: '100%',
        '&$expanded': {
            margin: '5px 0px'
        }
    },
    expanded: {}
})(ExpansionPanel);

const StyledExpansionPanelSummary = withStyles({
    root: {
        minHeight: 50,
        '&$expanded': {
            minHeight: 50
        }
    },
    expanded: {},
    content: {
        margin: 0,
        '&$expanded': {
            margin: 0
        }
    },
    expandIcon: {
        padding: 0
    }
})(ExpansionPanelSummary);

const initState = {
    expanded: 0,
    contactIndex: -1,
    addressPaneleExpanded: 'addressPanel_0',
    lastAddressFormat: '',
    contactAddress: {}
};

class ContactPerson extends Component {

    constructor(props) {
        super(props);
        this.state = initState;
    }

    componentDidMount(){
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

    shouldComponentUpdate(nextProps, nextState) {
        return nextState !== this.state ||
            nextProps.comDisabled !== this.props.comDisabled ||
            nextProps.contactPersonList !== this.props.contactPersonList;
    }

    resetState = () => this.setState({ ...initState });

    addContact = () => {
        if (this.props.contactPersonList && this.props.contactPersonList.length === 0) {
            this.addContactPers();
        } else {
            this.props.openCommonCircular();
            const valid = this.props.checkContactValid(true);
            valid.then((result) => {
                if (result) {
                    this.addContactPers();
                } else {
                    this.openLastExpand();
                }
                this.props.closeCommonCircular();
            });
        }
    };

    addContactPers = () => {
        let contactPers = this.props.contactPersonList ? _.cloneDeep(this.props.contactPersonList) : [];
        let contact = _.cloneDeep(contactPersonListBasic);
        contact.displaySeq = contactPers.length;
        contactPers.push(contact);
        this.props.updateState({ contactPersonList: contactPers });
        this.setState({ expanded: contactPers.length - 1 });
    }

    changeContact = (index, value, name) => {
        let contactPers = _.cloneDeep(this.props.contactPersonList);
        let { lastAddressFormat } = this.state;
        if (name === RegFieldName.CONTACT_ADDRESS_FORMAT) {
            if (value != lastAddressFormat) {
                contactPers[index][RegFieldName.CHANGE_ADDRESS_FORMAT] = true;
            }
            else {
                contactPers[index][RegFieldName.CHANGE_ADDRESS_FORMAT] = false;
            }
        }

        if (name === 'addressLanguageCd') {
            const addressObj = RegUtil.converAddressLanguage({
                isChi: value === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE,
                addressDto: _.cloneDeep(contactPers[index]),
                regionList: ContactInformationEnum.REGION,
                districtList: this.props.registerCodeList.district,
                subDistrictList: this.props.registerCodeList.sub_district
            });
            contactPers[index].region = addressObj.region;
            contactPers[index].districtCd = addressObj.districtCd;
            contactPers[index].subDistrictCd = addressObj.subDistrictCd;
        }

        contactPers[index][name] = value;
        this.props.updateState({ contactPersonList: contactPers });
    };

    deleteContactPer = () => {
        let contactPers = _.cloneDeep(this.props.contactPersonList);
        let index = this.state.contactIndex > -1 ? this.state.contactIndex : contactPers.length - 1;
        for (let idx = index; idx < contactPers.length; idx++) {
            contactPers[idx].displaySeq--;
        }
        contactPers.splice(index, 1);
        this.props.updateState({ contactPersonList: contactPers });
        this.setState({ expanded: this.state.expanded - 1 });
        // this.props.checkContactValid(false);
    };

    handleChangeExpand = (e, isExpanded, index) => {
        this.setState({ expanded: isExpanded ? index : -1 });
    }

    handleAddressPanelExpandChange = (e, isExpanded, panel) => {
        this.setState({
            addressPaneleExpanded: isExpanded ? panel : ''
        });
    }

    openLastExpand = () => {
        this.setState({ expanded: this.props.contactPersonList.length - 1 });
    }

    openDialog = (e, index) => {
        this.props.openCommonMessage({
            msgCode: '110105',
            btnActions: {
                btn1Click: this.deleteContactPer
            }
        });
        this.setState({ contactIndex: index });
    }

    updateLastAddressFormat = (addressFormat) => {
        this.setState({ lastAddressFormat: addressFormat });
    }

    onClickSearchBtn = (item, index, regCodeList) => {
        return () => {
            this.props.openCommonCircularDialog();
            let addressList = _.cloneDeep(this.props.contactPersonList);

            let targetAddress = addressList[index];
            let adiString = '';

            let langCd = (targetAddress.addressLanguageCd || 'E') === Enum.PATIENT_ADDRESS_ENGLISH_LANUAGE ? 'en_US' : 'zh_HK';
            const districtList = (regCodeList && regCodeList.district) || [];
            let subDistrictList = (regCodeList && regCodeList.sub_district) || [];

            adiString = JSON.stringify({
                lang: langCd,
                unit: targetAddress.room || '',
                floor: targetAddress.floor || '',
                block: targetAddress.block || '',
                building: targetAddress.building || '',
                estate: targetAddress.building || '',
                streetNo: targetAddress.streetNo || '',
                streetName: targetAddress.streetName || '',
                subDistrict: subDistrictList.find(dcd => dcd.code === targetAddress.subDistrictCd) || '',
                district: districtList.find(dcd => dcd.code === targetAddress.districtCd)  || '',
                region: targetAddress.region,
                callbackURL: `${window.location.origin}/#/adiCallback`
            });


            const adiResultToRedux = (oldAddress, result, regCodeList, langCd) => {
                let reduxAddress = {...oldAddress};
                const isZhHk = langCd === 'zh_HK';
                const isEnUs = langCd === 'en_US';

                reduxAddress.room = result.unit;
                reduxAddress.floor = result.floor;
                reduxAddress.block = result.block;
                reduxAddress.building = result.building;
                reduxAddress.estate = result.estate;
                reduxAddress.streetNo = result.streetNo;
                reduxAddress.streetName = result.streetName;
                if (regCodeList && regCodeList.district) {
                    if (isEnUs && regCodeList.district.find(item => item.engDesc.toUpperCase() === result.district.toUpperCase())) {
                    reduxAddress.districtCd = regCodeList.district.find(item => item.engDesc.toUpperCase() === result.district.toUpperCase()).code;
                    } else if (isZhHk && regCodeList.district.find(item => item.chiDesc === result.district)) {
                    reduxAddress.districtCd = regCodeList.district.find(item => item.chiDesc === result.district).code;
                    }
                }
                if (regCodeList && regCodeList.sub_district) {
                    if (isEnUs && regCodeList.sub_district.find(item => item.engDesc.toUpperCase() === result.subDistrict.toUpperCase())) {
                    reduxAddress.subDistrictCd = regCodeList.sub_district.find(item => item.engDesc.toUpperCase() === result.subDistrict.toUpperCase()).code;
                    } else if (isZhHk && regCodeList.sub_district.find(item => item.chiDesc === result.subDistrict)) {
                    reduxAddress.subDistrictCd = regCodeList.sub_district.find(item => item.chiDesc === result.subDistrict).code;
                    }
                }
                if (isEnUs) {
                    reduxAddress.region = result.region;
                } else if (isZhHk) {
                    let adiRegion = ContactInformationEnum.REGION.find(item => item.chiDesc === result.region);
                    if (adiRegion && adiRegion.code) {
                    reduxAddress.region = adiRegion.code;
                    }
                }
                reduxAddress.buildingCsuId = result.buildingCsuId;
                reduxAddress.addressFormat = ContactInformationEnum.ADDRESS_FORMAT.LOCAL_ADDRESS;
                return reduxAddress;
            };

            openADISearchDialog(`/#/adi/${encodeURIComponent(this.adiURL)}/${encodeURIComponent(adiString)}`,
              (result) => {
                this.props.closeCommonCircularDialog();
                if (result.status === 'success') {
                    this.setState({ contactAddress: { ...this.state.contactAddress, [index]: result } });
                    addressList[index] = adiResultToRedux(targetAddress, result,regCodeList, langCd);
                  }
                  this.props.updateState({ contactPersonList: addressList });
              },
              () => {
                this.props.closeCommonCircularDialog();
              }
            );
        };
      }


    focusErrorPanel = () => {
        if(this.props.formEntity) {
            const firstChild = (this.props.formEntity.childs || []).find(x => x.state && !x.state.isValid);
            if(firstChild) {
                const matchArr = (firstChild.props.id || '').match(/registration_contactPerson_person(\S*)/);
                if(matchArr && matchArr.length >= 2) {
                    const index = parseInt(matchArr[1]);
                    if(Number.isInteger(index)){
                        this.setState({ expanded: index }, () => {
                            firstChild.focus && firstChild.focus();
                        });
                    }
                }
            }
        }
    }

    render() {
        const {
            classes,
            contactPersonList,
            comDisabled,
            countryList,
            filterSet,
            changeAddressFormatOnly,
            viewPatDetails
        } = this.props;
        const id = 'registration_contactPerson';
        return (
            <Grid container justify={'center'} className={classes.root} direction={'row'}>
                <Grid item style={{ width: '80%' }} >
                    {
                        contactPersonList &&
                            contactPersonList.length > 0
                            ? contactPersonList.map((item, index) => (
                                <StyledExpansionPanel
                                    key={index}
                                    expanded={this.state.expanded === index ? true : false}
                                    onChange={(...args) => this.handleChangeExpand(...args, index)}
                                >
                                    <StyledExpansionPanelSummary
                                        id={id + '_personExpanSummary_' + index}
                                        expandIcon={<ExpandMore />}
                                    >
                                        <Typography id={id + '_personTitle_' + index} variant="subtitle1">{index === 0 ? 'First Contact Person' : 'Other Contact Person'}</Typography>
                                    </StyledExpansionPanelSummary>
                                    <ExpansionPanelDetails className={classes.expandDetail}>
                                        <ContactPersonItem
                                            id={id + '_person' + index}
                                            key={index}
                                            index={index}
                                            contact={item}
                                            change={this.changeContact}
                                            updateState={e => this.props.updateState(e)}
                                            registerCodeList={this.props.registerCodeList}
                                            contactPersonList={this.props.contactPersonList}
                                            comDisabled={comDisabled}
                                            viewPatDetails={viewPatDetails}
                                            countryList={countryList}
                                            addressPaneleExpanded={this.state.addressPaneleExpanded}
                                            handleAddressPanelExpandChange={this.handleAddressPanelExpandChange}
                                            patientContactInfo={this.props.patientContactInfo}
                                            resetValidators={this.props.resetValidators}
                                            filterSet={filterSet}
                                            changeAddressFormatOnly={changeAddressFormatOnly}
                                            // lastAddressFormat={this.state.lastAddressFormat}
                                            updateLastAddressFormat={this.updateLastAddressFormat}
                                            openAdi={this.onClickSearchBtn(item, index , this.props.registerCodeList)}
                                            contactAddress={this.state.contactAddress}
                                            service={this.props.service}
                                            openEhsContactTelDialog={this.props.openEhsContactTelDialog}
                                        />
                                    </ExpansionPanelDetails>
                                    {/* <ExpansionPanelActions>
                                        <CIMSButton
                                            id={id + '_personRemove' + index}
                                            size="small"
                                            disabled={comDisabled}
                                            onClick={e => this.openDialog(e, index)}
                                        >Remove</CIMSButton>
                                    </ExpansionPanelActions> */}
                                </StyledExpansionPanel>))
                            : null}
                </Grid>
                <Grid item style={{ margin: 'auto 10px', width: '5%' }} container direction={'row'}>
                    <Grid item>
                        <IconButton
                            id={id + '_personRemove'}
                            className={classes.iconButton}
                            // color="primary"
                            onClick={e => this.openDialog(e, this.state.expanded)}
                            disabled={comDisabled === false ? contactPersonList.length === 0 : true}
                        >
                            <RemoveCircle />
                        </IconButton>
                    </Grid>

                    <Grid item>
                        <IconButton
                            id={id + '_addContactPersonBtn'}
                            className={classes.iconButton}
                            color="primary"
                            onClick={this.addContact}
                            disabled={comDisabled}
                            title={'Add'}
                        >
                            <AddCircle color={comDisabled ? 'disabled' : 'primary'} />
                            {/* <b>ADD MORE CONTACT PERSON</b> */}
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}




const mapStateToProps = state => {
    return {
        registerCodeList: state.registration.codeList,
        contactPersonList: state.registration.contactPersonList,
        countryList: state.patient.countryList || [],
        patientContactInfo: state.registration.patientContactInfo,
        filterSet: state.registration.filterSet,
        viewPatDetails: state.registration.viewPatDetails,
        // changeAddressFormatOnly:state.registration.changeAddressFormatOnly
        service:state.login.service
    };
};

const dispatchProps = {
    updateState,
    openCommonCircular,
    closeCommonCircular,
    openCommonMessage,
    openCommonCircularDialog,
    closeCommonCircularDialog
};

export default connect(mapStateToProps, dispatchProps)(withStyles(styles)(ContactPerson));