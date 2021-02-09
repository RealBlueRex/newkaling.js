// © 2021 Kiri.dev, All rights reserved.
// GNU General Public License v3.0
// Permissions of this strong copyleft license are conditioned on making available complete source code of licensed works and modifications,
// which include larger works using a licensed work, under the same license.
// Copyright and license notices must be preserved.
// Contributors provide an express grant of patent rights.
// License https://github.com/dev-kiri/KakaoLink/blob/main/LICENSE

module.exports = (function () {
    'use strict'
    const { CryptoJS } = require('./crypto')
    
    function Kakao() {
        this.apiKey = null
        this.cookies = {}
        this.kakaoStatic = 'sdk/1.36.6 os/javascript lang/en-US device/Win32 origin/'
    }

    // Kakao.prototype.init = function (apiKey, location) {
        
    //     if (apiKey.constructor != String || location.constructor != String) throw new TypeError('매개변수의 타입이 올바르지 않습니다.')
    //     if (apiKey.length != 32) throw new ReferenceError('API KEY는 32자여야 합니다. 올바른 API KEY를 사용했는지 확인해주세요.')
    //     if (!/^http(s)?\:\/\/.+/.test(location)) throw new ReferenceError('도메인 주소의 형식이 올바르지 않습니다.')

    //     this.apiKey = apiKey
    //     this.kakaoStatic += encodeURIComponent(location || 'http://kiribot.dothome.co.kr')
    // }

    Kakao.prototype.login = function (email, password, apiKey, location) {
        if (apiKey.constructor != String || location.constructor != String) throw new TypeError('매개변수의 타입이 올바르지 않습니다.')
        if (apiKey.length != 32) throw new ReferenceError('API KEY는 32자여야 합니다. 올바른 API KEY를 사용했는지 확인해주세요.')
        if (!/^http(s)?\:\/\/.+/.test(location)) throw new ReferenceError('도메인 주소의 형식이 올바르지 않습니다.')
        this.apiKey = apiKey
        this.kakaoStatic += encodeURIComponent(location || 'http://kiribot.dothome.co.kr')

        if (email.constructor != String) throw new TypeError('이메일의 타입은 String이어야 합니다.')
        if (password.constructor != String) throw new TypeError('비밀번호의 타입은 String이어야 합니다.')
        if (this.apiKey === null) throw new ReferenceError('로그인 메서드가 카카오 SDK가 초기화되기 전에 호출되었습니다.')
        
        const loginResponse = org.jsoup.Jsoup.connect('https://sharer.kakao.com/talk/friends/picker/link')
            .data('app_key', this.apiKey)
            .data('validation_action', 'default')
            .data("validation_params", '{}')
            .data("ka", this.kakaoStatic)
            .data("lcba", "")
            .method(org.jsoup.Connection.Method.POST)
            .execute();
        
        switch (loginResponse.statusCode()) {
            case 401: throw new ReferenceError('유효한 API KEY인지 확인해주세요.');
            case 200:
                this.referer = loginResponse.url().toExternalForm();
                const doc = loginResponse.parse();
                const cryptoKey = doc.select('input[name=p]').attr('value')
                
                Object.assign(this.cookies, {
                    _kadu: loginResponse.cookie('_kadu'),
                    _kadub: loginResponse.cookie('_kadub'),
                    _maldive_oauth_webapp_session: loginResponse.cookie('_maldive_oauth_webapp_session'),
                    TIARA: (
                        org.jsoup.Jsoup.connect('https://track.tiara.kakao.com/queen/footsteps')
                            .ignoreContentType(true)
                            .execute()
                            .cookie('TIARA')
                    )
                });
                
                const response = org.jsoup.Jsoup.connect('https://accounts.kakao.com/weblogin/authenticate.json')
                    .referrer(this.referer)
                    .cookies(this.cookies)
                    .data('os', 'web')
                    .data('webview_v', '2')
                    .data('email', CryptoJS.AES.encrypt(email, cryptoKey).toString())
                    .data('password', CryptoJS.AES.encrypt(password, cryptoKey).toString())
                    .data('stay_signed_in', 'true')
                    .data('continue', decodeURIComponent(this.referer.split('=')[1]))
                    .data('third', 'false')
                    .data('k', 'true')
                    .method(org.jsoup.Connection.Method.POST)
                    .ignoreContentType(true)
                    .ignoreHttpErrors(true)
                    .execute();
                
                switch (JSON.parse(response.body()).status) {
                    case -450: 
                        throw new ReferenceError('이메일 또는 비밀번호가 올바르지 않습니다.');
                    case -481: 
                    case -484:
                        throw new ReferenceError(response.body())
                    case 0:
                        Object.assign(this.cookies, {
                            _kawlt: response.cookie('_kawlt'),
                            _kawltea: response.cookie('_kawltea'),
                            _karmt: response.cookie('_karmt'),
                            _karmtea: response.cookie('_karmtea')
                        })
                        break;
                    default:
                        throw new Error('로그인 도중 에러가 발생하였습니다. ' + response.body())
                }
                break;
            default: throw new Error('API KEY 인증 과정에서 에러가 발생하였습니다.')
        }
    }
    
    Kakao.prototype.send = function (room, params, type) {
        const response = org.jsoup.Jsoup.connect('https://sharer.kakao.com/talk/friends/picker/link')
            .referrer(this.referer)
            .cookie('TIARA', this.cookies.TIARA)
            .cookie('_kawlt', this.cookies._kawlt)
            .cookie('_kawltea', this.cookies._kawltea)
            .cookie('_karmt', this.cookies._karmt)
            .cookie('_karmtea', this.cookies._karmtea)
            .data('app_key', this.apiKey)
            .data('validation_action', type || 'default')
            .data('validation_params', JSON.stringify(params))
            .data('ka', this.kakaoStatic)
            .data('lcba', '')
            .ignoreHttpErrors(true)
            .method(org.jsoup.Connection.Method.POST)
            .execute();
        
        switch (response.statusCode()) {
            case 400: throw new ReferenceError('템플릿 객체가 올바르지 않거나, Web 플랫폼에 등록되어 있는 도메인과 현재 도메인이 일치하지 않습니다.')
            case 200:
                Object.assign(this.cookies, {
                    KSHARER: response.cookie('KSHARER'),
                    using: 'true'
                });
                const doc = response.parse();
                const validatedTalkLink = doc.select('#validatedTalkLink').attr('value');
                const csrfToken = doc.select('div').last().attr('ng-init').split('\'')[1];
                const { chats, securityKey: key } = JSON.parse(
                     org.jsoup.Jsoup.connect('https://sharer.kakao.com/api/talk/chats')
                        .referrer('https://sharer.kakao.com/talk/friends/picker/link')
                        .header('Csrf-Token', csrfToken)
                        .header('App-Key', this.apiKey)
                        .cookies(this.cookies)
                        .ignoreContentType(true)
                        .execute()
                        .body()
                        .toString()
                        .replace('\u200b', '')
                )
                
                for (var i = 0, j = chats.length, id, securityKey; i < j; i++) {
                    const chat = chats[i];
                    if (chat.title === room) {
                        id = chat.id || null;
                        securityKey = key || null;
                        break;
                    }
                }

                if (id === null) throw new ReferenceError('방 이름 ' + room + '을 찾을 수 없습니다. 올바른 방 이름인지 확인해주세요.');

                const payload = {
                    receiverChatRoomMemberCount: [1],
                    receiverIds: [id],
                    receiverType: 'chat',
                    securityKey: securityKey,
                    validatedTalkLink: JSON.parse(validatedTalkLink)
                };

                org.jsoup.Jsoup.connect('https://sharer.kakao.com/api/talk/message/link')
                    .referrer('https://sharer.kakao.com/talk/friends/picker/link')
                    .header('Csrf-Token', csrfToken)
                    .header('App-Key', this.apiKey)
                    .header('Content-Type', 'application/json;charset=UTF-8')
                    .cookie('KSHARER', this.cookies.KSHARER)
                    .cookie('TIARA', this.cookies.TIARA)
                    .cookie('using', this.cookies.using)
                    .cookie('_kadu', this.cookies._kadu)
                    .cookie('_kadub', this.cookies._kadub)
                    .cookie('_kawlt', this.cookies._kawlt)
                    .cookie('_kawltea', this.cookies._kawltea)
                    .cookie('_karmt', this.cookies._karmt)
                    .cookie('_karmtea', this.cookies._karmtea)
                    .requestBody(JSON.stringify(payload))
                    .ignoreContentType(true)
                    .ignoreHttpErrors(true)
                    .method(org.jsoup.Connection.Method.POST)
                    .execute()
                
                break;
            
            default: throw new Error('템플릿 인증 과정 중에 알 수 없는 오류가 발생하였습니다.');
        }
    }

    Kakao.prototype.sendText = function(roomTitle, Text, dec) { //텍스트 보내기
        this.send(roomTitle, {
            "link_ver": "4.0",
            "template_id": 46424, //템플릿 id 입력
            "template_args": { //${변수명}들 입력
                "Text": Text,
                "dec": dec
            }
        }, "custom");
    };
    
    Kakao.prototype.sendImage = function(roomTitle, imageUrl, Text, dec) { //이미지 보내기
        this.send(roomTitle, {
            "link_ver": "4.0",
            "template_id": 46448, //템플릿 id 입력
            "template_args": { //${변수명}들 입력
            "img": imageUrl,
            "Text": Text,
            "dec": dec
        }
    }, "custom");
}

    return Kakao
})();