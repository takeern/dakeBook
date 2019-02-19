import React, { PureComponent } from 'react';

export default class ReadContent extends PureComponent {
    render () {
        const { bookData } = this.props;
        return (
            bookData &&
            <div dangerouslySetInnerHTML={{ __html: bookData }}></div>
        );
    }
}