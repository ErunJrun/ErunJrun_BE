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
![stack_diagram](https://user-images.githubusercontent.com/49478770/170918000-77b830ed-5988-4c8e-b5fa-57e778639c66.png)


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
카카오와 네이버 소셜로그인으로 별도 회원가입 과정 없이 간단하게 가입할 수 있어요. 또한 JWT 토큰 인증 방식을 통해 다중서버에서도 유저를 재인증할 필요가 없어요.
토큰은 휴대성이 짙은 데이터는 redis를 통해 관리하고 있어요. 그래서 여러 디바이스에서 로그인 할 수 있어요.

### 📷 AWS S3를 이용한 이미지 관리
웹서버의 메모리를 절약하기 위해, 용량이 큰 이미지 파일들은 모두 웹서버와 분리된 AWS S3 서버에 저장해서 사용하고 있어요.

### ⏰ node-schedule을 이용한 알림/SMS발송 자동화 시스템
스케줄러를 이용해서 사용자가 신청/생성한 그룹러닝 데이터를 분석해서 사용자에게 그룹러닝 참여/후기 작성에 대한 알림/SMS 자동화 시스템을 활용하고 있어요. 이를 통해, 사용자가 약속된 시간에 맞춰서 그룹러닝에 참여할 수 있도록 돕고 있어요. 

<br/>

## 🚨 6. Trouble shooting
- ISSUE 1
=> 문제 상황
=> 원인
=> 해결 방법 및 결과

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
    <td align="center">댓글 대댓글 /출석체크 및 호스트평가 / 추천 코스 게시글 CRUD / 알림 및 SMS,LMS 발송</td>
    <td align="center">hyeonjun4460@gmail.com</td>
  </tr>
    <tr>
    <td align="center"><a href="https://github.com/hyeonjun4460"><b>오지우</b></a></td>
    <td align="center">member</td>
    <td align="center">그룹러닝 모집 게시글 CRUD / 모집 신청, 취소 / 게시글 검색 필터</td>
    <td align="center">inmyblue0930@naver.com</td>
  </tr>
    <tr>
    <td align="center"><a href="https://github.com/hyeonjun4460"><b>신동영</b></a></td>
    <td align="center">member</td>
    <td align="center">로그인 및 회원가입/ 휴대폰 인증</td>
    <td align="center">shindy93@naver.com</td>
  </tr>
</table>
<br/>

## 🌸 More Info
[🌿 프로젝트 소개 문서]  
[💾 와이어프레임](https://www.figma.com/file/KHfXRCNHENbZ7PBS1DYT7O/%EC%9D%B4RUN%EC%A0%80RUN?node-id=0%3A1)  
[🔐 ErunJrun Front-End Repository](https://github.com/ErunJrun/ErunJrun_FE)  

