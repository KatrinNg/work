import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { getContactUs } from '../../../store/actions/login/loginAction';

const styles = {
    container: {
        minWidth: '440px'
    },
    gridPaddingTop5: {
        paddingTop: 5
    },
    gridPaddingLeft30: {
        paddingLeft: 30
    }
};

function ContactUs(props) {
    /* eslint-disable */
    useEffect(() => {
        props.getContactUs();
    }, []);

    const gripItemSize = (itemIndex) => {
        if (itemIndex === 0) return 2;
        if (itemIndex === 1) return 5;
        return 3;
    }

    /* eslint-enable */
    const { classes, contactUs } = props;
    const address = contactUs.find(item => item.paramName === 'CONTACT_ADDRESS');
    const fax = contactUs.find(item => item.paramName === 'CONTACT_FAX');
    const phoneList = contactUs.find(item => item.paramName === 'CONTACT_PHONE');
    const email = contactUs.find(item => item.paramName === 'CONTACT_EMAIL');
    const note = contactUs.find(item => item.paramName === 'CONTACT_LOTUS_NOTES');
    const remark = contactUs.find(item => item.paramName === 'CONTACT_REMARK');

    const phoneRows = phoneList?.paramValue.split('/#').filter(x => x != null && x.trim() !== '').map(x => x.split('/|').filter(x => x != null && x.trim() !== ''));

    return (
        <>
            <Grid className={classes.container} container direction="column" justify="center" alignItems="center">
                <Typography component="p" variant="h6" style={{ textDecoration: 'underline' }}>Contact Us</Typography>
                <Typography component="p" variant="h6">CIMS 2 Helpdesk</Typography>
                {phoneRows?.map((row, r) =>
                    <Grid key={r} item container justify="center">
                        {row?.map((field, c) =>
                            <Grid
                                key={c} className={[classes.gridPaddingTop5, ...[c === 0 ? [] : classes.gridPaddingLeft30]]}
                                item xs={gripItemSize(c)} container justify={c === 0 ? 'flex-end' : 'flex-start'}
                            >
                                <Typography noWrap>{field}</Typography>
                            </Grid>
                        )}
                    </Grid>
                )}

                <Grid item container justify="center">
                    <Grid className={[classes.gridPaddingTop5]} item xs={2} container justify="flex-end"><Typography noWrap></Typography></Grid>
                    <Grid className={[classes.gridPaddingTop5, classes.gridPaddingLeft30]} item xs={8} container justify="flex-start"><Typography noWrap>{remark && remark.paramValue}</Typography></Grid>
                </Grid>

                <Grid item container justify="center">
                    <Grid className={[classes.gridPaddingTop5]} item xs={2} container justify="flex-end"><Typography noWrap>Email:</Typography></Grid>
                    <Grid className={[classes.gridPaddingTop5, classes.gridPaddingLeft30]} item xs={8} container justify="flex-start"><Typography noWrap>{email && email.paramValue}</Typography></Grid>
                </Grid>
                {/* <Grid item container justify="center">
                    <Grid item xs={2} container justify="flex-end">Address:</Grid>
                    <Grid item xs={4} className={classes.gridPadding10}>{address && address.paramValue}</Grid>
                </Grid>
                <Grid item container justify="center">
                    <Grid item xs={2} container justify="flex-end">Fax:</Grid>
                    <Grid item xs={4} className={classes.gridPadding10}>{fax && fax.paramValue}</Grid>
                </Grid>
                <Grid item container justify="center">
                    <Grid item xs={2} container justify="flex-end">Phone:</Grid>
                    <Grid item xs={4} className={classes.gridPadding10}>{phone && phone.paramValue}</Grid>
                </Grid>
                <Grid item container justify="center">
                    <Grid item xs={2} container justify="flex-end">Email Address:</Grid>
                    <Grid item xs={4} className={classes.gridPadding10}>{email && email.paramValue}</Grid>
                </Grid>
                <Grid item container justify="center">
                    <Grid item xs={2} container justify="flex-end">Lotus Notes:</Grid>
                    <Grid item xs={4} className={classes.gridPadding10}>{note && note.paramValue}</Grid>
                </Grid> */}
            </Grid>
        </>
    );
}

function mapStateToProps(state) {
    return {
        contactUs: state.login.contactUs
    };
}

const mapDispatchToProps = {
    getContactUs
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ContactUs));