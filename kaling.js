/**
 * GNU v3 License by BlueRex
 * The license for crypto.js is owned by Google, and secondary distribution is prohibited. Other BlueRex licenses
 * Even if you use this source to violate Kakao's operating policy, we inform you that all users are responsible.
 * Copyright© all reversed BlueRex 2021 ~ 
 * ++ 델타님 카링모듈, 키리님 카링모듈을 많이 참고했어요
 */

 "use strict";
 importClass(org.jsoup.Jsoup)
 const crypto = require("./crypto").CryptoJS;
 let JsKey = null, Static = java.lang.String("sdk/1.36.6 os/javascript lang/en-US device/Win32 origin/"), referer = null, cookies = "";
 module.exports = {
     login: function (email, password, apiKey, url) {
         if(typeof(email) !== "string" || typeof(password) !== "string" || typeof(apiKey) !== "string") throw new TypeError("파라미터들은 전부 String입니다.");
         if(apiKey.length != 32) throw new ReferenceError("apiKey는 32자리입니다. 혹 다른 서비스의 apiKey를 입력하셨나요?");
         if(!/^http(s)?\:\/\/.+/.test(url)) throw new ReferenceError("url 형식이 아니에요 :(");
         JsKey = apiKey || null, Static += encodeURIComponent(java.lang.String(url)) || encodeURIComponent("http://plutonium.dothome.co.kr");
         if(JsKey == null) throw new ReferenceError("JsKey가 null입니다?");
         const lr = Jsoup.connect("https://sharer.kakao.com/talk/friends/picker/link").data({
             "app_key": java.lang.String(JsKey),
             "validation_action": "default",
             "validation_params": "{}",
             "ka": java.lang.String(Static),
             "lcba": ""
         }).method(org.jsoup.Connection.Method.POST).execute();
         const ls = lr.statusCode();
         switch (ls) {
             case 200:
                 referer = lr.url().toExternalForm()
                 let doc = lr.parse();
                 const decryptKey =  doc.select('input[name=p]').attr('value');
                 Object.assign(cookies, {
                     _kadu: lr.cookie('_kadu'),
                     _kadub: lr.cookie('_kadub'),
                     _maldive_oauth_webapp_session: lr.cookie('_maldive_oauth_webapp_session'),
                     TIARA: (tiara())
                 });
                 function tiara() {
                    return Jsoup.connect('https://track.tiara.kakao.com/queen/footsteps').ignoreContentType(true).execute().cookie('TIARA')
                 }
                 const r = Jsoup.connect("https://accounts.kakao.com/weblogin/authenticate.json").data({
                     "os": "web",
                     "webview_v": "2",
                     "email": crypto.AES.encrypt(email, decryptKey).toString(),
                     "password": crypto.AES.encrypt(password, decryptKey).toString(),
                     "stay_signed_in": "true",
                     "continue": decodeURIComponent(referer.split("=")[1]),
                     "third": "false",
                     "k": "true"
                 }).method(org.jsoup.Connection.Method.POST).ignoreContentType(true).ignoreHttpErrors(true).execute();
                 const sc = JSON.parse(r.body()).status;
                 switch (sc) {
                     case 0:
                         Object.assign(cookies, {
                             _kawlt: r.cookie('_kawlt'),
                             _kawltea: r.cookie('_kawltea'),
                             _karmt: r.cookie('_karmt'),
                             _karmtea: r.cookie('_karmtea')
                         })
                         break;
                     case -450: throw new ReferenceError("Login Error -450");
                     case -481:
                     case -484: throw new Error("undefined Error " + r.body());               
                     default: throw new Error("Auth Error " + r.body());
                 }
                 break;
             case 401: throw new ReferenceError('유효한 API KEY인지 확인해주세요.');
             default: throw new Error('Auth Error')
         }
     },
     sendCustom: function (room, template_id, template_args) {
         if(JsKey == null) throw new ReferenceError("JsKey가 등록되어있지 않습니다.");
         let json = {
             "link_ver": "4.0",
             "template_id": template_id,
             "template_args": JSON.stringify(template_args)
         }
         const sr = Jsoup.connect("https://sharer.kakao.com/talk/friends/picker/link").referrer(referer).cookies({
             "TIARA": cookies.TIARA,
             "_kawlt": cookies._kawlt,
             "_kawltea": cookies._kawltea,
             "_karmt": cookies._karmt,
             "_karmtea": cookies._karmtea
         }).data({
             "app_key": JsKey,
             "validation_action": "custom",
             "validation_params": JSON.stringify(json),
             "ka": Static,
             "lcba": ""
         }).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute();
         const src = sr.statusCode();
         switch (src) {
             case 200:
                 Object.assign(cookies, {
                     KSHARER: response.cookie('KSHARER'),
                     using: 'true'
                 });
                 const doc = sr.parse(), vtr = doc.select('#validatedTalkLink').attr('value'), ni = doc.select('div').last().attr('ng-init').split('\'')[1];
                 const { chats, sk: key } = JSON.parse(Jsoup.connect('https://sharer.kakao.com/api/talk/chats').referrer('https://sharer.kakao.com/talk/friends/picker/link')
                 .header('Csrf-Token', ni)
                 .header('App-Key', JsKey)
                 .cookies(cookies).ignoreContentType(true).execute().body().toString().replace('\u200b', ''))
                 for (var i = 0, j = chats.length, id, sk; i < j; i++) {
                     const chat = chats[i];
                     if (chat.title === room) {
                         id = chat.id || null;
                         securityKey = key || null;
                         break;
                     }
                     
                 }
                 if(id === null) throw new ReferenceError("방이 없는데요?");
                 Jsoup.connect("https://sharer.kakao.com/api/talk/message/link").referrer("https://sharer.kakao.com/talk/friends/picker/link")
                 .header('Csrf-Token', ni)
                 .header('App-Key', JsKey)
                 .header('Content-Type', 'application/json;charset=UTF-8').cookies({
                     "KSHARER": cookies.KSHARER,
                     "TIARA": cookies.TIARA,
                     "using": cookies.using,
                     "_kadu": cookies._kadu,
                     "_kadub": cookies._kadub,
                     "_kawlt": cookies._kawlt,
                     "_kawltea": cookies._kawltea,
                     "_karmt": cookies._karmt,
                     "_karmtea": cookies._karmtea
                 }).requestBody(JSON.stringify({
                     "receiverChatRoomMemberCount": [1],
                     "receiverIds": [id],
                     "receiverType": 'chat',
                     "securityKey": securityKey,
                     "validatedTalkLink": this.parsedTemplate
                 })).ignoreContentType(true).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute()
                 break;
         
             default:
                 break;
         }
     }
 }