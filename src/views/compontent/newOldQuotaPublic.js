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

class NewOldQuotaPublic extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            errorMessage: {},
            errorMsg: '',
            defaultQuotaValue: null,
            defaultQuotaDescValue: null
        };
    }

    UNSAFE_componentWillMount() {
        const where1 = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd, encounterCd: this.props.encounterTypeCd, subEncounterCd: this.props.subEncounterTypeCd };
        const defaultQuota = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE, this.props.clinicConfig, where1);
        const where2 = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        // const defaultQuotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, this.props.clinicConfig, where2);
        const defaultQuotaTypeArr = defaultQuota.configValue && defaultQuota.configValue.length === 6 ? defaultQuota.configValue : '111111';
        // const hardQuotaDesc = 'N:Normal|F:Force|P:Public|';
        // const quotaArr = defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : hardQuotaDesc.split('|');
        // let newQuotaArr = CommonUtil.transformToMap(quotaArr);
        let newQuotaArr = this.props.loadQuotaType(where2);
        this.setState({ defaultQuotaValue: defaultQuotaTypeArr, defaultQuotaDescValue: newQuotaArr });
    }

    componentDidMount() {
        let errorMessage = this.state.errorMessage;
        this.state.defaultQuotaDescValue.forEach((item) => {
            errorMessage['new' + item.engDesc + '_errMsg'] = '';
            this.setState({
                ['new' + item.engDesc + '_Valid']: true,
                ['old' + item.engDesc + '_Valid']: true,
                errorMessage: errorMessage
            });
        });
    }

    validatorListener = (isvalid, name) => {
        this.setState({ [name + '_Valid']: isvalid });
        let errMsg = this.refs[name].getErrorMessage() || '';
        let { errorMessage } = this.state;
        if (!isvalid && errMsg !== true && errMsg) {
            errorMessage[name + '_errMsg'] = errMsg;
            this.setState({ errorMsg: errMsg });
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
        const id = this.props.id || 'NewOldQuotaPublic';
        const { defaultQuotaValue, defaultQuotaDescValue, errorMsg } = this.state;

        let validResult = true;
        defaultQuotaDescValue && defaultQuotaDescValue.forEach((item, index) => {
            if (this.state[item.engDesc + '_Valid'] === false) {
                validResult = false;
            }
        });
        return (
            <Grid container direction="column">
                <Grid item container justify="center" spacing={1}>
                    <Grid item container spacing={1}>
                        <Grid item xs={1}></Grid>
                        {
                            defaultQuotaDescValue && defaultQuotaDescValue.map((itemContent, index) => {
                                return <Grid key={index} item container xs justify="center" alignContent="flex-end"><CIMSInputLabel>{itemContent.engDesc}</CIMSInputLabel></Grid>;
                            })
                        }

                    </Grid>
                    <Grid item container alignItems="flex-end" spacing={1}>
                        <Grid item container xs={1} justify="center"><CIMSInputLabel style={{ wordBreak: 'unset' }}>New</CIMSInputLabel></Grid>
                        {
                            defaultQuotaDescValue && defaultQuotaDescValue.map((itemContent, index) => {
                                return < Grid item xs key={index}>
                                    <TextFieldValidator
                                        disabled={comDisabled || defaultQuotaValue[index] === '0'}
                                        value={this.props.quotaOption['new' + itemContent.engDesc] && this.props.quotaOption['new' + itemContent.engDesc].toString()}
                                        onChange={this.handleChange}
                                        onBlur={this.handleBlur}
                                        notShowMsg
                                        inputProps={{
                                            maxLength: 4
                                        }}
                                        name={'new' + itemContent.engDesc}
                                        id={id + '_new' + itemContent.engDesc}
                                        validators={this.props.validators || []}
                                        errorMessages={this.props.errorMessages || []}
                                        validatorListener={e => this.validatorListener(e, 'new' + itemContent.engDesc)}
                                        ref={'new' + itemContent.engDesc}
                                    />
                                </Grid>;
                            })

                        }

                    </Grid>
                    <Grid item container alignItems="flex-end" spacing={1}>
                        <Grid item container xs={1} justify="center"><CIMSInputLabel style={{ wordBreak: 'unset' }}>Old</CIMSInputLabel></Grid>
                        {
                            defaultQuotaDescValue && defaultQuotaDescValue.map((itemContent, index) => {
                                return < Grid item xs key={index}>
                                    <TextFieldValidator
                                        disabled={comDisabled || defaultQuotaValue[index + defaultQuotaDescValue.length] === '0'}
                                        value={this.props.quotaOption['old' + itemContent.engDesc] && this.props.quotaOption['old' + itemContent.engDesc].toString()}
                                        onChange={this.handleChange}
                                        onBlur={this.handleBlur}
                                        notShowMsg
                                        inputProps={{
                                            maxLength: 4
                                        }}
                                        name={'old' + itemContent.engDesc}
                                        id={id + '_old' + itemContent.engDesc}
                                        validators={this.props.validators || []}
                                        errorMessages={this.props.errorMessages || []}
                                        validatorListener={e => this.validatorListener(e, 'old' + itemContent.engDesc)}
                                        ref={'old' + itemContent.engDesc}
                                    />
                                </Grid>;
                            })

                        }

                    </Grid>
                </Grid>
                <Grid item>
                    {
                        validResult ?
                            null :
                            <FormHelperText error component="div" id={id + '_helperText'}>
                                {errorMsg}
                            </FormHelperText>}
                </Grid>
            </Grid >
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

NewOldQuotaPublic.propTypes = {
    encounterTypeCd: PropTypes.string.isRequired,
    subEncounterTypeCd: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    errorMessages: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string
    ]),
    validators: PropTypes.array
};

export default connect(mapStateToProps, dispatchToProps)(withStyles(styles)(NewOldQuotaPublic));