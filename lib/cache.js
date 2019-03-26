if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(function (registration) {
                // 注册成功
            })
            .catch(function (err) {
                // 注册失败:(
            });
    });
    const channel = new MessageChannel();
    navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage('port', [channel.port2]);
    const urlTimeStr = localStorage.getItem('urlTime');
    channel.port1.postMessage({
        type: 'urlTime',
        data: urlTimeStr ? JSON.parse(urlTimeStr) : {},
    });
    channel.port1.onmessage = e => {
        if (e.data.type === 'urlTime') {
            localStorage.setItem('urlTime', JSON.stringify(e.data.data));
        }
    };
}