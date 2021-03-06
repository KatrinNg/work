import React, { Component } from 'react';
import {
    MenuList,
    MenuItem
} from '@material-ui/core';

class RightMenu extends Component {
    state = {
        content: '',
        visible: false
        // list: []
    }

    componentDidMount() {
        const { children } = this.props;
        this.setState({
            content: children
        });
        // this.getList();
        document.addEventListener('contextmenu', this.handleContextMenu);
        window.addEventListener('resize', this.resize);
        document.addEventListener('click', this.handleClick);
        document.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        document.removeEventListener('contextmenu', this.handleContextMenu);
        window.removeEventListener('resize', this.resize);
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('scroll', this.handleScroll);
    }

    // getList() {
    //     const { dispatch } = this.props;
    //     dispatch({
    //         type: 'rightlist/fetchList',
    //         callback: (res) => {
    //             this.setState({
    //                 list: res
    //             });
    //         }
    //     });
    // }

    handleClick = (event) => {
        const { visible } = this.state;
        const wasOutside = (event.target.contains !== this.root);

        if (wasOutside && visible) this.setState({ visible: false });
    };

    handleScroll = () => {
        const { visible } = this.state;

        if (visible) this.setState({ visible: false });
    }

    runderMenu = () => {
        const { visible } = this.state;
        const { list } = this.props;
        console.log(list);
        const menu = list.map(item => {
            if (item.children) {
                return (<MenuItem title={<span>{item.title}</span>} key={item.id}>
                    {item.children.map(i => {
                        return (<MenuItem key={i.id}>{i.title}</MenuItem>);
                    })}
                </MenuItem>);
            } else {
                return (
                    <MenuItem key={item.id}>{item.title}</MenuItem>
                );
            }
        });
        console.log(menu);
        return (
            visible && (
                <div ref={(ref) => { this.root = ref; }}>
                    <MenuList>
                        {
                            menu
                        }
                    </MenuList>
                </div>

            )
        );
    }
    handleContextMenu = (event) => {
        event.preventDefault();
        this.setState({ visible: true });
        // clientX/Y ?????????????????????????????????????????????????????????????????????
        const clickX = event.clientX;
        const clickY = event.clientY;
        // window.innerWidth/innerHeight ????????????????????????????????????????????????/??????
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        // ??????????????????????????????/??????
        const rootW = this.root.offsetWidth;
        const rootH = this.root.offsetHeight;

        // right???true??????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        // bottom???true???????????????????????????????????????????????????????????????????????????????????????????????????????????????
        const right = (screenW - clickX) > rootW;
        const left = !right;
        const bottom = (screenH - clickY) > rootH;
        const top = !bottom;

        if (right) {
            this.root.style.left = `${clickX}px`;
        }

        if (left) {
            this.root.style.left = `${clickX - rootW}px`;
        }

        if (bottom) {
            this.root.style.top = `${clickY}px`;
        }
        if (top) {
            this.root.style.top = `${clickY - rootH}px`;
        }

    };
    render() {
        return (
            /* eslint-disable-next-line */
            <div className={styles.rwrap}>
                demo
                {this.state.content}
                {this.runderMenu()}
            </div>
        );
    }
}

export default RightMenu;