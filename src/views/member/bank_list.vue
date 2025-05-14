<template>
    <div>
        <!-- 搜索组件 -->
        <search-form :items="formItems" :params="params" :on-submit="onSearch" :btn-loading="loading" />

        <!-- 表格区域 -->
        <div class="table-body">
            <!-- 左上角按钮 -->
            <div class="table-left-top">
                <el-button v-auth="'add'" type="primary" icon="el-icon-plus" @click="onAdd">{{ $i18n.t('CREATE_USER_ACCOUNT') }}</el-button>


                <!--                <el-button v-auth="'enable'" type="success" icon="el-icon-circle-check" :disabled="checkedIds.length === 0" @click="onEnable()">{{ $i18n.t('ENABLE') }}</el-button>-->
                <!--                <el-button v-auth="'disable'" type="warning" icon="el-icon-custom-disable" :disabled="checkedIds.length === 0" @click="onDisable()">{{ $i18n.t('DISABLE') }}</el-button>-->
            </div>

            <!-- 表格 -->
            <el-table border style="width: 100%;" stripe :data="data" v-loading="loading" @selection-change="handleSelectionChange">
                <el-table-column align="center" sortable prop="id" label="ID" :width="100" fixed="left"></el-table-column>
                <el-table-column align="center" sortable prop="ip" label="IP" :width="100" fixed="left"></el-table-column>
                <el-table-column :label="$i18n.t('BANK_NAME')" >
                    <template slot-scope="scope">
                    {{ scope.row.user_info.bank_name ? scope.row.user_info.bank_name : '-' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$i18n.t('MEMBER_BANK_NAME')" >
                    <template slot-scope="scope">
                    {{ scope.row.user_info.name ? scope.row.user_info.name : '-' }}
                    </template>
                </el-table-column>
                <el-table-column :label="$i18n.t('MEMBER_BANK_ACCOUNT')">
                    <template slot-scope="scope">
                    {{ scope.row.user_info.account ? scope.row.user_info.account : '-'}}
                    </template>
                </el-table-column>
                <el-table-column :label="$i18n.t('BANK_CODE')" >
                    <template slot-scope="scope">
                    {{ scope.row.user_info.bank_code ? scope.row.user_info.bank_code : '-'}}
                    </template>
                </el-table-column>
                <el-table-column :label="$i18n.t('BANK_RANK')" >
                    <template slot-scope="scope">
                    {{ scope.row.user_info.bank_code ? scope.row.user_info.rank : '-'}}
                    </template>
                </el-table-column>
                <el-table-column align="center" sortable prop="created_at" :label="$i18n.t('CREATE_TIME')" :min-width="170"></el-table-column>
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
        <el-dialog
            :title="$i18n.t('EDIT_MEMBER_LEVEL')"
            :visible.sync="dialogTableVisible"
            :destroy-on-close="true"
        >
            <recharge-form-modal :mdl="mdl" :handle-close-dialog="handleCloseDialog"></recharge-form-modal>
        </el-dialog>
        <el-dialog
            :title="$i18n.t('EDIT_MEMBER_BALANCE')"
            :visible.sync="editBalanceVisible"
            :destroy-on-close="true"
        >
            <balance-form-modal :mdl="mdl" :handle-close-dialog="handleCloseBalanceDialog"></balance-form-modal>
        </el-dialog>
        <el-dialog
            :title="$i18n.t('CHECK_TEAM')"
            v-if="teamVisible"
            :visible.sync="teamVisible"
            :destroy-on-close="true"
            width="80%"
            style="height: 100%"
        >
            <!--            <team-table :mdl="mdl" :handle-close-dialog="handleCloseTeamDialog"></team-table>-->
            <team :mdl="mdl" :handle-close-dialog="handleCloseTeamDialog"></team>
        </el-dialog>
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
            :title="$i18n.t('EDIT_EFFECTIVE_TIME')"
            :visible.sync="effectiveTimeVisible"
            :destroy-on-close="true"
        >
            <effective-time-form-modal :mdl="mdl" :handle-close-dialog="handleCloseEffectiveTimeDialog"></effective-time-form-modal>
        </el-dialog>
        <el-dialog
            :title="$i18n.t('EDIT_PARENT_ID')"
            :visible.sync="changeParentVisible"
            :destroy-on-close="true"
        >
            <change-parent-form-modal :mdl="mdl" :handle-close-dialog="handleCloseChangeParentDialog"></change-parent-form-modal>
        </el-dialog>
        <el-dialog
            :title="$i18n.t('CHECK_USER_MEMBER')"
            :visible.sync="userMemberVisible"
            :destroy-on-close="true"
            v-if="userMemberVisible"
        >
            <user-member-form-modal :mdl="mdl"></user-member-form-modal>
        </el-dialog>

        <el-dialog
            :title="$i18n.t('CHECK_USER_MEMBER')"
            :visible.sync="userMemberIpVisible"
            :destroy-on-close="true"
            v-if="userMemberIpVisible"
        >
            <user-member-ip-form-modal :mdl="mdl"></user-member-ip-form-modal>
        </el-dialog>

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
    import { getMember, enableMember, disableMember, setUpAgent, cancelAgent, teamLockClose, teamLockOpen } from '@/api/member'
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

                // 构建搜索表单
                return [
                    { title: this.$i18n.t('MEMBER_ID'), type: 'input', key: 'id', maxlength: 11 },

                ]
            },
            isShowDivider () {
                const { meta } = this.$store.getters.router
                return meta.actions.indexOf('update') > -1 && meta.actions.indexOf('delete') > -1
            }
        },
        methods: {
            handleDownload () {
                this.exportVisible = true
            },
            handleExport () {
                userCsv({ page: this.exportPage }).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    this.exportVisible = false
                })
            },
            //
            onSwitchChangeOpen (id) {
                teamLockOpen(id).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    setTimeout(() => {
                        this.fetch()
                    }, 500)
                })
            },
            onSwitchChangeClose (id) {
                teamLockClose(id).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    setTimeout(() => {
                        this.fetch()
                    }, 500)
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
            // 关闭对话框
            handleCloseDialog () {
                this.dialogTableVisible = false
            },
            handleCloseEffectiveTimeDialog () {
                this.effectiveTimeVisible = false
            },
            handleCloseChangeParentDialog () {
                this.changeParentVisible = false
            },
            // 关闭对话框
            handleCloseBalanceDialog () {
                this.editBalanceVisible = false
            },
            // 关闭对话框
            handleCloseTeamDialog () {
                this.teamVisible = false
            },
            // 选中的ID
            handleSelectionChange (rows) {
                this.checkedIds = rows.map(item => item.id)
            },
            // 启用选中用户
            onEnable (id) {
                enableMember(id).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    setTimeout(() => {
                        this.fetch()
                    }, 500)
                })
            },
            // 禁用选中用户
            onDisable (id) {
                disableMember(id).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    setTimeout(() => {
                        this.fetch()
                    }, 500)
                })
            },
            onSetUpAgent (id) {
                setUpAgent({ id: id }).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    setTimeout(() => {
                        this.fetch()
                    }, 500)
                })
            },
            onCancelAgent (id) {
                cancelAgent({ id: id }).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    setTimeout(() => {
                        this.fetch()
                    }, 500)
                })
            },
            onRecharge (row) {
                this.mdl = Object.assign({}, row)
                this.dialogTableVisible = true
            },
            onEditBalance (row) {
                this.mdl = Object.assign({}, {
                    id: row.id,
                    balance: row.balance,
                    type: 6,
                    amount: 0
                })
                this.editBalanceVisible = true
            },
            onChangeParentId (row) {
                this.mdl = Object.assign({}, row)
                this.changeParentVisible = true
            },
            onCheckTeam (row) {
                this.mdl = Object.assign({}, row)
                this.teamVisible = true
            },
            onCheckUserMember (row) {
                this.mdl = Object.assign({}, row)
                this.userMemberVisible = true
            },
            onCheckUserMemberIp (row) {
                this.mdl = Object.assign({}, row)
                this.userMemberIpVisible = true
            },
            onEditEffectiveTime (row) {
                this.mdl = Object.assign({}, row)
                this.effectiveTimeVisible = true
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
            // 修改
            onEDit (row) {
                this.mdl = Object.assign({}, row)
                this.mdl.password = ''
                this.mdl.trade_pass = ''
                this.drawer = true
            }
        }
    }
</script>

<style lang="less" scoped>
</style>
