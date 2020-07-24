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
        prop="firstWave"
        label="First Wave"
        :formatter="formatValue"
      >
      </el-table-column>
      <el-table-column
        sortable
        prop="secondWave"
        label="Second Wave"
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
  single_hit_unr: findForecasts(
    where: { 
        and: [
            { code: { eq: "UNR" } }, 
            { edition: { eq: "EO107_1" } },
            { time: { eq: "2020" } }
        ] 
    }
  ) {
    firstWave:value
    description
    time
    country {
      name
      id
    }
  }

  double_hit_unr: findForecasts(
    where: { 
        and: [
            { code: { eq: "UNR" } }, 
            { edition: { eq: "EO107_2" } },
            { time: { eq: "2020" } }
        ] 
    }
  ) {
    secondWave:value
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

    const { double_hit_unr, single_hit_unr } = data.data;

    // merge the unemployment numbers
    const unemployment = double_hit_unr.map((entry, index) => {
      return Object.assign({}, entry, single_hit_unr[index]);
    });

    return { unemployment };
  },
  data() {
    return {
      size: "small",
      unemployment: [],
    };
  },
  methods: {
    formatValue(row, col) {
      return `${Number(row[col.property]).toFixed(2)}%`;
    },
  },
};
</script>
