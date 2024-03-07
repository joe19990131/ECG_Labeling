<template>
  <div class="content">
    <div class="header">ECG AI Labeling</div>
    <div class="body">
      <div class="left">
        <div class="files list_block">
          <div class="header">
            <span class="title">FILES</span>
            <input
              class="add_item"
              type="file"
              id="fileInput"
              accept=".xml"
              @change="uploadECG()"
            />
          </div>
          <div class="list">
            <div
              class="list_item"
              v-for="(file, index) in ECGs"
              :key="index"
              :style="{
                background: index === selectedFile ? '#e2e2e2' : '#f2f2f2'
              }"
              @click="changeFile(file.index)"
            >
              {{ file.file_name }}
            </div>
          </div>
        </div>
      </div>
      <div class="main">
        <div class="top">
          <div class="ECG_info"></div>
          <div class="label_btn_content">
            <div
              :class="selectedLabel === label.id ? 'label_btn selectedBtn' : 'label_btn'"
              v-for="(label, index) in EcglabelList"
              @click="singleSelect(label.id)"
              :key="index"
            >
              {{ label.name }}
            </div>
            <div :class="isLabelEmpty" @click="getECGBase64()">保存</div>
          </div>
        </div>
        <div class="ecg" id="ecg-img">
          <div id="chartContainer" style="height: 100%"></div>
          <!--<img class="ecg_img" @mousewheel="wheel" :src="dataSet[selectedFile].url" />-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ECGset from '../assets/test_data/ECG.json'
import CanvasJS from '@canvasjs/charts'
//import { xmlParser } from 'fast-xml-parser'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      xmlData: '<root><item name="item1">value1</item></root>',
      data: null,
      EcglabelList: [
        { id: 0, name: 'AF' },
        { id: 1, name: 'PVC' },
        { id: 2, name: 'I-AVB' },
        { id: 3, name: 'STD' }
      ],
      selectedLabelArray: [],
      selectedLabel: null,
      dataSet: [
        {
          name: 'file 01',
          index: 0,
          url: 'https://i.imgur.com/ivlb4vb.png',
          tag: null
        },
        {
          name: 'file 02',
          index: 1,
          url: 'https://i.imgur.com/QPVNM47.png',
          tag: null
        }
      ],
      ECGs: ECGset.data,
      previousECGArrayLength: 0,
      selectedFile: 0,
      isMouseDown: false,

      chart: null,
      xAxisStripLinesArray: [],
      yAxisStripLinesArray: [],
      dps: [],
      color: '#e6e6e6'
    }
  },
  watch: {},
  computed: {
    isLabelEmpty() {
      let className = ''
      if (this.selectedLabel === null || this.selectedLabel === undefined) {
        className = 'disable_btn'
      } else {
        className = 'save_btn'
      }
      return className
    }
  },
  mounted() {
    const that = this
    //ECG滑鼠拖曳
    const scrollable_H = document.querySelector('#ecg-img')
    scrollable_H.addEventListener('mousedown', (e) => this.mouseIsDown(e))
    scrollable_H.addEventListener('mouseup', (e) => this.mouseUp(e))
    scrollable_H.addEventListener('mouseleave', (e) => this.mouseLeave(e))
    scrollable_H.addEventListener('mousemove', (e) => this.mouseMove(e, scrollable_H))

    //ECG水平滾輪滾動
    scrollable_H.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault()
        if (e.deltaX == 0) {
          if (e.deltaY < 0) {
            scrollable_H.scrollBy(-30, 0)
          } else {
            scrollable_H.scrollBy(30, 0)
          }
        } else {
          if (e.deltaX < 0) {
            scrollable_H.scrollBy(-30, 0)
          } else {
            scrollable_H.scrollBy(30, 0)
          }
        }
      },
      { passive: false }
    )

    document.getElementById('fileInput').addEventListener('change', function () {
      let file = this.files[0]
      let reader = new FileReader()

      reader.onload = function (event) {
        let xmlString = event.target.result
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(xmlString, 'text/xml')

        let jsonData = that.xmlParser(xmlDoc)
        console.log(jsonData)
      }

      reader.readAsText(file)
    })

    this.setChart()
    this.addDataPoints(this.chart)
    this.addStripLines(this.chart)
  },
  methods: {
    //XML Parser
    xmlParser(XMLFIle) {
      //const parser = new xmlParser()
      //let jObj = parser.parse(XMLFIle)
      //return jObj

      var obj = {}

      if (XMLFIle.nodeType === 1) {
        if (XMLFIle.attributes.length > 0) {
          obj['attributes'] = {}
          for (var j = 0; j < XMLFIle.attributes.length; j++) {
            var attribute = XMLFIle.attributes.item(j)
            obj['@attributes'][attribute.nodeName] = attribute.nodeValue
          }
        }
      } else if (XMLFIle.nodeType === 3) {
        obj = XMLFIle.nodeValue
      }

      if (XMLFIle.hasChildNodes()) {
        for (var i = 0; i < XMLFIle.childNodes.length; i++) {
          var item = XMLFIle.childNodes.item(i)
          var nodeName = item.nodeName
          if (typeof obj[nodeName] === 'undefined') {
            obj[nodeName] = this.xmlParser(item)
          } else {
            if (typeof obj[nodeName].push === 'undefined') {
              var old = obj[nodeName]
              obj[nodeName] = []
              obj[nodeName].push(old)
            }
            obj[nodeName].push(this.xmlParser(item))
          }
        }
      }
      return obj
    },

    //upload ECG XML File
    uploadECG() {},

    //獲取file list API
    async getECGSet() {
      await axios({
        method: 'POST',
        headers: {
          token: '314671D5846DA9B9BF701493ED9F92BFC64CAF3446B6DE46241B5987E9078D61'
        },
        url: 'https://jy-meditech.com/TF02/medicaldata/ecgInfoByType',
        data: {
          query: 'kz_irb',
          startTime: '2023-07-22 00:00:00',
          endTime: '2023-09-23 00:00:00'
        }
      })
        .then((res) => {
          console.log(res.status)
        })
        .catch((error) => console.log(error.config))
    },
    //獲取ECG Base64 data
    async getECGBase64() {
      if (this.selectedLabel !== null) {
        console.log('sand!')
      }
    },

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
      this.chart = new CanvasJS.Chart('chartContainer', {
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
      document.getElementById('chartContainer').onclick = function (evt) {
        var activePoints = this.chart.getElementsAtEventForMode(evt, 'point', this.chart.options)
        var firstPoint = activePoints[0]
        var label = this.chart.data.labels[firstPoint._index]
        var value = this.chart.data.datasets[firstPoint._datasetIndex].data[firstPoint._index]
        alert(label + ': ' + value)
      }
    },
    addDataPoints(chart) {
      this.ECGs[this.selectedFile].ECG.forEach((element) => {
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
        this.ECGs[this.selectedFile].ECG.forEach((element) => {
          this.dps.push({ y: element })
        })
        chart.render()
      }
    },
    //更改AI結果 - 單選 (保留)
    singleSelect(labelIdx) {
      if (this.selectedLabel === labelIdx) {
        this.ECGs[this.selectedFile].tag = null
      } else {
        this.selectedLabel = labelIdx
        this.ECGs[this.selectedFile].tag = labelIdx
      }
    },

    //更改AI結果 - 單選 (保留)
    multiSelect(labelIdx) {
      let labelArray = new Set()
      this.selectedLabelArray.forEach((element) => {
        labelArray.add(element)
      })

      if (this.selectedLabelArray.includes(labelIdx)) {
        labelArray.delete(labelIdx)
      } else {
        labelArray.add(labelIdx)
      }
      this.selectedLabelArray = Array.from(labelArray)
    },

    //選取瀏覽ECG檔案
    changeFile(index) {
      if (this.selectedFile !== index) {
        this.selectedFile = index
        this.changeChartData(this.chart)
        this.selectedLabel = this.ECGs[this.selectedFile].tag
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
.content {
  background: #efefef;
  width: 100%;
  height: 100%;
}
.header {
  background: #00838e;
  height: 48px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0px 12px;
  color: #fff;
  font-weight: 600;
  font-size: 20px;
}
.body {
  height: calc(100% - 48px);
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
}
.left {
  height: 100%;
  width: 240px;
  display: flex;
  flex-direction: column;

  .list_block {
    background: #fff;
    padding: 8px 12px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: start;
    .header {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      background-color: unset;
      width: 100%;
      height: auto;
      .title {
        font-size: 16px;
        font-weight: 600;
        color: #3f3f3f;
        margin: 4px 0px;
      }
      .add_item {
        color: #00838e !important;
        background-color: #e7fff6;
        width: 90%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: baseline;
        border: 1px solid #00838e;
        border-radius: 4px;
        line-height: 1;
        cursor: pointer;
      }
    }

    .list {
      width: 100%;
      height: 100%;
      overflow-y: scroll;
      scrollbar-width: thin;
      padding: 4px;
      -webkit-scrollbar {
        width: 4px;
      }
    }
  }
}
.list_item {
  background: #f2f2f2;
  padding: 8px 8px;
  width: calc(100% - 16px);
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  margin: 4px 0;
  &:hover {
    cursor: pointer;
    background: #e2e2e2;
  }
}
.main {
  width: calc(100% - 240px);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: start;
  .top {
    background: #fff;
    width: 100%;
    padding: 12px 24px;
  }
}
.label_btn_content {
  @extend %flex_row_start_center;
  padding: 20px 0px;
  .label_btn {
    border: 2px solid #999999;
    background-color: #fff;
    border-radius: 20px;
    padding: 4px 20px;
    text-align: center;
    margin-right: 8px;
    &:hover {
      background-color: #d3f3ef;
      cursor: pointer;
    }
  }
  .save_btn {
    border-radius: 4px;
    border: 1px solid;
    background: #15adb7;
    color: #fff;
    padding: 4px 12px;
    font-weight: 600;
    &:hover {
      cursor: pointer;
      background: #30d6e1;
      border: 1px solid #15adb7;
    }
  }
  .disable_btn {
    border-radius: 4px;
    border: 1px solid #a7a7a7;
    background: #d8d8d8;
    color: #fff;
    padding: 4px 12px;
    font-size: 16px;
  }
  .selectedBtn {
    background: #b8ffe5;
  }
}
.ecg {
  width: calc(100% - 16px);
  height: 400px;
  background: #fff;
  margin: 8px;
  padding: 20px 12px;
  overflow-x: auto;
  overflow-y: hidden;
  &:hover {
    cursor: grab;
  }
  &:active {
    cursor: grabbing;
  }
  #chartContainer {
    width: 3750px;
  }
}
.ecg_img {
  width: auto;
  height: 100%;
}
</style>
