import React, { Component } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import CIMSButton from '../Buttons/CIMSButton';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import IconButton from '@material-ui/core/IconButton';

const styles = (theme) => ({
    paper: {
        minWidth: 300,
        maxWidth: '100%',
        borderRadius: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.08)'
    },
    paperScrollPaper: {
        display: 'flex',
        maxHeight: 'calc(100% - 20px)',
        flexDirection: 'column'
    },
    dialogTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5
    },
    formControlCss: {
        backgroundColor: theme.palette.dialogBackground,
        padding: '10px 10px 10px 10px'
    },
    formControl2Css: {
        // backgroundColor: '#ffffff'
        backgroundColor:theme.palette.cimsBackgroundColor
    },
    dialogAction: {
        //justifyContent: 'center'
        padding: '10px 15px'
    },
    dragTitle: {
        cursor: 'pointer'
    },
    closeButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: '1px',
        color: theme.palette.grey[22]
    }
});

function DraggingPaper(props) {
    const title = `#${props.id}-title`;
    return (
        <Draggable
            bounds="parent"
            handle={title}
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
}

class CIMSPromptDialog extends Component {

    handleDialogExit = () => {
        if (typeof this.props.onExited === 'function') {
            this.props.onExited();
        }
    }

    render() {
        const {
            id,
            classes,
            buttonConfig,
            dialogContentTitle,
            dialogContentText,
            dialogActions,
            draggable,
            contentRoot,
            paperStyl,
            dialogTitle,
            dialogCloseIcon,
            FormControlProps,
            DialogContentProps,
            legendText,
            ...other
        } = this.props;
        let titleArr = [];
        if (dialogContentTitle) {
            if (dialogContentTitle.indexOf('<br/>') > -1) {
                titleArr = dialogContentTitle.split('<br/>');
            }
            else {
                titleArr.push(dialogContentTitle);
            }
        }

        return (
            <Dialog
                classes={{
                    paper: paperStyl || classes.paper,
                    paperScrollPaper: classes.paperScrollPaper
                }}
                id={id}
                onClose={() => { }}
                onExited={this.handleDialogExit}
                {...other}
                PaperComponent={draggable ? DraggingPaper : Paper}
                PaperProps={{ id, ...other.PaperProps }}
            >
                <FormControl className={classes.formControlCss} {...FormControlProps}>
                    <Typography
                        variant="subtitle2"
                        className={classNames({
                            [classes.dialogTitle]: true,
                            [classes.dragTitle]: draggable
                        })}
                        id={id + '-title'}
                    >{dialogTitle}</Typography>
                    {dialogCloseIcon ?
                        <IconButton aria-label="close" className={classes.closeButton}>
                            {dialogCloseIcon}
                        </IconButton>
                        : <></>
                    }
                    <FormControl className={classes.formControl2Css}>
                        <DialogContent id={id + '-description'} classes={{ root: contentRoot ? contentRoot : null }} {...DialogContentProps}>
                            {titleArr.length > 0 && titleArr.map((item, index) => {
                                return (
                                    <Typography variant="subtitle1" key={`subtitleLine${index}`}>{item}</Typography>
                                );
                            })}
                            {dialogContentText}
                        </DialogContent>
                        {
                            dialogActions || buttonConfig ?
                                <DialogActions className={classes.dialogAction}>
                                    {
                                        legendText ? legendText : null
                                    }
                                    {buttonConfig && buttonConfig.map(config => {
                                        let { id, name, display, ...rest } = config;//NOSONAR
                                        if (display !== undefined) {
                                            if (display === true) {
                                                return (
                                                    <CIMSButton
                                                        id={`${id}${config.id}`}
                                                        key={id}
                                                        children={name}
                                                        {...rest}
                                                    />
                                                );
                                            } else {
                                                return null;
                                            }
                                        } else {
                                            return (
                                                <CIMSButton
                                                    id={`${id}${config.id}`}
                                                    key={id}
                                                    children={name}
                                                    {...rest}
                                                />
                                            );

                                        }
                                        //     return (
                                        //         display && display === ture
                                        //         < CIMSButton
                                        //             id = {`${id}${config.id}`
                                        // }
                                        //             key = { id }
                                        //             children = { name }
                                        //             { ...rest }
                                        //     />
                                        //     );
                                    })}
                                    {dialogActions}
                                </DialogActions>
                                : null
                        }
                    </FormControl>
                </FormControl>
            </Dialog>
        );
    }
}

export default withStyles(styles)(CIMSPromptDialog);