import React, { useEffect, useState } from 'react'
import { Box, Switch } from '@material-ui/core'
import CommonSelect from 'components/CommonSelect/CommonSelect'
import useStyles from './styles'
import SearchSelectList from 'components/SearchSelectList/SearchSelectList';
import { withStyles } from '@material-ui/core/styles';
import CustomTextField from 'components/Input/CustomTextField'
const ListEdit = (props) => {
  const classes = useStyles()
  const { selectList, item = { sort: '', treatment_name: '' }, others, sortList, onChange, duplicatedObj = {}, index } = props
  const [selectVal, setSelectVal] = useState(item.sort)
  const [searchVal, setSearchVal] = useState(item.treatment_name)
  const [searchObj, setSearchObj] = useState(null)
  const [display, setDisplay] = useState(item.display)
  const [remaining, setRemaining] = useState(item.remaining)
  const [curKey, setKey] = useState('')
  const handleSelect = (value, o) => {
    setSearchVal(value)
    setSearchObj(o)
    setKey('treatment')
  }
  const selectChange = (e) => {
    setSelectVal(e.target.value)
    setKey('sort')
  }
  const displayChange = () => {
    setDisplay(!display)
    setKey('display')
  }
  const remainingChange = (e) => {
    console.log(e)
    setRemaining(e.target.value)
    setKey('remaining')
  }
  useEffect(() => {
    onChange({ key: curKey, data: { newData: { sort: selectVal, treatment_name: searchVal, treatment: searchObj, display: display, remaining:remaining }, oldData: item } })
  }, [selectVal, searchVal, display, remaining])
  let bgStyle = item.display ? {} : { backgroundColor: '#d8d8d8' }
  if (duplicatedObj[item.sort]) {
    bgStyle = { ...bgStyle, border: '1px solid red' }
  }
  return <Box className={classes.rowItem} style={bgStyle} {...others} >
    <div className={classes.sortSpan}>
      <CommonSelect 
        id={`hotlistSelect${item.sort}`}
        disabled={!item.display} 
        onChange={(e) => { selectChange(e) }} 
        classes={{ select: classes.select }}
        style={{ minWidth: 100 }}  
        value={selectVal} 
        items={sortList} 
      />
    </div>
    <div className={classes.sortTreatment} >
      <SearchSelectList 
        id={'listEditSearchSelectList '}
        handleSelect={handleSelect}
        value={item.treatment_name}
        labelFiled='treatment_name'
        valueFiled='treatment_name'
        placeholder='Search'
        disabled={!item.display}
        options={selectList} 
      />
    </div>
    <div className={classes.remaining} >
      <CustomTextField
        id={'listEditInput'}
        value={remaining}
        onChange={(e)=>{remainingChange(e)}}
        style={{ width: 80 }}
        numberField
        minNum={0}
        disabled={!item.display}
        // changeOnBlur={()=>{changeOnBlur('min')}}
        inputPropsStyle={{ height: 30, borderRadius: 6 }}
      />
    </div>
    <div className={classes.sortDispaly} >
      <IOSSwitch checked={display} onChange={displayChange} />
    </div>
  </Box>
}
export default ListEdit

const IOSSwitch = withStyles((theme) => ({
  root: {
    width: 52,
    height: 26,
    padding: 0,
    margin: theme.spacing(1),
  },
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(25px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#39b194',
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#39b194',
      border: '6px solid #fff',
    },
  },
  thumb: {
    width: 24,
    height: 24,
    marginLeft: 1
  },
  track: {
    borderRadius: 26 / 2,
    border: `1px solid ${theme.palette.grey[400]}`,
    backgroundColor: '#bcbcbc',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  },
  checked: {},
  focusVisible: {},
}))(({ classes, ...props }) => {
  return (
    <Switch
      id={'listEditSwitch'}
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
});
