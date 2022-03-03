import React from 'react';
import { Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import { getSppSiteAlter } from '../../../store/actions/common/commonAction';
import { withStyles } from '@material-ui/core/styles';
class SiteAlterOpts extends React.Component {

    state = {
        siteOpts: null
    }

    componentDidMount() {
        const { svcCd, selCert } = this.props;
        if (svcCd === 'SPP') {
            this.props.getSppSiteAlter((data) => {
                this.setState({
                    siteOpts: data
                });
                if ((!selCert) || (!selCert.certInfo)) {
                    const dfltSiteAlter = this.getDfltSiteAlter(data);
                    this.handleSiteChange(dfltSiteAlter.codSppSiteAlterCd || null);
                }
            });
        }
    }

    getDfltSiteAlter = () => {
        const { siteOpts } = this.state;
        const dfltSiteAlter = siteOpts && siteOpts.find(x => x.isDefault === true);
        return dfltSiteAlter;
    }

    handleSiteChange = (value) => {
        //this.setState({ siteVal: value });
        this.props.updateSiteAlter(value, 'codSppSiteAlterCd');
    };

    render() {
        const { id, codSppSiteAlterCd, isDisabled } = this.props;
        const { siteOpts } = this.state;
        return (
            <Grid container item xs={6}>
                <SelectFieldValidator
                    id={`${id}_site_alter_options`}
                    value={codSppSiteAlterCd || null}
                    options={siteOpts && siteOpts.map(item => ({ value: item.codSppSiteAlterCd, label: `${item.siteEngName} - ${item.siteChiName}` }))}
                    onChange={e => this.handleSiteChange(e.value)}
                    TextFieldProps={{
                        label: <>Clinic<RequiredIcon /></>,
                        variant: 'outlined'
                    }}
                    validators={[ValidatorEnum.required]}
                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    isDisabled={isDisabled}
                />

            </Grid>
        );
    }

}

const mapState = (state) => {
    return {
        svcCd: state.login.service.svcCd
    };
};
const dispatch = {
    getSppSiteAlter
};

const styles = () => ({
});

export default connect(mapState, dispatch)(withStyles(styles)(SiteAlterOpts));