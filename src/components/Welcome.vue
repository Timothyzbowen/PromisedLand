<template>
  <el-container>
    <el-row class="containerBox">
      <el-col class="leftCon">
        <el-tag>时事新闻</el-tag>
        <el-carousel indicator-position="outside" height="350px">
          <el-carousel-item v-for="(item, i) in newsImgs" :key="i">
            <a href="javascript: 0">
              <img class="newsimg" :src="item.url" alt />
            </a>
            <div class="newsInfo">
              <a href="javascript: 0">{{ item.info }}</a>
            </div>
          </el-carousel-item>
        </el-carousel>
        <el-tag>股票行情</el-tag>
        <div class="stock">
          <img :src="stockUrl" alt />
        </div>
      </el-col>
      <el-col class="rightCon">
        <el-tag>日历便签</el-tag>
        <el-row :gutter="20" type="flex" justify="start">
          <el-col :span="6">
            <el-date-picker
              v-model="dateValue"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </el-col>
          <el-col :span="8">
            <el-input v-model="todoThing"></el-input>
          </el-col>
          <el-col :span="6"></el-col>
          <el-col :span="4">
            <el-button icon="el-icon-edit" size="large" @click="addTodo">添加</el-button>
          </el-col>
        </el-row>

        <el-calendar height="300px">
          <template slot="dateCell" slot-scope="{date, data}">
            <div>
              <div class="calendar-day">{{ data.day.split('-').slice(2).join('') }}</div>
              <p class="todos">{{ dealDate(data.day) }}</p>
            </div>
          </template>
        </el-calendar>
      </el-col>
    </el-row>
  </el-container>
</template>
<script>
import city_data from "./city_data.js";
export default {
  created() {
    this.getStockUrl();
    this.timer = setInterval(() => this.getStockUrl(), 6000);
  },
  data() {
    return {
      todoList: [],
      timer: "",
      newsImgs: [
        {
          url: require("./images/01.jpg"),
          info: "江西婺源800年古桥被洪水损毁",
        },
        {
          url: require("./images/02.jpg"),
          info: "注意！全国启动“借道左转”车道，走错扣6分罚200元",
        },
        {
          url: require("./images/03.jpg"),
          info: "俄罗斯S500防空导弹即将服役 卫星飞机全能打",
        },
      ],
      dateValue: "",
      todoThing: "",
      stockUrl: "",
    };
  },
  methods: {
    getStockUrl() {
      this.stockUrl =
        "http://image.sinajs.cn/newchart/min/n/sh000001.gif?" +
        Math.floor(Math.random() * 10);
    },
    dealDate(day) {
      let res = "";
      if (JSON.parse(localStorage.getItem("todo"))) {
        this.todoList = JSON.parse(localStorage.getItem("todo"))
      }
      this.todoList.forEach((ele, i) => {
        if (ele.date == day) {
          res = res + ele.content + "\n";
        }
      });
      return res;
    },
    addTodo() {
      let thing = {};
      thing.date = this.dateValue;
      thing.content = this.todoThing;
      this.todoList.push(thing);
      localStorage.setItem("todo", JSON.stringify(this.todoList));
      this.dateValue = "";
      this.todoThing = "";
    },
  },
};
</script>

<style lang="less" scoped>
.containerBox {
  padding: 10px 10px;
  display: flex;
  .leftCon,
  .rightCon {
    flex: 1;
    width: 40%;
    background-color: #fff;
  }
  .leftCon {
    border-right: 2px dashed #ebeef5;
    .el-carousel {
      padding: 20px 20px;
    }
    .newsimg {
      width: 100%;
      height: 100%;
    }
    .newsInfo {
      width: 100%;
      height: 20px;
      padding: 5px 10px;
      position: absolute;
      bottom: 0;
      background-color: rgba(8, 8, 8, 0.4);
      a {
        text-decoration: none;
        color: #fff;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    &::after {
      content: "";
      height: 15px;
      width: 15px;
      border-radius: 8px;
      background-color: #ebeef5;
      position: absolute;
      right: 50%;
      top: 4px;
      transform: translateX(50%);
      z-index: 10;
    }
    &::before {
      content: "";
      height: 15px;
      width: 15px;
      border-radius: 8px;
      background-color: #ebeef5;
      position: absolute;
      right: 50%;
      bottom: 4px;
      transform: translateX(50%);
      z-index: 10;
    }
    .stock {
      padding: 10px;
      img {
        display: block;
        margin: 0 auto;
      }
    }
  }
  .rightCon {
    .el-row {
      margin-top: 20px;
      padding: 0 10px;
    }
    .todos {
      white-space: pre-wrap;
      font-size: 12px;
      text-align: center;
      color: orange;
    }
    .el-calendar {
      margin-top: 20px;
    }
  }
}

.iconfont {
  margin-right: 10px;
}
.el-tag {
  margin-left: 10px;
  margin-top: 10px;
}
</style>