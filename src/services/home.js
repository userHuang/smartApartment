import Server from '@/extend/Server'
import Config from '@/extend/config'

class HomeServices {
  request (params) {
    const baseParams = {
      url: Config.meta5dHost + params.url
    }
    Object.assign(params, baseParams)
    return Server(params)
  }
}

const Services = new HomeServices()
// {get: params, post: data}
export default {
  pushHouseType (params) {
    return Services.request({
      url: `/nd-wisdom-layout/data/pushHouseType/${params.id}`,
      method: 'PUT'
    })
  },
  queryHouseTypeList (params) {
    return Services.request({
      url: `/nd-wisdom-layout/data/queryHouseTypeList`,
      method: 'get',
      params
    })
  },
  queryLayoutDataByHouseType (params) {
    return Services.request({
      url: `/nd-wisdom-layout/data/queryLayoutDataByHouseType/${params.id}`,
      method: 'get',
      params
    })
  }
}