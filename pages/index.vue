<template>
  <div>
    <h3>
      Covid Economics
    </h3>

    <h4>Unemployment {{ unemployment.length }}</h4>

    <el-table
      :data="unemployment"
      style="width: 100%"
      :default-sort="{ prop: 'value', order: 'descending' }"
    >
      <el-table-column sortable prop="country.name" label="Country">
      </el-table-column>
      <el-table-column
        sortable
        prop="value"
        label="unemployment"
        :formatter="formatValue"
      >
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import Vue from "vue";
import ElementUI from "element-ui";
import Axios from "axios";

import "element-ui/lib/theme-chalk/index.css";

Vue.use(ElementUI);

const query = `{
  unemployment: findForecasts(
    where: { and: [{ code: { eq: "UNR" } }, { time: { eq: "2020-Q3" } }] }
  ) {
    value
    description
    time
    country {
      name
      id
    }
  }
}
`;

export default {
  asyncData: async function({ req, res }) {
    let endpoint = `/graphql`;

    if (process.server) {
      const {
        headers: { host },
      } = req;

      endpoint = `http://${host}/graphql`;
    }

    const { data } = await Axios.post(`${endpoint}`, {
      query,
      variables: {},
      operationName: null,
    });

    return { unemployment: data.data.unemployment };
  },
  data() {
    return {
      size: "small",
      unemployment: [],
    };
  },
  methods: {
    formatValue(row) {
      return `${Number(row.value).toFixed(2)}%`;
    },
  },
};
</script>
