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
  // アプリ（タブ）を閉じている・見ていない間に届いたプッシュ通知を、OSの通知として表示する。
  //
  // ── iPhoneで同じ通知が2つ届いてしまう問題への対応 ──
  // これまでサーバー側はFCMの「notification」という形式でメッセージを送っていたが、この形式は
  // ブラウザ（Service Worker）側が何もしなくても自動的にOSの通知を表示してしまう仕組みが
  // あり、それに加えてこのonBackgroundMessageの中でも自分でshowNotificationを呼んでいたため、
  // 「自動表示された1つ」＋「自分で表示した1つ」の合計2つが表示されてしまうことがあった。
  // （Macでは自動表示側が働かず1つだけになっていた一方、iPhoneでは両方とも働いてしまって
  // いたと見られる。）これを避けるため、サーバー側は「data」という、自動表示が一切起きない
  // 形式で送るように変更し、通知の表示は必ずこのonBackgroundMessageの中の1箇所だけで行う
  // ようにした。あわせて、読み取り先もpayload.notificationではなくpayload.dataに変更している。
  messaging.onBackgroundMessage((payload) => {
    const title = (payload.data && payload.data.title) || '株式会社KANETAKA';
    const body = (payload.data && payload.data.body) || '';
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
