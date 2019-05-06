const cacheVersion = 'v1.7';
const overPage = '/ayBook';
const cacheKey = overPage + cacheVersion;
let urlTiming = {};
let messagePort;

const shouldCache = [
    // 缓存api search
    {
        reg: new RegExp(/getNumber/i),
        time: 86400000,  // ms
    },
    {
        reg: new RegExp(/(jpg|jpeg|png)$/i), // 缓存 图片资源
        time: 86400000,
    },
];

this.addEventListener('install', function (event) {
    // this.skipWaiting();
    // 如果监听到了 service worker 已经安装成功的话，就会调用 event.waitUntil 回调函数
    event.waitUntil(
        // 安装成功后操作 CacheStorage 缓存，使用之前需要先通过 caches.open() 打开对应缓存空间。
        caches.open(cacheKey).then(function (cache) {
            return cache.addAll([
                '/src/static/img/icon144.png',
                '/dist/index.js',
            ]);
        })
    );
});

// 删除上个版本key
this.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => {
            if (cacheName !== cacheKey && cacheName.indexOf(overPage) !== -1) {
                return caches.delete(cacheName);
            }
        }));
    }));
});

this.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // console.log(event.request);
            // console.log(response);
            // 如果 Service Worker 有自己的返回，就直接返回，减少一次 http 请求
            // const urlSetTime = urlTiming[event.request.url + 'time'];
            // if (urlSetTime && Date.now() - parseInt(urlSetTime) >) {

            // }
            if (response) {
                for (let i = 0; i < shouldCache.length; i++) {
                    const item = shouldCache[i];
                    if (item.time && event.request.url.match(item.reg)) { // 如果cache中有需要定时清除的数据
                        const urlSetTime = urlTiming[event.request.url + 'time']; // 并且已经缓存或该次response 上次存储的时间
                        if (urlSetTime && Date.now() - parseInt(urlSetTime) > item.time) { // 如果超时
                            break;
                        } else {
                            return response;
                        }
                    }
                }
            }

            // 如果 service worker 没有返回，那就得直接请求真实远程服务
            const request = event.request.clone(); // 把原始请求拷过来
            return fetch(request).then(function (httpRes) {
                if (!httpRes || httpRes.status !== 200) {
                    return httpRes;
                }

                shouldCache.find(item => {
                    if (event.request.url.match(item.reg)) {
                        const responseClone = httpRes.clone();
                        caches.open(cacheKey).then(function (cache) {
                            cache.put(event.request, responseClone);
                            if (item.time) {
                                setTiming(event.request.url);
                            }
                        });
                        return true;
                    }
                    return false;
                });

                return httpRes;
            });
        })
    );
});


this.addEventListener('message', function (event) {
    if (event.data === 'port') {
        messagePort = event.ports[0];
        messagePort.onmessage = e => {
            if (e.data.type === 'urlTime') {
                urlTiming = e.data.data;
            }
        };
    }
});

// 存储urltime
const setTiming = function(url) {
    if (messagePort) {
        urlTiming[url + 'time'] = Date.now();
        messagePort.postMessage({
            type: 'urlTime',
            data: urlTiming,
        });
    }
};