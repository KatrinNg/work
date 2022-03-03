
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { checkMwecs, closeMwecsDialog} from '../../../store/actions/ECS/ecsAction';
import Enums from '../../../enums/enum';
import MwecsDialog from 'components/ECS/Mwecs/MwecsDialog';

class MwecsDialogContainer extends Component {

    render() {
        const {ecsOpenDialogKey,
            ecsActiveComponentKey,
            parentPageName,
            mwecsInputParams,
            closeMwecsDialog,
            checkMwecs,
            dialogProps = {}
        } = this.props;

        return <>
                <MwecsDialog
                    openDialog={ecsOpenDialogKey===Enums.ECS_DIALOG_TYPES.mwecs}
                    activeComponent={ecsActiveComponentKey===Enums.ECS_DIALOG_TYPES.mwecs}
                    parentPageName={parentPageName}
                    idType={mwecsInputParams.idType}
                    idNum={mwecsInputParams.idNum}
                    patientKey={mwecsInputParams.patientKey}
                    appointmentId={mwecsInputParams.appointmentId}
                    mwecsCheckingAction={checkMwecs}
                    callbackAction={mwecsInputParams.callbackAction}
                    closeDialog={closeMwecsDialog}
                    {...dialogProps}
                />
            </>;
    }
}


function mapStateToProps(state) {
    return {
      mwecsInputParams: state.ecs.mwecsDialogInput,
      ecsOpenDialogKey: state.ecs.openDialog,
      ecsActiveComponentKey: state.ecs.activeComponent,
      ecs: state.ecs,
      loginInfo: state.login.loginInfo,
      clinicInfo: state.login.clinic
    };
  }

  const dispatchProps = {
    checkMwecs,
    closeMwecsDialog
  };

  export default connect(mapStateToProps, dispatchProps)(MwecsDialogContainer);