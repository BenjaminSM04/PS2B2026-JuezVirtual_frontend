import api from '@oj/api'

export default {
  data () {
    return {
      captchaSrc: ''
    }
  },
  methods: {
    validateForm (formName) {
      return new Promise((resolve, reject) => {
        this.$refs[formName].validate(valid => {
          if (!valid) {
            this.$error(this.$t('m.Please_validate_the_error_fields'))
          } else {
            resolve(valid)
          }
        })
      })
    },
    getCaptchaSrc () {
      api.getCaptcha().then(res => {
        this.captchaSrc = res.data.data
      })
    }
  }
}
