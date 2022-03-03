import React, { Component } from 'react';
import CIMSTextField from '../../TextField/CIMSTextField';
import Enums from '../../../enums/enum';

class MwecsResultTextField extends Component {
  getResultFromMwecsStore(mwecsStore){
    let resultType = Enums.MWECS_RESULT_TYPES.find(item => item.key === mwecsStore.result);
    return resultType? `${mwecsStore.result}: ${resultType.desc}` : mwecsStore.result;
}

  render() {
    const {
      classes,
      mwecsStore,
      parentPageName = '',
      ...rest} = this.props;
    const textFieldVal = this.getResultFromMwecsStore(mwecsStore);
    return (
        <CIMSTextField
            disabled
            title={textFieldVal}
            label={'MWECS Result'}
            id={`${parentPageName}_mwecs_result_textfield`}
            variant="outlined"
            value={textFieldVal}
            classs={classes}
            {...rest}
        >

        </CIMSTextField>
    );
  }
}
export default MwecsResultTextField;
