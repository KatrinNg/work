import React, { useState, useEffect, Fragment } from 'react';
import { Typography, Tab, Tabs, Box, Divider } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { mockDate } from './mockDate';
import TabPanel from './tabPanel';

import VitalSignType from './vitalSignType/vitalSignType';
import Group from './group/group';
import Treatment from './treatment/treatment';
import WeightBearingStatus1 from './weightBearingStatus1/weightBearingStatus1';
import WeightBearingStatus2 from './weightBearingStatus2/weightBearingStatus2';
import HotList from './hotList';
// import Activity from './activity/activity';
import Side from './side'
import Position from './position'
import Protocol from './protocol';
import ProtocolOT from './protocolOT';
import Assistance from './assistance';
import AssistiveDevice1 from './assistiveDevice1';
import AssistiveDevice2 from './assistiveDevice2';
import WalkingAids from './walkingAids';
import CategoryForGroup from './categoryForGroup';
import Category from './category';

import useStyles from './styles';

const DetailPT = () => {
    const classes = useStyles();
    const history = useHistory();
    const [tabValue, setTabValue] = useState(history?.param?.name);
    const [tabKey, setTabKey] = useState(history?.param?.cName);
    const [showGeneralList, setShowGeneralList] = useState(true);
    const [showTreatmentList, setShowTreatmentList] = useState(true);
    const [showProtocolList, setShowProtocolList] = useState(true);
    const [showTherapeuticGroupList, setShowTherapeuticGroupList] = useState(true);
    const [showActivityList, setShowActivityList] = useState(true);

    const { patientDetailsType } = useSelector((state) => state.patientDetail);



    const handleChange = (event, newValue, key) => {
        setTabKey(key)
        setTabValue(newValue)
        
    };

    const a11yProps = (index) => {
        return {
            id: `vertical-tab-${index}`,
            'aria-controls': `vertical-tabpanel-${index}`,
        };
    };

    const showList = (key) => {
        switch (key) {
            case 'general':
                setShowGeneralList(!showGeneralList);
                break;
            case 'treatment':
                setShowTreatmentList(!showTreatmentList);
                break;
            case 'protocol':
                setShowProtocolList(!showProtocolList);
                break;
            case 'therapeuticGroup':
                setShowTherapeuticGroupList(!showTherapeuticGroupList);
                break;
            case 'activity':
                setShowActivityList(!showActivityList);
                break;
            default:
                break;
        }
    };

    const isHidden = (key) => {
        switch (key) {
            case 'general':
                return showGeneralList ? false : true;
            case 'treatment':
                return showTreatmentList ? false : true;
            case 'protocol':
                return showProtocolList ? false : true;
            case 'therapeuticGroup':
                return showTherapeuticGroupList ? false : true;
            case 'activity':
                return showActivityList ? false : true;
            default:
                break;
        }
    };

    

    const renderTabPanel = () => {
        const isPT = patientDetailsType === 'PT' ? true : false;
        const tempObj = {
            vitalSignType: <VitalSignType />,
            hotListActivities: <HotList />,
            category: <Category />,
            treatment: <Treatment />,
            side: <Side />,
            position: <Position />,
            assistance: <Assistance />,
            walkingAids: <WalkingAids />,
            assistiveDevice1: <AssistiveDevice1 />,
            assistiveDevice2: <AssistiveDevice2 />,
            weightBearingStatus1: <WeightBearingStatus1 />,
            weightBearingStatus2: <WeightBearingStatus2 />,
            protocol: isPT?<Protocol />: <ProtocolOT/>,
            gCategory: <CategoryForGroup />,
            group: <Group />,
            // vitalSignType: <VitalSignType />,
            // vitalSignType: <VitalSignType />,
        }
        
        return tempObj[tabValue]
    }
    return (
        <div className={classes.containerDetail}>
            <div className={classes.landingAppbar} style={{ padding: '10px 12px' }}>
                <Typography>Admin Manage module</Typography>
            </div>
            <div className={classes.mainContent}>
                <div className={classes.leftNavs}>
                    {mockDate.map((item, index) => {
                        if (item.type === patientDetailsType) {
                            return item.response.map((list, index) => {
                                let hidden = isHidden(list.content.cName);
                                return (
                                    <div className={classes.nav} key={`detailPT${index}`}>
                                        <div
                                            className={classes.navItem}
                                            onClick={() => {
                                                showList(list.content.cName);
                                            }}
                                        >
                                            <div className={classes.navItemtitle}>{list.title}</div>
                                        </div>
                                        <Box hidden={hidden}>
                                            <Tabs
                                                orientation="vertical"
                                                variant="scrollable"
                                                value={tabKey === list.content.cName? tabValue: ''}
                                                onChange={(event, newValue) => {
                                                    handleChange(event, newValue, list.content.cName);
                                                }}
                                                className={classes.tabs}
                                                key={`tabs-${index}`}
                                            >
                                                <Tab
                                                    className={classes.tab}
                                                    value=''
                                                    style={{ display: 'none' }}
                                                    {...a11yProps(0) }
                                                />
                                                {list.content.date.map((item, index) => {
                                                    return [
                                                        <Tab
                                                            key={`${list.content.cName}-${index}`}
                                                            className={classes.tab}
                                                            value={item.name}
                                                            label={item.text}
                                                            {...a11yProps(index + 1 + "-"+item.name)}
                                                        />,
                                                        index !== list.content.date.length - 1 ? (
                                                            <Divider
                                                                key={`divider-${index}`}
                                                                style={{ marginLeft: 18.7 }}
                                                            />
                                                        ) : null,
                                                    ];
                                                })}
                                            </Tabs>
                                        </Box>
                                    </div>
                                );
                            });
                        }
                    })}
                </div>
                <div className={classes.rightContent}>
                    {renderTabPanel()}
                   
                </div>
            </div>
        </div>
    );
};

export default DetailPT;
