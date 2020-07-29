import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Music from '../components/music/Music.vue'
import Hotlist from '../components/music/Hotlist.vue'
import List from '../components/music/List.vue'
import infiniteScroll from 'vue-infinite-scroll'
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
