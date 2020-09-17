var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
let fs = require('fs'); 
let path = require('path');
const serveIndex = require('serve-index'); 
var getList = require('./routes/getImages') // 获取目录下图片资源列表

const URL = "http://localhost:3000" // 全局url
// const URL = "xxx" // 线上全局url

var app = express();
app.use(bodyParser.json()); // 使用json

app.use(getList);

// 静态目录
app.use('/files', serveIndex(path.join(__dirname,'upload'), {'icons': true}));
app.use('/files', express.static(path.join(__dirname,'upload')));

var Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./upload");
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});
console.log(path.join(__dirname, 'upload'));
var upload = multer({ storage: Storage }).array("imgUploader", 3); //Field name and max count
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/api/upload", function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      return res.send({msg: "出错了!"+err, code: 400});
    }
    let oldname = req.files[0].path //获取path: 'public\\upload\\0f625978d5d1a783b12e149718f8b634',
    let newname = req.files[0].path + path.parse(req.files[0].originalname).ext //.jpg
    fs.renameSync(oldname, newname)//将老的文件名改成新的有后缀的文件 #同步写法
    res.send({code:200,url: URL+'/files/'+req.files[0].filename+path.parse(req.files[0].originalname).ext,msg:'上传成功'});//返回给浏览器一些信息 一个磁盘地址
  });
});

app.post("/api/deletefile", (req, res)=>{
  
  var filePath = path.join(__dirname, 'upload/') + req.body.file; 
  try {
    // 判断文件是否存在
    if(fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.send({code: 200, msg:'删除成功'})
    }else {
      res.send({code: 404, msg:'文件不存在'})
    }
  } catch (error) {
    res.send({code: 400, error: error})
  }
})

app.listen(3000, function (a) {
  console.log("监听端口号 3000,"+URL);
});