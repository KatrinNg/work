import React from 'react';
import {
    Grid
} from '@material-ui/core';
import RegFieldName from '../../../../enums/registration/regFieldName';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import Enum from '../../../../enums/enum';
import memoize from 'memoize-one';
import contactInformationEnum from '../../../../enums/registration/contactInformationEnum';
import * as RegistrationUtilities from '../../../../utilities/registrationUtilities';
import _ from 'lodash';


const fieldEngLabel = contactInformationEnum.FIELD_ENG_LABEL;
const fieldChiLabel = contactInformationEnum.FIELD_CHI_LABEL;

function genAddressInput(isChiAddress) {
    const addressInputs = [
        {
            label: isChiAddress ? fieldChiLabel.CONTACT_ROOM : fieldEngLabel.CONTACT_ROOM,
            isRequire: false,
            name: RegFieldName.CONTACT_ROOM,
            maxLength: 286
        },
        {
            label: isChiAddress ? fieldChiLabel.CONTACT_FLOOR : fieldEngLabel.CONTACT_FLOOR,
            isRequire: false,
            name: RegFieldName.CONTACT_FLOOR,
            maxLength: 160
        },
        {
            label: isChiAddress ? fieldChiLabel.CONTACT_BLOCK : fieldEngLabel.CONTACT_BLOCK,
            isRequire: false,
            name: RegFieldName.CONTACT_BLOCK,
            maxLength: 314
        },
        {
            label: isChiAddress ? fieldChiLabel.CONTACT_BUILDING : fieldEngLabel.CONTACT_BUILDING,
            isRequire: false,
            name: RegFieldName.CONTACT_BUILDING,
            maxLength: 150
        },
        {
            label: isChiAddress ? fieldChiLabel.CONTACT_ESTATELOT : fieldEngLabel.CONTACT_ESTATELOT,
            isRequire: false,
            name: RegFieldName.CONTACT_ESTATELOT,
            maxLength: 400
        },
        {
            label: 'blank_item',
            name: 'blank_item'
        },
        {
            label: isChiAddress ? fieldChiLabel.CONTACT_STREET_NO : fieldEngLabel.CONTACT_STREET_NO,
            isRequire: false,
            name: RegFieldName.CONTACT_STREET_NO,
            maxLength: 30
        },
        {
            label: isChiAddress ? fieldChiLabel.CONTACT_STREET : fieldEngLabel.CONTACT_STREET,
            isRequire: false,
            name: RegFieldName.CONTACT_STREET,
            maxLength: 300
        },
        {
            label: 'blank_item',
            name: 'blank_item'
        }
    ];
    return addressInputs;
}

function genContactPersonRegionGp(isChiAddress, regionList, districtList, subDistrictList, addressSet, filterSet) {
    let addressRegionGp = [];
    let newDistrictList = _.cloneDeep(districtList);
    let newSubDistrictList = _.cloneDeep(subDistrictList);
    if (filterSet[RegFieldName.CONTACT_REGION] === 1) {
        if (addressSet.region != '') {
            let curSubDistrictList = [];
            newDistrictList = RegistrationUtilities.filterListBySperCode(districtList, 'code', addressSet.regionCode, true);
            newDistrictList.forEach(district => {
                let oneSubDistrictSet = RegistrationUtilities.filterListBySperCode(subDistrictList, 'code', district.code, true);
                // newSubDistrictList.push(oneSubDistrictSet);
                // let curSubDistrictList=[];
                curSubDistrictList = [...curSubDistrictList, ...oneSubDistrictSet];
            });
            newSubDistrictList = curSubDistrictList;
        }
    }
    if (filterSet[RegFieldName.CONTACT_DISTRICT] === 1) {
        newDistrictList = RegistrationUtilities.filterListBySperCode(districtList, 'code', addressSet.districtCode);
        newSubDistrictList = RegistrationUtilities.filterListBySperCode(subDistrictList, 'code', addressSet.districtCode, true);
    }
    //added by justin 2020/09/18
    if (newDistrictList && newDistrictList.length === 0) {
        newDistrictList = _.cloneDeep(districtList);
    }
    if (newSubDistrictList && newSubDistrictList.length === 0) {
        newSubDistrictList = _.cloneDeep(subDistrictList);
    }
    //added by justin 2020/09/18
    newDistrictList && newDistrictList.sort((a, b) => {
        return a.engDesc.localeCompare(b.engDesc);
    });
    newSubDistrictList && newSubDistrictList.sort((a, b) => {
        return a.engDesc.localeCompare(b.engDesc);
    });
    if (isChiAddress) {
        addressRegionGp = [
            {
                label: fieldChiLabel.CONTACT_SUB_DISTRICT,
                name: RegFieldName.CONTACT_SUB_DISTRICT,
                dataList: newSubDistrictList ? newSubDistrictList : [],
                maxLength: 540
            },
            {
                label: fieldChiLabel.CONTACT_DISTRICT,
                name: RegFieldName.CONTACT_DISTRICT,
                dataList: newDistrictList ? newDistrictList : [],
                maxLength: 240
            },
            {
                label: fieldChiLabel.CONTACT_REGION,
                name: RegFieldName.CONTACT_REGION,
                dataList: regionList ? regionList : [],
                maxLength: 50
            }
        ];
    }
    else {
        addressRegionGp = [
            {
                label: fieldEngLabel.CONTACT_REGION,
                name: RegFieldName.CONTACT_REGION,
                dataList: regionList ? regionList : [],
                maxLength: 50
            },
            {
                label: fieldEngLabel.CONTACT_DISTRICT,
                name: RegFieldName.CONTACT_DISTRICT,
                dataList: newDistrictList ? newDistrictList : [],
                maxLength: 240
            },
            {
                label: fieldEngLabel.CONTACT_SUB_DISTRICT,
                name: RegFieldName.CONTACT_SUB_DISTRICT,
                dataList: newSubDistrictList ? newSubDistrictList : [],
                maxLength: 540
            }
        ];
    }
    return addressRegionGp;
}

class StructuredAddressPanel extends React.Component {
    handleChangeAddress = (value, type, name, code) => {
        if (type === Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE) {
            this.props.handleChangeAddress(value, name, code);
        }
        else {
            this.props.handleChangeAddress(value, type, name, code);
        }
    }

    addressSet = memoize((list, type) => {
        if (type === Enum.PATIENT_CONTACT_PERSON_ADDRESS_TYPE) {
            return list;
        }
        else {
            // return
            let addresSet = list && list.find(item => item.addressTypeCd === type);
            return addresSet ? addresSet : [];
        }
    });

    render() {
        const { id, isDisabled, addressList, regionList, addressType, registerCodeList, filterSet } = this.props;
        const addressSet = this.addressSet(addressList, addressType);
        const isChiAddress = addressSet ? addressSet.addressLanguageCd === Enum.PATIENT_ADDRESS_CHINESE_LANGUAGE : false;
        const inputList = genAddressInput(isChiAddress);
        let addressRegionGp = [];
        addressRegionGp = genContactPersonRegionGp(isChiAddress, regionList, registerCodeList.district, registerCodeList.sub_district, addressSet, filterSet);

        return (
            <Grid container item xs={12} direction={'row'} spacing={1}>
                {
                    inputList.map((item, index) => {
                        if (item.label === 'blank_item') {
                            return (
                                <Grid item xs={4} key={`${item.name}${index}`}></Grid>
                            );
                        }
                        else {
                            return (
                                <Grid item xs={4} key={item.name}>
                                    <FastTextFieldValidator
                                        id={`${id}_${item.name}`}
                                        disabled={isDisabled}
                                        inputProps={{ maxLength: item.maxLength }}
                                        value={addressSet ? addressSet[item.name] : ''}
                                        onBlur={e => this.handleChangeAddress(e.target.value, addressType, item.name)}
                                        name={item.name}
                                        label={item.label}
                                        variant="outlined"
                                        calActualLength
                                    />
                                </Grid>
                            );
                        }

                    })
                }
                {
                    addressRegionGp.map(item => {
                        return (
                            <Grid item xs={4} key={item.name}>
                                <SelectFieldValidator
                                    id={`${id}_${item.name}`}
                                    options={item.dataList.map((i) => (
                                        // { value: i.code, label: isChiAddress ? (i.chiDesc ? i.chiDesc : i.engDesc) : i.engDesc, isDB: true }
                                        {
                                            code: i.code,
                                            value: isChiAddress ? (i.chiDesc ? i.chiDesc : i.engDesc) : i.engDesc,
                                            label: isChiAddress ? (i.chiDesc ? i.chiDesc : i.engDesc) : i.engDesc,
                                            isDB: true
                                        }
                                    ))}
                                    value={addressSet ? addressSet[item.name] : ''}
                                    onChange={e => this.handleChangeAddress(e.value, addressType, item.name, e.code)}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: item.label
                                    }}
                                    filterOption={(candidate, input) => {
                                        return candidate.data.isDB || !candidate.value || candidate.data.__isNew__ ? true : false;
                                    }}
                                    maxLength={item.maxLength}
                                    calActualLength
                                    isDisabled={isDisabled}
                                    addNullOption
                                    isCreatable
                                />
                            </Grid>
                        );
                    })
                }
            </Grid>
        );
    }
}
export default StructuredAddressPanel;