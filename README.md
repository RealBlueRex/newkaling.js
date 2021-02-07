# newkaling.js
kaling.js를 심플하게 바꾸는 작업입니다(원본 소스는 델타님에게 있습니다)

# onelinekaling.js
kaling.js를 더더욱 심플하게 바꾸는 작업입니다(원본 소스는 델타님에게 있습니다)

# 기존 카링 소스와 차이점
1. Kakao.init(apikey)대신 Kakao.login(id, paaswd, apikey)로 통합해서 소스를 효율적으로 변환하였습니다.
2. Kakao.sendText()와 Kakao.sendImage()를 추가했습니다.

# 최근 업데이트
1. Kakao.sendText(room, Text) 형식에서 Kakao.sendText(room, Text, dec)으로 변경되었습니다 이때 dec은 안보내도 상관이 없습니다.
2. Kakao.sendImage(room, URL) 형식에서 Kakao.sendImage(room, URL, Text, dec)로 변경되었습니다 이때, Text는 카링 제목, dec은 설명입니다 이 둘은 안보내도 오류를 일으키지 않습니다.
