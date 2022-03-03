import React, { Component } from 'react';
import { Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import EncounterGroup from './encounterGroup';
import Encounter from './encounter';
import Room from './room';
import { filterRoomsEncounterTypeSvc } from '../../enums/enum';

const EncounterWithRoom = React.forwardRef((props, ref) => {
    const {
        encntrGrpList,
        encounterGroupConfig,
        encounterTypeConfig,
        roomConfig,
        handleOnChange,
        serviceCd
    } = props;

    return (
        <>
            {
                encntrGrpList && encntrGrpList.length > 1 ?
                    <EncounterGroup
                        handleOnChange={handleOnChange}
                        {...encounterGroupConfig}
                    />
                 : null
            }
            {
                filterRoomsEncounterTypeSvc.indexOf(serviceCd) > -1 ?
                <>
                    <Room
                        handleOnChange={handleOnChange}
                        {...roomConfig}
                    />
                    <Encounter
                        handleOnChange={handleOnChange}
                        {...encounterTypeConfig}
                    />
                </>
                :
                <>
                    <Encounter
                        handleOnChange={handleOnChange}
                        {...encounterTypeConfig}
                    />
                    <Room
                        handleOnChange={handleOnChange}
                        {...roomConfig}
                    />
                </>
            }
        </>
    );
});

const mapStateToProps = (state) => {
    return {
        encntrGrpList: state.caseNo.encntrGrpList,
        serviceCd: state.login.loginForm.svcCd
    };
};

export default connect(mapStateToProps)(EncounterWithRoom);