<template>
    <div>
        <!-- 搜索组件 -->
        <search-form :items="formItems" :params="params" :on-submit="onSearch" :btn-loading="loading" />

        <!-- 表格区域 -->
        <div class="table-body">
            <!-- 左上角按钮 -->
            <div class="table-left-top">
                <el-button v-auth="'add'" type="primary" icon="el-icon-plus" @click="onAdd">{{ $i18n.t('CREATE_COUNTRY') }}</el-button>
                <el-button v-auth="'enable'" type="success" icon="el-icon-circle-check" :disabled="checkedIds.length === 0" @click="onEnable()">{{ $i18n.t('ENABLE') }}</el-button>
                <el-button v-auth="'disable'" type="warning" icon="el-icon-custom-disable" :disabled="checkedIds.length === 0" @click="onDisable()">{{ $i18n.t('DISABLE') }}</el-button>
            </div>
            <!-- 表格 -->
            <el-table border style="width: 100%;" stripe :data="data" v-loading="loading" row-key="id" @selection-change="handleSelectionChange">
                <el-table-column type="selection" align="center" prop="id" label="ID" :width="50" ></el-table-column>
                <el-table-column align="center" sortable prop="id" label="ID" :width="80" fixed="left"></el-table-column>
                <el-table-column align="center" prop="name_text" :label="$i18n.t('COUNTRY_NAME')" :min-width="150"></el-table-column>
                <el-table-column align="center" prop="lang" :label="$i18n.t('LANG_NAME')" :min-width="150"></el-table-column>
                <el-table-column align="center" prop="code" :label="$i18n.t('COUNTRY_CODE')" :min-width="150"></el-table-column>
                <el-table-column align="center" prop="phone_code" :label="$i18n.t('COUNTRY_PHONE_CODE')" :min-width="150"></el-table-column>
                <el-table-column align="center" prop="exchange_rate" :label="$i18n.t('EXCHANGE_RATE')" :min-width="150"></el-table-column>
                <el-table-column align="center" prop="image" :label="$i18n.t('COUNTRY_IMAGE')" :min-width="150">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.image === null" type="info" disabled>查看图片</el-button>
                        <el-button v-else type="primary" @click="checkPicture(scope.row.image)">查看图片</el-button>
                    </template>
                </el-table-column>
                <!--
                <el-table-column align="center" prop="job_step" :label="$i18n.t('TASK_JOB_STEP')" :min-width="150">
                    <template slot-scope="scope">
                        <el-button plain v-if="scope.row.job_step === null" type="info" disabled>查看任务步骤</el-button>
                        <el-button plain v-else type="primary" @click="checkJobStep(scope.row, 1)">查看任务步骤</el-button>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="audit_sample" :label="$i18n.t('TASK_AUDIT_SAMPLE')" :min-width="150">
                    <template slot-scope="scope">
                        <el-button plain v-if="scope.row.audit_sample === null" type="info" disabled>查看审核样例</el-button>
                        <el-button plain v-else type="primary" @click="checkJobStep(scope.row, 2)">查看审核样例</el-button>
                    </template>
                </el-table-column>
                -->
                <el-table-column align="center" sortable prop="created_at" :label="$i18n.t('CREATE_TIME')" :min-width="170"></el-table-column>
                <!-- 右侧按钮 -->
                <el-table-column align="center" :label="$i18n.t('ACTION')" fixed="right" :width="200">
                    <template slot-scope="scope">
                        <el-link v-auth="'edit'" icon="el-icon-edit" @click="onEDit(scope.row)">{{ $i18n.t('EDIT') }}</el-link>
                        <span v-auth="'delete'" >
                            <el-divider direction="vertical"></el-divider>
                            <poptip
                                confirm
                                :title="$i18n.t('TASK_CATEGORY_CONFIRM_DELETE_TIP')"
                                @on-ok="onDelete(scope.row.id)"
                                :ok-text="$i18n.t('CONFIRM')"
                                :cancel-text="$i18n.t('CANCEL')"
                            >
                                <el-link icon="el-icon-delete">{{ $i18n.t('DELETE') }}</el-link>
                            </poptip>
                        </span>
                    </template>
                </el-table-column>
            </el-table>

            <div>
                <el-image-viewer v-if="isShowPictures" :on-close="() => { isShowPictures = false }" :url-list="picture">
                </el-image-viewer>
            </div>

            <!-- 分页 -->
            <div class="table-pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next, ->, sizes"
                    :page-size.sync="page.perPage"
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
    </div>
</template>

<script>
    import SearchForm from '@/components/SearchForm'
    import { PAGES_SIZE } from '@/config/constants'
    import { getCountryList, deleteCountry } from '@/api/country'
    import configs from '@/config'
    import ElImageViewer from 'element-ui/packages/image/src/image-viewer'
    import FormModal from '@/components/country/FormModal'

    export default {
        name: 'country',
        components: { SearchForm, ElImageViewer, FormModal },
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
                config: configs,
                isShowPictures: false,
                picture: [],
                drawer: false,
                mdl: {},
                checkedIds: [],
                dialogVisible: false,
                dialogContent: '',
                dialogTitle: '',
                dialogId: 0,
                dialogType: 0,
                errorMessage: ''
            }
        },
        created () {
            this.fetch()
        },
        computed: {
            formItems () {
                // 用户状态筛选
                /* const statusOptions = [
                    { label: this.$i18n.t('NORMAL'), value: 1 },
                    { label: this.$i18n.t('DISABLED'), value: 0 }
                ] */
                // 构建搜索表单
                return [
                    { title: this.$i18n.t('COUNTRY_NAME'), type: 'input', key: 'name', maxlength: 100 },
                    { title: this.$i18n.t('LANG_NAME'), type: 'input', key: 'lang', maxlength: 100 },
                    { title: this.$i18n.t('COUNTRY_CODE'), type: 'input', key: 'code', maxlength: 100 },
                    { title: this.$i18n.t('EXCHANGE_RATE'), type: 'input', key: 'exchange_rate', maxlength: 100 }
                ]
            }
        },
        methods: {
            // 搜索按钮
            onSearch () {
                this.fetch()
            },
            // 从接口拉取数据
            fetch () {
                this.loading = true
                getCountryList({ ...this.params, page: this.page.currentPage, perPage: this.page.perPage }).then((res) => {
                    // eslint-disable-next-line camelcase
                    const { data, last_page, total } = res.result
                    this.data = data
                    this.page.total = total
                    // eslint-disable-next-line camelcase
                    this.page.pageCount = last_page
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
            checkPicture (picture) {
                this.isShowPictures = true

                this.picture[0] = this.config.staticUrl + picture
            },
            // 选中的ID
            handleSelectionChange (rows) {
                this.checkedIds = rows.map(item => item.id)
            },
            // 对话框关闭
            handleClose (done) {
                this.$confirm('确认关闭？').then(_ => { done() }).catch(_ => {})
            },
            checkJobStep (row, type) {
                if (type === 1) {
                    this.dialogTitle = '任务步骤'
                    this.dialogContent = row.job_step
                } else {
                    this.dialogTitle = '审核样例'
                    this.dialogContent = row.audit_sample
                }
                this.dialogType = type
                this.dialogId = row.id
                this.dialogVisible = true
            },
            submit () {
            },
            // 启用选中
            onEnable () {
            },
            // 禁用选中
            onDisable () {
            },
            // 添加轮播广告
            onAdd () {
                this.mdl = Object.assign({}, {
                    id: '',
                    name: '',
                    icon: '',
                    image: '',
                    sort: '',
                    status: 1
                })
                this.drawer = true
            },
            // 修改
            onEDit (row) {
                this.mdl = Object.assign({}, row)
                this.drawer = true
            },
            // 删除
            onDelete (id) {
                deleteCountry(id).then(() => {
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    setTimeout(() => {
                        this.fetch()
                    }, 500)
                })
            },
            // 关闭抽屉方法
            handleCloseDrawer () {
                this.$refs.drawer.closeDrawer()
            }
        }
    }
</script>

<style>
    .ql-editor{
        height:400px;
    }
</style>
