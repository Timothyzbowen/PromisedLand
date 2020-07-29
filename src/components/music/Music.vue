<template>
  <el-container>
    <!-- 头部搜索栏 -->
    <el-header class="searchBox">
      <el-input
        placeholder="请输入歌手，歌曲名或专辑"
        v-model="searchInfo.keyWords"
        size="mini"
        clearable
        @clear="backRecommend"
        @change="search"
      >
        <el-button slot="append" icon="el-icon-search" @click="search" ></el-button>
      </el-input>
      <el-button plain v-if="showSearchResult" size="mini" @click="backRecommend" >返回</el-button>
    </el-header>
    <!-- 推荐歌单 -->
    <el-main>
      <router-view v-if="!showSearchResult"></router-view>

      <div v-else>
        <el-table :data="searchResult" stripe style="width: 100%">
          <el-table-column prop="name" label="歌曲名" width="580">
            <template slot-scope="scope">
              <span @click="play(scope.$index, scope.row.id)">{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="singer" label="歌手" width="300">
            <template slot-scope="scope">
              <span @click="querySinger(scope.$index, scope.row.singerId)">{{ scope.row.singer }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="album" label="专辑名" width="300">
            <template slot-scope="scope">
              <span @click="queryAlbum(scope.$index, scope.row.albumId)">{{ scope.row.album }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template slot-scope="scope">
              <div>
                <i class="el-icon-plus" @click="add(scope.$index, scope.row.id)"></i>
                <i class="el-icon-folder-add" @click="addToList(scope.$index, scope.row)"></i>
                <i class="el-icon-link"></i>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="searchInfo.pageNum"
          :page-sizes="[10, 30, 50, 100]"
          :page-size="searchInfo.limit"
          layout="total, sizes, prev, pager, next, jumper"
          :total="songTotal"
        ></el-pagination>
      </div>
    </el-main>
  </el-container>
</template>
<script>
export default {
  created() {
  },
  data() {
    return {
      activeName: "first",
      musicList: [],
      offset: 1,
      loading: false,
      flag: -1,
      //当前播放歌曲信息
      song: {
        //显示第一行的名字
        title: "",
        singer: "",
        //显示在名字后的标题
        name: "",
        cover: "",
        url: "",
      },
      songsList: [],
      searchResult: [],
      showSearchResult: false,
      showTabs: true,
      showSearchResult: false,
      searchInfo: {
        keyWords: "",
        pageNum: 1,
        limit: 30,
      },
      songTotal: 0,
      songNum: 0,
    };
  },
  computed: {
    disabled() {
      return this.loading;
    },
    mouseover() {
      return this.flag;
    },
  },
  methods: {
    handleClick() {},
    handleSizeChange(size) {
      this.searchInfo.limit = size;
      this.search();
    },
    handleCurrentChange(pageNum) {
      this.searchInfo.pageNum = pageNum;
      this.search();
    },
    backRecommend() {
      this.showSearchResult = !this.showSearchResult;
      this.searchInfo.keyWords = "";
    },
    async search() {
      this.searchResult = [];
      const { data: res } = await this.$http.get(
        `http://localhost:3000/search?keywords=${
          this.searchInfo.keyWords
        }&limit=${this.searchInfo.limit}&offset=${
          (this.searchInfo.pageNum - 1) * 30
        }`
      );
      console.log(res);
      this.songTotal = res.result.songCount;
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
      this.showSearchResult = true;
    },
    play(index) {
      //1.将点击的单曲进行存储
    	let oldLength = this.$store.state.currentSongList.length;
      console.log(oldLength);
      this.$store.commit("addSong", this.searchResult[index]);
      let newLength = this.$store.state.currentSongList.length;
      console.log(newLength);
      //2.播放
      if (oldLength == newLength) {
        this.$store.commit("getSongInfo");
        this.$store.commit("getSongUrl");
      } else {
        let position = this.$store.state.currentSongList.length - 1;
        console.log(position);
        this.$store.commit({
          type: "changeSongIndex",
          index: position,
        });
        this.$store.commit("getSongInfo");
        this.$store.commit("getSongUrl");
      }
    },
    querySinger(index, singerId) {
      this.$store.commit({
        type: "queryDetail",
        string: "singer",
        id: singerId,
      });
    },
    async queryAlbum(index, albumId) {
      this.$store.commit({
        type: "queryDetail",
        string: "album",
        id: albumId,
      });
    },
    add(index) {
      this.$store.commit("addSong", this.searchResult[index]);
      this.$store.commit("getSongInfo");
      this.$message.success("添加至当前播放列表");
    },
    addToList(index, song) {
      this.$store.commit("clearNewSongs");
      let temp = [];
      if (!Array.isArray(song)) {
        temp.push(song);
      } else {
        temp = song;
      }
      console.log(temp);
      temp.forEach((item) => {
        this.$store.commit({
          type: "addList",
          song: item,
          id: item.id,
        });
      });
      this.$store.commit("showDialog");
    },
  },
};
</script>
<style lang='less' scoped>
.el-container {
  height: 90%;
  .el-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px !important;
    .el-input {
      width: 300px;
    }
  }
  background-color: #fff;
  .el-main {
    height: calc(100% - 180px);
    .el-pagination {
      margin-top: 10px;
      display: flex;
      justify-content: center;
    }
  }
  .el-table {
    padding: 20px 20px;
    span:hover {
      cursor: pointer;
    }
    i {
      margin-right: 10px;
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>