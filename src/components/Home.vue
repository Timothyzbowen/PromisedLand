<template>
  <el-container class="homeContainer">
    <!-- 菜单栏 -->
    <el-aside :width="isCollapse ? '65px' : '200px'">
      <h2 class="title">{{ isCollapse ? 'ZBW' : 'Promised Land' }}</h2>
      <el-menu
        class="elMenu"
        background-color="#333744"
        text-color="#fff"
        unique-opened
        :collapse="isCollapse"
        :collapse-transition="false"
        :default-active="active"
        @select="setActive"
      >
        <el-menu-item index="/welcome">
          <i class="el-icon-menu"></i>
          <span slot="title">新闻日历</span>
        </el-menu-item>
        <el-menu-item index="/music">
          <i class="el-icon-reading"></i>
          <span>精选歌单</span>
        </el-menu-item>
        <el-submenu index="1-1">
          <template slot="title">
						<i class="el-icon-star-off"></i>
						<span>我的收藏</span>
					</template>
        	<el-menu-item
						v-for="(item, i) in this.$store.state.myList"
						:key="item.id"
            :index="item.id"
						@click="showMyFavorite(item.name, item.id, i)"
          >
						<i class="el-icon-collection-tag" v-if="i > 0"></i>
						<i class="el-icon-circle-plus-outline" v-else></i>
						<span>{{ item.name }}</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!-- 主体区 -->
    <el-main>
      <!-- 金句及天气 -->
      <el-header>
        <el-row>
          <el-col :span="1">
            <i class="el-icon-s-fold toggleCollapse" v-if="!isCollapse" @click="toggle"></i>
            <i class="el-icon-s-unfold toggleCollapse" v-else @click="toggle"></i>
          </el-col>
          <el-col :span="11">
            <span class="bible">今日经文：你要保守你的心胜过保守一切。</span>
          </el-col>
          <el-col :span="11" class="weatherBox">
            <i class="el-icon-location"></i>
            <el-cascader
              v-model="city"
              :options="city_data"
              size="small"
              expandTrigger="hover"
              @change="handleChange"
              width="50px"
            ></el-cascader>
            <span class="weather">天气：</span>
            <i :class="weatherType[tempWeather.wea]"></i>
            <span>当前气温：</span>
            <el-tag v-if="tempWeather.tem.substring(0, city.length - 1) <= 35">{{ tempWeather.tem }}</el-tag>
            <el-tag v-else type="danger">{{ tempWeather.tem }}</el-tag>
            <span>PM2.5：</span>
            <el-tag v-if="tempWeather.air<= 151">{{ tempWeather.air }}</el-tag>
            <el-tag v-else type="danger">{{ tempWeather.air}}</el-tag>
          </el-col>
          <el-col :span="1">
            <i class="el-icon-switch-button shutDown" @click="logout"></i>
          </el-col>
        </el-row>
      </el-header>
      <el-main>
          <router-view :key="$route.fullPath"></router-view>
      </el-main>
      <!-- 播放器 -->
      <el-footer class="playerBox">
        <el-row>
          <!-- 播放按钮组 -->
          <el-col :span="3">
            <i class="el-icon-d-arrow-left" @click="playLast"></i>
            <i :class="audio.isPlaying | transPlayPause" @click="changeState"></i>
            <i class="el-icon-d-arrow-right" @click="playNext"></i>
          </el-col>
          <!-- 播放信息块 -->
          <el-col :span="17">
            <!-- 当前播放列表 -->
            <div class="songList" v-if="showList">
              <div class="songListInfo">
                <span>共{{ this.$store.state.currentSongList.length }}首</span>
                <div class="editList">
                  <i class="el-icon-folder-add"></i>
                  <span title="添加到我的歌单" @click="addCurrentSong('', currentSongList)">添加到我的歌单</span>
                  <el-divider direction="vertical"></el-divider>
                  <i class="el-icon-delete"></i>
                  <span @click="clearList">清空</span>
                  <i class="el-icon-close" @click="showList = false"></i>
                </div>
              </div>
              <el-table
                class="allSongs"
                size="mini"
                :data="this.$store.state.currentSongList"
                stripe
                :show-header="false"
                style="width: 100%"
                :cell-style="cellStyle"
              >
                <el-table-column width="20">
                  <template slot-scope="scope">
                    <i class="el-icon-caret-right" v-if="scope.$index == choosenRow"></i>
                  </template>
                </el-table-column>
                <el-table-column label="歌曲名" width="500">
                  <template slot-scope="scope">
                    <span @click="playSong(scope.$index, scope.row)">{{ scope.row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="歌手">
                  <template slot-scope="scope">
                    <span
                      @click="querySinger(scope.$index, scope.row.singerId)"
                    >{{ scope.row.singer }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <i class="el-icon-delete" @click="deleteSong(scope.$index, scope.row)"></i>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <!-- 播放信息 -->
            <div v-if="showPlayInfo" class="mainInfo">
              <img :src="this.$store.state.song.cover" alt />
              <div class="songBox">
                <div class="songTitle">
                  <span>{{ this.$store.state.song.title }}</span>
                  <i
                    :class="playType[flag].icon"
                    :title="playType[flag].type + '(s)'"
                    @click="chageRepeatWay"
                  ></i>
                  <i
                    class="el-icon-folder-add"
                    title="添加到我的歌单"
                    @click="addCurrentSong('', currentSong)"
                  ></i>
                </div>
                <div class="singer">
                  <span>{{calTime(audio.currentTime)}}</span>
                  <div>
                    <a>{{ this.$store.state.song.singer }}</a>-
                    <a>{{ this.$store.state.song.name }}</a>
                  </div>
                  <span>{{calTime(audio.totalTime)}}</span>
                </div>
                <el-slider
                  v-model="audio.currentTime"
                  :max="audio.totalTime"
                  :format-tooltip="calTime"
                  @change="setTime"
                ></el-slider>
              </div>
            </div>
            <!-- 空白区 -->
            <div v-else class="cover">
              <img src="./01.jpg" alt />
            </div>
          </el-col>
          <!-- 音量按钮 -->
          <el-col :span="4">
            <i class="el-icon-s-grid" @click="showList = !showList"></i>
            <div class="audio">
              <i class="icon-volume-high"></i>
              <el-slider
                v-model="audio.volume"
                :max="1"
                @change="setVol"
                :step="0.01"
                :format-tooltip="val => parseInt(val*100)"
              ></el-slider>
            </div>
          </el-col>
        </el-row>
      </el-footer>
    </el-main>
    <audio
      ref="audio"
      style="display:none"
      @pause="onPause"
      @play="onPlay"
      autoplay
      @canplay="onPlay"
      @ended="onEnded"
      @timeupdate="onTimeupdate"
      @loadedmetadata="onLoadedmetadata"
      :loop="this.$store.state.flag === 2 || this.$store.state.currentSongList.length === 1"
      :src="this.$store.state.songUrl"
      controls="controls"
    ></audio>
    <!-- 添加到歌单 -->
    <el-dialog
      class="addMylist"
      title="添加到我的歌单"
      :visible.sync="this.$store.state.dialogVisible"
      width="30%"
      :before-close="handleClose"
    	>
      <ul v-if="!this.$store.state.isnewList">
        <li v-for="(item, i) in this.$store.state.myList" :key="i" @click="addAllToMyList(item, i)">
          <img :src="require('./'+ item.cover + '.jpg')" alt />
          <span>{{ item.name }}</span>
        </li>
      </ul>
      <div class="newListBox" v-else>
        <el-input placeholder="输入新歌单名称" v-model="newListName"></el-input>
        <div>
          <el-button @click="creatList">确认</el-button>
          <el-button @click="handleClose">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import city_data from "./city_data.js";
export default {
  created() {
    this.getWeather();
  },
  beforeMount() {
    if ( JSON.parse(localStorage.getItem('lastSong')) ) {
      this.$store.commit('playSong', JSON.parse(localStorage.getItem('lastSong')));
      this.$store.commit('addSong', JSON.parse(localStorage.getItem('lastSong')));
    }
    if ( JSON.parse(localStorage.getItem('myFavorite')) ) { 
      this.$store.commit('changeMyList', JSON.parse(localStorage.getItem('myFavorite')));
    }
  },
  data() {
    return {
      isCollapse: false,
      city_data,
      city: ["湖北省", "武汉市", "武昌区"],
      queryInfo: {
        appid: "97286449",
        appsecret: "f2Tys05B",
        city: "",
      },
      tempWeather: {},
      weatherType: {
        雨: "el-icon-heavy-rain",
        晴: "el-icon-sunny",
        多云: "el-icon-cloudy",
      },
      audio: {
        isPlaying: false,
        currentTime: 0,
        totalTime: 0,
        volume: 0.5,
      },
      playType: [
        { type: "顺序", icon: "el-icon-refresh" },
        { type: "随机", icon: "icon-shuffle" },
        { type: "单曲循环", icon: "icon-loop" },
      ],
      flag: 0,
      isPlaying: false,
      showList: false,
      newList: false,
      newListName: "",
      currentSong: this.$store.state.currentSongList[this.$store.state.songIndex],
    };
  },
  methods: {
    setActive(index, path) {
      sessionStorage.setItem('active', index)
      if (index == '/welcome') this.$router.push('/welcome');
      if (index == '/music') this.$router.push('/hotlist');
    },
    showMyFavorite(name, id, index) {
      sessionStorage.setItem("active", id)
			if (id === '100') {
        this.$store.commit('showDialog');
			} else {
        this.$store.commit("changeCurrentMyList", index);
        this.$router.replace(`/list/${name}/favorite`);
			}
    },
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    toggle() {
      this.title = "ZBW";
      this.isCollapse = !this.isCollapse;
    },
    handleChange() {
      let city = this.city[this.city.length - 2];
      this.queryInfo.city = city.substring(0, city.length - 1);
      this.getWeather();
    },
    async getWeather() {
      const { data: res } = await this.$http.get("https://www.tianqiapi.com/api/", { params: this.queryInfo });
			let todayWea = res.data[0];
			todayWea.wea  = todayWea.wea.search("雨") !== -1 ? "雨" : todayWea.wea.search("晴") !== -1 ? "晴" : todayWea.wea.search("多云") !== -1 ? "多云" : "多云"
      this.tempWeather = todayWea;
    },
    changeState() {
      if (this.$store.state.currentSongList.length !== 0) {
        this.$store.commit("getSongUrl");
        this.audio.volume = this.$refs.audio.volume;
        this.audio.isPlaying ? this.$refs.audio.pause() : this.$refs.audio.play();
      }
    },
    onTimeupdate(res) {
      this.audio.currentTime = res.target.currentTime;
    },
    onLoadedmetadata(res) {
      this.audio.totalTime = res.target.duration;
    },
    onPause() {
      this.$refs.audio.pause();
      this.audio.isPlaying = false;
    },
    onPlay() {
      this.$refs.audio.play();
      this.audio.isPlaying = true;
      localStorage.setItem('lastSong', JSON.stringify(this.$store.state.song))
    },
    onEnded() {
      this.$store.commit("nextSong");
      this.$store.commit("getSongInfo");
      this.$store.commit("getSongUrl");
    },
    calTime(time) {
      let m = Math.floor((time % 3600) / 60);
      let s = Math.floor(time % 60);
      return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
    },
    setTime(newTime) {
      this.$refs.audio.currentTime = newTime;
    },
    setVol(newVol) {
      this.$refs.audio.volume = newVol;
    },
    playNext() {
      this.$store.commit("nextSong");
      if (this.flag !== 3) {
        this.$store.commit({
          type: "changeFlag",
          flag: 3,
        });
      }
      this.$store.commit("getSongInfo");
      this.$store.commit("getSongUrl");
      this.$store.commit({
        type: "changeFlag",
        flag: this.flag,
      });
    },
    playLast() {
      this.$store.commit("lastSong");
      this.$store.commit("getSongInfo");
      this.$store.commit("getSongUrl");
    },
    chageRepeatWay() {
			this.flag = this.flag === 2 ? 0 : this.flag + 1
      this.$store.commit({
        type: "changeFlag",
        flag: this.flag,
      });
    },
    playSong(index, row) {
			this.choosenRow = index;
			this.$store.dispatch({
            type: 'playSong',
						index,
						flag: 3,
        });
      this.$store.commit({
        type: "changeSongIndex",
        index,
      });
      this.$store.commit({
        type: "changeFlag",
        flag: 3,
      });
      this.$store.commit("clearCurrentSong");
      this.$store.commit("getSongInfo");
      this.$store.commit("getSongUrl");
      this.$store.commit({
        type: "changeFlag",
        flag: this.flag,
      });
    },
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (
        (rowIndex == this.$store.state.songIndex && columnIndex === 1) ||
        (rowIndex == this.$store.state.songIndex && columnIndex === 2)
      ) {
        return "color:red";
      }
    },
    deleteSong(index, row) {
      if (this.$store.state.currentSongList.length > 1) {
        this.$store.commit({
          type: "deletecurrentSongList",
          index,
        });
        this.$store.commit({
          type: "changeFlag",
          flag: 3,
        });
        this.$store.commit("getSongInfo");
        this.$store.commit("getSongUrl");
        this.$store.commit({
          type: "changeFlag",
          flag: this.flag,
        });
        this.choosenRow = this.$store.state.songIndex;
      } else {
        this.clearList();
      }
    },
    clearList() {
      this.$store.commit("clearCurrentSongList");
      this.onPause();
      this.$refs.audio.src = "";
      this.showList = !this.showList;
    },
    querySinger(index, singerId) {
      this.$store.commit({
        type: "queryDetail",
        string: "singer",
        id: singerId,
      });
    },
    handleClose() {
      this.$store.commit("showDialog");
      this.$store.commit("changeNewList", false);
      this.$store.commit("clearNewSongs");
    },
    addAllToMyList(list, i) {
      let newName = this.newListName;
      if (i == 0) {
        this.$store.commit("changeNewList", true);
        this.newListName = "";
      } else {
        this.$store.commit({
          type: "addToMyList",
          index: i,
        });
        this.$store.commit("changeNewList", false);
        this.$store.commit("showDialog");
        this.$message.success('成功添加至歌单');
      }
      localStorage.setItem('myFavorite', JSON.stringify(this.$store.state.myList))
    },
    creatList() {
      this.$store.commit({
        type: "creatList",
        name: this.newListName,
      });
      this.$store.commit("changeNewList", false);
      this.$store.commit("clearNewSongs");
      localStorage.setItem('myFavorite', JSON.stringify(this.$store.state.myList))
    },
    addCurrentSong(index, song) {
      this.$store.commit("clearNewSongs");
			let temp = [];
      if (!Array.isArray(song)) {
        temp.push(song);
      } else {
        temp = song;
      }
      temp.forEach((item) => {
        this.$store.commit({
          type: "addList",
          song: item,
        });
      });
      this.$store.commit("showDialog");
    },
  },
  computed: {
    active() {
      return sessionStorage.getItem('active') || '/welcome'
    },
    progress() {
      return parseInt(this.audio.currentTime / this.audio.totalTime) * 100;
    },
    showPlayInfo() {
      return this.$store.state.currentSongList.length == 0 || this.$store.state.song === {} ? false : true;
    },
    choosenRow() {
      return this.$store.state.songIndex;
    },
    currentSongList() {
      return this.$store.state.currentSongList;
    },
  },
  filters: {
    transPlayPause(val) {
      return val ? "el-icon-video-pause" : "el-icon-video-play";
    },
  },
  beforeDestroy() {
    
  },
};
</script>

<style lang="less" scoped>
.title {
  color: #fff;
  text-align: center;
  height: 60px;
  line-height: 60px;
  margin: 0;
}
.homeContainer {
  height: 100%;
}
.el-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ebeef5;
  .el-header {
    border-bottom: 1px solid #ebeef5;
    .el-row {
      padding: 0;
      width: 100%;
      display: flex;
      align-content: center;
      align-items: center;
      .el-col {
        display: flex;
        align-content: center;
        align-items: center;
        .bible {
          margin: auto;
        }
        .shutDown {
          margin: auto;
        }
      }
      .weatherBox {
        .el-icon-location {
          font-size: 22px;
          color: red;
        }
        .el-cascader {
          margin-left: 5px;
        }
        span {
          margin-left: 15px;
        }
        .el-tag {
          margin: 0;
        }
      }
    }
    background-color: #fff;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .toggleCollapse {
      color: black;
      text-align: center;
      font-size: 22px;
      line-height: 22px;
      cursor: pointer;
    }
    .el-icon-switch-button {
      font-size: 22px;
      font-weight: 700;
      cursor: pointer;
    }
  }
  .el-main {
    flex: 1;
  }
}
.playerBox {
  min-width: 1200px;
  width: 100%;
  height: 70px !important;
  background-color: #fff;
  > .el-row {
    > .el-col:nth-of-type(1) {
      font-size: 30px;
      height: 70px;
      padding: 0 30px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      align-content: center;
      i:hover {
        cursor: pointer;
      }
    }
    > .el-col:nth-of-type(2) {
      .mainInfo {
        display: flex;
        background-color: #f2f2f2;
        img {
          height: 70px;
          width: 70px;
          display: block;
        }
        .songBox {
          padding: 3px 0;
          flex: 1;
          display: flex;
          overflow: hidden;
          flex-direction: column;
          .songTitle {
            margin: 0 10px;
            text-align: center;
            height: 20.8px;
            position: relative;
            i {
              cursor: pointer;
              color: grey;
              &:hover {
                color: black;
              }
              position: absolute;
              &:nth-of-type(1) {
                right: 0;
              }
              &:nth-of-type(2) {
                right: 20px;
              }
            }
          }
          .singer {
            margin: 0 10px;
            display: flex;
            align-items: center;
            font-size: 13px;
            flex: 1;
            > div {
              flex: 1;
              text-align: center;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            span {
              width: 50px;
              &:nth-of-type(2) {
                text-align: right;
              }
            }
          }
          .el-slider {
            margin: 0 20px;
            /deep/ .el-slider__runway {
              margin: 6px 0;
            }
            /deep/ .el-slider__button {
              width: 2px;
              background-color: black;
              border: 0;
              border-radius: 0;
            }
          }
        }
      }
      .cover {
        display: flex;
        justify-content: center;
        img {
          height: 70px;
        }
      }
      position: relative;
      .songList {
        width: 100%;
        height: 300px;
        position: absolute;
        background-color: #fff;
        top: -300px;
        z-index: 999;
        .songListInfo {
          height: 30px;
          display: flex;
          align-items: center;
          font-size: 14px;
          justify-content: space-between;
          > span {
            font-size: 14px;
            margin-left: 10px;
          }
          .editList {
            width: 30%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            span:hover,
            i:hover {
              cursor: pointer;
            }
          }
        }
        .el-table {
          .el-icon-caret-right {
            color: red;
          }
          height: 270px;
          overflow: auto;
          span:hover,
          /deep/ .el-table_1_column_3:hover {
            cursor: pointer;
          }
          /deep/ .el-table_1_column_4 {
            &:hover {
              cursor: pointer;
            }
            text-align: right;
            padding-right: 10px;
          }
        }
      }
    }
    > .start {
      height: 70px;
      display: flex;
      justify-items: center;
      background-color: #f2f2f2;
      div {
        display: flex;
        justify-content: center;
        flex: 1;
        img {
          display: block;
          width: 70px;
        }
      }
    }
    > .el-col:nth-of-type(3) {
      height: 70px;
      font-size: 16px;
      padding: 0 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      > i {
        display: flex;
        flex: 1;
      }
      .audio {
        display: flex;
        flex: 4;
        justify-content: space-between;
        align-items: center;
        font-size: 16px;
        height: 70px;
        > i {
          display: flex;
          flex: 1;
        }
        .el-slider {
          display: flex;
          flex: 4;
          margin-left: 10px;
        }
      }
    }
  }
}
.el-aside {
  background-color: #333744;
}

.elMenu {
  border-right: none;
}
.iconfont {
  margin-right: 10px;
}
.el-tag {
  margin-left: 10px;
  margin-top: 10px;
}
.addMylist {
  ul {
    display: flex;
    flex-flow: column nowrap;
    padding-bottom: 10px;
    li {
      &:hover {
        cursor: pointer;
        background-color: rgb(235, 232, 232);
      }
      list-style: none;
      display: flex;
      align-items: center;
      margin-top: 10px;
      img {
        height: 50px;
        width: 50px;
        margin-right: 20px;
      }
    }
  }
  .newListBox {
    display: flex;
    flex-flow: column nowrap;
    div {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;
      .el-button {
        margin-left: 10px;
      }
    }
  }
}
</style>