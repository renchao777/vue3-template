/**
 * v-debounce
 * 按钮防抖指令，已扩展至 input
 * 接收参数：function 类型
 * 适用于短时间内频繁触发事件，确保事件停止后才执行函数。
 * 使用场景 搜索框搜索输入 用户完成最后一次输入完 在发送请求
 * 手机号 邮箱验证输入检测
 * 窗口大小 resize 只需窗口完成调整后 计算窗口大小 防止重复渲染
 */
import type { Directive, DirectiveBinding } from "vue";

interface ElType extends HTMLElement {
  __handleEvent__?: () => void;
}

const debounce: Directive = {
  mounted(el: ElType, binding: DirectiveBinding) {
    if (typeof binding.value !== "function") {
      throw new Error("callback must be a function");
    }

    let timer: number | null = null; // 更改为 number

    const eventHandler = () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = window.setTimeout(() => {
        binding.value();
      }, 500);
    };

    if (el.tagName === "INPUT") {
      // 对 input 元素使用 input 事件
      el.__handleEvent__ = eventHandler;
      el.addEventListener("input", el.__handleEvent__);
    } else if (el.tagName === "BUTTON" || el.tagName === "DIV") {
      // 对 button 或 div 元素使用 click 事件
      el.__handleEvent__ = eventHandler;
      el.addEventListener("click", el.__handleEvent__);
    } else {
      // 默认情况下使用 click 事件
      el.__handleEvent__ = eventHandler;
      el.addEventListener("click", el.__handleEvent__);
    }
  },
  beforeUnmount(el: ElType) {
    if (el.__handleEvent__) {
      if (el.tagName === "INPUT") {
        el.removeEventListener("input", el.__handleEvent__);
      } else {
        el.removeEventListener("click", el.__handleEvent__);
      }
      // 清理计时器
      clearTimeout((el.__handleEvent__ as any)?.timer);
    }
  },
};

export default debounce;
