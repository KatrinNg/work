import React from 'react';
import { useDispatch } from 'react-redux';
import { Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import OverflowTypography from '../../components/OverflowTypography';
import accessRightEnum from '../../../../enums/accessRightEnum';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';

const useStyles = makeStyles(() => ({
    link: {
        width: '100%',
        textAlign: 'left'
    },
    linkText: {
        color: '#0579c8',
        textDecoration: 'underline',
        backgroundColor: '#EFEFEF'
    }
}));

const DtsPatientLink = ({ patient, tab = accessRightEnum.patientSummary }) => {
    const dispatch = useDispatch();
    const classes = useStyles();
    return (
        <Link
            className={classes.link}
            component="button"
            onClick={(event) => {
                event.stopPropagation();
                dtsUtilities.getPatientInfo({ patientKey: patient.patientKey, callback: () => dispatch(skipTab(tab)) });
            }}
        >
            <OverflowTypography noWrap popoverProps={{elevation: 0}} popoverTextProps={{ className: classes.linkText }} >
                {dtsUtilities.getPatientName(patient)}
            </OverflowTypography>
        </Link>
    );
};

export default DtsPatientLink;