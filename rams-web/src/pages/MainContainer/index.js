import React,{useState,useEffect,useRef} from "react"
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import {Grid, Typography} from '@material-ui/core'
import TabRouterPanes from 'components/TabRouterPanes/TabRouterPanes'
import {getKeyName, isAuthorized} from 'utility/tabrouterUtils'

export default function MainContainer(props){
    const [tabActiveKey, setTabActiveKey] = useState('patientdetails')
    const [panesItem, setPanesItem] = useState({
        title: '',
        content: null,
        key: '',
        closable: false,
        path: ''
    })
    const noNewTab = [] // unneeded tab page
    const noCheckAuth = ['/', '/403', '/patientSummary'] // unneeded router
    // check Auth
    const checkAuth = (newPathname) => {
        // unneeded check Auth
        if (noCheckAuth.includes(newPathname)) {
            return true
        }
        // const { tabKey: currentKey } = getKeyName(newPathname)
        // return isAuthorized(currentKey)
    }

    const pathRef = useRef('')
    const history = useHistory()
    const { pathname, search } = useLocation()
    const dispatch = useDispatch();
    const { g_curTabs } = useSelector(
        (state) => {
            const {curTabs} = state.tabRouter;
            return {
                g_curTabs: curTabs,
            }
        }
    );
    const token = "test#@ddqqGFE"
    useEffect(()=>{
        // login
        if (!token && pathname !== '/login') {
            history.replace({ pathname: '/login' })
            return
        }
        const { tabKey, title, component: Content } = getKeyName(pathname)

        // The new tab already exists or does not need to be created tab，return
        if (pathname === pathRef.current || noNewTab.includes(pathname)) {
            setTabActiveKey(tabKey)
            return
        }
        // Check permissions, such as input directly from the address bar, prompt no permission
        const isHasAuth = checkAuth(pathname)
        if (!isHasAuth) {
            const errorUrl = '/403'
            const {
                tabKey: errorKey,
                title: errorTitle,
                component: errorContent
            } = getKeyName(errorUrl)
            setPanesItem({
                title: errorTitle,
                content: errorContent,
                key: errorKey,
                closable: true,
                path: errorUrl
            })
            pathRef.current = errorUrl
            setTabActiveKey(errorKey)
            history.replace(errorUrl)
            return
        }
        // Record the new path for the next update comparison
        const newPath = search ? pathname + search : pathname
        pathRef.current = newPath
        setPanesItem({
            title,
            content: Content,
            key: tabKey,
            closable: tabKey !== 'patientdetails',
            path: newPath
        })
        setTabActiveKey(tabKey)
    },[history, pathname, search, token])
    
    return <>
        <TabRouterPanes
            defaultActiveKey="patientdetails"
            panesItem={panesItem}
            tabActiveKey={tabActiveKey}
        />
    </>
}