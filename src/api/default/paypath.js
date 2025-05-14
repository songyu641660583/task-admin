import { axios } from '@/utils/request'

export function getPayField (params) {
    return axios({
        url: 'admin/payfield',
        method: 'get',
        params
    })
}

export function addPayField (data) {
    return axios({
        url: 'admin/payfield',
        method: 'post',
        data
    })
}

export function updatePayField (id, data) {
    return axios({
        url: `admin/payfield/${id}`,
        method: 'put',
        data
    })
}

export function delPayField (id) {
    return axios({
        url: `admin/payfield/${id}`,
        method: 'delete'
    })
}
