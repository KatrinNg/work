import React, {useState,useEffect,useRef,useCallback} from "react"
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom'
import {Tabs,Tab,Box,Typography} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import * as ActionTypes from 'redux/actionTypes';
import {getKeyName} from 'utility/tabrouterUtils'
import useStyles from './style'
export default function TabRouterPanes(props){
  const classes = useStyles()
  const dispatch = useDispatch();
  const { g_curTabs,g_reloadPath } = useSelector(
      (state) => {
          const {curTabs,reloadPath} = state.tabRouter;
          return {
              g_curTabs: curTabs,
              g_reloadPath: reloadPath
          }
      }
  );
  const {
      defaultActiveKey,
      panesItem,
      tabActiveKey
  } = props
  const history = useHistory()
  const { pathname, search } = useLocation()
  const fullPath = pathname + search
  const [activeKey, setActiveKey] = useState('patientDetails')
  const [panes, setPanes] = useState([])
  const [isReload, setIsReload] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState({})
  const pathRef = useRef('')

    // 从本地存储中恢复已打开的tab列表
  const resetTabs = useCallback(() => {
    const initPanes = g_curTabs.reduce((prev, next) => {
        const { title, tabKey, component: Content } = getKeyName(next)
        return [
          ...prev,
          {
            title,
            key: tabKey,
            content: Content,
            closable: tabKey !== 'patientdetails',
            path: next
          }
        ]
      },[])
      const { tabKey } = getKeyName(pathname)
      setPanes(initPanes)
      setActiveKey(tabKey)
    }, [g_curTabs, pathname])
    // init page
    useEffect(() => {
      resetTabs()
    }, [resetTabs])

    const dispatchCurTabs = (pathArr) => {
      dispatch({
        type: ActionTypes.SET_CURTABS,
        payload: {
          curTabs:pathArr
        }
      })
    }
    // 记录当前打开的tab
    const storeTabs = useCallback(
      (ps) => {
        const pathArr = ps.reduce(
          (prev, next) => [
            ...prev,
            next.path
          ],
          []
        )
        dispatchCurTabs(pathArr)
      },
      [dispatchCurTabs]
    )
    
    useEffect(() => {
      const newPath = pathname + search
      // 当前的路由和上一次的一样，return
      if (!panesItem.path || panesItem.path === pathRef.current) return
  
      // 保存这次的路由地址
      pathRef.current = newPath
  
      const index = panes.findIndex(
        (_) => _.key === panesItem.key
      )
      // 无效的新tab，return
      if (!panesItem.key || (index > -1 && newPath === panes[index].path)) {
        setActiveKey(tabActiveKey)
        return
      }
  
      // 新tab已存在，重新覆盖掉（解决带参数地址数据错乱问题）
      if (index > -1) {
        panes[index].path = newPath
        setPanes(panes)
        setActiveKey(tabActiveKey)
        return
      }
  
      // 添加新tab并保存起来
      panes.push(panesItem)
      setPanes(panes)
      setActiveKey(tabActiveKey)
      storeTabs(panes)
    }, [tabActiveKey])

    const closeTab = (e,key) => {
      e.stopPropagation()
      e.preventDefault()
      remove(key)
      console.log(key)
    }
    // 移除tab
    const remove = (targetKey) => {
      const delIndex = panes.findIndex(
        (item) => item.key === targetKey
      )
      panes.splice(delIndex, 1)

      // 删除非当前tab
      if (targetKey !== activeKey) {
        const nextKey = activeKey
        setPanes(panes)
        setActiveKey(nextKey)
        storeTabs(panes)
        return
      }

      // 删除当前tab，地址往前推
      const nextPath = g_curTabs[delIndex - 1]
      const { tabKey } = getKeyName(nextPath)
      // 如果当前tab关闭后，上一个tab无权限，就一起关掉
      // if (!isAuthorized(tabKey) && nextPath !== '/') {
      //   remove(tabKey)
      //   history.push(curTab[delIndex - 2])
      // } else {
      //   history.push(nextPath)
      // }
      history.push(nextPath)
      setPanes(panes)
      storeTabs(panes)
    }
    const  allyProps = (val) => {
        return {
            id: `tabsRouterTab${val}`,
            value: val,
            'aria-controls': `tabsRouterTabpanel${val}`,
        };
    }
    const handleChange = (event, newValue) => {
        setActiveKey(newValue);
        // tab click
        const { path } = panes.filter(
          (item) => item.key === newValue
        )[0]
        history.push({ pathname: path })
    };
    return <>
      {panes.length>0?<><Tabs classes={{indicator:classes.tabsIndicator,root: classes.tabsRoot}} value={activeKey} onChange={handleChange} aria-label="tabs-router" >
            {panes.map((pane, index) => (
                <Tab key={`tabsRouterTab${index}`} label={pane.title}  {...allyProps(pane.key)} wrapped={false}
                  classes={{
                    wrapper:classes.tabWrapper,
                    root:classes.tabRoot,
                    selected:classes.tabSelected}}
                   icon={pane.closable?<div className={classes.closeIcon} onClick={(e)=>{closeTab(e,pane.key)}}><CloseIcon /></div>:null} />
            ))}
        </Tabs>
        {panes.map((panelItem,index)=>{
            const Content = panelItem.content;
            return <TabPanel key={`tabsRouterTabpanel${index}`} tabValue={activeKey} style={{ height: 'calc(100% - 60px)',width: '100%' }} value={panelItem.key}>
                {g_reloadPath !== panelItem.path ? ( <>
                  <div className={classes.panelTitle}>
                    <Typography variant="h6">{panelItem.title}</Typography>
                  </div>
                  <Content path={panelItem.path} />
                </>) : (
                    <div style={{ height: '100vh' }}>
                        <div>loading...</div>
                    </div>
                )}
            </TabPanel>
        })}</>:null}
        
    </>
}

function TabPanel(props) {
    const { children, value, tabValue, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== tabValue}
        id={`tabsRouterTabpanel${value}`}
        aria-labelledby={`tabsRouterTab${value}`}
        {...other}
      >
        {value === tabValue && children}
      </div>
    );
  }
  
  TabPanel.propTypes = {
    children: PropTypes.node,
    tabValue: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
  };