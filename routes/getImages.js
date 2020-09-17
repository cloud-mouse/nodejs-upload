var express = require('express');
var router = express.Router();
var fs = require('fs');
let path = require('path');
const URL = "http://localhost:3000" // 全局url
// const URL = "xx" // 线上服务器全局url

var image = require("imageinfo"); 

router.get('/api/fileList', function(req, res, next) {
  
  function readFileList(path, filesList) {
    var files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
      var stat = fs.statSync(path + itm);
      if (stat.isDirectory()) {
      //递归读取文件
        readFileList(path + itm + "/", filesList)
      } else {
        var obj = {};//定义一个对象存放文件的路径和名字
        obj.path = path;//路径
        obj.filename = itm//名字
        filesList.push(obj);
      }
    })
  }
  var getFiles = {
    getFileList: function (path) {
        var filesList = [];
        readFileList(path, filesList);
        return filesList;
    },
    getImageFiles: function (path) {
      var imageList = [];
      this.getFileList(path).forEach((item) => {
        // 如果只是图片服务器的话
        // var ms = image(fs.readFileSync(path+ item.filename));
        // ms.mimeType && (imageList.push(url +item.filename))

        // 如果文件夹下不只图片文件的话
        let obg = {}
        obg.filename =  item.filename
        obg.url =  URL + '/files/' +item.filename
        imageList.push(obg)
      });
      res.send({code:200,data: imageList, msg: '获取成功'});
      return imageList;
    }
  };
  getFiles.getImageFiles(path.join(__dirname, '../upload/'));
  // getFiles.getImageFiles("http://localhost:2000/upload/");

  // 如果只是单纯的读取文件
  //getFiles.getFileList("./public/images/");
});
    
module.exports = router;