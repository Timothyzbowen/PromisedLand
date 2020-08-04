<template>
    <div class="login_container">
      <!-- 背景效果 -->
      <div class="bg">
        <div class="row1">
					<div class="circle1"></div>
					<div class="circle2"></div>
					<div class="circle3"></div>
				</div>
				<div class="row2">
					<div class="circle1"></div>
					<div class="circle2"></div>
					<div class="circle3"></div>
				</div>
				<div class="row3">
					<div class="circle1"></div>
					<div class="circle2"></div>
					<div class="circle3"></div>
				</div>
      </div>
      <!-- 登录框 -->
      <div class="login_box">
				<div class="avatar">
					<img src="../assets/logo.jpg" alt="">
				</div>
				<el-form ref="loginFormRef" label-width="0px" :model="loginForm" :rules="loginFormRules" class="login_form">
					<el-form-item prop="mobile">
						<el-input v-model="loginForm.mobile" prefix-icon="el-icon-user" placeholder="请输入手机号"></el-input>
					</el-form-item>
					<el-form-item prop="password">
						<el-input type="password" v-model="loginForm.password" prefix-icon="el-icon-lock" placeholder="请输入密码"></el-input>
					</el-form-item>
					<el-form-item class="login_btns">
						<el-button type="primary" @click="login">登录</el-button>
						<el-button type="info" @click="loginFormReset">重置</el-button>
					</el-form-item>
				</el-form>
			</div>
    </div>
</template>
<script>
export default {
	data () {
		var checkMobile = (rule, value, callback) => {
      // const regNum = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
      const regNum = /^1[3-9]\d{9}$/
      if (regNum.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的手机号码'))
      }
    }
		return {
			loginForm: {
				mobile: '',
				password: '',
			},
			loginFormRules: {
				mobile: [
					{ required: true, message: '请输入手机号', trigger: 'blur' },
					{ validator: checkMobile, trigger: 'blur' },
				],
				password: [
					{ required: true, message: '请输入密码', trigger: 'blur' },
				]
			}
		}
	},
	methods: {
		loginFormReset() {
			this.$refs.loginFormRef.resetFields()
		},
		login() {
			this.$refs.loginFormRef.validate(async valid => {
				if (!valid) return
				const { data: res } = await this.$http.get(`/login/cellphone?phone=${this.loginForm.mobile}&password=${this.loginForm.password}`)
				if (res.code !== 200) {
					this.$message.error({
						message: '登录失败',
						duration: 1000
					})
				} else {
					this.$message.success({
						message: '登录成功',
						duration: 1000
					})
					window.sessionStorage.setItem('token', res.token)
					this.$router.push('/welcome')
				}
			})
		}
	}
}
</script>
<style lang="less" scoped>
.row1, .row2, .row3 {
	position: relative;
	margin-top: 80px;
}
.row1 div, .row2 div, .row3 div {
	animation: move 30s linear infinite;
}
/*第一行*/
.row1 {
	height: 30px;
}
.row1 div {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	background: -webkit-linear-gradient(top, #FFF, #DEDEDE);
	position: absolute;
}
.row1 .circle1 {
	left: 200px;
	margin-top: 20px;
}
.row1 .circle2 {
	left: 600px;
	margin-top: 30px;
}
.row1 .circle3 {
	left: 1300px;
}
/*第二行*/
.row2 {
	height: 120px;
}
.row2 div {
	width: 120px;
	height: 120px;
	border-radius: 50%;
	background: -webkit-linear-gradient(top, #FFF, #DEDEDE);
	position: absolute;
}
.row2 .circle1 {
	left: 300px;
	margin-top: 30px;
}
.row2 .circle2 {
	left: 800px;
}
.row2 .circle3 {
	left: 1100px;
	margin-top: 60px;
}
/*第三行*/
.row3 {
	height: 240px;
}
.row3 div {
	width: 240px;
	height: 240px;
	border-radius: 50%;
	background: -webkit-linear-gradient(top, #FFF, #DEDEDE);
	position: absolute;
}
.row3 .circle1 {
	left: 120px;
}
.row3 .circle2 {
	left: 600px;
	margin-top: 50px;
}
.row3 .circle3 {
	left: 1200px;
}
/*动画组*/
@keyframes move {
	0% {
		transform: translateX(0) ;
	}
	50% {
		transform: translateX(-500px) rotate(3600deg);
	}
	100% {
		transform: translateX(0) ;
	}
}
    .login_container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        .bg {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: -2;
        }
	}
	.login_box {
		width: 450px;
		height: 300px;
		background-color: #fff;
		border-radius: 10px;
        position: absolute;
        box-shadow: 1px 5px 5px 1px #DEDEDE;
		left: 50%;
		top: 50%;
		transform: translate(-50%,-50%);
		.avatar {
			height: 100px;
			width: 100px;
			background: #fff;
			border-radius: 50%;
			padding: 10px;
			position: absolute;
			left: 50%;
			box-shadow: 0 0 5px #D8BFD8;
			transform: translate(-50%,-50%);
			img {
				display: block;
				width: 100%;
				border: 1px solid #D8BFD8;
				border-radius: 50%;
				background-color: #F5F5F5;
			}
		}
		.login_form {
			position: absolute;
			width: 90%;
			top: 70px;
			padding: 10px;
			box-sizing: border-box;
		}
		.login_btns {
			display: flex;
			justify-content: flex-end;
		}
	}

</style>