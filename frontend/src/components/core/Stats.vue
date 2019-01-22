<template>
  <div>
    <md-card v-if="stats['Total WeakAuras']" v-for="(statistic, label) in stats" :key="label" v-bind:style="{'z-index': statistic.z}">
      <md-card-header>
        <div class="md-title" :name="slugify(label)"><span v-if="statistic.total">{{ new Intl.NumberFormat().format(statistic.total) }} </span>{{ label }}</div>
        <div class="md-subhead">{{ label }} added per week:</div>
      </md-card-header>
      <md-card-content style="background: #FFF; color:#000">
        <apex-chart type="area" height="200" :options="apexOptions" :series="statistic.series"></apex-chart>
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
      stats: {},
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
              offsetY: -8,
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
              offsetY: -8,
              orientation: 'horizontal',
              text: 'Legion Expansion'
            }
          },
          {
            x: new Date('20 September 2016').getTime(),
            borderColor: '#a63232',
            label: {
              borderColor: '#a63232',
              style: {
                color: '#fff',
                background: '#a63232',
                fontSize: '12px'
              },
              offsetY: 10,
              orientation: 'horizontal',
              text: 'EN Raid'
            }
          },
          {
            x: new Date('8 November 2016').getTime(),
            borderColor: '#a63232',
            label: {
              borderColor: '#a63232',
              style: {
                color: '#fff',
                background: '#a63232',
                fontSize: '12px'
              },
              offsetY: 10,
              orientation: 'horizontal',
              text: 'ToV Raid'
            }
          },
          {
            x: new Date('17 January 2017').getTime(),
            borderColor: '#a63232',
            label: {
              borderColor: '#a63232',
              style: {
                color: '#fff',
                background: '#a63232',
                fontSize: '12px'
              },
              offsetY: 10,
              orientation: 'horizontal',
              text: 'NH Raid'
            }
          },
          {
            x: new Date('20 June 2017').getTime(),
            borderColor: '#a63232',
            label: {
              borderColor: '#a63232',
              style: {
                color: '#fff',
                background: '#a63232',
                fontSize: '12px'
              },
              offsetY: 10,
              orientation: 'horizontal',
              text: 'ToS Raid'
            }
          },
          {
            x: new Date('28 November 2017').getTime(),
            borderColor: '#a63232',
            label: {
              borderColor: '#a63232',
              style: {
                color: '#fff',
                background: '#a63232',
                fontSize: '12px'
              },
              offsetY: 10,
              orientation: 'horizontal',
              text: 'AtBT Raid'
            }
          },
          {
            x: new Date('4 September 2018').getTime(),
            borderColor: '#a63232',
            label: {
              borderColor: '#a63232',
              style: {
                color: '#fff',
                background: '#a63232',
                fontSize: '12px'
              },
              offsetY: 10,
              orientation: 'horizontal',
              text: 'Uldir Raid'
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
      },
      statGroups: [
        { name: 'WeakAura Imports with Features', search: /^WeakAura Imports/ },
        { name: 'WeakAura Imports with Custom Triggers', search: /^WeakAura Triggers/ },
        { name: 'WeakAura Region Types', search: /^WeakAura Region/, cut: /^WeakAura Region\s/, total: false }
      ]
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
      var statObj = {}
      data.forEach((stat) => {
        let group = false
        for (let i = 0; i < this.statGroups.length; i++) {
          if (stat.name.match(this.statGroups[i].search)) {
            if (this.statGroups[i].cut) {
              stat.name = stat.name.replace(this.statGroups[i].cut, '')
            }
            if (!statObj[this.statGroups[i].name]) {
              statObj[this.statGroups[i].name] = {series: [], total: 0}
            }
            statObj[this.statGroups[i].name].series.push(this.makeSeries(stat))
            if (this.statGroups[i].total !== false) {
              statObj[this.statGroups[i].name].total = Math.max(statObj[this.statGroups[i].name].total, this.calcTotal(stat.data))
            }
            group = true
          }
        }
        if (!group) {
          statObj[stat.name] = {series: [this.makeSeries(stat)], total: this.calcTotal(stat.data)}
        }
      })
      let keys = Object.keys(statObj)
      for (let i = keys.length - 1; i >= 0; i--) {
        console.log(keys)
        statObj[keys[i]].z = keys.length - i
      }
      this.stats = statObj
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
      return {name: stats.name, data: series}
    },
    slugify (str) {
      return str.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w-]+/g, '')       // Remove all non-word chars
        .replace(/-{2,}/g, '-')        // Replace multiple - with single -
    }
  }
}
</script>

<style scoped>
.md-card { overflow: visible; }
</style>
