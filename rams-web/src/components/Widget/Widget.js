import React from 'react';
import classnames from 'classnames';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import { Info } from '@material-ui/icons';
import infoIcon from 'resource/Icon/info-black/info-black.png';
import Grid from '@material-ui/core/Grid';
// styles
import useStyles from './styles';

export default function Widget({
    children,
    title,
    noBodyPadding,
    bodyClass,
    disableWidgetMenu,
    disableWidgetTitle,
    header,
    openPopup,
    ...props
}) {
    var classes = useStyles(props.commandStyle||{});
    return (
        <div className={classes.widgetWrapper}>
            <Card className={classnames(classes.paper, `${classes.widgetRoot}`)} square>
                {disableWidgetTitle ? null : header ? (
                    header
                ) : (
                    <CardHeader
                        titleTypographyProps={{ variant: 'h6' }}
                        className={classes.header}
                        title={title === "Precautions"? <div style={{display:'flex', alignItems:'center'}}>{title} <img src={infoIcon} style={{marginLeft:'8px'}}  onClick={openPopup} /></div>:title}
                        classes={{
                            title: classes.title
                        }}
                        action={
                            !disableWidgetMenu ? (
                                props.customMenu && (
                                    props.customMenu
                                ) 
                            ) : null
                        }
                    />
                )}
                <Grid container justifyContent="center" alignItems="center" style={{ height: '100%' }}>
                    <CardContent
                        className={classnames( {
                            [classes.noPadding]: noBodyPadding,
                            [bodyClass]: bodyClass,
                        }, classes.widgetBody)}
                        style={{ height: '100%' }}
                    >
                        {children}
                    </CardContent>
                </Grid>
            </Card>
        </div>
    );
}
