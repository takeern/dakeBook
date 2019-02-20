import React from 'react';

export default (props) => {
    const { tableTitle, modelState, handleChangeClick, handleSetClick } = props;
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
            if (item.text !== modelState) {
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
            }}>
                <div 
                style={{
                    backgroundColor: 'black',
                    padding: 5,
                    borderRadius: '0 5px 5px 0',
                }}
                onClick = { () => handleChangeClick('last')}>上一章</div>
                <div 
                style={{
                    backgroundColor: 'black',
                    padding: 5,
                    borderRadius: '5px 0 0 5px',
                }}
                onClick = { () => handleChangeClick('next')}>下一章</div>
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
                opacity: .8,
            }}
            className='read_set'
            onClick={(e) => handleSetClick(e)}
            >
                {showList}
            </div>
        </div>
    );
};