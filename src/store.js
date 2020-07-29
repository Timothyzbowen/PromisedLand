import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from './router'
import _ from 'lodash'
Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		currentSongList: [],
		isFirstTime: true,
		song: {},
		songUrl: '',
		songIndex: 0,
		flag: 0,
		myList: [
			{ name: '新建歌单', cover: 'mycover', id: '100'}
		],
		newList: {
			name: '',
			songs: [],
			cover: 'mycover'
		},
		tempSong: {},
		dialogVisible: false,
		isnewList: false,
		currentMyList: 0,
	},
	mutations: {
		delFavorite(state, payload) {
			state.myList.splice(state.currentMyList, 1)
		},
		delSong(state, payload) {
			state.myList[state.currentMyList].songs.splice(payload.index, 1)
		},
		changeCurrentMyList(state, payload) {
			state.currentMyList = payload
		},
		changeNewList(state, payload) {
			state.isnewList = payload
		},
		showDialog(state) {
			state.dialogVisible = !state.dialogVisible
		},
		creatList(state, payload) {
			state.newList.id = (state.myList.length + 100).toString()
			state.newList.name = payload.name
			let data = _.cloneDeep(state.newList)
			state.myList.push(data)
			state.dialogVisible = false
		},
		clearCurrentSong(state, payload) {
			state.songUrl = ''
		},
		clearNewSongs(state) {
			state.newList.songs = []
		},
		clearNewName(state) {
			state.newList.name = ''
		},
		addList(state, payload) {
			state.newList.songs.push(payload.song)
		},
		addToMyList(state, payload) {
			state.newList.songs.forEach((ele, i) => {
				let result = state.myList[payload.index].songs.findIndex((item, index) => item.id == ele.id)
				if (result != -1) {
					state.newList.songs.splice(i, 1)
				}
			})
			state.myList[payload.index].songs.push(...state.newList.songs)
			localStorage.setItem('myFavorite', JSON.stringify(state.myList))
		},
		changeMyList(state, payload) {
			state.myList = payload
		},
		changeCurrentSongList(state, payload) {
			state.currentSongList = payload
		},
		deletecurrentSongList(state, payload) {
			state.currentSongList.splice(payload.index, 1)
			if (payload.index < state.songIndex) {
				state.songIndex--
			}
		},
		clearCurrentSongList(state) {
			state.currentSongList = []
			state.song = {}
		},
		changeFirstTime(state, payload) {
			state.isFirstTime = false
		},
		playSong(state, payload) {
			state.song = payload
		},
		async addSong(state, payload) {
			if (state.currentSongList.length !== 0) {
				let position = state.currentSongList.findIndex((item, index) => item.id === payload.id)
				if (position == -1) {
					state.currentSongList.push(payload)
				} else {
					state.songIndex = position
				}
			} else {
				state.currentSongList.push(payload)
			}
		},
		changeSongIndex(state, payload) {
			state.songIndex = payload.index
		},
		changeFlag(state, payload) {
			state.flag = payload.flag
		},
		async getSongInfo(state, payload) {		
			let id = state.currentSongList[state.songIndex].id
			const { data: info } = await axios.get('/song/detail?ids=' + id)
			let songInfo = info.songs[0]
			let song = {}
			song.id = songInfo.id
			song.title = songInfo.name
			song.singer = JSON.parse(JSON.stringify(songInfo.ar))[0].name
			song.name = songInfo.al.name
			song.cover = songInfo.al.picUrl
			const { data: urlInfo } = await axios.get('/song/url?id=' + id)
			song.url = urlInfo.data[0].url
			state.song = song
		},	
		async getSongUrl(state, payload) {	
			let id = state.currentSongList[state.songIndex].id
			const { data: urlInfo } = await axios.get('/song/url?id=' + id)
			state.songUrl = urlInfo.data[0].url
		},
		nextSong(state, payload) {
			if (state.flag == 0 && JSON.stringify(state.song) != "{}") {
				if (state.songIndex == state.currentSongList.length - 1) {
					state.songIndex = 0
				} else {
					state.songIndex++
				}
			} else if (state.flag == 1 && state.currentSongList.length !== 1) {
				function test(num, range) {
					let newNum = Math.floor(Math.random() * range)
					return num === newNum ? test(num, range) : newNum
				}
				state.songIndex = test(state.songIndex, state.currentSongList.length)
			}
		},
		lastSong(state, payload) {
			state.songIndex--
		},
		queryDetail(state, payload) {
			router.push({ path: `/list/${payload.id}/${payload.string}` })
		}

	},
	actions: {

	}
})