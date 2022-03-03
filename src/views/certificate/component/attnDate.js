import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Box, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import Enum from '../../../enums/enum';

const useStyles = makeStyles({
    normalFont: {
        fontWeight: 'bold',
        fontSize: '16px',
        whiteSpace: 'nowrap'
    },
    overflowFont: {
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    today: {
        color: 'black'
    },
    pastdate: {
        color: 'red'
    }
});

const AttnDate = React.forwardRef((props, ref) => {
    const refEncounterType = useRef(null);
    const [overflow, setOverflow] = useState(false);

    const { encounterInfo, encounterTypes, id,label,foramtStr} = props;
    const dateFormat=foramtStr?foramtStr:Enum.DATE_FORMAT_EDMY_VALUE;
    const encounterDate = encounterInfo.encounterDate && moment(encounterInfo.encounterDate);
    const encounterTypeId = encounterInfo.encntrTypeId;
    const encounterType = encounterTypes.find(x => x.encntrTypeId === encounterTypeId);
    const encounterTypeDesc = (encounterType && encounterType.encntrTypeDesc) ?? '';
    const isToday = !!(encounterDate && encounterDate.isSame(moment(), 'day'));

    const classes = useStyles();

    useEffect(() => {
        setOverflow(refEncounterType.current.scrollWidth > refEncounterType.current.clientWidth);
    }, []);

    return (
        <Box display="flex" alignItems="baseline" id={`${id}_encounter_attnDate`}>
            <Box component="Typography" id={`${id}_encounter_attnDate_title`} className={[classes.normalFont, isToday ? classes.today : classes.pastdate]}>{label?label:'Encounter Date:'}&nbsp;&nbsp;</Box>
            <Box component="Typography" id={`${id}_encounter_attnDate_content`} className={[classes.normalFont, isToday ? classes.today : classes.pastdate]}>{encounterDate && encounterDate.format(dateFormat)}&nbsp;&nbsp;</Box>
            <Tooltip title={overflow ? encounterTypeDesc : ''}>
                <Box component="Typography" ref={refEncounterType} id={`${id}_encounter_attnDate_encounter_type_desc`} className={[classes.normalFont, classes.overflowFont, isToday ? classes.today : classes.pastdate]}>{encounterTypeDesc}</Box>
            </Tooltip>
        </Box>
    );
});

const mapState = (state) => {
    return {
        encounterInfo: state.patient.encounterInfo || {},
        encounterTypes: state.common.encounterTypes
    };
};

export default connect(mapState)(AttnDate);