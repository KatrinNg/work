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
        // clientX/Y 获取到的是触发点相对于浏览器可视区域左上角距离
        const clickX = event.clientX;
        const clickY = event.clientY;
        // window.innerWidth/innerHeight 获取的是当前浏览器窗口的视口宽度/高度
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        // 获取自定义菜单的宽度/高度
        const rootW = this.root.offsetWidth;
        const rootH = this.root.offsetHeight;

        // right为true，说明鼠标点击的位置到浏览器的右边界的宽度可以放下菜单。否则，菜单放到左边。
        // bottom为true，说明鼠标点击位置到浏览器的下边界的高度可以放下菜单。否则，菜单放到上边。
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