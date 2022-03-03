
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { checkEcs, closeEcsDialog,selectTwinsRec} from '../../../store/actions/ECS/ecsAction';
import Enums from '../../../enums/enum';
import EcsDialog from 'components/ECS/Ecs/EcsDialog';

class EcsDialogContainer extends Component {

    render(){

        let {ecsOpenDialogKey,
            ecsActiveComponentKey,
            parentPageName,
            ecsInputParams,
            closeEcsDialog,
            checkEcs,
            loginInfo,
            clinicInfo,
            ecs,
            formProps ={ style: { minWidth: 1005 } },
            selectTwinsRec
          } = this.props;

        return <EcsDialog
            openDialog={ecsOpenDialogKey===Enums.ECS_DIALOG_TYPES.ecs}
            activeComponent={ecsActiveComponentKey===Enums.ECS_DIALOG_TYPES.ecs}
            parentPageName={parentPageName}
            docTypeCd={ecsInputParams.docTypeCd}
            disableMajorKeys={ecsInputParams.disableMajorKeys}
            engSurname={ecsInputParams.engSurname}
            engGivename={ecsInputParams.engGivename}
            chineseName={ecsInputParams.nameChi}
            cimsUser={loginInfo.ecsUserId}
            locationCode={clinicInfo.ecsLocCode}
            patientKey={ecsInputParams.patientKey}
            atndId={ecsInputParams.atndId}
            hkid={ecsInputParams.hkid}
            associatedHkic={ecsInputParams.associatedHkic}
            benefitType={ecsInputParams.benefitType}
            dob={ecsInputParams.dob}
            exactDob={ecsInputParams.exactDob}
            defaultTemplate={''}
            requestID={''}
            mustBeAssociated={ecsInputParams.mustBeAssociated}
            exact_dobList={ecs.codeList ? ecs.codeList.exact_dob : null}
            callbackAction={ecsInputParams.callbackAction}
            afterCheckingCallback={ecsInputParams.afterCheckingCallback}
            onCloseDialogCallback={ecsInputParams.onCloseDialogCallback}
            ecsCheckingAction={checkEcs}
            closeDialog={closeEcsDialog}
            formContentProps={formProps}
            ecsCheckingResult={ecs.ecsCheckingResult}
            selectTwinsRecAction={selectTwinsRec}
               />;
    }
}


function mapStateToProps(state) {
    return {
      ecsOpenDialogKey: state.ecs.openDialog,
      ecsActiveComponentKey: state.ecs.activeComponent,
      ecs: state.ecs,
      loginInfo: state.login.loginInfo,
      clinicInfo: state.login.clinic,
      ecsInputParams: state.ecs.ecsDialogInput
    };
  }

  const dispatchProps = {
    checkEcs,
    closeEcsDialog,
    selectTwinsRec
  };

  export default connect(mapStateToProps, dispatchProps)(EcsDialogContainer);