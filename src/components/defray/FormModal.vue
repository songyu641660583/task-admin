<template>
    <div class="body">
        <el-form :model="mdl" ref="ruleForm" label-width="130px">
            <!--<el-form-item :label="$i18n.t('AMOUNT')" required :error="errors.amount">
                <el-input v-model="data.amount" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('AMOUNT') })"></el-input>
            </el-form-item>-->
            <el-form-item :label="$i18n.t('COUNTRY')" required :error="errors.country_id">
                <el-select v-model="data.country_id" :value="data.country_id">
                    <el-option v-for="(option, index) in countryList" :label="option.name_text" :value="option.id" :key="index"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item :label="$i18n.t('AMOUNT')" required :error="errors.amount">
                <el-input-number v-model="data.amount" controls-position="right" :min="0" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('AMOUNT') })"></el-input-number>
            </el-form-item>
            <el-form-item :label="$i18n.t('WITHDRAWAL_NAME')" required :error="errors.name">
                <el-input v-model="data.name" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('WITHDRAWAL_NAME') })"></el-input>
            </el-form-item>
            <el-form-item :label="$i18n.t('BANK_CODE')" required :error="errors.bank_code">
                <el-input v-model="data.bank_code" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('BANK_CODE') })"></el-input>
            </el-form-item>
            <el-form-item :label="$i18n.t('BANK_NAME')" required :error="errors.bank_name">
                <el-input v-model="data.bank_name" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('BANK_NAME') })"></el-input>
            </el-form-item>
            <el-form-item :label="$i18n.t('BANK_ACCOUNT')" required :error="errors.bank_account">
                <el-input v-model="data.bank_account" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('BANK_ACCOUNT') })"></el-input>
            </el-form-item>
            <!--<el-form-item :label="$i18n.t('OPEN_PROVINCE')" required :error="errors.open_province">
                <el-input v-model="data.open_province" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('OPEN_PROVINCE') })"></el-input>
            </el-form-item>
            <el-form-item :label="$i18n.t('OPEN_CITY')" required :error="errors.open_city">
                <el-input v-model="data.open_city" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('OPEN_CITY') })"></el-input>
            </el-form-item>-->
            <el-form-item :label="$i18n.t('USER_MOBILE')" required :error="errors.user_mobile">
                <el-input v-model="data.user_mobile" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('USER_MOBILE') })"></el-input>
            </el-form-item>
            <el-form-item :label="$i18n.t('USER_EMAIL')" required :error="errors.user_email">
                <el-input v-model="data.user_email" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('USER_EMAIL') })"></el-input>
            </el-form-item>
            <el-form-item :label="$i18n.t('ADDRESS')" required :error="errors.address">
                <el-input v-model="data.address" :placeholder="$i18n.t('PLEASE_INPUT', { value: $i18n.t('ADDRESS') })"></el-input>
            </el-form-item>
            <el-form-item :error="errors.submit">
                <el-button @click="submitForm" type="primary" :loading="submitLogin" >{{ $i18n.t('SUBMIT') }}</el-button>
                <el-button @click="handleCloseDrawer">{{ $i18n.t('CANCEL') }}</el-button>
            </el-form-item>
            <el-form-item v-if="errorMessage !== ''">
                <Alert type="error" show-icon>{{ errorMessage }}</Alert>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
    import { defray } from '@/api/defray'
    import { getCountryList } from '@/api/country'

    export default {
        name: 'formModal',
        props: {
            mdl: {
                type: Object,
                required: true
            },
            handleCloseDrawer: {
                type: Function,
                required: true
            }
        },
        watch: {
            /* mdl: {
                handler (newVal) {
                    console.log(newVal)
                    this.btnDisable = false
                },
                deep: true
            } */
        },
        data () {
            return {
                // 启用状态选项
                enableOptions: [
                    { label: this.$i18n.t('ENABLE'), value: 1 },
                    { label: this.$i18n.t('HIDDEN'), value: 0 }
                ],
                rules: {},
                errors: {
                    name: '',
                    title: '',
                    group: '',
                    type: '',
                    tips: '',
                    format: '',
                    user_mobile: '',
                    user_email: '',
                    address: ''
                },
                submitLogin: false,
                btnDisable: true,
                errorMessage: '',
                attributeVisible: false,
                data: {},
                countryList: []
            }
        },
        created () {
            getCountryList().then((res) => {
                this.countryList = res.result
            })
        },
        methods: {
            submitForm () {
                // 先清空表单错误提示
                this.errors = {}
                this.submitLogin = true
                // 设置手动接管message提示
                this.$store.dispatch('MessageTake', true)
                this.errorMessage = ''
                defray(this.data).then(() => {
                    // 关闭抽屉
                    this.handleCloseDrawer()
                    this.$Message.success(this.$i18n.t('HANDLE_SUCCESS'))
                    // 调用爷爷组件刷新数据
                    this.$parent.$parent.fetch()
                }).catch((error) => {
                    // 后端过来的表单错误回显
                    this.errors = Object.assign({}, { ...this.errors, ...error.errors })
                    // 手动处理错误
                    if (!error.errors) {
                        this.errorMessage = error.message
                    }
                }).finally(() => {
                    this.submitLogin = false
                })
            }
        }
    }
</script>

<style lang="less" scoped>
    .body {
        padding-right: 25px;
        width: 100%;
    }
    /deep/ .el-checkbox__label {
        font-size: 12px;
    }
</style>
