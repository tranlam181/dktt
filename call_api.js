var oracledb = require('oracledb')

var call_api_tdtt = async function (conn,
        sub_id,
        isdn,
        str_serial,
        str_imsi,
        str_shop_code,
        str_cust_type,
        str_sub_type,
        str_sub_name,
        str_nationality,
        str_birthday,
        str_sex,
        str_id_no,
        str_id_issue_date,
        str_id_issue_place,
        str_province,
        str_district,
        str_precinct,
        str_street_block_name,
        str_street_name,
        str_home,
        str_address,
        str_tel,
        str_employee,
        str_app_object,
        str_contract_no,
        l_image
    ) {
      let result;
      try {
        result = await conn.execute(
            `BEGIN
                api_tdtt_chay(:sub_id,
                :p_isdn,
                :str_serial,
                :str_imsi,
                :str_shop_code,
                :str_reg_type,
                :str_cust_type,
                :str_sub_type,
                :str_sub_name,
                :str_nationality,
                :str_birthday,
                :str_sex,
                :str_bar_expire_date,
                :str_id_no,
                :str_id_issue_date,
                :str_id_issue_place,
                :str_expire_date,
                :str_passpost,
                :str_passpost_issue_date,
                :str_passpost_issue_place,
                :bl_secret,
                :str_tin,
                :str_province,
                :str_district,
                :str_precinct,
                :str_street_block_name,
                :str_street_name,
                :str_home,
                :str_address,
                :str_tel,
                :str_email,
                :str_password,
                :str_contact_name,
                :str_contact_address,
                :str_reg_business,
                :str_job,
                :str_employee,
                :str_app_object,
                :str_founded_perm_no,
                :str_founded_perm_date,
                :str_visa,
                :str_contract_no,
                :str_user_sub_name,
                :str_user_birthday,
                :str_user_id_or_pp_no,
                :str_user_id_or_pp_issue_place,
                :str_user_id_or_pp_issue_date,
                :str_user_option,
                :l_image,
                :p_soap_result,
                :p_trang_thai,
                :p_t_api_end,
                :p_api_time
                );
            END;`,
            {  // bind variables
            sub_id:sub_id,
            p_isdn:isdn,
            str_serial:str_serial,
            str_imsi:str_imsi,
            str_shop_code:str_shop_code,
            str_reg_type:'MS',
            str_cust_type:str_cust_type,
            str_sub_type:str_sub_type,
            str_sub_name:str_sub_name,
            str_nationality:str_nationality,
            str_birthday:str_birthday,
            str_sex:str_sex,
            str_bar_expire_date:'',
            str_id_no:str_id_no,
            str_id_issue_date:str_id_issue_date,
            str_id_issue_place:str_id_issue_place,
            str_expire_date:'',
            str_passpost:'',
            str_passpost_issue_date:'',
            str_passpost_issue_place:'',
            bl_secret:'',
            str_tin:'',
            str_province:str_province,
            str_district:str_district,
            str_precinct:str_precinct,
            str_street_block_name:str_street_block_name,
            str_street_name:str_street_name,
            str_home:str_home,
            str_address:str_address,
            str_tel:str_tel,
            str_email:'',
            str_password:'',
            str_contact_name:'',
            str_contact_address:'',
            str_reg_business:'S0',
            str_job:18,
            str_employee:str_employee,
            str_app_object:str_app_object,
            str_founded_perm_no:'',
            str_founded_perm_date:'',
            str_visa:'',
            str_contract_no:str_contract_no,
            str_user_sub_name:str_sub_name,
            str_user_birthday:str_birthday,
            str_user_id_or_pp_no:str_id_no,
            str_user_id_or_pp_issue_place:str_id_issue_place,
            str_user_id_or_pp_issue_date:str_id_issue_date,
            str_user_option:1,
            l_image:l_image,
            p_soap_result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
            p_trang_thai: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
            p_t_api_end: { dir: oracledb.BIND_OUT, type: oracledb.DATE},
            p_api_time: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            }
        );

        console.log(isdn, result.outBinds.p_soap_result)
        return result.outBinds.p_soap_result
    } catch (e) {
        console.log(isdn, e);
    }
}

var call_api_upload_anh = async function (conn,
        p_sub_id               ,
        p_isdn                 ,
        p_shop_code            ,
        p_employee             ,
        p_image                ,
        p_reason               ,
        p_qlkh_username        ,
        p_qlkh_password        ,
        p_soap_user_name       ,
        p_soap_password
) {
  let result;
  try {
    result = await conn.execute(
        `BEGIN
            api_upload_anh(
                :p_sub_id,
                :p_isdn,
                :p_shop_code,
                :p_employee,
                :p_image,
                :p_reason,
                :p_qlkh_username,
                :p_qlkh_password,
                :p_soap_user_name,
                :p_soap_password,
                :p_soap_result,
                :p_trang_thai,
                :p_t_api_end,
                :p_api_time
            );
        END;`,
        {  // bind variables
            p_sub_id:p_sub_id,
            p_isdn:p_isdn,
            p_shop_code:p_shop_code,
            p_employee:p_employee,
            p_image:p_image,
            p_reason:p_reason,
            p_qlkh_username:p_qlkh_username,
            p_qlkh_password:p_qlkh_password,
            p_soap_user_name:p_soap_user_name,
            p_soap_password:p_soap_password,
            p_soap_result: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 },
            p_trang_thai: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 20 },
            p_t_api_end: { dir: oracledb.BIND_OUT, type: oracledb.DATE},
            p_api_time: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        }
    );

    console.log(p_isdn, result.outBinds.p_soap_result);
    return result.outBinds.p_soap_result
} catch (e) {
    console.log(p_isdn, e);
}
}

module.exports = {
    call_api_tdtt,
    call_api_upload_anh
}