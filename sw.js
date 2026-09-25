// Service Worker - キャッシュなし版
// 要望「取引先からの新規申請・取消・修正の通知を、アプリを閉じていても届くようにしたい」
// への対応。アプリのタブを閉じている・見ていない間にFirebase Cloud Messagingから届いた
// プッシュ通知は、ページ自身ではなくこのService Workerが受け取って画面に表示する必要が
// あるため、既存のこのファイル（キャッシュを一切使わない・常に最新を取得するだけの
// ものだった）にFirebase Messagingの初期化とバックグラウンド受信の処理を追記した。
// 既存のキャッシュ無効化の動作（install/activate/fetch）はそのまま変えていない。
// importScripts自体が読み込めない場合（オフライン時など）でも、try/catchにより既存の
// キャッシュ無効化の動作には影響しない。
try {
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyBQ3flrqjgVV-fgfVF3DvDsowLsQASYLUk",
    authDomain: "trip-app-a1746.firebaseapp.com",
    databaseURL: "https://trip-app-a1746-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "trip-app-a1746",
    storageBucket: "trip-app-a1746.firebasestorage.app",
    messagingSenderId: "529959327002",
    appId: "1:529959327002:web:9e98a8aa9b6afae54208a3"
  });

  const messaging = firebase.messaging();
  // アプリ（タブ）を閉じている・見ていない間に届いたプッシュ通知を、OSの通知として表示する
  messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || '株式会社KANETAKA';
    const body = (payload.notification && payload.notification.body) || '';
    self.registration.showNotification(title, { body, icon: './icon-192.png' });
  });
} catch (e) {
  // Firebase Messagingの初期化に失敗しても、下の既存のキャッシュ無効化の動作は
  // そのまま動き続ける
}

self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});
