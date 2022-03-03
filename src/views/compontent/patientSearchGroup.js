import React from 'react';
import { connect } from 'react-redux';
import Select from '../../components/FormValidator/SelectFieldValidator';
import {
    Grid,
    InputAdornment,
    IconButton
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import { Search } from '@material-ui/icons';
import HKIDInput from '../compontent/hkidInput';
import _ from 'lodash';
import * as PatientUtilities from '../../utilities/patientUtilities';
import Enum from '../../enums/enum';
import FieldConstant from '../../constants/fieldConstant';
import { CommonUtil } from '../../utilities';
import FastTextFieldValidator from '../../components/TextField/FastTextFieldValidator';
import CIMSButton from '../../components/Buttons/CIMSButton';
import SmartCardReaderDialog from '../ideas/smartCardReaderDialog';

const styles = () => ({
    searchInputRoot: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: '4px',
        border: '1px solid rgba(0,0,0,0.23)',
        height: 33,
        width: 'inherit'
    },
    input: {
        marginLeft: 8,
        flex: 1,
        fontSize: '12pt'
    },
    iconButton: {
        padding: 10
    }
});

const getSelSearchType = (availDocType, searchType) => {
    let selSearchType = availDocType.find(item => item.searchTypeCd === searchType);
    return selSearchType || null;
};

const getValidator = (disabled, isHKIDFormat, availDocType, allDocType, searchType, isSearchAction) => {
    let validator = [];
    if (!disabled && isSearchAction) {
        if (isHKIDFormat) {
            validator.push(ValidatorEnum.isHkid);
        } else {
            let selSearchType = getSelSearchType(availDocType, searchType);
            let minLength = 1;
            if (searchType === 'TELHOME' || searchType === 'TELMOBILE' || searchType === 'PMI' || searchType === 'EHR' || searchType === 'APPTID') {
                validator.push(ValidatorEnum.isNumber);
            }
            if (searchType === 'EMAIL') {
                validator.push(ValidatorEnum.isEmail);
            }
            if (selSearchType) {
                minLength = selSearchType.minSearchLen || 1;
            }
            validator.push(ValidatorEnum.minStringLength(minLength));
        }
    }
    return validator;
};

const getErrorMessage = (disabled, isHKIDFormat, availDocType, allDocType, searchType, optVal, optLbl, isSearchAction) => {
    // const {docTypeList}=this.props;
    let errorMessage = [];
    if (!disabled && isSearchAction) {
        if (isHKIDFormat) {
            let hkidFomratDocTypeList = availDocType.filter(item => item[optVal] === searchType);
            let replaceMsg = CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR((hkidFomratDocTypeList[0] && hkidFomratDocTypeList[0][optLbl]) || 'HKID Card');
            errorMessage.push(replaceMsg);
        } else {
            let selSearchType = getSelSearchType(availDocType, searchType);
            let minLength = 1;
            if (searchType === 'TELHOME' || searchType === 'TELMOBILE' || searchType === 'PMI' || searchType === 'EHR' || searchType === 'APPTID') {
                errorMessage.push(CommonMessage.VALIDATION_NOTE_NUMBERFIELD());
            }
            if (searchType === 'EMAIL') {
                errorMessage.push(CommonMessage.VALIDATION_NOTE_EMAILFIELD());
            }
            if (selSearchType) {
                minLength = selSearchType.minSearchLen || 1;
            }
            errorMessage.push(CommonMessage.VALIDATION_NOTE_BELOWMINWIDTH().replace('%LENGTH%', minLength));
        }
    }
    return errorMessage;
};

// const PatientSearchGroup = (props) => {
class PatientSearchGroup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isSearchAction: false,
            isEnableChiNameSearch: true,
            openSmartCardReaderDialog: false
        };
    }

    componentDidMount() {
        const siteParam = this.getIsEnableChiNameSearchSiteParams();
        if (siteParam && siteParam.siteParamId) {
            this.setState({ isEnableChiNameSearch: parseInt(siteParam.paramValue) ? true : false });
        }
    }

    getIsEnableChiNameSearchSiteParams = () => {
        const { svcCd, siteId, siteParams } = this.props;
        const siteParam = CommonUtil.getTopPriorityOfSiteParams(siteParams, svcCd, siteId, Enum.CLINIC_CONFIGNAME.IS_ENABLE_CHINESE_NAME_SEARCH);
        return siteParam;
    };

    updatePatientSearchGp = (data) => {
        this.props.updateState(data);
    };

    handleSearchTypeChange = (value) => {
        let params = { searchType: value, searchValue: '' };
        this.updatePatientSearchGp({ patientSearchParam: params });
        this.props.updateState({ isFocusSearchInput: true });
    };

    handleSearchValueChange = (value) => {
        let searchParams = _.cloneDeep(this.props.patientSearchParam);
        searchParams.searchValue = value;
        this.updatePatientSearchGp({ patientSearchParam: searchParams });
    };

    handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            this.setState({
                isSearchAction: true
            }, () => {
                this.searchInputRef.blur();
            });
        }
    };

    autoFocus = () => {
        if (this.searchInputRef) {
            this.searchInputRef.focus();
        }
    };

    handleSearchInputBlur = (value, searchType, isHKIDFormat, smartCardData = null) => {
        this.handleSearchValueChange(value);
        const { isSearchAction } = this.state;
        if (isSearchAction) {
            let txtVal = value;
            let validateImmdPromise = null;
            if (searchType === FieldConstant.PATIENT_NAME_TYPE && this.state.isEnableChiNameSearch) {
                validateImmdPromise = this.searchRef.validateImmd(value);
            } else {
                validateImmdPromise = this.searchRef.inputRef.validateImmd(value);
            }

            validateImmdPromise.then(resultArr => {
                let invalidCount = 0;
                resultArr.forEach(result => {
                    if (!result) {
                        invalidCount++;
                    }
                });

                if (invalidCount === 0) {
                    if (isHKIDFormat) {
                        txtVal = value.replace('(', '').replace(')', '');
                    }
                    this.props.searchInputOnBlur({ searchType: searchType, searchString: txtVal, code: '' }, this.state.isSearchAction, smartCardData);
                }
            });
        } else {
            let txtVal = value;
            if (isHKIDFormat) {
                txtVal = value.replace('(', '').replace(')', '');
            }
            this.props.searchInputOnBlur({ searchType: searchType, searchString: txtVal, code: '' }, false);
        }
    };

    searchInputOnFocus = () => {
        if (typeof this.props.patSearchGroupOnFocus === 'function') {
            this.props.patSearchGroupOnFocus();
        }
        this.setState({ isSearchAction: false });
    };

    searchIconOnclick = () => {
        this.setState({
            isSearchAction: true
        }, () => {
            const { patientSearchParam } = this.props;
            const { searchType, searchValue } = patientSearchParam;
            const isHKIDFormat = PatientUtilities.isHKIDFormat(searchType);
            this.handleSearchInputBlur(searchValue, searchType, isHKIDFormat);
        });
    }

    getDocTypeList = (docTypeList, allDocType, patSearchTypeList) => {
        if (!allDocType) {
            return docTypeList;
        } else {
            let _docTypeList = [];
            if (docTypeList && docTypeList.length > 0) {
                _docTypeList = docTypeList.map((i) => {
                    let searchType = patSearchTypeList.find(element => element.searchTypeCd === i.code);
                    let newItem = {
                        ...i,
                        searchTypeCd: searchType ? searchType.searchTypeCd : i.code,
                        minSearchLen: searchType ? searchType.minSearchLen : null
                    };
                    return newItem;
                });
            }
            return _docTypeList;
        }
    };

    handleSmartCardReaderDialogOnReturn = (cardData) => {
        // console.log('cardData: ', cardData);
        if (cardData?.hkid) {
            let patientSearchParam = { searchType: Enum.DOC_TYPE.HKID_ID, searchValue: cardData.hkid };

            this.props.updateState({ patientSearchParam });
            this.setState(
                {
                    isSearchAction: true
                },
                () => {
                    this.handleSearchInputBlur(patientSearchParam.searchValue, patientSearchParam.searchType, true, cardData);
                }
            );
        }
    };

    render() {
        const { id, disabled, docTypeList, patientSearchParam, optVal, optLbl, allDocType, patSearchTypeList, useIdeas } = this.props;
        // const searchInputRef = React.createRef();
        // const searchRef = React.createRef();
        const { searchType, searchValue } = patientSearchParam;
        const isHKIDFormat = PatientUtilities.isHKIDFormat(searchType);
        const { isSearchAction, isEnableChiNameSearch, openSmartCardReaderDialog } = this.state;
        // const _docTypeList = docTypeList || [];
        const _docTypeList = this.getDocTypeList(docTypeList, allDocType, patSearchTypeList);
        return (
            <>
                <Grid container spacing={useIdeas ? 1 : 3}>
                    <Grid item xs>
                        <Select
                            id={`${id}_search_type`}
                            ref={ref => this.selectRef = ref}
                            value={searchType}
                            options={_docTypeList.map(item => ({
                                value: item[optVal], label: item[optLbl]
                            }))}
                            // options={availDocType.map(item => ({
                            //     value: item[optVal], label: item[optLbl]
                            // }))}
                            onChange={(e) => this.handleSearchTypeChange(e.value)}
                            isDisabled={disabled}
                            TextFieldProps={{
                                variant: 'outlined'
                            }}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                        />
                    </Grid>
                    <Grid item xs>
                    {
                        searchType === FieldConstant.PATIENT_NAME_TYPE && isEnableChiNameSearch ?
                            <FastTextFieldValidator
                                id={`${id}_search_input`}
                                inputRef={ref => this.searchInputRef = ref}
                                ref={ref => this.searchRef = ref}
                                validators={getValidator(disabled, isHKIDFormat, _docTypeList, allDocType, searchType, isSearchAction)}
                                errorMessages={getErrorMessage(disabled, isHKIDFormat, _docTypeList, allDocType, searchType, optVal, optLbl, isSearchAction)}
                                value={searchValue}
                                onBlur={e => this.handleSearchInputBlur(e.target.value, searchType, isHKIDFormat)}
                                onFocus={this.searchInputOnFocus}
                                onKeyDown={this.handleKeyDown}
                                absoluteMessage
                                calActualLength
                                disabled={disabled}
                                variant={'outlined'}
                                inputProps={{ minLength: 6, maxLength: 500 }}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position={'end'}>
                                            <IconButton
                                                onClick={this.searchIconOnclick}
                                                disabled={disabled}
                                            >
                                                <Search
                                                    color={disabled ? 'disabled' : 'primary'}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                }}
                                upperCase
                            />
                            :
                            <HKIDInput
                                id={`${id}_search_input`}
                                isHKID={isHKIDFormat && !disabled}
                                inputRef={ref => this.searchInputRef = ref}
                                ref={ref => this.searchRef = ref}
                                validators={getValidator(disabled, isHKIDFormat, _docTypeList, allDocType, searchType, isSearchAction)}
                                errorMessages={getErrorMessage(disabled, isHKIDFormat, _docTypeList, allDocType, searchType, optVal, optLbl, isSearchAction)}
                                value={searchValue}
                                onBlur={e => this.handleSearchInputBlur(e.target.value, searchType, isHKIDFormat)}
                                onFocus={this.searchInputOnFocus}
                                onKeyDown={this.handleKeyDown}
                                absoluteMessage
                                disabled={disabled}
                                variant={'outlined'}
                                inputProps={{
                                    minLength: 6,
                                    maxLength: isHKIDFormat ? undefined : 500
                                }}
                                InputProps={{
                                    endAdornment:
                                        <InputAdornment position={'end'}>
                                            <IconButton
                                                onClick={this.searchIconOnclick}
                                                disabled={disabled}
                                            >
                                                <Search
                                                    color={disabled ? 'disabled' : 'primary'}
                                                />
                                            </IconButton>
                                        </InputAdornment>
                                }}
                                forceTrimSpace={searchType !== FieldConstant.PATIENT_NAME_TYPE && searchType !== FieldConstant.CASE_NUM_TYPE}
                            />
                    }
                    </Grid>
                    {useIdeas ? (
                        <Grid item xs="auto">
                            <CIMSButton
                                style={{ margin: 0, height: '39px', minWidth: 'unset' }}
                                disabled={disabled}
                                onClick={() => {
                                    this.setState({ openSmartCardReaderDialog: true });
                                }}
                            >
                                Smart ID
                            </CIMSButton>
                        </Grid>
                    ) : null}
                </Grid>
                {openSmartCardReaderDialog ? (
                    <SmartCardReaderDialog
                        id={'smartCardReaderDialog'}
                        openSmartCardReaderDialog
                        handleCloseDialog={() => {
                            this.setState({ openSmartCardReaderDialog: false });
                        }}
                        handleSmartCardReaderDialogOnReturn={(cardData) => this.handleSmartCardReaderDialogOnReturn(cardData)}
                    />
                ) : null}
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        accessRights: state.login.accessRights,
        patSearchTypeList: state.common.patSearchTypeList,
        siteParams: state.common.siteParams,
        svcCd: state.login.service && state.login.service.svcCd,
        siteId: state.login.clinic && state.login.clinic.siteId
    };
};



export default connect(mapStateToProps)(withStyles(styles)(PatientSearchGroup));