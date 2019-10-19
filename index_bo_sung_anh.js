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

      ctx.fillText(contract_no, 1300, 198);
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

      var id_sign_index = Number(id_no.charAt(6))
      id_sign_index = id_sign_index == 'NaN' ? 0 : id_sign_index
      var img_sub_sign = await loadImageWithWait(`./template/${id_sign_index}.png`)

      ctx.drawImage(img_sub_sign, 180, 2108);
      // test result
      //canvas.createJPEGStream().pipe(fs.createWriteStream(path.join(__dirname, 'image-with-background-result.jpg'))) // tạo ảnh kiểu jpg
      resolve(canvas.toDataURL('image/jpeg'))
    })
}

//////////////////////////////////////////////////////
// MAIN HERE
async function main() {
  const index = process.argv[2] // index
  console.log('begin bo sung anh, index=' + index);
  if (!index) return

  let conn

  try {
    // ket noi oracle
    conn = await oracledb.getConnection({
      user: "DLUQ_OWNER",
      password: "dluq",
      connectString: "(DESCRIPTION=(FAILOVER=on)(ADDRESS_LIST=(LOAD_BALANCE=ON)(ADDRESS=(PROTOCOL=TCP)(HOST=10.151.59.92)(PORT=1521))(ADDRESS=(PROTOCOL=TCP)(HOST=10.151.59.91)(PORT=1521)))(CONNECT_DATA=(SERVICE_NAME=BUSINESS)))"
    })

    var img_phieu = null
    var img_anh = null
    var img_arr = null
    var api_result = null
    var img_results = null

    let sql = `SELECT   *
            FROM   tmp_chay
          WHERE
          --AND isdn like '%${index}'
           api_time IS NULL
          AND rownum <= 500`
    let isdn_results = await conn.execute(sql
        , {}
        , {outFormat: oracledb.OBJECT}
    );

    for(var i = 0; i < isdn_results.rows.length; ++i) {
          img_results = await conn.execute(
              `SELECT   DECODE (TYPE,0,'cmnd.jpg',1,'chan_dung.jpg',2,'hop_dong.jpg') img_name, ima_link, TYPE
                 FROM   sontv.ds_link_anh@cskh3
                WHERE   isdn = :isdn
                        AND TYPE IN (0,1,2)`
            , {isdn: isdn_results.rows[i].ISDN_IMG}
            , {outFormat: oracledb.OBJECT}
          )

          // console.log(img_results.rows);

          // gen phieu
          img_phieu = await gen_image(canvas, img_hd,
            isdn_results.rows[i].BIRTHDAY,
            isdn_results.rows[i].CONTRACT_NO,
            isdn_results.rows[i].SUB_NAME,
            isdn_results.rows[i].ISDN,
            isdn_results.rows[i].SEX,
            isdn_results.rows[i].ID_NO,
            isdn_results.rows[i].ID_ISSUE_PLACE_NAME,
            isdn_results.rows[i].ID_ISSUE_DATE,
            isdn_results.rows[i].ADDRESS,
            isdn_results.rows[i].TEL ? isdn_results.rows[i].TEL : '',
            '')

          img_phieu = img_phieu.replace('data:image/jpeg;base64,','')
          img_phieu = img_phieu.replace(/;/g,'@@@').replace(/=/g,'$$$')

          // 2. loop images
          img_arr = `"arrImages":[["hop_dong.jpg","${img_phieu}","2"],`
          // img_arr = `"arrImages":[` // ko sinh phieu vi cac so nay co anh hop dong kem theo roi

          for(var j = 0; j < img_results.rows.length; ++j)
          {
            img_anh = await image2base64(img_results.rows[j].IMA_LINK)
            img_anh = img_anh.replace(/;/g,'@@@').replace(/=/g,'$$$')
            img_arr = `${img_arr}["${img_results.rows[j].IMG_NAME}","${img_anh}","${img_results.rows[j].TYPE}"],`
          }

          img_arr = img_arr.substring(0, img_arr.length - 1)
          img_arr = `${img_arr}]`

          //api_result = 'test'
          api_result = await call_api.call_api_tdtt(conn,
            isdn_results.rows[i].SUB_ID,
            isdn_results.rows[i].ISDN,
            isdn_results.rows[i].SERIAL,
            isdn_results.rows[i].IMSI,
            isdn_results.rows[i].SHOP_CODE,
            isdn_results.rows[i].CUST_TYPE,
            isdn_results.rows[i].SUB_TYPE,
            isdn_results.rows[i].SUB_NAME,
            isdn_results.rows[i].NATIONALITY,
            isdn_results.rows[i].BIRTHDAY,
            isdn_results.rows[i].SEX,
            isdn_results.rows[i].ID_NO,
            isdn_results.rows[i].ID_ISSUE_DATE,
            isdn_results.rows[i].ID_ISSUE_PLACE,
            isdn_results.rows[i].PROVINCE,
            isdn_results.rows[i].DISTRICT,
            isdn_results.rows[i].PRECINCT,
            isdn_results.rows[i].STREET_BLOCK_NAME,
            isdn_results.rows[i].STREET_NAME,
            isdn_results.rows[i].HOME,
            isdn_results.rows[i].ADDRESS,
            isdn_results.rows[i].TEL,
            isdn_results.rows[i].EMPLOYEE,
            isdn_results.rows[i].APP_OBJECT,
            isdn_results.rows[i].CONTRACT_NO,
            img_arr)

            await conn.execute(`UPDATE tmp_chay SET api_time=sysdate, api_result=:api_result WHERE isdn = :isdn`
              , {api_result:api_result, isdn:isdn_results.rows[i].ISDN}
              , {autoCommit:true}
            )
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

main()