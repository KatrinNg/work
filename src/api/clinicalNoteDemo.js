import request from 'services/request';



export async function getServices() {
  /**
  * 获取服务查询条件选项
  *
  * Response Data：
  *   @type        {object[]}
  *   @property    {string}    object.code           服务码
  *   @property    {string}    object.engDesc        服务描述字段(全称)
  *   @property    {number}    object.displaySeq     排序字段
  */
  return request('/clinical-note/listServiceList', {method:'get'});
}


export async function getRecordTypes(params) {
  /**
  * 获取Record Type 查询条件选项
  *
  * Request Data：
  *   @type        {object}
  *   @property    {string}    object.curservice     当前的服务码
  *
  * Response Data：
  *   @type        {object[]}
  *   @property    {string}    object.codeClinicalnoteTypeCd           服务码
  *   @property    {string}    object.createdBy                        创建用户
  *   @property    {string}    object.createdDtm                       创建时间（ @example '2019-10-23T09:47:16.000+0000'）
  *   @property    {string}    object.typeDesc                         类型描述字段（ 全称 ）
  *   @property    {string}    object.updatedBy                        更新用户
  *   @property    {string}    object.updatedDtm                       更新时间 ( 同 createdDtm )
  */
  return request('/clinical-note/getClinicalNoteTypeList', {method:'post', data:params});
}


export async function getRecords(params) {
  /**
  * 获取Medical Record 列表
  *
  * Request Data：
  *   @type        {object}
  *   @property    {string}    object.curServiceCd     当前的服务码
  *   @property    {string}    object.recordTypeCd     Record Type Code
  *   @property    {string}    object.userRoleType     用户角色类型
  *   @property    {string}    object.serviceCd        同curServiceCd
  *   @property    {long}      object.encounterId      Encounter Id
  *
  * Response Data：
  *   @type        {object}
  *   @property    {object[listItem]}    object.clinicalNoteDtoList           Medical Record List
  *     @property  {number}      listItem.clinicalnoteId                      Note ID
  *     @property  {string}      listItem.clinicalnoteText                    Note 内容
  *     @property  {string}      listItem.clinicalnoteTypeDesc                Record Type描述
  *     @property  {string}      listItem.codeClinicalnoteTypeCd              Record Type Code
  *     @property  {string}      listItem.createdBy                           创建用户
  *     @property  {string}      listItem.createdDtm                          创建时间 ( @example '2019-10-23T09:47:16.000+0000'）
  *     @property  {long}        listItem.encounterId                         Encounter ID
  *     @property  {string}      listItem.serviceCd                           Service Code
  *     @property  {string}      listItem.updatedBy                           更新用户
  *     @property  {string}      listItem.updatedDtm                          更新时间
  *     @property  {string}      listItem.version
  *
  *   @property    {object[listItem]}    object.historyClinicalNoteDtoList            当前Encounter下的Note，其listItem字段同上
  */
  return request('/clinical-note/listClinicalNotes', {method:'post', data:params});
}
