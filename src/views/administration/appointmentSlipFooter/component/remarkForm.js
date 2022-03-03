import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid
} from '@material-ui/core';
import FormValidator from '../../../../components/FormValidator/ValidatorForm';
import TextFieldValidtor from '../../../../components/FormValidator/TextFieldValidator';
import ButtonStatusEnum from '../../../../enums/administration/buttonStatusEnum';

const style = theme => ({

    grid: {
        marginTop: 5,
        marginBottom: 5
    },
    textField: {
        marginRight: theme.spacing(1),
        width:100
    },
    textFieldContent:{
        flex:1
    },
    formGrid:{
        overflow: 'hidden',
        height: 'calc(100vh - 390px)'
    },
    form:{
        overflow:'auto'
    }
});



class RemarkForm extends React.Component {

    handleRemarkDetailsChange = (e, idx, field) => {
        this.props.remarkDetailsOnChange(e.target.value, idx, field);
    }

    render() {
        const { classes } = this.props;
        let tempRemarkDetails = this.props.remarkDetails;
        let currentStatus = this.props.currentStatus;
        return (
            <Grid container direction={'column'}>
                <Grid container direction={'row'}>
                    <label>Appointment Slip Footer</label>
                </Grid>
                <Grid container direction={'column'} className={classes.formGrid}>
                    <FormValidator
                        id={this.props.id}
                        ref={'form'}
                        className={classes.form}
                        onSubmit={() => { }}
                    >
                        <Grid item container xs={8} className={classes.grid} direction={'column'}>
                            {
                                tempRemarkDetails.map((value, i) => {
                                    return (
                                        <Grid item container  className={classes.grid} key={i}>
                                            <Grid item  className={classes.textField}>
                                                <TextFieldValidtor
                                                    id={this.props.id + 'DispalyOrderTextField_' + i}
                                                    //variant={'outlined'}
                                                    variant={'outlined'}
                                                    fullWidth
                                                    value={value.disPlayOrder}
                                                    disabled={currentStatus === ButtonStatusEnum.VIEW}
                                                    onChange={e => this.handleRemarkDetailsChange(e, i, 'disPlayOrder')}
                                                    autoComplete={'off'}
                                                    /* eslint-disable */
                                                    inputProps={{
                                                        maxLength: 3
                                                    }}
                                                /* eslint-enable */
                                                />
                                            </Grid>
                                            <Grid item className={classes.textFieldContent} >
                                                <TextFieldValidtor
                                                    id={this.props.id + 'ContentTextField_' + i}
                                                    variant={'outlined'}
                                                    fullWidth
                                                    value={value.content}
                                                    disabled={currentStatus === ButtonStatusEnum.VIEW}
                                                    autoComplete={'off'}
                                                    onChange={e => this.handleRemarkDetailsChange(e, i, 'content')}
                                                    /* eslint-disable */
                                                    inputProps={{
                                                        maxLength: 100
                                                    }}
                                                /* eslint-enable */
                                                />
                                            </Grid>
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>

                    </FormValidator>
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(style)(RemarkForm);