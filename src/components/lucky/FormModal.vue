<template>
    <div class="body">
        <el-form
            :model="mdl"
            ref="ruleForm"
            label-width="130px"
        >
            <el-form-item
                :label="$i18n.t('MEMBER_ID')"
                required
                :error="errors.user_id"
            >
                <el-input
                    v-model="mdl.user_id"
                    :placeholder="
                        $i18n.t('PLEASE_INPUT', { value: $i18n.t('MEMBER_ID') })
                    "
                ></el-input>
            </el-form-item>
            <el-form-item
                :label="$i18n.t('LUCKY_OPTIONS')"
                required
                :error="errors.award_id"
            >
                <el-select v-model="mdl.award_id" :value="mdl.award_id">
                    <el-option
                        v-for="(option, index) in drawOptions"
                        :label="option.label"
                        :value="option.award_id"
                        :key="index"
                    ></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :error="errors.submit">
                <el-button
                    type="primary"
                    @click="submitForm('ruleForm')"
                    :loading="submitLogin"
                    :disabled="btnDisable"
                    >{{ $i18n.t("SUBMIT") }}</el-button
                >
                <el-button @click="handleCloseDrawer">{{
                    $i18n.t("CANCEL")
                }}</el-button>
            </el-form-item>
            <el-form-item v-if="errorMessage !== ''">
                <Alert type="error" show-icon>{{ errorMessage }}</Alert>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import { addDraw, getDrawOptions } from "@/api/member";

export default {
    name: "formModal",
    props: {
        mdl: {
            type: Object,
            required: true,
        },
        handleCloseDrawer: {
            type: Function,
            required: true,
        },
    },
    watch: {
        mdl: {
            handler() {
                this.btnDisable = false;
            },
            deep: true,
        },
    },
    data() {
        return {
            // 用户状态
            statusOptions: [
                { label: this.$i18n.t("NORMAL"), value: 1 },
                { label: this.$i18n.t("DISABLE"), value: 2 },
            ],
            typeOptions: [
                { label: this.$i18n.t("USER_TYPE_0"), value: 0 },
                { label: this.$i18n.t("USER_TYPE_1"), value: 1 },
            ],
            rules: {},
            errors: {
                award_id: "",
                password: "",
                nickname: "",
                phone: "",
                email: "",
            },
            submitLogin: false,
            btnDisable: true,
            errorMessage: "",
            drawOptions: [],
        };
    },
    created() {
        getDrawOptions().then((res) => {
            this.drawOptions = res.result;
        });
    },
    methods: {
        submitForm() {
            // 先清空表单错误提示
            this.errors = {};
            this.submitLogin = true;
            // 设置手动接管message提示
            this.$store.dispatch("MessageTake", true);
            this.errorMessage = "";
           addDraw(this.mdl)
                    .then(() => {
                        // 关闭抽屉
                        this.handleCloseDrawer();
                        this.$Message.success(this.$i18n.t("HANDLE_SUCCESS"));
                        // 调用爷爷组件刷新数据
                        this.$parent.$parent.fetch();
                    })
                    .catch((error) => {
                        // 后端过来的表单错误回显
                        this.errors = Object.assign(
                            {},
                            { ...this.errors, ...error.errors }
                        );
                        // 手动处理错误
                        if (!error.errors) {
                            this.errorMessage = error.message;
                        }
                    })
                    .finally(() => {
                        this.submitLogin = false;
                    });
        },
    },
};
</script>

<style lang="less" scoped>
.body {
    padding-right: 25px;
}
/deep/ .el-checkbox__label {
    font-size: 12px;
}
</style>
