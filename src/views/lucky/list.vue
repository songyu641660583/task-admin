<template>
    <div>

        <!-- 搜索组件 -->
        <search-form :items="formItems" :params="params" :on-submit="onSearch" :btn-loading="loading" />

        <!-- 表格区域 -->
        <div class="table-body">
            <!-- 左上角按钮 -->
            <div class="table-left-top">
                <el-button v-auth="'add'" type="primary" icon="el-icon-plus" @click="onAdd">{{ $i18n.t('CREATE_LUCKY') }}</el-button>
                <el-button v-auth="'export'"  type="primary"  @click="handleDownload">{{ $i18n.t('EXPORT') }}</el-button>
            </div>

            <!-- 表格 -->
            <el-table border style="width: 100%;" stripe :data="data" v-loading="loading" @selection-change="handleSelectionChange">
<!--                <el-table-column type="selection" align="center" prop="id" label="ID" :width="50" ></el-table-column>-->
                <el-table-column align="center" type="expand" :label="$i18n.t('MEMBER_INFO')"  fixed="left" :width="50">
                    <template slot-scope="scope">
                        <el-form label-position="left" inline class="demo-table-expand">
                            <el-form-item label="ip">
                                {{ scope.row.ip }}
                            </el-form-item>
                            <el-form-item :label="$i18n.t('NICKNAME')">
                                {{ scope.row.nickname }}
                            </el-form-item>
                            <el-form-item :label="$i18n.t('GENDER')">
                                <el-tag v-if="scope.row.gender === 1">{{ $i18n.t('MALE') }}</el-tag>
                                <el-tag v-else-if="scope.row.gender === 2">{{ $i18n.t('FEMALE') }}</el-tag>
                                <el-tag v-else>{{ $i18n.t('SECRET') }}</el-tag>
                            </el-form-item>
                            <el-form-item :label="$i18n.t('BANK_NAME')" v-if="scope.row.user_info !== null">
                                {{ scope.row.user_info.bank_name ? scope.row.user_info.bank_name : '-' }}
                            </el-form-item>
                            <el-form-item :label="$i18n.t('MEMBER_BANK_NAME')" v-if="scope.row.user_info !== null">
                                {{ scope.row.user_info.name ? scope.row.user_info.name : '-' }}
                            </el-form-item>
                            <el-form-item :label="$i18n.t('MEMBER_BANK_ACCOUNT')" v-if="scope.row.user_info !== null">
                                {{ scope.row.user_info.account ? scope.row.user_info.account : '-'}}
                            </el-form-item>
                            <el-form-item :label="$i18n.t('BANK_CODE')" v-if="scope.row.user_info !== null">
                                {{ scope.row.user_info.bank_code ? scope.row.user_info.bank_code : '-'}}
                            </el-form-item>
                            <el-form-item :label="$i18n.t('BANK_RANK')" v-if="scope.row.user_info !== null">
                                {{ scope.row.user_info.bank_code ? scope.row.user_info.rank : '-'}}
                            </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>
                <el-table-column align="center" sortable prop="id" label="ID" :width="100" fixed="left"></el-table-column>


                <el-table-column align="center" prop="parent_id" :label="$i18n.t('PARENT_ID')" :min-width="100">
                    <template slot-scope="scope">
                        <el-link @click="onChangeParentId(scope.row)">{{ scope.row.parent_id }}</el-link>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="level_name" :label="$i18n.t('MEMBER_LEVEL')" :min-width="120">
                    <template slot-scope="scope">
                        <el-button type="primary" @click="onCheckUserMember(scope.row)">{{ $i18n.t('CHECK_USER_MEMBER') }}</el-button>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="phone" :label="$i18n.t('PHONE')" :min-width="150"></el-table-column>
                <el-table-column align="center" prop="balance" :label="$i18n.t('BALANCE')" :min-width="100">
                    <template slot-scope="scope">
                        <span>{{ scope.row.balance }} {{|formatPriceTag}}</span>
                    </template>
                </el-table-column>

                <el-table-column align="center" prop="credit" :label="$i18n.t('CREDIT')" :min-width="100"></el-table-column>
                <el-table-column align="center" prop="status" :label="$i18n.t('STATUS')" :min-width="100">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.status === 1" type="success">{{ $i18n.t('NORMAL') }}</el-tag>
                        <el-tag v-else-if="scope.row.status === 0" type="danger">{{ $i18n.t('DISABLED') }}</el-tag>
                        <el-tag v-else>-</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" sortable prop="created_at" :label="$i18n.t('CREATE_TIME')" :min-width="170"></el-table-column>
                <!-- 右侧按钮 -->
                <el-table-column align="center" :label="$i18n.t('ACTION')" fixed="right" :width="400">
                    <template slot-scope="scope">
                      
                        <span v-auth="'edit'">
                            <el-divider direction="vertical"></el-divider>
                            <el-link icon="el-icon-edit" @click="onDelete(scope.row)">{{ $i18n.t('DELETE') }}</el-link>
                        </span>
                        
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="table-pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next, ->, sizes"
                    :page-size.sync="page.perPage"
                    :total="page.total"
                    :page-count="page.pageCount"
                    :current-page.sync="page.currentPage"
                    :page-sizes="PAGES_SIZE"
                    @current-change="onCurrentPageChange"
                    @size-change="onPerPageChange"
                >
                </el-pagination>
            </div>
        </div>
     
        <el-drawer
            :title="$i18n.t(mdl.id > 0 ? 'EDIT' : 'ADD')"
            :visible.sync="drawer"
            destroy-on-close
            ref="drawer"
            size="600px"
        >
            <form-modal :mdl="mdl" :handle-close-drawer="handleCloseDrawer"></form-modal>
        </el-drawer>
      

        <el-dialog
            :title="$i18n.t('EXPORT')"
            :visible.sync="exportVisible"
            :destroy-on-close="true"
            v-if="exportVisible"
        >
            <el-form :model="mdl" ref="ruleForm" label-width="130px">
                <el-form-item :label="$i18n.t('PAGE')">
                    <el-input-number v-model="exportPage" :placeholder="$i18n.t('PAGE')" style="width: 200px;"></el-input-number>
                </el-form-item>
                <el-form-item >
                    <el-button @click="handleExport" type="primary">{{ $i18n.t('SUBMIT') }}</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>

    </div>
</template>
<style>
    .demo-table-expand {
        font-size: 0;
    }
    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }
    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
</style>
<script>
    import SearchForm from '@/components/SearchForm'
    import { getMember } from '@/api/member'
    import FormModal from '@/components/member/FormModal'
    import RechargeFormModal from '@/components/member/RechargeFormModal'
    import { PAGES_SIZE } from '@/config/constants'
    import { getUserLevels } from '@/api/userLevel'
    import BalanceFormModal from '@/components/member/BalanceFormModal'
    import EffectiveTimeFormModal from '@/components/member/EffectiveTimeFormModal'
    import Team from '@/components/member/Team'
    import { userCsv } from '@/api/csv'
    import changeParentFormModal from '@/components/member/changeParentFormModal'
    import UserMemberFormModal from '@/components/member/UserMemberFormModal'
    import UserMemberIpFormModal from '@/components/member/UserMemberIpFormModal'
    // import TeamTable from '@/components/member/TeamTable'

    export default {
        name: 'user',
        components: { SearchForm, RechargeFormModal, BalanceFormModal, Team, FormModal, EffectiveTimeFormModal, changeParentFormModal, UserMemberFormModal, UserMemberIpFormModal },
        data () {
            return {
                PAGES_SIZE,
                params: {},
                data: [],
                page: {
                    total: 0,
                    currentPage: 1,
                    perPage: PAGES_SIZE[0],
                    pageCount: 1
                },
                loading: false,
                str_pid: null,
                drawer: false,
                dialogTableVisible: false,
                editBalanceVisible: false,
                teamVisible: false,
                effectiveTimeVisible: false,
                changeParentVisible: false,
                userMemberVisible: false,
                userMemberIpVisible: false,
                exportVisible: false,
                mdl: {},
                checkedIds: [],
                userLevelList: [],
                exportPage: 1
            }
        },
        created () {
            this.fetch()
            getUserLevels().then((res) => {
                this.userLevelList = res.result
            })
        },
        computed: {
            formItems () {
                // 用户状态筛选
                const statusOptions = [
                    { label: this.$i18n.t('NORMAL'), value: 1 },
                    { label: this.$i18n.t('DISABLED'), value: 0 }
                ]
                // 用户类型
                const typeOptions = [
                    { label: this.$i18n.t('USER_TYPE_0'), value: 0 },
                    { label: this.$i18n.t('USER_TYPE_1'), value: 1 }
                ]
                const userLevel = [
                    { label: this.$i18n.t('USER_LEVEL_0'), value: '' },
                    { label: this.$i18n.t('USER_LEVEL_1'), value: 1 },
                    { label: this.$i18n.t('USER_LEVEL_2'), value: 2 },
                    { label: this.$i18n.t('USER_LEVEL_3'), value: 3 }
                ]
                // 构建搜索表单
                return [
                    { title: this.$i18n.t('LUCKY_ID'), type: 'input', key: 'id', maxlength: 11 },
                    { title: this.$i18n.t('USER_LEVEL'), type: 'select', key: 'user_level', options: userLevel },
                    { title: this.$i18n.t('USER_TYPE'), type: 'select', key: 'type', maxlength: 11, options: typeOptions },
                    { title: this.$i18n.t('MEMBER_LEVEL'), type: 'select_level', key: 'level', options: this.userLevelList },
                    { title: this.$i18n.t('ACCOUNT'), type: 'input', key: 'account', maxlength: 50 },
                    { title: this.$i18n.t('NICKNAME'), type: 'input', key: 'nickname', maxlength: 50 },
                    { title: this.$i18n.t('PHONE'), type: 'input', key: 'phone', maxlength: 20 },
                ]
            },
            isShowDivider () {
                const { meta } = this.$store.getters.router
                return meta.actions.indexOf('update') > -1 && meta.actions.indexOf('delete') > -1
            }
        },
        methods: {
            handleDownload () {
                this.ehandleExportxportVisible = true
            },
             handleExport() {
                userCsv({ page: this.exportPage }).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    this.exportVisible = false
                })
            },
          
            // 搜索按钮
            onSearch () {
                this.fetch()
            },
           
           
            // 从接口拉取数据
            fetch () {
                this.loading = true
                getMember({ ...this.params, page: this.page.currentPage, perPage: this.page.perPage }).then((res) => {
                    // eslint-disable-next-line camelcase
                    const { data, last_page, total, str_pid } = res.result
                    this.data = data
                    this.page.total = total
                    // eslint-disable-next-line camelcase
                    this.page.pageCount = last_page
                    this.str_pid = str_pid
                }).finally(() => {
                    this.loading = false
                })
            },
            // 页数切换
            onCurrentPageChange (page) {
                this.page.currentPage = page
                this.fetch()
            },
            // 每页显示数量修改
            onPerPageChange (perPage) {
                this.page.perPage = perPage
                this.fetch()
            },
            // 关闭抽屉方法
            handleCloseDrawer () {
                this.$refs.drawer.closeDrawer()
            },
            
           
            // 选中的ID
            handleSelectionChange (rows) {
                this.checkedIds = rows.map(item => item.id)
            },
         
            onChangeParentId (row) {
                this.mdl = Object.assign({}, row)
                this.changeParentVisible = true
            },
          
            onCheckUserMember (row) {
                this.mdl = Object.assign({}, row)
                this.userMemberVisible = true
            },
           
           
            // 添加
            onAdd () {
                this.mdl = Object.assign({}, {
                    id: 0,
                    status: 1,
                    title: '',
                    content: '',
                    sort: 0
                })
                this.drawer = true
            },
            onDelete (row) {
                // this.mdl = Object.assign({}, row)
                // this.mdl.password = ''
                // this.mdl.trade_pass = ''
                // this.drawer = true
            }
        }
    }
</script>

<style lang="less" scoped>
</style>
