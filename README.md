# 함께 뛰는 즐거움 🏃‍♀️🏃이RUN 저RUN💨💨
## 🏃‍ 1. Introduction

![로고](https://user-images.githubusercontent.com/100745412/170878912-8c879a79-a77b-49db-8ba5-72882d56bdea.png)


### 함께 달릴 땐? 이런저런!

이런저런은 그룹러닝 매칭 플랫폼입니다!

👉 러닝의 즐거움을 여럿이서 함께 나누고 싶으신 분  
👉 나만 알고 있던 코스를 다른 사람들과 러닝하고 싶으신 분  
👉 러닝을 시작하고 싶은데 혼자여서 망설이고 계신 분  

#### 이런저런을 통해 다른 사람들과 함께 달리는 즐거움을 느껴보세요. 
#### [👉 이런저런 사용해보기👈](https://www.erunjrun.com/)

<br/>


## 🛠 2. Service Architecture
![서비스아키텍처](https://user-images.githubusercontent.com/49478770/171983712-d218deef-d305-43a0-b64a-f64d5263c8ef.png)



## 📉 3. ERD
<br/>

![erd](https://user-images.githubusercontent.com/49478770/170922570-d0850ae9-9a2d-4d9e-95b1-8d0aa85388a4.PNG)



## 💼 4. Core Tools

### Language
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

### Framework
![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

### Infrastructure
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

### DB
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

### Dev tools
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
<img src="https://img.shields.io/badge/VSCode-007ACC?style=for-the-badge&logo=Visual Studio Code&logoColor=white"/>

### Library
| Name                | Appliance               | Version  |
| :-----------------: | :---------------------: | :------: |
| crypto              | 핸드폰 암호화         |4.1.1|
| cors                | CORS 핸들링             |2.8.5|
| dotenv              | 환경변수 설정           |16.0.0|
| helmet              | HTTP header 보안        |5.0.2|
| express-validator   | validator               |17.6.0|
| mysql2            | DB                        |2.3.3|
| sequelize            | mySQL ORM              |6.19.0|
| redis            | 토큰용 DB                  |4.0.6|
| jsonwebtoken        | JWT토큰 발급            |8.5.1|
| passport            | node.js authentication  |0.5.2|
| passport-kakao      | 카카오 소셜 로그인 모듈      |1.0.1|
| passport-naver-v2      | 네이버 소셜 로그인 모듈      |2.0.8|
| multer              | 파일 업로드             |1.4.4|
| multer-s3           | AWS S3 파일 업로드      |2.10.0|
| morgan              | HTTP 요청 로그 관리     |1.10.0|
| winston             | 전체 서비스 로그 관리   |3.7.2|
| node-schedule	          |  알림/문자전송 자동화     |2.1.0|
| jest                |  테스트코드             |28.1.0|
| supertest                |  테스트코드             |6.2.3|
| artillery	          |  스트레스 테스트 툴     |2.0.0-17|
| axios          |  API 통신(네이버 sens)     |0.27.2|


<br>
<br/>


## 🖥 5. Core tech
### 🔐 회원가입/로그인/사용자 인증 : 카카오/네이버 소셜로그인,JWT 토큰 방식(Access token/Refresh token) & redis
- 카카오와 네이버 소셜로그인으로 별도 회원가입 과정 없이 간단하게 가입  
- JWT 토큰 인증 방식을 통해 회원들의 로그인 인증관리 및 Access / Refresh 토큰을 활용하여 로그인 기간 관리  
- 비교적 인증기간이 긴 Refresh의 경우, REDIS와의 비교검증을 통해 유효성 검사  

### 📷 AWS S3를 이용한 이미지 관리 및 Lambda를 활용한 이미지 리사이징
- 서비스에 업로드되는 이미지의 효율적인 용량관리를 위해 이미지 리사이징  
- S3 - Lambda 연동을 통해 웹서버와 분리하여 서버리스로 리사이징 하고 S3에 저장함으로써 효율적인 이미지 관리  

### ⏰ node-schedule을 이용한 알림/SMS발송 자동화 시스템
- 스케줄러를 이용해서 사용자가 신청/생성한 그룹러닝 데이터를 분석해서 사용자에게 그룹러닝 참여/후기 작성에 대한 알림/SMS 자동화 시스템을 활용  
- 사용자가 지속적으로 서비스를 활용할 수 있도록 지속적인 관리 및 오프라인기반 서비스에 대한 사후 관리

<br/>

## 🔥 6. Trouble shooting
### issue1: 소셜로그인과 토큰 관리 방식

#### 🙁 situation
- 사용자의 회원가입 편의성을 위해, 소셜로그인을 주요 로그인 방식으로 구현했습니다. 그런데 카카오/네이버로부터 발급받은 토큰에는 사용자를 식별하기 위한 데이터를 삽입할 수가 없었습니다. 그리고 토큰 만료시간을 일관적으로 관리할 수 없었습니다.

#### 🛑 cause
- 소셜로그인을 통해 카카오/네이버에게 발급받은 토큰은 저희가 자체적으로 복호화하거나 수정할 수 없기 때문이었습니다. 

#### 🚥 solution 
- 소셜로그인에 성공한 유저에게 저희가 자체적으로 제작한 accessToken과 refreshToken을 발급했습니다.
이를 통해, 카카오/네이버로 로그인한 모든 유저들의 토큰 만료 시간을 일관적으로 관리할 수 있게 되었고, 서비스 로직에서 사용자 인증을 거친 유저의 식별 데이터를 활용할 수 있게 되었습니다.

### issue2: 알림/SMS 전송 자동화 시스템
#### 1) 알림/SMS 전송 자동화 시스템 이관
#### 🙁 situation
- 알림/SMS 전송 스케줄러는 모든 그룹러닝들을 빼먹지 않고 분석하기 위해서 1분 주기로 실행하고 있었습니다. 그리고 이 스케줄러는 웹 서버에 포함되어 있었습니다. 그런데, 개발 과정에서 스케줄러가 작동되지 않는 문제가 발생했습니다.
- 스케줄러는 사이트에 등록된 모든 그룹러닝을 매 순간 분석하고, 이를 바탕으로 유저에게 알림을 전송해야하므로, 웹서버가 꺼지더라도 계속 실행되어야 합니다.

#### 🛑 cause
- 스케줄러가 웹 서버에 포함되어 있기 때문에, CD 과정, 서버 내 에러 등의 이슈로 웹 서버가 꺼진 것이 원인이었습니다. 즉, 스케줄러가 작동되어야 하는 시간에 웹 서버가 꺼져버린 것이 원인이었습니다.

#### 🚥 solution 
- 알림/SMS 전송 스케줄러는 웹 서버에 있는 소스코드들과는 별개로 오직 DB만 통신하는 로직이었습니다. 그래서 저희는 알림 스케줄러를 웹 서버에서 분리해 별도의 AWS EC2 서버로 이관해서 이를 독립적으로 실행시켰습니다.
   - 이를 통해, 웹 서버의 상황과 무관하게 유저에게 지속적으로 알림을 보낼 수 있게 되었습니다.

#### 2) SMS 전송 여부 확인
#### 🙁 situation
- SMS 발송은 Naver sens에 API 요청을 통해 구현한 기능으로, 요금이 청구되는 기능입니다. 네이버에서 최종적으로 청구된 요금을 확인할 수 있지만, 정확한 요금 책정/관리를 위해 팀 자체적으로도 SMS를 발송 내역을 수집해야할 필요성을 느꼈습니다.

#### 🚥 solution 
- "sendSMS"라는 column을 알림 테이블에 새로 생성했습니다. 스케줄러를 통해 SMS 발송 후, 발송한 SMS의 Type을 sendSMS에 다음과 같은 형식으로 저장해서, 팀 자체적으로 SMS 발송 내역을 수집하였습니다. 
   - 0: 발송 하지 않음
   - 1: SMS 발송
   - 2: LMS 발송

### issue3: 이미지 리사이징 / Lambda 실행속도 관련 이슈
#### 1) 이미지 리사이징
#### 🙁 situation
- 서비스 특성상 게시물(그룹러닝/코스추천)의 이미지가 필수값이거나 고화질의 디폴트 이미지를 불러오기 때문에 이미지 소스관리가 중요함
- 용량이 큰 이미지들이 다수 렌더링될때 처리시간에 대한 개선의 필요성이 부각됨

#### 🚥 solution 
- 업로드된 이미지는 AWS-S3에 저장되고 있었는데 지정된 폴더에 이미지가 업로드될때마다 이벤트 트리거를 발동시켜 Lambda의 함수가 실행되도록 연결
- 이미지 리사이징의 과정을 웹서버가 아닌 서버리스 Lambda의 함수를 통해 실행되도록 하여 웹서버 트래픽 분산
- S3에 CloudFront를 통한 CDN 서비스를 연결함으로써 지역별 CDN 서버에서 이미지가 불러와지도록 하여 처리속도 개선
- PC 테스트 결과 평균 215ms => 38ms, 최대 337ms => 10ms 로 렌더링 속도를 유의미하게 단축

#### 2) Lambda 실행속도 관련
#### 🙁 situation
- 이미지를 첨부하여 게시글 등록 후 바로 리스트 페이지로 이동한 경우 방금 등록한 이미지의 리사이징작업이 끝나지 않아 렌더링되지 않는 현상발생
- Lambda 함수의 실행속도 관련 이슈로 파악하여 Warmer 적용 / 가용메모리 증설 등 방법 적용해보았으나 2초정도의 공백이 발생

#### 🚥 solution 
- 리스트를 Get할때, 게시글의 등록시간과 현재시간을 비교하여 10초이내에 Get이 된 경우, 리사이징된 이미지가 아닌 원본 이미지가 불러와지도록 수정
- 테스트 결과 해당 로직의 추가가 API의 응답시간에 유의미한 차이가 없어 해당 방법으로 차용
- 하지만 본 트러블은 현재의 방식에 대한 단점을 볼수 있는 단적인 예로, 온디맨드 방식으로의 리팩토링에 대한 필요성 절감

## 🌟 7. BE members

<br/>
<table>
   <tr>
    <td align="center" width="20%"><b>name</b></td>
    <td align="center"width="10%"><b>postion</b></td>
    <td align="center"width="40%"><b>work</b></td>
    <td align="center"width="30%"><b>contact</b></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/hyeonjun4460"><b>유현준</b></a></td>
    <td align="center">leader</td>
    <td align="center">추천 코스 게시글 CRUD / 댓글 대댓글 / 출석체크 및 호스트평가 / 알림 및 SMS,LMS 발송</td>
    <td align="center">hyeonjun4460@gmail.com</td>
  </tr>
    <tr>
    <td align="center"><a href="https://github.com/inmyblue"><b>오지우</b></a></td>
    <td align="center">member</td>
    <td align="center">그룹러닝 모집 게시글 CRUD / 모집 신청, 취소 / 게시글 검색 필터 / 로깅 / S3-Lambda 이미지리사이징 / 로드밸런싱 </td>
    <td align="center">inmyblue0930@naver.com</td>
  </tr>
    <tr>
    <td align="center"><a href="https://github.com/DongYoung-dev"><b>신동영</b></a></td>
    <td align="center">member</td>
    <td align="center">카카오, 네이버 소셜로그인 / 휴대폰 인증 / 유저 추가정보 / JWT토큰 인증관리</td>
    <td align="center">shindy93@naver.com</td>
  </tr>
</table>
<br/>

## 🌸 More Info
[🌿 프로젝트 소개 문서]  
[💾 와이어프레임](https://www.figma.com/file/KHfXRCNHENbZ7PBS1DYT7O/%EC%9D%B4RUN%EC%A0%80RUN?node-id=0%3A1)  
[🔐 ErunJrun Front-End Repository](https://github.com/ErunJrun/ErunJrun_FE)  

