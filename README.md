# newkaling.js
kaling.js를 심플하게 바꾸는 작업입니다(원본 소스는 키리님에게 있습니다)

# onelinekaling.js
kaling.js를 더더욱 심플하게 바꾸는 작업입니다(원본 소스는 키리님에게 있습니다)

# 기존 카링 소스와 차이점
1. Kakao.init(apikey)대신 Kakao.login(id, paaswd, apikey)로 통합해서 소스를 효율적으로 변환하였습니다.
2. Kakao.sendText()와 Kakao.sendImage()를 추가했습니다.

# 최근 업데이트
1. Kakao.sendText(room, Text) 형식에서 Kakao.sendText(room, Text, dec)으로 변경되었습니다 이때 dec은 안보내도 상관이 없습니다.
2. Kakao.sendImage(room, URL) 형식에서 Kakao.sendImage(room, URL, Text, dec)로 변경되었습니다 이때, Text는 카링 제목, dec은 설명입니다 이 둘은 안보내도 오류를 일으키지 않습니다.
3. 델타님의 기본 카링 소스를 키리님의 카링소스로 변경하였습니다.

# 주의사항
1. 키리님의 기본카링 소스에 GNU 라이선스가 적용됨에 따라 수정이 가능하다는 점에서 수정작업을 진행합니다.

# 예제 소스
```javascript
const kakaoModule = require('renewkaling');
const Kakao = new kakaoModule();

Kakao.login('email', 'password', 'JSkey', 'http://example.com'); // 카카오링크를 보낼 계정의 이메일과 비밀번호, 자바스크립트 키, Web 플랫폼에 등록한 도메인

function response(room, msg) {
    if (msg === '/테스트') {
        Kakao.send(room, {
            link_ver: '4.0',
            template_id: 10000,
            template_args: {}
        }, 'custom')
    }

    if (msg == "/텍스트") {
        Kakao.sendText(room, "안녕하세요", "예제입니다.");
    }
    
    if (msg == "/이미지") {
        Kakao.sendImage(rooom, "URL", "안녕하세요", "이미지입니다.")
    }
}

```
