import { defineConfig } from '@umijs/max';
const path = require('path');

import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export default defineConfig({
  define: {
    'process.env.STORE_OSS_URL': process.env.STORE_OSS_URL,
  },
  history: {
    type: "hash"
  },
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  jsMinifier:'none',
  mfsu: false,
  chainWebpack: (memo, { webpack, env }) => {
    // if (env === 'production') {
    //   memo.output.chunkFilename(`static/js/[name].js`)
    //   memo.output.filename(`static/js/[name].js`)

    // }

  },
  layout: {
    title: '智慧景区运营解决方案',
  },
  routes: [
    {
      path: '/',
      redirect: '/floor',

    },
    {
      name: '景区管理',
      path: '/floor',
      component: './Floor',

    },
    {
      name: '景区模型',
      path: "/store-model/:id",
      component: './Store',
      layout: false
    },
    {
      name: '大屏演示',
      path: "/amap/:id",
      component: './AMAP',
      layout: false
    }
  ],
  npmClient: 'yarn',
});
