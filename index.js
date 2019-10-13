var fs = require('fs')
var path = require('path')
var Canvas = require('canvas')
var oracledb = require('oracledb')
const image2base64 = require('image-to-base64')
const xlsxtojson1st = require("xlsx-to-json-lc")
const call_api = require('./call_api')

function fontFile (name) {
  return path.join(__dirname, 'fonts/', name)
}

Canvas.registerFont(fontFile('times.ttf'), {family: 'Time-new-roman-utf8'})

var canvas = Canvas.createCanvas(1615, 2339) //kích thước của ảnh này
var Image = Canvas.Image;
var img_hd = new Image();
img_hd.src = './template/hd.jpg';

// var ctx = canvas.getContext('2d')
// ctx.clearRect(0, 0, canvas.width, canvas.height);
// ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

// ctx.fillStyle = 'gray'; // Màu của chữ
// ctx.textAlign = 'center'; // canh chỉ chữ ở giữa
// ctx.font = '24pt Time-new-roman-utf8' // font chữ
// ctx.fillText('Chữ được chèn vào ở đây nè',150, 100)    // vùng ghi chữ này

// canvas.createPNGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-no-background-result.png'))) // tạo ảnh kiểu png
// canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-with-background-result.jpg'))) // tạo ảnh kiểu jpg

// console.log('',canvas.toDataURL('image/jpeg'));// dạng base64 text lưu lại được

function loadImageWithWait(src) {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function gen_image(
  canvas, img_hd,
  birthday,
  contract_no,
  sub_name,
  isdn,
  sex,
  id_no,
  id_issue_place,
  id_issue_date,
  address,
  tel,
  sign_address) {
    return new Promise(async (resolve, reject) => {
      var ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img_hd, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black'; // Màu của chữ
      ctx.font = '22pt Time-new-roman-utf8' // font chữ

      var dd = birthday.split("/")[0];
      var mm = birthday.split("/")[1];
      var yyyy = birthday.split("/")[2];

      ctx.fillText(dd, 312, 623);
      ctx.fillText(mm, 381, 623);
      ctx.fillText(yyyy, 449, 623);

      ctx.fillText(contract_no, 1306, 198);
      ctx.fillText(sub_name, 531, 383);
      ctx.fillText(isdn, 1234, 383);

      if ("0" == sex) {
        ctx.fillText("X", 335, 424); // nam
      } else {
        ctx.fillText("X", 513, 424); // nu
      }

      ctx.fillText(id_no, 581, 585);
      ctx.fillText(id_issue_place, 1168, 585);
      ctx.fillText(id_issue_date, 906, 585);

      ctx.fillText("X", 747, 623);

      ctx.fillText(address, 445, 662);
      ctx.fillText(tel, 437, 702);

      var d = new Date()
      dd = d.getDate()
      mm = d.getMonth()+1
      yyyy = d.getFullYear()
      ctx.fillText(dd, 1125, 1993);
      ctx.fillText(mm, 1279, 1993);
      ctx.fillText(yyyy, 1415, 1993);

      ctx.fillText(sign_address, 890, 1993);
      ctx.fillText(sub_name, 234, 2275);

      var id_sign_index = Number(id_no.charAt(2))
      id_sign_index = id_sign_index == 'NaN' ? 0 : id_sign_index
      var img_sub_sign = await loadImageWithWait(`./template/${id_sign_index}.png`)

      ctx.drawImage(img_sub_sign, 180, 2108);
      // test result
      canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-with-background-result.jpg'))) // tạo ảnh kiểu jpg
      resolve(canvas.toDataURL('image/jpeg'))
    })
}

function read_excel(filePath) {
    //doc excel
    return new Promise((resolve, reject) => {
      xlsxtojson1st({
          input: filePath,
          output: null, //since we don't need output.json
          lowerCaseHeaders:true
      }, (err, results) => {
        resolve(results)
      });
    })
}

//gen_image(canvas, img, '01/03/1999', '123', 'Trần Phương Nam', '0900666777', '1', '200576345', 'Quảng Ngãi', '02/02/2005', 'Tổ 49 Phường Hòa Liên, Liên Chiều, Đà Nẵng', '', 'Đà Nẵng')

//connect_oracle()

//////////////////////////////////////////////////////
// MAIN HERE
async function main() {
  console.log('main');
  // 1. read excel
  var filePath = path.join(__dirname, 'template/tkc.xls')
  var excel_content = await read_excel(filePath)
  // console.log(excel_content);

  let conn
  try {
    // ket noi oracle
    conn = await oracledb.getConnection({
      user: "DLUQ_OWNER",
      password: "dluq",
      connectString: "(DESCRIPTION=(FAILOVER=on)(ADDRESS_LIST=(LOAD_BALANCE=ON)(ADDRESS=(PROTOCOL=TCP)(HOST=10.151.59.92)(PORT=1521))(ADDRESS=(PROTOCOL=TCP)(HOST=10.151.59.91)(PORT=1521)))(CONNECT_DATA=(SERVICE_NAME=BUSINESS)))"
    })

    var img_phieu = null
    var img_cmnd1 = null, img_cmnd2 = null, img_chan_dung = null
    var img_arr = null

    // 2. loop excel row
    for(var i = 0; i < excel_content.length; ++i)
    {
      // console.log(el);
      // 3. gen image
      // gen phieu
      img_phieu = await gen_image(canvas, img_hd,
        excel_content[i].birthday,
        excel_content[i].contract_no,
        excel_content[i].sub_name,
        excel_content[i].isdn,
        excel_content[i].sex,
        excel_content[i].id_no,
        excel_content[i].id_issue_place_name,
        excel_content[i].id_issue_date,
        excel_content[i].address,
        excel_content[i].tel,
        '')

      img_phieu = img_phieu.replace('data:image/jpeg;base64,','')
      // console.log('gen_image');

      img_cmnd1 = await image2base64(excel_content[i].img_cmnd1)
      // console.log('cmnd1');
      img_cmnd2 = await image2base64(excel_content[i].img_cmnd2)
      // console.log('cmnd2');
      img_chan_dung = await image2base64(excel_content[i].img_chan_dung)
      // console.log('chan_dung');
      //'"arrImages":[["Capture.JPG","/9j/4AAQSkZJRgABAgAAAAH//Z","1"],["Screenshot_2019-08-10-14-47-23-76.jpg","/9j/4AAQSkZJRgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k$$$","2"]]
      img_arr = `"arrImages":[["cmnd1.JPG","${img_cmnd1}","0"],["cmnd2.JPG","${img_cmnd2}","0"],["chan_dung.JPG","${img_chan_dung}","1"],["hop_dong.jpg","${img_phieu}","2"]]`
      // console.log('ghep image');

      // console.log('begin call api');
      // 4. call oracle
      await call_api.call_api_tdtt(conn,
          excel_content[i].sub_id,
          excel_content[i].isdn,
          excel_content[i].serial,
          excel_content[i].imsi,
          excel_content[i].shop_code,
          excel_content[i].cust_type,
          excel_content[i].sub_type,
          excel_content[i].sub_name,
          excel_content[i].nationality,
          excel_content[i].birthday,
          excel_content[i].sex,
          excel_content[i].id_no,
          excel_content[i].id_issue_date,
          excel_content[i].id_issue_place,
          excel_content[i].province,
          excel_content[i].district,
          excel_content[i].precinct,
          excel_content[i].street_block_name,
          excel_content[i].street_name,
          excel_content[i].home,
          excel_content[i].address,
          excel_content[i].tel,
          excel_content[i].employee,
          excel_content[i].app_object,
          excel_content[i].contract_no,
          img_arr)
    }

  } catch (err) {
      console.error(err);
  } finally { // 5. close conn
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }

}

// main()