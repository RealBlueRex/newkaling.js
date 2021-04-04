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
 let JsKey = null, Static = "sdk/1.36.6 os/javascript lang/en-US device/Win32 origin/", referer = null, cookies = {}
 module.exports = {
     login: function (email, password, apiKey, url) {
         if(typeof(email) !== "string" || typeof(password) !== "string" || typeof(apiKey) !== "string") throw new TypeError("parameter is must type String");
         if(apiKey.length != 32) throw new ReferenceError("JsKey is must 32 length");
         if(!/^http(s)?\:\/\/.+/.test(url)) throw new ReferenceError("url is startsWith http:// or https://");
         JsKey = apiKey || null, Static += encodeURIComponent(url || "http://example.com");
         if(JsKey == null) throw new ReferenceError("JsKey가 null입니다?");
         const lr = Jsoup.connect("https://sharer.kakao.com/talk/friends/picker/link").data({
             "app_key": java.lang.String(JsKey),
             "validation_action": "default",
             "validation_params": "{}",
             "ka": java.lang.String(Static),
             "lcba": ""
         }).method(org.jsoup.Connection.Method.POST).execute();
         const ls = lr.statusCode();
         if(ls == 200) {
            referer = lr.url().toExternalForm()
            let doc = lr.parse();
            const decryptKey =  doc.select('input[name=p]').attr('value');
            Object.assign(cookies, {
                _kadu: lr.cookie('_kadu'),
                _kadub: lr.cookie('_kadub'),
                _maldive_oauth_webapp_session: lr.cookie('_maldive_oauth_webapp_session'),
                TIARA: (Jsoup.connect('https://track.tiara.kakao.com/queen/footsteps').ignoreContentType(true).execute().cookie('TIARA'))
            });
            const r = Jsoup.connect("https://accounts.kakao.com/weblogin/authenticate.json").referrer(referer).cookies(cookies).data({
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
                case -484: throw new Error("undefined Error -484: " + r.body());               
                default: throw new Error("Auth Error " + r.body());
            }
         } else if(ls == 401) throw new ReferenceError('Please check JsKey');
         else throw new Error('Auth Error');
     },
     sendData: function (room, json, type) {
        if(JsKey == null) throw new ReferenceError("JsKey is null");
        const sr = Jsoup.connect("https://sharer.kakao.com/talk/friends/picker/link").referrer(referer).cookies({
            "TIARA": cookies.TIARA,
            "_kawlt": cookies._kawlt,
            "_kawltea": cookies._kawltea,
            "_karmt": cookies._karmt,
            "_karmtea": cookies._karmtea
        }).data({
            "app_key": JsKey,
            "validation_action": type || "default",
            "validation_params": JSON.stringify(json),
            "ka": java.lang.String(Static),
            "lcba": ""
        }).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute();
        const src = sr.statusCode();
        if(src == 200) {
            Object.assign(cookies, {
                KSHARER: sr.cookie('KSHARER'),
                using: 'true'
            });
            const doc = sr.parse(), vtr = doc.select('#validatedTalkLink').attr('value'), ni = doc.select('div').last().attr('ng-init').split('\'')[1];
            const { chats, sk: key } = JSON.parse(Jsoup.connect('https://sharer.kakao.com/api/talk/chats').referrer('https://sharer.kakao.com/talk/friends/picker/link')
            .header('Csrf-Token', ni)
            .header('App-Key', JsKey)
            .cookies(cookies).ignoreContentType(true).execute().body().toString().replace('\u200b', ''))
            for (var i = 0, j = chats.length, id, sk; i < j; i++) {
                const chat = chats[i];
                if (chat.title == room) {
                    id = chat.id || null;
                    sk = key || null;
                    break;
                } 
            }
            if(id === null) throw new ReferenceError("undefined the roomname" + room);
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
                "securityKey": sk,
                "validatedTalkLink": JSON.parse(vtr)
            })).ignoreContentType(true).ignoreHttpErrors(true).method(org.jsoup.Connection.Method.POST).execute()
        } else if(src == 400) throw new ReferenceError('The template object is not valid. If you have another domain, please add the corresponding Url in Kakao Developer Settings.');
        else throw new Error('undefined Error');
     },
     sendCustom: function (roomName, template_id, json) {
        let j = {
            "link_ver": "4.0",
            "template_id": template_id,
            "template_args": JSON.stringify(json)
        }
        this.sendData(roomName, JSON.stringify(j), "custom");
     },
     sendDefault: function (roomName, json) {
        let j = {
            "link_ver": "4.0",
            "template_object": JSON.stringify(json)
        }
         this.sendData(roomName, JSON.stringify(j), "default");
     }
 }