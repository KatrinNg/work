import {
    makeStyles
} from "@material-ui/styles";

export default makeStyles(theme => ({
    containMargin: {
        margin: '5px 0px'
    },
    patientSummaryAppbar: {
        backgroundColor: '#39ad90',
        height: 30,
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '12px',
        '& .MuiTypography-body1': {
            fontSize: 12,
        }
    },
    containerPanel: {
        height: 'calc(100% - 30px)',
        overflowY: 'auto',
        width: '100%',
        padding: '0px 14px 36px 14px',
        backgroundColor: '#ecf0f7'
    },
    dateSearch: {
        height: 52,
        '& .MuiTypography-body1': {
            fontSize: 14,
        }
    },
    formLabel: {
        fontFamily: 'PingFangTC',
        fontSize: '14px',
        fontWeight: 600,
        fontStretch: 'normal',
        fontStyle: 'normal',
        lineHeight: 3.57,
        letterSpacing: 'normal',
        color: '#000',
      },
      weekDaysTitle: {
          backgroundColor: '#3ab395',
          height: 45,
          color: '#FFFFFF'
      },
      columnItem: {
          borderRight: 'solid 1px #d4d4d4',
          height: 45,
          width: '10%',
          '& .MuiTypography-body1': {
                fontSize: 14,
            }
      },
      weekdayLabel: {
        height: 18,
        fontSize: 14,
      },
      iconStyle: {
          height: 45,
          width: 35,
          backgroundColor: '#facb42',
          color: '#010101',
          cursor: 'pointer'
      },
      summaryContent: {
          minHeight: 105,
          backgroundColor: '#FFFFFF'
      },
      summaryItem: {
        position: 'relative',
        borderRight: 'solid 1px #d4d4d4',
        width: '10%'
      },
      categoryItem: {
          fontSize: 12,
          '& .MuiTypography-body1': {
            fontSize: 12,
            lineHeight:'20px'
          }
      },
      msItem: {
          paddingBottom: 10,
          margin: '5px 10px',
          borderBottom: 'dashed 1px #000000',
          '& .MuiTypography-body1': {
            fontSize: 12,
          }
      },
      msIcon: {
          position: 'absolute',
          top: 10,
          right: 5,
          cursor: 'pointer'
      },
      weightLabel: {
          fontWeight: 700
      },
      noOutline: {
        borderColor: "pink",
        borderWidth: 4
      },
      popFontSize:{
        fontSize: 14,
      },
      popWeightLabel: {
        fontWeight: 700,
        fontSize: 14,
      }
}));
