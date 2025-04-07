<template>
    <transition name="fade">
      <div class="modal-overlay" v-if="visible">
        <div class="modal">
          <h3>修改本次学生成绩</h3>
  
          <label>
            姓名：
            <input v-model="formData.name" placeholder="请输入学生姓名" />
          </label>
  
          <div
            v-for="(entry, index) in subjectInputs"
            :key="index"
            class="subject-entry"
          >
            <label>
              科目：
              <select v-model="entry.subject">
                <option disabled value="">请选择科目</option>
                <option v-for="sub in subjects" :key="sub" :value="sub">
                  {{ subjectMap[sub] }}
                </option>
              </select>
            </label>
            <label>
              分数：
              <input type="number" v-model.number="entry.score" />
            </label>
          </div>
  
          <button class="add-btn" @click="addSubject">+ 添加科目</button>
  
          <div class="modal-actions">
            <button class="confirm-btn" @click="confirm">提交</button>
            <button class="cancel-btn" @click="$emit('close')">取消</button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    props: {
      visible: Boolean,
      initialData: Object,
      subjects: Array,
      subjectMap: Object,
      examDate: String
    },
    emits: ['close', 'submit'],
    data() {
      return {
        formData: {
          name: ''
        },
        subjectInputs: []
      };
    },
    watch: {
      initialData: {
        immediate: true,
        handler(newVal) {
          if (newVal) {
            this.formData.name = newVal.name || '';
            this.subjectInputs = Object.keys(newVal)
              .filter(key => key !== 'name')
              .map(subject => ({
                subject,
                score: newVal[subject]
              }));
          } else {
            this.formData.name = '';
            this.subjectInputs = [];
          }
        }
      }
    },
    methods: {
      addSubject() {
        this.subjectInputs.push({ subject: '', score: 0 });
      },
      confirm() {
        const { name } = this.formData;
        const scores = {};
        this.subjectInputs.forEach(entry => {
          if (entry.subject && typeof entry.score === 'number') {
            scores[entry.subject] = entry.score;
          }
        });
        this.$emit('submit', {
          name,
          exam_date: this.examDate,
          scores
        });
      }
    }
  };
  </script>
  
  <style scoped>
  /* 动画 */
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from, .fade-leave-to {
    opacity: 0;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(30, 30, 30, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: #ffffff;
    padding: 28px 32px;
    border-radius: 12px;
    width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  }
  
  .modal h3 {
    margin-bottom: 18px;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
  
  .modal label {
    display: block;
    margin-bottom: 12px;
    font-size: 14px;
    color: #444;
  }
  
  .modal input,
  .modal select {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    margin-top: 4px;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #fafafa;
    transition: all 0.3s ease;
  }
  
  .modal input:focus,
  .modal select:focus {
    border-color: #409eff;
    background: #fff;
    outline: none;
    box-shadow: 0 0 5px rgba(64, 158, 255, 0.3);
  }
  
  .subject-entry {
    margin-bottom: 14px;
    display: flex;
    gap: 12px;
  }
  
  .subject-entry label {
    flex: 1;
  }
  
  .add-btn {
    margin-top: 10px;
    padding: 6px 12px;
    background-color: #409eff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  .add-btn:hover {
    background-color: #337ecc;
  }
  
  .modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
  }
  
  .confirm-btn,
  .cancel-btn {
    padding: 10px 20px;
    font-size: 14px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }
  
  .confirm-btn {
    background-color: #10b981;
    color: white;
  }
  
  .confirm-btn:hover {
    background-color: #059669;
    transform: scale(1.05);
  }
  
  .cancel-btn {
    background-color: #e5e7eb;
    color: #333;
  }
  
  .cancel-btn:hover {
    background-color: #d1d5db;
    transform: scale(1.05);
  }
  </style>