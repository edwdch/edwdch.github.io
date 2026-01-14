import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import "virtual:uno.css";
import "./style.css";

export default {
  extends: DefaultTheme,
  Layout,
};