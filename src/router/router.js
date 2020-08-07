import Vue from 'vue'
import VueRouter from 'vue-router'
import infiniteScroll from 'vue-infinite-scroll'

const Login = () => import(/* webpackChunkName:"login_home" */ '../views/Login.vue')
const Home = () => import(/* webpackChunkName:"login_home" */ '../views/Home.vue')
const Welcome = () => import(/* webpackChunkName:"welcome" */ '../components/Welcome.vue')
const Music = () => import(/* webpackChunkName:"music" */ '../components/music/Music.vue')
const Hotlist = () => import(/* webpackChunkName:"music" */ '../components/music/Hotlist.vue')
const List = () => import(/* webpackChunkName:"music" */ '../components/music/List.vue')

Vue.use(infiniteScroll)
Vue.use(VueRouter)
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/welcome',
    component: Home,
    children: [
      { path: '/welcome', component: Welcome },
      {
        path: '/music',
        component: Music,
        redirect: '/hotlist',
        children: [
          { path: '/hotlist', component: Hotlist },
          { path: '/list/:id/:type', component: List }
        ]
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
