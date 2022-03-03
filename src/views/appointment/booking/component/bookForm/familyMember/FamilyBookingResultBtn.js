import { Button, makeStyles } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import EventIcon from '@material-ui/icons/Event';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import FamilyMemberDialog from './FamilyMemberDialog';
import PropTypes from 'prop-types';
import { FamilyNumberContextProvider } from './FamilyNumberContext';

const useStyles = makeStyles((theme) => ({
    button: {
        marginBottom: '58vh',
        position: 'absolute',
        bottom: '40px',
        left: '70px'
    },
    badge: {
        marginLeft: theme.spacing(1)
    }
}));

const FamilyBookingResultBtn = ({ isAttend, isDateBack }) => {
    const classes = useStyles();

    const { selectedFamilyMember, selectedAttnFamilyMember, selectedDateBackFamilyMember } = useSelector(
        (state) => state.bookingInformation
    );

    const [isOpen, setisOpen] = useState(false);

    const toggle = () => setisOpen(!isOpen);

    const countMember = useMemo(() => {
        if (selectedFamilyMember.length > 0)
            return `${selectedFamilyMember.length + 1}/${selectedFamilyMember.length + 1}`;
    }, [selectedFamilyMember.length]);

    const countAttnMember = useMemo(() => {
        if (selectedAttnFamilyMember.length > 0)
            return `${selectedAttnFamilyMember.length + 1}/${selectedAttnFamilyMember.length + 1}`;
        else return 1;
    }, [selectedAttnFamilyMember.length]);

    const countDateBackMember = useMemo(() => {
        if (selectedDateBackFamilyMember.length > 0)
            return `${selectedDateBackFamilyMember.length + 1}/${selectedDateBackFamilyMember.length + 1}`;
        else return 1;
    }, [selectedDateBackFamilyMember.length]);

    const showBtn = useMemo(() => {
        if (isAttend) return selectedAttnFamilyMember.length > 0;
        else if (isDateBack) return selectedDateBackFamilyMember.length > 0;
        else return selectedFamilyMember.length > 0;
    }, [
        isAttend,
        isDateBack,
        selectedFamilyMember.length,
        selectedDateBackFamilyMember.length,
        selectedAttnFamilyMember.length
    ]);

    // console.log(
    //     isAttend,
    //     isDateBack,
    //     selectedFamilyMember.length,
    //     selectedDateBackFamilyMember.length,
    //     selectedAttnFamilyMember.length
    // );

    return (
        showBtn && (
            <FamilyNumberContextProvider value={{ isAttend, isDateBack }}>
                <FamilyMemberDialog isOpen={isOpen} toggle={toggle} showResult />

                <Button className={classes.button} variant="contained" color="primary" onClick={toggle}>
                    {isAttend || isDateBack ? 'Attend Result' : 'Book Result'}
                    <Badge
                        className={classes.badge}
                        color="secondary"
                        badgeContent={isAttend ? countAttnMember : isDateBack ? countDateBackMember : countMember}
                        showZero
                    >
                        <EventIcon />
                    </Badge>
                </Button>
            </FamilyNumberContextProvider>
        )
    );
};

FamilyBookingResultBtn.prototype = {
    isAttend: PropTypes.bool,
    isDateBack: PropTypes.bool
};

export default FamilyBookingResultBtn;
