import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid,
    DialogActions
} from '@material-ui/core';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSDialog from '../../../../components/Dialog/CIMSDialog';
import {
    updateField,
    addToMyFavourite,
    updateMyFavSearchInputVal
} from '../../../../store/actions/moe/myFavourite/myFavouriteAction';
// import {
//     openErrorMessage
// } from '../../../../store/actions/common/commonAction';
import CommonMessage from '../../../../constants/commonMessage';
import ValidatorEnum from '../../../../enums/validatorEnum';
import _ from 'lodash';
import {
    openCommonMessage
} from '../../../../store/actions/message/messageAction';
import {
    MOE_MSG_CODE
} from '../../../../constants/message/moe/commonRespMsgCodeMapping';

const style = {
    dialogRoot: {
        maxWidth: '100%',
        overflowY: 'unset',
        width: '50%'
    }
};
class MyFavouriteDrugSetDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errMsg: null
        };
    }
    handleSaveFavouriteDrugSet = () => {
        const { drugSet } = this.props;
        if (!drugSet) return;

        if (!drugSet.myFavouriteName || !drugSet.myFavouriteId) {
            if (drugSet.myFavouriteId && drugSet.myFavouriteId === -1) {
                if (!drugSet.myFavouriteName) {
                    this.setState({ errMsg: 'Display Name is required.' });
                    return;
                }
            }
        }

        //check duplicate for new drugset
        if (drugSet.myFavouriteId === -1) {
            let duplicateList = this.props.myFavouriteListFromBackend.filter(item =>
                item.myFavouriteName &&
                item.myFavouriteName.toUpperCase().trim() === drugSet.myFavouriteName.toUpperCase().trim());
            if (duplicateList && duplicateList.length > 0) {
                this.props.openCommonMessage({ msgCode: MOE_MSG_CODE.MY_FAV_DUPLICATED_DRUG_SET_NAME });
                // this.props.openErrorMessage('The DrugSet Name exists, please rename.', null, 'Information/Attention');
                return;
            }
        }

        let data;
        let isDrugSet = false;
        if (this.props.contextMenuSelectedItem) {
            data = _.cloneDeep(this.props.contextMenuSelectedItem);
        } else {
            data = _.cloneDeep(this.props.drugList);
            isDrugSet = true;
        }

        //filter free text data start
        if (isDrugSet) {
            let freeTextData = data.filter(item => item.freeText === 'F');
            if (freeTextData && freeTextData.length === data.length)
                return false;
            data = data.filter(item => item.freeText !== 'F');
        } else {
            if (data.freeText === 'F')
                return;
        }
        //filter free text data end

        this.props.addToMyFavourite(data, this.props.drugSet, this.props.codeList);

        this.props.updateMyFavSearchInputVal({ favKeyword: '' });
        this.setState({ errMsg: null });
    }
    handleChange = (value, name, version) => {
        let newDrugSet = { ...this.props.drugSet };
        newDrugSet[name] = value;
        newDrugSet.version = version;
        let upateData = { drugSet: newDrugSet };
        this.props.updateField(upateData);
    }

    handleCancel = () => {
        this.setState({ errMsg: null });
        if (this.props.openMyFavouriteDrugSetDialog)
            this.props.openMyFavouriteDrugSetDialog(false);
    }

    render() {
        const { drugSet, id } = this.props;
        const newMyFavouriteList = this.props.myFavouriteListFromBackend && this.props.myFavouriteListFromBackend.filter(item => item.myFavouriteName);
        return (
            <CIMSDialog
                id={id}
                open={this.props.showDugSetDialog}
            // classes={{
            //     paper: classes.dialogRoot
            // }}
            >
                <ValidatorForm onSubmit={this.handleSaveFavouriteDrugSet} style={{ width: '100%' }}>
                    <Grid container style={{ padding: 10 }}>
                        <Grid item xs={12} style={{ minWidth: '370px' }}>
                            <SelectFieldValidator
                                fullWidth
                                options={[...newMyFavouriteList && newMyFavouriteList.map((item) => {
                                    return ({ value: item.myFavouriteId, label: item.myFavouriteName, version: item.version });
                                }), { value: -1, label: '[New]', version: 0 }]}
                                labelPosition="left"
                                labelText={'My Favourite Name:'}
                                name={'myFavouriteId'}
                                onChange={e => this.handleChange(e.value, 'myFavouriteId', e.version)}
                                inputProps={{
                                    maxLength: 40
                                }}
                                labelProps={{
                                    style: { minWidth: '170px', paddingLeft: '8px', textAlign: 'left' }
                                }}
                                id={id + '_ddlMyFavouriteId'}
                                value={drugSet && drugSet.myFavouriteId}
                                notShowMsg
                                isRequried
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            // validatorListener={(...arg) => this.props.validatorListener(...arg, 'myFavouriteIdz')}
                            />
                        </Grid>
                    </Grid>
                    <Grid container style={{ padding: 10, display: drugSet && drugSet.myFavouriteId === -1 ? 'block' : 'none' }}>
                        <Grid>
                            <TextFieldValidator
                                fullWidth
                                name={'myFavouriteName'}
                                labelText={'Display Name:'}
                                labelPosition="left"
                                variant={'outlined'}
                                onChange={e => this.handleChange(e.target.value, 'myFavouriteName')}
                                inputProps={{
                                    maxLength: 50
                                }}
                                labelProps={{
                                    style: { minWidth: '170px', paddingLeft: '8px', textAlign: 'left' }
                                }}
                                trim={'all'}
                                error={this.state.errMsg ? true : false}
                                value={(drugSet && drugSet.myFavouriteName) || ''}
                                id={id + '_txtMyFavouriteName'}
                            />
                        </Grid>
                    </Grid>
                    <DialogActions>
                        <CIMSButton
                            // disabled={!drugSet || (drugSet && (!drugSet.ddlMmyFavouriteIdyFavouriteId || !drugSet.myFavouriteName))}
                            // onClick={this.handleSaveFavouriteDrugSet}
                            type={'submit'}
                            id={id + '_btnSave'}
                        >
                            OK
                            </CIMSButton>
                        <CIMSButton onClick={this.handleCancel}
                            id={id + '_btnCancel'}
                        >
                            Cancel
                            </CIMSButton>
                    </DialogActions>
                </ValidatorForm>
            </CIMSDialog>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        //my favourite
        showDugSetDialog: state.moeMyFavourite.showDugSetDialog,
        myFavouriteListFromBackend: state.moeMyFavourite.myFavouriteListFromBackend,
        // myFavouriteList: state.moeMyFavourite.myFavouriteList,
        drugSet: state.moeMyFavourite.drugSet,
        codeList: state.moe.codeList
    };
};
const mapDispatchToProps = {
    updateField,
    addToMyFavourite,
    updateMyFavSearchInputVal,
    // openErrorMessage,
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(MyFavouriteDrugSetDialog));