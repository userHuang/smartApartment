<template>
  <div class="local-date-component"> {{dateTime}} </div>
</template>

<style lang="stylus" scoped>
  .local-date-component {
    display inline-block
  }
</style>

<script>
export default {
  data () {
    return {
      dateTime: ''
    }
  },

  // timeType: {time: '10:20', week: '星期五', date: '11月22日'}
  props: {
    timeType: {
      type: String,
      default: 'time'
    },
    format: {
      type: String,
      default: 'mm:dd'
    }
  },

  methods: {
    show () {
      this.showTime()
      if (this._timer) {
        clearInterval(this._timer)
      } else {
        this._timer = setInterval(() => {
          this.showTime()
        }, 1000)
      }
    },

    showTime() {
      let times
      const now = new Date()
      times = [now.getHours(), now.getMinutes(), now.getSeconds()]
      let hour = +times[0]
      let minute = +times[1]
      let seconds = +times[2]
      minute = minute < 10 ? `0${minute}` : minute
      seconds = seconds < 10 ? `0${seconds}` : seconds

      const week2name = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday'
      }
      let yy = now.getFullYear()
      let mm = now.getMonth() + 1
      let dd = now.getDate()
      let week = now.getDay()
      const weekName = week2name[week] || ''
      if (this.timeType == 'time') {
        this.dateTime = `${hour}:${minute}:${seconds}`
      }
      if (this.timeType == 'week') {
        this.dateTime = weekName
      }
      if (this.timeType == 'date') {
        this.dateTime = `${mm}.${dd}`
        if (this.format === 'yy:mm:dd') {
          this.dateTime = `${yy}.${mm}.${dd}`
        }
        if (this.format === 'mm:dd') {
          this.dateTime = `${mm}.${dd}`
        }
      }
    }
  },

  mounted() {
    this.show()
  },

  destroyed () {
    if (this._timer) clearInterval(this._timer)
  }
}
</script>
