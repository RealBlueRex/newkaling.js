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
 module.exports = {
     JsKey: null, Static: "sdk/1.36.6 os/javascript lang/en-US device/Win32 origin/", referer: null, cookies: {},
     login: function (email, password, apiKey, url) {
         if(typeof(email) !== "string" || typeof(password) !== "string" || typeof(apiKey) !== "string") throw new TypeError("parameter is must type String");
         if(apiKey.length != 32) throw new ReferenceError("JsKey is must 32 length");
         if(!/^http(s)?\:\/\/.+/.test(url)) throw new ReferenceError("url is startsWith http:// or https://");
         this.JsKey = apiKey || null, this.Static += encodeURIComponent(url || "http://example.com");
         if(this.JsKey == null) throw new ReferenceError("JsKey가 null입니다?");
         const lr = Jsoup.connect("https://sharer.kakao.com/talk/friends/picker/link").data({
             "app_key": java.lang.String(this.JsKey),
             "validation_action": "default",
             "validation_params": "{}",
             "ka": java.lang.String(this.Static),
             "lcba": ""
         }).method(org.jsoup.Connection.Method.POST).execute();
         const ls = lr.statusCode();
         switch (ls) {
             case 200:
                 this.referer = lr.url().toExternalForm()
                 let doc = lr.parse();
                 const decryptKey =  doc.select('input[name=p]').attr('value');
                 Object.assign(this.cookies, {
                     _kadu: lr.cookie('_kadu'),
                     _kadub: lr.cookie('_kadub'),
                     _maldive_oauth_webapp_session: lr.cookie('_maldive_oauth_webapp_session'),
                     TIARA: (Jsoup.connect('https://track.tiara.kakao.com/queen/footsteps').ignoreContentType(true).execute().cookie('TIARA'))
                 });
                 const r = Jsoup.connect("https://accounts.kakao.com/weblogin/authenticate.json").referrer(this.referer).cookies(this.cookies).data({
                     "os": "web",
                     "webview_v": "2",
                     "email": crypto.AES.encrypt(email, decryptKey).toString(),
                     "password": crypto.AES.encrypt(password, decryptKey).toString(),
                     "stay_signed_in": "true",
                     "continue": decodeURIComponent(this.referer.split("=")[1]),
                     "third": "false",
                     "k": "true"
                 }).method(org.jsoup.Connection.Method.POST).ignoreContentType(true).ignoreHttpErrors(true).execute();
                 const sc = JSON.parse(r.body()).status;
                 switch (sc) {
                     case 0:
                         Object.assign(this.cookies, {
                             _kawlt: r.cookie('_kawlt'),
                             _kawltea: r.cookie('_kawltea'),
                             _karmt: r.cookie('_karmt'),
                             _karmtea: r.cookie('_karmtea')
                         })
                         break;
                     case -450: throw new ReferenceError("Login Error -450");
                     case -481:
                     case -484: throw new Error("undefined Error -484: " + r.body());               
                     default: throw new Error("Auth Error " + r.body());
                 }
                 break;
             case 401: throw new ReferenceError('Please check JsKey');
             default: throw new Error('Auth Error')
         }
     },
     sendCustom: function (room, template_id, template_args) {
         if(this.JsKey == null) throw new ReferenceError("JsKey is null");
         let json = {
             "link_ver": "4.0",
             "template_id": template_id,
             "template_args": JSON.stringify(template_args)
         }
         const sr = Jsoup.connect("https://sharer.kakao.com/talk/friends/picker/link").referrer(this.referer).cookies({
             "TIARA": this.cookies.TIARA,
             "_kawlt": this.cookies._kawlt,
             "_kawltea": this.cookies._kawltea,
             "_karmt": this.cookies._karmt,
             "_karmtea": this.cookies._karmtea
         }).data({
             "app_key": this.JsKey,
             "validation_action": "custom",
             "validation_params": JSON.stringify(json),
             "ka": java.lang.String(this.Static),
             "lcba": ""
         }).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute();
         const src = sr.statusCode();
         switch (src) {
             case 200:
                 Object.assign(this.cookies, {
                     KSHARER: sr.cookie('KSHARER'),
                     using: 'true'
                 });
                 const doc = sr.parse(), vtr = doc.select('#validatedTalkLink').attr('value'), ni = doc.select('div').last().attr('ng-init').split('\'')[1];
                 const { chats, sk: key } = JSON.parse(Jsoup.connect('https://sharer.kakao.com/api/talk/chats').referrer('https://sharer.kakao.com/talk/friends/picker/link')
                 .header('Csrf-Token', ni)
                 .header('App-Key', this.JsKey)
                 .cookies(this.cookies).ignoreContentType(true).execute().body().toString().replace('\u200b', ''))
                 for (var i = 0, j = chats.length, id, sk; i < j; i++) {
                     const chat = chats[i];
                     if (chat.title == room) {
                         id = chat.id || null;
                         sk = key || null;
                         break;
                     } 
                 }
                 if(id === null) throw new ReferenceError("undefined the roomname: " + room);
                 Jsoup.connect("https://sharer.kakao.com/api/talk/message/link").referrer("https://sharer.kakao.com/talk/friends/picker/link")
                    .header('Csrf-Token', ni)
                    .header('App-Key', this.JsKey)
                    .header('Content-Type', 'application/json;charset=UTF-8').cookies({
                         "KSHARER": this.cookies.KSHARER,
                         "TIARA": this.cookies.TIARA,
                         "using": this.cookies.using,
                         "_kadu": this.cookies._kadu,
                         "_kadub": this.cookies._kadub,
                         "_kawlt": this.cookies._kawlt,
                         "_kawltea": this.cookies._kawltea,
                         "_karmt": this.cookies._karmt,
                         "_karmtea": this.cookies._karmtea
                    }).requestBody(JSON.stringify({
                         "receiverChatRoomMemberCount": [1],
                         "receiverIds": [id],
                         "receiverType": 'chat',
                         "securityKey": sk,
                         "validatedTalkLink": JSON.parse(vtr)
                    })).ignoreContentType(true).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute()
                 break;
         
             case 400: throw new ReferenceError('The template object is not valid. If you have another domain, please add the corresponding Url in Kakao Developer Settings.');

             default: throw new Error('undefined Error');
         }
     },
     sendData: function (room, json) {
        if(this.JsKey == null) throw new ReferenceError("JsKey is null");
        let json = {
            "link_ver": "4.0",
            "template_object": JSON.stringify(json)
        }
        const sr = Jsoup.connect("https://sharer.kakao.com/talk/friends/picker/link").referrer(this.referer).cookies({
            "TIARA": this.cookies.TIARA,
            "_kawlt": this.cookies._kawlt,
            "_kawltea": this.cookies._kawltea,
            "_karmt": this.cookies._karmt,
            "_karmtea": this.cookies._karmtea
        }).data({
            "app_key": this.JsKey,
            "validation_action": "default",
            "validation_params": JSON.stringify(json),
            "ka": java.lang.String(this.Static),
            "lcba": ""
        }).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute();
        const src = sr.statusCode();
        switch (src) {
            case 200:
                Object.assign(this.cookies, {
                    KSHARER: sr.cookie('KSHARER'),
                    using: 'true'
                });
                const doc = sr.parse(), vtr = doc.select('#validatedTalkLink').attr('value'), ni = doc.select('div').last().attr('ng-init').split('\'')[1];
                const { chats, sk: key } = JSON.parse(Jsoup.connect('https://sharer.kakao.com/api/talk/chats').referrer('https://sharer.kakao.com/talk/friends/picker/link')
                .header('Csrf-Token', ni)
                .header('App-Key', this.JsKey)
                .cookies(this.cookies).ignoreContentType(true).execute().body().toString().replace('\u200b', ''))
                for (var i = 0, j = chats.length, id, sk; i < j; i++) {
                    const chat = chats[i];
                    if (chat.title == room) {
                        id = chat.id || null;
                        sk = key || null;
                        break;
                    } 
                }
                if(id === null) throw new ReferenceError("undefined the roomname");
                Jsoup.connect("https://sharer.kakao.com/api/talk/message/link").referrer("https://sharer.kakao.com/talk/friends/picker/link")
                .header('Csrf-Token', ni)
                .header('App-Key', this.JsKey)
                .header('Content-Type', 'application/json;charset=UTF-8').cookies({
                    "KSHARER": this.cookies.KSHARER,
                    "TIARA": this.cookies.TIARA,
                    "using": this.cookies.using,
                    "_kadu": this.cookies._kadu,
                    "_kadub": this.cookies._kadub,
                    "_kawlt": this.cookies._kawlt,
                    "_kawltea": this.cookies._kawltea,
                    "_karmt": this.cookies._karmt,
                    "_karmtea": this.cookies._karmtea
                }).requestBody(JSON.stringify({
                    "receiverChatRoomMemberCount": [1],
                    "receiverIds": [id],
                    "receiverType": 'chat',
                    "securityKey": sk,
                    "validatedTalkLink": JSON.parse(vtr)
                })).ignoreContentType(true).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute()
                break;
        
            case 400: throw new ReferenceError('Please register to Kakao Developer');

            default: throw new Error('undefined Error');
        }
     }
 }