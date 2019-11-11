module.exports.initDB =  function (callback){
    const sqlite3 = require('sqlite3').verbose();

    let db = new sqlite3.Database('./private/cMail.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error(err.message);
            return
        }
        console.log('Connected to the chinook database.');
        createTable(db)
    });
    
    function createTable(db){
        db.run("CREATE TABLE IF NOT EXISTS payments ("+
        "message_id TEXT PRIMARY KEY,"+
        "local_email TEXT NOT NULL,"+
        "remote_email TEXT NOT NULL,"+
        "subject TEXT NOT NULL,"+
        "thread_id TEXT NOT NULL,"+
        "time_generated TEXT NOT NULL,"+
        'time_paid TEXT DEFAULT "",'+
        'pay_req TEXT DEFAULT "",'+
        'pay_addr TEXT DEFAULT "",'+
        'tx_id TEXT DEFAULT "",'+
        'pre_image TEXT DEFAULT "",'+
        'amount INTEGER DEFAULT ""'+
        ") WITHOUT ROWID;",err => {
            console.log(err)
            if(!err && callback){
                callback(db)
            }
        })
    }
}
module.exports.addMail = function(lightning,db,to,from,subject,messageId,threadId){
    console.log("LN")
    console.log(lightning)
    console.log("adding maill......")
    db.all(' SELECT * FROM payments WHERE message_id = "'+messageId+'";',[],(err,res) => {
        if(err){
            console.log("exist error: " +err)
        } else {
            console.log(res)
            if(res.length == 0){
                
                var timeNow = Date.now().toString()
                db.run('INSERT INTO payments '+
                '(message_id,local_email,remote_email,subject,thread_id,time_generated) '+
                'VALUES ("'+messageId+'","'+to+'","'+from+'","'+subject+'","'+threadId+'","'+timeNow+'");', err =>{
                    if(err){
                        console.log("insert error: "+err)
                    }
                })
            }else{
                console.log(res)
            }
        }
    })
}