import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
    Grid,
    FormHelperText
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import TextFieldValidator from '../../components/FormValidator/TextFieldValidator';
import CIMSInputLabel from '../../components/InputLabel/CIMSInputLabel';
// import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import * as CommonUtil from '../../utilities/commonUtilities';
import Enum from '../../enums/enum';

const styles = () => ({

});

class NewOldQuota extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newNormal_Valid: true,
            newForce_Valid: true,
            newPublic_Valid: true,
            oldNormal_Valid: true,
            oldForce_Valid: true,
            oldPublic_Valid: true,
            errorMessage: {
                newNormal_errMsg: '',
                newForce_errMsg: '',
                newPublic_errMsg: '',
                oldNormal_errMsg: '',
                oldForce_errMsg: '',
                oldPublic_errMsg: ''
            },
            defaultQuotaValue: null,
            defaultQuotaDescValue: null
        };
    }

    UNSAFE_componentWillMount() {
        const where1 = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd, encounterCd: this.props.encounterTypeCd, subEncounterCd: this.props.subEncounterTypeCd };
        const defaultQuota = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE, this.props.clinicConfig, where1);
        const where2 = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        const defaultQuotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, this.props.clinicConfig, where2);

        const defaultQuotaTypeArr = defaultQuota.configValue && defaultQuota.configValue.length === 6 ? defaultQuota.configValue : '111111';
        const quotaArr = defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : null;
        const defaultQuotaDescArr = ['Normal', 'Force', 'Public'];
        if (quotaArr) {
            for (let i = 0; i < defaultQuotaDescArr.length; i++) {
                if (quotaArr[i]) {
                    defaultQuotaDescArr[i] = quotaArr[i];
                }
            }
        }
        this.setState({ defaultQuotaValue: defaultQuotaTypeArr, defaultQuotaDescValue: defaultQuotaDescArr });
    }

    validatorListener = (isvalid, name) => {
        this.setState({ [name + '_Valid']: isvalid });
        let errMsg = this.refs[name].getErrorMessage() || '';
        let { errorMessage } = this.state;
        if (!isvalid && errMsg !== true && errMsg) {
            errorMessage[name + '_errMsg'] = errMsg;
        } else {
            errorMessage[name + '_errMsg'] = '';
        }
        this.setState({ errorMessage });
    }

    handleChange = (e) => {
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    handleBlur = (e) => {
        let name = e.target.name;
        if (!this.state[name + '_Valid'])
            return;
        if (this.props.blur)
            this.props.blur(e);
    }

    render() {
        const { comDisabled } = this.props;
        const id = this.props.id || 'NewOldQuota';
        const { errorMessage, defaultQuotaValue, defaultQuotaDescValue } = this.state;
        let errorMsg = errorMessage.newNormal_errMsg || errorMessage.newForce_errMsg || errorMessage.newPublic_errMsg ||
            errorMessage.oldNormal_errMsg || errorMessage.oldForce_errMsg || errorMessage.oldPublic_errMsg;

        return (
            <Grid container direction="column">
                <Grid item container justify="center" spacing={1}>
                    <Grid item container spacing={1}>
                        <Grid item xs={1}></Grid>
                        <Grid item container xs justify="center" alignContent="flex-end"><CIMSInputLabel>{defaultQuotaDescValue[0]}</CIMSInputLabel></Grid>
                        <Grid item container xs justify="center" alignContent="flex-end"><CIMSInputLabel>{defaultQuotaDescValue[1]}</CIMSInputLabel></Grid>
                        <Grid item container xs justify="center" alignContent="flex-end"><CIMSInputLabel>{defaultQuotaDescValue[2]}</CIMSInputLabel></Grid>
                    </Grid>
                    <Grid item container alignItems="flex-end" spacing={1}>
                        <Grid item container xs={1} justify="center"><CIMSInputLabel>New</CIMSInputLabel></Grid>
                        <Grid item xs>
                            <TextFieldValidator
                                disabled={comDisabled || defaultQuotaValue[0] === '0'}
                                value={this.props.newNormal.toString()}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'newNormal'}
                                id={id + '_newNormal'}
                                validators={this.props.validators || []}
                                errorMessages={this.props.errorMessages || []}
                                validatorListener={e => this.validatorListener(e, 'newNormal')}
                                ref={'newNormal'}
                            />
                        </Grid>
                        <Grid item xs>
                            <TextFieldValidator
                                disabled={comDisabled || defaultQuotaValue[1] === '0'}
                                value={this.props.newForce.toString()}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'newForce'}
                                id={id + '_newForce'}
                                validators={this.props.validators || []}
                                errorMessages={this.props.errorMessages || []}
                                validatorListener={e => this.validatorListener(e, 'newForce')}
                                ref={'newForce'}
                            />
                        </Grid>
                        <Grid item xs>
                            <TextFieldValidator
                                disabled={comDisabled || defaultQuotaValue[2] === '0'}
                                value={this.props.newPublic.toString()}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'newPublic'}
                                id={id + '_newPublic'}
                                validators={this.props.validators || []}
                                errorMessages={this.props.errorMessages || []}
                                validatorListener={e => this.validatorListener(e, 'newPublic')}
                                ref={'newPublic'}
                            />
                        </Grid>
                    </Grid>
                    <Grid item container alignItems="flex-end" spacing={1}>
                        <Grid item container xs={1} justify="center"><CIMSInputLabel>Old</CIMSInputLabel></Grid>
                        <Grid item xs>
                            <TextFieldValidator
                                disabled={comDisabled || defaultQuotaValue[3] === '0'}
                                value={this.props.oldNormal.toString()}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'oldNormal'}
                                id={id + '_oldNormal'}
                                validators={this.props.validators || []}
                                errorMessages={this.props.errorMessages || []}
                                validatorListener={e => this.validatorListener(e, 'oldNormal')}
                                ref={'oldNormal'}
                            />
                        </Grid>
                        <Grid item xs>
                            <TextFieldValidator
                                disabled={comDisabled || defaultQuotaValue[4] === '0'}
                                value={this.props.oldForce.toString()}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'oldForce'}
                                id={id + '_oldForce'}
                                validators={this.props.validators || []}
                                errorMessages={this.props.errorMessages || []}
                                validatorListener={e => this.validatorListener(e, 'oldForce')}
                                ref={'oldForce'}
                            />
                        </Grid>
                        <Grid item xs>
                            <TextFieldValidator
                                disabled={comDisabled || defaultQuotaValue[5] === '0'}
                                value={this.props.oldPublic.toString()}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'oldPublic'}
                                id={id + '_oldPublic'}
                                validators={this.props.validators || []}
                                errorMessages={this.props.errorMessages || []}
                                validatorListener={e => this.validatorListener(e, 'oldPublic')}
                                ref={'oldPublic'}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    {this.state.newNormal_Valid &&
                        this.state.newForce_Valid &&
                        this.state.newPublic_Valid &&
                        this.state.oldNormal_Valid &&
                        this.state.oldForce_Valid &&
                        this.state.oldPublic_Valid ?
                        null :
                        <FormHelperText error component="div" id={id + '_helperText'}>
                            {errorMsg}
                        </FormHelperText>}
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd
    };
};
const dispatchToProps = {
};

NewOldQuota.propTypes = {
    encounterTypeCd: PropTypes.string.isRequired,
    subEncounterTypeCd: PropTypes.string.isRequired,
    newNormal: PropTypes.string.isRequired,
    newForce: PropTypes.string.isRequired,
    newPublic: PropTypes.string.isRequired,
    oldNormal: PropTypes.string.isRequired,
    oldForce: PropTypes.string.isRequired,
    oldPublic: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    errorMessages: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string
    ]),
    validators: PropTypes.array
};

export default connect(mapStateToProps, dispatchToProps)(withStyles(styles)(NewOldQuota));