import { makeStyles } from '@material-ui/core/styles';
import tick from 'resource/Icon/demo-icon/tick.svg';

export const useStyles = makeStyles({
    root: {
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
    icon: (props) => {
      return {
        borderRadius: 3,
        border: '1px solid #979797',
        width: props.icon_size,
        height: props.icon_size,
        backgroundColor: '#f5f8fa',
        'input:hover ~ &': {
          backgroundColor: '#ebf1f5',
        },
        'input:disabled ~ &': {
          boxShadow: 'none',
          background: 'rgba(206,217,224,.5)',
        },
      }
    },
    checkedIcon: (props) => {
      return {
        backgroundColor: '#0c6e56',
        '&:before': {
          display: 'block',
          width: props.icon_size,
          height: props.icon_size,
          backgroundImage:`url(${tick})`,
          content: '""',
          backgroundSize: props.icon_size - 2,
          backgroundRepeat: 'no-repeat',
          borderColor: '#0c6e56'
        },
        'input:hover ~ &': {
          backgroundColor: '#0c6e56',
          borderColor: '#0c6e56'
        },
      }
    }
  });