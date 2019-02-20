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
            this.props.localBookNumber = localBookNumber;
            this.fetchLocalData();
        } else { // 本地查不到此书
            //网络请求
            this.props.readingTableNumber = 100000; // readingTableNumber
            this.fetchBookInitData();
            return;
        }
    }
    fetchLocalData () {
        const { localBookNumber } = this.props;
        let { lastReadHistory, tableState } = this.getBookRecord(localBookNumber);
        if(!tableState) {
                //网络请求
            this.fetchBookInitData();
            return;
        } 
        if (!lastReadHistory) {
            lastReadHistory = 100000; // 起始章节基数 第一章
        }
        this.props.tableState = tableState;
        this.props.readingTableNumber = lastReadHistory; // 存储当前阅读章节
        this.getDbInitData();
        
    }
    getDbInitData () {
        const { localBookNumber, tableState, readingTableNumber } = this.props;
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
            Promise.all([ this.getDbBookData(), pr2 ]).then(async data => {
                if (!data[1]) {
                    return this.fetchBookInitData();
                }
                if (!data[0]) {
                    // const booknumer = 
                    const tableNumber = parseInt(readingTableNumber) - 100000;
                    const res = await this.fetchBookData(data[1][tableNumber].href, this.state.bookNumber);
                    // console.log(bookData);
                    if (res.bookData) {
                        this.setTableBookData(res.bookData);
                        return this.setReactState(res.bookData, data[1]);
                    } 
                    return this.setReactState('网络异常，服务器无法获取数据', data[1]);
                }
                return this.setReactState(data[0], data[1]);
            });
        } else {
            // console.log('bendi mei youzhangjie');
            this.fetchBookInitData();
        }
    }
    getDbBookData() {
        const { localBookNumber, readingTableNumber } = this.props;
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
        const { tableState } = this.props;
        const { bookTable } = this.state;
        for(let index = 200; index < 220; index++) {
            if(tableState[index] == 1) continue;
            const bookHref = bookTable && bookTable[index].href;
            const res = await this.fetchBookData(bookHref);
            console.log(res);
                // console.log(bookData);
            if (res.bookData) {
                this.setTableBookData(res.bookData, this.props.localBookNumber * 1000000 + index + 100000);
                this.updateStorageTableState(index);
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
    // setBookTableToStorage () {
    //     const { localBookNumber } = this.props;
    //     localStorageSet(`${localBookNumber}-table`, 1);
    // }
    setReadHistory () {
        const { localBookNumber, readingTableNumber } = this.props;
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
                this.initDbTable(initData.table.bookList); // 初始化 存储目录
                this.initStorageTableState(initData.table.bookList.length); // 初始化 目录状态
                this.setReadHistory();  // 存储本次阅读历史
                this.setTableBookData(initData.bookData.bookData); // 存储本章db
                this.setReactState(initData.bookData.bookData, initData.table.bookList);
            }
        }
    }
    //  存储目录到indexdb
    initDbTable (table) {
        let { localBooks } = this.props;
        const { readingBookName } = this.state;
        let obj;
        let localBookNumber;
        if (localBooks) {
            let { length } = localBooks;
            length += 1;
            localBookNumber = 1000 + length;
            obj = Object.assign({}, localBooks, {
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
        this.props.localBookNumber = localBookNumber;
        this.props.localBooks = obj;
        this.setTable(localBookNumber, table); // 存储目录
        // this.setBookTableToStorage();
        return localBookNumber;
    }
    initStorageTableState (length) {
        const state = new Array(length).fill(0);
        localStorageSet(`${this.props.localBookNumber}-table`, state);
        this.updateStorageTableState(0);
    }
    /**
     * 更新书籍某章节存储状态
     * @param {number} number 章节number 
     */
    updateStorageTableState (number) {
        let state = localStorageGet(this.props.localBookNumber, 'table');
        if (state) {
            state = state.split(',');
        }
        state[number] = 1;
        localStorageSet(`${this.props.localBookNumber}-table`, state);
        this.props.tableState = state;
    }
    // 存储本章章节
    setTableBookData (data, tableNumber = this.props.localBookNumber * 1000000 + parseInt(this.props.readingTableNumber)) {
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
    setReactState(bookData, bookTable) {
        this.setState({
            readingData: bookData,
            bookTable: bookTable,
        });
    }
    /**
     * 获取某章节数据
     * @param {number} tableNumber 章节目录号
     */
    onTableChange(tableNumber) {
        const { tableState } = this.props;
        const { bookTable } = this.state;
        // console.log(tableNumber)
        const checkNumber = tableNumber - 1000000;
        if (checkNumber < 0 || checkNumber > tableState.length) return;
        const serachNumber = this.props.localBookNumber * 1000000 + tableNumber;
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
        if (!this.props.tableShowState) {
            this.refs.tableWrap.style.transition = 'transform 0.3s';
            this.refs.tableWrap.style.transform = 'translate(70vw, 0)';
            this.props.tableShowState = true;
        }
    }

    handleTableClose () {
        if (this.props.tableShowState) {
            this.refs.tableWrap.style.transition = 'transform 0.5s';
            this.refs.tableWrap.style.transform = 'translate(-70vw, 0)';
            this.props.tableShowState = false;
        }
    }

    handleTableClick (e) {
        const tableKey = e.target.getAttribute('tableKey') ?
            e.target.getAttribute('tableKey') :
            e.target.parentNode.getAttribute('tableKey');
        // console.log(tableKey);
        const tableNumber = parseInt(tableKey) + 100000;
        // const serachNumber = this.props.localBookNumber * 1000000 + tableNumber;
        this.onTableChange(tableNumber);
        // const { tableState } = this.props;
        // const { bookTable } = this.state;
        // if (tableState[tableKey] == '1') { 
        //     // 本地有缓存
        //     this.getTableData(serachNumber).then(bookData => {
        //         if (bookData) {
        //             this.fetchTableData(tableNumber, bookData.data);
        //         } else {
        //             this.fetchTableData(tableNumber, null, bookTable[tableKey].href, tableKey);
        //         }
        //     });
        // } else {
        //     this.fetchTableData(tableNumber, null, bookTable[tableKey].href, tableKey);
        // }
    }
    /**
     * reset 页面，更新数据
     * @param {number} readingTableNumber 章节号
     * @param {string} bookHref 章节地址
     * @param {string} bookData 章节数据
     */
    async fetchTableData (readingTableNumber, bookData, bookHref, tableNumber) {
        let { tableState } = this.props;
        if (!bookData) {
            const res = await this.fetchBookData(bookHref);
            bookData = res.bookData;
            if (bookData) {
                tableState = this.updateStorageTableState(tableNumber);
                this.setTableBookData(bookData,
                    this.props.localBookNumber * 1000000 + parseInt(tableNumber) + 100000
                );
            }
        }
        this.props.readingTableNumber = readingTableNumber;
        this.setState({
            readingData: bookData,
            tableState,
        });
    }

    // content component -->
    handleContentClick () {
        if (this.props.tableShowState) {
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
    handleSetClick(e) {
        let target = e.target;
        while(!target.getAttribute('data-set')) {
            if(target.className === 'read_set') return;
            target = target.parentNode;
        }
        const cmd = target.getAttribute('data-set');
        switch(cmd) {
            case('目录'): {
                if (!this.props.tableShowState) {
                    this.handleTableOpen();
                } else {
                    this.handleTableClose();
                }
                break;
            }
            default: break;
        }
    }
    render () {
        const { readingData, bookTable, modelState, setShowState } = this.state;
        const { tableState, readingTableNumber } = this.props;
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
                        /> 
                    }
                </div>
                <div className='read_content' onClick={() => this.handleContentClick()}>
                    <ReadContent bookData={bookData} />
                </div>
                <div ref='tableWrap' className='read_table'>
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
