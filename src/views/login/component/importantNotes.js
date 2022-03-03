import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = {
    margin20: {
        marginTop: 10,
        marginBottom: 10
    }
};

function ImportantNotes(props) {
    const { classes } = props;
    return (
        <>
            <Grid item container direction="column">
                <Typography component="div" variant="h6" style={{ textAlign: 'center', marginBottom: 10 }}>Important Notes for CIMS Users</Typography>
                <Typography component="div" style={{ overflowY: 'auto', maxHeight: 500 }}>
                    <Typography className={classes.margin20}>
                        <b>1.</b> The data stored in the CIMS are for use within the Department of Health (DH). Upon having consent from clients, the data will be shared with the territory-wide electronic Health Record (eHR) Sharing System. Identifiable personal data will be disclosed to other Government bureaux/departments only with prior consent from the person concerned or if it is allowed by law or under court order.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>2.</b> DH is the data owner and staffs of individual services joining the CIMS are the data users. The data would be classified as RESTRICTED. All personal information including information about clients or CIMS users must be used on the “need-to-know” and “patient-under-care”principles. It must not be used for any unauthorised purpose or by any unauthorised person.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>3.</b> According to the data protection principles in Personal Data (Privacy) Ordinance (PD(P)O), data users are expected to have the duty to protect the data collected in terms of confidentiality, integrity, disclosure and security. All DH officers performing data processing should strictly observe the Ordinance and always uphold the confidentiality of clients' data.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>4.</b> Any activity which involves the duplication of client data, e.g. printing, data download or transcription, etc., will be classified as data export, and these data are also under the protection of the PD(P)O. The RESTRICTED data can be stored on the hard drive of a portable/desktop computer only if the computer is attended or is in a locked room or cabinet. When RESTRICTED data is stored on a removable media, this IT device must be kept either in a locked steel filing cabinet when not attended or in an office which is locked up after office hours. Proper data encryption must be taken to protect the exported data. The downloaded data can only be used within the office. If use of data at a place outside the office is required, users of such data must seek their Service Head’s approval.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>5.</b> If any personal information is suspected of being/is lost or disclosed to unauthorised parties, or complaints of non-compliance related to data privacy or security have been received, the immediate supervisor of the user concerned must be notified immediately and the case must be reported according to the Departmental Information Security Incident Handling Plan of DH.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>6.</b> All access to client data will be logged for auditing purpose. The audit log reports will be reviewed and checked periodically. They may become evidence in legal proceedings and thus shall not be deleted, overwritten, or modified. Irregular usages will be brought to the attention of the Health Informatics &amp; Technology Office (HITO) and/or DH’s senior management. CIMS users will be required to explain any exceptions discovered in their system access logs.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>7.</b> Each CIMS user is given a unique user ID and a password to log in to the CIMS. It is the responsibility of the CIMS users to protect the security of their login information. Shared or group user-ID is not permitted unless explicitly approved.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>8.</b> Client data in the CIMS will not be allowed to be copied electronically for use in other applications and will be automatically cleared once the CIMS session is closed or terminated.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>9.</b> Users are recommended to log out of CIMS once they have finished using a login session. Moreover, the session will be automatically logged out for inactivity over a pre-defined period of time.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>10.</b> It is prohibited to install other software into the CIMS client workstations except those with prior approval by the Service Head of individual Service in consultation with HITO. It is not allowed to execute other applications once the CIMS is running. The CIMS user has to log out or terminate the CIMS session before using other applications. Periodical and ad-hoc scanning for illegal software installed will be conducted to check for non-compliance.
                    </Typography>
                    <Typography className={classes.margin20}>
                        <b>11.</b> CIMS users should report any operation failures to the CIMS Hotline Support as soon as possible.
                    </Typography>
                </Typography>
            </Grid>
        </>
    );
}

export default withStyles(styles)(ImportantNotes);