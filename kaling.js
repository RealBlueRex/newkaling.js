/**
* Created by archethic on 2021/07/16
*/

'use strict';

const { CryptoJS } = require('./crypto')

module.exports = /** @class */ (function () {
    /**
     * Kakao Init
     * @param {String} apiKey Kakao Developers JSKey
     * @param {String} URI Kakao Developers URI
     */
    function KakaoLink(apiKey, URI) {
        if(typeof apiKey != 'string' || typeof URI != 'string') throw new TypeError('apiKey or URI is must be string');
        if(apiKey.length != 32) throw new Error('apiKey is must be 32 length');
        if(!/^http(s)?\:\/\/.+/.test(location)) throw new Error('URI is must be form "http://example.com"');
        
        /** @private */ this.apiKey = apiKey;
        /** @private */ this.cookies = {};
        /** @private */ this.sendForm = 'sdk/1.36.6 os/javascript lang/en-US device/Win32 origin/' + encodeURIComponent(location || 'https://developers.kakao.com');
    }

    /**
     * Kakao Login
     * @param {String} email Kakao Accounts Email
     * @param {String} password Kakao Accoutns Password
     */
    KakaoLink.prototype.login = function (email, password) {
        if(typeof email != 'string') throw new TypeError('email is must be string');
        if(typeof password != 'string') throw new TypeError('password is must be string');
        if(this.apiKey === null) throw new Error('Please Init apiKey');

        const loginResponse = org.jsoup.Jsoup.connect('https://sharer.kakao.com/talk/friends/picker/link')
            .data({
                app_key: this.apiKey,
                validation_action: 'default',
                validation_params: '{}',
                ka: this.sendForm,
                lcba: ''
            }).method(org.jsoup.Connection.Method.POST).execute();

        if(loginResponse.statusCode() != 200) throw new Error('login stopping with status: ' + loginResponse.statusCode());

        /** @private */ this.referer = loginResponse.url().toExternalForm();
        const doc = loginResponse.parse(), cryptoKey = doc.select('input[name=p]').attr('value');

        Object.assign(this.cookies, {
            _kadu: loginResponse.cookie('_kadu'),
            _kadub: loginResponse.cookie('_kadub'),
            _maldive_oauth_webapp_session_key: loginResponse.cookie('_maldive_oauth_webapp_session_key'),
            TIARA: org.jsoup.Jsoup.connect('https://track.tiara.kakao.com/queen/footsteps').ignoreContentType(true).execute().cookie('TIARA'),
        });

        const authResponse = org.jsoup.Jsoup.connect('https://accounts.kakao.com/weblogin/authenticate.json')
            .referrer(this.referer)
            .cookies(this.cookies)
            .data({
                os: 'web',
                webview_v: '2',
                email: CryptoJS.AES.encrypt(email, cryptoKey) + '',
                password: CryptoJS.AES.encrypt(password, cryptoKey) + '',
                stay_signed_in: 'true',
                continue: decodeURIComponent(this.referer.split('=')[1]),
                third: 'false',
                k: 'true'
            }).method(org.jsoup.Connection.method.POST).ignoreContentType(true).ignoreHttpErrors(true)
            .execute();
        
        if(JSON.parse(authResponse.body()).status != 0) throw new Error('auth stopping with status: ' + JSON.parse(authResponse.body()).status);

        Object.assign(/** @private */ this.cookies, {
            _kawlt: authResponse.cookie('_kawlt'),
            _kawltea: authResponse.cookie('_kawltea'),
            _karmt: authResponse.cookie('_karmt'),
            _karmtea: authResponse.cookie('_karmtea'),
        });

        return true;
    }

    /**
     * Kakao Link Send
     * @param {String} room Room Name
     * @param {{ template_id: number | string, template_args: any, template_object: { button_title: string, object_type: 'feed' | 'list' | 'location' | 'commerce' | 'text', 
     * content: { title: string, description: string, image_url: string, link: any }, social: { likeCount: number, commentCount: number, shareCount: number }, 
     * buttons: [{title: string, link: { web_url: string, moblie_web_url: string }}] } }} obj Kakao Send Info
     * @param {'custom' | 'default'} type send Type
     */
    KakaoLink.prototype.send = function (room, obj, type) {
        if(!obj.link_ver) Object.assign(obj, { link_ver: '4.0' });
        const readyResponse = org.jsoup.Jsoup.connect('https://sharer.kakao.com/talk/friends/picker/link')
            .referrer(this.referer)
            .cookies(this.cookies)
            .data({
                app_key: this.apiKey,
                validation_action: type || 'default',
                validation_params: JSON.stringify(obj),
                ka: this.sendForm,
                lcba: ''
            }).ignoreHttpErrors(true).method(org.jsoup.Connection.method.POST).execute();
        
        if(readyResponse.statusCode() != 200) throw new Error('send stopping with status: ' + readyResponse.statusCode())

        Object.assign(this.cookies, {
            KSHARER: readyResponse.cookie('KSHARER'),
            using: 'true',
        });
        const doc = readyResponse.parse(), validatedTalkLink = doc.select('#validatedTalkLink').attr('value'),
            csrfToken = doc.select('div').last().attr('ng-init').split('\'')[1], { chats, securityKey: key } = JSON.parse(
                org.jsoup.Jsoup.connect('https://sharer.kakao.com/api/talk/chats')
            )
    }

    return KakaoLink
})();
