
var express = require('express');
var app = express();
var db_helper= require('./db_helper');
var port = 5010;
var bodyParser = require('body-parser');
var async = require("async");
var squel = require("squel");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.listen(port, function () {
    console.log('listening on port 5010');
});

//0.test start
app.get('/',function(req,res){
    res.send( squel.select().from("users").toString() );
});



//1
app.get('/fiveHotProducts',function(req,res){
	var query="SELECT TOP 5 * FROM Product ORDER BY orders DESC"
    db_helper.excecuteQuery(req.query,query).then(function (results) {

        res.json(results);

    }).catch(function(err){
        res.send('error');
    });
});

//2.login
app.post('/Login',function(req,res){
	var query="SELECT maneger FROM Users WHERE username=@username AND password=@password";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        if (results.length === 1) {
            if (results[0]['maneger'] === true)
                res.send("2");
            else
                res.send("1");
        }
        else res.send("-1");

}).catch(function(err){
        res.send('error');
    })});

//3.register
app.post('/Register',function(req,res){

    var query="INSERT INTO Users(username, password,FirstName,LastName," +
        "birthday,sex,email,Address,countryid,phone) VALUES (@username,@password,@FirstName,@LastName"+
        ",@birthday,@sex,@email,@Address,@countryid,@phone)";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        var queryCat="INSERT INTO userscategory(username, categoryid) VALUES (@username,@categoryid)"
        for(var i=0; i<req.body.categoryid.length;i++){
            var uc={username:req.body.username,categoryid:req.body.categoryid[i]}
            db_helper.excecuteQuery(uc,queryCat).catch(function(err){
                var reverseQuery="DELETE FROM Users WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                reverseQuery="DELETE FROM userscategory WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                res.send('error in add category');
            })
        }
        console.log(req.body.question)

        var queryQA="INSERT INTO usersquestion(username,question,answer) VALUES (@username,@question,@answer)"
        for(var i=0; i<req.body.question.length;i++){
            var uc={username:req.body.username,question:req.body.question[i],answer:req.body.answer[i]}
            db_helper.excecuteQuery(uc,queryQA).catch(function(err){
                var reverseQuery="DELETE FROM Users WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                reverseQuery="DELETE FROM userscategory WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                reverseQuery="DELETE FROM usersquestion WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                res.send('error in add questions');
            })
        }
        res.send('success');
    }).catch(function(err){
        console.log(err)
        res.send('error in add user');
    });
});

//4. Restore Password
app.post('/Users/RestorePassword',function(req,res){
    var query="UPDATE Users SET password = @password WHERE username = @username";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        res.send(true);
    }).catch(function(err){
        res.send(false);
    })});


//5.GetPorenal Question
app.get('/PersonalQuestion',function(req,res){
    var query="SELECT question FROM usersquestion WHERE username=@username";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        var ans=[];
        for(var i=0;i<results.length;i++){
            var item=results[i];
            ans.push(item[0].value);
        }
        res.json(ans);

    }).catch(function(err){
        res.send('error');
    })});

//6.CheckAnswers
app.post('/CheckAnswer',function(req,res){
    var query="SELECT question FROM usersquestion WHERE username=@username AND question=@question AND answer=@answer";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        if (results.length === 1) {
            res.send(true);
        }
        else res.send(false);

    }).catch(function(err){
        res.send(false);
    })});

//7.Get Categories
app.get('/Categories',function(req,res){
    var query="SELECT * FROM categories";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        res.send(results);
    }).catch(function(err){
        res.send('error');
    })});

//10.Get new Products
app.get('/NewestProd/:many',function(req,res){
    var query="SELECT TOP "+req.params.many+" * FROM Product ORDER BY addDate DESC"
    db_helper.excecuteQuery(req.query,query).then(function (results) {

        res.json(results);

    }).catch(function(err){
        res.send('error');
    });
});


//11.Get product by Categories
app.get('/ProductByCategory',function(req,res){
    var query="SELECT productID FROM productcategorys WHERE categoryID=@categoryID";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        var ans=[];
        query="SELECT * FROM product WHERE";
        for(var i=0;i<results.length;i++){
            if(i==0)
                query+=" Id="+results[i][0].value;
            else
                query+=" OR Id="+results[i][0].value;

        }
        db_helper.excecuteQuery(null,query,function (results2){
            for(var j=0;j<results2.length;j++){
                ans.push(results2[j]);
            }
            res.json(ans);

        });

    }).catch(function(err){
        res.send('error');
    })});

//13. recomended products
app.post('/Users/RecomendedProducts',function(req,res){
    var query="SELECT * FROM product JOIN userscategory ON userscategory.CategoryName=product.Category WHERE UserName=@UserName";
    db_helper.excecuteQuery(req.body,query)
        .then(function(results){
            res.send(results);
        })
        .catch(function(err){
            res.send('error retrieving your suggested movies');
        });

});

//14. search by name
app.get('/SearchProductByName',function(req,res){
    var query="SELECT * FROM product WHERE name LIKE @name"
    db_helper.excecuteQuery(req.query,query).then(function (results) {

        res.json(results);

    }).catch(function(err){
        res.send('error');
    });
});

//15.Get product by Categories
app.get('/ProductByGenre',function(req,res){
    var query="SELECT * FROM product WHERE genreID=@genreID";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        var ans=[];
        for(var i=0;i<results.length;i++){
            ans.push(results[i]);

        }
        res.json(ans);


    }).catch(function(err){
        res.send('error');
    })});

//16.Get Categories
app.get('/Genres',function(req,res){
    var query="SELECT * FROM Genres";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        var ans=[];
        for(var i=0;i<results.length;i++){
            var item={
                id: results[i][0].value,
                name: results[i][1].value
            }
            ans.push(item);
        }
        res.json(ans);
    }).catch(function(err){
        res.send('error');
    })});

//17.Get product
app.post('/Users/ProductProperty',function(req,res){
    var query="SELECT * FROM product WHERE id=@id";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        res.json(results[0]);
    }).catch(function(err){
        res.send('error');
    })});

//18.Add to the Cart
app.post('/Users/AddToCart',function (req,res) {
    var query="SELECT amount FROM carts WHERE username=@username AND productid=@productid";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        if(results.length===1){
            var newanount=parseInt(req.body.amount)+parseInt(results[0]['amount']);
            var updateQuery="UPDATE carts SET amount = "+newanount+
                " WHERE username=@username AND productid=@productid";
            db_helper.excecuteQuery(req.body,updateQuery).then(function (results2) {
                res.send('success');
            }).catch(function(err){
                res.send('error in update');
            })
        }
        else{
            var insertQuery="INSERT INTO carts(username,productid,amount) VALUES (@username,@productid,@amount)"
            db_helper.excecuteQuery(req.body,insertQuery).then(function (results2) {
                res.send('success');
            }).catch(function(err){
                res.send('error in add');
            })
        }
    }).catch(function(err){
        res.send('error in serch for product in cart');
    })

});

//19. get Cart
app.post('/Users/GetCart',function(req,res){
    var query="SELECT * FROM carts WHERE username=@username";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        res.send(results);
    }).catch(function(err){
        res.send('error');
    })});

//20. remove from cart
app.post('/Users/RemoveFromCart',function (req,res) {
    var query="SELECT amount FROM carts WHERE username=@username AND productid=@productid";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        if(results.length===1){
            var quentyty=parseInt(results[0]['amount'])-parseInt(req.body.amount);
            if(quentyty>0){
                var updateQuery="UPDATE carts SET amount = "+quentyty+
                    " WHERE username=@username AND productid=@productid";
                db_helper.excecuteQuery(req.body,updateQuery).then(function (results) {
                    res.send("success");
                }).catch(function(err){
                    res.send('error');
                })
            }else if(quentyty===0){
                var removeQuery="DELETE FROM carts WHERE username=@username AND productid=@productid"
                db_helper.excecuteQuery(req.body,removeQuery).then(function (results) {
                    res.send("success");
                }).catch(function(err){
                    res.send('error');
                })
            }else
                res.send("cant remove this match");
        }
        else{

            res.send('no such product in the cart');
        }
    }).catch(function(err){
        res.send('error in search for product in cart');
    })

});

//21. get hestory of percussing
app.post('/Users/historyOfPercussing',function(req,res){
    var query="SELECT * FROM orders WHERE username=@username";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        res.send(results);
    }).catch(function(err){
        res.send('error');
    })});

//22.

var moment = require('moment');

//22. add order
app.post('/Users/percussingProduct',function(req,res){
    buyOne(req.body,res)
});

function buyOne(list,res) {
    var qAmount="SELECT * FROM product WHERE productid=@productid";
    db_helper.excecuteQuery(list,qAmount).then(function (lresults) {

        var amountAfter=parseInt(lresults[0]['amountInTheInventory'])-parseInt(list.amount);
        if(amountAfter<0)res.send('dont have enouth');
        else{
            var query
            if(list.deliverTime)
                query="INSERT INTO orders(username, productid,amount,date,deliverTime" +
                ") VALUES (@username,@productid,@amount,'"+moment().format('YYYY-MM-DD hh:mm:ss')+"',@deliverTime)";
            else
                query="INSERT INTO orders(username, productid,amount,date" +
                    ") VALUES (@username,@productid,@amount,'"+moment().format('YYYY-MM-DD hh:mm:ss')+"')";
            db_helper.excecuteQuery(list,query).then(function (results) {
                var query="SELECT * FROM product WHERE productid=@productid";
                var quentyty=parseInt(lresults[0]['orders'])+parseInt(list.amount);
                var updateQuery="UPDATE product SET orders = "+quentyty+
                    " WHERE productid=@productid";
                db_helper.excecuteQuery(list,updateQuery).then(function (results) {
                    var updateQuery="UPDATE product SET amountintheinventory="+amountAfter+
                        " WHERE productid=@productid";
                    db_helper.excecuteQuery(list,updateQuery).then(function (results) {

                        res.send("success");
                    }).catch(function(err){
                        res.send('error');
                    })
                }).catch(function(err){
                    res.send('error');
                })
            }).catch(function(err){
                res.send('error');
            });
        }


    }).catch(function(err){
        res.send('error');
    })
}

//27. buy cart
app.post('/Users/PrucussCart',function (req,res) {
    var query="SELECT * FROM carts WHERE username=@username"
    console.log(query);
    db_helper.excecuteQuery(req.body,query).then(function (results) {

        for(var i=0;i<results.length;i++){
            buyOne(results[i],req);
        }
        var removeQuery="DELETE FROM carts WHERE username=@username"
        db_helper.excecuteQuery(req.body,removeQuery).then(function (results) {
            res.send("success");
        }).catch(function(err){
            res.send('error');
        })

    }).catch(function(err){
        res.send('error');
    })

});


//28+29. get users
app.post('/Admins/PrucussCart',function (req,res) {
    var query="SELECT * FROM users";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        res.send(results);
    }).catch(function(err){
        res.send('error');
    })});

//30. add product
app.post('/Admins/AddProduct',function (req,res) {
    var query="INSERT INTO Users(productid, name,price,artistid," +
        "adddate,genreid,discription,amountInTheInventory) VALUES (@productid,@name,@price,@artistid"+
        ",'"+moment().format('YYYY-MM-DD hh:mm:ss')+"',@genreid,@discription,@amountInTheInventory)";
    db_helper.excecuteQuery(req.body,query).then(function (results) {

    }).catch(function(err){
        res.send('error');
    })
});

//31. delete product
app.post('/Admins/DeleteProduct',function (req,res) {
    var query="DELETE FROM Product WHERE productid=@productid"
    db_helper.excecuteQuery(req.body,query).then(function (results) {

    }).catch(function(err){
        res.send('error');
    })
});

//32. add user
app.post('/Admins/addUser',function(req,res){

    var query="INSERT INTO Users(username, password,FirstName,LastName," +
        "birthday,sex,email,Address,countryid,maneger,phone) VALUES (@username,@password,@FirstName,@LastName"+
        ",@birthday,@sex,@email,@Address,@countryid,@maneger,@phone)";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        var queryCat="INSERT INTO userscategory(username, categoryid) VALUES (@username,@categoryid)"
        for(var i=0; i<req.body.categoryid.length;i++){
            var uc={username:req.body.username,categoryid:req.body.categoryid[i]}
            db_helper.excecuteQuery(uc,queryCat).catch(function(err){
                var reverseQuery="DELETE FROM Users WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                reverseQuery="DELETE FROM userscategory WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                res.send('error in add category');
            })
        }
        console.log(req.body.question)

        var queryQA="INSERT INTO usersquestion(username,question,answer) VALUES (@username,@question,@answer)"
        for(var i=0; i<req.body.question.length;i++){
            var uc={username:req.body.username,question:req.body.question[i],answer:req.body.answer[i]}
            db_helper.excecuteQuery(uc,queryQA).catch(function(err){
                var reverseQuery="DELETE FROM Users WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                reverseQuery="DELETE FROM userscategory WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                reverseQuery="DELETE FROM usersquestion WHERE username="+req.body.username
                db_helper.excecuteQuery(null,reverseQuery);
                res.send('error in add questions');
            })
        }
        res.send('success');
    }).catch(function(err){
        console.log(err)
        res.send('error in add user');
    });
});

//33. delete user
app.post('/Admins/DeleteProduct',function (req,res) {
    var query="DELETE FROM users WHERE userid=@useridtodelete"
    db_helper.excecuteQuery(req.body,query).then(function (results) {

    }).catch(function(err){
        res.send('error');
    })
});

//34. get products
app.post('/Admins/getProducts',function(req,res){
    var query="SELECT * FROM product";
    db_helper.excecuteQuery(req.query,query).then(function (results) {
        res.send(results);
    }).catch(function(err){
        res.send('error');
    })});

//35. ADD TO THE INVENTORY

app.post('/Admins/AddtoInventory',function(req,res){
    var qAmount="SELECT * FROM product WHERE productid=@productid";
    db_helper.excecuteQuery(req.body,qAmount).then(function (lresults) {

        var amountAfter = parseInt(lresults[0]['amountInTheInventory']) + parseInt(req.body.amount);
        var updateQuery="UPDATE product SET amountintheinventory="+amountAfter+
            " WHERE productid=@productid";
        db_helper.excecuteQuery(list,updateQuery).then(function (results) {

            res.send("success");
        }).catch(function(err){
            res.send('error');
        })
    })
});


app.use('/Users',function(req,res,next){
    var query="SELECT maneger FROM Users WHERE username=@username AND password=@password";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        if (results.length === 1) {
            if (results[0]['maneger'] === true)
                next();
            else
                next();
        }
        else res.send("please Login");
})});

app.use('/Admins',function (req,res,next) {
    var query="SELECT maneger FROM Users WHERE username=@username AND password=@password";
    db_helper.excecuteQuery(req.body,query).then(function (results) {
        if (results.length === 1) {
            if (results[0]['maneger'] === true)
                next();
            else
                res.send("please Login as admin");
        }
        else res.send("please Login");
})});
