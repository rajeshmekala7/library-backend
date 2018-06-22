var config = require('./../config/config');
var _ = require('underscore');
var mongoose = require('mongoose');
var bcrypt=require('bcrypt');
var jwt = require('jsonwebtoken');

var buyCollection = require('./../models/schema').buyCollection;
var Formula = function () {
};

Formula.prototype.registration=function(body,callback){
    var retObj={}
    if(!body.name ||!_.isString(body.name))
    {
       retObj.message="name should contain only alphabets"
       callback(retObj)
    }else if(!_.isString(body.email)){
          retObj.message="enter correct email"
          callback(retObj)
    }else if (!body.phone || !(/[0-9]{10}/.test(body.phone))) {
        console.log(typeof body.phone);
        retObj.message = 'Invalid phoneNumber';
        callback(retObj);
    }else if(!body.password || body.password.length<8)
    {
       retObj.message="password should be minimum of 8 characters"
       callback(retObj)
    }else if((body.password)!== (body.confirmPassword))
     {   retObj.message="passwords doesnt match"
         callback(retObj)
     }
     else{
         var hash=bcrypt.hashSync(body.password,10);
         console.log("hashing done",hash)
         buyCollection.findOne({email:body.email},function(err,data)
         {
             if(err){
                 retObj.message="please try again"
                 callback(retObj)
             }
             else if(data)
             {
                 retObj.message="user already exists"
                 callback(retObj)
             }
             else {
                var user = new buyCollection({
                    name: body.name, email: body.email, phone: body.phone,
                    password: hash
                });
                user.save(function (err, data) {
                    if (err) {
                        retObj.status = false;
                        retObj.message = "plese try again";
                        callback(retObj);
                    } else {
                        retObj.status = true;
                        retObj.message = "registration successfull";
                        retObj.data = data;
                        callback(retObj);
                    }   
               })
            }
         })
     }

}

// var payload = {
//     phone: buyCollection.phone
// };

// var token = jwt.sign(payload,config.jwt.secret,function(err,result) {
//     if (err) {
//         console.log('Error:', err);
//     } else {
//         console.log(result);
//     }
// });

Formula.prototype.login = function (body, callback) {
    var retObj={}
    if(!body.email)
    {
        console.log("please enter you email")
        retObj.message="enter email"
        callback(retObj)
    }
    else if(!body.password)
    {
        console.log("please enter you password")
        retObj.message="enter password"
        callback(retObj)
    }
    else{
        buyCollection.findOne({email:body.email},function(err,doc)
       {
         if(err){
             console.log("please try again")
             retObj.message="please try again"
             callback(retObj)
          }
          else if(doc)
          {
              console.log("doc",doc);
              if(bcrypt.compareSync(body.password,doc.password))
              {
                 jwt.sign({email:body.email,id: doc._id},config.jwt.secret, function (err, token){
                    if(err){
                        console.log("please try again")
                        retObj.message="please try again"
                        callback(retObj)
                    }
                    else{
                     retObj.token=token
                     retObj.message="login successful"
                     console.log("login successful")
                     callback(retObj)
                    }
                 })
              }
              else{
                  console.log("wrong password")
                  retObj.message="wrong password"
                  callback(retObj)
              }
            }
          else{
              console.log("user not in database")
              retObj.message="user not in database"
              callback(retObj)
          }
       }
    )}
}

Formula.prototype.update=function(jwt,body,callback){
    var retObj={}
    
        buyCollection.findOneAndUpdate({_id:jwt.id}, body, function(error, result){
        console.log("enter your email", body);                    
            if(error){
                console.log('err',error);
                retObj.status = false;
                retObj.message = "error";
                callback(retObj);
            }
            else if(body.email){
                console.log('email id cannot be updated')
                retObj.message="email ud cannot be updated"
               callback(retObj)
            }
            // else if(body.branch){
            //    console.log('you cannot change your branch')
            //    retObj.message="you cannot change your branch"
            //    callback(retObj)
            // }
            else if(!body.name || !_.isString(body.name)){
              console.log('enter your name')
              retObj.message="enter your name"
              callback(retObj)
            }
            else if(result){
                console.log('update successful');
                retObj.status = true;
                retObj.message = "update successful";
                callback(retObj);
            }
            else{
                console.log('else')
                retObj.message="entered wrong email"
                callback(retObj)
            }
        })


        // console.log("enter your email", body);        
        // buyCollection.findOne({email:body.email}, function(err,data)
        // {
        //     console.log("your in update")
        //      if(err){
        //          console.log("error has occured")
        //          retObj.message="error has occured"
        //          callback(retObj)
        //      }
        //      else if(data){
        //        console.log("your data has matched", data.email);
        //          buyCollection.update({email:data.email},
        //         //    {
        //         //        $set:{
        //         //            phone:body.phone
        //         //        }, 
            
        //         //     }
        //     body,)           
        //          retObj.message="your data has been updated"
        //         callback(retObj)
        //          }
        //      else{
        //          console.log("user doesnt exists")
        //          retObj.message="user doesnt exists"
        //          callback(retObj)
        //      }
        // })

    }



Formula.prototype.read=function(jwt,callback){
    var retObj={}
    buyCollection.findOne({_id: jwt.id}, function(error, data){
        if(error){
            console.log('err',error);
            retObj.status = false;
            retObj.message = "error";
            callback(retObj);
        }else if(data){
            console.log('else in read');
            retObj.status = true;
            retObj.message = "fetch successful";
            retObj.data = data;
            callback(retObj);
        }
        else{
            console.log('fetch not succesfull')
            retObj.message="fetch not succesfull"
            callback(retObj)
        }
    })
}

Formula.prototype.delete=function(body,callback){
    var retObj={}
    buyCollection.findOneAndRemove({email:body.email}, function(error, data){
        console.log('entered into delete')
        if(error){
            console.log('err',error);
            retObj.status = false;
            retObj.message = "error";
            callback(retObj);
        }else if(data){
           console.log('your id has been deleted')
           retObj.message="your id has been deleted"
            callback(retObj)
        }
        else{
            console.log('enetered email is not in database')
            retObj.messgae="entered email is not in database"
            callback(retObj)
        }
    })
}
Formula.prototype.changePassword=function(jwt,body,callback){
    var retObj={}
    buyCollection.findOne({_id:jwt.id},function(err,data){
        console.log('your in change password')
        if(err){
            console.log('error has occured')
            retObj.message="error has occured"
            callback(retObj)
        }
        else if(data){
            if(bcrypt.compareSync(body.password,data.password))
            {
                console.log('password sync is occuring')
                var hash=bcrypt.hashSync(body.newPassword, 10);
                console.log('hash',hash)
                buyCollection.findOneAndUpdate({_id:jwt.id},{
                    $set:{
                        password:hash
                    }
                },function(err,data){
                   console.log('your password has been updated')
                    retObj.message="your password has been updated"
                    callback(retObj)
                })
            }
            else{
                console.log('your current password is wrong ')
                retObj.message="your current password is wrong"
                callback(retObj)
            }
        }
        else{
            retObj.message="user doesnt exists"
            callback(retObj)
        }
    })
}
Formula.prototype.bookid=function(jwt,body,callback){
    var retObj={}
    console.log('your in book id')
    if(!body.email){
       retObj.message="enter email"
       callback(retObj)
    }
    else if(!body.book1 && !body.book2 && !body.book3){
       retObj.message="no book value entered"
       callback(retObj)
    }
    else{
        buyCollection.findOneAndUpdate({_id:jwt.id},body,function(err,data)
         {
             console.log('your here')
             if(err)
             {
                 retObj.message="error has occured"
                 callback(retObj)
             }
             else if(data){
                 console.log('books are updated')
                 retObj.message="books are updated"                   
                 retObj.data=body
                 callback(retObj)
            }
           else{
                retObj.message="user not found"
                callback(retObj)
           }
         })

    }
}
Formula.prototype.updatebookid=function(body,callback){
    var retObj={};
    if(body.book1)
    { $filter ={ $unset:{
        book1:{$exists:true}
     }}
    }
    if(!body.email){
        console.log('enter your email')
        retObj.message='enter your email'
        callback(retObj)
    }
    
    else{
        buyCollection.findOneAndUpdate({email:body.email},$filter,function(err,data){
            if(err){
              console.log('error')
              retObj.message="error"
              callback(retObj)
            }
            else if(data){
                 console.log('your data has been updated')
                 retObj.message="your data has been updated"
                 callback(retObj)
            }   
            else{
                console.log('user not found ')
                retObj.message="user not found"
                callback(retObj)
            }
             // else if(data)
            // {
            //     console.log('your inside updating bookid')
            //     buyCollection.update({email:body.email},{
            //         $unset:{
            //               book1:""
            //         },function(err,data){
            //             if(err){
            //                 console.log('error')
            //                 retObj.message="error"
            //                 callback(retObj)
            //             }
            //             else if(data){
            //                 cosnole.log('data has been updated')
            //                 retObj.message='data has been updated'
            //                 callback(retObj)
            //             }
            //             else{
            //                 console.log('user is not present')
            //                 retObj.message="user is not present"
            //                 callback(retObj)
            //             }
            //         }
            //     })
            // }
            // else{
            //     console.log('user not found')
            //     retObj.message='user not found'
            //     callback(retObj)
            // }
        })
        }
 }
//  Formula.prototype.authenicate=function(body,callback){
//      buyCollection.findOne({email:body.email},function(err,data){
//          if(err){
//              console.log('error')
//              retObj.message='error has occured'
//              callback(retObj)
//          }
//          else if(data){

//          }
//      })
//  }
module.exports = new Formula();