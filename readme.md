# e-com_King_Stock_Api

### Author:
Linkedin: [@ekremyilmazturk](https://www.linkedin.com/in/ekrem-yilmazturk/)
<br>
<br>

<h3>About My Project</h3>
<p> 📌This project can be described as an admin panel intended for e-commerce use. It is built upon 8 different models. 📌As a seller, you can create an account, make purchases and sales from registered companies, brands, and products. You can also have real-time visibility into stock tracking. 📌JWT is used for encryption.  📌A permission system is established for editing/changing something about system. 📌Logging is implemented. 📌If you want to read the API documentation and check the structure, Swagger and Redoc documents are also available. To access them, you can follow the '/redoc' or '/swagger' routes.  </p>
<br>

<h3>How to install</h3>
If you want to clone the project to your local and test it, you must install first 📌"npm i express dotenv mongoose express-async-errors",  📌"npm i jsonwebtoken" and 📌"npm i morgan" 📌"npm i redoc-express"
Finally, in the project directory, you can run:  `nodemon index.js`
<br>
<br>

<h3>What is in this api project?</h3>
<ul style="font-size: 18px;">
  <li>JWT</li>
  <li>Logging</li>
  <li>Permissions</li>
  <li>Authentications MW</li>
  <li>Error Handler MW</li>
  <li>Finding, Sorting and Pagination MW</li>
  <li>Swagger & Redoc Docs</li>
</ul>
<br>
<br>

### Folder/File Structure:

```
    .env
    .gitignore
    index.js
    package.json
    readme.md
    src/
        config/
            dbConnection.js
            swagger.json
        controllers/
            auth.js
            brand.js
            category.js
            firm.js
            product.js
            purchase.js
            sale.js
            token.js
            user.js
        helpers/
            passwordEncrypt.js
            sendMail.js
        middlewares/
            authentication.js
            errorHandler.js
            findSearchSortPage.js
            logger.js
            permissions.js
            upload.js
        models/
            brand.js
            category.js
            firm.js
            product.js
            purchase.js
            sale.js
            token.js
            user.js
        routes/
            auth.js
            brand.js
            category.js
            document.js
            firm.js
            index.js
            product.js
            purchase.js
            sale.js
            token.js
            user.js
```