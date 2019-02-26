import React, { PureComponent } from 'react';

export default class ReadContent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = { 
            setOpen: false,
        };
    }
    onSetClick(e) {
        let target = e.target;
        while(!target.getAttribute('data-set')) {
            if(target.className === 'read_set') return;
            target = target.parentNode;
        }
        const cmd = target.getAttribute('data-set');
        if (cmd === '设置') {
            this.setState({
                setOpen: !this.state.setOpen,
            });
        } else {
            const { handleSetClick } = this.props;
            handleSetClick(cmd);
        }
    }
    render() {
        const { tableTitle, modelState, handleChangeClick, handleFontChange } = this.props;
        const { setOpen } = this.state;
        const mapList = [
            {
                text: '目录',
                html: '#icon-mulu',
            },
            {
                text: '夜晚',
                html: '#icon-qingtianyewan',
            },
            {
                text: '白天',
                html: '#icon-tianqitubiao_qingtianbai',
            },
            {
                text: '设置',
                html: '#icon-shezhi',
            },
        ];
        const showList = mapList.map((item, index) => {
            if (item.text === '白天' || item.text === '夜晚') {
                if (item.text === modelState) {
                    return null;
                } 
            }
            return (
                <div 
                style={{
                    display: 'flex',
                    flexFlow: 'column',
                    alignItems: 'center',
                }}
                key={index}
                data-set={item.text}
                >
                    <span style={{
                        lineHeight: 0,
                    }}> 
                        <svg class="icon" aria-hidden="true" 
                            dangerouslySetInnerHTML={{
                                __html: `<use xlink:href="${item.html}"></use>`,
                            }}
                        ></svg>
                    </span>
                    <span style={{
                        fontSize: 10,
                    }}>{item.text}</span>
                </div>
            );
        });
        return (
            <div>
                <div style={{
                    width: '100vw',
                    height: '7vh',
                    lineHeight: '7vh',
                    backgroundColor: 'black',
                    opacity: 0.75,
                    fontSize: 14,
                    textAlign: 'center',
                    color: 'white',
                }}>{tableTitle}</div>
                <div style={{
                    marginTop: '35vh',
                    display: 'flex',
                    flexFlow: 'row',
                    justifyContent: 'space-between',
                    width: '100vw',
                    height: '6vh',
                    fontSize: 18,
                    fontWeight: 100,
                    color: 'white',
                    opacity: 0.8,
                    visibility: 'hidden',
                }}>
                    <div 
                    style={{
                        backgroundColor: 'black',
                        padding: 5,
                        borderRadius: '0 5px 5px 0',
                        visibility: 'visible',
                    }}
                    onClick = { () => handleChangeClick('last')}>上一章</div>
                    <div 
                    style={{
                        backgroundColor: 'black',
                        padding: 5,
                        borderRadius: '5px 0 0 5px',
                        visibility: 'visible',
                    }}
                    onClick = { () => handleChangeClick('next')}>下一章</div>
                </div>
                <div style = {{
                    position: 'fixed',
                    bottom: '9vh',
                    display: setOpen === true ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    height: '6vh',
                    width: '100vw',
                    backgroundColor: 'black',
                    color: 'white',
                    opacity: .8,
                }}
                onClick={(e) => handleFontChange(e)}
                >
                    <div data-font='+'>+</div>
                    <div data-font='-'>-</div>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    height: '9vh',
                    width: '100vw',
                    marginTop: '43vh',
                    backgroundColor: 'black',
                    color: 'white',
                    opacity: .9,
                }}
                className='read_set'
                onClick={(e) => this.onSetClick(e)}
                >
                    {showList}
                </div>
            </div>
        );
    }
}