import React, { PureComponent } from 'react';

export default class ReadContent extends PureComponent {
    render () {
        const { bookData, modelState, contentFont } = this.props;
        const style = {
            backgroundColor: modelState === '白天'? 'antiquewhite' : 'black',
            color: modelState === '白天'? 'black' : 'white',
            fontSize: contentFont,
            whiteSpace: 'pre-wrap',
            padding: '0px 5px 0px 10px',
            minHeight: '100vh',
            lineHeight: 1.8
        };
        return (
            bookData &&
            <div style={style} dangerouslySetInnerHTML={{ __html: bookData }}></div>
        );
    }
}