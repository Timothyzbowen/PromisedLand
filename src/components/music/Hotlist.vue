<template>
  <div class="box">
    <!-- 热门歌单分类 -->
    <div class="title">
      <i class="el-icon-s-help"></i>
      <h3>热门推荐</h3>
      <template>
        <slot v-for="(item, i) in cateList.slice(0, 4)">
          <span
            :key="i"
            @click="getMusicList(item.playlistTag.name, i)"
            :style="isActive == i ? { color: activeColor, fontSize: fontSize + 'px' } : {}"
          >{{ item.playlistTag.name }}</span>
          <el-divider direction="vertical" v-if="i !== 3"></el-divider>
        </slot>
      </template>
    </div>
    <!-- 歌单列表 -->
    <el-main class="wrapper">
      <ul
        class="hotLists"
        v-infinite-scroll="getmore"
        infinite-scroll-disabled="disabled"
        :infinite-scroll-distance="10"
      	>
        <li v-for="(item, i) in musicList" :key="i">
          <div>
            <img
              :src="item.coverImgUrl"
              alt
              @mouseover="showBtn(i)"
              @mouseout="hideBtn(i)"
              @click="showDetails(item.id)"
            />
            <div
              :style="{ opacity: flag == i ? 1 : 0}"
              class="playBtn"
              :key="i"
              @mouseover="showBtn(i)"
              @mouseout="hideBtn(i)"
              @click.stop="playAlbum(item.id)"
            	>
              <i class="el-icon-video-play"></i>
            </div>
          </div>
          <p>{{ item.name }}</p>
        </li>
      </ul>
      <div v-if="loading">
        <i class="el-icon-loading"></i>
      </div>
    </el-main>
  </div>
</template>
<script>
export default {
  created() {
    this.getMusicList();
    this.getCateList();
  },
  data() {
    return {
      activeName: "first",
      musicList: [],
      offset: 1,
      loading: false,
      flag: -1,
      keyWords: "",
      song: {
        title: "",
        singer: "",
        name: "",
        cover: "",
        url: "",
      },
      songsList: [],
      searchResult: [],
      showSearchResult: false,
      cateList: [],
      activeColor: "",
      fontSize: 16,
      isActive: -1,
    };
  },
  computed: {
    disabled() {
      return this.loading;
    },
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get(
        "/playlist/hot"
      );
      this.cateList = res.tags;
    },
    handleClick() {},
    async getMusicList(cate = "全部", index) {
      this.isActive = index;
      this.activeColor = "red";
      this.fontSize = 20;
      const { data: res } = await this.$http.get(
        "/top/playlist?limit=30&cat=" + cate
      );
      this.musicList = res.playlists;
    },
    getmore() {
      this.loading = true;
      setTimeout(async () => {
        const { data: nres } = await this.$http.get(
          `/top/playlist?limit=5&order=hot&offset=${
            5 * (this.offset + 1)
          }`
        );
        this.musicList.push.apply(this.musicList, nres.playlists);
        this.offset++;
        this.loading = false;
      }, 1500);
    },
    showBtn(index) {
      this.flag = index;
    },
    hideBtn(id) {
      this.flag = -1;
    },
    async getListDetails(listId) {
      const { data: res } = await this.$http.get(
        `/playlist/detail?id=${listId}`
      );
      this.songsList = res.playlist.tracks;
      this.$store.commit("changeCurrentSongList", this.songsList);
    },
    async playAlbum(listId) {
      const { data: res } = await this.$http.get(
        `/playlist/detail?id=${listId}`
      );
			let songList = res.playlist.tracks;
			
      this.$store.commit("clearCurrentSongList");
      songList.forEach((item) => {
        let song = {
          id: item.id,
          name: item.name,
          singer: item.ar[0].name,
          singerId: item.ar[0].id,
          album: item.al.name,
          albumId: item.al.id,
        };
        this.$store.state.currentSongList.push(song);
			});
			this.$store.commit({type: "changeSongIndex", index: 0});
      this.$store.commit("getSongInfo");
      this.$store.commit("getSongUrl");
    },
    async search() {
      this.searchResult = [];
      const { data: res } = await this.$http.get(
        `/search?keywords=${this.keyWords}`
			);
			
      let songlist = res.result.songs;
      songlist.forEach((item) => {
        let song = {
          id: item.id,
          name: item.name,
          singer: item.artists[0].name,
          singerId: item.artists[0].id,
          album: item.album.name,
          albumId: item.album.id,
        };
        this.searchResult.push(song);
			});
			
      this.showList = false;
      this.showSearchResult = true;
    },
    showDetails(id, url, name) {
      this.$router.push({ path: `/list/${id}/${"hotlist"}` });
    },
  },
};
</script>

<style lang='less' scoped>
.box {
  height: 100%;
}
.title {
  display: flex;
  width: 80%;
  height: 40px;
  margin: 0 auto;
  align-items: center;
  padding: 0;
  > i {
    color: red;
    font-size: 30px;
    padding-right: 10px;
  }
  span {
    margin-left: 10px;
    transition: all 0.5s;
    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  }
}
.wrapper {
  height: calc(100% - 40px);
  overflow: auto;
  > div {
    text-align: center;
  }
}
.hotLists {
  margin: 0 auto;
  margin-top: 10px;
  display: flex;
  width: 80%;
  flex-flow: row wrap;
  justify-content: center;
  li {
    margin: 0 10px;
    flex: 0 1 calc(20% - 20px);
    display: flex;
    flex-flow: column wrap;
    img {
      width: 100%;
      &:hover {
        cursor: pointer;
      }
    }
    p {
      margin-top: 5px;
      font-size: 14px;
      &:hover {
        cursor: pointer;
      }
    }
    > div {
      position: relative;
      .playBtn {
        opacity: 0;
        transition: all 2s;
        position: absolute;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: gray;
        position: absolute;
        right: 0;
        bottom: 5px;
        transition: all 1s;
        text-align: center;
        font-size: 30px;
        line-height: 30px;
        color: white;
        &:hover {
          background-color: red;
          cursor: pointer;
        }
      }
    }
  }
}
</style>