<template>
  <div class="wrapper">
    <span>{{ ecgData.title }}</span>
    <div class="ecg" id="ecg-img2">
      <div id="chartContainer2" style="height: 100%"></div>
    </div>
  </div>
</template>

<script>
import CanvasJS from '@canvasjs/charts'

export default {
  name: 'ECGViewer',
  props: {
    ecgData: Object
  },
  data() {
    return {
      chart: null,
      xAxisStripLinesArray: [],
      yAxisStripLinesArray: [],
      dps: [],
      color: '#e6e6e6',
      isMouseDown: false,
      previousECGArrayLength: 0
    }
  },
  watch: {
    ecgData() {
      console.log(this.ecgData)
      this.changeChartData(this.chart)
    }
  },
  computed: {},
  mounted() {
    console.log(this.ecgData)
    //ECG滑鼠拖曳
    const scrollable_H = document.querySelector('#ecg-img2')
    scrollable_H.addEventListener('mousedown', (e) => this.mouseIsDown(e))
    scrollable_H.addEventListener('mouseup', (e) => this.mouseUp(e))
    scrollable_H.addEventListener('mouseleave', (e) => this.mouseLeave(e))
    scrollable_H.addEventListener('mousemove', (e) => this.mouseMove(e, scrollable_H))

    //ECG水平滾輪滾動
    scrollable_H.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()

        if (e.deltaY < 0 || e.deltaX < 0) {
          scrollable_H.scrollBy(-30, 0)
        } else {
          scrollable_H.scrollBy(30, 0)
        }
      },
      { passive: false }
    )
    this.setChart()
    this.addDataPoints(this.chart)
    this.addStripLines(this.chart)
  },
  methods: {
    //監聽滑鼠行為：拖曳ECG功能
    mouseIsDown(e) {
      e.preventDefault()
      this.isMouseDown = true
    },
    mouseUp(e) {
      e.preventDefault()
      this.isMouseDown = false
    },
    mouseLeave(e) {
      e.preventDefault()
      this.isMouseDown = false
    },
    mouseMove(e, target) {
      e.preventDefault()
      if (this.isMouseDown) {
        target.scrollBy(-e.movementX * 2.5, 0)
      }
    },
    //拖曳ECG功能 END

    setChart() {
      this.chart = new CanvasJS.Chart('chartContainer2', {
        theme: 'light2',
        lineThickness: 1,
        title: {
          horizontalAlign: 'left',
          fontColor: this.color
        },
        axisY: {
          stripLines: this.yAxisStripLinesArray,
          gridColor: this.color,
          lineColor: this.color,
          interval: 500,
          tickThickness: 0,
          minimum: -3000,
          maximum: 3000,
          labelFormatter: function (e) {
            let label = ''
            if (e.value % this.chart.axisY[0].interval === 0) {
              label = e.value / 1000
            }
            return label + 'mV'
          }
        },
        axisX: {
          stripLines: this.xAxisStripLinesArray,
          gridColor: this.color,
          lineColor: this.color,
          tickThickness: 0,
          interval: 50,
          titleMaxWidth: 3750,
          labelMaxWidth: 50,
          labelWrap: true,
          labelFormatter: function (e) {
            let label = ''
            if (e.value % (this.chart.axisX[0].interval * 5) === 0) {
              label = e.value / 250 + ' sec'
            }
            return label
          }
        },
        toolTip: {
          contentFormatter: function (e) {
            return (
              '<span style="font-weight:600">sec：</span>' +
              e.entries[0].dataPoint.x / 250 +
              '<br/>' +
              '<span style="font-weight:600">mV：</span>' +
              e.entries[0].dataPoint.y / 1000
            )
          }
        },
        data: [
          {
            type: 'line',
            lineThickness: 1,
            lineColor: 'black',
            dataPoints: this.dps
          }
        ]
      })
      document.getElementById('chartContainer2').onclick = function (evt) {
        var activePoints = this.chart.getElementsAtEventForMode(evt, 'point', this.chart.options)
        var firstPoint = activePoints[0]
        var label = this.chart.data.labels[firstPoint._index]
        var value = this.chart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index]
        alert(label + ': ' + value)
      }
    },
    addDataPoints(chart) {
      this.ecgData.data.forEach((element) => {
        this.dps.push({ y: element })
      })
      this.previousECGArrayLength = this.dps.length
      chart.render()
    },

    addStripLines(chart) {
      //StripLines

      for (
        var i = chart.axisY[0].minimum;
        i < chart.axisY[0].maximum;
        i = i + chart.axisY[0].interval / 5
      ) {
        if (i % chart.axisY[0].interval !== 0) {
          this.yAxisStripLinesArray.push({ value: i, thickness: 0.5, color: this.color })
        } else if (i % (chart.axisY[0].interval * 2) === 0) {
          this.yAxisStripLinesArray.push({ value: i, thickness: 1, color: '#969696' })
        } else {
          this.yAxisStripLinesArray.push({ value: i, thickness: 1, color: '#cccccc' })
        }
      }
      for (
        var j = chart.axisX[0].minimum + 0.5;
        j < chart.axisX[0].maximum;
        j = j + chart.axisX[0].interval / 5
      ) {
        if (j % chart.axisX[0].interval != 0) {
          this.xAxisStripLinesArray.push({ value: j, thickness: 0.5, color: this.color })
        } else if (j % (chart.axisX[0].interval * 5) === 0) {
          this.xAxisStripLinesArray.push({ value: j, thickness: 1, color: '#969696' })
        } else {
          this.xAxisStripLinesArray.push({ value: j, thickness: 1, color: '#cccccc' })
        }
      }
      chart.render()
    },

    changeChartData(chart) {
      if (this.dps.length !== 0) {
        for (let i = 0; i < this.previousECGArrayLength; i++) {
          this.dps.pop()
        }
        console.log(this.ecgData.data)
        this.ecgData.data.forEach((element) => {
          this.dps.push({ y: element })
        })
        chart.render()
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
%flex_row_start_center {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}

.wrapper {
  width: calc(100% - 16px);
  background: #fff;
  margin: 8px 8px 4px 8px;
  padding: 20px 12px;
  border-radius: 8px;
}

.ecg {
  width: calc(100% - 16px);
  height: 400px;

  overflow-x: auto;
  overflow-y: hidden;
  &:hover {
    cursor: grab;
  }
  &:active {
    cursor: grabbing;
  }
  #chartContainer2 {
    width: 3750px;
  }
}
.ecg_img {
  width: auto;
  height: 100%;
}
</style>
