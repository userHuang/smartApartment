<template>
  <div class="home-page">
    <div class="header" v-if="!videoShow">
      <div class="system-name" @click="restData">
        <span class="logo"></span>
        <span class="title">智能户型设计推荐系统</span>
      </div>
      <div class="date-area">
        <!-- <div class="temperature">
          <span class="temp-value">-10</span>
          <span class="temp-unit"></span>
        </div>
        <span class="divide"></span> -->
        <span class="time">
          <local-date timeType="time"></local-date>
        </span>
        <div class="date">
          <span class="week">
            <local-date timeType="week"></local-date>
          </span>
          <span class="day-now">
            <local-date timeType="date" format="yy:mm:dd"></local-date>
          </span>
        </div>
      </div>
    </div>
    <video class="video" ref="videoPlayer" width="100%" muted autoplay="autoplay" @pause = "toPause" v-if="videoShow">
      <source :src="curVideo" type="video/mp4"/>
    </video>
    <div class="contain" v-if="!videoShow">
      <div class="step-1" v-if="curStep === '1'">
        <div class="img-border">
          <span class="add-img" v-if="!step1Img"></span>
          <span class="add-img-text" v-if="!step1Img">拖拽图片至此处</span>
          <img class="img" :src="step1Img" alt="" v-if="step1Img"/>
        </div>
        <div class="btn-action" :class="{'btn-action-active': step1Img}" @click="nextTo('2')"></div>
        <span class="text-tips">演示版本仅支持卫生间设计</span>
      </div>
      <div class="step-2" v-if="curStep === '2'">
        <div class="img-list">
          <div class="item-img" :class="`img-${index + 1}`" v-for="(item, index) in layoutList" :key="index">
            <img :src="item.layoutImage" alt="">
          </div>
        </div>
        <span class="action-btn action-btn-active" @click="nextTo('3')"></span>
      </div>
      <div class="step-3" v-if="curStep === '3'">
        <span class="step-title">选择喜欢的方案</span>
        <div class="img-contain">
          <div class="item-model" v-for="(item, inx) in imgList3" :key="item.num">
            <div class="item-img" v-for="(m, n) in item.effectPictureDtoList" :key="m.id">
              <img class="img" :src="m.imageUrl" alt="" @click="selectImg(inx, n)">
              <img class="icon" src="../assets/selected-icon.png" alt="" v-if="m.select">
            </div>
          </div>
        </div>
        <span class="action-btn action-btn-active" @click="nextTo('4')"></span>
      </div>
      <div class="step-4" v-if="curStep === '4'">
        <div class="img-show">
          <el-image class="img" :src="step4Img" alt="" :preview-src-list="[step4Img]"></el-image>
        </div>
        <div class="action-btn">
          <span class="similar-effect" @click="nextTo('5')"></span>
          <span class="back" @click="backTo('3')"></span>
        </div>
      </div>
      <div class="step-5" v-if="curStep === '5'">
        <div class="img-list">
          <div class="item-img" v-for="item in imgList4" :key="item">
            <el-image class="img" :src="item" alt="" :preview-src-list="imgList4"></el-image>
          </div>
        </div>
        <span class="back" @click="restData"></span>
      </div>
    </div>
  </div>
</template>

<script>
import LocalDate from '@/components/common/LocalDate'
import HomeServices from '@/services/home.js'
export default {
  components: {
    LocalDate
  },
  data () {
    return {
      videoShow: false,
      curStep: '1',
      curVideo: '',

      step1Img: '',
      step4Img: '',
      curIndex: '',
      layoutList: [],
      imgList4: [],
      imgList3: []
    }
  },
  created () {
    this.step1Img = ''
    this.queryStaticResource()
  },
  mounted () {
    // 连接选项
    const options = {
      clean: true, // true: 清除会话, false: 保留会话
      connectTimeout: 4000, // 超时时间
      // 认证信息
      clientId: 'NDwisdomLayout:' + Date.now(),
      username: 'NDwisdomLayoutUser', //连接用户名
      password: '123456',//连接密码，有的密码默认为public
      // 心跳时间
      keepalive: 60
    }

    // 连接字符串, 通过协议指定使用的连接方式
    const connectUrl = 'ws://121.41.40.88:8083/mqtt' //连接服务端地址，注意查看ws协议对应的端口号
    const client = mqtt.connect(connectUrl, options)

    client.on('connect', () => {
      console.log('连接成功')
      // 订阅多个主题
      client.subscribe(
        ['NDwisdomLayout/message/topic'], //主题
        { qos: 1 },  
        (err) => {
          console.log(err || '订阅成功')
        },
      );
      // 发布消息
      client.publish('tourist_enter', 'Hello EMQ X', (err) => {
        console.log(err || '发布成功')
      })
    })
    //失败重连
    client.on('reconnect', (error) => {
      console.log('正在重连:', error)
    })
    //连接失败
    client.on('error', (error) => {
      console.log('连接失败:', error)
    })
    //接收消息
    client.on('message', (topic, message) => {
      console.log('收到消息：', topic, message.toString())
      let data = message.toString()
      if (data) {
        data = JSON.parse(data)
        if (data.id) {
          this.queryLayoutDataByHouseType(data.id)
        }
      }
    })
  },
  methods: {
    show() {
      this.videoShow = true
      // this.$refs.videoPlayer.play()
    },
    toPause () {
      this.videoShow = false
    },
    backTo (value) {
      this.curStep = value
    },
    nextTo (value) {
      if (value === '2') {
        if (!this.step1Img) {
          // this.$message.error('暂无可设计的图片')
          return
        }
        this.getCurIndex(0)
        // this.curVideo = 'https://metaother.oss-cn-beijing.aliyuncs.com/nd-wisdom-layout/media/step1-2.ea5032d.mp4'
        this.curVideo = this.videoUrl_1_2
        this.show()
      }
      if (value === '3') {
        // if (this.curIndex === '') {
        //   // this.$message.error('请选择其中一种户型图')
        //   return
        // }
        // this.curVideo = 'https://metaother.oss-cn-beijing.aliyuncs.com/nd-wisdom-layout/media/step2-3.277204f.mp4'
        this.curVideo = this.videoUrl_2_3
        this.show()
      }
      if (value === '4') {
        // this.curVideo = 'https://metaother.oss-cn-beijing.aliyuncs.com/nd-wisdom-layout/media/step3-4.617272e.mp4'
        this.curVideo = this.videoUrl_3_4
        this.show()
        this.getRecommend()
      }
      if (value === '5') {
        this.curVideo = this.videoUrl_4_5
        this.show()
      }
      this.curStep = value
      // this.show()
    },
    async queryLayoutDataByHouseType (id) {
      const res = await HomeServices.queryLayoutDataByHouseType({id})
      const { houseTypeList, layoutList } = res.data.data
      this.houseTypeList = houseTypeList
      this.step1Img = houseTypeList[0].imageUrl
      this.layoutList = layoutList
      this.curStep = '1'
      this.curIndex = ''

      const re = await HomeServices.query4GroupImageList({id})
      this.imgList3 = re.data.data ? re.data.data : this.imgList3
    },
    getCurIndex (index) {
      const layoutList = JSON.parse(JSON.stringify(this.layoutList))
      this.curIndex = index
      // this.step3Img = layoutList[index].effectPictureList[0]
      this.imgList4 = layoutList[index].effectPictureList.splice(1, 6) || []
    },
    restData () {
      this.step1Img = ''
      this.curStep = '1'
      this.curIndex = ''
    },
    selectImg (par, chi) {
      const value = this.imgList3[par].effectPictureDtoList[chi].select
      this.imgList3[par].effectPictureDtoList[chi].select = !value
    },
    async getRecommend () {
      const res = await HomeServices.queryUserSelectRecommend(this.imgList3)
      const data = res.data.data
      this.step4Img = data[0].imageUrl
      this.videoUrl_4_5 = data[0].videoUrl
    },
    async queryStaticResource () {
      const res = await HomeServices.queryStaticResource(this.imgList3)
      const data = res.data.data
      this.videoUrl_1_2 = data[1]
      this.videoUrl_2_3 = data[2]
      this.videoUrl_3_4 = data[3]
    }
  }
} 
</script>

<style lang="stylus" scoped>
@require '../assets/style/base.styl'
.home-page {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .header {
    margin-top: rem(22);
    width: rem(4091);
    height: rem(242);
    background-image: url("../assets/header.png");
    background-size: contain;
    background-repeat: no-repeat;
    display: flex;
    align-content: center;
    justify-content: center;
    position relative;

    .system-name {
      cursor: pointer;
      width: rem(1702);
      height: rem(152);
      display: flex;
      justify-content: center;
      align-items: center;
      .logo {
        width: rem(219);
        height: rem(92);
        background-image: url("../assets/logo.png");
        background-size: contain;
        background-repeat: no-repeat;
      }
      .title {
        font-size: rem(86);
        font-family: DFPYuanW9-GB;
        font-weight: 400;
        color: #FFFFFF;
        margin-left: rem(48);
      }
    }
    
    .date-area {
      position: absolute;
      height: rem(152);
      right: rem(113);
      display: flex;
      align-items: center;
      .temperature {
        display: flex;
        align-items: center;
        margin-right: rem(65);
        position: relative;
        .temp-value {
          font-size: rem(62);
          font-family: PingFang SC;
          font-weight: 400;
          color: #46479D;
        }
        .temp-unit {
          width: rem(20);
          height: rem(20);
          background: #FFFFFF;
          border: rem(2) solid #46479D;
          border-radius: 50%;
          position: absolute;
          top: 0;
          right: rem(-33);
        }
      }
      .divide {
        margin-right: rem(42);
        width: rem(2);
        height: rem(64);
        background: #0B0E3B;
        border: rem(2) solid #46479D;
      }
      .time {
        font-size: rem(62);
        font-family: PingFang SC;
        font-weight: 400;
        color: #46479D;
        margin-right: rem(46);
      }
      .date {
        height: rem(70);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .week, .day-now {
          font-size: rem(24);
          font-family: PingFang SC;
          font-weight: 400;
          color: #46479D;
          opacity: 0.5;
        }
      }
    }
  }
  .contain {
    display: flex;
    align-items: center;
    justify-content: center;
    .step-1 {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: rem(147);
      .img-border {
        width: rem(1198);
        height: rem(1223);
        background-image: url("../assets/img-border.png");
        background-size: contain;
        background-repeat: no-repeat;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        .add-img {
          width: rem(210);
          height: rem(210);
          background-image: url("../assets/add-icon.png");
          background-size: contain;
          background-repeat: no-repeat;
        }
        .add-img-text {
          font-size: rem(72);
          font-family: DFPYuanW9-GB;
          font-weight: 400;
          color: #fcb28e;
          margin-top: rem(40);
        }
        img {
          width: 90%;
          height: 90%;
          object-fit: contain;
        }
      }
      .btn-action {
        cursor: pointer;
        margin-top: rem(80);
        width: rem(427);
        height: rem(132);
        background-image: url("../assets/btn-icon.png");
        background-size: contain;
        background-repeat: no-repeat;
      }
      .btn-action-active {
        background-image: url("../assets/btn-icon-active.png");
      }
      .text-tips {
        margin-top: rem(68);
        font-size: rem(56);
        font-family: PingFang SC;
        font-weight: 400;
        color: #A4A4A4;
      }
    }
    .step-4 {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: rem(147);
      .img-show {
        width: rem(2387);
        height: rem(1386);
        background-image: url("../assets/step3-border.png");
        background-size: contain;
        background-repeat: no-repeat;
        display: flex;
        justify-content: center;
        align-items: center;
        .img {
          width: rem(2254);
          height: rem(1264);
          object-fit: cover;
          margin-top: rem(6)
        }
      }
      .action-btn {
        display: flex;
        margin-top: rem(120);
        .similar-effect {
          width: rem(471);
          height: rem(123);
          background-image: url("../assets/similar-effect-icon.png");
          background-size: contain;
          background-repeat: no-repeat;
          margin-right: rem(95);
          cursor: pointer;
        }
        .back {
          width: rem(270);
          height: rem(123);
          background-image: url("../assets/back-icon.png");
          background-size: contain;
          background-repeat: no-repeat;
          cursor: pointer;
        }
      }
    }
    .step-5 {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin-top: rem(124);
      .img-list {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
      }
      .item-img {
        width: rem(1163);
        height: rem(680);
        background-image: url("../assets/step4-border.png");
        background-size: contain;
        background-repeat: no-repeat;
        margin-bottom: rem(80);
        display: flex;

        .img {
          width: rem(1126);
          height: rem(634);
          object-fit: cover;
          margin-top: rem(20);
          margin-left: rem(18);
        }

        &:nth-child(3n + 2) {
          margin-left: rem(98);
          margin-right: rem(98);
        }
      }
      .back {
        width: rem(270);
        height: rem(123);
        background-image: url("../assets/back-icon.png");
        background-size: contain;
        background-repeat: no-repeat;
        cursor: pointer;
      }
    }

    .step-2 {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: rem(390);
      .img-list {
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: rem(3500);
        height: rem(900);
      }
      .item-img {
        width: rem(703);
        background-size: contain;
        background-repeat: no-repeat;
        img {
          object-fit: contain;
          width: 100%;
          height: 100%;
        }
      }
      .img-1, .img-2, .img-3{
        margin-right: rem(60);
      }
      .img-1 {
        width: rem(703);
        height: rem(864);
        background-image: url("../assets/img1.png");
        img {
          transform: rotateY(40deg);
          width: rem(673);
          height: rem(754);
          object-fit: contain;
          position: relative;
          top: rem(52);
          left: rem(40);
        }
      }
      .img-1-0 {
        width: rem(783);
        height: rem(944);
        background-image: url("../assets/img1-active.png");
        img {
          top: rem(92);
          left: rem(80);
        }
      }
      .img-2 {
        position: relative;
        height: rem(759);
        background-image: url("../assets/img2.png");
        img {
          transform: rotateY(16deg);
          width: rem(688);
          height: rem(684);
          object-fit: contain;
          position: relative;
          top: rem(34);
          left: rem(10);
        }
      }
      .img-2-1 {
        width: rem(783);
        height: rem(840);
        background-image: url("../assets/img2-active.png");
        img {
          top: rem(74);
          left: rem(50);
        }
      }
      .img-3 {
        position: relative;
        height: rem(754);
        background-image: url("../assets/img3.png");
        img {
          transform: rotateY(-18deg);
          width: rem(678);
          height: rem(674);
          object-fit: contain;
          position: relative;
          top: rem(40);
          left: rem(0);
        }
      }
      .img-3-2 {
        width: rem(783);
        height: rem(834);
        background-image: url("../assets/img3-active.png");
        img {
          top: rem(80);
          left: rem(40);
        }
      }
      .img-4 {
        width: rem(703);
        height: rem(864);
        background-image: url("../assets/img4.png");
        img {
          transform: rotateY(-40deg);
          width: rem(673);
          height: rem(744);
          object-fit: contain;
          position: relative;
          top: rem(56);
          left: rem(-10);
        }
      }
      .img-4-3 {
        width: rem(783);
        height: rem(944);
        background-image: url("../assets/img4-active.png");
        img {
          top: rem(96);
          left: rem(30);
        }
      }
      .action-btn {
        margin-top: rem(100);
        width: rem(427);
        height: rem(132);
        background-image: url("../assets/step2-btn.png");
        background-size: contain;
        background-repeat: no-repeat;
        cursor: pointer;
      }
      .action-btn-active {
        background-image: url("../assets/step2-btn-active.png");
      }
    }

    .step-3 {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 0;
      .step-title {
        font-size: rem(60);
        font-family: PingFang SC;
        font-weight: 400;
        color: #FC6421;
        margin-top: rem(12);
        align-self: flex-start;
      }
      .action-btn {
        width: rem(323);
        height: rem(270);
        background-image: url("../assets/recommend-btn.png");
        background-size: contain;
        background-repeat: no-repeat;
        cursor: pointer;
      }
      .action-btn-active {
        background-image: url("../assets/recommend-btn.png");
      }
    }
    .img-contain {
      margin-top: rem(67);
      width: rem(3242);
      height: rem(1570);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      .item-model {
        box-sizing: border-box;
        width: rem(1451);
        height: rem(694);
        padding: rem(42) rem(50);
        display: flex;
        justify-content: space-between;
        background-image: url("../assets/step3-bg.png");
        background-size: cover;
        .item-img {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          .img {
            width: rem(640);
            height: rem(609);
            cursor: pointer;
            object-fit: cover;
          }
          .icon {
            width: rem(50);
            height: rem(50);
            position: absolute;
            top: rem(31);
            right: rem(25);
          }
        }
        
      }
    }
  }
}
</style>