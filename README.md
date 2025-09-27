# Client API
In this api, we will create login,sign up for client that will use service of AaaS and we will also manage user through this service that will use client app .Client 
also manage and create access point that will use for client to use  auth service.

---
## features
- genrate and manage end-point
- manage user account
- disable and enable accounts
- use auth service
- track logout through backend with blacklist access tokens

---

##  Tech Stack

| backend  | expressjs,nodejs,prisma,prisma-client |
| :------- | :------------------------------------ |
| database | postgresql                            |
| security | bcrypt,express-validater,             |
| testing  | jest and supertest                    |

---

## Setup Instructions
###  Prerequisites
- node.js
- postgresql uri 

###  Environment Variables (.env)
```env
PORT=8000
DATABASE_URL=postgresql_url
JWT_CLIENT_SECRET=secret
```
### Installation
```sh
#clone repo
git clone 
cd 

# Install dependencies
npm install

# setup prisma
npx prisma generate

#create client for prisma
npx prisma migrate dev --name init
# start app
npm start
```

Visit: [http://localhost:8000](http://localhost:8000)

---

## Project Structure

```
├── app.js
├── errors/
├── middlewares/
├── prisma/
├── tests/
├── routes/
├── controllers/
├── utils/
├──server.js
├──docker-compose.yml
├── .env
└── README.md
```

---
## database Structure
```psql
=============DATABASE===========

==========client================
id            Int
first_name    String
last_name     String
email         String
mobile_No     String
app           String
password      String
=======Token blacklist=========
id            Int
token         String
```

---

## Contributing

1. Fork the repo  
2. Create a feature branch  
3. Commit your changes  
4. Submit a PR  

---

## 👨‍💻 Author

- Amit Kumar Pancholi  
- [GitHub](https://github.com/Amit-Pancholi)  
- Email: amitjipancholi@gmail.com  

---

## 🧾 License

This project is licensed under the [MIT License](LICENSE).