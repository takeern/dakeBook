import React, { PureComponent } from 'react';

export default class ReadContent extends PureComponent {
    render () {
        const { bookData, modelState, contentFont } = this.props;
        const style = {
            backgroundColor: modelState === '白天'? 'antiquewhite' : 'black',
            color: modelState === '白天'? 'black' : 'white',
            fontSize: contentFont,
        };
        return (
            bookData &&
            <div style={style} dangerouslySetInnerHTML={{ __html: bookData }}></div>
        );
    }
}