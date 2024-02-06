<template>
  <div class="content">
    <div class="header">ECG AI Labeling</div>
    <div class="body">
      <div class="left">
        <div class="files list_block">
          <span class="title">FILES</span>
          <div class="list">
            <div
              class="list_item"
              v-for="(file, index) in dataSet"
              :key="index"
              :style="{
                background: index === selectedFile ? '#e2e2e2' : '#f2f2f2'
              }"
              @click="changeFile(file.index)"
            >
              {{ file.name }}
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
          <img class="ecg_img" @mousewheel="wheel" :src="dataSet[selectedFile].url" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
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
      selectedSet: 0,
      selectedFile: 0,
      isMouseDown: false
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

        if (e.deltaY < 0) {
          scrollable_H.scrollBy(-30, 0)
        } else {
          scrollable_H.scrollBy(30, 0)
        }
      },
      { passive: false }
    )

    this.getECGSet()
  },
  methods: {
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

    //更改AI結果 - 單選 (保留)
    singleSelect(labelIdx) {
      if (this.selectedLabel === labelIdx) {
        this.dataSet[this.selectedFile].tag = null
      } else {
        this.selectedLabel = labelIdx
        this.dataSet[this.selectedFile].tag = labelIdx
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

        this.selectedLabel = this.dataSet[this.selectedFile].tag
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
    width: calc(100% - 24px);
    margin-top: 4px;
    padding: 8px 12px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: start;
    .title {
      font-size: 16px;
      font-weight: 600;
      color: #3f3f3f;
      margin: 4px 0px;
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
    width: calc(100% - 48px);
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
    text-align: cener;
    width: 60px;
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
  height: calc(50% - 16px);
  background: #123113;
  margin: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  &:hover {
    cursor: grab;
  }
  &:active {
    cursor: grabbing;
  }
}
.ecg_img {
  width: auto;
  height: 100%;
}
</style>
