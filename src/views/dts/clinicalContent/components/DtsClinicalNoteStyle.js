export const styles = () => ({
    noteContentContainer: {
      padding: '5px 10px'
    },
    noteContentTitle: {
      display: 'flex',
      alignItems: 'center'
    },
    noteContentCreateUserLabel: {
      fontWeight: 'bold',
      marginRight: 5
    },
    noteContentCreateUserDeleteLabel: {
      fontWeight: 'bold',
      marginRight: 5,
      color: '#6e6e6e'
    },
    noteContentCreateDtmLabel: {
      color: '#6e6e6e',
      marginRight: 5
    },
    noteContentOtherUpdateDtmLabel: {
      display: 'inline-block',
      fontStyle: 'italic',
      color: '#6e6e6e',
      fontSize: 12
    },
    tooltip: {
      backgroundColor: '#6E6E6E',
      fontSize: '14px',
      fontFamily: 'Arial'
    },
    primaryFab: {
      marginRight: 5,
      width: 25,
      height: 25,
      minHeight: 25,
      '&:hover': {
        backgroundColor: '#0098FF'
      }
    },
    fabIcon: {
      width: '1rem',
      height: '1rem'
    },
    contentPre: {
      margin: '5px 1px',
      fontFamily: 'Arial, MingLiU, Helvertica, Sans-serif, Arial Unicode MS',
      fontSize: '12pt',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word'
    },
    contentDeletePre:{
      margin: '5px 1px',
      fontFamily: 'Arial, MingLiU, Helvertica, Sans-serif, Arial Unicode MS',
      fontSize: '12pt',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      textDecoration: 'line-through'
    }
  });