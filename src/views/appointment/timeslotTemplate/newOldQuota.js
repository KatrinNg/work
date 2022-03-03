import React from 'react';
import {
    Grid,
    FormHelperText
} from '@material-ui/core';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';

function RequiredIcon() {
    return (
        <span style={{ color: 'red' }}>*</span>
    );
}

class NewOldQuota extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            newNormal_Valid: true,
            newUrgent_Valid: true,
            newPublic_Valid: true,
            oldNormal_Valid: true,
            oldUrgent_Valid: true,
            oldPublic_Valid: true,
            errorMessage: {
                newNormal_errMsg: '',
                newUrgent_errMsg: '',
                newPublic_errMsg: '',
                oldNormal_errMsg: '',
                oldUrgent_errMsg: '',
                oldPublic_errMsg: ''
            }
        };
    }
    validatorListener = (isvalid, name) => {
        this.setState({ [name + '_Valid']: isvalid });
        let errMsg = this.refs[name].getErrorMessage() || '';
        let { errorMessage } = this.state;
        if (!isvalid && errMsg) {
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
        const { classes } = this.props;
        const { errorMessage } = this.state;
        let errorMsg = errorMessage.newNormal_errMsg || errorMessage.newUrgent_errMsg || errorMessage.newPublic_errMsg ||
            errorMessage.oldNormal_errMsg || errorMessage.oldUrgent_errMsg || errorMessage.oldPublic_errMsg;
        return (
            <Grid item container alignContent={'center'} direction={'row'}>
                <Grid item container>
                    <Grid item xs={3}>

                    </Grid>
                    <Grid item xs={4} style={{ textAlign: 'center', margin: 0 }}>
                            Quota
                    </Grid>
                </Grid>
                <Grid item xs={3}>

                </Grid>
                <Grid item xs={4} container spacing={1} justify={'space-between'} style={{paddingBottom: '10px'}}>
                    <Grid item xs={4}>
                        Normal/
                    </Grid>
                    <Grid item xs={4}>
                        Urgent/
                    </Grid>
                    <Grid item xs={4}>
                        Public
                    <RequiredIcon />
                    </Grid>
                </Grid>
                <Grid item style={{ position: 'relative', minWidth: '160px' }}>
                    {this.state.newNormal_Valid &&
                        this.state.newUrgent_Valid &&
                        this.state.newPublic_Valid &&
                        this.state.oldNormal_Valid &&
                        this.state.oldUrgent_Valid &&
                        this.state.oldPublic_Valid ?
                        null :
                        <FormHelperText error component="div" style={{ position: 'absolute', bottom: 12, paddingLeft: 8 }}>
                            {errorMsg}
                        </FormHelperText>}
                </Grid>
                <Grid item xs={12} container direction={'row'} alignContent={'center'} style={{ paddingBottom: 10 }}>
                    <Grid item xs={3} container justify={'center'}>
                        New
                    </Grid>
                    <Grid item xs={4} container spacing={1} justify={'space-between'}>
                        <Grid item xs={4}>
                            <TextFieldValidator
                                value={this.props.newNormal}
                                className={classes.textQuota}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'newNormal'}
                                id={'newNormal'}
                                validators={this.props.validators}
                                errorMessages={this.props.errorMessages}
                                validatorListener={e => this.validatorListener(e, 'newNormal')}
                                ref={'newNormal'}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextFieldValidator
                                value={this.props.newUrgent}
                                className={classes.textQuota}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'newUrgent'}
                                id={'newUrgent'}
                                validators={this.props.validators}
                                errorMessages={this.props.errorMessages}
                                validatorListener={e => this.validatorListener(e, 'newUrgent')}
                                ref={'newUrgent'}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextFieldValidator
                                value={this.props.newPublic}
                                className={classes.textQuota}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'newPublic'}
                                id={'newPublic'}
                                validators={this.props.validators}
                                errorMessages={this.props.errorMessages}
                                validatorListener={e => this.validatorListener(e, 'newPublic')}
                                ref={'newPublic'}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} container direction={'row'} alignContent={'center'}>
                    <Grid item xs={3} container justify={'center'}>
                        Old
                    </Grid>
                    <Grid item xs={4} container spacing={1} justify={'space-between'}>
                        <Grid item xs={4}>
                            <TextFieldValidator
                                value={this.props.oldNormal}
                                className={classes.textQuota}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'oldNormal'}
                                id={'oldNormal'}
                                validators={this.props.validators}
                                errorMessages={this.props.errorMessages}
                                validatorListener={e => this.validatorListener(e, 'oldNormal')}
                                ref={'oldNormal'}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextFieldValidator
                                value={this.props.oldUrgent}
                                className={classes.textQuota}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'oldUrgent'}
                                id={'oldUrgent'}
                                validators={this.props.validators}
                                errorMessages={this.props.errorMessages}
                                validatorListener={e => this.validatorListener(e, 'oldUrgent')}
                                ref={'oldUrgent'}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextFieldValidator
                                value={this.props.oldPublic}
                                className={classes.textQuota}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur}
                                notShowMsg
                                inputProps={{
                                    maxLength: 4
                                }}
                                name={'oldPublic'}
                                id={'oldPublic'}
                                validators={this.props.validators}
                                errorMessages={this.props.errorMessages}
                                validatorListener={e => this.validatorListener(e, 'oldPublic')}
                                ref={'oldPublic'}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}
export default NewOldQuota;