<template>
  <div>
		<!-- 信息栏 -->
    <div class="titleBox">
      <img :src="cover" alt />
      <div class="title">
        <h3>{{title}}</h3>
        <div class="editBtns">
          <div>
            <el-button size="small" icon="el-icon-caret-right" @click="playAll">播放全部</el-button>
            <el-button size="small" class="add" @click="addList">+</el-button>
          </div>
          <el-button icon="el-icon-folder-add" size="small" @click="addToMyFavorite('',listData)">添加到我的歌单</el-button>
          <el-button icon="el-icon-delete" size="small" @click="delFavorite" v-if="myFavorite">删除歌单</el-button>
        </div>
      </div>
    </div>
		<!-- 歌曲列表 -->
    <el-table :data="listData" stripe style="width: 100%">
      <el-table-column prop="name" :label="'歌曲名(' + listData.length + ')'" width="580">
        <template slot-scope="scope">
          <span @click="play(scope.$index, scope.row.id)">{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="singer" label="歌手" width="300">
        <template slot-scope="scope">
          <span @click="querySinger(scope.row.singerId)">{{ scope.row.singer }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="album" label="专辑名" width="300">
        <template slot-scope="scope">
          <span @click="queryAlbum(scope.row.albumId)">{{ scope.row.album }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <div>
            <i class="el-icon-plus" @click="addToCurrentList(scope.$index, scope.row.id)"></i>
            <i class="el-icon-folder-add" @click="addToMyFavorite(scope.$index, scope.row)"></i>
            <i class="el-icon-delete" v-if="myFavorite" @click="delSong(scope.$index, scope.row)"></i>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  beforeCreate() {
    this.$store.commit('changeCurrentMyList', JSON.parse(sessionStorage.getItem('currentMyList')))
  },
  created() {
    this.getlist();
  },
  beforeMount() {
    sessionStorage.setItem('listData', JSON.stringify(this.listData))
  },
  data() {
    return {
      listData: [],
      title: "",
      cover: "",
      song: {
        title: "",
        singer: "",
        name: "",
        cover: "",
        url: "",
      },
      myFavorite: false,
    };
  },
  methods: {
    async getlist() {
      let list = {};
      if (this.$route.params.type === "hotlist") {
        this.myFavorite = false;
        const { data: res } = await this.$http.get(
          "http://localhost:3000/playlist/detail?id=" + this.$route.params.id
        );
        this.title = res.playlist.name;
        this.cover = res.playlist.coverImgUrl;
        res.playlist.tracks.forEach((item) => {
          let song = {
            id: item.id,
            name: item.name,
            singer: item.ar[0].name,
            singerId: item.ar[0].id,
            album: item.al.name,
            albumId: item.al.id,
          };
          this.listData.push(song);
        });
        console.log(this.listData);
      } else if (this.$route.params.type === "singer") {
        this.querySinger(this.$route.params.id);
      } else if (this.$route.params.type === "album") {
        this.queryAlbum(this.$route.params.id);
      } else if (this.$route.params.type === "favorite") {
        this.myFavorite = true;
        console.log(
          this.$store.state.currentMyList
        )
        this.listData = this.$store.state.myList[
          this.$store.state.currentMyList
        ].songs;
        this.cover = require("@/assets/" +
          this.$store.state.myList[this.$store.state.currentMyList].cover +
          ".jpg");
        this.title = this.$route.params.id;
      }
      sessionStorage.setItem('listData', JSON.stringify(this.listData))
    },
    async queryAlbum(albumId) {
      this.myFavorite = false;
      this.listData = [];
      const { data: res } = await this.$http.get(
        "http://localhost:3000/album?id=" + albumId
      );
      this.title = res.album.name;
      this.cover = res.album.picUrl;
      res.songs.forEach((item) => {
        let song = {
          id: item.id,
          name: item.name,
          singer: item.ar[0].name,
          singerId: item.ar[0].id,
          album: item.al.name,
          albumId: item.al.id,
        };
        this.listData.push(song);
      });
    },
    async querySinger(singerId) {
      this.myFavorite = false;
      this.listData = [];
      const { data: res } = await this.$http.get(
        "http://localhost:3000/artists?id=" + singerId
      );
      this.title = res.artist.name;
      this.cover = res.artist.picUrl;
      res.hotSongs.forEach((item) => {
        let song = {
          id: item.id,
          name: item.name,
          singer: item.ar[0].name,
          singerId: item.ar[0].id,
          album: item.al.name,
          albumId: item.al.id,
        };
        this.listData.push(song);
      });
    },
    playAll() {
      this.$store.commit("changeCurrentSongList", this.listData);
      this.$store.commit({
        type: "changeSongIndex",
        index: 0,
      });
      this.$store.commit("getSongInfo");
      this.$store.commit("getSongUrl");
    },
    play(index) {
      let oldLength = this.$store.state.currentSongList.length;
      this.$store.commit("addSong", this.listData[index]);
      let newLength = this.$store.state.currentSongList.length;
      if (oldLength == newLength) {
        this.$store.commit("clearCurrentSong");
        this.$store.commit("getSongInfo");
        this.$store.commit("getSongUrl");
      } else {
        let position = this.$store.state.currentSongList.length - 1;
        this.$store.commit({
          type: "changeSongIndex",
          index: position,
        });
        this.$store.commit("getSongInfo");
        this.$store.commit("getSongUrl");
      }
    },
    addList() {
      this.listData.forEach((item) => this.$store.commit("addSong", item));
      this.$store.commit("getSongInfo");
      this.$message.success("添加至当前播放列表");
    },
    addToCurrentList(index) {
      this.$store.commit("addSong", this.listData[index]);
      this.$store.commit("getSongInfo");
      this.$message.success("添加至当前播放列表");
    },
    addToMyFavorite(index, song) {
      this.$store.commit('clearNewSongs')
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
          id: item.id,
        });
      });
      this.$store.commit("showDialog");
    },
    delSong(i) {
      this.$store.commit({
        type: "delSong",
        index: i,
      });
      localStorage.setItem('myFavorite', JSON.stringify(this.$store.state.myList))
    },
    delFavorite() {
      this.$store.commit("delFavorite");
      localStorage.setItem('myFavorite', JSON.stringify(this.$store.state.myList))
      this.$router.replace(`/hotlist`);
    },
  },
};
</script>
<style lang='less' scoped>
.titleBox {
  display: flex;
  padding-left: 20px;
  justify-content: flex-start;
  img {
    width: 150px;
    height: 150px;
  }
  .title {
    margin-left: 20px;
    h3 {
      font-size: 35px;
      margin: 0;
    }
    display: flex;
    flex-flow: column nowrap;
    .editBtns {
      margin-top: 20px;
      display: flex;
      .add {
        margin-left: 0;
      }
      > .el-button {
        margin-left: 20px;
      }
    }
  }
}
.el-table {
  padding: 20px 20px;
  i {
    &:hover {
      cursor: pointer;
    }
    margin-right: 10px;
  }
  span:hover {
    cursor: pointer;
  }
}
</style>