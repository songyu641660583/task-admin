<template>
    <div v-loading="loading">
        <!-- 搜索组件 -->
        <search-form
            :items="formItems"
            :params="params"
            :on-submit="onSearch"
            :btn-loading="loading"
        />

        <!-- 表格区域 -->
        <div class="table-body">
            <!-- 左上角按钮 -->
            <div class="table-left-top">
                <el-button type="primary" icon="el-icon-plus" @click="onAdd">{{
                    $i18n.t("CREATE_LUCKY_RECORD")
                }}</el-button>
                <el-button
                    type="success"
                    icon="el-icon-circle-check"
                    @click="handleAllPass"
                    v-loading="loading"
                    >{{ $i18n.t("BATCH_TRANSFER") }}</el-button
                >
                <!-- <el-button
                    v-auth="'export'"
                    type="primary"
                    @click="handleDownload"
                    >{{ $i18n.t("EXPORT") }}</el-button
                > -->
            </div>

            <!-- 表格 -->
            <el-table
                border
                style="width: 100%"
                stripe
                :data="data"
                v-loading="loading"
                @selection-change="handleSelectionChange"
            >
                <el-table-column
                    align="center"
                    sortable
                    prop="id"
                    label="ID"
                    :width="100"
                    fixed="left"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="amount"
                    :label="$i18n.t('LUCKY_AMOUNT')"
                    :min-width="150"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="nickname"
                    :label="$i18n.t('NICKNAME')"
                    :min-width="150"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="user_id"
                    :label="$i18n.t('MEMBER_ID')"
                    :min-width="150"
                ></el-table-column>
                <el-table-column
                    align="center"
                    prop="phone"
                    :label="$i18n.t('PHONE')"
                    :min-width="150"
                ></el-table-column>
                <el-table-column
                    align="center"
                    sortable
                    prop="created_at"
                    :label="$i18n.t('CREATE_TIME')"
                    :min-width="170"
                ></el-table-column>
                <!-- 右侧按钮 -->
                <el-table-column
                    align="center"
                    :label="$i18n.t('ACTION')"
                    fixed="right"
                    :width="400"
                >
                    <template slot-scope="scope">
                        <span v-if="scope.row.status == 1">
                            <el-link
                                icon="el-icon-delete"
                                @click="onDelete(scope.row)"
                                >{{ $i18n.t("DELETE") }}</el-link
                            >
                        </span>
                        <span
                            v-if="
                                scope.row.is_transfer == 0 &&
                                scope.row.status == 2
                            "
                        >
                            <el-link
                                icon="el-icon-sort"
                                @click="onTransfer(scope.row)"
                                >{{ $i18n.t("TRANSFER") }}</el-link
                            >
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
            <form-modal
                :mdl="mdl"
                :handle-close-drawer="handleCloseDrawer"
            ></form-modal>
        </el-drawer>

        <el-dialog
            :title="$i18n.t('EXPORT')"
            :visible.sync="exportVisible"
            :destroy-on-close="true"
            v-if="exportVisible"
        >
            <el-form :model="mdl" ref="ruleForm" label-width="130px">
                <el-form-item :label="$i18n.t('PAGE')">
                    <el-input-number
                        v-model="exportPage"
                        :placeholder="$i18n.t('PAGE')"
                        style="width: 200px"
                    ></el-input-number>
                </el-form-item>
                <el-form-item>
                    <el-button @click="handleExport" type="primary">{{
                        $i18n.t("SUBMIT")
                    }}</el-button>
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
import SearchForm from "@/components/SearchForm";
import { getDraw, deleteDraw, drawTransfer } from "@/api/member";
import FormModal from "@/components/lucky/FormModal";
import RechargeFormModal from "@/components/member/RechargeFormModal";
import { PAGES_SIZE } from "@/config/constants";
import Team from "@/components/member/Team";
import { userCsv } from "@/api/csv";

export default {
    name: "user",
    components: {
        SearchForm,
        RechargeFormModal,
        Team,
        FormModal,
    },
    data() {
        return {
            PAGES_SIZE,
            params: {},
            data: [],
            page: {
                total: 0,
                currentPage: 1,
                perPage: PAGES_SIZE[0],
                pageCount: 1,
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
            exportPage: 1,
        };
    },
    created() {
        this.fetch();
    },
    computed: {
        formItems() {
            const statusOptions = [
                { label: this.$i18n.t("UNLUCKY"), value: 1 },
                { label: this.$i18n.t("LUCKIED"), value: 2 },
            ];
            // 构建搜索表单
            return [
                {
                    title: this.$i18n.t("MEMBER_ID"),
                    type: "input",
                    key: "user_id",
                    maxlength: 11,
                },
                {
                    title: this.$i18n.t("STATUS"),
                    type: "select",
                    key: "status",
                    options: statusOptions,
                },
            ];
        },
        isShowDivider() {
            const { meta } = this.$store.getters.router;
            return (
                meta.actions.indexOf("update") > -1 &&
                meta.actions.indexOf("delete") > -1
            );
        },
    },
    methods: {
        handleDownload() {
            this.ehandleExportxportVisible = true;
        },
        handleExport() {
            userCsv({ page: this.exportPage }).then(() => {
                this.$Message.success(this.$i18n.t("HANDLE_SUCCESS"));
                this.exportVisible = false;
            });
        },

        // 搜索按钮
        onSearch() {
            this.fetch();
        },

        // 从接口拉取数据
        fetch() {
            this.loading = true;
            getDraw({
                ...this.params,
                page: this.page.currentPage,
                perPage: this.page.perPage,
            })
                .then((res) => {
                    // eslint-disable-next-line camelcase
                    const { data, last_page, total } = res.result;
                    this.data = data.map((item) => {
                        return {
                            ...item,
                            phone: item.user.phone || "",
                            nickname: item.user.nickname || "",
                        };
                    });
                    this.page.total = total;
                    // eslint-disable-next-line camelcase
                    this.page.pageCount = last_page;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        // 页数切换
        onCurrentPageChange(page) {
            this.page.currentPage = page;
            this.fetch();
        },
        // 每页显示数量修改
        onPerPageChange(perPage) {
            this.page.perPage = perPage;
            this.fetch();
        },
        // 关闭抽屉方法
        handleCloseDrawer() {
            this.$refs.drawer.closeDrawer();
        },

        // 选中的ID
        handleSelectionChange(rows) {
            this.checkedIds = rows.map((item) => item.id);
        },

        onChangeParentId(row) {
            this.mdl = Object.assign({}, row);
            this.changeParentVisible = true;
        },

        onCheckUserMember(row) {
            this.mdl = Object.assign({}, row);
            this.userMemberVisible = true;
        },

        // 添加
        onAdd() {
            this.mdl = Object.assign({}, {});
            this.drawer = true;
        },
        handleAllPass() {
            const optionsData = this.data.filter(
                (item) => item.is_transfer == 0 && item.status == 2
            );
            if (optionsData.length === 0) {
                this.$Message.warning(this.$i18n.t("NO_OPTIONS_VERIFY_STATUS"));
                return;
            } 
            this.loading = true
            optionsData.forEach((item, index) => {
                drawTransfer(item.id).then(() => {
                    if (index === optionsData.length - 1) {
                         setTimeout(() => {
                            this.fetch()
                            this.loading = false
                            this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                        }, 2000)
                    }
                });
            });
        },
        onTransfer(row) {
            this.$confirm(this.$i18n.t("CONFIRM_TRANSFER_TIP"))
                .then((res) => {
                    drawTransfer(row.id).then(() => {
                        this.$Message.success(this.$i18n.t("HANDLE_SUCCESS"));
                        this.fetch();
                    });
                })
                .catch((_) => {});
        },
        onDelete(row) {
            this.$confirm(this.$i18n.t("CONFIRM_DELETE_TIP"))
                .then((res) => {
                    deleteDraw(row.id).then(() => {
                        this.$Message.success(this.$i18n.t("HANDLE_SUCCESS"));
                        this.fetch();
                    });
                })
                .catch((_) => {});
        },
    },
};
</script>

<style lang="less" scoped></style>
