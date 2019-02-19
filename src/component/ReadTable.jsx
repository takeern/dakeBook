import React, { PureComponent } from 'react';
import List from 'react-virtualized/dist/commonjs/List';

export default class ReadContent extends PureComponent {
    render () {
        const { bookTable, tableState } = this.props;

        const clientHeight = window.screen.height;
        const clientWidth = window.screen.width;
        
        const lineHeight = parseInt(clientHeight)/16;
        
        const rowRenderer = ({ index, key, style }) => {
            return (
                <div 
                key={key} 
                style={{
                    ...style,
                    lineHeight: `${lineHeight}px`,
                    borderBottomStyle: 'dotted',
                    borderWidth: '2px',
                    borderColor: 'lightgrey',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                }}
                tableLength={bookTable[index].length}
                tableKey={index} 
                >
                    <div style={{
                        width: 5,
                        height: 5,
                        backgroundColor: tableState[index] == 1 ? 'lightseagreen' : 'lightslategray',
                        borderRadius: 5,
                        marginRight: '5px',
                        marginLeft: '15px',
                        display: 'inline-block',
                    }}></div>
                    <span>{bookTable[index].title}</span>
                </div>
            );
        };
       
        return (
            <div  onClick={(e) => this.props.handleTableClick(e)} >
                <List 
                height={clientHeight}
                rowCount={bookTable.length}
                rowHeight={lineHeight}
                width={clientWidth * 0.7}
                rowRenderer={rowRenderer}
                style={{
                    backgroundColor: 'white',
                    opacity: 0.95,
                }}
                />
            </div>
        );
    }
}