<template>
  <div>
    <md-card v-if="stats.length" v-for="(statistic, key) in stats" :key="key">
      <md-card-header>
        <div class="md-title">{{ new Intl.NumberFormat().format(calcTotal(statistic.data)) }} {{ statistic.name }}</div>
        <div class="md-subhead">{{ statistic.name }} added per week:</div>
      </md-card-header>
      <md-card-content style="background: #FFF; color:#000">
        <apex-chart type="area" height="200" :options="apexOptions" :series="makeSeries(statistic)"></apex-chart>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
// eslint-disable-next-line no-extend-native
Date.prototype.nextWeek = function () {
  var date = new Date(this.valueOf())
  date.setDate(date.getDate() + 7)
  return date
}

import VueApexCharts from 'vue-apexcharts'
export default {
  components: {
    ApexChart: VueApexCharts
  },
  data: function () {
    return {
      stats: [],
      apexOptions: {
        annotations: {
          xaxis: [{
            x: new Date('14 August 2018').getTime(),
            borderColor: '#0f6e03',
            label: {
              borderColor: '#0f6e03',
              style: {
                color: '#fff',
                background: '#0f6e03',
                fontSize: '12px'
              },
              orientation: 'horizontal',
              text: 'Battle for Azeroth Expansion'
            }
          },
          {
            x: new Date('30 August 2016').getTime(),
            borderColor: '#0f6e03',
            label: {
              borderColor: '#0f6e03',
              style: {
                color: '#fff',
                background: '#0f6e03',
                fontSize: '12px'
              },
              orientation: 'horizontal',
              text: 'Legion Expansion'
            }
          }]
        },
        dataLabels: {
          enabled: false
        },
        labels: this.allTheWeeks,
        xaxis: {
          type: 'datetime'
        },
        chart: {
          toolbar: {
            show: false
          }
        }
      }
    }
  },
  computed: {
    allTheWeeks: function () {
      var today = new Date()
      var dates = [new Date(1463788800000)] // May 21 2016
      while (dates[dates.length - 1] < today) {
        dates.push(dates[dates.length - 1].nextWeek())
      }
      return dates
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: 'Wago Statistics',
      description: '',
      image: false,
      unlisted: true
    })

    this.http.get('/lookup/statistics').then((data) => {
      this.stats = data
    })
  },
  methods: {
    calcTotal (data) {
      return data.reduce((a, b) => {
        return a + b
      })
    },
    makeSeries (stats) {
      var weeks = this.allTheWeeks
      var series = []
      for (let i = 0; i < weeks.length; i++) {
        series.push([weeks[i].getTime(), stats.data[i] || 0])
      }
      console.log(series)
      return [{name: stats.name, data: series}]
    }
  }
}
</script>

<style scoped>
</style>
