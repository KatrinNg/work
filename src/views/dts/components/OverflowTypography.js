import React, { useLayoutEffect, useRef, useState } from 'react';
import { Popover, Typography } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';

function setRefs(...refs) {
    return element => {
        refs.filter(i=>i).forEach(ref => {
            if (typeof ref === 'function') {
                ref(element);
            } else {
                ref.current = element;
            }
        });
    };
}

function isTextOverflow(element) {
    return element.clientWidth < element.scrollWidth;
}

const styles = {
    popover:{
        pointerEvents: 'none'
    },
    popoverText:{
        wordWrap: 'break-word'
    }
};

const OverflowTypography = React.forwardRef((props, ref) => {
    const {classes, popoverProps, popoverTextProps, ...rest} = props;
    const textRef = useRef();
    const [isOverflow, setOverflow] = useState(0);
    const [open, setOpen] = useState(0);

    const checkOverflow = () => setOverflow(isTextOverflow(textRef.current));

    useLayoutEffect(() => {
        const observer = new ResizeObserver(checkOverflow);
        observer.observe(textRef.current);
        return () => observer.disconnect();
    }, []);
    useLayoutEffect(checkOverflow, [props.children]);

    return <>
        <Typography
            ref={setRefs(ref, textRef)}
            onMouseEnter={() => isOverflow && setOpen(1)}
            onMouseLeave={() => setOpen(0)}
            {...rest}
        />
        <Popover
            open={open}
            anchorEl={textRef.current}
            anchorOrigin={{vertical: 'top', horizontal: 'left'}}
            onClose={() => setOpen(0)}
            {...popoverProps}
            className={clsx(classes.popover, popoverProps?.className)}
        >
            <Typography {...rest} noWrap={false} {...popoverTextProps} className={clsx(classes.popoverText, rest.className, popoverTextProps?.className)}/>
        </Popover>
    </>;
});

export default withStyles(styles)(OverflowTypography);