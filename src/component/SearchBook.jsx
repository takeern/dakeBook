import React, { PureComponent } from 'react';
import { searchBook } from '../redux/search/action';
import { mapDispatch } from '../redux/read/action';
import { connect } from 'react-redux';
import { toast } from '../ulit/ulit';

const mapStateToProps = (state) => {
    const { localDb, storageProps } = state.init;
    return {
        localDb,
        storageProps,
    };
};

@connect(mapStateToProps, mapDispatch)
export default class Search extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            searchData: null,
        };
    }
    // componentDidMount()
    handleSearch() {
        const { searchBtn } = this.refs;
        const { loadingChange } = this.props;
        loadingChange(true);
        searchBtn.blur();
        const bookName = searchBtn.value.replace(/^\s+|\s+$/g, '');
        searchBook(bookName).then(data => {
            loadingChange(false);
            if(data.length === 0) {
                toast('找不到该书');
            }else if (Object.prototype.toString.apply(data) === '[object String]') {
                toast('系统超时，请稍后尝试');
            } else {
                this.setState({
                    searchData: data,
                });
            }
        });
    }

    handleLocalBookChange () {
        const { storageProps } = this.props;
        console.log(storageProps);
        if (!storageProps || !storageProps.length) {
            toast('本地没有书籍！');
            return;
        }
        const { localList, localIcon } = this.refs;
        const showState = localList.getAttribute('data-state');
        if (showState == 'open') {
            localList.style.transition = 'transform 0.3s ease 0s';
            localList.style.transform = 'translate(0vw, 0px)';
            localList.setAttribute('data-state', 'close');
            localIcon.style.transition = 'transform 1s ease 0s';
            localIcon.style.transform = 'rotate(0deg)';
        } else {
            localList.style.transition = 'transform 0.3s ease 0s';
            localList.style.transform = 'translate(80vw, 0px)';
            localList.setAttribute('data-state', 'open');
            localIcon.style.transition = 'transform 1s ease 0s';
            localIcon.style.transform = 'rotate(180deg)';
        }
    }

    handleClick(e) {
        let target = e.target;
        while(target.className !== 'localWrap' && !target.getAttribute('data-bookNumber')) {
            target = target.parentNode;
        }
        const bookName = target.getAttribute('data-bookName');
        const bookNumber = target.getAttribute('data-bookNumber');
        if (bookNumber && bookName) {
            this.props.history.push(`/read?bookName=${bookName}&bookNumber=${bookNumber}`);
        }
    }

    render () {
        const { searchData } = this.state;
        const { storageProps } = this.props;
        let searchList, localList;
        if (searchData) {
            searchList = showBookItem(searchData);
        }
        if (storageProps) {
            localList = showLocalBook(storageProps);
        }
        return (
            <div style={{
                // eslint-disable-next-line
                backgroundImage: `url('/src/static/img/searchBackImg.png')`,
                backgroundSize: 'cover',
                minWidth: '100vw',
                minHeight: '100vh',
            }}>
                <div style={{
                    top: '20vh',
                    // border: '1px solid #dfe1e5',
                    borderRadius: '24px',
                    width: '70vw',
                    margin: '0 auto',
                    height: '50px',
                    display: 'flex',
                    flexFlow: 'row',
                    position: 'relative',
                    justifyContent: 'center',
                }}>
                    <input
                    ref='searchBtn' 
                    onKeyPress={(e) => {
                        if (e.charCode === 13) {
                            this.handleSearch();
                        }
                    }}
                    placeholder='搜索书名或作者名'
                    style={{
                        borderRadius: '24px',
                        width: '80%',
                        border: 'none',
                        fontSize: '16px',
                    }}></input>
                    <span style={{
                        fontSize: '24px',
                        height: '50px',
                        lineHeight: '50px',
                        marginLeft: 10,
                    }}
                    onClick={(e) => this.handleSearch(e)}
                    >
                        <svg class="icon" aria-hidden="true"
                            dangerouslySetInnerHTML={{
                                __html: '<use xlink:href="#icon-search"></use>',
                            }}
                        >
                        </svg>
                    </span>
                </div>
                <div style={{
                    width: '90vw',
                    margin: '30vh auto 0',
                }}
                className='localWrap'
                onClick={(e) => this.handleClick(e)}
                >
                    {searchList}   
                </div>
                <div ref='localList' data-state={'close'} style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    left: '-80vw',
                }}>
                    <div className='localWrap' onClick={(e) => this.handleClick(e)} style={{
                        display: 'flex',
                        flexFlow: 'row',
                        flexWrap: 'wrap',
                        width: '75vw',
                        padding: '10px 2vw',
                        justifyContent: 'space-around',
                        boxShadow: '1px 5px 10px grey',
                        backgroundColor: 'white',
                        borderRadius: '0 20px 20px 0',
                    }}>
                        {localList}
                    </div>
                    <div ref='localIcon' className='leftIcon' onClick={() => this.handleLocalBookChange()}></div>
                </div>
            </div>
        );
    }
}

const showBookItem = (searchData) => {
    return searchData.map((item, index) => {
        return(
            <div 
            data-bookNumber={item.bookNumber}
            data-bookName={item.bookName} 
            key={index}
            style={{
                marginTop: 10,
                padding: '10px 10px',
                display: 'flex',
                fontSize: '20px',
                borderRadius: '20px',
                backgroundColor: 'white',
                alignItems: 'center',
            }}
            >
                <div>
                    <img src={`/src/static/img/fm${index % 13}.jpeg`} width={100}/>
                </div>
                <div style={{
                    marginLeft: '5px',
                    textIndent: '15px',
                    height: '200px',
                }}>
                    <p style={{
                        fontSize: '18px',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '200px',
                        overflow: 'hidden',
                    }}>{item.bookName}</p>
                    <p style={{
                        fontSize: '13px',
                        color: 'darkgreen',
                    }}>状态： {item.bookState}</p>
                    <div style={{
                        whiteSpace:' pre-wrap',
                        fontSize: 14,
                        height: 140,
                        overflow: 'hidden',
                    }}>简介： {item.bookIntro}</div>
                </div>

            </div>
        );
    });
};

const showLocalBook = (storageProps) => {
    const book = [];
    for (let i in storageProps) {
        if (isNaN(parseInt(i)) && i !== 'length') {
            book.push({
                bookName: i,
                bookNumber: storageProps[storageProps[i]],
            });
        }
    }
    return book.map((item, index) => {
        // const rm = Math.floor(Math.random() * 14) + 1;
        return (
            <div key={index} data-bookNumber={item.bookNumber} data-bookName={item.bookName}>
                <div>
                    <img src={`/src/static/img/fm${index + 1}.jpeg`} width={80} height={115} style={{ display: 'block' }}/>
                    <p style={{
                        fontSize: '14px',
                        textAlign: 'center',
                        marginTop: 3,
                    }}>{item.bookName}</p>
                </div>
            </div>
        );
    });
};