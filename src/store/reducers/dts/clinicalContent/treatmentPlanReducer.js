import * as treatmentPlanAction from '../../../actions/dts/clinicalContent/treatmentPlanActionType';

const initState = {

    redirect: {
            appointmentId: null,
            action: null
        }
};

export default (state = initState, action = {}) => {
    switch (action.type) {






        default: {
            return state;
        }
    }

};