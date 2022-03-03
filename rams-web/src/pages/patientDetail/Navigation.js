import { List, ListItem } from '@material-ui/core';
import useInterceptionObserver from 'hooks/useInterceptionObserver';
import React, { useEffect, useState } from 'react';
import useDebounce from 'hooks/useDebounce';

import useStyles from './styles';

const Navigation = ({ listOfSections, root }) => {

    const classes = useStyles();
    const [currentSection, setCurrentSection] = useState(listOfSections[0].text);

    const navigatedSection = useInterceptionObserver({
        elements: listOfSections.map((item) => ({ id: item.className, text: item.text })),
        root
    });
    const debouncedTitle = useDebounce(navigatedSection);
    useEffect(() => {
        setCurrentSection(debouncedTitle);
    }, [debouncedTitle]);

    return (
        <>
            <List className={classes.listNav} component="nav" >
                {listOfSections.map((item, index) => {
                    const lineNode = index !== 0 ? <span className={classes.line}></span> : '';
                    return (
                        <div key={item.text} style={{display: 'flex', alignItems: 'center'}}>
                            { lineNode }
                            <ListItem
                                onClick={(e) => {
                                    setCurrentSection(item.text);
                                    listOfSections[index].ref.current.scrollIntoView({
                                        behavior: 'smooth',
                                    });
                                }}
                                className={classes.listNavItem}
                                selected={item.text === currentSection}
                                classes={{
                                    root: classes.ListRoot
                                }}
                                button
                                dense
                            >
                                { item.text}
                            </ListItem>
                            
                        </div>
                    );
                })}
            </List>
        </>
    );
};

export default Navigation;
