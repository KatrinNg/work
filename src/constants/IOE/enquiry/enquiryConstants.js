const LX_TYPE = {
  REQUEST: 'req',
  REPORT: 'rep'
};

const LX_OPTIONS = [
  {
    label:'Request',
    value:LX_TYPE.REQUEST
  },{
    label:'Report',
    value:LX_TYPE.REPORT
  }
];

const SEARCH_FIELD_NAME = {
  LX:'Lx',
  FROM:'From',
  TO:'To',
  FORM_NAME:'FormName',
  SERVICE: 'Service',
  CLINIC: 'Clinic',
  FOLLOW_UP_STATUS:'FollowUpStatus',
  EXP_TURNAROUND_TIME:'ExpTurnaroundTime',
  REQUESTED_BY:'RequstedBy'
};


const FUNCTION_NAME = 'IX_ENQUIRY';

export {
  LX_TYPE,
  LX_OPTIONS,
  SEARCH_FIELD_NAME,
  FUNCTION_NAME
};
