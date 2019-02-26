import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localStorageGet, localStorageSet } from '../ulit/ulit';

// component
import ReadTable from './ReadTable';
import ReadContent from './ReadContent';
import ReadSet from './ReadSet';

import '../static/css/index.less';
import '../static/css/read.less';
// action 
import { getInitData, getBookData } from '../redux/read/action';

const mapStateToProps = (state) => {
    const { localDb, storageProps } = state.init;
    return {
        localDb,
        storageProps,
    };
};

@connect(mapStateToProps)
export default class Read extends Component {
    constructor(props) {
        super(props);
        this.state = {
            readingBookName: decodeURI(new RegExp(/[?&]bookName=([^&]+)/g).exec(window.location.href)[1]),
            bookNumber: new RegExp(/[?&]bookNumber=([^&]+)/g).exec(window.location.href)[1],
            readingData: null, // 当前阅读章节数据
            modelState: '白天',
            setShowState: false,
            bookTable: [], // 目录数据
            contentFont: 28,
        };
    }
    /**
     * @localBookNumber {number} 本地书籍对应的书号
     * @readingTableNumber {number} 当前正在阅读章对应章节号
     * 
     */
    componentDidMount () {
        const { storageProps } = this.props; // to do error
        const { readingBookName } = this.state;
        const localBookNumber = this.getLocalbookNumber(readingBookName, storageProps); // 本地书籍对应的书号
        if (localBookNumber) { // 本地有记录此书
            this.fetchLocalData(localBookNumber);
        } else { // 本地查不到此书
            //网络请求
            this.fetchBookInitData();
            return;
        }
    }
    fetchLocalData (localBookNumber) {
        let { lastReadHistory, tableState } = this.getBookRecord(localBookNumber);
        if(!tableState) {
            this.fetchBookInitData();
            return;
        } 
        if (!lastReadHistory) {
            lastReadHistory = 100000; // 起始章节基数 第一章
        }
        this.getDbInitData(localBookNumber, tableState, lastReadHistory);
        
    }
    getDbInitData (localBookNumber, tableState, readingTableNumber) {
        console.log(localBookNumber, tableState, readingTableNumber, 'getDbInitData');
        const indb = this.checkReadingTableState(readingTableNumber, tableState);
        if (indb) {
            const pr2 = new Promise(reslove => {
                const tableNumber = localBookNumber;
                this.getTableData(tableNumber).then(bookData => {
                    if (bookData) {
                        reslove(bookData.data);
                    } else {
                        reslove(null);
                    }
                });
            });
            Promise.all([ this.getDbBookData(localBookNumber, readingTableNumber), pr2 ]).then(async data => {
                if (!data[1]) {
                    return this.fetchBookInitData();
                }
                if (!data[0]) {
                    const tableNumber = parseInt(readingTableNumber) - 100000;
                    const res = await this.fetchBookData(data[1][tableNumber].href, this.state.bookNumber);
                    if (res.bookData) {
                        this.setTableBookData(res.bookData);
                        return this.setReactState(res.bookData, data[1], localBookNumber, tableState, readingTableNumber);
                    } 
                    return this.setReactState('网络异常，服务器无法获取数据', data[1], localBookNumber, tableState, readingTableNumber);
                }
                return this.setReactState(data[0], data[1], localBookNumber, tableState, readingTableNumber);
            });
        } else {
            this.fetchBookInitData();
        }
    }
    getDbBookData(localBookNumber, readingTableNumber) {
        return new Promise((reslove) => {
            const tableNumber = localBookNumber * 1000000 + parseInt(readingTableNumber); // indexdb 号
            this.getTableData(tableNumber).then(bookData => {
                if (bookData) {
                    reslove(bookData.data);
                } else {
                    reslove(null);
                }
            });
        });
    }
    async fetchBookAllData () {
        const { tableState } = this.updateStorageTableState;
        const { bookTable, localBookNumber } = this.state;
        for(let index = 200; index < 220; index++) {
            if(tableState[index] == 1) continue;
            const bookHref = bookTable && bookTable[index].href;
            const res = await this.fetchBookData(bookHref);
            if (res.bookData) {
                this.setTableBookData(res.bookData, localBookNumber * 1000000 + index + 100000);
                this.updateStorageTableState(index, localBookNumber);
            } else {
                console.log(res);
            }
        }
    }
    fetchBookData(bookHref, bookNumber = this.state.bookNumber) {
        const res = getBookData(bookNumber, bookHref);
        return res;
    }
    // 获取本地storage 书号
    getLocalbookNumber (readingBookName, localBooks) {
        if (localBooks && readingBookName) {
            return localBooks[readingBookName] || false;
        }   
        return false;
    }
    setReadHistory (localBookNumber, readingTableNumber) {
        localStorageSet(`${localBookNumber}-history`, readingTableNumber);
    }
    // 获取本地阅读历史，书目录
    getBookRecord (localBookNumber) {
        return {
            lastReadHistory: localStorageGet(localBookNumber, 'history'),
            tableState: localStorageGet(localBookNumber, 'table') 
                ? localStorageGet(localBookNumber, 'table').split(',') : null,
        };
    }
    // 获取indexdb 数据
    async getTableData (tableNumber) {
        let bookData;
        try {
            bookData = await this.props.localDb.getTable(tableNumber);
        } catch(e) {
            console.log(e);
        }
        return bookData;
    }
    /**
     * 获取初始化第一章内容
     */
    async fetchBookInitData () {
        const initData = await getInitData(this.state.bookNumber);
        if (initData.code === 200) {
            if (initData.table && initData.bookData) {
                const readingTableNumber = 100000; // 初始化启第一章 号
                const localBookNumber = this.initDbTable(initData.table.bookList); // 初始化 存储目录 获取初始化书号
                const tableState = this.initStorageTableState(localBookNumber, initData.table.bookList.length); // 初始化 目录状态
                this.setReadHistory(localBookNumber, readingTableNumber);  // 存储本次阅读历史
                this.setTableBookData(initData.bookData.bookData, readingTableNumber + localBookNumber * 1000000); // 存储本章db
                this.setReactState(initData.bookData.bookData, initData.table.bookList, localBookNumber, tableState, readingTableNumber);
            }
        }
    }
    //  存储目录到indexdb
    initDbTable (table) {
        let { storageProps } = this.props;
        const { readingBookName } = this.state;
        let obj;
        let localBookNumber;
        if (storageProps) {
            let { length } = storageProps;
            length += 1;
            localBookNumber = 1000 + length;
            obj = Object.assign({}, storageProps, {
                length,
                [readingBookName]: localBookNumber,
            });
            localStorageSet('localBooks', JSON.stringify(obj));
        } else {
            const length = 1;
            localBookNumber = 1000 + length;
            obj = {
                [readingBookName]: localBookNumber,
                length,
            };
            localStorageSet('localBooks', JSON.stringify(obj));
        }
        this.setTable(localBookNumber, table); // 存储目录
        return localBookNumber;
    }
    initStorageTableState (localBookNumber, length) {
        const state = new Array(length).fill(0);
        localStorageSet(`${localBookNumber}-table`, state);
        return this.updateStorageTableState(0, localBookNumber);
    }
    /**
     * 更新书籍某章节存储状态
     * @param {number} number 章节number 
     */
    updateStorageTableState (number, localBookNumber) {
        let state = localStorageGet(localBookNumber, 'table');
        if (state) {
            state = state.split(',');
        }
        state[number] = 1;
        localStorageSet(`${localBookNumber}-table`, state);
        return state;
    }
    // 存储本章章节
    setTableBookData (data, tableNumber = this.state.localBookNumber * 1000000 + parseInt(this.props.readingTableNumber)) {
        this.setTable(tableNumber, data);
    }
    // 查询本章存储状态
    checkReadingTableState (tableNumber, tableState) {
        return tableState[parseInt(tableNumber) - 100000] === 0 ? false : true;
    }
    setTable (tableNumber, data) {
        this.props.localDb.setTable({
            tableNumber,
            data,
        });
    }
    setReactState(bookData, bookTable, localBookNumber, tableState, readingTableNumber) {
        this.setState({
            readingData: bookData,
            bookTable: bookTable,
            localBookNumber,
            tableState,
            readingTableNumber,
        });
    }
    /**
     * 获取某章节数据
     * @param {number} tableNumber 章节目录号
     */
    onTableChange(tableNumber) {
        const { bookTable, tableState, localBookNumber } = this.state;
        const checkNumber = tableNumber - 1000000;
        if (checkNumber < 0 || checkNumber > tableState.length) return;
        const serachNumber = localBookNumber * 1000000 + tableNumber;
        if (tableState[tableNumber] == '1') { 
            // 本地有缓存
            this.getTableData(serachNumber).then(bookData => {
                if (bookData) {
                    this.fetchTableData(tableNumber, bookData.data);
                } else {
                    this.fetchTableData(tableNumber, null, bookTable[checkNumber].href, checkNumber);
                }
            });
        } else {
            this.fetchTableData(tableNumber, null, bookTable[checkNumber].href, checkNumber);
        }
    }

    // 组件操作 
    
    //table 组件
    handleTableOpen () {
        if (this.refs.tableWrap.className.indexOf('close')) {
            this.refs.tableWrap.className = this.refs.tableWrap.className.replace('close', 'open');
            this.refs.tableWrap.style.transition = 'transform 0.3s';
            this.refs.tableWrap.style.transform = 'translate(70vw, 0)';
        }
    }

    handleTableClose () {
        if (this.refs.tableWrap.className.indexOf('open')) {
            this.refs.tableWrap.className = this.refs.tableWrap.className.replace('open', 'close');
            this.refs.tableWrap.style.transition = 'transform 0.5s';
            this.refs.tableWrap.style.transform = 'translate(-70vw, 0)';
        }
    }

    handleTableClick (e) {
        const tableKey = e.target.getAttribute('tableKey') ?
            e.target.getAttribute('tableKey') :
            e.target.parentNode.getAttribute('tableKey');
        const tableNumber = parseInt(tableKey) + 100000;
        this.onTableChange(tableNumber);
    }
    /**
     * reset 页面，更新数据
     * @param {number} readingTableNumber 章节号
     * @param {string} bookHref 章节地址
     * @param {string} bookData 章节数据
     */
    async fetchTableData (readingTableNumber, bookData, bookHref, tableNumber) {
        let { tableState, localBookNumber } = this.state;
        if (!bookData) {
            const res = await this.fetchBookData(bookHref);
            bookData = res.bookData;
            if (bookData) {
                tableState = this.updateStorageTableState(tableNumber);
                this.setTableBookData(bookData,
                    localBookNumber * 1000000 + parseInt(tableNumber) + 100000
                );
            }
        }
        
        this.setState({
            readingData: bookData,
            tableState,
            readingTableNumber,
        });
    }

    // content component -->
    handleContentClick () {
        const { setShowState } = this.state;
        if (setShowState && this.refs.tableWrap.className.indexOf('open') !== -1) {
            this.handleTableClose();
            return;
        }
        this.setState({
            setShowState: !this.state.setShowState,
        });
    }

    // component set -->
    handleChangeClick (cmd) {
        const { readingTableNumber } = this.props;
        if (cmd === 'next') {
            const tableNumber = readingTableNumber + 1;

            this.onTableChange(tableNumber);
        } else if (cmd === 'last') {
            const tableNumber = readingTableNumber - 1;
            this.onTableChange(tableNumber);
        }
    }
    handleSetClick(cmd) {
        switch(cmd) {
            case('目录'): {
                if (this.refs.tableWrap.className.indexOf('open') !== -1) {
                    this.handleTableClose();
                } else {
                    this.handleTableOpen();
                }
                break;
            }
            case('夜晚'): {
                this.setState({
                    modelState: '夜晚',
                });
                break;
            }
            case('白天'): {
                this.setState({
                    modelState: '白天',
                });
                break;
            }
            default: break;
        }
    }
    handleFontChange(e) {
        const target = e.target;
        let { contentFont } = this.state;
        if (target.getAttribute('data-font') === '+') {
            this.setState({
                contentFont: ++ contentFont,
            });
        } else {
            this.setState({
                contentFont: -- contentFont,
            });
        }
    }
    render () {
        const { readingData, bookTable, modelState, setShowState, contentFont, tableState, readingTableNumber } = this.state;
        let bookData = 'loading', tableTitle;
        if (readingData) bookData = readingData;
        if (bookTable && readingTableNumber) tableTitle = bookTable[parseInt(readingTableNumber) - 100000].title;

        return (
            <div>
                {/* <div>
                    <button onClick={() => this.handleTableOpen()}>open</button>
                </div> */}
                <div style={{
                    position: 'fixed',
                    height: 0,
                    width: 0,
                }}>
                    { 
                        setShowState && 
                        <ReadSet 
                        modelState={modelState} 
                        tableTitle={tableTitle}
                        handleChangeClick={this.handleChangeClick.bind(this)}
                        handleSetClick={this.handleSetClick.bind(this)}
                        handleFontChange={this.handleFontChange.bind(this)}
                        /> 
                    }
                </div>
                <div className='read_content' onClick={() => this.handleContentClick()}>
                    <ReadContent bookData={bookData} modelState={modelState} contentFont={contentFont}/>
                </div>
                <div ref='tableWrap' className='read_table close'>
                    { 
                        bookTable && 
                        <ReadTable 
                        bookTable={bookTable} 
                        tableState={tableState}
                        handleTableClick={this.handleTableClick.bind(this)}
                        />
                    }
                </div>
            </div>
            
        );
    }
}

// Read.defaultProps = {
//     r
// }