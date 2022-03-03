import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import Grid from '@material-ui/core/Grid';
import MoveSideButtons from '../../../../components/Buttons/MoveSideButtons';
import ApptDetailContainer from './apptDetailContainer';
import { updateState, searchApptDetails } from '../../../../store/actions/appointment/redistribution/redistributionAction';
import { isValidCriteria } from '../../../../utilities/redistributionUtilities';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
const ApptRedistContainer = React.forwardRef((props, ref) => {
    const {
        isDisabledCriteria,
        fromSearchCriteria,
        toSearchCriteria,
        fromTargetData,
        toTargetData,
        fromSelected,
        toSelected
    } = props;

    let fromDetailsRef = React.useRef(null);
    let toDetailsRef = React.useRef(null);

    const handleOnChange = (obj, role) => {
        if (_.toUpper(role) === 'FROM') {
            let _fromSearchCriteria = { ...fromSearchCriteria, ...obj };
            props.updateState({ fromSearchCriteria: _fromSearchCriteria });
            if (isValidCriteria(_fromSearchCriteria)) {
                props.searchApptDetails({ role: 'from', criteria: _fromSearchCriteria });
                fromDetailsRef && fromDetailsRef.current && fromDetailsRef.current.resetForm();
            }
        } else if (_.toUpper(role) === 'TO') {
            let _toSearchCriteria = { ...toSearchCriteria, ...obj };
            props.updateState({ toSearchCriteria: _toSearchCriteria });
            if (isValidCriteria(_toSearchCriteria)) {
                props.searchApptDetails({ role: 'to', criteria: _toSearchCriteria });
                toDetailsRef && toDetailsRef.current && toDetailsRef.current.resetForm();
            }
        }
    };

    const handleOnClickAppt = (data, role) => {
        if (_.toUpper(role) === 'FROM') {
            let _fromSelected = _.cloneDeep(fromSelected);
            const ind = _fromSelected.findIndex(x => x === data.apptId);
            if (ind !== -1) {
                _fromSelected.splice(ind, 1);
            } else {
                _fromSelected.push(data.apptId);
            }
            props.updateState({ fromSelected: _fromSelected });
        } else if (_.toUpper(role) === 'TO') {
            let _toSelected = _.cloneDeep(toSelected);
            const ind = _toSelected.findIndex(x => x === data.apptId);
            if (ind !== -1) {
                _toSelected.splice(ind, 1);
            } else {
                _toSelected.push(data.apptId);
            }
            props.updateState({ toSelected: _toSelected });
        }
    };

    return (
        <Grid container wrap="nowrap" style={{ height: '100%' }}>
            <Grid item container>
                <ApptDetailContainer
                    id="redistribution_leftDetail"
                    innerRef={fromDetailsRef}
                    role={'From'}
                    criteria={fromSearchCriteria}
                    onChange={handleOnChange}
                    onClickAppt={handleOnClickAppt}
                    rows={fromTargetData}
                    disableCriteria={isDisabledCriteria}
                    selectedData={fromSelected}
                />
            </Grid>
            <MoveSideButtons
                id="redistribution_moveBtn"
                allRightBtnProps={{
                    disabled: !props.isAllRightEnabled,
                    onClick: ()=>{
                        props.auditAction(AlsDesc.AR, null, null, false, 'ana');
                        props.onClickAllRight();
                    }
                }}
                singleRightBtnProps={{
                    disabled: !props.isSingleRightEnabled,
                    onClick:()=>{
                        props.auditAction(AlsDesc.SR, null, null, false, 'ana');
                        props.onClickSingleRight();
                    }
                }}
                singleLeftBtnProps={{
                    disabled: !props.isSingleLeftEnabled,
                    onClick: ()=>{
                        props.auditAction(AlsDesc.SL, null, null, false, 'ana');
                        props.onClickSingleLeft();
                    }
                }}
                allLeftBtnProps={{
                    disabled: !props.isAllLeftEnabled,
                    onClick: ()=>{
                        props.auditAction(AlsDesc.AL, null, null, false, 'ana');
                        props.onClickAllLeft();
                    }
                }}
            />
            <Grid item container>
                <ApptDetailContainer
                    id="redistribution_rightDetail"
                    innerRef={toDetailsRef}
                    role={'To'}
                    criteria={toSearchCriteria}
                    onChange={handleOnChange}
                    onClickAppt={handleOnClickAppt}
                    rows={toTargetData}
                    disableCriteria={isDisabledCriteria}
                    selectedData={toSelected}
                />
            </Grid>
        </Grid>
    );
});

const mapState = state => ({
    fromSearchCriteria: state.redistribution.fromSearchCriteria,
    toSearchCriteria: state.redistribution.toSearchCriteria,
    fromOriginalData: state.redistribution.fromOriginalData,
    toOriginalData: state.redistribution.toOriginalData,
    fromTargetData: state.redistribution.fromTargetData,
    toTargetData: state.redistribution.toTargetData,
    fromSelected: state.redistribution.fromSelected,
    toSelected: state.redistribution.toSelected
});

const mapDispatch = {
    updateState,
    searchApptDetails,
    auditAction
};

export default connect(mapState, mapDispatch)(ApptRedistContainer);