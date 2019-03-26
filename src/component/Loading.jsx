import React, { Component } from 'react';
import '../static/css/loading.less';
import { connect } from 'react-redux';

const mapStateToProps = (state) => {
    const { isLoading } = state.init;
    return {
        isLoading,
    };
};

@connect(mapStateToProps)
export default class Loading extends Component {
    render() {
        const { isLoading } = this.props;
        if(!isLoading) return null;
        return (
            <div class="loader">
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
                    <div class="loader-line-wrap">
                        <div class="loader-line"></div>
                    </div>
            </div>
        );
    }
}